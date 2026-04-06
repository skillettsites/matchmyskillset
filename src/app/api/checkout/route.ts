import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PLANS: Record<string, { name: string; priceInPence: number; interval: "month" | "year" }> = {
  pro_monthly: {
    name: "MatchMySkillset Pro (Monthly)",
    priceInPence: 799,
    interval: "month",
  },
  pro_annual: {
    name: "MatchMySkillset Pro (Annual)",
    priceInPence: 5999,
    interval: "year",
  },
  premium_monthly: {
    name: "MatchMySkillset Premium (Monthly)",
    priceInPence: 1499,
    interval: "month",
  },
  premium_annual: {
    name: "MatchMySkillset Premium (Annual)",
    priceInPence: 11999,
    interval: "year",
  },
};

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment system not configured" },
      { status: 503 }
    );
  }

  try {
    const { planId, email } = await request.json();

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const origin = (request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://matchmyskillset.com").trim();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: plan.name,
              description: planId.includes("pro")
                ? "Unlimited assessments, Career GPS, priority job matching"
                : "Everything in Pro + 1:1 coaching, hidden jobs, skills certification",
            },
            unit_amount: plan.priceInPence,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?subscribed=true&plan=${planId}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
