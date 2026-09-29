"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TrackableJob } from "@/components/tracking/TrackApplied";
import { recordApplyClick, wasOpenedFromList } from "./apply";

/** "Back to your matches": returns to the same place in the list when the page was opened from it. */
export function JobBackLink({ id, href, label }: { id: string; href: string; label: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[15px] font-medium text-link hover:underline"
      onClick={(e) => {
        if (wasOpenedFromList(id) && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Link>
  );
}

/** The Apply button for an advert on another site, with the "Did you apply?" tracker prompt. */
export function JobApplyButton({ job, match }: { job: TrackableJob & { sourceLabel: string }; match?: number }) {
  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-primary"
      onClick={() => recordApplyClick({ id: job.id, source: job.source, title: job.title, url: job.url, match }, undefined, "job_page")}
    >
      Apply on {job.sourceLabel}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17L17 7M9 7h8v8" />
      </svg>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
