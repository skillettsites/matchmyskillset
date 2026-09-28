"use client";

import { useActionState } from "react";
import { useKeepValues } from "@/components/employer/useKeepValues";
import { saveAccountDetails, saveCompanyPage, type FormState } from "@/app/employers/dashboard/actions";

function Result({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`text-[14px] ${state.ok ? "text-green" : "text-[#b3261e]"}`}>
      {state.message}
    </p>
  );
}

export function AccountDetailsForm({ company, contact, website, email }: { company: string; contact: string; website: string; email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAccountDetails, {});
  const keep = useKeepValues(action);
  const err = state.errors ?? {};
  return (
    <form onSubmit={keep} className="card-white space-y-5 p-6 sm:p-8">
      <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink">Account details</h2>
      <p className="text-[14px] text-mute">
        Signed in as <strong className="text-ink">{email}</strong>. We send sign-in links and applicant emails here.
      </p>
      <div>
        <label htmlFor="acc-company" className="field-label">
          Company name
        </label>
        <input id="acc-company" name="company_name" defaultValue={company} className="field" maxLength={120} required />
        {err.company_name && <p className="mt-2 text-[14px] text-[#b3261e]">{err.company_name}</p>}
      </div>
      <div>
        <label htmlFor="acc-contact" className="field-label">
          Your name
        </label>
        <input id="acc-contact" name="contact_name" defaultValue={contact} className="field" maxLength={80} required />
        {err.contact_name && <p className="mt-2 text-[14px] text-[#b3261e]">{err.contact_name}</p>}
      </div>
      <div>
        <label htmlFor="acc-site" className="field-label">
          Website
        </label>
        <input id="acc-site" name="website" defaultValue={website} className="field" maxLength={300} inputMode="url" placeholder="www.yourcompany.co.uk" />
        {err.website && <p className="mt-2 text-[14px] text-[#b3261e]">{err.website}</p>}
      </div>
      <Result state={state} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving..." : "Save details"}
      </button>
    </form>
  );
}

export function CompanyPageForm({ description, publicUrl }: { description: string; publicUrl: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCompanyPage, {});
  const keep = useKeepValues(action);
  const err = state.errors ?? {};
  return (
    <form onSubmit={keep} className="card-white space-y-5 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink">Company page</h2>
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noopener" className="text-[14px] text-link hover:underline">
            View your page
          </a>
        )}
      </div>
      <p className="text-[14px] text-mute">A public page with your company name, this description, your website and every live job.</p>
      <div>
        <label htmlFor="company_description" className="field-label">
          About your company
        </label>
        <textarea
          id="company_description"
          name="company_description"
          defaultValue={description}
          className="field min-h-[200px] !text-[16px] leading-relaxed"
          maxLength={2000}
          placeholder="What you do, where you are, what it is like to work with you."
        />
        {err.company_description && <p className="mt-2 text-[14px] text-[#b3261e]">{err.company_description}</p>}
      </div>
      <Result state={state} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving..." : publicUrl ? "Save page" : "Publish page"}
      </button>
    </form>
  );
}
