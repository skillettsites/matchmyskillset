// The paid Career Change Report: price and consent wording. No server
// imports, so client components can use these too.

/** Price of the Career Change Report, in pence. Change it here only. */
export const REPORT_PRICE_PENCE = 999;
export const REPORT_PRICE_LABEL = "£9.99";
export const REPORT_PRICE_VALUE = REPORT_PRICE_PENCE / 100;
export const REPORT_PRODUCT = "career_change_report";

/**
 * Exact wording of the box a buyer ticks before checkout (Consumer Contracts
 * Regulations 2013: digital content supplied straight away). It is stored
 * with the purchase, so change it only with care.
 */
export const DIGITAL_CONSENT_TEXT =
  "I want my report now. I agree that it will be supplied straight after payment and understand that I then lose my 14-day right to cancel.";
