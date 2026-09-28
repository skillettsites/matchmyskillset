import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import { runDueAlerts } from "@/lib/candidates/alerts";
import { purgeExpired } from "@/lib/candidates/db";

// Sends job alert emails. Called by Vercel Cron (vercel.json):
//   "0 7 * * *"  daily alerts, every day at 07:00 UTC
//   "0 7 * * 1"  weekly alerts, Mondays at 07:00 UTC
// Vercel sends `Authorization: Bearer <CRON_SECRET>` and the schedule that
// fired in `x-vercel-cron-schedule`. For a manual run pass ?frequency=daily or
// ?frequency=weekly with the same header; add &dry=1 to see what would be
// sent without sending or recording anything. Safe to run twice: see
// src/lib/candidates/alerts.ts. The daily run also deletes expired profiles
// and applications (12 months) and profiles never switched on (14 days).

export const runtime = "nodejs";
export const maxDuration = 300;

const SCHEDULES: Record<string, "daily" | "weekly"> = { "0 7 * * *": "daily", "0 7 * * 1": "weekly" };

function authorised(request: NextRequest): boolean {
  const secret = env("CRON_SECRET");
  if (!secret) return false;
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) return new NextResponse("Unauthorized", { status: 401 });
  const params = request.nextUrl.searchParams;
  const schedule = request.headers.get("x-vercel-cron-schedule") ?? "";
  const asked = params.get("frequency");
  const frequency = SCHEDULES[schedule] ?? (asked === "daily" || asked === "weekly" ? asked : null);
  if (!frequency) return NextResponse.json({ error: "Say which alerts to run: ?frequency=daily or weekly" }, { status: 400 });
  const dryRun = params.get("dry") === "1";
  const limit = Math.min(Math.max(Number.parseInt(env("ALERTS_PER_RUN") || "60", 10) || 60, 1), 200);

  const started = Date.now();
  try {
    const summary = await runDueAlerts({ frequency, dryRun, limit });
    const purged = !dryRun && frequency === "daily" ? await purgeExpired() : null;
    console.log(
      `[cron/job-alerts] ${frequency}${dryRun ? " (dry run)" : ""}: due ${summary.due}, sent ${summary.sent}, nothing new ${summary.nothingNew}, failed ${summary.failed}, skipped ${summary.skipped} in ${Date.now() - started}ms`
    );
    return NextResponse.json({ ...summary, purged, ms: Date.now() - started }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[cron/job-alerts] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Run failed" }, { status: 500 });
  }
}
