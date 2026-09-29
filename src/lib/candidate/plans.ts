// Candidate CV tools: prices, limits and the exact wording people agree to.
// No server imports, so client components can use these too.
//
// Owner decisions (Dave, 29 Sep 2026):
// - Free forever: CV upload and scored live jobs, job alerts, applying, the
//   careers tab, and ONE free tailored CV per person to try.
// - Job pack: £2.99 once for one job (tailored CV, cover letter, interview prep).
// - Plus: £7 a month, cancel any time, up to 30 job packs a billing month
//   (fair use), "Check any job", and full access to the application tracker.

export const PACK_PRICE_PENCE = 299;
export const PACK_PRICE_LABEL = "£2.99";
export const PACK_PRICE_VALUE = PACK_PRICE_PENCE / 100;

export const PLUS_PRICE_PENCE = 700;
export const PLUS_PRICE_LABEL = "£7";
export const PLUS_PRICE_VALUE = PLUS_PRICE_PENCE / 100;

/** Fair-use cap: job packs included in one Plus billing month. */
export const PLUS_PACKS_PER_MONTH = 30;

/** Stripe metadata `product` values. The report and employer flows use their own. */
export const PACK_PRODUCT = "mms_job_pack";
export const PLUS_PRODUCT = "mms_plus";

/**
 * Wording of the box ticked before paying for a job pack (Consumer Contracts
 * Regulations 2013: digital content supplied straight away). Stored with the
 * pack and in the Stripe session, so change it only with care.
 */
export const PACK_CONSENT_TEXT =
  "I want my job pack now. I agree that it will be written straight after payment and understand that I then lose my 14-day right to cancel this purchase.";

/** Same idea for Plus: each pack is supplied straight away, but the plan itself can be cancelled at any time. */
export const PLUS_CONSENT_TEXT =
  "I want Plus to start now. I agree that job packs are written as soon as I ask for them, and understand that I lose my 14-day right to cancel once I have had my first pack. I can still cancel Plus at any time so it does not renew.";

/** Shown instead of pay buttons while card payments cannot be taken (isStripeReady). */
export const PAYMENTS_SOON = "Card payments open shortly. Your one free tailored CV is ready to use now.";

/** Shown when the new tables are not there yet (migration 009 not applied). */
export const NOT_SWITCHED_ON = "Accounts and job packs are not switched on yet. Please try again soon.";

/** How long a sign-in link works. */
export const SIGN_IN_MINUTES = 20;

/** Minimum lengths before we will write a pack. */
export const MIN_CV_CHARS = 200;
export const MIN_ADVERT_CHARS = 200;
export const MAX_CV_CHARS = 12_000;
export const MAX_ADVERT_CHARS = 12_000;
