"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { postedLabel } from "./format";

/** What a job card needs. Built from a results snapshot or a /jobs search. */
export interface CardJob {
  id: string;
  source: string;
  sourceLabel: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary?: string;
  contractText?: string;
  postedAt?: string;
  workplace?: "onsite" | "hybrid" | "remote" | null;
  snippet?: string;
  /** Present when the job was scored against a CV. */
  match?: number;
  reason?: string;
  explain?: string;
  matchedNames?: string[];
  missingNames?: string[];
  /** Skills our careers data says this kind of job usually needs, that the person has (not from the advert). */
  typicalNames?: string[];
  /** What the match rests on: skills in the advert, only the usual skills for the job, or the title alone. */
  evidence?: "advert" | "typical" | "title";
  /** Seniority compared with the person's. */
  level?: "up" | "similar" | "down";
}

const LEVEL_TEXT: Record<"up" | "similar" | "down", string> = { up: "Step up", similar: "Similar level", down: "Step down" };

function matchTone(m: number): { ring: string; text: string } {
  if (m >= 75) return { ring: "#1d7f37", text: "text-green" };
  if (m >= 55) return { ring: "#0071e3", text: "text-blue" };
  return { ring: "#86868b", text: "text-ink-2" };
}

function MatchDial({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const tone = matchTone(value);
  return (
    <div className="relative h-[60px] w-[60px] shrink-0" aria-hidden="true">
      <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#e8e8ed" strokeWidth="5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={tone.ring} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} />
      </svg>
      <span className={`absolute inset-0 grid place-items-center text-[15px] font-bold tabular-nums tracking-[-0.02em] ${tone.text}`}>{value}%</span>
    </div>
  );
}

function recordClick(job: CardJob, position: number | undefined) {
  track("job_click", { source: job.source, position: position ?? null, match: job.match ?? null });
  if (job.source === "mms") return;
  fetch("/api/track-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: job.source, jobId: job.id, jobTitle: job.title, jobUrl: job.url }),
    keepalive: true,
  }).catch(() => {});
}

export function MatchJobCard({ job, position, tailorHref }: { job: CardJob; position?: number; /** CV tools: "Tailor my CV for this job" link, on results pages. */ tailorHref?: string }) {
  const [why, setWhy] = useState(false);
  const mms = job.source === "mms";
  const posted = postedLabel(job.postedAt);
  const hasMatch = typeof job.match === "number";

  return (
    <article className={`card-white p-5 sm:p-6 ${mms ? "ring-2 ring-blue/25" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px]">
            {mms ? (
              <span className="pill !px-2.5 !py-0.5 bg-blue text-[12px] text-white">Posted on MatchMySkillset</span>
            ) : (
              <span className="pill !px-2.5 !py-0.5 bg-cloud text-[12px] text-ink-2">{job.sourceLabel}</span>
            )}
            {job.workplace === "remote" && <span className="pill !px-2.5 !py-0.5 bg-green-soft text-[12px] text-green">Remote</span>}
            {job.workplace === "hybrid" && <span className="pill !px-2.5 !py-0.5 bg-green-soft text-[12px] text-green">Hybrid</span>}
            {hasMatch && job.level && (
              <span className={`pill !px-2.5 !py-0.5 text-[12px] ${job.level === "up" ? "bg-sky text-link" : "bg-cloud text-ink-2"}`} title="Seniority compared with your current level">
                {LEVEL_TEXT[job.level]}
              </span>
            )}
            {posted && <span className="text-mute">{posted}</span>}
          </div>
          <h3 className="mt-2 text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink">
            {mms ? (
              <Link href={job.url} className="hover:text-blue" onClick={() => recordClick(job, position)}>
                {job.title}
              </Link>
            ) : (
              job.title
            )}
          </h3>
          <p className="mt-0.5 text-[15px] text-ink-2">
            {job.company}
            <span className="text-mute-2"> · </span>
            <span className="text-mute">{job.location}</span>
          </p>
          {(job.salary || job.contractText) && (
            <p className="mt-1.5 flex flex-wrap gap-x-3 text-[14px]">
              {job.salary && <span className="font-semibold tabular-nums text-ink">{job.salary}</span>}
              {job.contractText && <span className="capitalize text-mute">{job.contractText}</span>}
            </p>
          )}
        </div>
        {hasMatch && (
          <div className="flex flex-col items-center">
            <MatchDial value={job.match!} />
            <span className={`mt-1 text-center text-[12px] font-medium leading-tight text-mute ${job.evidence === "title" ? "max-w-[72px]" : ""}`}>
              {job.evidence === "title" ? "Title match only" : "match"}
            </span>
          </div>
        )}
      </div>

      {hasMatch && job.reason && (
        <p className="mt-3 flex items-start gap-2 text-[15px] text-ink">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-green" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{job.reason}</span>
        </p>
      )}

      {hasMatch && ((job.matchedNames?.length ?? 0) > 0 || (job.missingNames?.length ?? 0) > 0 || (job.typicalNames?.length ?? 0) > 0) && (
        <div className="mt-3 space-y-2">
          {(job.matchedNames?.length ?? 0) > 0 && (
            <div>
              <p className="mb-1 text-[13px] font-medium text-ink-2">Your matching skills</p>
              <ul className="flex flex-wrap gap-1.5" aria-label="Your skills that this advert names">
                {job.matchedNames!.slice(0, 5).map((n) => (
                  <li key={n} className="rounded-full bg-green-soft px-2.5 py-1 text-[13px] font-medium text-green">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(job.typicalNames?.length ?? 0) > 0 && (
            <p className="text-[13px] text-mute">
              <span className="font-medium text-ink-2">Typical for this role, you have:</span> {job.typicalNames!.slice(0, 4).join(", ")}{" "}
              <span>(from our careers data, not the advert)</span>
            </p>
          )}
          {(job.missingNames?.length ?? 0) > 0 && (
            <p className="text-[13px] text-mute">
              <span className="font-medium text-ink-2">The advert also asks for:</span> {job.missingNames!.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
      )}

      {!hasMatch && job.snippet && <p className="mt-3 line-clamp-2 text-[14px] text-mute">{job.snippet}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {mms ? (
          <Link href={job.url} className="btn btn-primary btn-sm" onClick={() => recordClick(job, position)}>
            Apply with MatchMySkillset
          </Link>
        ) : (
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" onClick={() => recordClick(job, position)}>
            Apply on {job.sourceLabel}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        {hasMatch && job.explain && (
          <button type="button" className="text-[13px] text-link hover:underline" aria-expanded={why} onClick={() => setWhy((v) => !v)}>
            Why {job.match}%?
          </button>
        )}
        {/* CV tools: tailor the CV for this job (src/app/tools/tailor). */}
        {tailorHref && (
          <Link href={tailorHref} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-link hover:underline">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </svg>
            Tailor my CV for this job
          </Link>
        )}
      </div>
      {why && job.explain && <p className="mt-2 rounded-xl bg-cloud px-3 py-2 text-[13px] leading-relaxed text-ink-2">{job.explain}</p>}
    </article>
  );
}
