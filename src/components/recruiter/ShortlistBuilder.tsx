"use client";

import { createContext, useActionState, useContext, useMemo, useState, type ReactNode } from "react";
import { saveShortlist, type SaveState } from "@/app/recruiter/actions";
import { useKeepValues } from "@/components/employer/useKeepValues";

// The recruiter's shortlist while it is being put together. The people to
// choose from are rendered on the server (with CVs); each has a PickButton,
// and ShortlistPanel shows the picks in order with a note on each, then saves
// or sends them through saveShortlist. The server re-checks everything.

export type PickKind = "application" | "candidate";

export interface PickMeta {
  kind: PickKind;
  id: string;
  label: string;
  sub: string;
}

interface Pick extends PickMeta {
  note: string;
}

interface Ctx {
  picks: Pick[];
  max: number;
  has: (kind: PickKind, id: string) => boolean;
  toggle: (meta: PickMeta) => void;
  move: (index: number, by: -1 | 1) => void;
  remove: (index: number) => void;
  setNote: (index: number, note: string) => void;
}

const ShortlistContext = createContext<Ctx | null>(null);

function useShortlist(): Ctx {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("ShortlistProvider is missing");
  return ctx;
}

export function ShortlistProvider({ initial, max, children }: { initial: Pick[]; max: number; children: ReactNode }) {
  const [picks, setPicks] = useState<Pick[]>(initial);
  const value = useMemo<Ctx>(
    () => ({
      picks,
      max,
      has: (kind, id) => picks.some((p) => p.kind === kind && p.id === id),
      toggle: (meta) =>
        setPicks((prev) =>
          prev.some((p) => p.kind === meta.kind && p.id === meta.id)
            ? prev.filter((p) => !(p.kind === meta.kind && p.id === meta.id))
            : prev.length >= max
              ? prev
              : [...prev, { ...meta, note: "" }]
        ),
      move: (index, by) =>
        setPicks((prev) => {
          const to = index + by;
          if (to < 0 || to >= prev.length) return prev;
          const next = [...prev];
          [next[index], next[to]] = [next[to], next[index]];
          return next;
        }),
      remove: (index) => setPicks((prev) => prev.filter((_, i) => i !== index)),
      setNote: (index, note) => setPicks((prev) => prev.map((p, i) => (i === index ? { ...p, note } : p))),
    }),
    [picks, max]
  );
  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function PickButton({ meta }: { meta: PickMeta }) {
  const { has, toggle, picks, max } = useShortlist();
  const picked = has(meta.kind, meta.id);
  const full = !picked && picks.length >= max;
  return (
    <button
      type="button"
      onClick={() => toggle(meta)}
      disabled={full}
      aria-pressed={picked}
      className={`btn btn-sm shrink-0 ${picked ? "btn-secondary" : "btn-primary"}`}
      title={full ? `A shortlist can have up to ${max} people` : undefined}
    >
      {picked ? `On shortlist (#${picks.findIndex((p) => p.kind === meta.kind && p.id === meta.id) + 1}): remove` : "Add to shortlist"}
    </button>
  );
}

const ANON_HINT =
  "The employer reads this before they know who this is. Do not include their name, employers they worked for, contact details or links: we remove emails, phone numbers, links and their first name anyway.";

export function ShortlistPanel({
  shortlistId,
  recruiterName,
  summary,
  noteMax,
  summaryMax,
}: {
  shortlistId: string;
  recruiterName: string;
  summary: string;
  noteMax: number;
  summaryMax: number;
}) {
  const { picks, move, remove, setNote, max } = useShortlist();
  const [state, action, pending] = useActionState<SaveState | null, FormData>(saveShortlist, null);
  const keep = useKeepValues(action);
  const items = JSON.stringify(picks.map((p) => ({ kind: p.kind, id: p.id, note: p.note })));

  return (
    <form
      onSubmit={(e) => {
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (submitter?.value === "send" && !window.confirm("Send this shortlist to the employer now? You cannot change it afterwards.")) {
          e.preventDefault();
          return;
        }
        keep(e);
      }}
      className="card-white space-y-5 p-6"
    >
      <input type="hidden" name="shortlist_id" value={shortlistId} />
      <input type="hidden" name="items" value={items} />
      <div>
        <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink">Your shortlist</h2>
        <p className="mt-1 text-[13px] leading-snug text-mute">
          Best fit first. {picks.length} of up to {max}. The employer sees nothing until you send it.
        </p>
      </div>

      {picks.length === 0 ? (
        <p className="rounded-2xl bg-cloud px-4 py-5 text-center text-[14px] text-mute">Use &ldquo;Add to shortlist&rdquo; on the people below.</p>
      ) : (
        <ol className="space-y-3">
          {picks.map((p, i) => (
            <li key={`${p.kind}:${p.id}`} className="rounded-2xl border border-hair p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink">{p.label}</p>
                  <p className="text-[12px] text-mute">{p.sub}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" className="btn btn-secondary btn-sm !px-2.5" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${p.label} up`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm !px-2.5"
                    onClick={() => move(i, 1)}
                    disabled={i === picks.length - 1}
                    aria-label={`Move ${p.label} down`}
                  >
                    ↓
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm !px-2.5" onClick={() => remove(i)} aria-label={`Remove ${p.label}`}>
                    ✕
                  </button>
                </div>
              </div>
              <label htmlFor={`note-${p.kind}-${p.id}`} className="field-label !mt-3 !text-[13px]">
                Note for the employer
              </label>
              <textarea
                id={`note-${p.kind}-${p.id}`}
                className="field min-h-[88px] !text-[14px]"
                value={p.note}
                maxLength={noteMax}
                onChange={(e) => setNote(i, e.target.value)}
                placeholder={p.kind === "candidate" ? "Why they fit: skills, experience, what to ask them about." : "Why they fit, and anything to follow up on."}
              />
              {p.kind === "candidate" && <p className="mt-1 text-[12px] leading-snug text-[#8a5300]">{ANON_HINT}</p>}
            </li>
          ))}
        </ol>
      )}

      <div>
        <label htmlFor="summary" className="field-label !text-[13px]">
          Summary for the employer <span className="font-normal text-mute">(optional)</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          className="field min-h-[110px] !text-[14px]"
          defaultValue={summary}
          maxLength={summaryMax}
          placeholder="The overall picture: how strong the field is, who to call first, anything the advert could change."
        />
        <p className="mt-1 text-[12px] leading-snug text-mute">Emailed to the employer. Never name or describe how to identify people who have not applied.</p>
      </div>
      <div>
        <label htmlFor="recruiter_name" className="field-label !text-[13px]">
          Your name, as the employer will see it
        </label>
        <input id="recruiter_name" name="recruiter_name" className="field !text-[15px]" defaultValue={recruiterName} maxLength={80} placeholder="Your first name" />
      </div>

      {state && (
        <p role={state.ok ? "status" : "alert"} className={`text-[14px] leading-snug ${state.ok ? "text-[#1d7f37]" : "text-[#b3261e]"}`}>
          {state.message}
        </p>
      )}
      <div className="grid gap-2">
        <button type="submit" name="intent" value="send" className="btn btn-primary w-full" disabled={pending || picks.length === 0}>
          {pending ? "Working..." : "Send shortlist to the employer"}
        </button>
        <button type="submit" name="intent" value="save" className="btn btn-secondary w-full" disabled={pending}>
          Save and carry on later
        </button>
      </div>
    </form>
  );
}

/** A submit button that asks first (for cancelling a request, which cannot be undone here). */
export function ConfirmSubmit({ label, message, className = "btn btn-secondary btn-sm" }: { label: string; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
