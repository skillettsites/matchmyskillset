"use client";

import { useEffect, useRef, useState } from "react";
import { readSessionCv, saveSessionCv } from "@/components/cv/storage";
import { MIN_CV_CHARS } from "@/lib/candidate/plans";

export interface CvChoice {
  /** session: the CV uploaded earlier in this tab; saved: the one kept on the account (read on the server). */
  kind: "none" | "session" | "saved" | "upload" | "paste";
  text: string;
  name: string;
}

export const NO_CV: CvChoice = { kind: "none", text: "", name: "" };

function words(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Where the CV for a pack comes from: the CV already uploaded in this tab
 * (kept in sessionStorage by the CV card), the CV saved on the account, a new
 * upload (read by /api/parse-cv, nothing stored), or pasted text.
 */
export function CvPicker({
  value,
  onChange,
  saved,
  resultsToken,
}: {
  value: CvChoice;
  onChange: (c: CvChoice) => void;
  /** The account's saved CV, if there is one. */
  saved: { name: string | null; at: string } | null;
  /** The results link the job came from, kept with the CV in this tab. */
  resultsToken: string | null;
}) {
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [changing, setChanging] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const s = readSessionCv();
    if (s && s.text.trim().length >= MIN_CV_CHARS) onChange({ kind: "session", text: s.text, name: s.fileName || "the CV you uploaded" });
    else if (saved) onChange({ kind: "saved", text: "", name: saved.name || "your saved CV" });
  }, [onChange, saved]);

  async function read(f: File) {
    setError("");
    setReading(true);
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        setError(data.error || "We could not read that file. Please paste your CV instead.");
        return;
      }
      onChange({ kind: "upload", text: data.text, name: f.name });
      saveSessionCv({ token: resultsToken ?? "", text: data.text, fileName: f.name });
      setChanging(false);
    } catch {
      setError("We could not upload that file. Please try again.");
    } finally {
      setReading(false);
      if (file.current) file.current.value = "";
    }
  }

  const chosen = value.kind === "session" || value.kind === "saved" || value.kind === "upload";

  return (
    <div>
      {chosen && !changing ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cloud px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ink">{value.name}</p>
              <p className="text-[13px] text-mute">
                {value.kind === "saved" ? "Saved on your account" : value.kind === "session" ? `From your results, ${words(value.text)} words` : `${words(value.text)} words`}
              </p>
            </div>
          </div>
          <button type="button" className="text-[14px] font-medium text-link hover:underline" onClick={() => setChanging(true)}>
            Use a different CV
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-secondary btn-sm" disabled={reading} onClick={() => file.current?.click()}>
              {reading ? "Reading your CV..." : "Upload CV (PDF, Word or text)"}
            </button>
            <input
              ref={file}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              aria-label="Upload your CV"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void read(f);
              }}
            />
            {saved && value.kind !== "saved" && (
              <button type="button" className="text-[14px] font-medium text-link hover:underline" onClick={() => (onChange({ kind: "saved", text: "", name: saved.name || "your saved CV" }), setChanging(false))}>
                Use the CV saved on my account
              </button>
            )}
            {chosen && (
              <button type="button" className="text-[14px] text-mute hover:underline" onClick={() => setChanging(false)}>
                Keep {value.name}
              </button>
            )}
          </div>
          <div>
            <label htmlFor="cv-paste" className="field-label">
              Or paste your CV
            </label>
            <textarea
              id="cv-paste"
              className="field min-h-[180px] !text-[15px]"
              placeholder="Paste the whole CV: your jobs, what you did in each, qualifications."
              value={value.kind === "paste" ? value.text : ""}
              onChange={(e) => onChange({ kind: "paste", text: e.target.value.slice(0, 12_000), name: "Pasted CV" })}
            />
            <p className="field-hint">
              {value.kind === "paste" && value.text ? `${words(value.text)} words.` : ""} We only use your CV to write this pack. It is kept inside the pack and deleted with it.
            </p>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}
