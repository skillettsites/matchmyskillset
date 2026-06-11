import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { findUserByEmail, getUserById, setUserMeta } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: string | undefined | null): string {
  return (value || "").replace(/\\n$/, "").trim();
}

// Resolve the MMS user an event belongs to: prefer the user id we put in
// checkout metadata, fall back to the Stripe customer's email.
async function resolveUserId(
  stripe: Stripe,
  metadataUserId: string | undefined,
  customerId: string | null,
  email: string | null
): Promise<string | null> {
  if (metadataUserId) {
    const u = await getUserById(metadataUserId);
    if (u) return u.id;
  }
  let resolvedEmail = email;
  if (!resolvedEmail && customerId) {
    try {
      const cust = await stripe.customers.retrieve(customerId);
      if (cust && !cust.deleted) resolvedEmail = (cust as Stripe.Customer).email || null;
    } catch {
      /* ignore lookup failure */
    }
  }
  if (resolvedEmail) {
    const u = await findUserByEmail(resolvedEmail);
    if (u) return u.id;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = clean(process.env.STRIPE_WEBHOOK_SECRET);
  if (!sig || !secret) {
    console.error("stripe webhook: missing signature or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 400 });
  }

  const raw = await req.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("stripe webhook signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  // Idempotency gate. Stripe re-delivers the same event.id on retry. Recording
  // the id under the stripe_events primary key makes the first delivery win
  // atomically; any retry hits the unique violation (23505) and we acknowledge
  // without re-processing. A genuine write failure returns 500 so Stripe retries.
  const admin = createAdminClient();
  const { error: dedupeErr } = await admin.from("stripe_events").insert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });
  if (dedupeErr) {
    if (dedupeErr.code === "23505") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error("stripe_events insert failed", dedupeErr);
    return NextResponse.json({ error: "event_record_failed" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = await resolveUserId(
          stripe,
          s.client_reference_id || s.metadata?.userId || undefined,
          typeof s.customer === "string" ? s.customer : s.customer?.id || null,
          s.customer_details?.email || s.customer_email || null
        );
        if (userId) {
          await setUserMeta(userId, {
            tier: "pro",
            stripe_customer_id:
              typeof s.customer === "string" ? s.customer : s.customer?.id || null,
            stripe_subscription_id:
              typeof s.subscription === "string" ? s.subscription : s.subscription?.id || null,
            plan_id: s.metadata?.planId || null,
          });
        } else {
          console.warn("stripe webhook: could not map checkout session to a user", s.id);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const active = sub.status === "active" || sub.status === "trialing";
        const userId = await resolveUserId(
          stripe,
          sub.metadata?.userId || undefined,
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null,
          null
        );
        if (userId) {
          await setUserMeta(userId, {
            tier: active ? "pro" : "free",
            stripe_subscription_id: sub.id,
          });
        } else {
          console.warn("stripe webhook: could not map subscription to a user", sub.id);
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("stripe webhook processing error:", (e as Error).message);
    // Release the idempotency claim so Stripe's retry can reprocess cleanly.
    await admin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
