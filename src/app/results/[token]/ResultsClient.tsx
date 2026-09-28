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
      <p role="status" className="rounded-xl bg-green-soft px-3 py-2 text-[14px] text-ink">
        Sent. Check your inbox (and your spam folder) for an email from MatchMySkillset.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex-1">
        <label htmlFor="results-email" className="field-label">
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
          className="field"
        />
      </div>
      <button type="submit" className="btn btn-secondary" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send link"}
      </button>
      <p className="text-[12px] text-mute">One email with your link. No mailing list.</p>
      {state === "error" && (
        <p role="alert" className="text-[14px] text-[#b3261e]">
          {message}
        </p>
      )}
    </form>
  );
}

export function ReportCheckout({
  token,
  occupationId,
  title,
  position,
  paymentsOpen = true,
}: {
  token: string;
  occupationId: string;
  title: string;
  position: number;
  /** False while card payments cannot be taken (checked on the server, at most hourly). */
  paymentsOpen?: boolean;
}) {
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

  if (!paymentsOpen) {
    return (
      <div className="rounded-2xl bg-cloud px-4 py-3">
        <p className="text-[15px] font-semibold text-ink">Career Change Reports open shortly</p>
        <p className="mt-1 text-[14px] text-mute">
          We cannot take card payments just yet, so the {REPORT_PRICE_LABEL} report for {title} is not on sale today. Everything on this page is free and stays here.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-primary btn-sm"
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
    <div className="rounded-2xl bg-cloud p-5">
      <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Career Change Report: {title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-ink-2">
        <li>ONS pay in detail, and how it compares with your current job</li>
        <li>The ways in, with apprenticeship levels, typical length and funding bands</li>
        <li>A plan for each skill gap, with course links and government-funded options where they exist</li>
        <li>A 90-day plan, a skills-first CV summary and CV bullet points for this job</li>
        <li>Interview talking points and live vacancies</li>
      </ul>
      <p className="mt-2 text-[14px] text-ink-2">
        One payment of {REPORT_PRICE_LABEL}. No subscription, no account. Shown on screen and emailed to you.{" "}
        <Link href="/pricing" className="text-link hover:underline">
          More about the report
        </Link>
      </p>
      {unavailable ? (
        <p role="alert" className="mt-3 rounded-xl bg-white px-3 py-2 text-[14px] text-ink">
          {error}
        </p>
      ) : (
        <>
          <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 text-[14px] text-ink">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#0071e3]"
            />
            <span>{DIGITAL_CONSENT_TEXT}</span>
          </label>
          <button type="button" className="btn btn-primary btn-sm mt-3" disabled={!consent || busy} onClick={pay}>
            {busy ? "Opening secure checkout…" : `Pay ${REPORT_PRICE_LABEL} with Stripe`}
          </button>
          {error && (
            <p role="alert" className="mt-2 text-[14px] text-[#b3261e]">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
