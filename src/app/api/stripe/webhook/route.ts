import { NextRequest, NextResponse, after } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCareerOccupation } from "@/data/careers";
import { REPORT_PRODUCT, webhookSecret } from "@/lib/apis/stripe";
import {
  extendReportExpiry,
  getReportByToken,
  markFulfilled,
  purchaseFromSession,
  upsertPurchase,
} from "@/lib/apis/reports-db";
import { ensureReport } from "@/lib/apis/report-builder";
import { isValidEmail, sendReportLink } from "@/lib/email/results-email";
import { handleEmployerEvent, isEmployerEvent } from "@/lib/employer/billing-webhook";
// Candidate CV tools (job packs and Plus): checked first, see src/lib/candidate/billing-webhook.ts.
import { handleCandidateEvent, isCandidateEvent } from "@/lib/candidate/billing-webhook";

// Stripe webhook for the Career Change Report. Register it in the Stripe
// dashboard at https://matchmyskillset.com/api/stripe/webhook for
// checkout.session.completed (and checkout.session.async_payment_succeeded
// if delayed payment methods are ever switched on). Employer subscriptions
// also arrive here: checkout.session.completed (mode subscription),
// customer.subscription.created/updated/deleted and invoice.payment_failed.
// They are handed to src/lib/employer/billing-webhook.ts before the report
// flow runs, with the same mms_stripe_events idempotency.
//
// Order: verify the signature, record the event id first (a repeat delivery
// hits the primary key, 23505, and is acknowledged without doing anything),
// record the purchase, answer Stripe, then write the report and email the
// link in after(). The report page also writes the report if this has not
// finished, so a slow or failed run here never loses a purchase.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 300: a job pack paid for by card is written in after() (src/lib/candidate/billing-webhook.ts).
export const maxDuration = 300;

const HANDLED = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const secret = webhookSecret();
  if (!signature || !secret) {
    console.error("[stripe-webhook] missing signature header or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    // Signature checking is local HMAC work: it does not need a working API key.
    event = Stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] bad signature:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  // Candidate job packs and Plus first: the employer handler treats every subscription event as an employer's.
  if (isCandidateEvent(event)) return handleCandidateEvent(event);
  if (isEmployerEvent(event)) return handleEmployerEvent(event);

  if (!HANDLED.has(event.type)) return NextResponse.json({ received: true, ignored: event.type });
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.product !== REPORT_PRODUCT) return NextResponse.json({ received: true, ignored: "other product" });

  const admin = createAdminClient();
  const { error: claimError } = await admin.from("mms_stripe_events").insert({ event_id: event.id, type: event.type });
  if (claimError) {
    if (claimError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    console.error("[stripe-webhook] could not record event:", claimError.message);
    return NextResponse.json({ error: "event_record_failed" }, { status: 500 });
  }

  const release = async () => {
    await admin.from("mms_stripe_events").delete().eq("event_id", event.id);
  };

  // Delayed payment methods complete later with async_payment_succeeded.
  if (session.payment_status !== "paid") return NextResponse.json({ received: true, pending: session.payment_status });

  try {
    const token = session.metadata?.report_token ?? "";
    const report = await getReportByToken(token);
    if (!report) {
      // Nothing to fulfil against (expired or wrong token). Keep the event so
      // Stripe stops retrying, and leave a loud log for a manual refund check.
      console.error(`[stripe-webhook] paid session ${session.id} points at missing report token; needs a manual check`);
      return NextResponse.json({ received: true, fulfilled: false });
    }

    const purchase = await upsertPurchase(purchaseFromSession(session, report.id));
    await extendReportExpiry(report.id);

    after(async () => {
      const result = await ensureReport(purchase, report);
      const email = purchase.email;
      const destination = getCareerOccupation(session.metadata?.occupation_id ?? "")?.title ?? "your chosen career";
      if (!email || !isValidEmail(email)) {
        console.error(`[stripe-webhook] purchase ${purchase.id} has no usable email; report link not sent`);
        return;
      }
      const sent = await sendReportLink(email, { token: report.token, sessionId: session.id, destination });
      if (result.status === "ready" && sent.ok) {
        await markFulfilled(purchase.id, sent.id);
      } else if (!sent.ok) {
        console.error(`[stripe-webhook] report email failed for purchase ${purchase.id}: ${sent.error}`);
      }
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe-webhook] processing failed:", err instanceof Error ? err.message : err);
    await release();
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
