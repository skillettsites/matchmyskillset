import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { deleteAlertByToken } from "@/lib/candidates/db";

// One-click unsubscribe (RFC 8058): mail apps POST here from the
// List-Unsubscribe header in every alert email. POST only, so link scanners
// that follow URLs cannot unsubscribe anyone. The alert is deleted.

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const { allowed } = await checkRateLimit(`alerts-unsub:${clientIp(request)}`, 30, 600);
  if (!allowed) return new NextResponse("Too many requests", { status: 429 });
  try {
    await deleteAlertByToken(token);
    return new NextResponse("Unsubscribed", { status: 200 });
  } catch (err) {
    console.error("[alerts/unsubscribe] failed:", err instanceof Error ? err.message : err);
    return new NextResponse("Please try again", { status: 500 });
  }
}
