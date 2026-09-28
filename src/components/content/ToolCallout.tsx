import Link from "next/link";
import type { ReactNode } from "react";
import { MatchRing } from "@/components/marketing/ResultsMockup";
import { Check, ChevronRight } from "@/components/marketing/Icons";

/** Props for {@link ToolCallout}. */
export interface ToolCalloutProps {
  /**
   * The reader's current job, e.g. "teacher". Added to the upload link as
   * `?current=<value>` so the CV tool can start from it.
   */
  current?: string;
  /** Heading. Defaults to "Upload your CV to see matching jobs". */
  heading?: string;
  /** Body copy. Defaults to a line on what the CV match does. */
  body?: ReactNode;
  /** Heading level. Defaults to 2. */
  headingLevel?: 2 | 3;
  /** Anchor id. Defaults to "check-your-options". */
  id?: string;
  /** Extra classes for the wrapper. */
  className?: string;
}

const DEFAULT_HEADING = "Upload your CV to see matching jobs";

// Illustrative rows for the little preview. Generic titles, no employers, no
// salaries, and labelled as examples.
const PREVIEW = [
  { title: "Operations Manager", match: 86 },
  { title: "Project Coordinator", match: 74 },
];

/**
 * The inline call to action on content pages: upload your CV and see live
 * UK jobs scored against your skills. Links to /discover (keeping
 * `?current=`), with a second link to the live job search. No JavaScript.
 */
export function ToolCallout({
  current,
  heading,
  body,
  headingLevel = 2,
  id = "check-your-options",
  className = "",
}: ToolCalloutProps) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const cvHref = current ? `/discover?current=${encodeURIComponent(current)}` : "/discover";
  const title = heading ?? DEFAULT_HEADING;

  return (
    <aside
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative isolate overflow-hidden rounded-[28px] bg-cloud p-6 sm:p-10 ${className}`}
    >
      <div className="hero-glow -z-10 !left-[85%] -top-[40%] !w-[640px] !opacity-[0.16]" aria-hidden="true" />
      <div className="grid gap-8 md:grid-cols-[1.25fr_1fr] md:items-center md:gap-12">
        <div>
          <p className="eyebrow text-link">{heading ? DEFAULT_HEADING : "Free CV match"}</p>
          <H id={`${id}-title`} className="mt-2 text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[34px]">
            {title}
          </H>
          <div className="mt-4 space-y-3 text-[17px] leading-relaxed text-ink-2">
            {body ?? (
              <p>
                We pick out the skills in your CV and score live UK jobs against them, so you can see which you could apply for now,
                and which careers fit you.
              </p>
            )}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href={cvHref} className="btn btn-primary btn-lg">
              Upload your CV
            </Link>
            <Link href="/jobs" className="link-more justify-center sm:justify-start">
              Browse live jobs
              <ChevronRight />
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-mute">Free, with no account.</p>
        </div>

        <div className="hidden md:block" aria-hidden="true">
          <div className="rounded-[22px] bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">Your matches</p>
              <span className="rounded-full bg-cloud px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-mute">
                Example
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {PREVIEW.map((j) => (
                <li key={j.title} className="flex items-center gap-3 rounded-2xl bg-snow p-2.5 ring-1 ring-black/[0.04]">
                  <MatchRing value={j.match} size={42} />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">{j.title}</p>
                    <p className="text-[11px] text-mute">Example listing</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-green">
              <Check className="h-3.5 w-3.5" />
              Skills you share, and the ones to learn
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
