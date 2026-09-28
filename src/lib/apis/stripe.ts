import Stripe from "stripe";
import { env } from "@/lib/env";

// Stripe for the one-off Career Change Report. Server-side only.
// The site must keep working (free results) when the key is missing or has
// expired, so callers get null here and show "temporarily unavailable".

export { REPORT_PRICE_PENCE, REPORT_PRICE_LABEL, REPORT_PRODUCT, DIGITAL_CONSENT_TEXT } from "./report-product";

let stripe: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (stripe === undefined) {
    const key = env("STRIPE_SECRET_KEY");
    stripe = key ? new Stripe(key) : null;
  }
  return stripe;
}

/** The key is missing, expired, revoked or lacks permission: nobody can pay until the owner fixes it. */
export function isStripeConfigError(err: unknown): boolean {
  return err instanceof Stripe.errors.StripeAuthenticationError || err instanceof Stripe.errors.StripePermissionError;
}

export function webhookSecret(): string {
  return env("STRIPE_WEBHOOK_SECRET");
}
