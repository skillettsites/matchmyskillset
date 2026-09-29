"use client";

// Editing controls for a job pack: every section of the tailored CV, the
// interview prep, and small shared pieces. Plain controlled inputs; the pack
// page saves the whole object.

import { useState } from "react";
import type { CvEducation, CvRole, CvSection, InterviewPrep, TailoredCv } from "@/lib/candidate/pack-types";

/** Rows for browsers that cannot size a textarea to its content (CSS field-sizing). */
function rowsFor(text: string, min = 2, perRow = 80): number {
  return Math.min(14, Math.max(min, Math.ceil((text.length || 1) / perRow) + text.split("\n").length - 1));
}

export function Area({ id, label, value, onChange, min = 2, className = "", hint }: { id: string; label: string; value: string; onChange: (v: string) => void; min?: number; className?: string; hint?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label !text-[13px]">
        {label}
      </label>
      <textarea id={id} className="field resize-y !py-2.5 !text-[15px] leading-relaxed [field-sizing:content]" style={{ minHeight: `${min * 1.65 + 1.3}em` }} rows={rowsFor(value, min, 60)} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function Input({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label !text-[13px]">
        {label}
      </label>
      <input id={id} className="field !py-2.5 !text-[15px]" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mute hover:bg-cloud hover:text-ink disabled:opacity-30">
      {children}
    </button>
  );
}

const Up = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 15l6-6 6 6" />
  </svg>
);
const Down = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

function move<T>(list: T[], i: number, by: number): T[] {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function set<T>(list: T[], i: number, value: T): T[] {
  return list.map((x, k) => (k === i ? value : x));
}

function drop<T>(list: T[], i: number): T[] {
  return list.filter((_, k) => k !== i);
}

/** A list of one-line strings with move, remove and add. */
function LineList({ idBase, label, items, onChange, addLabel, multiline = false }: { idBase: string; label: string; items: string[]; onChange: (v: string[]) => void; addLabel: string; multiline?: boolean }) {
  return (
    <div>
      <p className="field-label !text-[13px]">{label}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-mute-2" aria-hidden="true" />
            {multiline ? (
              <textarea
                aria-label={`${label} ${i + 1}`}
                id={`${idBase}-${i}`}
                className="field ml-2 resize-y !py-2 !text-[15px] leading-relaxed [field-sizing:content]"
                rows={rowsFor(item, 1, 45)}
                value={item}
                onChange={(e) => onChange(set(items, i, e.target.value))}
              />
            ) : (
              <input aria-label={`${label} ${i + 1}`} id={`${idBase}-${i}`} className="field ml-2 !py-2 !text-[15px]" value={item} onChange={(e) => onChange(set(items, i, e.target.value))} />
            )}
            <IconButton label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, -1))}>
              <Up />
            </IconButton>
            <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))}>
              <Down />
            </IconButton>
            <IconButton label="Remove" onClick={() => onChange(drop(items, i))}>
              <Cross />
            </IconButton>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-2 text-[14px] font-medium text-link hover:underline" onClick={() => onChange([...items, ""])}>
        + {addLabel}
      </button>
    </div>
  );
}

function SkillChips({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !items.some((s) => s.toLowerCase() === v.toLowerCase())) onChange([...items, v]);
    setDraft("");
  }
  return (
    <div>
      <p className="field-label !text-[13px]">Key skills</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((s, i) => (
          <li key={`${s}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-cloud py-1 pl-3 pr-1 text-[14px] text-ink">
            {s}
            <button type="button" aria-label={`Remove ${s}`} className="grid h-6 w-6 place-items-center rounded-full text-mute hover:bg-white hover:text-ink" onClick={() => onChange(drop(items, i))}>
              <Cross />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          aria-label="Add a skill"
          className="field !py-2 !text-[15px]"
          placeholder="Add a skill your CV shows"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

function RoleEditor({ role, i, count, onChange, onMove, onRemove }: { role: CvRole; i: number; count: number; onChange: (r: CvRole) => void; onMove: (by: number) => void; onRemove: () => void }) {
  return (
    <div className="rounded-2xl border border-hair p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold text-ink">{role.title || role.employer || `Job ${i + 1}`}</p>
        <div className="flex">
          <IconButton label="Move this job up" disabled={i === 0} onClick={() => onMove(-1)}>
            <Up />
          </IconButton>
          <IconButton label="Move this job down" disabled={i === count - 1} onClick={() => onMove(1)}>
            <Down />
          </IconButton>
          <IconButton label="Remove this job" onClick={onRemove}>
            <Cross />
          </IconButton>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Input id={`role-${i}-title`} label="Job title" value={role.title} onChange={(v) => onChange({ ...role, title: v })} />
        <Input id={`role-${i}-employer`} label="Employer" value={role.employer} onChange={(v) => onChange({ ...role, employer: v })} />
        <Input id={`role-${i}-dates`} label="Dates" value={role.dates} onChange={(v) => onChange({ ...role, dates: v })} placeholder="2019 to 2024" />
        <Input id={`role-${i}-location`} label="Place" value={role.location} onChange={(v) => onChange({ ...role, location: v })} />
      </div>
      <div className="mt-4">
        <LineList idBase={`role-${i}-b`} label="What you did" items={role.bullets} onChange={(b) => onChange({ ...role, bullets: b })} addLabel="Add a line" multiline />
      </div>
    </div>
  );
}

export function CvEditor({ cv, onChange }: { cv: TailoredCv; onChange: (cv: TailoredCv) => void }) {
  const c = cv.contact;
  const edu = (i: number, e: CvEducation) => onChange({ ...cv, education: set(cv.education, i, e) });
  const sec = (i: number, s: CvSection) => onChange({ ...cv, otherSections: set(cv.otherSections, i, s) });
  return (
    <div className="space-y-8">
      <section aria-labelledby="ed-contact">
        <h3 id="ed-contact" className="text-[17px] font-semibold text-ink">
          Name and contact details
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input id="c-name" label="Name" value={c.name ?? ""} onChange={(v) => onChange({ ...cv, contact: { ...c, name: v || null } })} />
          <Input id="c-location" label="Town or city" value={c.location ?? ""} onChange={(v) => onChange({ ...cv, contact: { ...c, location: v || null } })} />
          <Input id="c-email" label="Email" value={c.email ?? ""} onChange={(v) => onChange({ ...cv, contact: { ...c, email: v || null } })} />
          <Input id="c-phone" label="Phone" value={c.phone ?? ""} onChange={(v) => onChange({ ...cv, contact: { ...c, phone: v || null } })} />
        </div>
        <div className="mt-3">
          <Input id="c-links" label="Links (LinkedIn, website), separated by commas" value={c.links.join(", ")} onChange={(v) => onChange({ ...cv, contact: { ...c, links: v.split(",").map((s) => s.trim()).filter(Boolean) } })} />
        </div>
      </section>

      <section aria-labelledby="ed-profile">
        <h3 id="ed-profile" className="text-[17px] font-semibold text-ink">
          Profile
        </h3>
        <Area id="cv-summary" label="A short profile at the top of your CV" value={cv.summary} onChange={(v) => onChange({ ...cv, summary: v })} min={4} className="mt-3" />
      </section>

      <section aria-labelledby="ed-skills">
        <h3 id="ed-skills" className="text-[17px] font-semibold text-ink">
          Skills
        </h3>
        <div className="mt-3">
          <SkillChips items={cv.keySkills} onChange={(v) => onChange({ ...cv, keySkills: v })} />
        </div>
      </section>

      <section aria-labelledby="ed-exp">
        <h3 id="ed-exp" className="text-[17px] font-semibold text-ink">
          Experience
        </h3>
        <div className="mt-3 space-y-4">
          {cv.experience.map((r, i) => (
            <RoleEditor
              key={i}
              role={r}
              i={i}
              count={cv.experience.length}
              onChange={(nr) => onChange({ ...cv, experience: set(cv.experience, i, nr) })}
              onMove={(by) => onChange({ ...cv, experience: move(cv.experience, i, by) })}
              onRemove={() => onChange({ ...cv, experience: drop(cv.experience, i) })}
            />
          ))}
          <button type="button" className="text-[14px] font-medium text-link hover:underline" onClick={() => onChange({ ...cv, experience: [...cv.experience, { title: "", employer: "", location: "", dates: "", bullets: [""] }] })}>
            + Add a job
          </button>
        </div>
      </section>

      <section aria-labelledby="ed-edu">
        <h3 id="ed-edu" className="text-[17px] font-semibold text-ink">
          Education
        </h3>
        <div className="mt-3 space-y-3">
          {cv.education.map((e, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-[1.4fr_1.2fr_0.8fr]">
                <Input id={`edu-${i}-q`} label="Qualification" value={e.qualification} onChange={(v) => edu(i, { ...e, qualification: v })} />
                <Input id={`edu-${i}-i`} label="Where" value={e.institution} onChange={(v) => edu(i, { ...e, institution: v })} />
                <Input id={`edu-${i}-d`} label="Dates" value={e.dates} onChange={(v) => edu(i, { ...e, dates: v })} />
              </div>
              <IconButton label="Remove this qualification" onClick={() => onChange({ ...cv, education: drop(cv.education, i) })}>
                <Cross />
              </IconButton>
            </div>
          ))}
          <button type="button" className="text-[14px] font-medium text-link hover:underline" onClick={() => onChange({ ...cv, education: [...cv.education, { qualification: "", institution: "", dates: "" }] })}>
            + Add a qualification
          </button>
        </div>
      </section>

      <section aria-labelledby="ed-cert">
        <h3 id="ed-cert" className="sr-only">
          Certifications
        </h3>
        <LineList idBase="cert" label="Certifications, licences and tickets" items={cv.certifications} onChange={(v) => onChange({ ...cv, certifications: v })} addLabel="Add a certificate" />
      </section>

      {cv.otherSections.map((s, i) => (
        <section key={i} aria-label={s.heading || "Other section"}>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input id={`sec-${i}-h`} label="Section heading" value={s.heading} onChange={(v) => sec(i, { ...s, heading: v })} />
            </div>
            <IconButton label="Remove this section" onClick={() => onChange({ ...cv, otherSections: drop(cv.otherSections, i) })}>
              <Cross />
            </IconButton>
          </div>
          <div className="mt-3">
            <LineList idBase={`sec-${i}`} label={s.heading || "Items"} items={s.items} onChange={(v) => sec(i, { ...s, items: v })} addLabel="Add a line" />
          </div>
        </section>
      ))}
    </div>
  );
}

export function PrepEditor({ prep, onChange }: { prep: InterviewPrep; onChange: (p: InterviewPrep) => void }) {
  return (
    <div className="space-y-5">
      <ol className="space-y-4">
        {prep.questions.map((q, i) => (
          <li key={i} className="rounded-2xl border border-hair p-4 sm:p-5">
            <div className="flex items-start gap-2">
              <span className="mt-2 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cloud text-[13px] font-semibold text-ink" aria-hidden="true">
                {i + 1}
              </span>
              <div className="flex-1 space-y-3">
                <Area id={`q-${i}`} label="Question they may ask" value={q.question} onChange={(v) => onChange({ ...prep, questions: set(prep.questions, i, { ...q, question: v }) })} min={1} />
                {q.whyTheyAsk && <p className="text-[14px] italic text-mute">Why they ask: {q.whyTheyAsk}</p>}
                <Area
                  id={`a-${i}`}
                  label="Points you could make (one per line)"
                  value={q.answerPoints.join("\n")}
                  onChange={(v) => onChange({ ...prep, questions: set(prep.questions, i, { ...q, answerPoints: v.split("\n") }) })}
                  min={3}
                />
              </div>
              <IconButton label="Remove this question" onClick={() => onChange({ ...prep, questions: drop(prep.questions, i) })}>
                <Cross />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      <LineList idBase="ask" label="Questions to ask them" items={prep.questionsToAsk} onChange={(v) => onChange({ ...prep, questionsToAsk: v })} addLabel="Add a question" multiline />
    </div>
  );
}
