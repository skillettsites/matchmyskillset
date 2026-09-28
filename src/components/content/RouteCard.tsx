import Link from "next/link";
import type { ReactNode } from "react";
import { formatGBPChange, formatMonths, isNumber, type PayPeriod } from "./format";
import { titleInSentence } from "@/lib/text";
import { SalaryFigure } from "./SalaryFigure";

/** Props for {@link RouteCard}. */
export interface RouteCardProps {
  /** The job people are leaving, e.g. "Teacher". */
  from: string;
  /** The job they move into, e.g. "Learning and development adviser". */
  to: string;
  /** Link to the guide for this route. Makes the whole card clickable. */
  href?: string;
  /** Text for the link hint at the foot of the card. Defaults to "Read the guide". */
  linkLabel?: string;
  /** One or two sentences on why the move works. */
  summary?: ReactNode;
  /** Median pay for the destination job, in pounds. Omit if you cannot cite it. */
  medianPay?: number;
  /** Median pay for the starting job, in pounds. Used to work out the change. */
  fromPay?: number;
  /**
   * Pay change in pounds (destination minus starting job). If omitted and
   * both `medianPay` and `fromPay` are given, it is calculated.
   */
  payChange?: number;
  /** Period for the pay figures. Defaults to "year". */
  payPeriod?: PayPeriod;
  /**
   * The usual way in, e.g. "CIPD Level 3 Foundation Certificate in People Practice".
   * Keep it plain text when `href` is set: the whole card is one link.
   */
  entryRoute?: ReactNode;
  /** Typical time to make the switch in months: a number or a [min, max] range. */
  timeToSwitchMonths?: number | readonly [number, number];
  /** Citation for the pay figures, normally a `<SourceNote />`. Shown only when pay is shown. */
  source?: ReactNode;
  /** Heading level for the route. Defaults to 3. */
  headingLevel?: 2 | 3 | 4;
  /** Extra classes for the card. */
  className?: string;
}

/**
 * The recurring route motif as a card: an open ring for the job you do now,
 * a dotted line, and a solid dot for where you could go. Every number is
 * optional and nothing numeric renders unless you pass it, so a card with
 * no sourced data shows only the route, the summary and the entry route.
 */
export function RouteCard({
  from,
  to,
  href,
  linkLabel = "Read the guide",
  summary,
  medianPay,
  fromPay,
  payChange,
  payPeriod = "year",
  entryRoute,
  timeToSwitchMonths,
  source,
  headingLevel = 3,
  className = "",
}: RouteCardProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const change = isNumber(payChange)
    ? payChange
    : isNumber(medianPay) && isNumber(fromPay)
      ? medianPay - fromPay
      : undefined;
  const hasPay = isNumber(medianPay) || isNumber(change);
  const hasTime =
    isNumber(timeToSwitchMonths) ||
    (Array.isArray(timeToSwitchMonths) && timeToSwitchMonths.every(isNumber));
  const hasDetails = Boolean(entryRoute) || hasTime;

  const route = (
    <span className="grid grid-cols-[1.25rem_1fr] gap-x-3">
      <span aria-hidden="true" className="flex flex-col items-center pt-[0.3rem]">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink-2 bg-paper" />
        <span className="mt-1 w-0 flex-1 border-l-2 border-dotted border-rule-strong" />
      </span>
      <span className="block pb-3">
        <span className="kicker block">From</span>
        <span className="block text-lg leading-snug text-ink-2">{from}</span>
      </span>
      <span aria-hidden="true" className="flex flex-col items-center">
        <span className="h-1.5 w-0 border-l-2 border-dotted border-rule-strong" />
        <span className="h-4 w-4 shrink-0 rounded-full bg-accent ring-4 ring-accent-soft" />
      </span>
      <span className="block">
        <span className="kicker block text-accent">To</span>
        <span className="block font-serif text-[1.5rem] font-semibold leading-tight tracking-[-0.01em] text-ink">
          {to}
        </span>
      </span>
    </span>
  );

  return (
    <article
      className={`group relative flex flex-col rounded-lg border border-rule bg-surface p-5 shadow-card transition-shadow sm:p-6 ${
        href ? "hover:border-accent/40 hover:shadow-lift" : ""
      } ${className}`}
    >
      <Heading className="font-sans font-normal">
        {href ? (
          <Link href={href} className="block rounded-sm after:absolute after:inset-0 after:rounded-lg after:content-['']">
            {route}
          </Link>
        ) : (
          route
        )}
      </Heading>

      {hasPay && (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2 pl-8">
          {isNumber(medianPay) && (
            <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-sm text-muted">Median pay</span>
              <SalaryFigure value={medianPay} period={payPeriod} size="md" />
            </span>
          )}
          {isNumber(change) && (
            <span
              className={`inline-flex items-baseline gap-1 rounded px-2 py-0.5 text-sm font-semibold tabular-nums lining-nums ${
                change < 0 ? "bg-negative-soft text-negative" : "bg-highlight-soft text-highlight-ink"
              }`}
            >
              {formatGBPChange(change, payPeriod)}
              <span className="font-normal">vs {titleInSentence(from)}</span>
            </span>
          )}
        </div>
      )}

      {summary && <p className="mt-4 pl-8 text-[0.9375rem] leading-relaxed text-ink-2">{summary}</p>}

      {hasDetails && (
        <dl className="mt-4 space-y-2 border-t border-rule pt-4 pl-8 text-[0.9375rem]">
          {entryRoute && (
            <div>
              <dt className="kicker">Way in</dt>
              <dd className="mt-0.5 text-ink-2">{entryRoute}</dd>
            </div>
          )}
          {hasTime && timeToSwitchMonths !== undefined && (
            <div>
              <dt className="kicker">Time to switch</dt>
              <dd className="mt-0.5 tabular-nums text-ink-2">{formatMonths(timeToSwitchMonths)}</dd>
            </div>
          )}
        </dl>
      )}

      {/* Raised above the stretched card link so the citation link stays clickable. */}
      {hasPay && source && <div className="relative z-10 mt-3 pl-8">{source}</div>}

      {href && (
        <p aria-hidden="true" className="mt-auto pl-8 pt-4 text-[0.9375rem] font-semibold text-accent">
          <span className="group-hover:underline">{linkLabel}</span>
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </p>
      )}
    </article>
  );
}
