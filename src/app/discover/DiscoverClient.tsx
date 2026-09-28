"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rankTitles } from "@/lib/skills/fuzzy";
import { track } from "@/lib/analytics";
import { titleInSentence } from "@/lib/text";

interface IndexEntry {
  key: string;
  title: string;
  aliases: string[];
}

interface Suggestion {
  key: string;
  title: string;
  matchedOn: string;
}

interface Props {
  index: IndexEntry[];
  initialCurrent: string;
  initialSuggestions: Suggestion[];
  regions: string[];
  recruiter: { partner: string; text: string } | null;
}

const MAX_CV = 12_000;

async function postAssess(body: Record<string, unknown>): Promise<{ token?: string; error?: string }> {
  try {
    const res = await fetch("/api/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
    if (!res.ok || !data.token) return { error: data.error || "Something went wrong. Please try again." };
    return { token: data.token };
  } catch {
    return { error: "We could not reach the server. Please check your connection and try again." };
  }
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-semibold text-ink">
        {label}
      </label>
      {hint && <div className="mt-0.5 text-sm text-muted">{hint}</div>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RegionSelect({ id, value, onChange, regions }: { id: string; value: string; onChange: (v: string) => void; regions: string[] }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base text-ink sm:w-auto"
    >
      <option value="">Anywhere in the UK</option>
      {regions.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]" />
      <span>{children}</span>
    </label>
  );
}

export function DiscoverClient({ index, initialCurrent, initialSuggestions, regions, recruiter }: Props) {
  const router = useRouter();

  // ---- Start from your job
  const [jobText, setJobText] = useState(initialCurrent);
  const [chosen, setChosen] = useState<Suggestion | null>(null);
  const [noDegree, setNoDegree] = useState(false);
  const [earnMore, setEarnMore] = useState(false);
  const [jobRegion, setJobRegion] = useState("");
  const [jobBusy, setJobBusy] = useState(false);
  const [jobError, setJobError] = useState("");

  const suggestions: Suggestion[] = useMemo(() => {
    const q = jobText.trim();
    if (q.length < 2) return [];
    if (q === initialCurrent && initialSuggestions.length) return initialSuggestions;
    return rankTitles(q, index, 6).map((r) => ({ key: r.entry.key, title: r.entry.title, matchedOn: r.matchedOn }));
  }, [jobText, index, initialCurrent, initialSuggestions]);

  async function submitJob() {
    if (!chosen) return;
    setJobBusy(true);
    setJobError("");
    track("tool_used", { tool: "discover", mode: "job" });
    const { token, error } = await postAssess({
      mode: "job",
      jobKey: chosen.key,
      preferences: { noDegree, earnMore },
      region: jobRegion || undefined,
    });
    if (token) {
      router.push(`/results/${token}`);
      return;
    }
    setJobBusy(false);
    setJobError(error ?? "Something went wrong.");
  }

  // ---- Paste or upload your CV
  const [cv, setCv] = useState("");
  const [whatMatters, setWhatMatters] = useState("");
  const [cvRegion, setCvRegion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [cvBusy, setCvBusy] = useState(false);
  const [cvError, setCvError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [consent, setConsent] = useState(false);
  const [consentEmail, setConsentEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cvBusy) return;
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [cvBusy]);

  async function upload(file: File) {
    setUploading(true);
    setCvError("");
    setUploadNote("");
    try {
      if (file.size > 5 * 1024 * 1024) {
        setCvError("That file is too big. The limit is 5 MB.");
        return;
      }
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; truncated?: boolean; error?: string };
      if (!res.ok || !data.text) {
        setCvError(data.error || "We could not read that file. Please paste your CV text instead.");
        return;
      }
      setCv(data.text);
      setUploadNote(
        data.truncated
          ? `Read ${file.name}. It was long, so we kept the first ${MAX_CV.toLocaleString("en-GB")} characters. Check the text below.`
          : `Read ${file.name}. Check the text below and remove anything you would rather not share.`
      );
    } catch {
      setCvError("We could not upload that file. Please try again or paste your CV text.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const cvTooShort = cv.trim().length < 80;
  const consentIncomplete = Boolean(recruiter && consent && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(consentEmail.trim()));

  async function submitCv(e: React.FormEvent) {
    e.preventDefault();
    if (cvTooShort) {
      setCvError("Please paste a little more about your experience (at least a few lines).");
      return;
    }
    if (consentIncomplete) {
      setCvError("Please add your email address so the recruitment agency can contact you, or untick the box.");
      return;
    }
    setCvBusy(true);
    setElapsed(0);
    setCvError("");
    track("cv_submitted", { mode: "cv", chars: cv.trim().length, has_priorities: whatMatters.trim().length > 0 });
    const { token, error } = await postAssess({
      mode: "cv",
      text: cv,
      whatMatters: whatMatters.trim() || undefined,
      region: cvRegion || undefined,
      ...(recruiter && consent ? { recruiterConsent: true, email: consentEmail.trim(), firstName: firstName.trim() || undefined } : {}),
    });
    if (token) {
      router.push(`/results/${token}`);
      return;
    }
    setCvBusy(false);
    setCvError(error ?? "Something went wrong.");
  }

  const panel = "rounded-lg border border-rule bg-surface p-5 shadow-card sm:p-7";

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      {/* ---------------- Start from your job ---------------- */}
      <section aria-labelledby="job-title" className={panel}>
        <p className="kicker">Instant</p>
        <h2 id="job-title" className="mt-1 font-serif text-h3 font-semibold text-ink">
          Start from your job
        </h2>
        <p className="mt-1 text-ink-2">Type the job you do now and pick the closest match. We use the skills that job usually involves.</p>

        {!chosen ? (
          <div className="mt-5">
            <Field label="What job do you do now?" htmlFor="current-job">
              <input
                id="current-job"
                type="text"
                value={jobText}
                onChange={(e) => {
                  setJobText(e.target.value);
                  setJobError("");
                }}
                autoComplete="organization-title"
                placeholder="For example, retail manager"
                className="min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base text-ink placeholder:text-muted focus:border-accent"
              />
            </Field>
            {suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted" id="job-suggestions-label">
                  Pick the closest match:
                </p>
                <ul aria-labelledby="job-suggestions-label" className="mt-2 space-y-2">
                  {suggestions.map((s) => (
                    <li key={s.key}>
                      <button
                        type="button"
                        onClick={() => setChosen(s)}
                        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-rule bg-white px-3 py-2 text-left text-ink hover:border-accent hover:bg-accent-wash"
                      >
                        <span>
                          <span className="font-semibold">{s.title}</span>
                          {s.matchedOn !== s.title && <span className="block text-sm text-muted">Also called {titleInSentence(s.matchedOn)}</span>}
                        </span>
                        <span aria-hidden="true" className="text-accent">
                          &rarr;
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {jobText.trim().length >= 3 && suggestions.length === 0 && (
              <p className="mt-3 rounded-md bg-paper-2 px-3 py-2 text-sm text-ink-2">
                We do not have a skills profile for that job yet. Try another name for it, or paste your CV instead: that works
                for any job.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-accent/30 bg-accent-wash px-3 py-2">
              <p className="text-ink">
                <span className="text-sm text-muted">Your job: </span>
                <span className="font-semibold">{chosen.title}</span>
              </p>
              <button type="button" className="btn-quiet min-h-11 px-2 text-sm" onClick={() => setChosen(null)}>
                Change
              </button>
            </div>
            <fieldset>
              <legend className="font-semibold text-ink">Anything that matters? (optional)</legend>
              <div className="mt-1">
                <Check checked={noDegree} onChange={setNoDegree}>
                  I do not have a degree
                </Check>
                <Check checked={earnMore} onChange={setEarnMore}>
                  I want to earn more than I do now
                </Check>
              </div>
            </fieldset>
            <Field label="Where are you? (optional)" htmlFor="job-region" hint="Used to pre-fill job searches.">
              <RegionSelect id="job-region" value={jobRegion} onChange={setJobRegion} regions={regions} />
            </Field>
            <button type="button" onClick={submitJob} disabled={jobBusy} className="btn btn-primary btn-lg w-full">
              {jobBusy ? "Finding your options…" : "Show my options"}
            </button>
          </div>
        )}
        {jobError && (
          <p role="alert" className="mt-3 rounded-md bg-negative-soft px-3 py-2 text-sm text-negative">
            {jobError}
          </p>
        )}
      </section>

      {/* ---------------- Paste or upload your CV ---------------- */}
      <section id="cv" aria-labelledby="cv-title" className={`${panel} scroll-mt-24`}>
        <p className="kicker">Most personal</p>
        <h2 id="cv-title" className="mt-1 font-serif text-h3 font-semibold text-ink">
          Paste or upload your CV
        </h2>
        <p className="mt-1 text-ink-2">We read your whole background: jobs, volunteering, caring and hobbies.</p>

        <form onSubmit={submitCv} className="mt-5 space-y-5">
          <div className="rounded-md border border-rule bg-paper-2 px-3 py-2.5 text-sm text-ink-2" id="cv-privacy-note">
            <strong className="text-ink">Before you paste:</strong>{" "}take out anything you would rather not share, such as
            health or disability, religion, ethnicity, or referees&apos; details. We do not need it and it plays no part in
            your matches. Your CV text is not kept after the analysis.{" "}
            <Link href="/privacy#special-category" className="link">
              Why this matters
            </Link>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <label htmlFor="cv-text" className="font-semibold text-ink">
                Your CV or a summary of your experience
              </label>
              <span className="text-sm tabular-nums text-muted" aria-live="polite">
                {cv.length.toLocaleString("en-GB")} / {MAX_CV.toLocaleString("en-GB")}
              </span>
            </div>
            <textarea
              id="cv-text"
              value={cv}
              onChange={(e) => {
                setCv(e.target.value.slice(0, MAX_CV));
                if (cvError) setCvError("");
              }}
              aria-describedby="cv-privacy-note"
              rows={10}
              placeholder="Paste your CV here, or describe what you have done: jobs, responsibilities, results, volunteering, caring, anything you are proud of."
              className="mt-2 w-full rounded-md border border-rule-strong bg-white p-3 text-base text-ink placeholder:text-muted focus:border-accent"
              disabled={cvBusy}
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className={`btn btn-secondary min-h-11 cursor-pointer ${uploading || cvBusy ? "pointer-events-none opacity-60" : ""}`}>
                {uploading ? "Reading file…" : "Upload a file instead"}
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="sr-only"
                  disabled={uploading || cvBusy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                  }}
                />
              </label>
              <span className="text-sm text-muted">PDF, Word (.docx) or text, up to 5 MB</span>
            </div>
            {uploadNote && (
              <p className="mt-2 text-sm text-accent" role="status">
                {uploadNote}
              </p>
            )}
          </div>

          <Field
            label="What matters to you? (optional)"
            htmlFor="what-matters"
            hint="For example: no weekends, working from home, earning more, no degree."
          >
            <input
              id="what-matters"
              type="text"
              maxLength={400}
              value={whatMatters}
              onChange={(e) => setWhatMatters(e.target.value)}
              disabled={cvBusy}
              className="min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base text-ink focus:border-accent"
            />
          </Field>

          <Field label="Where are you? (optional)" htmlFor="cv-region" hint="Used to pre-fill job searches.">
            <RegionSelect id="cv-region" value={cvRegion} onChange={setCvRegion} regions={regions} />
          </Field>

          {recruiter && (
            <fieldset className="rounded-md border border-rule p-3">
              <legend className="px-1 text-sm font-semibold text-ink">Optional</legend>
              <Check checked={consent} onChange={setConsent}>
                {recruiter.text}
              </Check>
              {consent && (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <Field label="Your email" htmlFor="consent-email">
                    <input
                      id="consent-email"
                      type="email"
                      autoComplete="email"
                      value={consentEmail}
                      onChange={(e) => setConsentEmail(e.target.value)}
                      className="min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base"
                    />
                  </Field>
                  <Field label="First name (optional)" htmlFor="consent-name">
                    <input
                      id="consent-name"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base"
                    />
                  </Field>
                </div>
              )}
              <p className="mt-2 text-xs text-muted">
                Leave it unticked and nothing is shared with {recruiter.partner} or anyone else. See{" "}
                <Link href="/privacy#recruiter" className="link">
                  section 4a of our privacy policy
                </Link>
                .
              </p>
            </fieldset>
          )}

          {cvError && (
            <p role="alert" className="rounded-md bg-negative-soft px-3 py-2 text-sm text-negative">
              {cvError}
            </p>
          )}

          <button type="submit" disabled={cvBusy || uploading} className="btn btn-primary btn-lg w-full">
            {cvBusy ? "Reading your CV…" : "Analyse my CV"}
          </button>
          {cvBusy ? (
            <p className="text-center text-sm text-muted" role="status" aria-live="polite">
              Picking out your skills and comparing them with UK careers. This usually takes 10 to 25 seconds ({elapsed}s so
              far).
            </p>
          ) : (
            <p className="text-center text-sm text-muted">Free. No account or email needed to see your results.</p>
          )}
        </form>
      </section>
    </div>
  );
}
