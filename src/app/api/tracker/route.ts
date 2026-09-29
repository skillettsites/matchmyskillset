import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanHttpUrl, cleanText } from "@/lib/input";
import { isValidEmail } from "@/lib/email/results-email";
import { SOURCE_IDS } from "@/lib/apis/jobs/types";
import { TOKEN_PATTERN } from "@/lib/apis/reports-db";
import { localBase } from "@/lib/employer/server";
import { trackApplication } from "@/lib/tracking/tracker";
import { currentCandidateAccountId } from "@/lib/tracking/identity";
import { sendTrackerWelcome } from "@/lib/tracking/emails";
import { checkinUrl, trackerUrl, unsubscribeUrl } from "@/lib/tracking/links";
import { TRACKER_TOKEN_RE } from "@/lib/tracking/sign";

// "I applied": adds an outside job (one the person clicked Apply on from a
// results card or the job search) to their application tracker. Posted by
// src/components/tracking/TrackApplied.tsx after the person confirms and,
// when we do not know their address yet, gives it next to the check-in notice.
//
// The browser gets a tracker token back only when this request created the
// tracker or already held it. A new tracker is confirmed by email with its
// private link and a way to stop.

export const runtime = "nodejs";

const SOURCES: ReadonlySet<string> = new Set(SOURCE_IDS.filter((s) => s !== "mms"));
const MAX_BODY = 4096;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json(403, { error: "Forbidden" });
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { error: "Too long." });
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const job = (body.job ?? {}) as Record<string, unknown>;
  const source = typeof job.source === "string" ? job.source : "";
  const title = cleanText(job.title, 200);
  const url = cleanHttpUrl(job.url, 1000);
  if (!SOURCES.has(source) || title.length < 2 || !url) return json(400, { error: "We could not tell which job that was." });

  const trackerToken = typeof body.trackerToken === "string" && TRACKER_TOKEN_RE.test(body.trackerToken) ? body.trackerToken : null;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!trackerToken && !isValidEmail(email)) return json(400, { error: "Please enter a valid email address.", needEmail: true });
  const resultsToken = typeof body.resultsToken === "string" && TOKEN_PATTERN.test(body.resultsToken) ? body.resultsToken : null;

  const ip = await checkRateLimit(`tracker:${clientIp(request)}`, 40, 3600);
  if (!ip.allowed) return json(429, { error: "You have tracked a lot of jobs in the last hour. Please try again later." });
  if (email && !trackerToken) {
    const perEmail = await checkRateLimit(`tracker-new:${email}`, 5, 86_400);
    if (!perEmail.allowed) return json(429, { error: "We have already set up trackers for that address today. Use the link in our email." });
  }

  const r = await trackApplication({
    source: "external",
    job: {
      source,
      externalId: cleanText(job.id, 200) || null,
      title,
      company: cleanText(job.company, 200) || null,
      location: cleanText(job.location, 200) || null,
      url,
      salary: cleanText(job.salary, 120) || null,
    },
    trackerToken,
    email: email || null,
    resultsToken,
    accountId: await currentCandidateAccountId(),
  });
  if (!r.ok) {
    if (r.reason === "off") return json(503, { error: "Application tracking is not switched on yet. Please try again later.", off: true });
    if (r.reason === "email") return json(400, { error: "Please enter a valid email address.", needEmail: true });
    return json(500, { error: "We could not save that just now. Please try again." });
  }

  const base = localBase(request.nextUrl);
  let emailed = false;
  if (r.newTracker) {
    const sent = await sendTrackerWelcome(r.row.email, {
      base,
      job: { title: r.row.job_title, company: r.row.company },
      trackerUrl: trackerUrl(base, r.token),
      stopAllUrl: checkinUrl(base, r.row.id, "stopall"),
      unsubscribeUrl: unsubscribeUrl(base, r.row.id),
    });
    emailed = sent.ok;
  }
  return json(200, { ok: true, token: r.token, created: r.created, newTracker: r.newTracker, emailed, nextCheckin: r.row.next_checkin_at });
}
