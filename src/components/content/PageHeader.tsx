import type { ReactNode } from "react";
import { formatDate, isoDate } from "./format";

/** Who checked the page. Only use for a real, named reviewer. */
export interface Reviewer {
  /** Full name as it should appear. */
  name: string;
  /** Role or credential, e.g. "Recruitment consultant, 15 years in UK hiring". */
  role?: string;
  /** Link to a bio page or profile. */
  href?: string;
}

/** Props for {@link PageHeader}. */
export interface PageHeaderProps {
  /** The page's single H1. Put the question people ask in it. */
  title: ReactNode;
  /** Small label above the title, e.g. "Leaving teaching". */
  kicker?: string;
  /** Lede under the title: answer the question in the first 60 words. */
  intro?: ReactNode;
  /**
   * Date the content was last checked, as ISO ("2026-09-28"). Rendered as
   * "Updated 28 September 2026" in a `<time>` element.
   */
  updated?: string;
  /** Real, named reviewer. Leave out rather than invent one. */
  reviewedBy?: Reviewer;
  /** Slot above the title, normally `<Breadcrumbs />`. */
  breadcrumbs?: ReactNode;
  /** Content after the meta line, e.g. a `<ToolCallout />`. */
  children?: ReactNode;
  /** Extra classes for the header. */
  className?: string;
}

/**
 * The top of a content page: breadcrumbs, eyebrow, H1, grey lede, and a meta
 * line with the updated date and an optional reviewer, over a soft colour
 * glow. The glow is clipped by `main` (overflow-x: clip), so it never causes
 * sideways scrolling.
 */
export function PageHeader({
  title,
  kicker,
  intro,
  updated,
  reviewedBy,
  breadcrumbs,
  children,
  className = "",
}: PageHeaderProps) {
  const dt = updated ? isoDate(updated) : undefined;
  return (
    <header className={`relative isolate pb-10 pt-4 sm:pb-12 sm:pt-6 ${className}`}>
      <div className="hero-glow -top-[180px] -z-10 !opacity-[0.13]" aria-hidden="true" />
      {breadcrumbs && <div className="mb-6 sm:mb-8">{breadcrumbs}</div>}
      {kicker && <p className="eyebrow text-link">{kicker}</p>}
      <h1 className="mt-2 max-w-[21ch] text-h1 font-bold text-ink">{title}</h1>
      {intro && (
        <div className="mt-6 max-w-[40rem] space-y-3 text-lede font-medium text-mute [&_a]:text-link [&_a]:underline [&_a]:decoration-[rgba(0,102,204,0.35)] [&_a]:underline-offset-[0.2em] [&_a:hover]:decoration-current [&_strong]:font-semibold [&_strong]:text-ink">
          {intro}
        </div>
      )}
      {(updated || reviewedBy) && (
        <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-mute">
          {updated && (
            <span className="inline-flex items-center gap-2 rounded-full bg-cloud px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" aria-hidden="true" />
              <span>
                Updated{" "}
                {dt ? (
                  <time dateTime={dt} className="font-semibold text-ink-2">
                    {formatDate(updated)}
                  </time>
                ) : (
                  <span className="font-semibold text-ink-2">{updated}</span>
                )}
              </span>
            </span>
          )}
          {reviewedBy && (
            <span>
              Reviewed by{" "}
              {reviewedBy.href ? (
                <a href={reviewedBy.href} className="link font-semibold">
                  {reviewedBy.name}
                </a>
              ) : (
                <span className="font-semibold text-ink-2">{reviewedBy.name}</span>
              )}
              {reviewedBy.role && <>, {reviewedBy.role}</>}
            </span>
          )}
        </p>
      )}
      {children && <div className="mt-10 [&>p]:max-w-[44rem]">{children}</div>}
    </header>
  );
}
