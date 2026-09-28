"use client";

import { useActionState, useMemo, useState } from "react";
import { saveJob, type JobFormState } from "@/app/employers/dashboard/actions";
import { skillsInText } from "@/lib/skills/text-skills";
import { skillName } from "@/lib/skills/taxonomy";

export interface JobFormValues {
  id?: string;
  status?: string;
  title: string;
  location: string;
  remote: string;
  salary_min: string;
  salary_max: string;
  salary_period: string;
  contract_type: string;
  hours: string;
  description: string;
  apply_method: string;
  apply_url: string;
  apply_email: string;
}

export const EMPTY_JOB: JobFormValues = {
  title: "",
  location: "",
  remote: "onsite",
  salary_min: "",
  salary_max: "",
  salary_period: "year",
  contract_type: "permanent",
  hours: "full_time",
  description: "",
  apply_method: "mms",
  apply_url: "",
  apply_email: "",
};

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-2 text-[14px] text-[#b3261e]">{msg}</p> : null;
}

export function JobForm({ initial, canSubmit, blocker }: { initial: JobFormValues; canSubmit: boolean; blocker: string | null }) {
  const [v, setV] = useState<JobFormValues>(initial);
  const [state, action, pending] = useActionState<JobFormState, FormData>(saveJob, { errors: {} });
  const set = (k: keyof JobFormValues) => (e: { target: { value: string } }) => setV((prev) => ({ ...prev, [k]: e.target.value }));
  const err = state.errors;
  const isLive = initial.status === "live";

  const found = useMemo(() => {
    if (v.description.length < 40 && v.title.length < 3) return [];
    return skillsInText(v.description, v.title)
      .slice(0, 25)
      .map((h) => ({ id: h.id, name: skillName(h.id), inTitle: h.inTitle }));
  }, [v.description, v.title]);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="space-y-6">
        {initial.id && <input type="hidden" name="id" value={initial.id} />}

        <section className="card-white space-y-5 p-6 sm:p-8">
          <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink">The job</h2>
          <div>
            <label htmlFor="title" className="field-label">
              Job title
            </label>
            <input id="title" name="title" className="field" value={v.title} onChange={set("title")} maxLength={120} required placeholder="For example: Customer service team leader" />
            <Err msg={err.title} />
          </div>
          <div>
            <span className="field-label">Where</span>
            <div className="segmented" role="group" aria-label="Where the work is done">
              {[
                ["onsite", "On site"],
                ["hybrid", "Hybrid"],
                ["remote", "Remote"],
              ].map(([value, label]) => (
                <button key={value} type="button" aria-pressed={v.remote === value} onClick={() => setV((p) => ({ ...p, remote: value }))}>
                  {label}
                </button>
              ))}
            </div>
            <input type="hidden" name="remote" value={v.remote} />
          </div>
          <div>
            <label htmlFor="location" className="field-label">
              Location {v.remote === "remote" && <span className="font-normal text-mute">(optional for remote jobs)</span>}
            </label>
            <input id="location" name="location" className="field" value={v.location} onChange={set("location")} maxLength={120} placeholder="Town, city or postcode, for example Leeds LS1" />
            <Err msg={err.location} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="salary_min" className="field-label">
                Pay from (£)
              </label>
              <input id="salary_min" name="salary_min" className="field" inputMode="decimal" value={v.salary_min} onChange={set("salary_min")} placeholder="28000" />
              <Err msg={err.salary_min} />
            </div>
            <div>
              <label htmlFor="salary_max" className="field-label">
                Pay to (£)
              </label>
              <input id="salary_max" name="salary_max" className="field" inputMode="decimal" value={v.salary_max} onChange={set("salary_max")} placeholder="32000" />
              <Err msg={err.salary_max} />
            </div>
            <div>
              <label htmlFor="salary_period" className="field-label">
                Per
              </label>
              <select id="salary_period" name="salary_period" className="field" value={v.salary_period} onChange={set("salary_period")}>
                <option value="year">Year</option>
                <option value="day">Day</option>
                <option value="hour">Hour</option>
              </select>
            </div>
          </div>
          <p className="field-hint !mt-2">Showing pay helps people decide whether the job is for them. Leave both blank if you would rather not say.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contract_type" className="field-label">
                Contract
              </label>
              <select id="contract_type" name="contract_type" className="field" value={v.contract_type} onChange={set("contract_type")}>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
                <option value="apprenticeship">Apprenticeship</option>
              </select>
            </div>
            <div>
              <label htmlFor="hours" className="field-label">
                Hours
              </label>
              <select id="hours" name="hours" className="field" value={v.hours} onChange={set("hours")}>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="field-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="field min-h-[280px] !text-[16px] leading-relaxed"
              value={v.description}
              onChange={set("description")}
              maxLength={10000}
              required
              placeholder={"What the person will do day to day, the skills and experience you need, what you offer, and anything about the team.\n\nName the skills plainly (for example \"customer service\", \"Excel\", \"team leadership\"): we match on them."}
            />
            <div className="mt-2 flex justify-between gap-4">
              <Err msg={err.description} />
              <span className="ml-auto shrink-0 text-[12px] text-mute">{v.description.length.toLocaleString("en-GB")} / 10,000</span>
            </div>
          </div>
        </section>

        <section className="card-white space-y-5 p-6 sm:p-8">
          <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink">How people apply</h2>
          <div className="space-y-3">
            {[
              ["mms", "Through MatchMySkillset", "Applicants send their CV and a note. You see them in your dashboard, with a match score, and we email you each one."],
              ["url", "On my own website", "We send people to your application page."],
              ["email", "By email", "People email their application to an address you choose."],
            ].map(([value, label, hint]) => (
              <label key={value} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${v.apply_method === value ? "border-blue bg-[#f5f9ff]" : "border-hair"}`}>
                <input
                  type="radio"
                  name="apply_method"
                  value={value}
                  checked={v.apply_method === value}
                  onChange={set("apply_method")}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#0071e3]"
                />
                <span>
                  <span className="block text-[16px] font-semibold text-ink">
                    {label}
                    {value === "mms" && <span className="ml-2 text-[12px] font-semibold text-blue">Recommended</span>}
                  </span>
                  <span className="mt-0.5 block text-[14px] leading-snug text-mute">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          {v.apply_method === "url" && (
            <div>
              <label htmlFor="apply_url" className="field-label">
                Application page link
              </label>
              <input id="apply_url" name="apply_url" className="field" value={v.apply_url} onChange={set("apply_url")} inputMode="url" placeholder="https://careers.yourcompany.co.uk/job/123" />
              <Err msg={err.apply_url} />
            </div>
          )}
          {v.apply_method === "email" && (
            <div>
              <label htmlFor="apply_email" className="field-label">
                Send applications to
              </label>
              <input id="apply_email" name="apply_email" type="email" className="field" value={v.apply_email} onChange={set("apply_email")} placeholder="jobs@yourcompany.co.uk" />
              <Err msg={err.apply_email} />
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="card-white p-6">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">Skills we found</h2>
          <p className="mt-1 text-[13px] leading-snug text-mute">We match your job to CVs on these. Skills in the title count double.</p>
          {found.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {found.map((s) => (
                <span key={s.id} className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${s.inTitle ? "bg-blue text-white" : "bg-[#e8f1fd] text-[#0058b0]"}`}>
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[14px] text-mute">Start writing the description and the skills appear here.</p>
          )}
          {found.length > 0 && found.length < 4 && <p className="mt-3 text-[13px] text-[#8a5300]">Only a few skills so far. Naming more of the skills you need gives better matches.</p>}
        </div>

        <div className="card-white space-y-3 p-6">
          {isLive && <p className="text-[13px] leading-snug text-[#8a5300]">This job is live. Saving changes sends it back for a quick check, and it is off the site until we approve it.</p>}
          {!canSubmit && blocker && <p className="text-[13px] leading-snug text-[#8a5300]">{blocker}</p>}
          {state.message && (
            <p role="alert" className="text-[14px] text-[#b3261e]">
              {state.message}
            </p>
          )}
          <button type="submit" name="intent" value="submit" className="btn btn-primary w-full" disabled={pending || !canSubmit}>
            {pending ? "Saving..." : isLive ? "Save and resubmit" : "Submit for approval"}
          </button>
          <button type="submit" name="intent" value="draft" className="btn btn-secondary w-full" disabled={pending}>
            {isLive ? "Save as draft (takes it off the site)" : "Save draft"}
          </button>
          <p className="text-center text-[12px] leading-snug text-mute">A person checks every job before it goes live. Once approved it runs for 30 days.</p>
        </div>
      </aside>
    </form>
  );
}
