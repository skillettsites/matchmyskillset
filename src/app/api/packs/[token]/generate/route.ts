import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { ClaudeUnavailableError } from "@/lib/apis/claude";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { getPack, runGeneration, toView } from "@/lib/candidate/packs";
import { confirmPackPayment } from "@/lib/candidate/billing-webhook";
import { NOT_SWITCHED_ON } from "@/lib/candidate/plans";

// Writes a job pack that is paid for (or covered by the free CV or Plus) and
// not written yet. Called by the pack page; the Stripe webhook also starts it
// for card payments. Only one caller wins the claim, so calling it twice, or
// alongside the webhook, never writes a pack twice. Coming back from Stripe
// before the webhook, the page passes the Checkout session id so the payment
// can be confirmed with Stripe directly.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Ctx = { params: Promise<{ token: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { allowed } = await checkRateLimit(`pack-generate:${clientIp(request)}`, 40, 600);
  if (!allowed) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  const { token } = await params;
  let sessionId = "";
  try {
    const body = JSON.parse((await request.text()).slice(0, 1000) || "{}") as { sessionId?: unknown };
    sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  } catch {
    // no body
  }
  try {
    let row = await getPack(token);
    if (!row) return NextResponse.json({ error: "This pack has expired or the link is wrong." }, { status: 404 });
    const upgradePending = row.scope === "cv" && sessionId && sessionId !== row.stripe_session_id && !row.upgrade_session_id;
    if (sessionId && (row.status === "awaiting_payment" || upgradePending)) row = await confirmPackPayment(row, sessionId);
    if (row.status === "awaiting_payment") return NextResponse.json({ pack: toView(row) });
    const after = (await runGeneration(token)) ?? row;
    return NextResponse.json({ pack: toView(after) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return NextResponse.json({ error: NOT_SWITCHED_ON }, { status: 503 });
    if (err instanceof ClaudeUnavailableError) return NextResponse.json({ error: "Job packs are not available right now. Please try again later." }, { status: 503 });
    console.error("[packs] generate failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong while writing your pack. Please refresh the page to try again." }, { status: 500 });
  }
}
