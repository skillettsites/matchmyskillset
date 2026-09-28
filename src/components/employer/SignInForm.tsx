"use client";

import { useActionState } from "react";
import { requestSignInLink, type SignInState } from "@/app/employers/actions";

export function SignInForm({ next }: { next: string | null }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestSignInLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div role="status">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f1fd] text-blue">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>
        <h2 className="title mt-5 text-center">Check your email.</h2>
        <p className="mt-3 text-center text-[17px] leading-snug text-mute">
          We sent a sign-in link to <strong className="text-ink">{state.email}</strong>. It works once, within 20 minutes.
        </p>
        <p className="mt-6 text-center text-[14px] text-mute">
          Nothing there? Check your junk folder, or{" "}
          <button type="button" onClick={() => window.location.reload()} className="text-link hover:underline">
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <label htmlFor="email" className="field-label">
        Work email
      </label>
      <input id="email" name="email" type="email" className="field" autoComplete="email" inputMode="email" required placeholder="you@company.co.uk" />
      {state.status === "error" && (
        <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={pending}>
        {pending ? "Sending..." : "Email me a sign-in link"}
      </button>
      <p className="field-hint text-center">No password needed. New here? The same link creates your account.</p>
    </form>
  );
}
