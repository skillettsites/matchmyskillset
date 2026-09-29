import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import { localBase } from "@/lib/employer/server";
import { runTrackingJobs } from "@/lib/tracking/checkins";

// "Did you hear back?" check-ins, case-study questions after placements, and
// tracking retention. Called by Vercel Cron daily at 08:30 UTC (vercel.json)
// with `Authorization: Bearer <CRON_SECRET>`. Safe to run twice: every email
// is claimed before it is sent (src/lib/tracking/checkins.ts). For a manual
// run use the same header; add ?dry=1 to see what is due without sending or
// recording anything. TRACKER_CHECKINS_PER_RUN caps the emails per run
// (default 100, at most 300).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorised(request: NextRequest): boolean {
  const secret = env("CRON_SECRET");
  if (!secret) return false;
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) return new NextResponse("Unauthorized", { status: 401 });
  const dryRun = request.nextUrl.searchParams.get("dry") === "1";
  const limit = Math.min(Math.max(Number.parseInt(env("TRACKER_CHECKINS_PER_RUN") || "100", 10) || 100, 1), 300);
  const started = Date.now();
  try {
    const summary = await runTrackingJobs({ base: localBase(request.nextUrl), limit, dryRun, purge: true });
    console.log(
      `[cron/tracker-checkins]${dryRun ? " (dry run)" : ""}${summary.off ? " not switched on (migration 010)" : ""}: due ${summary.due}, sent ${summary.sent}, failed ${summary.failed}, skipped ${summary.skipped}; case-study questions due ${summary.consentDue}, sent ${summary.consentSent} in ${Date.now() - started}ms`
    );
    return NextResponse.json({ ...summary, ms: Date.now() - started }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[cron/tracker-checkins] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Run failed" }, { status: 500 });
  }
}
