import { NextRequest, NextResponse } from "next/server";
import { isSameSiteRequest } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { getCandidate } from "@/lib/candidate/session";
import { entitlementFor } from "@/lib/candidate/entitlements";

// Whether this browser is signed in to a job seeker account, and what it can
// use. The tailor page asks while someone is signing in from another tab, so
// it can carry on with the CV that is still in its own tab.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSameSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { allowed } = await checkRateLimit(`cand-status:${clientIp(request)}`, 120, 600);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const account = await getCandidate();
  if (!account) return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "no-store" } });
  const ent = await entitlementFor(account);
  return NextResponse.json(
    { signedIn: true, email: account.email, plus: ent.plus, plusLeft: ent.plusUsage?.left ?? null, freeAvailable: ent.freeAvailable, savedCv: Boolean(account.saved_cv_at) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
