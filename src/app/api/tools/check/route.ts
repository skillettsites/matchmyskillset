import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { getCandidate } from "@/lib/candidate/session";
import { isPlusAccount, recordCheck } from "@/lib/candidate/entitlements";
import { packFit, resultsProfile, skillCheck } from "@/lib/candidate/job-source";
import { latestLinkedProfile, linkResults } from "@/lib/candidate/account";
import { line } from "@/lib/candidate/grounding";
import { MAX_ADVERT_CHARS, MIN_ADVERT_CHARS } from "@/lib/candidate/plans";
import { JOB_FIT_SUMMARY } from "@/lib/apis/jobs/fit";

// "Check any job" (Plus): paste any advert and see the match and the gaps,
// scored against the skills profile from your results with the same
// deterministic code as the results page (src/lib/apis/jobs/fit.ts). No model
// call, so it is instant and free to run.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return fail(403, "Forbidden");
  const byIp = await checkRateLimit(`check-job:${clientIp(request)}`, 60, 600);
  if (!byIp.allowed) return fail(429, "Too many checks. Please wait a few minutes.");
  const account = await getCandidate();
  if (!account) return fail(401, "Sign in to use Check any job.", { signIn: true });
  if (!isPlusAccount(account)) return fail(403, "Check any job comes with Plus.", { plus: true });
  const byAccount = await checkRateLimit(`check-job-account:${account.id}`, 300, 86_400);
  if (!byAccount.allowed) return fail(429, "You have checked a lot of jobs today. Please try again tomorrow.");

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse((await request.text()).slice(0, 30_000));
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return fail(400, "Invalid request.");
  }
  const title = line(body.title, 200);
  const advert = typeof body.advert === "string" ? body.advert.replace(/\r\n?/g, "\n").trim().slice(0, MAX_ADVERT_CHARS) : "";
  if (title.length < 2) return fail(400, "Add the job title.");
  if (advert.length < MIN_ADVERT_CHARS) return fail(400, `Paste the whole advert (at least ${MIN_ADVERT_CHARS} characters).`);

  // The results page this browser opened last, else the newest one linked to the account.
  let profile = await resultsProfile(typeof body.from === "string" ? body.from : null);
  if (profile) {
    try {
      await linkResults(account.id, profile.reportId);
    } catch {
      // linking is a convenience
    }
  } else {
    profile = await latestLinkedProfile(account.id);
  }
  if (!profile) return fail(400, "Check any job scores adverts against the skills from your CV. Upload your CV first (it is free), then come back.", { needResults: true });

  const job = { title, description: advert, fullText: true };
  const check = skillCheck(job, "", profile);
  const fit = packFit(job, profile, check);
  await recordCheck(account.id);
  return NextResponse.json({ fit, method: JOB_FIT_SUMMARY });
}
