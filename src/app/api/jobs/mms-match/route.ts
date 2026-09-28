import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { getMmsJobRow, isLiveRow } from "@/lib/apis/jobs/mms";
import { fitForJob } from "@/lib/candidates/apply";

// "Your match" on a job posted on MatchMySkillset, from the visitor's latest
// results link (kept in their browser). No board calls, no model call.

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { allowed } = await checkRateLimit(`mms-match:${clientIp(request)}`, 60, 600);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse((await request.text()).slice(0, 500)) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  const token = typeof body.token === "string" ? body.token : "";
  try {
    const job = await getMmsJobRow(jobId);
    if (!job || !isLiveRow(job)) return NextResponse.json({ fit: null });
    const fit = await fitForJob(job, { token });
    return NextResponse.json({ fit });
  } catch (err) {
    console.error("[mms-match] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ fit: null });
  }
}
