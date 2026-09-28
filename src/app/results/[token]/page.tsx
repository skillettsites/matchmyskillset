import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/components/content";
import { getReportByToken } from "@/lib/apis/reports-db";
import { REPORT_PRICE_LABEL } from "@/lib/apis/report-product";
import { isMatchesDoc, isSkillsDoc } from "@/lib/skills/profile";
import { presentMatch, profileSkillNames, resolveCurrentJob, type PresentedMatch } from "@/lib/skills/present";
import { methodSummary } from "@/lib/skills/scoring";
import { JOB_FIT_SUMMARY } from "@/lib/apis/jobs/fit";
import { isFresh, placeFromDoc, snapshotFrom, type JobsSnapshot } from "@/lib/apis/jobs/match";
import { coursesForSkill, occupationCourseLinks, skillHasCourses, skillsBootcampLink, FIND_APPRENTICESHIP_URL } from "@/lib/affiliate/courses";
import { AffiliateLink } from "@/lib/affiliate/AffiliateLink";
import { CONTACT_EMAIL } from "@/lib/site";
import { suggestHeadline } from "@/lib/candidates/profile";
import { PROFILE_CONSENT_TEXT, ALERT_CONSENT_TEXT } from "@/lib/candidates/consent";
import { titleInSentence } from "@/lib/text";
import { PayBlock, SkillChips, WaysIn } from "../_components/parts";
import { EmailLinkForm, ReportCheckout, ViewEvent } from "./ResultsClient";
import { ResultsShell, ShowJobsButton } from "./ResultsShell";
import { AlertSignup, ProfileOptIn } from "./SideCards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your job matches",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

function jobsSearchHref(title: string, place: string | null): string {
  const p = new URLSearchParams({ q: title });
  if (place) p.set("location", place);
  return `/jobs?${p}`;
}

function CareerCard({
  match,
  rank,
  token,
  fromTitle,
  jobCount,
  place,
}: {
  match: PresentedMatch;
  rank: number;
  token: string;
  fromTitle: string | null;
  jobCount: number | null;
  place: string | null;
}) {
  return (
    <article id={`match-${match.occupationId}`} className="card-white scroll-mt-24 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Career match {rank}</p>
          <h3 className="title mt-1">{match.title}</h3>
          {fromTitle && <p className="mt-1 text-[15px] text-mute">From {titleInSentence(fromTitle)}</p>}
        </div>
        <div className="w-40" aria-label={`Skill match ${match.score} per cent`}>
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-mute">Skill match</span>
            <span className="text-[17px] font-bold tabular-nums text-ink">{match.score}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cloud" aria-hidden="true">
            <div className="h-full rounded-full bg-blue" style={{ width: `${Math.min(100, match.score)}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{match.whyFits}</p>
      <p className="mt-2 text-[15px] text-mute">{match.description}</p>

      {match.flagNotes.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {match.flagNotes.map((n) => (
            <li key={n.flag} className="rounded-xl bg-cloud px-3 py-2 text-[14px] text-ink-2">
              {n.text}
              {n.href && (
                <>
                  {" "}
                  <Link href={n.href} className="text-link hover:underline">
                    Read the guide
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-6 border-t border-hair pt-6 md:grid-cols-2">
        <section aria-label={`Pay: ${match.title}`}>
          <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Pay</h4>
          <div className="mt-2">
            <PayBlock pay={match.pay} change={match.payChange} fromTitle={fromTitle} scope={match.payScope} note={match.payNote} />
          </div>
        </section>
        <section aria-label={`Your skills: ${match.title}`}>
          <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Your skills for this job</h4>
          <div className="mt-2 space-y-2">
            <SkillChips skills={match.matched} tone="have" />
            <SkillChips skills={match.related} tone="close" />
            {match.gaps.length > 0 && (
              <div>
                <p className="mb-1 text-[14px] text-mute">To build:</p>
                <SkillChips skills={match.gaps} tone="gap" />
              </div>
            )}
          </div>
        </section>
        <section aria-label={`Ways in: ${match.title}`}>
          <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Ways in</h4>
          <div className="mt-2">
            <WaysIn match={match} />
            {match.ncsUrl && (
              <p className="mt-2 text-[14px]">
                <a href={match.ncsUrl} className="text-link hover:underline" rel="noopener" target="_blank">
                  National Careers Service profile
                </a>
              </p>
            )}
          </div>
        </section>
        <section aria-label={`Live jobs: ${match.title}`}>
          <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Live jobs</h4>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {jobCount && jobCount > 0 ? (
              <ShowJobsButton id={match.occupationId} title={match.title} count={jobCount} />
            ) : (
              <Link href={jobsSearchHref(match.title, place)} className="btn btn-secondary btn-sm">
                Search live {titleInSentence(match.title)} jobs
              </Link>
            )}
          </div>
          {jobCount !== null && jobCount > 0 && <p className="mt-2 text-[14px] text-mute">In your job list, scored against your CV.</p>}
        </section>
      </div>

      <div className="mt-6 border-t border-hair pt-6">
        <ReportCheckout token={token} occupationId={match.occupationId} title={match.title} position={rank} />
      </div>
    </article>
  );
}

function sourcesLine(s: JobsSnapshot | null): string {
  const names = (s?.sources ?? []).filter((x) => x.found > 0 || x.id === "mms").map((x) => x.label);
  const list = names.length ? names.join(", ") : "Reed, Adzuna, GOV.UK Teaching Vacancies, Himalayas and Remotive";
  return `Adverts come from ${list}. We do not write or check them: each links to the board that listed it, where you apply. Adverts dated more than 60 days ago are left out. Teaching Vacancies listings contain public sector information licensed under the Open Government Licence v3.0.`;
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
  const skills = profileSkillNames(doc?.skills ?? []);
  const cancelled = sp.checkout === "cancelled";
  const snapshot = snapshotFrom(report.matches);
  const place = doc ? placeFromDoc(doc) : null;
  const top = matches[0];
  const topCourseGaps = top ? top.gaps.filter((g) => skillHasCourses(g.id)).slice(0, 3) : [];
  const topPaidCourses = top ? topCourseGaps.length > 0 || occupationCourseLinks(top.occupationId).length > 0 : false;
  const jobCountFor = (id: string): number | null => (snapshot ? snapshot.jobs.filter((j) => j.occupationId === id).length : null);
  const topSkills = [...skills.strong, ...skills.some].slice(0, 5).map((s) => s.name);
  const prefs = doc?.preferences;
  const unchecked = prefs ? [prefs.avoidWeekends && "no weekend work", prefs.wantRemote && "working from home", prefs.avoidShifts && "no shift work", prefs.partTime && "part-time hours"].filter(Boolean) : [];

  const careersPanel = (
    <div>
      <div className="max-w-[760px]">
        <h2 className="headline !text-[32px] sm:!text-[40px]">Careers that fit your skills</h2>
        <p className="mt-3 text-[17px] text-mute">
          {matches.length > 0
            ? `The ${matches.length} UK careers where we found the most of your skills, with ONS pay and the ways in.`
            : "We could not match enough of your skills to the careers we cover."}
        </p>
        <p className="mt-3 text-[14px] text-mute">
          <strong className="text-ink-2">How we score careers:</strong> {methodSummary(isMatchesDoc(report.matches) ? report.matches.method : null)}
        </p>
        {prefs && (prefs.noDegree || prefs.earnMore || unchecked.length > 0) && (
          <div className="mt-4 rounded-2xl bg-cloud px-4 py-3 text-[14px] text-ink-2">
            {(prefs.noDegree || prefs.earnMore) && (
              <p>
                You said {[prefs.noDegree && "you do not have a degree", prefs.earnMore && "you want to earn more"].filter(Boolean).join(" and ")}, so careers that{" "}
                {[prefs.noDegree && "usually need a degree", prefs.earnMore && "pay less than your current job on ONS figures"].filter(Boolean).join(" or ")} are lower on
                your list.
              </p>
            )}
            {unchecked.length > 0 && (
              <p className={prefs.noDegree || prefs.earnMore ? "mt-1" : ""}>
                You also mentioned {unchecked.join(", ")}. Our career data cannot check working patterns, so look at those in the adverts.
              </p>
            )}
          </div>
        )}
      </div>
      {matches.length === 0 ? (
        <div className="tile mt-8 max-w-[760px] p-6">
          <p className="text-ink-2">That can happen with a short CV or a very specialist one. Add more about what you do day to day, or start from your job title.</p>
          <Link href="/discover" className="btn btn-primary btn-sm mt-4">
            Try again
          </Link>
        </div>
      ) : (
        <ol className="mt-8 space-y-6">
          {matches.map((m, i) => (
            <li key={m.occupationId}>
              <CareerCard match={m} rank={i + 1} token={token} fromTitle={fromTitle} jobCount={jobCountFor(m.occupationId)} place={place?.label ?? null} />
            </li>
          ))}
        </ol>
      )}

      {top && (
        <section aria-labelledby="learn-title" className="tile mt-10 p-6 sm:p-8">
          <h3 id="learn-title" className="title">
            Closing the gaps for {titleInSentence(top.title)}
          </h3>
          <p className="mt-2 text-[15px] text-mute">{topPaidCourses ? "Free and government-backed options first, then paid courses." : "Free and government-backed options."}</p>
          <ul className="mt-4 space-y-3 text-[15px] text-ink-2">
            {(() => {
              const bootcamp = skillsBootcampLink(top.occupationId);
              return (
                <li>
                  <a href={bootcamp.url} className="text-link hover:underline" rel="noopener" target="_blank">
                    {bootcamp.label}
                  </a>{" "}
                  <span className="text-[14px] text-mute">
                    ({bootcamp.provider}). {bootcamp.note}
                  </span>
                </li>
              );
            })()}
            {top.apprenticeships.length > 0 && (
              <li>
                <a href={FIND_APPRENTICESHIP_URL} className="text-link hover:underline" rel="noopener" target="_blank">
                  Find an apprenticeship on GOV.UK
                </a>{" "}
                <span className="text-[14px] text-mute">
                  (in England you can start one at 16 or over if you are not in full-time education, according to GOV.UK; Scotland, Wales and Northern Ireland run their
                  own schemes).
                </span>
              </li>
            )}
          </ul>
          {topPaidCourses && (
            <>
              <p className="mt-5 text-[13px] text-mute">
                Some links below go to paid course providers. If you sign up through one, we may earn a commission at no extra cost to you.{" "}
                <Link href="/pricing#money" className="text-link hover:underline">
                  How we make money
                </Link>
              </p>
              <ul className="mt-3 space-y-3 text-[15px]">
                {occupationCourseLinks(top.occupationId).map((l) => (
                  <li key={l.url}>
                    <AffiliateLink href={l.url} provider={l.provider} placement="results_occupation">
                      {l.label}
                    </AffiliateLink>{" "}
                    <span className="text-[14px] text-mute">({l.provider})</span>
                  </li>
                ))}
                {topCourseGaps.map((g) => (
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

      <section aria-labelledby="report-title" className="card-white mt-10 p-6 sm:p-8">
        <h3 id="report-title" className="title">
          Want a plan for one of these careers?
        </h3>
        <p className="mt-2 max-w-[720px] text-[17px] text-ink-2">
          The Career Change Report ({REPORT_PRICE_LABEL}, one payment) takes one career from your list and sets out the pay picture, the ways in with typical length and
          funding, a plan for each gap, a 90-day plan, CV wording for that job and interview talking points. Pick a career above to get it.{" "}
          <Link href="/pricing" className="text-link hover:underline">
            What is free and what is paid
          </Link>
        </p>
      </section>
    </div>
  );

  const skillsPanel = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div>
        <h2 className="headline !text-[32px] sm:!text-[40px]">Your skills</h2>
        <p className="mt-3 max-w-[680px] text-[17px] text-mute">
          {doc?.source === "cv"
            ? "The skills we found in your CV. We use these to score every job and career."
            : `The skills ${fromTitle ? titleInSentence(fromTitle) : "your job"} usually involves. Upload your CV for results built on your own experience.`}
        </p>
        {skills.strong.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Shown clearly</h3>
            <div className="mt-2">
              <SkillChips skills={skills.strong} tone="neutral" />
            </div>
          </div>
        )}
        {skills.some.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Shown in part</h3>
            <div className="mt-2">
              <SkillChips skills={skills.some} tone="close" />
            </div>
          </div>
        )}
        {doc && doc.achievements.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">What we noted from your CV</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-ink-2">
              {doc.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-mute">Paraphrased by the AI model, without names or contact details. Check them before you reuse them.</p>
          </div>
        )}
        <div className="tile mt-8 p-5 text-[14px] text-ink-2">
          <p>
            <strong className="text-ink">How we score jobs:</strong> {JOB_FIT_SUMMARY}
          </p>
          <p className="mt-2">
            <strong className="text-ink">How we find your skills:</strong>{" "}
            {doc?.source === "cv"
              ? "An AI model (Claude, by Anthropic) reads your CV and picks skills from our fixed skills list. It does not choose your jobs or careers, and your CV text is not kept afterwards."
              : "From our editorial profile of the skills each job usually involves."}
          </p>
        </div>
      </div>
      <aside id="keep" className="card-white scroll-mt-24 p-5 sm:p-6">
        <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Keep these results</h3>
        <p className="mt-1 text-[14px] text-mute">
          This page has its own private link, kept for 12 months{report.expires_at ? ` (until ${formatDate(report.expires_at.slice(0, 10))})` : ""}. Bookmark it, or email it
          to yourself.
        </p>
        <div className="mt-4">
          <EmailLinkForm token={token} />
        </div>
        <p className="mt-5 text-[12px] text-mute">
          Want these results deleted sooner? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          with this page&apos;s link.
        </p>
      </aside>
    </div>
  );

  const side = (
    <>
      <AlertSignup token={token} consentText={ALERT_CONSENT_TEXT} where={place ? (place.kind === "region" ? `in ${place.label}` : `near ${place.label}`) : "across the UK"} />
      <ProfileOptIn
        token={token}
        consentText={PROFILE_CONSENT_TEXT}
        preview={{
          headline: suggestHeadline(doc?.currentRole, doc?.yearsExperience ?? null),
          role: doc?.currentRole ?? null,
          region: place?.region ?? doc?.region ?? null,
          years: doc?.yearsExperience ?? null,
          skills: topSkills,
        }}
      />
    </>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-30%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1180px] px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <ViewEvent event="results_viewed" params={{ mode: doc?.source ?? "unknown", matches: matches.length, jobs: snapshot?.jobs.length ?? null }} onceKey={`results_${token}`} />
        {cancelled && (
          <p role="status" className="mb-6 rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink">
            Payment cancelled. You have not been charged, and your results are still here.
          </p>
        )}
        <ResultsShell
          token={token}
          initial={snapshot}
          fresh={snapshot ? isFresh(snapshot) : false}
          source={doc?.source === "cv" ? "cv" : "job"}
          fromTitle={fromTitle}
          topSkills={topSkills}
          careersCount={matches.length}
          skillsCount={skills.strong.length + skills.some.length}
          careers={careersPanel}
          skills={skillsPanel}
          side={side}
          sourcesNote={sourcesLine(snapshot)}
        />
      </div>
    </div>
  );
}
