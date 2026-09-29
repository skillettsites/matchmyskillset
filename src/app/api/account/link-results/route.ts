import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCandidate } from "@/lib/candidate/session";
import { resultsProfile } from "@/lib/candidate/job-source";
import { linkResults } from "@/lib/candidate/account";

// Links the results page this browser last opened (kept in localStorage by the
// results page) to the signed-in account, so it shows on /account and "Check
// any job" can use its skills profile.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const account = await getCandidate();
  if (!account) return NextResponse.json({ linked: false }, { status: 401 });
  const { allowed } = await checkRateLimit(`cand-link:${account.id}`, 30, 3600);
  if (!allowed) return NextResponse.json({ linked: false }, { status: 429 });
  let token = "";
  try {
    const body = JSON.parse((await request.text()).slice(0, 300)) as { token?: unknown };
    token = typeof body.token === "string" ? body.token : "";
  } catch {
    return NextResponse.json({ linked: false }, { status: 400 });
  }
  const profile = await resultsProfile(token);
  if (!profile) return NextResponse.json({ linked: false });
  try {
    await linkResults(account.id, profile.reportId);
    return NextResponse.json({ linked: true });
  } catch (err) {
    console.warn("[cand-link] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ linked: false });
  }
}
