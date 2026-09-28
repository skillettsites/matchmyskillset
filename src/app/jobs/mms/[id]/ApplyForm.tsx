"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { lastResultsToken, readSessionCv } from "@/components/cv/storage";
import { applyConsentText } from "@/lib/candidates/consent";

interface Fit {
  kind: "full" | "skills";
  match: number;
  matched: { id: string; name: string }[];
  missing: { id: string; name: string }[];
  reason: string | null;
  explain: string;
}

/** "Your match" for this job, from the visitor's latest results, if they have any. */
export function YourMatch({ jobId }: { jobId: string }) {
  const [fit, setFit] = useState<Fit | null>(null);
  const [state, setState] = useState<"loading" | "none" | "done">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = lastResultsToken();
      if (!token) {
        if (!cancelled) setState("none");
        return;
      }
      try {
        const r = await fetch("/api/jobs/mms-match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, token }) });
        const d = (await r.json()) as { fit?: Fit | null };
        if (cancelled) return;
        setFit(d.fit ?? null);
        setState(d.fit ? "done" : "none");
      } catch {
        if (!cancelled) setState("none");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (state === "loading") return <div className="card-white h-[120px] animate-pulse p-6" aria-hidden="true" />;
  if (state === "none" || !fit) {
    return (
      <div className="tile p-5">
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">How well do you match?</p>
        <p className="mt-1 text-[15px] text-mute">Upload your CV to see your match for this job and others like it.</p>
        <Link href="/discover#cv" className="btn btn-secondary btn-sm mt-3">
          Check my CV
        </Link>
      </div>
    );
  }
  return (
    <div className="card-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Your match</p>
        <p className={`text-[28px] font-bold tabular-nums tracking-[-0.03em] ${fit.match >= 75 ? "text-green" : fit.match >= 55 ? "text-blue" : "text-ink-2"}`}>{fit.match}%</p>
      </div>
      {fit.reason && <p className="mt-1 text-[15px] text-ink">{fit.reason}</p>}
      {fit.matched.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {fit.matched.slice(0, 6).map((s) => (
            <li key={s.id} className="rounded-full bg-green-soft px-2.5 py-1 text-[13px] font-medium text-green">
              {s.name}
            </li>
          ))}
        </ul>
      )}
      {fit.missing.length > 0 && (
        <p className="mt-2 text-[13px] text-mute">
          <span className="font-medium text-ink-2">The advert also asks for:</span> {fit.missing.slice(0, 4).map((m) => m.name).join(", ")}
        </p>
      )}
      <p className="mt-3 text-[12px] leading-relaxed text-mute">{fit.explain}</p>
    </div>
  );
}

export function ApplyForm({ jobId, company, title }: { jobId: string; company: string; title: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [cv, setCv] = useState("");
  const [cvName, setCvName] = useState("");
  const [fromResults, setFromResults] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [reading, setReading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ match: number | null } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const consentText = applyConsentText(company, title);

  useEffect(() => {
    const s = readSessionCv();
    if (s) {
      setCv(s.text);
      setCvName(s.fileName || "the CV from your results");
      setFromResults(true);
    }
    setToken(lastResultsToken());
  }, []);

  async function readFile(file: File) {
    setError("");
    setReading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        setError(data.error || "We could not read that file. Please paste your CV instead.");
        return;
      }
      setCv(data.text);
      setCvName(file.name);
      setFromResults(false);
      setPasting(false);
    } catch {
      setError("We could not upload that file. Please try again.");
    } finally {
      setReading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (cv.trim().length < 80) {
      setError("Please add your CV.");
      return;
    }
    if (!consent) {
      setError(`Please tick the box so we can send your application to ${company}.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, name, email, phone: phone || undefined, note: note || undefined, cvText: cv, consent, token: token ?? undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; match?: number | null };
      if (!res.ok) {
        setError(data.error || "We could not send your application. Please try again.");
        return;
      }
      track("job_click", { source: "mms", action: "applied", match: data.match ?? null });
      setSent({ match: data.match ?? null });
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="card-white p-6" role="status">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-green text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className="mt-3 text-[21px] font-semibold tracking-[-0.02em] text-ink">Application sent</p>
        <p className="mt-2 text-[15px] text-ink-2">
          We have sent your application to {company} and emailed you a copy. {company} will contact you directly if they want to take it further.
        </p>
        <Link href="/jobs" className="btn btn-secondary btn-sm mt-4">
          Find more jobs
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-white p-5 sm:p-6" aria-labelledby="apply-title">
      <h2 id="apply-title" className="text-[21px] font-semibold tracking-[-0.02em] text-ink">
        Apply with MatchMySkillset
      </h2>
      <p className="mt-1 text-[14px] text-mute">Sent straight to {company}. No account needed.</p>
      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="apply-name" className="field-label">
            Full name
          </label>
          <input id="apply-name" className="field" required maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="apply-email" className="field-label">
            Email
          </label>
          <input id="apply-email" type="email" className="field" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="apply-phone" className="field-label">
            Phone <span className="font-normal text-mute">(optional)</span>
          </label>
          <input id="apply-phone" type="tel" className="field" maxLength={30} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <p className="field-label">Your CV</p>
          {cv && !pasting ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-cloud px-3 py-2.5 text-[14px]">
              <span className="min-w-0 truncate text-ink">
                {fromResults ? "Using " : ""}
                {cvName || "your pasted CV"}
              </span>
              <button
                type="button"
                className="shrink-0 text-link hover:underline"
                onClick={() => {
                  setCv("");
                  setCvName("");
                  setFromResults(false);
                }}
              >
                Change
              </button>
            </div>
          ) : pasting ? (
            <textarea className="field min-h-[140px] text-[14px]" placeholder="Paste your CV" value={cv} maxLength={12000} onChange={(e) => setCv(e.target.value)} />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-line px-4 py-4 text-center text-[14px] text-mute">
              {reading ? (
                "Reading your file…"
              ) : (
                <>
                  <button type="button" className="font-medium text-link hover:underline" onClick={() => fileInput.current?.click()}>
                    Choose a file
                  </button>{" "}
                  (PDF, Word or text) or{" "}
                  <button type="button" className="font-medium text-link hover:underline" onClick={() => setPasting(true)}>
                    paste it
                  </button>
                </>
              )}
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
            </div>
          )}
        </div>
        <div>
          <label htmlFor="apply-note" className="field-label">
            A note to {company} <span className="font-normal text-mute">(optional)</span>
          </label>
          <textarea id="apply-note" className="field min-h-[90px] text-[15px]" maxLength={1500} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-ink-2">
        <input type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#0071e3]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{consentText}</span>
      </label>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-[#fff2f2] px-3 py-2 text-[14px] text-[#b3261e]">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary mt-4 w-full" disabled={busy || reading}>
        {busy ? "Sending…" : "Send my application"}
      </button>
      <p className="mt-2 text-center text-[12px] text-mute">
        We keep a copy for 12 months.{" "}
        <Link href="/privacy#applying" className="text-link hover:underline">
          Privacy
        </Link>
      </p>
    </form>
  );
}
