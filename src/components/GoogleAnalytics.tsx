"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import { cleanEnv } from "@/lib/env";
import { CONSENT_CHANGE_EVENT, readConsent, writeConsent, type ConsentChoice } from "@/lib/analytics";

// Google Analytics with Google Consent Mode v2 and a cookie banner.
//
// Every consent type starts as "denied". gtag.js is not even downloaded until
// the visitor clicks Accept, and then only analytics_storage is granted (the
// site runs no ads, so the ad_* types stay denied). Reject, or withdrawing
// consent later through <CookieSettingsButton />, sets analytics_storage back
// to denied and deletes the _ga cookies. The choice is kept in localStorage.

const GA_ID = (() => {
  const id = cleanEnv(process.env.NEXT_PUBLIC_GA_ID);
  return /^G-[A-Z0-9]{4,20}$/.test(id) ? id : "";
})();

const OPEN_SETTINGS_EVENT = "mms:open-cookie-settings";

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

// ---------------------------------------------------------------------------
// Consent state as an external store (no setState in effects, no hydration
// mismatch: the server snapshot never shows the banner)
// ---------------------------------------------------------------------------

let settingsOpen = false;

function subscribe(onChange: () => void) {
  const onOpen = () => {
    settingsOpen = true;
    onChange();
  };
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
  };
}

function getSnapshot(): string {
  return `${readConsent() ?? "unset"}|${settingsOpen ? "open" : "closed"}`;
}

function getServerSnapshot(): string {
  return "server|closed";
}

// ---------------------------------------------------------------------------
// gtag
// ---------------------------------------------------------------------------

let gaScriptAdded = false;

function ensureGtag(w: GtagWindow): (...args: unknown[]) => void {
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== "function") {
    w.gtag = function gtag() {
      // gtag.js only processes the Arguments object, not a plain array.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  return w.gtag;
}

function startGoogleAnalytics() {
  const w = window as GtagWindow;
  const gtag = ensureGtag(w);
  gtag("consent", "update", { analytics_storage: "granted" });
  if (gaScriptAdded) return;
  gaScriptAdded = true;
  gtag("js", new Date());
  gtag("config", GA_ID);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

function stopGoogleAnalytics() {
  const w = window as GtagWindow;
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", { analytics_storage: "denied" });
  }
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (name !== "_ga" && !name.startsWith("_ga_")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** Mounted once in the root layout. Renders the banner when a choice is needed. */
export function GoogleAnalytics() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [consent, panel] = snapshot.split("|");
  const firstButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!GA_ID) return;
    if (consent === "granted") startGoogleAnalytics();
    else if (consent === "denied") stopGoogleAnalytics();
  }, [consent]);

  const reopened = panel === "open";
  useEffect(() => {
    if (reopened) firstButton.current?.focus();
  }, [reopened]);

  if (!GA_ID || consent === "server") return null;
  if (consent !== "unset" && !reopened) return null;

  function choose(choice: ConsentChoice) {
    settingsOpen = false;
    writeConsent(choice);
  }

  const buttonClass = "btn btn-dark min-h-11 flex-1 px-5 py-2.5 text-[15px] sm:flex-none";

  return (
    <section
      aria-label="Cookie choice"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="glass pointer-events-auto mx-auto max-w-3xl rounded-[22px] p-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.08] sm:flex sm:items-center sm:gap-6 sm:p-5">
        <p className="flex-1 text-[14px] leading-relaxed text-ink-2">
          We would like to use Google Analytics cookies to understand how the site is used. They
          stay off unless you accept.
          {consent !== "unset" && (
            <> Analytics cookies are currently {consent === "granted" ? "on" : "off"}.</>
          )}{" "}
          <Link href="/privacy#cookies" className="font-medium text-link underline">
            Cookie details
          </Link>
        </p>
        <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
          <button ref={firstButton} type="button" onClick={() => choose("denied")} className={buttonClass}>
            Reject
          </button>
          <button type="button" onClick={() => choose("granted")} className={buttonClass}>
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}

/** Reopens the cookie banner so a visitor can change or withdraw their choice. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
      className={className ?? "font-medium text-link underline"}
    >
      Cookie settings
    </button>
  );
}

/**
 * Vercel Web Analytics (cookieless, aggregated). Not mounted yet: add
 * <VercelAnalytics /> once to the root layout, next to <GoogleAnalytics />.
 */
export function VercelAnalytics() {
  return <Analytics />;
}
