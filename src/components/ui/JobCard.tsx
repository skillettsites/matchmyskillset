"use client";

import type { UnifiedJob } from "@/lib/types";

const sourceLabels: Record<string, { label: string; colour: string }> = {
  adzuna: { label: "Adzuna", colour: "bg-blue-50 text-blue-700" },
  reed: { label: "Reed", colour: "bg-purple-50 text-purple-700" },
  jooble: { label: "Jooble", colour: "bg-teal-50 text-teal-700" },
  featured: { label: "Featured", colour: "bg-indigo-100 text-indigo-700" },
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

export function JobCard({ job }: { job: UnifiedJob }) {
  const source = sourceLabels[job.source] || {
    label: job.source,
    colour: "bg-gray-50 text-gray-600",
  };

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
      className={`block rounded-xl border p-5 hover:shadow-md transition-all ${
        job.isFeatured
          ? "border-indigo-200 bg-indigo-50/30"
          : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${source.colour}`}
            >
              {source.label}
            </span>
            {job.matchScore && job.matchScore > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                {job.matchScore}% match
              </span>
            )}
            {job.postedDate && (
              <span className="text-xs text-gray-400">
                {timeAgo(job.postedDate)}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {job.location}
            </span>
            {job.salaryDisplay && !job.salaryDisplay.includes("£0k") && (
              <span className="font-medium text-gray-700">
                {job.salaryDisplay}
              </span>
            )}
            {job.contractType && (
              <span className="capitalize">{job.contractType}</span>
            )}
          </div>
          {job.descriptionSnippet && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {job.descriptionSnippet}
            </p>
          )}
        </div>
        <svg
          className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </a>
  );
}
