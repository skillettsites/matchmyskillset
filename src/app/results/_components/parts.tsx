import { SalaryFigure, SourceNote, formatGBP, formatGBPChange } from "@/components/content";
import { PAY_SOURCE, describeApprenticeship, type NamedSkill, type PayPicture, type PresentedMatch } from "@/lib/skills/present";
import { titleInSentence } from "@/lib/text";

/** ONS pay for one destination, always with its basis and source. */
export function PayBlock({
  pay,
  change,
  fromTitle,
  scope,
  note,
  detailed = false,
}: {
  pay: PayPicture;
  change: PresentedMatch["payChange"];
  fromTitle: string | null;
  scope: string;
  note?: string;
  detailed?: boolean;
}) {
  if (pay.median === null) {
    return (
      <div>
        <p className="text-[0.9375rem] text-ink-2">ONS did not publish a reliable pay figure for this group of jobs.</p>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
        <SourceNote className="mt-1" source={PAY_SOURCE.name} href={PAY_SOURCE.href} published={PAY_SOURCE.published} />
      </div>
    );
  }
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm text-muted">Median pay, {pay.basis === "ft" ? "full-time" : "all employees"}</span>
        <SalaryFigure value={pay.median} size="md" />
        {change && fromTitle && (
          <span
            className={`inline-flex items-baseline gap-1 rounded px-2 py-0.5 text-sm font-semibold tabular-nums ${
              change.change < 0 ? "bg-negative-soft text-negative" : "bg-highlight-soft text-highlight-ink"
            }`}
          >
            {formatGBPChange(change.change)}
            <span className="font-normal">vs {titleInSentence(fromTitle)}</span>
          </span>
        )}
      </p>
      {pay.p25 !== null && pay.p75 !== null && (
        <p className="mt-1 text-[0.9375rem] text-ink-2">
          The middle half earn between <span className="font-semibold tabular-nums text-ink">{formatGBP(pay.p25)}</span> and{" "}
          <span className="font-semibold tabular-nums text-ink">{formatGBP(pay.p75)}</span> a year.
        </p>
      )}
      {detailed && pay.p10 !== null && pay.p90 !== null && (
        <p className="mt-1 text-[0.9375rem] text-ink-2">
          One in ten earn under <span className="font-semibold tabular-nums text-ink">{formatGBP(pay.p10)}</span> and one in ten
          over <span className="font-semibold tabular-nums text-ink">{formatGBP(pay.p90)}</span>.
        </p>
      )}
      {pay.basis === "all" && <p className="mt-1 text-sm text-muted">This is for all employees, including part-time, because ONS did not publish a reliable full-time figure.</p>}
      <SourceNote
        className="mt-1.5"
        source={PAY_SOURCE.name}
        href={PAY_SOURCE.href}
        published={PAY_SOURCE.published}
        note={
          <>
            Gross annual pay, {pay.basis === "ft" ? "full-time employees" : "all employee jobs"}, UK.{" "}
            {change ? `The change compares ONS medians for both jobs on the same basis. ` : ""}
            {scope}
            {note ? ` ${note}` : ""}
          </>
        }
      />
    </div>
  );
}

export function SkillChips({ skills, tone }: { skills: NamedSkill[]; tone: "have" | "close" | "gap" | "neutral" }) {
  if (skills.length === 0) return null;
  const style =
    tone === "have"
      ? "border-accent/30 bg-accent-wash text-ink"
      : tone === "close"
        ? "border-rule-strong bg-surface text-ink-2"
        : tone === "gap"
          ? "border-dashed border-rule-strong bg-paper text-ink-2"
          : "border-rule bg-surface text-ink";
  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <li key={`${tone}-${s.id}`} className={`rounded-full border px-2.5 py-1 text-sm ${style}`}>
          {s.name}
          {tone === "close" && s.viaName && <span className="text-muted"> (close to your {s.viaName})</span>}
        </li>
      ))}
    </ul>
  );
}

/** The main ways in, all from the dataset: apprenticeships, licences, NCS routes, degree flag. */
export function WaysIn({ match, limit = 2 }: { match: PresentedMatch; limit?: number }) {
  const apps = match.apprenticeships.slice(0, limit);
  return (
    <div className="space-y-2 text-[0.9375rem] text-ink-2">
      <p>
        {match.degreeUsuallyRequired
          ? "A degree (or a degree apprenticeship) is the usual way in."
          : "You do not usually need a degree to get in."}
        {match.ncsRoutes.length > 0 && <> The National Careers Service lists: {match.ncsRoutes.join(", ")}.</>}
      </p>
      {apps.length > 0 && (
        <ul className="space-y-1">
          {apps.map((a) => (
            <li key={a.referenceNumber}>
              <a href={a.url} className="link" rel="noopener" target="_blank">
                {a.title} apprenticeship
              </a>{" "}
              <span className="text-muted">({describeApprenticeship(a)})</span>
            </li>
          ))}
        </ul>
      )}
      {match.licences.length > 0 && (
        <p>
          You will need:{" "}
          {match.licences.map((l, i) => (
            <span key={l.name}>
              {i > 0 && ", "}
              <a href={l.url} className="link" rel="noopener" target="_blank">
                {l.name}
              </a>
              {l.scope ? ` (${l.scope})` : ""}
            </span>
          ))}
          .
        </p>
      )}
    </div>
  );
}
