// Candidate payments for /api/stripe/webhook: the £2.99 job pack (one-off,
// also used to turn a free tailored CV into a full pack) and the £7 a month
// Plus plan. Server code only.
//
// These events are picked off in the webhook route BEFORE the employer
// handler, because that handler treats every subscription event as an
// employer's. They are recognised only by our own metadata:
//   checkout sessions        metadata.product = mms_job_pack | mms_plus
//   subscription events      subscription metadata.product = mms_plus
//   invoice.payment_failed   the invoice's subscription metadata.product = mms_plus
// Same idempotency as the rest of the route: the event id goes into
// mms_stripe_events first (a repeat delivery hits the primary key and is
// acknowledged without doing anything), and is released again if processing
// fails so Stripe's retry can run it.

import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/apis/stripe";
import { notifyOwner } from "@/lib/employer/telegram";
import { PACK_PRODUCT, PLUS_PRODUCT } from "./plans";
import { ACCOUNT_COLUMNS, raise, type CandidateAccount, type CandidatePlanStatus, type PackRow } from "./db";
import { getPackById, guestExpiry, recordPackPurchase, runGeneration, updatePack } from "./packs";

const SUBSCRIPTION_EVENTS = new Set(["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"]);

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** True for the events this module handles. */
export function isCandidateEvent(event: Stripe.Event): boolean {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const product = (event.data.object as Stripe.Checkout.Session).metadata?.product;
    return product === PACK_PRODUCT || product === PLUS_PRODUCT;
  }
  if (SUBSCRIPTION_EVENTS.has(event.type)) return (event.data.object as Stripe.Subscription).metadata?.product === PLUS_PRODUCT;
  if (event.type === "invoice.payment_failed") {
    return (event.data.object as Stripe.Invoice).parent?.subscription_details?.metadata?.product === PLUS_PRODUCT;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Job packs
// ---------------------------------------------------------------------------

export type PackPaymentResult = { ok: true; pack: PackRow } | { ok: false; reason: "not_paid" | "wrong_pack" | "missing_pack" };

/**
 * Applies a paid Checkout session to its pack (the webhook, or the pack page
 * when it gets there first). Safe to run twice: a pack already moved on is
 * left as it is.
 */
export async function applyPackPayment(session: Stripe.Checkout.Session, expectPackId?: string): Promise<PackPaymentResult> {
  const md = session.metadata ?? {};
  if (md.product !== PACK_PRODUCT || !md.pack_id) return { ok: false, reason: "wrong_pack" };
  if (expectPackId && md.pack_id !== expectPackId) return { ok: false, reason: "wrong_pack" };
  if (session.payment_status !== "paid") return { ok: false, reason: "not_paid" };
  const pack = await getPackById(md.pack_id);
  if (!pack) return { ok: false, reason: "missing_pack" };

  const email = pack.email ?? session.customer_details?.email?.toLowerCase() ?? null;
  const consent = { consent_at: md.consent_at || null, consent_text: md.consent_text || null };
  let updated = pack;
  if (md.kind === "upgrade") {
    if (pack.scope === "cv" && pack.upgrade_session_id !== session.id) {
      updated = await updatePack(pack.id, {
        scope: "full",
        upgrade_paid_via: "one_off",
        upgrade_session_id: session.id,
        status: "queued",
        attempts: 0,
        error: null,
        email,
        ...consent,
      });
    }
  } else if (pack.status === "awaiting_payment") {
    updated = await updatePack(pack.id, {
      status: "queued",
      paid_via: "one_off",
      stripe_session_id: session.id,
      amount_pence: session.amount_total ?? null,
      email,
      expires_at: pack.account_id ? null : guestExpiry(),
      ...consent,
    });
  }
  await recordPackPurchase({
    sessionId: session.id,
    email,
    amountPence: session.amount_total ?? null,
    currency: session.currency ?? null,
    consentAt: consent.consent_at,
    consentText: consent.consent_text,
  });
  return { ok: true, pack: updated };
}

/** The pack page, back from Stripe before the webhook: asks Stripe directly. */
export async function confirmPackPayment(pack: PackRow, sessionId: string): Promise<PackRow> {
  if (!/^cs_[A-Za-z0-9_]{8,200}$/.test(sessionId)) return pack;
  const stripe = getStripe();
  if (!stripe) return pack;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const r = await applyPackPayment(session, pack.id);
    return r.ok ? r.pack : pack;
  } catch (err) {
    console.error("[candidate-billing] session check failed:", err instanceof Error ? err.message : err);
    return pack;
  }
}

// ---------------------------------------------------------------------------
// Plus
// ---------------------------------------------------------------------------

type Admin = ReturnType<typeof createAdminClient>;

function mapStatus(status: Stripe.Subscription.Status): CandidatePlanStatus | null {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      // Stripe is retrying the payment: Plus stays on meanwhile.
      return "past_due";
    case "unpaid":
      // Retries have run out: Plus ends.
      return "inactive";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "incomplete":
      // The moment before the first payment: its event can arrive after checkout's, so it must not switch Plus off.
      return null;
    default:
      return "inactive";
  }
}

function period(sub: Stripe.Subscription): { start: string | null; end: string | null } {
  const item = sub.items?.data?.[0];
  const s = item?.current_period_start;
  const e = item?.current_period_end;
  return { start: typeof s === "number" ? new Date(s * 1000).toISOString() : null, end: typeof e === "number" ? new Date(e * 1000).toISOString() : null };
}

async function findAccount(admin: Admin, opts: { accountId?: string | null; subscriptionId?: string | null; customerId?: string | null }): Promise<CandidateAccount | null> {
  if (opts.accountId && /^[0-9a-f-]{36}$/i.test(opts.accountId)) {
    const { data } = await admin.from("mms_candidate_accounts").select(ACCOUNT_COLUMNS).eq("id", opts.accountId).maybeSingle();
    if (data) return data as unknown as CandidateAccount;
  }
  if (opts.subscriptionId) {
    const { data } = await admin.from("mms_candidate_accounts").select(ACCOUNT_COLUMNS).eq("stripe_subscription_id", opts.subscriptionId).maybeSingle();
    if (data) return data as unknown as CandidateAccount;
  }
  if (opts.customerId) {
    const { data } = await admin.from("mms_candidate_accounts").select(ACCOUNT_COLUMNS).eq("stripe_customer_id", opts.customerId).limit(1);
    if (data?.[0]) return data[0] as unknown as CandidateAccount;
  }
  return null;
}

async function updateAccount(admin: Admin, id: string, fields: Record<string, unknown>): Promise<void> {
  const { error } = await admin
    .from("mms_candidate_accounts")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) raise(error, "account update failed");
}

async function processEvent(event: Stripe.Event, admin: Admin): Promise<Record<string, unknown>> {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.product === PACK_PRODUCT) {
      if (session.payment_status !== "paid") return { pending: session.payment_status };
      const r = await applyPackPayment(session);
      if (!r.ok) {
        console.error(`[candidate-billing] paid session ${session.id} could not be applied (${r.reason}); needs a manual check`);
        await notifyOwner([`MatchMySkillset: a £2.99 job pack payment needs a manual check`, `Session ${session.id}`, `Reason: ${r.reason}`]);
        return { pack: null, reason: r.reason };
      }
      // Write it now in case the buyer has closed the page (the pack page also asks; only one writer wins).
      const token = r.pack.token;
      after(async () => {
        try {
          await runGeneration(token);
        } catch (err) {
          console.error("[candidate-billing] background write failed:", err instanceof Error ? err.message : err);
        }
      });
      return { pack: r.pack.id };
    }

    // Plus started
    const account = await findAccount(admin, { accountId: session.metadata?.account_id ?? session.client_reference_id });
    if (!account) {
      console.error(`[candidate-billing] Plus session ${session.id} has no matching account; needs a manual check`);
      await notifyOwner([`MatchMySkillset: a Plus payment has no matching account`, `Session ${session.id}`]);
      return { ignored: "no account" };
    }
    const subscriptionId = idOf(session.subscription);
    const old = account.stripe_subscription_id && account.stripe_subscription_id !== subscriptionId ? account.stripe_subscription_id : null;
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    await updateAccount(admin, account.id, {
      plan: "plus",
      plan_status: paid ? "active" : account.plan_status,
      stripe_customer_id: idOf(session.customer) ?? account.stripe_customer_id,
      stripe_subscription_id: subscriptionId,
      cancel_at_period_end: false,
    });
    // A second subscription (someone re-subscribed while one was still running): stop the old one so nobody pays twice.
    if (old) {
      try {
        await getStripe()?.subscriptions.cancel(old, { prorate: true });
      } catch (err) {
        console.error(`[candidate-billing] could not cancel old subscription ${old}:`, err instanceof Error ? err.message : err);
        await notifyOwner([`MatchMySkillset: cancel old Plus subscription ${old} by hand`]);
      }
    }
    await notifyOwner([`MatchMySkillset Plus started (£7 a month)`, paid ? "Paid" : `Payment status: ${session.payment_status}`], [{ text: "Stripe", url: "https://dashboard.stripe.com/subscriptions" }]);
    return { account: account.id, plus: true };
  }

  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    const sub = event.data.object as Stripe.Subscription;
    const account = await findAccount(admin, { accountId: sub.metadata?.account_id, subscriptionId: sub.id, customerId: idOf(sub.customer) });
    if (!account) return { ignored: "no account" };
    // An older subscription (replaced by a newer one) must not overwrite the current one.
    if (account.stripe_subscription_id && account.stripe_subscription_id !== sub.id) return { ignored: "not the current subscription" };
    const p = period(sub);

    if (event.type === "customer.subscription.deleted") {
      const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : new Date().toISOString();
      await updateAccount(admin, account.id, { plan_status: "cancelled", current_period_end: endedAt, stripe_subscription_id: sub.id, cancel_at_period_end: false });
      await notifyOwner([`MatchMySkillset Plus ended`, `Account ${account.id}`]);
      return { account: account.id, cancelled: true };
    }

    const status = mapStatus(sub.status);
    await updateAccount(admin, account.id, {
      plan: "plus",
      ...(status ? { plan_status: status } : {}),
      stripe_subscription_id: sub.id,
      stripe_customer_id: idOf(sub.customer) ?? account.stripe_customer_id,
      current_period_start: p.start,
      current_period_end: p.end,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end || sub.cancel_at),
    });
    return { account: account.id, status: status ?? account.plan_status };
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription ?? null);
    const account = await findAccount(admin, { subscriptionId, customerId: idOf(invoice.customer) });
    if (!account) return { ignored: "no account" };
    if (account.plan_status === "active") await updateAccount(admin, account.id, { plan_status: "past_due" });
    await notifyOwner([`MatchMySkillset Plus payment failed`, `Account ${account.id}`, `Attempt ${invoice.attempt_count ?? 1}`], [{ text: "Stripe", url: "https://dashboard.stripe.com/subscriptions" }]);
    return { account: account.id, past_due: true };
  }

  return { ignored: event.type };
}

export async function handleCandidateEvent(event: Stripe.Event): Promise<NextResponse> {
  const admin = createAdminClient();
  const { error: claimError } = await admin.from("mms_stripe_events").insert({ event_id: event.id, type: event.type });
  if (claimError) {
    if (claimError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    console.error("[candidate-billing] could not record event:", claimError.message);
    return NextResponse.json({ error: "event_record_failed" }, { status: 500 });
  }
  try {
    const result = await processEvent(event, admin);
    return NextResponse.json({ received: true, candidate: result });
  } catch (err) {
    console.error("[candidate-billing] processing failed:", err instanceof Error ? err.message : err);
    await admin.from("mms_stripe_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
