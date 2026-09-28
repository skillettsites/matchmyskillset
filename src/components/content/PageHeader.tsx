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
 * The top of a content page: breadcrumbs, kicker, H1, lede, and a meta line
 * with the updated date and an optional reviewer.
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
    <header className={`pb-8 pt-4 sm:pt-6 ${className}`}>
      {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
      {kicker && <p className="kicker text-accent">{kicker}</p>}
      <h1 className="mt-2 max-w-[22ch] text-h1 font-semibold text-ink">{title}</h1>
      {intro && <div className="mt-5 max-w-reading text-lede text-ink-2">{intro}</div>}
      {(updated || reviewedBy) && (
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule pt-4 text-sm text-muted">
          {updated && (
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
      {children && <div className="mt-8">{children}</div>}
    </header>
  );
}
