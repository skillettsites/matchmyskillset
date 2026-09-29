"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { lastResultsToken } from "@/components/cv/storage";
import { CHECKIN_NOTICE } from "@/lib/tracking/constants";
import { APPLY_CLICK_EVENT, clientJobKey, forgetTracker, isJobTracked, readTracker, rememberTrackedJob, rememberTracker, subscribeTracker } from "./storage";

/** What this browser knows, as one comparable string: [job already tracked, tracker token, tracker email]. */
const SERVER_SNAPSHOT = JSON.stringify([false, "", ""]);

// "I applied" for an outside job on a results or search card. After someone
// clicks Apply (the advert opens in a new tab) and comes back, the card asks
// whether they applied; they can also say so any time with "Applied? Track
// it". Tracking starts only when they confirm, next to the check-in notice,
// and gives their email if we do not know it yet.

export interface TrackableJob {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary?: string;
}

type State = "idle" | "ask" | "form" | "saving" | "done";

/** Called from a card's Apply click: remembers that this job's advert was opened. */
export function noteApplyClick(job: { id: string; source: string; url: string; title: string }): void {
  try {
    window.dispatchEvent(new CustomEvent(APPLY_CLICK_EVENT, { detail: { key: clientJobKey(job), at: Date.now() } }));
  } catch {
    // no CustomEvent: the "Applied? Track it" link still works
  }
}

export function TrackApplied({ job }: { job: TrackableJob }) {
  const key = clientJobKey(job);
  const inputId = useId();
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ token: string; emailed: boolean; newTracker: boolean } | null>(null);
  const clickedAt = useRef<number | null>(null);
  const snapshot = useCallback(() => {
    const t = readTracker();
    return JSON.stringify([isJobTracked(key), t?.token ?? "", t?.email ?? ""]);
  }, [key]);
  const [alreadyTracked, storedToken, storedEmail] = JSON.parse(useSyncExternalStore(subscribeTracker, snapshot, () => SERVER_SNAPSHOT)) as [boolean, string, string];
  const known = storedEmail || null;

  useEffect(() => {
    const onClick = (e: Event) => {
      const d = (e as CustomEvent<{ key: string; at: number }>).detail;
      if (d?.key === key) clickedAt.current = d.at;
    };
    const onBack = () => {
      if (document.visibilityState !== "visible" || clickedAt.current === null) return;
      if (Date.now() - clickedAt.current < 2000) return;
      clickedAt.current = null;
      setState((s) => (s === "idle" ? "ask" : s));
    };
    window.addEventListener(APPLY_CLICK_EVENT, onClick);
    document.addEventListener("visibilitychange", onBack);
    window.addEventListener("focus", onBack);
    return () => {
      window.removeEventListener(APPLY_CLICK_EVENT, onClick);
      document.removeEventListener("visibilitychange", onBack);
      window.removeEventListener("focus", onBack);
    };
  }, [key]);

  async function track(withEmail: string | null) {
    setState("saving");
    setError("");
    const stored = readTracker();
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: { id: job.id, source: job.source, title: job.title, company: job.company, location: job.location, url: job.url, salary: job.salary },
          trackerToken: withEmail ? undefined : stored?.token,
          email: withEmail ?? undefined,
          resultsToken: lastResultsToken() ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string; emailed?: boolean; newTracker?: boolean; error?: string; needEmail?: boolean };
      if (!res.ok || !data.token) {
        if (data.needEmail) {
          // The remembered tracker no longer exists (deleted): ask for the email instead.
          if (!withEmail) forgetTracker();
          setState("form");
          setError(withEmail ? data.error || "Please enter a valid email address." : "");
          return;
        }
        setState("form");
        setError(data.error || "We could not save that just now. Please try again.");
        return;
      }
      const address = withEmail ?? stored?.email ?? "";
      if (data.newTracker || !stored) rememberTracker({ token: data.token, email: address });
      rememberTrackedJob(key);
      setResult({ token: data.token, emailed: Boolean(data.emailed), newTracker: Boolean(data.newTracker) });
      setState("done");
    } catch {
      setState("form");
      setError("We could not reach the server. Please check your connection and try again.");
    }
  }

  function confirmApplied() {
    if (known) void track(null);
    else setState("form");
  }

  if (alreadyTracked && state !== "done") {
    return (
      <p className="mt-3 flex items-center gap-2 text-[13px] text-mute">
        <span className="h-1.5 w-1.5 rounded-full bg-green" aria-hidden="true" />
        In your application tracker.
        {storedToken && (
          <Link href={`/tracker/${encodeURIComponent(storedToken)}`} className="text-link hover:underline">
            Open it
          </Link>
        )}
      </p>
    );
  }

  if (state === "done" && result) {
    return (
      <div role="status" className="mt-3 rounded-2xl bg-green-soft px-4 py-3 text-[14px] text-ink">
        <p className="font-semibold">Added to your application tracker.</p>
        <p className="mt-0.5 text-ink-2">
          We&apos;ll check in at 7 and 21 days.{result.newTracker ? (result.emailed ? " We have emailed you the link to your tracker." : " Keep the link below to find it again.") : ""}{" "}
          <Link href={`/tracker/${encodeURIComponent(result.token)}`} className="font-medium text-link hover:underline">
            See your tracker
          </Link>
        </p>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <button type="button" className="mt-3 text-[13px] text-link hover:underline" onClick={() => setState("ask")}>
        Applied? Track it
      </button>
    );
  }

  if (state === "ask" || (state === "saving" && known)) {
    return (
      <div className="mt-3 rounded-2xl bg-cloud px-4 py-3">
        <p className="text-[15px] font-semibold text-ink">Did you apply for this job?</p>
        <p className="mt-0.5 text-[13px] leading-snug text-mute">
          Say yes and we&apos;ll add it to your application tracker{known ? ` (${known})` : ""}. {CHECKIN_NOTICE}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-sm" disabled={state === "saving"} onClick={confirmApplied}>
            {state === "saving" ? "Saving…" : "Yes, I applied"}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={state === "saving"} onClick={() => setState("idle")}>
            Not yet
          </button>
        </div>
      </div>
    );
  }

  // form (or saving with a typed email)
  return (
    <form
      className="mt-3 rounded-2xl bg-cloud px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        void track(email.trim());
      }}
    >
      <label htmlFor={inputId} className="text-[15px] font-semibold text-ink">
        Track this application
      </label>
      <p className="mt-0.5 text-[13px] leading-snug text-mute">{CHECKIN_NOTICE}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className="field !py-2 !text-[15px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm shrink-0" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Track it"}
        </button>
      </div>
      <p className="mt-2 text-[12px] text-mute">
        We keep it for 12 months.{" "}
        <Link href="/privacy#tracking" className="text-link hover:underline">
          Privacy
        </Link>{" "}
        ·{" "}
        <button type="button" className="text-link hover:underline" onClick={() => setState("idle")}>
          Cancel
        </button>
      </p>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-[#b3261e]">
          {error}
        </p>
      )}
    </form>
  );
}
