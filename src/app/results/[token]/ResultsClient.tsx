"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { DIGITAL_CONSENT_TEXT, REPORT_PRICE_LABEL, REPORT_PRICE_VALUE } from "@/lib/apis/report-product";

/** Fires one analytics event when the page is shown (once per browser tab and key). */
export function ViewEvent({ event, params, onceKey }: { event: AnalyticsEvent; params?: Record<string, unknown>; onceKey?: string }) {
  useEffect(() => {
    if (onceKey) {
      try {
        const k = `mms_evt_${onceKey}`;
        if (window.localStorage.getItem(k)) return;
        window.localStorage.setItem(k, "1");
      } catch {
        // storage unavailable: send the event anyway
      }
    }
    track(event, params);
    // Fire once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function EmailLinkForm({ token }: { token: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState("error");
        setMessage(data.error || "We could not send the email.");
        return;
      }
      setState("sent");
      track("email_saved", { placement: "results" });
    } catch {
      setState("error");
      setMessage("We could not reach the server. Please try again.");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="rounded-md bg-accent-wash px-3 py-2 text-sm text-ink">
        Sent. Check your inbox (and your spam folder) for an email from MatchMySkillset.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="results-email" className="block text-sm font-semibold text-ink">
          Email me this link (optional)
        </label>
        <input
          id="results-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base"
        />
      </div>
      <button type="submit" className="btn btn-secondary min-h-12" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send link"}
      </button>
      <p className="text-xs text-muted sm:hidden">One email with your link. No mailing list.</p>
      {state === "error" && (
        <p role="alert" className="text-sm text-negative sm:basis-full">
          {message}
        </p>
      )}
    </form>
  );
}

export function ReportCheckout({ token, occupationId, title, position }: { token: string; occupationId: string; title: string; position: number }) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, occupationId, consent }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; unavailable?: boolean };
      if (res.ok && data.url) {
        track("begin_checkout", {
          currency: "GBP",
          value: REPORT_PRICE_VALUE,
          items: [{ item_id: occupationId, item_name: `Career Change Report: ${title}`, price: REPORT_PRICE_VALUE, quantity: 1 }],
        });
        window.location.href = data.url;
        return;
      }
      if (data.unavailable) setUnavailable(true);
      setError(data.error || "We could not start the payment. Please try again.");
    } catch {
      setError("We could not reach the server. Please try again.");
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-primary w-full sm:w-auto"
        onClick={() => {
          setOpen(true);
          track("report_cta_click", { occupation_id: occupationId, position });
        }}
      >
        Get the full report for this career ({REPORT_PRICE_LABEL})
      </button>
    );
  }

  return (
    <div className="rounded-md border border-accent/30 bg-accent-wash p-4">
      <p className="font-semibold text-ink">Career Change Report: {title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
        <li>ONS pay in detail, and how it compares with your current job</li>
        <li>The ways in, with apprenticeship levels, typical length and funding bands</li>
        <li>A plan for each skill gap, with course links and government-funded options where they exist</li>
        <li>A 90-day plan, a skills-first CV summary and CV bullet points for this job</li>
        <li>Interview talking points and live vacancies</li>
      </ul>
      <p className="mt-2 text-sm text-ink-2">
        One payment of {REPORT_PRICE_LABEL}. No subscription, no account. Shown on screen and emailed to you.{" "}
        <Link href="/pricing" className="link">
          More about the report
        </Link>
      </p>
      {unavailable ? (
        <p role="alert" className="mt-3 rounded-md bg-paper-2 px-3 py-2 text-sm text-ink">
          {error}
        </p>
      ) : (
        <>
          <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span>{DIGITAL_CONSENT_TEXT}</span>
          </label>
          <button type="button" className="btn btn-primary mt-3 w-full sm:w-auto" disabled={!consent || busy} onClick={pay}>
            {busy ? "Opening secure checkout…" : `Pay ${REPORT_PRICE_LABEL} with Stripe`}
          </button>
          {error && (
            <p role="alert" className="mt-2 text-sm text-negative">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
