import { NextRequest, NextResponse, after } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { TOKEN_PATTERN, getReportByToken } from "@/lib/apis/reports-db";
import { isMatchesDoc, isSkillsDoc } from "@/lib/skills/profile";
import { MAX_PASSES, gatherJobs, isFresh, placeFromDoc, saveSnapshot, snapshotFrom, withoutClosedMmsJobs } from "@/lib/apis/jobs/match";

// Live jobs for one results link.
//   { token, action: "load" }     the stored list if it is under 12 hours old,
//                                 otherwise a fresh search (first pass)
//   { token, action: "refresh" }  a fresh first pass (at most every 30 minutes)
//   { token, action: "more" }     the next, wider pass, merged in (3 passes at most)
// Every search is stored with the results, so reloading the page costs no
// board calls.

export const runtime = "nodejs";
export const maxDuration = 45;

const REFRESH_MIN_MS = 30 * 60 * 1000;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json(403, { error: "Forbidden" });
  let token = "";
  let action = "load";
  try {
    const body = JSON.parse((await request.text()).slice(0, 1000)) as Record<string, unknown>;
    token = typeof body.token === "string" ? body.token : "";
    action = body.action === "refresh" || body.action === "more" ? body.action : "load";
  } catch {
    return json(400, { error: "Invalid request." });
  }
  if (!TOKEN_PATTERN.test(token)) return json(400, { error: "Invalid request." });

  let report;
  try {
    report = await getReportByToken(token);
  } catch (err) {
    console.error("[results/jobs] read failed:", err instanceof Error ? err.message : err);
    return json(503, { error: "We could not load your results just now. Please try again." });
  }
  if (!report) return json(404, { error: "These results have expired or the link is wrong." });
  const doc = isSkillsDoc(report.skills) ? report.skills : null;
  const items = isMatchesDoc(report.matches) ? report.matches.items : [];
  if (!doc) return json(422, { error: "These results are too old to search jobs from. Please run a new check." });

  // A stored list never shows a job posted on the site that has closed since (checked live).
  const stored = snapshotFrom(report.matches);
  const existing = stored ? await withoutClosedMmsJobs(stored) : null;
  if (action === "load" && existing && isFresh(existing)) return json(200, { snapshot: existing, cached: true });
  if (action === "refresh" && existing && Date.now() - Date.parse(existing.fetchedAt) < REFRESH_MIN_MS) {
    return json(200, { snapshot: existing, cached: true });
  }
  if (action === "more" && existing && existing.passes >= MAX_PASSES) {
    return json(200, { snapshot: existing, cached: true, exhausted: true });
  }

  // Board searches spend free-tier quota: limit them per person and per link.
  const ip = clientIp(request);
  const perIp = await checkRateLimit(`results-jobs:${ip}`, 20, 600);
  const perToken = await checkRateLimit(`results-jobs-token:${token}`, 12, 86_400);
  if (!perIp.allowed || !perToken.allowed) {
    if (existing) return json(200, { snapshot: existing, cached: true, limited: true });
    return json(429, { error: "You have searched a lot in a short time. Please try again in a few minutes." });
  }

  const started = Date.now();
  try {
    const snapshot = await gatherJobs({
      doc,
      items,
      place: placeFromDoc(doc),
      previous: existing,
      more: action === "more" && Boolean(existing),
    });
    try {
      await saveSnapshot(report.id, snapshot);
    } catch (err) {
      console.error("[results/jobs] save failed:", err instanceof Error ? err.message : err);
    }
    after(() => {
      const bySource = snapshot.sources.map((s) => `${s.id}:${s.found}${s.error ? `(${s.error})` : ""}`).join(" ");
      console.log(`[results/jobs] ${action} pass ${snapshot.passes}: ${snapshot.jobs.length} jobs in ${Date.now() - started}ms; ${bySource}`);
    });
    return json(200, { snapshot, cached: false, ms: Date.now() - started });
  } catch (err) {
    console.error("[results/jobs] gather failed:", err instanceof Error ? err.message : err);
    if (existing) return json(200, { snapshot: existing, cached: true });
    return json(502, { error: "We could not reach the job boards just now. Please try again in a minute." });
  }
}
