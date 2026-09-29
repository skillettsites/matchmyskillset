import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCandidate } from "@/lib/candidate/session";
import { exportAccount } from "@/lib/candidate/account";

// "Download my data": everything held for the signed-in job seeker account,
// as a JSON file (UK GDPR right of access).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const account = await getCandidate();
  if (!account) return NextResponse.redirect(new URL("/account/sign-in?next=/account", request.url));
  const { allowed } = await checkRateLimit(`cand-export:${account.id}`, 10, 3600);
  if (!allowed) return new NextResponse("Too many downloads. Please try again later.", { status: 429 });
  try {
    const data = await exportAccount(account);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="matchmyskillset-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[cand-export] failed:", err instanceof Error ? err.message : err);
    return new NextResponse("We could not put your data together just now. Please try again in a minute.", { status: 500 });
  }
}
