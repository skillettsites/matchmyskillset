"use client";

import type { UnifiedJob } from "@/lib/types";

const sourceLabels: Record<string, string> = {
  adzuna: "Adzuna",
  reed: "Reed",
  jooble: "Jooble",
  featured: "Featured",
};

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  if (diff < 0) return "Today";
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/**
 * One live vacancy in the /jobs results. Opens the advert on the job board in
 * a new tab and records the click. Match scores are not shown: nothing
 * computes them yet, so a percentage would be invented.
 */
export function JobCard({ job }: { job: UnifiedJob }) {
  const source = sourceLabels[job.source] || job.source;

  function handleClick() {
    // Fire-and-forget click tracking
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: job.source,
        jobId: job.id,
        jobTitle: job.title,
        jobUrl: job.url,
      }),
    }).catch(() => {}); // never block on tracking
  }

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`group block rounded-lg border p-5 shadow-card transition-shadow hover:shadow-lift ${
        job.isFeatured ? "border-accent/40 bg-accent-wash" : "border-rule bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="rounded bg-paper-2 px-1.5 py-0.5 font-semibold text-ink-2">{source}</span>
            {job.postedDate && <span className="text-muted">{timeAgo(job.postedDate)}</span>}
          </div>
          <h3 className="truncate text-lg font-semibold text-ink group-hover:text-accent">{job.title}</h3>
          <p className="mt-0.5 text-[0.9375rem] text-ink-2">{job.company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
            {job.salaryDisplay && !job.salaryDisplay.includes("£0k") && (
              <span className="font-semibold tabular-nums text-ink">{job.salaryDisplay}</span>
            )}
            {job.contractType && <span className="capitalize">{job.contractType}</span>}
          </div>
          {job.descriptionSnippet && (
            <p className="mt-2 line-clamp-2 text-sm text-muted">{job.descriptionSnippet}</p>
          )}
        </div>
        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-rule-strong group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
