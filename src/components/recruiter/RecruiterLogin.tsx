"use client";

import { useActionState } from "react";
import { recruiterSignIn, type RecruiterLoginState } from "@/app/recruiter/actions";

export function RecruiterLogin({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<RecruiterLoginState, FormData>(recruiterSignIn, {});
  return (
    <form action={action} className="mx-auto max-w-[400px] rounded-[28px] bg-white p-8">
      <p className="eyebrow text-blue">MatchMySkillset</p>
      <h1 className="title mt-1">Recruiter sign-in</h1>
      <p className="mt-2 text-[15px] leading-snug text-mute">For our recruiters, to put together shortlists for employers.</p>
      {!configured && (
        <p className="mt-3 text-[14px] text-[#8a5300]">RECRUITER_SECRET is not set (it needs at least 16 characters and must differ from the admin password).</p>
      )}
      <label htmlFor="pw" className="field-label mt-6">
        Password
      </label>
      <input id="pw" name="password" type="password" className="field" autoComplete="current-password" required />
      {state.error && (
        <p role="alert" className="mt-2 text-[14px] text-[#b3261e]">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary mt-6 w-full" disabled={pending}>
        {pending ? "Checking..." : "Sign in"}
      </button>
    </form>
  );
}
