"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Shown when payment is confirmed but the report has not been written yet
 * (the webhook may still be working). Asks the server to write it, which is
 * safe to repeat, then reloads the page to show it.
 */
export function ReportGenerating({ token, sessionId }: { token: string; sessionId: string }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [failure, setFailure] = useState("");
  const tries = useRef(0);

  useEffect(() => {
    const started = Date.now();
    const tick = setInterval(() => setSeconds(Math.round((Date.now() - started) / 1000)), 1000);
    let cancelled = false;

    async function attempt() {
      tries.current += 1;
      try {
        const res = await fetch("/api/report/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, sessionId }),
        });
        const data = (await res.json().catch(() => ({}))) as { status?: string; reason?: string };
        if (cancelled) return;
        if (data.status === "ready") {
          router.refresh();
          return;
        }
        if (data.status === "busy" && tries.current < 30) {
          setTimeout(attempt, 5000);
          return;
        }
        setFailure(data.reason || "We could not write your report just now.");
      } catch {
        if (!cancelled && tries.current < 5) setTimeout(attempt, 5000);
        else if (!cancelled) setFailure("We could not reach the server.");
      }
    }
    void attempt();
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [token, sessionId, router]);

  if (failure) {
    return (
      <div role="alert" className="rounded-lg border border-rule bg-surface p-5">
        <p className="font-semibold text-ink">{failure}</p>
        <p className="mt-2 text-ink-2">
          Your payment is safe. Please refresh this page in a few minutes. We have also emailed you this link, so you can come
          back to it later.
        </p>
        <button type="button" className="btn btn-secondary mt-4" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-rule bg-surface p-5" role="status" aria-live="polite">
      <p className="font-semibold text-ink">Payment confirmed. Writing your report now…</p>
      <p className="mt-2 text-ink-2">
        This usually takes under a minute ({seconds}s so far). You can leave this page: we will email you the link as well.
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-[width] duration-1000" style={{ width: `${Math.min(95, 10 + seconds * 1.5)}%` }} />
      </div>
    </div>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="btn btn-secondary no-print" onClick={() => window.print()}>
      Print or save as PDF
    </button>
  );
}
