import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { TOKEN_PATTERN, getReportByToken, markFulfilled } from "@/lib/apis/reports-db";
import { ensureReport } from "@/lib/apis/report-builder";
import { SESSION_ID_PATTERN, verifyPaidSession } from "@/lib/apis/purchase-check";

// Writes a paid report on demand when someone opens /report/<token> before
// the webhook has finished. Safe to call repeatedly: the report is written
// once and then read back.

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { allowed, retryAfter } = await checkRateLimit(`report-generate:${clientIp(request)}`, 30, 600);
  if (!allowed) return NextResponse.json({ status: "busy" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });

  let token = "";
  let sessionId = "";
  try {
    const body = JSON.parse((await request.text()).slice(0, 2000)) as Record<string, unknown>;
    token = typeof body.token === "string" ? body.token : "";
    sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!TOKEN_PATTERN.test(token) || !SESSION_ID_PATTERN.test(sessionId)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const report = await getReportByToken(token);
    if (!report) return NextResponse.json({ status: "failed", reason: "This report link has expired or is wrong." }, { status: 404 });
    const check = await verifyPaidSession(sessionId, report);
    if (check.status !== "paid") return NextResponse.json({ status: "failed", reason: check.reason }, { status: 402 });

    const result = await ensureReport(check.purchase, report);
    if (result.status === "ready" && !check.purchase.fulfilled_at) {
      await markFulfilled(check.purchase.id, check.purchase.delivery_email_id);
    }
    return NextResponse.json(result.status === "failed" ? { status: "failed", reason: result.reason } : { status: result.status });
  } catch (err) {
    console.error("[report/generate] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ status: "failed", reason: "Something went wrong. Please refresh the page in a minute." }, { status: 500 });
  }
}
