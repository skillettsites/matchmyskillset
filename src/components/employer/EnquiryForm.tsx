"use client";

import { useActionState } from "react";
import { useKeepValues } from "@/components/employer/useKeepValues";
import { sendEnquiryAction, type EnquiryState } from "@/app/employers/actions";
import { ENQUIRY_INTERESTS } from "@/lib/employer/plans";

// Enquiry form for Enterprise, pay per hire and anything else. Sends an email
// to the jobs inbox (reply goes straight to the sender) and a Telegram alert.

export function EnquiryForm({ defaultInterest = "Enterprise" }: { defaultInterest?: string }) {
  const [state, action, pending] = useActionState<EnquiryState | null, FormData>(sendEnquiryAction, null);
  const keep = useKeepValues(action);

  if (state?.ok) {
    return (
      <div className="card-white p-8 text-center" role="status">
        <p className="title">Message sent.</p>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-mute">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={keep} className="card-white grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <div>
        <label htmlFor="enq-name" className="field-label">
          Your name
        </label>
        <input id="enq-name" name="name" className="field" autoComplete="name" required maxLength={80} />
      </div>
      <div>
        <label htmlFor="enq-email" className="field-label">
          Work email
        </label>
        <input id="enq-email" name="email" type="email" className="field" autoComplete="email" required maxLength={254} />
      </div>
      <div>
        <label htmlFor="enq-company" className="field-label">
          Company
        </label>
        <input id="enq-company" name="company" className="field" autoComplete="organization" required maxLength={120} />
      </div>
      <div>
        <label htmlFor="enq-interest" className="field-label">
          Interested in
        </label>
        <select id="enq-interest" name="interest" className="field" defaultValue={defaultInterest}>
          {ENQUIRY_INTERESTS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="enq-message" className="field-label">
          What are you hiring for?
        </label>
        <textarea
          id="enq-message"
          name="message"
          className="field min-h-[120px]"
          maxLength={2000}
          placeholder="Roles, locations, how many hires a year, and anything else we should know."
        />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="enq-site">Leave this empty</label>
        <input id="enq-site" name="company_site" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-mute">We use these details only to reply to you.</p>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sending..." : "Send message"}
        </button>
      </div>
      {state && !state.ok && (
        <p role="alert" className="text-[14px] text-[#b3261e] sm:col-span-2">
          {state.message}
        </p>
      )}
    </form>
  );
}
