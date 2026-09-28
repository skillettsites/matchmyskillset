import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Disclosure, SalaryFigure, SourceNote, formatDate } from "@/components/content";
import { JobCard } from "@/components/ui/JobCard";
import { APPRENTICESHIP_SOURCE, SOC_SOURCE, getCareerOccupation } from "@/data/careers";
import { getReportByToken, loadStoredReport, type StoredReport } from "@/lib/apis/reports-db";
import { verifyPaidSession } from "@/lib/apis/purchase-check";
import { findPurchasedMatch } from "@/lib/apis/report-builder";
import { REPORT_PRICE_VALUE } from "@/lib/apis/report-product";
import { searchJobs } from "@/lib/apis/jobs";
import { isSkillsDoc } from "@/lib/skills/profile";
import { NCS_ATTRIBUTION, PAY_SOURCE, describeApprenticeship, payForSoc, presentMatch, resolveCurrentJob, type PresentedMatch } from "@/lib/skills/present";
import { skillName } from "@/lib/skills/taxonomy";
import { coursesForSkill, occupationCourseLinks, qualificationLinks, skillsBootcampLink, FIND_APPRENTICESHIP_URL, SKILLS_BOOTCAMP_INFO_URL } from "@/lib/affiliate/courses";
import { AffiliateLink } from "@/lib/affiliate/AffiliateLink";
import { CONTACT_EMAIL } from "@/lib/site";
import { PayBlock, SkillChips } from "@/app/results/_components/parts";
import { ViewEvent } from "@/app/results/[token]/ResultsClient";
import { VacancyCount, VacancyFallback } from "@/app/results/[token]/VacancyCount";
import { PrintButton, ReportGenerating } from "./ReportClient";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Your Career Change Report",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const PRINT_CSS = `
@media print {
  body > a.skip-link, body header, body footer, .no-print { display: none !important; }
  body { background: #fff !important; }
  .report-section { break-inside: avoid-page; }
  a { color: inherit !important; text-decoration: underline; }
}`;

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-reading px-4 py-14 sm:px-6">
      <h1 className="font-serif text-h2 font-semibold text-ink">{title}</h1>
      <div className="mt-3 space-y-3 text-ink-2">{children}</div>
      <p className="mt-6 text-sm text-muted">
        Questions about a payment? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="link">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="report-section mt-10 scroll-mt-24">
      <h2 id={`${id}-title`} className="font-serif text-h3 font-semibold text-ink sm:text-[1.6rem]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

async function LiveJobs({ title, region }: { title: string; region: string | null }) {
  let jobs: Awaited<ReturnType<typeof searchJobs>>["jobs"] = [];
  try {
    const result = await searchJobs({ query: title, location: region ?? undefined, remote: false, page: 1, perPage: 10 });
    jobs = result.jobs.slice(0, 5);
  } catch {
    jobs = [];
  }
  if (jobs.length === 0) return null;
  return (
    <ul className="mt-4 space-y-3">
      {jobs.map((j, i) => (
        <li key={j.id}>
          <JobCard job={j} position={i + 1} />
        </li>
      ))}
    </ul>
  );
}

function ReportBody({ stored, match, fromTitle, currentSoc, region, token }: { stored: StoredReport; match: PresentedMatch; fromTitle: string | null; currentSoc?: string; region: string | null; token: string }) {
  const p = stored.prose;
  const currentPay = currentSoc ? payForSoc(currentSoc) : null;
  const bootcamp = skillsBootcampLink(match.occupationId);
  const quals = qualificationLinks(match.qualifications);
  const extraCourses = occupationCourseLinks(match.occupationId);
  const aliases = getCareerOccupation(match.occupationId)?.aliases ?? [];
  const jobsHref = `/jobs?${new URLSearchParams({ q: match.title, ...(region ? { location: region } : {}) })}`;

  return (
    <>
      <Section id="summary" title="In short">
        <p className="text-lede text-ink">{p.summary}</p>
        <p className="mt-3 text-ink-2">{match.whyFits}</p>
        <p className="mt-2 text-sm text-muted">Skill match {match.score}%, scored the same way as your free results.</p>
      </Section>

      <Section id="pay" title="The pay picture">
        <PayBlock pay={match.pay} change={match.payChange} fromTitle={fromTitle} scope={match.payScope} note={match.payNote} detailed />
        {currentPay && currentPay.median !== null && fromTitle && (
          <p className="mt-3 text-[0.9375rem] text-ink-2">
            For comparison, the ONS median for your current job group ({fromTitle.toLowerCase()}, {currentPay.basisLabel}) is{" "}
            <SalaryFigure value={currentPay.median} size="sm" />.
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          The median covers everyone in the ONS job group across the UK, at every stage of their career, so starting pay can be
          lower. Pay also varies by region and employer, so check live adverts too.
        </p>
      </Section>

      {p.strengths.length > 0 && (
        <Section id="strengths" title="What you already bring">
          <ul className="space-y-3">
            {p.strengths.map((s) => (
              <li key={s.skill}>
                <p className="font-semibold text-ink">{s.skill}</p>
                <p className="text-ink-2">{s.howItTransfers}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <SkillChips skills={match.matched} tone="have" />
          </div>
        </Section>
      )}

      <Section id="ways-in" title="Ways in">
        <p className="text-ink-2">
          {match.degreeUsuallyRequired
            ? "A degree, or a degree apprenticeship, is the usual way in."
            : "You do not usually need a degree to get into this job."}
          {match.ncsRoutes.length > 0 && <> The National Careers Service lists these routes: {match.ncsRoutes.join(", ")}.</>}
        </p>
        {Object.entries(match.ncsEntryRequirements).some(([, v]) => v.length > 0) && (
          <div className="mt-3">
            <h3 className="kicker mb-1">Typical entry requirements (National Careers Service)</h3>
            <ul className="list-disc space-y-1 pl-5 text-[0.9375rem] text-ink-2">
              {Object.entries(match.ncsEntryRequirements).flatMap(([route, reqs]) =>
                reqs.map((r) => (
                  <li key={`${route}-${r}`}>
                    <span className="capitalize">{route}</span>: {r}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        {match.apprenticeships.length > 0 && (
          <div className="mt-4">
            <h3 className="kicker mb-1">Apprenticeships (England)</h3>
            <ul className="space-y-2 text-[0.9375rem] text-ink-2">
              {match.apprenticeships.map((a) => (
                <li key={a.referenceNumber}>
                  <a href={a.url} className="link" rel="noopener" target="_blank">
                    {a.title}
                  </a>{" "}
                  ({a.referenceNumber}): {describeApprenticeship(a)}.
                </li>
              ))}
            </ul>
            <p className="mt-1 text-sm text-muted">
              The funding band is the most the government will put towards the training; the employer takes you on and pays a
              wage.{" "}
              <a href={FIND_APPRENTICESHIP_URL} className="link" rel="noopener" target="_blank">
                Find an apprenticeship on GOV.UK
              </a>
              .
            </p>
          </div>
        )}
        {match.licences.length > 0 && (
          <div className="mt-4">
            <h3 className="kicker mb-1">Licences and registration</h3>
            <ul className="space-y-2 text-[0.9375rem] text-ink-2">
              {match.licences.map((l) => (
                <li key={l.name}>
                  <a href={l.url} className="link" rel="noopener" target="_blank">
                    {l.name}
                  </a>{" "}
                  ({l.body}
                  {l.scope ? `, ${l.scope}` : ""}): {l.summary}
                </li>
              ))}
            </ul>
          </div>
        )}
        {quals.length > 0 && (
          <div className="mt-4">
            <h3 className="kicker mb-1">Qualifications named by the National Careers Service</h3>
            <ul className="space-y-1 text-[0.9375rem]">
              {quals.map((q) => (
                <li key={q.url}>
                  <a href={q.url} className="link" rel="noopener" target="_blank">
                    {q.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {match.onsEntryRoutes && (
          <blockquote className="mt-4 border-l-2 border-rule-strong pl-3 text-[0.9375rem] text-ink-2">
            <p>{match.onsEntryRoutes}</p>
            <footer className="mt-1 text-xs text-muted">
              ONS description of entry routes for unit group {match.soc} {match.socTitle}. {SOC_SOURCE.attribution}
            </footer>
          </blockquote>
        )}
        <div className="mt-4 rounded-md border border-rule bg-paper-2 px-3 py-2.5 text-[0.9375rem] text-ink-2">
          <p className="font-semibold text-ink">Government-funded option</p>
          <p className="mt-1">
            <a href={bootcamp.url} className="link" rel="noopener" target="_blank">
              {bootcamp.label}
            </a>
            : {bootcamp.note}{" "}
            <a href={SKILLS_BOOTCAMP_INFO_URL} className="link" rel="noopener" target="_blank">
              About Skills Bootcamps
            </a>
            .
          </p>
        </div>
      </Section>

      {p.gapPlan.length > 0 && (
        <Section id="gaps" title="Closing your skill gaps">
          <Disclosure className="mb-4">
            Some course links in this section go to paid providers. If you sign up through one, we may earn a commission at no
            extra cost to you. Each link is a search on that provider&apos;s site for the skill, not a course we have checked.
          </Disclosure>
          <ol className="space-y-5">
            {p.gapPlan.map((g) => (
              <li key={g.skillId}>
                <p className="font-semibold text-ink">{skillName(g.skillId)}</p>
                <p className="text-ink-2">{g.whyItMatters}</p>
                <p className="mt-1 text-ink-2">{g.howToBuild}</p>
                <p className="mt-1 text-sm">
                  Courses:{" "}
                  {coursesForSkill(g.skillId).map((l, i) => (
                    <span key={l.url}>
                      {i > 0 && " · "}
                      <AffiliateLink href={l.url} provider={l.provider} placement="report_gap">
                        {l.provider}
                      </AffiliateLink>
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ol>
          {extraCourses.length > 0 && (
            <p className="mt-4 text-[0.9375rem] text-ink-2">
              Also relevant:{" "}
              {extraCourses.map((l, i) => (
                <span key={l.url}>
                  {i > 0 && ", "}
                  <AffiliateLink href={l.url} provider={l.provider} placement="report_occupation">
                    {l.label}
                  </AffiliateLink>{" "}
                  ({l.provider})
                </span>
              ))}
              .
            </p>
          )}
        </Section>
      )}

      {p.plan90Days.length > 0 && (
        <Section id="plan" title="Your 90-day plan">
          <ol className="space-y-4">
            {p.plan90Days.map((period) => (
              <li key={period.period} className="rounded-md border border-rule bg-surface p-4">
                <p className="kicker text-accent">{period.period}</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-ink-2">
                  {period.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section id="cv" title="Your CV for this job">
        <h3 className="kicker mb-1">Skills-first summary</h3>
        <p className="rounded-md border border-rule bg-surface p-4 text-ink">{p.cvSummary}</p>
        <h3 className="kicker mb-1 mt-5">Bullet points to adapt</h3>
        <ul className="list-disc space-y-1.5 rounded-md border border-rule bg-surface p-4 pl-9 text-ink">
          {p.cvBullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">
          Built from what you told us. Anything in [square brackets] is for you to fill in; check every figure is accurate
          before you use it.
        </p>
      </Section>

      {p.interviewPoints.length > 0 && (
        <Section id="interview" title="Interview talking points">
          <ul className="space-y-3">
            {p.interviewPoints.map((i) => (
              <li key={i.theme}>
                <p className="font-semibold text-ink">{i.theme}</p>
                <p className="text-ink-2">{i.whatToSay}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {p.watchOuts.length > 0 && (
        <Section id="check" title="Worth checking">
          <ul className="list-disc space-y-1 pl-5 text-ink-2">
            {p.watchOuts.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="vacancies" title="Live vacancies">
        <Suspense fallback={<VacancyFallback />}>
          <VacancyCount title={match.title} aliases={aliases} region={region} />
        </Suspense>
        <Suspense fallback={null}>
          <LiveJobs title={match.title} region={region} />
        </Suspense>
        <p className="mt-3 no-print">
          <Link href={jobsHref} className="link">
            Search all live {match.title.toLowerCase()} jobs
          </Link>
        </p>
      </Section>

      <footer className="report-section mt-12 border-t border-rule pt-5 text-xs leading-relaxed text-muted">
        <SourceNote source={PAY_SOURCE.name} href={PAY_SOURCE.href} published={PAY_SOURCE.published} note="Pay figures in this report." />
        <p className="mt-1">{SOC_SOURCE.attribution}</p>
        <p className="mt-1">{NCS_ATTRIBUTION}</p>
        <p className="mt-1">
          Apprenticeship standards: {APPRENTICESHIP_SOURCE.publisher}, {APPRENTICESHIP_SOURCE.licence.name}.
        </p>
        <p className="mt-2">
          The written sections were drafted by an AI model (Claude, by Anthropic) using only the facts shown in this report and
          your skills profile, then checked by our software for format. They are suggestions, not professional careers advice.
          Report prepared {formatDate(stored.generatedAt.slice(0, 10))}.{" "}
          <Link href={`/results/${token}`} className="link no-print">
            Back to your results
          </Link>
        </p>
      </footer>
    </>
  );
}

export default async function ReportPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { token } = await params;
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";

  const report = await getReportByToken(token);
  if (!report) notFound();

  if (!sessionId) {
    return (
      <Notice title="This report link is incomplete">
        <p>Please open the link from the email we sent after your payment. It ends with a long payment reference.</p>
        <p>
          <Link href={`/results/${token}`} className="link">
            Go to your free results
          </Link>
        </p>
      </Notice>
    );
  }

  const check = await verifyPaidSession(sessionId, report);
  if (check.status !== "paid") {
    return (
      <Notice title={check.status === "unavailable" ? "We are confirming your payment" : "We could not confirm this payment"}>
        <p>{check.reason}</p>
        <p>
          <Link href={`/results/${token}`} className="link">
            Go back to your results
          </Link>
        </p>
      </Notice>
    );
  }

  const doc = isSkillsDoc(report.skills) ? report.skills : null;
  const current = resolveCurrentJob(doc);
  const entry = findPurchasedMatch(report, check.purchase.occupation_id, check.purchase.target_soc);
  const match = entry ? presentMatch(entry, doc, current) : null;
  if (!match) {
    return (
      <Notice title="We could not find the career you chose">
        <p>Your payment went through, but the career it was for is no longer in these results. Please email us and we will sort it out or refund you.</p>
      </Notice>
    );
  }

  const stored = loadStoredReport(check.purchase, report);
  const fromTitle = doc?.currentRole ?? report.current_role ?? null;

  return (
    <div className="mx-auto max-w-reading px-4 py-10 sm:px-6 sm:py-14">
      <style>{PRINT_CSS}</style>
      <ViewEvent
        event="purchase"
        onceKey={`purchase_${sessionId}`}
        params={{
          transaction_id: sessionId,
          currency: "GBP",
          value: REPORT_PRICE_VALUE,
          items: [{ item_id: match.occupationId, item_name: `Career Change Report: ${match.title}`, price: REPORT_PRICE_VALUE, quantity: 1 }],
        }}
      />
      <div>
        <p className="kicker text-accent">Career Change Report</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">
          {fromTitle ? `From ${fromTitle.toLowerCase()} to ${match.title.toLowerCase()}` : match.title}
        </h1>
        <p className="mt-2 text-ink-2">
          ONS unit group {match.soc}: {match.socTitle}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 no-print">
          <PrintButton />
          <Link href={`/results/${token}`} className="btn btn-quiet">
            Back to your results
          </Link>
        </div>
      </div>

      {stored ? (
        <ReportBody stored={stored} match={match} fromTitle={fromTitle} currentSoc={current?.soc} region={doc?.region ?? null} token={token} />
      ) : (
        <div className="mt-8">
          <ReportGenerating token={token} sessionId={sessionId} />
        </div>
      )}
    </div>
  );
}
