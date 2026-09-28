"use client";

import { useActionState, useState } from "react";
import { useKeepValues } from "@/components/employer/useKeepValues";
import { requestContact, type ContactState } from "@/app/employers/dashboard/actions";

// "Request contact" on an anonymous candidate card. The candidate gets an
// email and decides; nothing about them is shared unless they accept.

export function ContactRequestForm({ candidateId, jobs, defaultJobId }: { candidateId: string; jobs: { id: string; title: string }[]; defaultJobId?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ContactState | null, FormData>(requestContact, null);
  const keep = useKeepValues(action);

  if (state?.ok) {
    return (
      <p role="status" className="rounded-2xl bg-[#e8f6ec] px-4 py-3 text-[14px] leading-snug text-[#1d7f37]">
        {state.message}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm">
        Request contact
      </button>
    );
  }

  return (
    <form onSubmit={keep} className="space-y-3 rounded-2xl bg-cloud p-4">
      <input type="hidden" name="candidate_id" value={candidateId} />
      {jobs.length > 0 && (
        <div>
          <label htmlFor={`job-${candidateId}`} className="field-label !text-[13px]">
            About which job?
          </label>
          <select id={`job-${candidateId}`} name="job_id" className="field !py-2.5 !text-[15px]" defaultValue={defaultJobId ?? ""}>
            <option value="">No particular job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor={`msg-${candidateId}`} className="field-label !text-[13px]">
          Message <span className="font-normal text-mute">(optional)</span>
        </label>
        <textarea
          id={`msg-${candidateId}`}
          name="message"
          maxLength={1000}
          className="field min-h-[96px] !text-[15px]"
          placeholder="Say why you would like to talk. They see this with your company name."
        />
      </div>
      <p className="text-[12px] leading-snug text-mute">We email them your company name, the job and your message. If they accept, you get their name, email address and CV.</p>
      {state && !state.ok && (
        <p role="alert" className="text-[14px] text-[#b3261e]">
          {state.message}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "Sending..." : "Send request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-sm text-mute">
          Cancel
        </button>
      </div>
    </form>
  );
}
