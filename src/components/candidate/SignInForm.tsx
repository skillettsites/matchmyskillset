"use client";

import { useActionState, useEffect } from "react";
import { useKeepValues } from "@/components/employer/useKeepValues";
import { requestCandidateLink, type SignInState } from "@/app/account/actions";
import { SIGN_IN_MINUTES } from "@/lib/candidate/plans";

/** Email-me-a-link form for job seekers. `onSent` lets the tailor page start watching for the sign-in. */
export function CandidateSignInForm({ next, compact = false, onSent }: { next: string | null; compact?: boolean; onSent?: (email: string) => void }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestCandidateLink, { status: "idle" });
  const keep = useKeepValues(action);
  useEffect(() => {
    if (state.status === "sent" && state.email) onSent?.(state.email);
  }, [state, onSent]);

  if (state.status === "sent") {
    return (
      <div role="status">
        {!compact && (
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f1fd] text-blue">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>
        )}
        <p className={`${compact ? "text-[17px] font-semibold" : "title mt-5 text-center"} text-ink`}>Check your email.</p>
        <p className={`mt-2 text-[15px] leading-snug text-mute ${compact ? "" : "text-center"}`}>
          We sent a sign-in link to <strong className="text-ink">{state.email}</strong>. It works once, within {SIGN_IN_MINUTES} minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={keep} noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <label htmlFor="cand-email" className="field-label">
        Your email
      </label>
      <input id="cand-email" name="email" type="email" className="field" autoComplete="email" inputMode="email" required placeholder="you@example.co.uk" />
      {state.status === "error" && (
        <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
          {state.message}
        </p>
      )}
      <button type="submit" className={`btn btn-primary mt-4 w-full ${compact ? "btn-sm" : ""}`} disabled={pending}>
        {pending ? "Sending..." : "Email me a sign-in link"}
      </button>
      <p className="field-hint text-center">No password. New here? The same link creates your free account.</p>
    </form>
  );
}
