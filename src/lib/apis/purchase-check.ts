// Confirms that a Checkout session paid for this report. Uses our own
// mms_purchases row when the webhook has written it, otherwise asks Stripe
// (and records the purchase, idempotently). Server-side only.

import { REPORT_PRODUCT, getStripe } from "./stripe";
import { extendReportExpiry, getPurchaseBySession, purchaseFromSession, upsertPurchase, type PurchaseRow, type ReportRow } from "./reports-db";

export type PaidCheck =
  | { status: "paid"; purchase: PurchaseRow }
  | { status: "unpaid" | "mismatch" | "unavailable"; reason: string };

export const SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]{8,200}$/;

export async function verifyPaidSession(sessionId: string, report: ReportRow): Promise<PaidCheck> {
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return { status: "mismatch", reason: "This report link is incomplete. Please use the full link from your email." };
  }

  const existing = await getPurchaseBySession(sessionId);
  if (existing) {
    if (existing.report_id !== report.id) return { status: "mismatch", reason: "This payment is for a different report." };
    if (existing.status !== "paid") return { status: "unpaid", reason: "This payment has not completed." };
    return { status: "paid", purchase: existing };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { status: "unavailable", reason: "We could not confirm your payment yet. Please refresh in a minute, or use the link in your email." };
  }
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[purchase-check] session lookup failed:", err instanceof Error ? err.message : err);
    return { status: "unavailable", reason: "We could not confirm your payment yet. Please refresh in a minute, or use the link in your email." };
  }
  if (session.metadata?.product !== REPORT_PRODUCT || session.metadata?.report_token !== report.token) {
    return { status: "mismatch", reason: "This payment is for a different report." };
  }
  if (session.payment_status !== "paid") return { status: "unpaid", reason: "This payment has not completed." };

  const purchase = await upsertPurchase(purchaseFromSession(session, report.id));
  await extendReportExpiry(report.id);
  return { status: "paid", purchase };
}
