"use client";

import { useState } from "react";
import { PAYMENTS_UNAVAILABLE } from "@/lib/employer/plans";

export function PortalButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function open() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/employers/portal", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; unavailable?: boolean };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.unavailable ? PAYMENTS_UNAVAILABLE : data.error || "We could not open billing. Please try again.");
    } catch {
      setMessage("We could not reach billing. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button type="button" onClick={open} disabled={busy} className="btn btn-secondary btn-sm">
        {busy ? "Opening..." : "Manage billing"}
      </button>
      {message && <p className="mt-3 text-[14px] leading-snug text-ink">{message}</p>}
    </div>
  );
}
