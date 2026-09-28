// Employer subscription events for /api/stripe/webhook. The report flow in
// that route is untouched: these events are picked off before it runs.
//
// Same idempotency as the report flow: the event id is recorded in
// mms_stripe_events first (a repeat delivery hits the primary key and is
// acknowledged without doing anything), and released again if processing
// fails so that Stripe's retry can run it.

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/apis/stripe";
import { SITE_URL } from "@/components/site";
import { EMPLOYER_PRODUCT, isPlanId, PLAN_NAMES, type PlanStatus } from "./plans";
import { invalidatePublicJobs } from "./jobs";
import { notifyOwner } from "./telegram";
import type { EmployerAccount } from "./types";

const SUBSCRIPTION_EVENTS = new Set(["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"]);

/** True for the events this module handles. */
export function isEmployerEvent(event: Stripe.Event): boolean {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    return session.mode === "subscription" && session.metadata?.product === EMPLOYER_PRODUCT;
  }
  // MatchMySkillset sells no other subscription, so every subscription and failed invoice event belongs here.
  return SUBSCRIPTION_EVENTS.has(event.type) || event.type === "invoice.payment_failed";
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function mapStatus(status: Stripe.Subscription.Status): PlanStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "inactive";
  }
}

function periodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const unix = item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end ?? null;
  return typeof unix === "number" ? new Date(unix * 1000).toISOString() : null;
}

type Admin = ReturnType<typeof createAdminClient>;

async function findAccount(admin: Admin, opts: { accountId?: string | null; subscriptionId?: string | null; customerId?: string | null }): Promise<EmployerAccount | null> {
  if (opts.accountId) {
    const { data } = await admin.from("mms_employer_accounts").select("*").eq("id", opts.accountId).maybeSingle();
    if (data) return data as EmployerAccount;
  }
  if (opts.subscriptionId) {
    const { data } = await admin.from("mms_employer_accounts").select("*").eq("stripe_subscription_id", opts.subscriptionId).maybeSingle();
    if (data) return data as EmployerAccount;
  }
  if (opts.customerId) {
    const { data } = await admin.from("mms_employer_accounts").select("*").eq("stripe_customer_id", opts.customerId).limit(1);
    if (data?.[0]) return data[0] as EmployerAccount;
  }
  return null;
}

async function update(admin: Admin, id: string, fields: Record<string, unknown>): Promise<void> {
  const { error } = await admin
    .from("mms_employer_accounts")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`account update failed: ${error.message}`);
}

async function closeJobs(admin: Admin, accountId: string): Promise<number> {
  const { data, error } = await admin
    .from("mms_jobs")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("account_id", accountId)
    .in("status", ["live", "pending"])
    .select("id");
  if (error) throw new Error(`closing jobs failed: ${error.message}`);
  return data?.length ?? 0;
}

async function processEvent(event: Stripe.Event, admin: Admin): Promise<Record<string, unknown>> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const plan = session.metadata?.plan;
    const account = await findAccount(admin, { accountId: session.metadata?.account_id ?? session.client_reference_id });
    if (!account || !isPlanId(plan)) {
      console.error(`[employer-webhook] session ${session.id} has no matching account or plan; needs a manual check`);
      return { ignored: "no account" };
    }
    const subscriptionId = idOf(session.subscription);
    const oldSubscription = account.stripe_subscription_id && account.stripe_subscription_id !== subscriptionId ? account.stripe_subscription_id : null;
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    await update(admin, account.id, {
      plan,
      plan_status: paid ? "active" : "inactive",
      stripe_customer_id: idOf(session.customer) ?? account.stripe_customer_id,
      stripe_subscription_id: subscriptionId,
    });
    // Moving plan by card starts a new subscription; stop the old one so nobody pays twice.
    if (oldSubscription) {
      try {
        // prorate: unused time on the old plan is credited to the customer.
        await getStripe()?.subscriptions.cancel(oldSubscription, { prorate: true });
      } catch (err) {
        console.error(`[employer-webhook] could not cancel old subscription ${oldSubscription}; cancel it by hand:`, err instanceof Error ? err.message : err);
        await notifyOwner([`MatchMySkillset: cancel old subscription ${oldSubscription} by hand (${account.company_name ?? account.id} moved plan)`]);
      }
    }
    await notifyOwner(
      [`MatchMySkillset subscription started: ${PLAN_NAMES[plan]}`, account.company_name ?? `account ${account.id}`, paid ? "Paid" : `Payment status: ${session.payment_status}`],
      [{ text: "Open admin", url: `${SITE_URL}/admin#employers` }]
    );
    return { account: account.id, plan };
  }

  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    const sub = event.data.object as Stripe.Subscription;
    const account = await findAccount(admin, { accountId: sub.metadata?.account_id, subscriptionId: sub.id, customerId: idOf(sub.customer) });
    if (!account) return { ignored: "no account" };
    // An older subscription (replaced on a plan change) must not overwrite the current one.
    if (account.stripe_subscription_id && account.stripe_subscription_id !== sub.id) return { ignored: "not the current subscription" };

    if (event.type === "customer.subscription.deleted") {
      const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : new Date().toISOString();
      await update(admin, account.id, { plan_status: "cancelled", current_period_end: endedAt, stripe_subscription_id: sub.id });
      const closed = await closeJobs(admin, account.id);
      if (closed) invalidatePublicJobs();
      await notifyOwner([`MatchMySkillset subscription ended`, account.company_name ?? `account ${account.id}`, `${closed} job(s) closed`]);
      return { account: account.id, cancelled: true, closed };
    }

    const plan = isPlanId(sub.metadata?.plan) ? sub.metadata.plan : account.plan;
    // "incomplete" is the moment before the first payment; its event can arrive after the
    // checkout one, so it must not switch off a plan that checkout has just turned on.
    const status = sub.status === "incomplete" ? account.plan_status : mapStatus(sub.status);
    await update(admin, account.id, {
      plan,
      plan_status: status,
      stripe_subscription_id: sub.id,
      stripe_customer_id: idOf(sub.customer) ?? account.stripe_customer_id,
      current_period_end: periodEnd(sub),
    });
    return { account: account.id, status };
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription ?? null);
    const account = await findAccount(admin, { subscriptionId, customerId: idOf(invoice.customer) });
    if (!account) return { ignored: "no account" };
    if (account.plan_status === "active") await update(admin, account.id, { plan_status: "past_due" });
    await notifyOwner([`MatchMySkillset payment failed`, account.company_name ?? `account ${account.id}`, `Attempt ${invoice.attempt_count ?? 1}`]);
    return { account: account.id, past_due: true };
  }

  return { ignored: event.type };
}

export async function handleEmployerEvent(event: Stripe.Event): Promise<NextResponse> {
  const admin = createAdminClient();
  const { error: claimError } = await admin.from("mms_stripe_events").insert({ event_id: event.id, type: event.type });
  if (claimError) {
    if (claimError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    console.error("[employer-webhook] could not record event:", claimError.message);
    return NextResponse.json({ error: "event_record_failed" }, { status: 500 });
  }
  try {
    const result = await processEvent(event, admin);
    return NextResponse.json({ received: true, employer: result });
  } catch (err) {
    console.error("[employer-webhook] processing failed:", err instanceof Error ? err.message : err);
    await admin.from("mms_stripe_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
