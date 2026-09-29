"use client";

import { useState } from "react";
import { PAYMENTS_UNAVAILABLE, type SelfServePlan } from "@/lib/employer/plans";

// Starts a Stripe Checkout subscription for the signed-in employer. When card
// payments are not available (for example the Stripe key has expired) it says
// so and points to the jobs inbox instead of failing silently.

export function CheckoutButton({ plan, label, className = "btn btn-primary w-full" }: { plan: SelfServePlan; label: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function start() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/employers/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; unavailable?: boolean };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 401) {
        window.location.href = `/employers/sign-in?next=${encodeURIComponent(`/employers/dashboard/billing?plan=${plan}`)}`;
        return;
      }
      setMessage(data.unavailable ? PAYMENTS_UNAVAILABLE : data.error || "We could not start the payment. Please try again.");
    } catch {
      setMessage("We could not reach the payment page. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={start} disabled={busy} className={className}>
        {busy ? "Opening secure checkout..." : label}
      </button>
      {message && (
        <p role="status" className="mt-3 rounded-2xl bg-cloud px-4 py-3 text-left text-[14px] leading-snug text-ink">
          {message}
        </p>
      )}
    </div>
  );
}
