"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SELECT_CHEVRON_STYLE } from "@/components/jobs/format";

export interface ProfileView {
  firstName: string | null;
  email: string;
  headline: string;
  currentRole: string;
  location: string;
  region: string;
  years: string;
  skills: string[];
  hasCv: boolean;
  cvPreview: string;
  discoverable: boolean;
  confirmed: boolean;
  expires: string | null;
}

async function post(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/candidates/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: res.ok, error: data.error };
  } catch {
    return { ok: false, error: "We could not reach the server. Please try again." };
  }
}

function Note({ ok, text }: { ok: boolean; text: string }) {
  if (!text) return null;
  return (
    <p role={ok ? "status" : "alert"} className={`mt-3 rounded-xl px-3 py-2 text-[14px] ${ok ? "bg-green-soft text-ink" : "bg-[#fff2f2] text-[#b3261e]"}`}>
      {text}
    </p>
  );
}

export function ProfileManager({
  token,
  initial,
  askConfirm,
  regions,
  allSkills,
}: {
  token: string;
  initial: ProfileView;
  askConfirm: boolean;
  regions: string[];
  allSkills: { id: string; name: string }[];
}) {
  const names = useMemo(() => new Map(allSkills.map((s) => [s.id, s.name])), [allSkills]);
  const [p, setP] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string; where: string }>({ ok: true, text: "", where: "" });
  const [deleted, setDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addSkill, setAddSkill] = useState("");
  const [cvDraft, setCvDraft] = useState("");
  const [cvOpen, setCvOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function act(where: string, body: Record<string, unknown>, onOk: () => void, okText: string) {
    setBusy(true);
    setNote({ ok: true, text: "", where });
    const r = await post({ token, ...body });
    setBusy(false);
    if (!r.ok) {
      setNote({ ok: false, text: r.error ?? "Something went wrong. Please try again.", where });
      return;
    }
    onOk();
    setNote({ ok: true, text: okText, where });
  }

  async function readFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        setNote({ ok: false, text: data.error || "We could not read that file.", where: "cv" });
        return;
      }
      setCvDraft(data.text);
      setCvOpen(true);
    } catch {
      setNote({ ok: false, text: "We could not upload that file.", where: "cv" });
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  if (deleted) {
    return (
      <div className="card-white p-6" role="status">
        <p className="title">Everything is deleted</p>
        <p className="mt-2 text-[17px] text-ink-2">
          We have deleted your profile, your CV, our copies of your applications, any contact requests and any job alerts sent to {p.email}. Employers you already
          applied to or accepted keep the copy we sent them, under their own privacy policies.
        </p>
        <Link href="/" className="btn btn-secondary btn-sm mt-5">
          Back to MatchMySkillset
        </Link>
      </div>
    );
  }

  // The on/off status and its switch are always shown, whatever link was used to get here.
  const showConfirm = !p.discoverable;

  return (
    <div className="space-y-5">
      {showConfirm && (
        <div className="card-white p-6 ring-2 ring-blue/25">
          <p className="title !text-[24px]">{p.confirmed ? "Your profile is switched off" : askConfirm ? "Switch on your profile" : "Your profile is not switched on yet"}</p>
          <p className="mt-2 text-[15px] text-ink-2">
            {p.confirmed
              ? "Employers cannot find you at the moment. Switch it back on whenever you like."
              : "Your profile is hidden until you switch it on. Once it is on, employers on MatchMySkillset can see what is shown below and ask to contact you."}
          </p>
          <button type="button" className="btn btn-primary mt-4" disabled={busy} onClick={() => act("status", { action: "confirm" }, () => setP({ ...p, discoverable: true, confirmed: true }), "Your profile is on. Employers can now find it.")}>
            Switch on my profile
          </button>
          {note.where === "status" && <Note ok={note.ok} text={note.text} />}
        </div>
      )}

      {p.discoverable && (
        <div className="card-white flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="flex items-center gap-2 text-[17px] font-semibold text-ink">
              <span className="live-dot" aria-hidden="true" /> Employers can find you
            </p>
            <p className="mt-1 text-[14px] text-mute">You will get an email for each employer who asks to contact you.</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => act("status", { action: "off" }, () => setP({ ...p, discoverable: false }), "Switched off. Employers can no longer find you.")}>
            Switch off
          </button>
          {note.where === "status" && (
            <div className="w-full">
              <Note ok={note.ok} text={note.text} />
            </div>
          )}
        </div>
      )}

      <div className="card-white p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mute">What employers see</p>
        <p className="mt-2 text-[19px] font-semibold tracking-[-0.02em] text-ink">{p.headline}</p>
        <p className="text-[14px] text-mute">{[p.currentRole, p.location || p.region, p.years ? `${p.years} years` : ""].filter(Boolean).join(" · ")}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {p.skills.map((id) => (
            <li key={id} className="rounded-full bg-cloud px-2.5 py-1 text-[13px] text-ink">
              {names.get(id) ?? id}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-mute">Never your name, email or CV, unless you accept a request.</p>
      </div>

      <form
        className="card-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void act(
            "edit",
            { action: "update", headline: draft.headline, currentRole: draft.currentRole, location: draft.location, region: draft.region || null, yearsExperience: draft.years === "" ? null : Number(draft.years), skills: draft.skills },
            () => setP({ ...p, ...draft }),
            "Saved."
          );
        }}
      >
        <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Edit your profile</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="me-headline" className="field-label">
              Headline
            </label>
            <input id="me-headline" className="field" maxLength={120} value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} />
          </div>
          <div>
            <label htmlFor="me-role" className="field-label">
              Job title
            </label>
            <input id="me-role" className="field" maxLength={120} value={draft.currentRole} onChange={(e) => setDraft({ ...draft, currentRole: e.target.value })} />
          </div>
          <div>
            <label htmlFor="me-years" className="field-label">
              Years of experience
            </label>
            <input id="me-years" className="field" type="number" min={0} max={60} value={draft.years} onChange={(e) => setDraft({ ...draft, years: e.target.value })} />
          </div>
          <div>
            <label htmlFor="me-location" className="field-label">
              Town
            </label>
            <input id="me-location" className="field" maxLength={80} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
          </div>
          <div>
            <label htmlFor="me-region" className="field-label">
              Region
            </label>
            <select id="me-region" className="field" style={SELECT_CHEVRON_STYLE} value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })}>
              <option value="">Not given</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-5">
          <p className="field-label">Skills</p>
          <ul className="flex flex-wrap gap-1.5">
            {draft.skills.map((id) => (
              <li key={id} className="inline-flex items-center gap-1 rounded-full bg-cloud py-1 pl-2.5 pr-1.5 text-[13px] text-ink">
                {names.get(id) ?? id}
                <button type="button" aria-label={`Remove ${names.get(id) ?? id}`} className="grid h-5 w-5 place-items-center rounded-full text-mute hover:bg-hair hover:text-ink" onClick={() => setDraft({ ...draft, skills: draft.skills.filter((s) => s !== id) })}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <select aria-label="Add a skill" className="field !py-2.5 !text-[15px]" style={SELECT_CHEVRON_STYLE} value={addSkill} onChange={(e) => setAddSkill(e.target.value)}>
              <option value="">Add a skill…</option>
              {allSkills
                .filter((s) => !draft.skills.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm shrink-0"
              disabled={!addSkill || draft.skills.length >= 30}
              onClick={() => {
                if (addSkill) setDraft({ ...draft, skills: [...draft.skills, addSkill] });
                setAddSkill("");
              }}
            >
              Add
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-6" disabled={busy}>
          Save changes
        </button>
        {note.where === "edit" && <Note ok={note.ok} text={note.text} />}
      </form>

      <div className="card-white p-6">
        <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Your CV</p>
        <p className="mt-1 text-[14px] text-mute">
          {p.hasCv ? "Sent only to employers whose contact request you accept." : "No CV saved. Employers who you accept will get your name and email only."}
        </p>
        {p.hasCv && p.cvPreview && <p className="mt-3 line-clamp-3 rounded-xl bg-cloud px-3 py-2 text-[13px] text-ink-2">{p.cvPreview}</p>}
        {cvOpen ? (
          <div className="mt-3">
            <textarea aria-label="Your CV" className="field min-h-[160px] text-[14px]" value={cvDraft} maxLength={12000} onChange={(e) => setCvDraft(e.target.value)} />
            <div className="mt-3 flex gap-3">
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => act("cv", { action: "cv", cvText: cvDraft }, () => (setP({ ...p, hasCv: true, cvPreview: cvDraft.slice(0, 300) }), setCvOpen(false)), "CV saved.")}>
                Save CV
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCvOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInput.current?.click()}>
              {p.hasCv ? "Replace with a file" : "Upload a CV"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => (setCvDraft(""), setCvOpen(true))}>
              Paste a CV
            </button>
            {p.hasCv && (
              <button type="button" className="btn btn-sm text-[#b3261e] hover:bg-[#fff2f2]" disabled={busy} onClick={() => act("cv", { action: "remove-cv" }, () => setP({ ...p, hasCv: false, cvPreview: "" }), "CV removed.")}>
                Remove my CV
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.docx,.txt"
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose your CV file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void readFile(f);
              }}
            />
          </div>
        )}
        {note.where === "cv" && <Note ok={note.ok} text={note.text} />}
      </div>

      <div className="card-white p-6">
        <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Delete everything</p>
        <p className="mt-1 text-[14px] text-mute">
          Deletes this profile, your CV, our copies of your applications, any contact requests and job alerts sent to {p.email}. This cannot be undone.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn btn-sm bg-[#b3261e] text-white hover:bg-[#9a1f18]" disabled={busy} onClick={() => act("delete", { action: "delete" }, () => setDeleted(true), "Deleted.")}>
              Yes, delete everything
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>
              Keep it
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-sm mt-4 text-[#b3261e] hover:bg-[#fff2f2]" onClick={() => setConfirmDelete(true)}>
            Delete everything
          </button>
        )}
        {note.where === "delete" && <Note ok={note.ok} text={note.text} />}
        {p.expires && <p className="mt-4 text-[12px] text-mute">If you do nothing, we delete your profile on {p.expires}.</p>}
      </div>
    </div>
  );
}
