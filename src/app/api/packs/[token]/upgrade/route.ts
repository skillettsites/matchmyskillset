import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/email/results-email";
import { getStripe, isStripeConfigError, isStripeReady } from "@/lib/apis/stripe";
import { localBase } from "@/lib/employer/server";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { getCandidate } from "@/lib/candidate/session";
import { claimPlusPack, isPlusAccount, releasePlusPack } from "@/lib/candidate/entitlements";
import { getPack, toView, updatePack } from "@/lib/candidate/packs";
import { NOT_SWITCHED_ON, PACK_CONSENT_TEXT, PACK_PRICE_PENCE, PACK_PRODUCT, PAYMENTS_SOON, PLUS_PACKS_PER_MONTH } from "@/lib/candidate/plans";

// Turns a free tailored CV into a full job pack for the same job: adds the
// cover letter and interview prep. Included with Plus (one of the month's
// packs) or £2.99 by card. Only the missing parts are written.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

function fail(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function POST(request: NextRequest, { params }: Ctx) {
  if (!isAllowedOrigin(request)) return fail(403, "Forbidden");
  const { allowed } = await checkRateLimit(`pack-upgrade:${clientIp(request)}`, 20, 3600);
  if (!allowed) return fail(429, "Too many attempts. Please try again later.");
  const { token } = await params;
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse((await request.text()).slice(0, 2000));
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return fail(400, "Invalid request.");
  }

  try {
    const pack = await getPack(token);
    if (!pack) return fail(404, "This pack has expired or the link is wrong.");
    if (pack.scope !== "cv" || pack.status !== "ready") return fail(409, "This pack already has everything, or is still being written.");
    const account = await getCandidate();

    if (body.pay === "plus") {
      if (!account || account.id !== pack.account_id) return fail(401, "Sign in to the account this pack belongs to.", { signIn: true });
      if (!isPlusAccount(account)) return fail(403, "Plus is not active on your account.");
      if (!(await claimPlusPack(account, pack.id))) return fail(409, `You have used all ${PLUS_PACKS_PER_MONTH} packs in this billing month.`);
      try {
        const updated = await updatePack(pack.id, { scope: "full", upgrade_paid_via: "plus", status: "queued", attempts: 0, error: null });
        return NextResponse.json({ pack: toView(updated) });
      } catch (err) {
        await releasePlusPack(account.id, pack.id);
        throw err;
      }
    }

    if (body.pay !== "card") return fail(400, "Invalid request.");
    if (!(await isStripeReady().catch(() => false))) return fail(503, PAYMENTS_SOON, { unavailable: true });
    if (body.consent !== true) return fail(400, "Please tick the box to agree to getting your pack straight away.");
    const email = account?.email ?? pack.email ?? (typeof body.email === "string" ? body.email.trim().toLowerCase() : "");
    if (!isValidEmail(email)) return fail(400, "Add your email so we can send you the link to your pack.");
    const stripe = getStripe();
    if (!stripe) return fail(503, PAYMENTS_SOON, { unavailable: true });
    const consentAt = new Date().toISOString();
    const origin = localBase(request.nextUrl);
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        client_reference_id: pack.id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: PACK_PRICE_PENCE,
              product_data: {
                name: "Cover letter and interview prep",
                description: "Completes your job pack for this job: a cover letter and interview prep, written from your own CV.",
              },
            },
          },
        ],
        success_url: `${origin}/packs/${pack.token}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/packs/${pack.token}?checkout=cancelled`,
        metadata: { product: PACK_PRODUCT, pack_id: pack.id, kind: "upgrade", consent_at: consentAt, consent_text: PACK_CONSENT_TEXT },
        payment_intent_data: { metadata: { product: PACK_PRODUCT, pack_id: pack.id, kind: "upgrade" } },
        custom_text: { submit: { message: "Written straight after payment. You asked for immediate supply, so the 14-day right to cancel ends once we start." } },
      });
      if (!session.url) throw new Error("Stripe returned no checkout URL");
      return NextResponse.json({ checkoutUrl: session.url });
    } catch (err) {
      if (isStripeConfigError(err)) return fail(503, PAYMENTS_SOON, { unavailable: true });
      console.error("[packs] upgrade checkout failed:", err instanceof Error ? err.message : err);
      return fail(502, "We could not start the payment just now. Please try again in a minute.");
    }
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return fail(503, NOT_SWITCHED_ON);
    console.error("[packs] upgrade failed:", err instanceof Error ? err.message : err);
    return fail(500, "Something went wrong on our side. Please try again in a minute.");
  }
}
