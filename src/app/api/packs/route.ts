import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { isValidEmail } from "@/lib/email/results-email";
import { isClaudeConfigured } from "@/lib/apis/claude";
import { getStripe, isStripeConfigError, isStripeReady } from "@/lib/apis/stripe";
import { localBase } from "@/lib/employer/server";
import { candidateTablesReady, getCandidate, safeNext } from "@/lib/candidate/session";
import { claimFreePack, claimPlusPack, isPlusAccount, releaseFreePack, releasePlusPack } from "@/lib/candidate/entitlements";
import { jobFromMms, jobFromResults, packFit, resultsProfile, skillCheck } from "@/lib/candidate/job-source";
import { insertPack, newPackToken, unpaidExpiry } from "@/lib/candidate/packs";
import { linkResults, loadSavedCv, saveCvToAccount } from "@/lib/candidate/account";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { line } from "@/lib/candidate/grounding";
import {
  MAX_ADVERT_CHARS,
  MAX_CV_CHARS,
  MIN_ADVERT_CHARS,
  MIN_CV_CHARS,
  NOT_SWITCHED_ON,
  PACK_CONSENT_TEXT,
  PACK_PRICE_PENCE,
  PACK_PRODUCT,
  PAYMENTS_SOON,
  PLUS_PACKS_PER_MONTH,
} from "@/lib/candidate/plans";
import type { PackJob } from "@/lib/candidate/pack-types";

// Starts a job pack: works out the job and the CV, then either writes it
// straight away (the one free tailored CV, or Plus) or sends the person to
// Stripe for £2.99. The pack itself is written by /api/packs/[token]/generate.
//
// Limits: per IP, per account, and a global daily cap on new packs
// (PACK_DAILY_CAP, default 300; FREE_PACK_DAILY_CAP for free ones, default
// 100). Paid packs are always written once paid for.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

function cap(name: string, fallback: number): number {
  const n = Number.parseInt(env(name), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function tidyText(value: unknown, max: number): string {
  return typeof value === "string"
    ? value
        .replace(/\r\n?/g, "\n")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max)
    : "";
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return fail(403, "Forbidden");
  const ip = clientIp(request);
  const byIp = await checkRateLimit(`pack-create:${ip}`, 12, 3600);
  if (!byIp.allowed) return fail(429, "You have started a lot of packs from here. Please try again in an hour.");

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse((await request.text()).slice(0, 60_000));
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return fail(400, "Invalid request.");
  }

  if (!(await candidateTablesReady())) return fail(503, NOT_SWITCHED_ON, { notReady: true });
  if (!isClaudeConfigured()) return fail(503, "Job packs are not available right now. Please try again later.");

  // ---- The job
  const source = body.source;
  let job: PackJob | null = null;
  const from = typeof body.from === "string" ? body.from : null;
  if (source === "results") {
    job = from && typeof body.jobId === "string" ? await jobFromResults(from, body.jobId) : null;
    if (!job) return fail(404, "We could not find that job in your results. It may have been replaced by a newer search: open your results and try again.");
  } else if (source === "mms") {
    job = typeof body.mmsId === "string" ? await jobFromMms(body.mmsId) : null;
    if (!job) return fail(404, "That job has closed or the link is wrong.");
  } else if (source === "pasted") {
    const j = (body.job && typeof body.job === "object" ? body.job : {}) as Record<string, unknown>;
    const title = line(j.title, 200);
    if (title.length < 2) return fail(400, "Add the job title.");
    job = { title, company: line(j.company, 160), location: line(j.location, 160) || undefined, source: "pasted", description: "", fullText: true };
  } else {
    return fail(400, "Invalid request.");
  }
  const pasted = tidyText(body.advertText, MAX_ADVERT_CHARS);
  if (!job.fullText || source === "pasted") {
    const summary = job.description.replace(/\s+/g, " ").replace(/\.{3}$|…$/, "").trim();
    if (summary && pasted.replace(/\s+/g, " ").length <= summary.length + 40 && summary.startsWith(pasted.replace(/\s+/g, " ").slice(0, 80))) {
      return fail(400, "That looks like the short summary. Open the advert and paste the whole thing.", { needAdvert: true });
    }
    if (pasted.length < MIN_ADVERT_CHARS) {
      return fail(400, `Paste the whole job advert (at least ${MIN_ADVERT_CHARS} characters) so the pack is written from everything the employer asks for.`, { needAdvert: true });
    }
    job = { ...job, description: pasted, fullText: true };
  }

  // ---- The CV
  const account = await getCandidate();
  let cvText = tidyText(body.cvText, MAX_CV_CHARS);
  if (!cvText && body.useSavedCv === true && account) cvText = (await loadSavedCv(account.id)) ?? "";
  if (cvText.length < MIN_CV_CHARS) return fail(400, "Upload or paste your CV first (the whole CV, so we can tailor it).");

  // ---- How it is paid for
  const pay = body.pay;
  const allDay = await checkRateLimit("pack-day:all", cap("PACK_DAILY_CAP", 300), 86_400);
  if (!allDay.allowed) return fail(429, "We have written as many packs as we can today. Please try again tomorrow.");
  if (account) {
    const byAccount = await checkRateLimit(`pack-account:${account.id}`, 15, 3600);
    if (!byAccount.allowed) return fail(429, "You have started a lot of packs in the last hour. Please try again a little later.");
  }

  const profile = await resultsProfile(from);
  const check = skillCheck(job, cvText, profile);
  const fit = packFit(job, profile, check);
  const token = newPackToken();
  const id = randomUUID();
  const base = {
    id,
    token,
    job,
    source_cv_text: cvText,
    results_token: profile?.token ?? null,
    fit,
  };

  try {
    if (account && body.saveCv === true) await saveCvToAccount(account.id, cvText, line(body.cvName, 120) || null);
    if (account && profile) await linkResults(account.id, profile.reportId);

    if (pay === "free") {
      if (!account) return fail(401, "Sign in with your email to use your free tailored CV.", { signIn: true });
      const freeDay = await checkRateLimit("pack-free-day:all", cap("FREE_PACK_DAILY_CAP", 100), 86_400);
      if (!freeDay.allowed) return fail(429, "We have given out as many free CVs as we can today. Please try again tomorrow.");
      if (!(await claimFreePack(account.id))) return fail(409, "You have already used your free tailored CV.");
      try {
        await insertPack({ ...base, account_id: account.id, email: account.email, scope: "cv", status: "queued", paid_via: "free", expires_at: null });
      } catch (err) {
        await releaseFreePack(account.id);
        throw err;
      }
      return NextResponse.json({ token, url: `/packs/${token}` });
    }

    if (pay === "plus") {
      if (!account) return fail(401, "Sign in to use Plus.", { signIn: true });
      if (!isPlusAccount(account)) return fail(403, "Plus is not active on your account.");
      if (!(await claimPlusPack(account, id))) {
        return fail(409, `You have used all ${PLUS_PACKS_PER_MONTH} packs in this billing month. They reset when your plan renews.`);
      }
      try {
        await insertPack({ ...base, account_id: account.id, email: account.email, scope: "full", status: "queued", paid_via: "plus", expires_at: null });
      } catch (err) {
        await releasePlusPack(account.id, id);
        throw err;
      }
      return NextResponse.json({ token, url: `/packs/${token}` });
    }

    if (pay !== "card") return fail(400, "Invalid request.");
    if (!(await isStripeReady().catch(() => false))) return fail(503, PAYMENTS_SOON, { unavailable: true });
    if (body.consent !== true) return fail(400, "Please tick the box to agree to getting your pack straight away.");
    const email = account?.email ?? (typeof body.email === "string" ? body.email.trim().toLowerCase() : "");
    if (!isValidEmail(email)) return fail(400, "Add your email so we can send you the link to your pack.");
    const stripe = getStripe();
    if (!stripe) return fail(503, PAYMENTS_SOON, { unavailable: true });

    const consentAt = new Date().toISOString();
    await insertPack({
      ...base,
      account_id: account?.id ?? null,
      email,
      scope: "full",
      status: "awaiting_payment",
      consent_at: consentAt,
      consent_text: PACK_CONSENT_TEXT,
      expires_at: unpaidExpiry(),
    });
    const origin = localBase(request.nextUrl);
    const back = safeNext(body.back) ?? "/tools/tailor";
    const metadata = { product: PACK_PRODUCT, pack_id: id, kind: "pack", consent_at: consentAt, consent_text: PACK_CONSENT_TEXT, ...(account ? { account_id: account.id } : {}) };
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        client_reference_id: id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: PACK_PRICE_PENCE,
              product_data: {
                name: `Job pack: ${job.title}`.slice(0, 250),
                description: "A CV tailored to this job, a cover letter and interview prep, written from your own CV. Shown on screen straight after payment and emailed to you.",
              },
            },
          },
        ],
        success_url: `${origin}/packs/${token}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${back}${back.includes("?") ? "&" : "?"}checkout=cancelled`,
        metadata,
        payment_intent_data: { metadata: { product: PACK_PRODUCT, pack_id: id } },
        custom_text: {
          submit: { message: "Your pack is written straight after payment. You asked for immediate supply, so the 14-day right to cancel ends once we start." },
        },
      });
      if (!session.url) throw new Error("Stripe returned no checkout URL");
      return NextResponse.json({ token, checkoutUrl: session.url });
    } catch (err) {
      if (isStripeConfigError(err)) return fail(503, PAYMENTS_SOON, { unavailable: true });
      console.error("[packs] checkout failed:", err instanceof Error ? err.message : err);
      return fail(502, "We could not start the payment just now. Please try again in a minute.");
    }
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return fail(503, NOT_SWITCHED_ON, { notReady: true });
    console.error("[packs] create failed:", err instanceof Error ? err.message : err);
    return fail(500, "Something went wrong on our side. Please try again in a minute.");
  }
}
