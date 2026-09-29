import { NextRequest, NextResponse } from "next/server";
import { verifyCheckin } from "@/lib/tracking/sign";
import { getTracked, stopAllCheckins } from "@/lib/tracking/tracker";

// List-Unsubscribe target for tracking emails.
// - POST is the one-click unsubscribe (RFC 8058) that mail apps send when the
//   person presses their "Unsubscribe" button: it stops every check-in email
//   to that address straight away.
// - GET (someone opening the link) never changes anything: it sends them to
//   the confirm page, so link scanners cannot unsubscribe people.
// The link is signed for one tracked application and the "stopall" answer.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const signed = verifyCheckin(request.nextUrl.searchParams.get("c"));
  if (!signed || signed.answer !== "stopall") return new NextResponse("Invalid link", { status: 400 });
  const row = await getTracked(signed.trackedId).catch(() => null);
  if (row && row !== "off") await stopAllCheckins(row, "unsubscribe");
  // Answer 200 even for a row that has since been deleted: there is nothing left to email.
  return new NextResponse("Unsubscribed from check-in emails", { status: 200, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const c = request.nextUrl.searchParams.get("c") ?? "";
  return NextResponse.redirect(new URL(`/checkin?c=${encodeURIComponent(c)}`, request.nextUrl), 303);
}
