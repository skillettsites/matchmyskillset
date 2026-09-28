import Link from "next/link";
import type { ReactNode } from "react";

/** Props for {@link ToolCallout}. */
export interface ToolCalloutProps {
  /**
   * The reader's current job, e.g. "teacher". Prefills the job box and adds
   * `?current=<value>` to the CV link so the tool can start from it.
   */
  current?: string;
  /** Heading. Defaults to "See where your experience could take you". */
  heading?: string;
  /** Body copy. Defaults to the free, no-account description. */
  body?: ReactNode;
  /** Heading level. Defaults to 2. */
  headingLevel?: 2 | 3;
  /** Anchor id. Defaults to "check-your-options". */
  id?: string;
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * The inline entry point to the personal analysis: "paste your CV" or
 * "type the job you do now", both going to /discover. Works without
 * JavaScript (the job box is a plain GET form).
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
  // One default for every job avoids "a"/"an" and plural mistakes; pass
  // `heading` for a tailored line such as "Leaving teaching? See your options".
  const title = heading ?? "See where your experience could take you";

  return (
    <aside
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative overflow-hidden rounded-xl border border-accent/25 bg-accent-wash p-5 sm:p-7 ${className}`}
    >
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-10">
        <div>
          <p className="kicker text-accent">Free, no account needed</p>
          <H id={`${id}-title`} className="mt-2 font-serif text-[1.625rem] font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </H>
          <div className="mt-3 text-ink-2">
            {body ?? (
              <p>
                Paste your CV and get a personal analysis of the skills you
                already have and the jobs they lead to. Or start from the job
                you do now.
              </p>
            )}
          </div>
          <Link href={cvHref} className="btn btn-primary btn-lg mt-5 w-full sm:w-auto">
            Paste my CV
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <form action="/discover" method="get" className="rounded-lg border border-rule bg-surface p-4 sm:p-5">
          <label htmlFor={`${id}-job`} className="block font-semibold text-ink">
            Or type the job you do now
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id={`${id}-job`}
              name="current"
              type="text"
              defaultValue={current}
              autoComplete="organization-title"
              placeholder="For example, primary teacher"
              className="min-h-12 w-full min-w-0 flex-1 rounded-md border border-rule-strong bg-white px-3 text-base text-ink placeholder:text-muted focus:border-accent"
            />
            <button type="submit" className="btn btn-secondary min-h-12 shrink-0">
              See options
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
