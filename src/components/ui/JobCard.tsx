"use client";

import type { JobListing } from "@/lib/apis/jobs/types";
import { track } from "@/lib/analytics";

function postedLabel(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 60) return `Posted ${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  return `Posted ${new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

/**
 * One live vacancy. The whole card opens the original advert on the board
 * that listed it (the board is named on the card), in a new tab, and records
 * the click. No match score is shown: nothing computes one for adverts.
 */
export function JobCard({ job, position }: { job: JobListing; position?: number }) {
  function handleClick() {
    track("job_click", { source: job.source, position: position ?? null });
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: job.source, jobId: job.id, jobTitle: job.title, jobUrl: job.url }),
      keepalive: true,
    }).catch(() => {});
  }

  const posted = postedLabel(job.postedAt);

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block rounded-lg border border-rule bg-surface p-5 shadow-card transition-shadow hover:border-accent/40 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="rounded bg-paper-2 px-1.5 py-0.5 font-semibold text-ink-2">{job.sourceLabel}</span>
            {job.remote === "yes" && <span className="rounded bg-accent-wash px-1.5 py-0.5 font-semibold text-accent">Remote</span>}
            {posted && <span className="text-muted">{posted}</span>}
          </div>
          <h3 className="text-lg font-semibold leading-snug text-ink group-hover:text-accent">{job.title}</h3>
          <p className="mt-0.5 text-[0.9375rem] text-ink-2">{job.company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
            {job.salary && <span className="font-semibold tabular-nums text-ink">{job.salary}</span>}
            {job.contractType && <span className="capitalize">{job.contractType}</span>}
          </div>
          {job.remote === "maybe" && (
            <p className="mt-1 text-xs text-muted">Came up in a remote search. Check the advert for how much home working it offers.</p>
          )}
          {job.snippet && <p className="mt-2 line-clamp-2 text-sm text-muted">{job.snippet}</p>}
        </div>
        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-rule-strong group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      <span className="sr-only"> (opens the advert on {job.sourceLabel} in a new tab)</span>
    </a>
  );
}
