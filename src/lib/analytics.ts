import { track as vercelTrack } from "@vercel/analytics";

// Client-side analytics helpers.
//
// Google Analytics only runs after the visitor accepts analytics cookies (see
// src/components/GoogleAnalytics.tsx). Vercel Web Analytics is cookieless and
// aggregated, so events also go there regardless of the cookie choice, once
// <VercelAnalytics /> is mounted in the root layout.

/** Event names shared by every part of the site. Add new ones here. */
export const ANALYTICS_EVENTS = [
  "cv_submitted",
  "results_viewed",
  "report_cta_click",
  "begin_checkout",
  "purchase",
  "affiliate_click",
  "job_click",
  "job_view",
  "email_saved",
  "quiz_completed",
  "tool_used",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

/** GA4 accepts nested values (e.g. purchase `items`); Vercel only gets the flat ones. */
export type AnalyticsParams = Record<string, unknown>;

type Gtag = (...args: unknown[]) => void;

// ---------------------------------------------------------------------------
// Cookie consent (stored in localStorage; read and written inside try/catch
// because storage can throw in private windows or when site data is blocked)
// ---------------------------------------------------------------------------

export type ConsentChoice = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "mms_analytics_consent";
export const CONSENT_CHANGE_EVENT = "mms:consent-change";

// Fallback for the current page view when storage is unavailable, so the
// banner still closes after a choice.
let sessionChoice: ConsentChoice | null = null;

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") return stored;
  } catch {
    // storage unavailable
  }
  return sessionChoice;
}

export function writeConsent(choice: ConsentChoice): void {
  sessionChoice = choice;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // storage unavailable; sessionChoice covers this page view
  }
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "granted";
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function flatParams(params: AnalyticsParams | undefined) {
  const out: Record<string, string | number | boolean | null> = {};
  if (!params) return out;
  for (const [key, value] of Object.entries(params)) {
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
      out[key] = value as string | number | boolean | null;
    }
  }
  return out;
}

/**
 * Records an analytics event. Safe to call anywhere: it does nothing on the
 * server, never throws, and only reaches Google Analytics when the visitor
 * has accepted analytics cookies. Do not put personal data (emails, CV text,
 * names) in params.
 *
 * @example track("report_cta_click", { soc: "2134", position: "results_top" })
 */
export function track(event: AnalyticsEvent, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;

  try {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag === "function" && hasAnalyticsConsent()) {
      gtag("event", event, params ?? {});
    }
  } catch {
    // analytics must never break the page
  }

  try {
    vercelTrack(event, flatParams(params));
  } catch {
    // analytics must never break the page
  }
}
