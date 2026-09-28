"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { readSessionCv } from "@/components/cv/storage";

async function post(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: "We could not reach the server. Please check your connection and try again." } };
  }
}

function Tick({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="mt-4 flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-ink-2">
      <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0071e3]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

function Err({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="mt-3 rounded-xl bg-[#fff2f2] px-3 py-2 text-[14px] text-[#b3261e]">
      {text}
    </p>
  );
}

export function AlertSignup({ token, consentText, where }: { token: string; consentText: string; where: string }) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "daily">("weekly");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please tick the box to agree to the emails.");
      return;
    }
    setBusy(true);
    setError("");
    const r = await post("/api/alerts", { token, email, frequency, consent });
    setBusy(false);
    if (!r.ok) {
      setError(String(r.data.error ?? "We could not set up the alert. Please try again."));
      return;
    }
    track("email_saved", { placement: "job_alert", frequency });
    setDone(true);
  }

  return (
    <section className="card-white p-5 sm:p-6" aria-labelledby="alert-title">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-green">
        <span className="live-dot" aria-hidden="true" /> Job alerts
      </p>
      <h2 id="alert-title" className="mt-1.5 text-[21px] font-semibold tracking-[-0.02em] text-ink">
        Email me new matching jobs
      </h2>
      {done ? (
        <p role="status" className="mt-2 text-[15px] text-ink-2">
          Done. We have emailed {email} a confirmation with a link to change or stop the alert. Your first alert comes {frequency === "daily" ? "tomorrow morning" : "next Monday"}
          , if there are new matches.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-2">
          <p className="text-[15px] text-mute">New jobs that match your CV {where}, scored like the ones here. Only jobs you have not had from us.</p>
          <label htmlFor="alert-email" className="field-label mt-4">
            Email
          </label>
          <input id="alert-email" type="email" required autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <div className="segmented mt-3" role="group" aria-label="How often">
            <button type="button" aria-pressed={frequency === "weekly"} onClick={() => setFrequency("weekly")}>
              Weekly
            </button>
            <button type="button" aria-pressed={frequency === "daily"} onClick={() => setFrequency("daily")}>
              Daily
            </button>
          </div>
          <Tick checked={consent} onChange={setConsent}>
            {consentText}
          </Tick>
          <Err text={error} />
          <button type="submit" className="btn btn-primary mt-4 w-full" disabled={busy}>
            {busy ? "Setting up…" : "Set up my alert"}
          </button>
        </form>
      )}
    </section>
  );
}

interface Preview {
  headline: string;
  role: string | null;
  region: string | null;
  years: number | null;
  skills: string[];
}

export function ProfileOptIn({ token, consentText, preview }: { token: string; consentText: string; preview: Preview }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState(preview.headline);
  const [cv, setCv] = useState("");
  const [cvName, setCvName] = useState("");
  const [includeCv, setIncludeCv] = useState(true);
  const [pasting, setPasting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"" | "new" | "existing">("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = readSessionCv();
    if (s && s.token === token) {
      setCv(s.text);
      setCvName(s.fileName || "the CV you added");
    }
  }, [token]);

  async function readFile(file: File) {
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        setError(data.error || "We could not read that file. Please paste your CV instead.");
        return;
      }
      setCv(data.text);
      setCvName(file.name);
      setIncludeCv(true);
    } catch {
      setError("We could not upload that file. Please try again.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please tick the box to agree, or leave this for now.");
      return;
    }
    setBusy(true);
    setError("");
    const r = await post("/api/candidates", { token, firstName, email, headline, cvText: includeCv && cv.trim().length >= 80 ? cv : undefined, consent });
    setBusy(false);
    if (!r.ok) {
      setError(String(r.data.error ?? "We could not save your profile. Please try again."));
      return;
    }
    track("email_saved", { placement: "candidate_profile" });
    setDone(r.data.existing ? "existing" : "new");
  }

  return (
    <section className="card-white p-5 sm:p-6" aria-labelledby="optin-title">
      <p className="text-[13px] font-semibold text-blue">For employers hiring on MatchMySkillset</p>
      <h2 id="optin-title" className="mt-1.5 text-[21px] font-semibold tracking-[-0.02em] text-ink">
        Let employers find me
      </h2>
      <p className="mt-2 text-[15px] text-mute">Employers see an anonymous profile and can ask to contact you. You say yes or no to each one.</p>

      <div className="mt-4 rounded-2xl bg-cloud p-4" aria-label="What employers would see">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mute">What employers see</p>
        <p className="mt-1.5 text-[15px] font-semibold text-ink">{headline || preview.headline}</p>
        <p className="text-[13px] text-mute">
          {[preview.role, preview.region, preview.years ? `${preview.years} years` : null].filter(Boolean).join(" · ") || "Job, region and years when known"}
        </p>
        {preview.skills.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1">
            {preview.skills.map((s) => (
              <li key={s} className="rounded-full bg-white px-2 py-0.5 text-[12px] text-ink-2">
                {s}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[12px] text-mute">No name, email or CV until you accept a request.</p>
      </div>

      {done ? (
        <p role="status" className="mt-4 text-[15px] text-ink-2">
          {done === "new"
            ? `Nearly there. We have emailed ${email} a link to switch your profile on. Until you do, nobody can see it.`
            : `You already have a profile with that address, so we have emailed ${email} its private link again.`}
        </p>
      ) : !open ? (
        <button type="button" className="btn btn-secondary mt-4 w-full" onClick={() => setOpen(true)}>
          Set up my profile
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label htmlFor="optin-name" className="field-label">
                First name
              </label>
              <input id="optin-name" className="field" required maxLength={60} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="optin-email" className="field-label">
                Email
              </label>
              <input id="optin-email" type="email" required autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="optin-headline" className="field-label">
                Headline employers see
              </label>
              <input id="optin-headline" className="field" maxLength={120} value={headline} onChange={(e) => setHeadline(e.target.value)} />
              <p className="field-hint">No contact details or links: those stay private.</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="field-label">Your CV</p>
            {cv ? (
              <div className="rounded-xl bg-cloud px-3 py-2.5 text-[14px]">
                <label className="flex cursor-pointer items-start gap-2">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#0071e3]" checked={includeCv} onChange={(e) => setIncludeCv(e.target.checked)} />
                  <span>
                    Include {cvName}. It goes only to employers whose request you accept.
                  </span>
                </label>
              </div>
            ) : pasting ? (
              <textarea className="field min-h-[120px] text-[14px]" placeholder="Paste your CV" value={cv} maxLength={12000} onChange={(e) => setCv(e.target.value)} />
            ) : (
              <p className="text-[14px] text-mute">
                <button type="button" className="text-link hover:underline" onClick={() => fileInput.current?.click()}>
                  Upload your CV
                </button>{" "}
                or{" "}
                <button type="button" className="text-link hover:underline" onClick={() => setPasting(true)}>
                  paste it
                </button>{" "}
                (optional: you can add it later).
                <input
                  ref={fileInput}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx,.txt"
                  tabIndex={-1}
                  aria-label="Choose your CV file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void readFile(f);
                  }}
                />
              </p>
            )}
          </div>

          <Tick checked={consent} onChange={setConsent}>
            {consentText}
          </Tick>
          <Err text={error} />
          <button type="submit" className="btn btn-primary mt-4 w-full" disabled={busy}>
            {busy ? "Saving…" : "Create my profile"}
          </button>
          <p className="mt-2 text-center text-[12px] text-mute">
            We email you a link to switch it on, edit it or delete it. Kept 12 months.{" "}
            <Link href="/privacy#employers-find-me" className="text-link hover:underline">
              Privacy
            </Link>
          </p>
        </form>
      )}
    </section>
  );
}
