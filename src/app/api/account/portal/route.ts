import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripe, isStripeConfigError } from "@/lib/apis/stripe";
import { localBase } from "@/lib/employer/server";
import { CONTACT_EMAIL } from "@/lib/site";
import { getCandidate } from "@/lib/candidate/session";
import { PAYMENTS_SOON } from "@/lib/candidate/plans";

// Opens the Stripe billing portal (card, invoices, cancel Plus) for a job
// seeker who has paid for Plus.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const account = await getCandidate();
  if (!account) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!account.stripe_customer_id) return NextResponse.json({ error: "There are no card payments on this account yet." }, { status: 400 });
  const { allowed } = await checkRateLimit(`cand-portal:${account.id}`, 20, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: PAYMENTS_SOON, unavailable: true }, { status: 503 });
  try {
    const session = await stripe.billingPortal.sessions.create({ customer: account.stripe_customer_id, return_url: `${localBase(request.nextUrl)}/account` });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (isStripeConfigError(err)) return NextResponse.json({ error: PAYMENTS_SOON, unavailable: true }, { status: 503 });
    console.error("[cand-portal] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: `We could not open billing just now. Email ${CONTACT_EMAIL} and we will sort it out.` }, { status: 502 });
  }
}
