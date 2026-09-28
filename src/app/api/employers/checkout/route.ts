import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripe, isStripeConfigError } from "@/lib/apis/stripe";
import { getEmployer, isSetUp } from "@/lib/employer/session";
import { EMPLOYER_PRODUCT, JOBS_EMAIL, PAYMENTS_UNAVAILABLE, PLAN_NAMES, SELF_SERVE_PRICES } from "@/lib/employer/plans";
import { localBase } from "@/lib/employer/server";

// Starts a monthly subscription for Starter or Growth with Stripe Checkout.
// Prices are inline (price_data, GBP) so no Stripe products need setting up.
// The webhook (/api/stripe/webhook) turns the plan on when payment succeeds.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DESCRIPTIONS = {
  starter: "3 live job listings, up to 10 matched candidates shown per role, views and applications for every job. Billed monthly, cancel any time.",
  growth: "10 live job listings, unlimited matched candidates, skills-gap report per role, company page and priority email support. Billed monthly, cancel any time.",
};

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const account = await getEmployer();
  if (!account) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSetUp(account)) return NextResponse.json({ error: "Please finish setting up your account first." }, { status: 400 });

  const { allowed, retryAfter } = await checkRateLimit(`emp-checkout:${account.id}`, 20, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });

  let plan: "starter" | "growth";
  try {
    const body = JSON.parse((await request.text()).slice(0, 500)) as { plan?: unknown };
    if (body.plan !== "starter" && body.plan !== "growth") throw new Error("bad plan");
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (account.plan === plan && (account.plan_status === "active" || account.plan_status === "past_due") && account.stripe_subscription_id) {
    return NextResponse.json({ error: `You are already on ${PLAN_NAMES[plan]}. Use Manage billing to update your card or cancel.` }, { status: 409 });
  }
  if (account.plan_status === "comped") {
    return NextResponse.json({ error: `Your plan was set up with us directly. Email ${JOBS_EMAIL} and we will change it for you.` }, { status: 409 });
  }

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: PAYMENTS_UNAVAILABLE, unavailable: true }, { status: 503 });

  const base = localBase(request.nextUrl);
  const metadata = { product: EMPLOYER_PRODUCT, account_id: account.id, plan };
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: SELF_SERVE_PRICES[plan],
            recurring: { interval: "month" },
            product_data: { name: `MatchMySkillset ${PLAN_NAMES[plan]} plan`, description: DESCRIPTIONS[plan] },
          },
        },
      ],
      ...(account.stripe_customer_id ? { customer: account.stripe_customer_id } : { customer_email: account.email }),
      client_reference_id: account.id,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      success_url: `${base}/employers/dashboard/billing?checkout=success`,
      cancel_url: `${base}/employers/dashboard/billing?checkout=cancelled`,
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (isStripeConfigError(err)) {
      console.error("[employer-checkout] Stripe rejected the API key:", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: PAYMENTS_UNAVAILABLE, unavailable: true }, { status: 503 });
    }
    console.error("[employer-checkout] session create failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: `We could not start the payment just now. Please try again, or email ${JOBS_EMAIL}.` }, { status: 502 });
  }
}
