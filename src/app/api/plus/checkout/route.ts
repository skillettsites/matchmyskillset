import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripe, isStripeConfigError, isStripeReady } from "@/lib/apis/stripe";
import { localBase } from "@/lib/employer/server";
import { getCandidate } from "@/lib/candidate/session";
import { isPlusAccount } from "@/lib/candidate/entitlements";
import { PAYMENTS_SOON, PLUS_CONSENT_TEXT, PLUS_PACKS_PER_MONTH, PLUS_PRICE_PENCE, PLUS_PRODUCT } from "@/lib/candidate/plans";

// Starts the £7 a month Plus plan with Stripe Checkout (subscription mode,
// inline GBP price, no Stripe products to set up). The webhook turns Plus on
// when the first payment succeeds.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return fail(403, "Forbidden");
  const account = await getCandidate();
  if (!account) return fail(401, "Please sign in first.", { signIn: true });
  const { allowed } = await checkRateLimit(`plus-checkout:${account.id}`, 20, 3600);
  if (!allowed) return fail(429, "Too many attempts. Please try again later.");

  let body: { consent?: unknown } = {};
  try {
    body = JSON.parse((await request.text()).slice(0, 500) || "{}") as { consent?: unknown };
  } catch {
    return fail(400, "Invalid request.");
  }
  if (isPlusAccount(account) && account.stripe_subscription_id) return fail(409, "You already have Plus. Use Manage billing to update your card or cancel.");
  if (account.plan_status === "comped") return fail(409, "Plus was set up for you directly, so there is nothing to pay.");
  if (body.consent !== true) return fail(400, "Please tick the box to start Plus straight away.");
  if (!(await isStripeReady().catch(() => false))) return fail(503, PAYMENTS_SOON, { unavailable: true });
  const stripe = getStripe();
  if (!stripe) return fail(503, PAYMENTS_SOON, { unavailable: true });

  const origin = localBase(request.nextUrl);
  const consentAt = new Date().toISOString();
  const metadata = { product: PLUS_PRODUCT, account_id: account.id };
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(account.stripe_customer_id ? { customer: account.stripe_customer_id } : { customer_email: account.email }),
      client_reference_id: account.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: PLUS_PRICE_PENCE,
            recurring: { interval: "month" },
            product_data: {
              name: "MatchMySkillset Plus",
              description: `Up to ${PLUS_PACKS_PER_MONTH} job packs a month (tailored CV, cover letter and interview prep), Check any job, and the application tracker. Billed monthly, cancel any time.`,
            },
          },
        },
      ],
      subscription_data: { metadata },
      metadata: { ...metadata, consent_at: consentAt, consent_text: PLUS_CONSENT_TEXT },
      success_url: `${origin}/account?plus=started`,
      cancel_url: `${origin}/plus?checkout=cancelled`,
      custom_text: { submit: { message: "£7 a month until you cancel. Cancel any time from your account: Plus then runs to the end of the month you have paid for." } },
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (isStripeConfigError(err)) return fail(503, PAYMENTS_SOON, { unavailable: true });
    console.error("[plus] checkout failed:", err instanceof Error ? err.message : err);
    return fail(502, "We could not start the payment just now. Please try again in a minute.");
  }
}
