"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lastResultsToken } from "@/components/cv/storage";
import { PAYMENTS_SOON } from "@/lib/candidate/plans";

/** Links the results page this browser opened last to the account, once, then refreshes the list. */
export function LinkBrowserResults({ known }: { known: string[] }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const token = lastResultsToken();
    if (!token || known.includes(token)) return;
    fetch("/api/account/link-results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then((r) => r.json())
      .then((d: { linked?: boolean }) => {
        if (d.linked) router.refresh();
      })
      .catch(() => {});
  }, [known, router]);
  return null;
}

export function BillingButton({ label = "Manage billing" }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function open() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/account/portal", { method: "POST" });
      const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string; unavailable?: boolean };
      if (res.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      setMessage(d.unavailable ? PAYMENTS_SOON : d.error || "We could not open billing. Please try again.");
    } catch {
      setMessage("We could not reach billing. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button type="button" onClick={open} disabled={busy} className="btn btn-secondary btn-sm">
        {busy ? "Opening..." : label}
      </button>
      {message && <p className="mt-3 text-[14px] leading-snug text-ink">{message}</p>}
    </div>
  );
}
