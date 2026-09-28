"use client";

import Link from "next/link";
import { useActionState } from "react";
import { completeSetup, type FormState } from "@/app/employers/dashboard/actions";

export function SetupForm(props: { email: string; next: string | null; company: string; contact: string; website: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(completeSetup, {});
  const err = state.errors ?? {};
  return (
    <form action={action} className="card-white space-y-5 p-7 sm:p-8">
      {props.next && <input type="hidden" name="next" value={props.next} />}
      <p className="text-[15px] text-mute">
        Signed in as <strong className="text-ink">{props.email}</strong>
      </p>
      <div>
        <label htmlFor="company_name" className="field-label">
          Company or organisation name
        </label>
        <input id="company_name" name="company_name" className="field" defaultValue={props.company} required maxLength={120} autoComplete="organization" />
        {err.company_name && <p className="mt-2 text-[14px] text-[#b3261e]">{err.company_name}</p>}
        <p className="field-hint">This is the name job seekers see on your jobs.</p>
      </div>
      <div>
        <label htmlFor="contact_name" className="field-label">
          Your name
        </label>
        <input id="contact_name" name="contact_name" className="field" defaultValue={props.contact} required maxLength={80} autoComplete="name" />
        {err.contact_name && <p className="mt-2 text-[14px] text-[#b3261e]">{err.contact_name}</p>}
      </div>
      <div>
        <label htmlFor="website" className="field-label">
          Company website <span className="font-normal text-mute">(optional)</span>
        </label>
        <input id="website" name="website" className="field" defaultValue={props.website} maxLength={300} placeholder="www.yourcompany.co.uk" inputMode="url" />
        {err.website && <p className="mt-2 text-[14px] text-[#b3261e]">{err.website}</p>}
      </div>
      <div className="rounded-2xl bg-cloud p-4">
        <label className="flex gap-3 text-[15px] leading-snug text-ink">
          <input type="checkbox" name="terms" className="mt-1 h-4 w-4 shrink-0 accent-[#0071e3]" />
          <span>
            I agree to the{" "}
            <Link href="/terms#employers" className="text-link hover:underline" target="_blank">
              employer terms
            </Link>
            , including that I will use candidates&apos; details only to recruit for the role they applied to or agreed to discuss, and that my jobs will
            follow UK employment and equality law.
          </span>
        </label>
        {err.terms && <p className="mt-2 text-[14px] text-[#b3261e]">{err.terms}</p>}
      </div>
      {state.message && !state.ok && (
        <p role="alert" className="text-[14px] text-[#b3261e]">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Saving..." : "Continue to your dashboard"}
      </button>
    </form>
  );
}
