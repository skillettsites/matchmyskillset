import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripe, isStripeConfigError } from "@/lib/apis/stripe";
import { getEmployer } from "@/lib/employer/session";
import { JOBS_EMAIL, PAYMENTS_UNAVAILABLE } from "@/lib/employer/plans";
import { localBase } from "@/lib/employer/server";

// Opens the Stripe billing portal (update card, see invoices, cancel) for an
// employer who has paid by card before.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const account = await getEmployer();
  if (!account) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!account.stripe_customer_id) return NextResponse.json({ error: "There are no card payments on this account yet." }, { status: 400 });

  const { allowed } = await checkRateLimit(`emp-portal:${account.id}`, 20, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: PAYMENTS_UNAVAILABLE, unavailable: true }, { status: 503 });
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: account.stripe_customer_id,
      return_url: `${localBase(request.nextUrl)}/employers/dashboard/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (isStripeConfigError(err)) return NextResponse.json({ error: PAYMENTS_UNAVAILABLE, unavailable: true }, { status: 503 });
    console.error("[employer-portal] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: `We could not open billing just now. Email ${JOBS_EMAIL} and we will sort it out.` }, { status: 502 });
  }
}
