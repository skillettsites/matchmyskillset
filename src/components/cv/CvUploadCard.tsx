"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rankTitles } from "@/lib/skills/fuzzy";
import { track } from "@/lib/analytics";
import { titleInSentence } from "@/lib/text";
import { LocationField, type PickedPlace } from "./LocationField";
import { rememberResults, saveSessionCv } from "./storage";

// The CV card: drop or choose a CV (PDF, Word, text) or paste it, say where you
// want to work, and get live jobs matched to it. Used on the homepage (hero)
// and on /discover (page). The progress list shows the real steps as each
// request finishes: reading the file (/api/parse-cv), picking out skills and
// matching careers (/api/assess, 10 to 18 seconds for a CV), then searching the
// job boards (/api/results/jobs). Nothing is faked: a step is ticked only when
// its request has come back.

const MAX_CV = 12_000;
const MAX_FILE = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

type StepState = "waiting" | "active" | "done" | "error";
interface Step {
  key: string;
  label: string;
  state: StepState;
  detail?: string;
}

interface IndexEntry {
  key: string;
  title: string;
  aliases: string[];
}

interface AssessOk {
  token: string;
  matches: number;
  skills?: number;
  role?: string | null;
  place?: string | null;
}

async function postJson<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) return { ok: false, error: data.error || "Something went wrong. Please try again." };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "We could not reach the server. Please check your connection and try again." };
  }
}

function fmt(n: number): string {
  return n.toLocaleString("en-GB");
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center" aria-hidden="true">
        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-hair border-t-blue" />
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fff2f2] text-[#b3261e]" aria-hidden="true">
        !
      </span>
    );
  }
  return <span className="h-7 w-7 shrink-0 rounded-full border-2 border-hair" aria-hidden="true" />;
}

function Progress({ steps, elapsed, error, onBack }: { steps: Step[]; elapsed: number; error: string; onBack: () => void }) {
  return (
    <div role="status" aria-live="polite" className="py-2">
      <p className="title text-[22px] sm:text-[24px]">Finding your jobs</p>
      <ol className="mt-6 space-y-5">
        {steps.map((s) => (
          <li key={s.key} className="flex gap-4">
            <StepIcon state={s.state} />
            <div className="min-w-0 pt-0.5">
              <p className={`text-[17px] font-semibold tracking-[-0.02em] ${s.state === "waiting" ? "text-mute-2" : "text-ink"}`}>{s.label}</p>
              {s.detail && <p className="text-[15px] text-mute">{s.detail}</p>}
              {s.state === "active" && s.key === "skills" && (
                <p className="text-[15px] text-mute">
                  Usually 10 to 18 seconds <span className="tabular-nums">({elapsed}s so far)</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {error && (
        <div className="mt-6">
          <p role="alert" className="rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]">
            {error}
          </p>
          <button type="button" className="btn btn-secondary mt-4" onClick={onBack}>
            Go back
          </button>
        </div>
      )}
    </div>
  );
}

export function CvUploadCard({ variant = "page" }: { variant?: "hero" | "page" }) {
  const router = useRouter();
  const hero = variant === "hero";

  // Input
  const [mode, setMode] = useState<"cv" | "job">("cv");
  const [cv, setCv] = useState("");
  const [fileName, setFileName] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [showText, setShowText] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [place, setPlace] = useState<PickedPlace>({ text: "", region: null });
  const [lookingFor, setLookingFor] = useState("");
  const [lookingOpen, setLookingOpen] = useState(!hero);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Job title path
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [jobText, setJobText] = useState("");
  const [chosen, setChosen] = useState<{ key: string; title: string } | null>(null);

  // Running
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [runError, setRunError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [skillsStarted, setSkillsStarted] = useState(0);
  const progressBox = useRef<HTMLDivElement>(null);

  // Keep the progress in view on small screens, where the button sits low on the card.
  useEffect(() => {
    if (running) progressBox.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [running]);

  useEffect(() => {
    if (!skillsStarted) return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - skillsStarted) / 1000)), 1000);
    return () => clearInterval(t);
  }, [skillsStarted]);

  // Links from the guides pass ?current=<job> so the job title path starts filled in,
  // and ?looking=<field> (for example "Robotics and automation") so "What are you
  // looking for?" starts filled in and the matching searches that field first.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const current = params.get("current");
      if (current) setJobText(current.replace(/\s+/g, " ").trim().slice(0, 80));
      const looking = params.get("looking");
      if (looking) {
        setLookingFor(looking.replace(/\s+/g, " ").trim().slice(0, 120));
        setLookingOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (mode !== "job" || index) return;
    fetch("/api/job-index")
      .then((r) => r.json())
      .then((d: { index?: IndexEntry[] }) => setIndex(d.index ?? []))
      .catch(() => setIndex([]));
  }, [mode, index]);

  const suggestions = useMemo(() => {
    const q = jobText.trim();
    if (!index || q.length < 2) return [];
    return rankTitles(q, index, 6).map((r) => ({ key: r.entry.key, title: r.entry.title, matchedOn: r.matchedOn }));
  }, [jobText, index]);

  async function readFile(file: File) {
    setError("");
    if (file.size > MAX_FILE) {
      setError("That file is too big. The limit is 5 MB.");
      return;
    }
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) {
      setError(/\.doc$/i.test(file.name) ? "Old .doc files cannot be read. Please save it as .docx or PDF, or paste the text." : "Please choose a PDF, Word (.docx) or text file.");
      return;
    }
    setParsing(true);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; truncated?: boolean; error?: string };
      if (!res.ok || !data.text) {
        setFileName("");
        setError(data.error || "We could not read that file. Please paste your CV text instead.");
        return;
      }
      setCv(data.text);
      setPasteOpen(false);
    } catch {
      setFileName("");
      setError("We could not upload that file. Please try again or paste your CV text.");
    } finally {
      setParsing(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function clearCv() {
    setCv("");
    setFileName("");
    setShowText(false);
  }

  function setStep(key: string, patch: Partial<Step>) {
    setSteps((list) => list.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  async function run() {
    const where = place.text.trim();
    const nearText = where ? ` near ${where}` : " across the UK";
    const isCv = mode === "cv";
    if (isCv && cv.trim().length < 80) {
      setError("Please add your CV, or paste a few lines about your experience.");
      return;
    }
    if (!isCv && !chosen) {
      setError("Please pick your job from the list.");
      return;
    }
    setError("");
    setRunError("");
    setRunning(true);
    setElapsed(0);
    const initial: Step[] = isCv
      ? [
          { key: "read", label: fileName ? `Read ${fileName}` : "Read your CV", state: "done", detail: `${fmt(cv.trim().length)} characters` },
          { key: "skills", label: "Picking out your skills", state: "active" },
          { key: "careers", label: "Matching you with UK careers", state: "waiting" },
          { key: "jobs", label: `Searching live jobs${nearText}`, state: "waiting" },
        ]
      : [
          { key: "skills", label: `Using the usual skills for ${titleInSentence(chosen!.title)}`, state: "active" },
          { key: "careers", label: "Matching you with UK careers", state: "waiting" },
          { key: "jobs", label: `Searching live jobs${nearText}`, state: "waiting" },
        ];
    setSteps(initial);
    if (isCv) setSkillsStarted(Date.now());

    track(isCv ? "cv_submitted" : "tool_used", isCv ? { mode: "cv", chars: cv.trim().length, has_priorities: lookingFor.trim().length > 0, has_location: Boolean(where) } : { tool: "discover", mode: "job" });

    const assess = await postJson<AssessOk>(
      "/api/assess",
      isCv
        ? { mode: "cv", text: cv, whatMatters: lookingFor.trim() || undefined, location: where || undefined, locationRegion: place.region || undefined }
        : { mode: "job", jobKey: chosen!.key, location: where || undefined, locationRegion: place.region || undefined }
    );
    setSkillsStarted(0);
    if (!assess.ok) {
      setStep("skills", { state: "error" });
      setRunError(assess.error);
      return;
    }
    const a = assess.data;
    setStep("skills", { state: "done", label: isCv ? "Picked out your skills" : initial[0].label, detail: a.skills ? `${a.skills} skills${isCv && a.role ? `, most recently ${titleInSentence(a.role)}` : ""}` : undefined });
    setStep("careers", { state: "done", label: "Matched you with UK careers", detail: a.matches ? `${a.matches} careers use your skills` : "We could not match many careers, so jobs lean on your own field" });
    setStep("jobs", { state: "active", label: `Searching live jobs${a.place ? ` near ${a.place}` : " across the UK"}`, detail: "Reed, Adzuna, GOV.UK Teaching Vacancies, remote boards and jobs posted here" });

    rememberResults(a.token);
    if (isCv) saveSessionCv({ token: a.token, text: cv, fileName: fileName || undefined });

    const jobs = await postJson<{ snapshot?: { jobs: unknown[] } }>("/api/results/jobs", { token: a.token, action: "load" });
    if (jobs.ok && jobs.data.snapshot) {
      const n = jobs.data.snapshot.jobs.length;
      setStep("jobs", { state: "done", label: "Searched live jobs", detail: n ? `${fmt(n)} live jobs match your ${isCv ? "CV" : "experience"}` : "No close matches right now: your results show why and what to try" });
    } else {
      // The results page tries again, so a slow board never blocks the results.
      setStep("jobs", { state: "done", label: "Opening your results", detail: "The job search will finish on the next page" });
    }
    router.push(`/results/${a.token}`);
  }

  function back() {
    setRunning(false);
    setSteps([]);
    setRunError("");
  }

  const card = "card-white p-5 text-left sm:p-7";

  if (running) {
    return (
      <div ref={progressBox} className={`${card} scroll-mt-24`}>
        <Progress steps={steps} elapsed={elapsed} error={runError} onBack={back} />
      </div>
    );
  }

  const cvReady = cv.trim().length >= 80;

  return (
    <form
      id={hero ? undefined : "cv"}
      className={`${card} scroll-mt-24`}
      onSubmit={(e) => {
        e.preventDefault();
        void run();
      }}
    >
      {mode === "cv" ? (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <p className="field-label !mb-3">Your CV</p>
            {!cv && !parsing && (
              <button type="button" className="mb-3 text-[14px] text-link hover:underline" onClick={() => setPasteOpen((v) => !v)}>
                {pasteOpen ? "Upload a file instead" : "Paste it instead"}
              </button>
            )}
          </div>

          {cv && !pasteOpen ? (
            <div className="rounded-2xl bg-cloud px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue shadow-sm" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5M9 13h6M9 17h6" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink">{fileName || "Your pasted CV"}</p>
                  <p className="text-[13px] text-mute">Read {fmt(cv.length)} characters</p>
                </div>
                <button type="button" className="text-[14px] text-link hover:underline" onClick={() => setShowText((v) => !v)} aria-expanded={showText}>
                  {showText ? "Hide text" : "Check text"}
                </button>
                <button type="button" className="text-[14px] text-mute hover:text-ink" onClick={clearCv} aria-label="Remove this CV">
                  Remove
                </button>
              </div>
              {showText && (
                <textarea
                  aria-label="Your CV text"
                  className="field mt-3 min-h-[180px] resize-y text-[15px]"
                  value={cv}
                  maxLength={MAX_CV}
                  onChange={(e) => setCv(e.target.value.slice(0, MAX_CV))}
                />
              )}
            </div>
          ) : pasteOpen ? (
            <div>
              <textarea
                aria-label="Paste your CV"
                className="field min-h-[170px] resize-y"
                value={cv}
                maxLength={MAX_CV}
                onChange={(e) => {
                  setCv(e.target.value.slice(0, MAX_CV));
                  setError("");
                }}
                placeholder="Paste your CV, or describe your jobs, what you did and what you are proud of."
              />
              <p className="field-hint flex justify-between">
                <span>Take out anything you would rather not share, such as health details.</span>
                <span className="tabular-nums">
                  {fmt(cv.length)} / {fmt(MAX_CV)}
                </span>
              </p>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void readFile(f);
              }}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 text-center transition-colors ${
                hero ? "py-7" : "py-9"
              } ${dragging ? "border-blue bg-[#f0f6ff]" : "border-line bg-snow"}`}
            >
              {parsing ? (
                <>
                  <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-hair border-t-blue" aria-hidden="true" />
                  <p className="mt-3 text-[15px] font-medium text-ink" role="status">
                    Reading {fileName}…
                  </p>
                </>
              ) : (
                <>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue shadow-sm" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4M7 9l5-5 5 5" />
                      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                    </svg>
                  </span>
                  <p className="mt-3 text-[17px] font-semibold tracking-[-0.02em] text-ink">Drop your CV here</p>
                  <p className="mt-1 text-[15px] text-mute">
                    or{" "}
                    <button type="button" className="font-medium text-link hover:underline" onClick={() => fileInput.current?.click()}>
                      choose a file
                    </button>{" "}
                    (PDF, Word or text, up to 5 MB)
                  </p>
                </>
              )}
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPT}
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
        </>
      ) : (
        <div>
          <label htmlFor="cv-card-job" className="field-label">
            What job do you do now?
          </label>
          {chosen ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-cloud px-4 py-3.5">
              <p className="text-[17px] font-semibold text-ink">{chosen.title}</p>
              <button type="button" className="text-[14px] text-link hover:underline" onClick={() => setChosen(null)}>
                Change
              </button>
            </div>
          ) : (
            <>
              <input
                id="cv-card-job"
                className="field"
                value={jobText}
                autoComplete="organization-title"
                placeholder="For example, maintenance technician"
                onChange={(e) => setJobText(e.target.value)}
              />
              {suggestions.length > 0 && (
                <ul className="mt-2 space-y-1.5" aria-label="Closest jobs">
                  {suggestions.map((s) => (
                    <li key={s.key}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-cloud"
                        onClick={() => setChosen({ key: s.key, title: s.title })}
                      >
                        <span>
                          <span className="block text-[15px] font-medium text-ink">{s.title}</span>
                          {s.matchedOn !== s.title && <span className="block text-[13px] text-mute">Also called {titleInSentence(s.matchedOn)}</span>}
                        </span>
                        <span aria-hidden="true" className="text-blue">
                          ›
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {index && jobText.trim().length >= 3 && suggestions.length === 0 && (
                <p className="field-hint">We do not have that job yet. Try another name for it, or upload your CV: that works for any job.</p>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-6">
        <LocationField value={place} onChange={setPlace} compact={hero} />
      </div>

      {mode === "cv" &&
        (lookingOpen ? (
          <div className="mt-6">
            <label htmlFor={`cv-card-looking-${variant}`} className="field-label">
              What are you looking for? <span className="font-normal text-mute">(optional)</span>
            </label>
            <input
              id={`cv-card-looking-${variant}`}
              className="field"
              maxLength={300}
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              placeholder="For example: automation and robotics, no nights, more pay"
            />
          </div>
        ) : (
          <button type="button" className="mt-4 text-[14px] text-link hover:underline" onClick={() => setLookingOpen(true)}>
            + Add what you are looking for
          </button>
        ))}

      {error && (
        <p role="alert" className="mt-5 rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-lg mt-7 w-full"
        disabled={parsing || (mode === "cv" ? !cvReady : !chosen)}
      >
        Find my jobs
      </button>
      <p className="mt-3 text-center text-[13px] text-mute">
        No sign-up. We don&apos;t keep your CV unless you ask us to.{" "}
        <Link href="/privacy#cv" className="text-link underline underline-offset-2">
          How we use it
        </Link>
      </p>

      <div className="mt-5 border-t border-hair pt-4 text-center">
        {mode === "cv" ? (
          <button type="button" className="text-[15px] text-link hover:underline" onClick={() => setMode("job")}>
            No CV to hand? Start from your job title
          </button>
        ) : (
          <button type="button" className="text-[15px] text-link hover:underline" onClick={() => setMode("cv")}>
            Use your CV instead (more accurate)
          </button>
        )}
      </div>
    </form>
  );
}
