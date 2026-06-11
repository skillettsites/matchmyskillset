import Stripe from "stripe";

// Some env values in this stack arrive with a trailing literal "\n" (two
// chars), which makes Stripe reject the key. Strip it before use.
function clean(value: string | undefined | null): string {
  return (value || "").replace(/\\n$/, "").trim();
}

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(clean(process.env.STRIPE_SECRET_KEY));
  }
  return _stripe;
}
