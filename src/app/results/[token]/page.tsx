import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Disclosure, RouteCard, formatDate } from "@/components/content";
import { getCareerOccupation } from "@/data/careers";
import { getReportByToken } from "@/lib/apis/reports-db";
import { REPORT_PRICE_LABEL } from "@/lib/apis/report-product";
import { isMatchesDoc, isSkillsDoc } from "@/lib/skills/profile";
import { FLAG_TEXT, presentMatch, profileSkillNames, resolveCurrentJob, type PresentedMatch } from "@/lib/skills/present";
import { METHOD_SUMMARY } from "@/lib/skills/scoring";
import { coursesForSkill, occupationCourseLinks, skillsBootcampLink, FIND_APPRENTICESHIP_URL } from "@/lib/affiliate/courses";
import { AffiliateLink } from "@/lib/affiliate/AffiliateLink";
import { CONTACT_EMAIL } from "@/lib/site";
import { PayBlock, SkillChips, WaysIn } from "../_components/parts";
import { EmailLinkForm, ReportCheckout, ViewEvent } from "./ResultsClient";
import { VacancyCount, VacancyFallback } from "./VacancyCount";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your career matches",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

function MatchCard({
  match,
  rank,
  token,
  fromTitle,
  region,
}: {
  match: PresentedMatch;
  rank: number;
  token: string;
  fromTitle: string | null;
  region: string | null;
}) {
  const aliases = getCareerOccupation(match.occupationId)?.aliases ?? [];
  return (
    <article id={`match-${match.occupationId}`} className="scroll-mt-24 rounded-lg border border-rule bg-surface p-5 shadow-card sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="kicker">Match {rank}</p>
        <div className="flex items-center gap-2" aria-label={`Skill match ${match.score} per cent`}>
          <span className="text-sm text-muted">Skill match</span>
          <span className="relative h-2 w-24 overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
            <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${Math.min(100, match.score)}%` }} />
          </span>
          <span className="font-semibold tabular-nums text-ink">{match.score}%</span>
        </div>
      </div>

      <RouteCard
        from={fromTitle ?? "Your experience"}
        to={match.title}
        summary={match.whyFits}
        headingLevel={3}
        className="mt-2 border-0! bg-transparent! p-0! shadow-none! sm:p-0!"
      />

      <p className="mt-3 pl-8 text-[0.9375rem] text-muted">{match.description}</p>

      {match.flags.length > 0 && (
        <ul className="mt-3 space-y-1 pl-8 text-sm text-ink-2">
          {match.flags.map((f) => (
            <li key={f} className="rounded bg-paper-2 px-2 py-1">
              {FLAG_TEXT[f] ?? f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-5 border-t border-rule pt-5 md:grid-cols-2">
        <section aria-label="Pay">
          <h4 className="kicker mb-1.5">Pay</h4>
          <PayBlock pay={match.pay} change={match.payChange} fromTitle={fromTitle} scope={match.payScope} note={match.payNote} />
        </section>
        <section aria-label="Skills">
          <h4 className="kicker mb-1.5">Your skills for this job</h4>
          <div className="space-y-2">
            <SkillChips skills={match.matched} tone="have" />
            <SkillChips skills={match.related} tone="close" />
            {match.gaps.length > 0 && (
              <div>
                <p className="mb-1 text-sm text-muted">To build:</p>
                <SkillChips skills={match.gaps} tone="gap" />
              </div>
            )}
          </div>
        </section>
        <section aria-label="Ways in">
          <h4 className="kicker mb-1.5">Ways in</h4>
          <WaysIn match={match} />
          {match.ncsUrl && (
            <p className="mt-2 text-sm">
              <a href={match.ncsUrl} className="link" rel="noopener" target="_blank">
                National Careers Service profile
              </a>
            </p>
          )}
        </section>
        <section aria-label="Live vacancies">
          <h4 className="kicker mb-1.5">Live vacancies</h4>
          <Suspense fallback={<VacancyFallback />}>
            <VacancyCount title={match.title} aliases={aliases} region={region} />
          </Suspense>
        </section>
      </div>

      <div className="mt-6 border-t border-rule pt-5">
        <ReportCheckout token={token} occupationId={match.occupationId} title={match.title} position={rank} />
      </div>
    </article>
  );
}

export default async function ResultsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { token } = await params;
  const sp = await searchParams;
  const report = await getReportByToken(token);
  if (!report) notFound();

  const doc = isSkillsDoc(report.skills) ? report.skills : null;
  const current = resolveCurrentJob(doc);
  const items = isMatchesDoc(report.matches) ? report.matches.items : [];
  const matches = items.map((m) => presentMatch(m, doc, current)).filter((m): m is PresentedMatch => m !== null);
  const fromTitle = doc?.currentRole ?? report.current_role ?? null;
  const region = doc?.region ?? null;
  const skills = profileSkillNames(doc?.skills ?? []);
  const cancelled = sp.checkout === "cancelled";
  const top = matches[0];
  const prefs = doc?.preferences;
  const unchecked = prefs ? [prefs.avoidWeekends && "no weekend work", prefs.wantRemote && "working from home", prefs.avoidShifts && "no shift work", prefs.partTime && "part-time hours"].filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-14">
      <ViewEvent event="results_viewed" params={{ mode: doc?.source ?? "unknown", matches: matches.length }} onceKey={`results_${token}`} />

      <header className="max-w-reading">
        <p className="kicker text-accent">Your results</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">Where your experience could take you</h1>
        <p className="mt-3 text-lede text-ink-2">
          {fromTitle ? <>Starting from {fromTitle.toLowerCase()}, </> : null}
          {matches.length > 0
            ? `here are the ${matches.length} UK careers where we found the most of your skills.`
            : "we could not match enough of your skills to the careers we cover."}{" "}
          {skills.strong.length + skills.some.length > 0 && (
            <a href="#skills" className="link">
              See the {skills.strong.length + skills.some.length} skills we found
            </a>
          )}
          <span aria-hidden="true"> · </span>
          <a href="#keep" className="link">
            Save or email this page
          </a>
        </p>
        {doc?.source === "job" && (
          <p className="mt-2 text-sm text-muted">
            These use the skills a {fromTitle?.toLowerCase() ?? "person in your job"} usually has. For results built on your own
            experience, <Link href="/discover#cv" className="link">paste your CV</Link>.
          </p>
        )}
      </header>

      {cancelled && (
        <p role="status" className="mt-6 max-w-reading rounded-md border border-rule bg-paper-2 px-4 py-3 text-ink">
          Payment cancelled. You have not been charged, and your results are still here.
        </p>
      )}

      <p className="mt-6 max-w-reading text-sm text-muted">
        <strong className="text-ink-2">How we score:</strong> {METHOD_SUMMARY}
      </p>

      {prefs && (prefs.noDegree || prefs.earnMore || unchecked.length > 0) && (
        <div className="mt-4 max-w-reading rounded-md border border-rule bg-paper-2 px-4 py-3 text-sm text-ink-2">
          {(prefs.noDegree || prefs.earnMore) && (
            <p>
              You said {[prefs.noDegree && "you do not have a degree", prefs.earnMore && "you want to earn more"].filter(Boolean).join(" and ")}, so careers
              that {[prefs.noDegree && "usually need a degree", prefs.earnMore && "pay less than your current job on ONS figures"].filter(Boolean).join(" or ")} are
              lower on your list.
            </p>
          )}
          {unchecked.length > 0 && (
            <p className={prefs.noDegree || prefs.earnMore ? "mt-1" : ""}>
              You also mentioned {unchecked.join(", ")}. Our data cannot check working patterns, so look at those in the adverts.
            </p>
          )}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="mt-8 max-w-reading rounded-lg border border-rule bg-surface p-6">
          <p className="text-ink">
            That can happen with a short CV or a very specialist one. Try adding more detail about what you do day to day,
            or start from your job title instead.
          </p>
          <Link href="/discover" className="btn btn-primary mt-4">
            Try again
          </Link>
        </div>
      ) : (
        <ol className="mt-8 space-y-6">
          {matches.map((m, i) => (
            <li key={m.occupationId}>
              <MatchCard match={m} rank={i + 1} token={token} fromTitle={fromTitle} region={region} />
            </li>
          ))}
        </ol>
      )}

      <section id="keep" aria-labelledby="keep-title" className="mt-12 max-w-reading scroll-mt-24 rounded-lg border border-rule bg-surface p-4 sm:p-5">
        <h2 id="keep-title" className="font-serif text-h3 font-semibold text-ink">
          Keep these results
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          This page has its own private link, kept for 12 months
          {report.expires_at ? ` (until ${formatDate(report.expires_at.slice(0, 10))})` : ""}. Bookmark it, or email it to
          yourself:
        </p>
        <div className="mt-3">
          <EmailLinkForm token={token} />
        </div>
      </section>

      {top && (
        <section aria-labelledby="learn-title" className="mt-12 max-w-reading">
          <h2 id="learn-title" className="font-serif text-h2 font-semibold text-ink">
            Closing the gaps for {top.title.toLowerCase()}
          </h2>
          <p className="mt-2 text-ink-2">Free and government-backed options first, then paid courses.</p>
          <ul className="mt-4 space-y-3 text-ink-2">
            {(() => {
              const bootcamp = skillsBootcampLink(top.occupationId);
              return (
                <li>
                  <a href={bootcamp.url} className="link" rel="noopener" target="_blank">
                    {bootcamp.label}
                  </a>{" "}
                  <span className="text-sm text-muted">({bootcamp.provider}). {bootcamp.note}</span>
                </li>
              );
            })()}
            {top.apprenticeships.length > 0 && (
              <li>
                <a href={FIND_APPRENTICESHIP_URL} className="link" rel="noopener" target="_blank">
                  Find an apprenticeship on GOV.UK
                </a>{" "}
                <span className="text-sm text-muted">(in England you can start one at 16 or over if you are not in full-time education, according to GOV.UK; Scotland, Wales and Northern Ireland run their own schemes).</span>
              </li>
            )}
          </ul>
          {(top.gaps.length > 0 || occupationCourseLinks(top.occupationId).length > 0) && (
            <>
              <Disclosure className="mt-5" href="/pricing#money">
                Some links below go to paid course providers. If you sign up through one, we may earn a commission at no
                extra cost to you.
              </Disclosure>
              <ul className="mt-4 space-y-3">
                {occupationCourseLinks(top.occupationId).map((l) => (
                  <li key={l.url}>
                    <AffiliateLink href={l.url} provider={l.provider} placement="results_occupation">
                      {l.label}
                    </AffiliateLink>{" "}
                    <span className="text-sm text-muted">({l.provider})</span>
                  </li>
                ))}
                {top.gaps.slice(0, 3).map((g) => (
                  <li key={g.id}>
                    <span className="font-semibold text-ink">{g.name}:</span>{" "}
                    {coursesForSkill(g.id).map((l, i) => (
                      <span key={l.url}>
                        {i > 0 && " · "}
                        <AffiliateLink href={l.url} provider={l.provider} placement="results_gap">
                          {l.provider}
                        </AffiliateLink>
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <section id="skills" aria-labelledby="skills-title" className="mt-12 max-w-reading scroll-mt-24">
        <h2 id="skills-title" className="font-serif text-h2 font-semibold text-ink">
          Your skills profile
        </h2>
        {skills.strong.length > 0 && (
          <div className="mt-4">
            <h3 className="kicker mb-2">Shown clearly</h3>
            <SkillChips skills={skills.strong} tone="neutral" />
          </div>
        )}
        {skills.some.length > 0 && (
          <div className="mt-4">
            <h3 className="kicker mb-2">Shown in part</h3>
            <SkillChips skills={skills.some} tone="close" />
          </div>
        )}
        {doc && doc.achievements.length > 0 && (
          <div className="mt-6">
            <h3 className="kicker mb-2">What we noted from your CV</h3>
            <ul className="list-disc space-y-1 pl-5 text-ink-2">
              {doc.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">Paraphrased by the AI model, without names or contact details. Check them before you reuse them.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="report-title" className="mt-12 max-w-reading rounded-lg border border-rule bg-surface p-5 sm:p-7">
        <h2 id="report-title" className="font-serif text-h3 font-semibold text-ink">
          Want a plan for one of these?
        </h2>
        <p className="mt-2 text-ink-2">
          The Career Change Report ({REPORT_PRICE_LABEL}, one payment) takes one career from your list and sets out the pay
          picture, the ways in with typical length and funding, a plan for each gap, a 90-day plan, CV wording for that job
          and interview talking points. Pick a career above to get it.{" "}
          <Link href="/pricing" className="link">
            What is free and what is paid
          </Link>
        </p>
      </section>

      <p className="mt-10 max-w-reading text-xs text-muted">
        Want these results deleted before the 12 months are up? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="link">
          {CONTACT_EMAIL}
        </a>{" "}
        with this page&apos;s link. Skill profiles for jobs and the list of careers are our own editorial judgement; pay figures
        are from ONS and ways in from the National Careers Service and Skills England.
      </p>
    </div>
  );
}
