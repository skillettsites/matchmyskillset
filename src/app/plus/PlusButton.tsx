"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { PLUS_CONSENT_TEXT, PLUS_PRICE_LABEL, PLUS_PRICE_VALUE } from "@/lib/candidate/plans";

/** Start Plus: consent tick, then Stripe Checkout. Signed-out visitors are sent to sign in first. */
export function PlusButton({ signedIn, hasPlus, paymentsOpen, dark = false }: { signedIn: boolean; hasPlus: boolean; paymentsOpen: boolean; dark?: boolean }) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const btn = `btn w-full ${dark ? "btn-primary" : "btn-dark"}`;

  if (hasPlus) {
    return (
      <Link href="/account#plan" className={btn}>
        You have Plus
      </Link>
    );
  }
  if (!paymentsOpen) {
    return <p className={`rounded-2xl px-4 py-3 text-center text-[14px] leading-snug ${dark ? "bg-white/10 text-white/85" : "bg-white text-ink-2"}`}>Card payments open shortly, so Plus is not on sale today.</p>;
  }
  if (!signedIn) {
    return (
      <Link href={`/account/sign-in?next=${encodeURIComponent("/plus")}`} className={btn}>
        Sign in to start Plus
      </Link>
    );
  }

  async function start() {
    setError("");
    if (!consent) {
      setError("Please tick the box to start Plus straight away.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/plus/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consent }) });
      const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && d.url) {
        track("begin_checkout", { currency: "GBP", value: PLUS_PRICE_VALUE, items: [{ item_id: "plus_monthly", item_name: "MatchMySkillset Plus", price: PLUS_PRICE_VALUE, quantity: 1 }] });
        window.location.href = d.url;
        return;
      }
      setError(d.error || "We could not start the payment. Please try again.");
    } catch {
      setError("We could not reach the server. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <label className={`flex items-start gap-3 text-[13px] leading-snug ${dark ? "text-white/80" : "text-ink-2"}`}>
        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{PLUS_CONSENT_TEXT}</span>
      </label>
      <button type="button" className={btn} disabled={busy} onClick={() => void start()}>
        {busy ? "Starting..." : `Start Plus, ${PLUS_PRICE_LABEL} a month`}
      </button>
      {error && (
        <p role="alert" className={`text-[14px] ${dark ? "text-[#ffb4ab]" : "text-[#b3261e]"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
