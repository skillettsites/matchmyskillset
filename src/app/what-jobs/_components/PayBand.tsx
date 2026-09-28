// Shared layout for the three salary-band pages (/what-jobs/jobs-that-pay-30k,
// -40k and -50k). Each page supplies its own intro, questions and notes; the
// tables are built here from ONS ASHE 2025 (src/data/careers).

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  Prose,
  ToolCallout,
  formatGBP,
  type FaqItem,
} from "@/components/content";
import { REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import {
  ApprenticeshipLink,
  ApprenticeshipSourceNote,
  AsheSourceNote,
  LicenceLink,
  RouteList,
  UK_FT_MEDIAN,
  allOccupationPay,
  allUnitGroupPay,
  groupBySoc,
  rowLicences,
  subDegreeApprenticeships,
  type SocRow,
  type UnitGroupPay,
} from "@/components/guides/pay";
import { ASHE_NATIONAL } from "@/data/careers";

export interface PayBandProps {
  path: string;
  /** Lower bound of the band in pounds (inclusive). */
  lo: number;
  /** Upper bound in pounds (exclusive). */
  hi: number;
  h1: string;
  description: string;
  kicker?: string;
  /** Short band label for headings, e.g. "£40k". */
  label: string;
  intro: (facts: PayBandFacts) => ReactNode;
  faq: (facts: PayBandFacts) => FaqItem[];
  /** Extra prose for this band, shown after the tables. */
  extra?: (facts: PayBandFacts) => ReactNode;
}

export interface PayBandFacts {
  /** Unit groups with a published full-time median. */
  published: number;
  /** Unit groups whose median sits in the band. */
  inBand: UnitGroupPay[];
  noDegree: SocRow[];
  /** No-degree rows that have an apprenticeship below degree level, highest pay first. */
  noDegreeWithRoute: SocRow[];
  degree: SocRow[];
  /** Share of full-time employee jobs earning less than `lo`, as a [low, high] percentile bracket. */
  bracket: [number, number] | null;
  takeHome: { yearly: number; monthly: number };
  /** Highest-paid curated no-degree row in the band. */
  topNoDegree?: SocRow;
}

const PERCENTILES: [number, keyof typeof ASHE_NATIONAL.ft][] = [
  [10, "p10"],
  [20, "p20"],
  [25, "p25"],
  [30, "p30"],
  [40, "p40"],
  [50, "median"],
  [60, "p60"],
  [70, "p70"],
  [75, "p75"],
  [80, "p80"],
  [90, "p90"],
];

/** Which published percentiles of UK full-time pay a salary falls between. */
function percentileBracket(salary: number): [number, number] | null {
  let lower: number | null = null;
  for (const [pct, key] of PERCENTILES) {
    const value = ASHE_NATIONAL.ft[key] as number | null;
    if (value === null) continue;
    if (value <= salary) lower = pct;
    else return [lower ?? 0, pct];
  }
  return lower === null ? null : [lower, 100];
}

/**
 * Take-home pay for a salary in 2026/27 (England, Wales and Northern Ireland):
 * income tax at 20% from £12,570 to £50,270 and 40% above, and employee Class 1
 * National Insurance (category A) at 8% from £12,570 to £50,270 and 2% above.
 * Annual approximation: no pension, student loan or other deductions.
 */
export function takeHome(salary: number): { yearly: number; monthly: number } {
  const pa = 12570;
  const basicTop = 50270;
  const tax = Math.max(0, Math.min(salary, basicTop) - pa) * 0.2 + Math.max(0, salary - basicTop) * 0.4;
  const ni = Math.max(0, Math.min(salary, basicTop) - pa) * 0.08 + Math.max(0, salary - basicTop) * 0.02;
  const yearly = salary - tax - ni;
  return { yearly: Math.round(yearly), monthly: Math.round(yearly / 12) };
}

export function payBandFacts(lo: number, hi: number): PayBandFacts {
  const units = allUnitGroupPay();
  const published = units.filter((u) => u.median !== null).length;
  const inBand = units
    .filter((u) => u.median !== null && u.median >= lo && u.median < hi)
    .sort((a, b) => (b.median ?? 0) - (a.median ?? 0));
  const curated = allOccupationPay().filter((p) => p.median !== null && p.median >= lo && p.median < hi);
  const noDegree = groupBySoc(curated.filter((p) => !p.degreeUsuallyRequired));
  const degree = groupBySoc(curated.filter((p) => p.degreeUsuallyRequired));
  return {
    published,
    inBand,
    noDegree,
    noDegreeWithRoute: noDegree.filter((r) => subDegreeApprenticeships(r.occupations).length > 0),
    degree,
    bracket: percentileBracket(lo),
    takeHome: takeHome(lo),
    topNoDegree: noDegree[0],
  };
}

function nameCell(row: SocRow) {
  return (
    <span className="block">
      <span className="block">{row.name}</span>
      <span className="block text-xs font-normal text-mute">
        ONS group {row.soc}: {row.socTitle}
      </span>
    </span>
  );
}

function routeCell(row: SocRow) {
  const qualifications = [...new Set(row.occupations.flatMap((o) => o.qualifications))];
  return (
    <span className="block space-y-1">
      <RouteList occupations={row.occupations} />
      {qualifications.length > 0 && (
        <span className="block text-sm text-ink-2">Qualifications named by the National Careers Service: {qualifications.join(", ")}</span>
      )}
    </span>
  );
}

function degreeRouteCell(row: SocRow) {
  const licences = rowLicences(row.occupations);
  const allApps = row.occupations.flatMap((o) => o.apprenticeships);
  const degreeApp = [...new Map(allApps.map((a) => [a.referenceNumber, a])).values()].sort((a, b) => a.level - b.level)[0];
  return (
    <span className="block space-y-1">
      {licences.length > 0 ? (
        <span className="block">
          {licences.map((l, i) => (
            <span key={l.id}>
              {i > 0 && ", "}
              <LicenceLink licence={l} />
            </span>
          ))}
        </span>
      ) : (
        <span className="block text-ink-2">A relevant degree is the usual way in</span>
      )}
      {degreeApp && (
        <span className="block text-sm text-ink-2">
          Or: <ApprenticeshipLink standard={degreeApp} />
        </span>
      )}
    </span>
  );
}

export function PayBandPage(props: PayBandProps) {
  const { path, lo, hi, h1, description, label, kicker = "Jobs by salary" } = props;
  const facts = payBandFacts(lo, hi);
  const range = `${formatGBP(lo)} to ${formatGBP(hi - 1)}`;

  return (
    <GuideShell>
      <ArticleJsonLd path={path} headline={h1} description={description} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Jobs by salary", href: "/what-jobs" }, { name: `Jobs that pay ${label}` }]} />}
        kicker={kicker}
        title={h1}
        intro={props.intro(facts)}
        updated={REVAMP_DATE}
      >
        <AsheSourceNote />
      </PageHeader>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="tile p-6">
          <dt className="text-sm text-mute">Occupation groups with a median of {range}</dt>
          <dd className="mt-1 text-[34px] font-bold tracking-[-0.035em] text-ink">
            {facts.inBand.length} <span className="text-base font-normal text-mute">of {facts.published}</span>
          </dd>
        </div>
        <div className="tile p-6">
          <dt className="text-sm text-mute">UK median, full-time employees</dt>
          <dd className="mt-1 text-[34px] font-bold tracking-[-0.035em] text-ink">{formatGBP(UK_FT_MEDIAN)}</dd>
        </div>
        <div className="tile p-6">
          <dt className="text-sm text-mute">{formatGBP(lo)} after income tax and National Insurance</dt>
          <dd className="mt-1 text-[34px] font-bold tracking-[-0.035em] text-ink">
            {formatGBP(facts.takeHome.monthly)} <span className="text-base font-normal text-mute">a month</span>
          </dd>
        </div>
      </dl>
      <p className="mt-3 max-w-reading text-xs text-mute">
        Take-home pay is our calculation for 2026/27 using the{" "}
        <a href="https://www.gov.uk/income-tax-rates" className="link" rel="noopener">
          GOV.UK income tax rates
        </a>{" "}
        (England, Wales and Northern Ireland; Scotland differs) and{" "}
        <a href="https://www.gov.uk/national-insurance-rates-letters" className="link" rel="noopener">
          employee National Insurance
        </a>{" "}
        (category A), before pension, student loan or other deductions.
      </p>

      <OnThisPage
        items={[
          { id: "no-degree", label: `${label} jobs without a degree` },
          { id: "with-degree", label: `${label} jobs that need a degree` },
          { id: "all-groups", label: "Every occupation in this band" },
          { id: "read-the-numbers", label: "How to read these numbers" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="no-degree"
        title={`Jobs paying ${label} that do not normally need a degree`}
        intro={
          <p>
            From our list of career-change destinations, these have an ONS full-time median of {range} and do not
            normally need a degree, going by the entry routes ONS and the National Careers Service describe. Where
            there is an apprenticeship below degree level, it is shown. The median is for everyone in the job, so new
            starters usually earn less.
          </p>
        }
      >
        <DataTable<SocRow>
          caption={`${label} jobs without a degree, by median pay`}
          description="Median gross annual pay, full-time employee jobs, UK, 2025."
          rowKey={(r) => r.soc}
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: nameCell },
            { key: "median", header: "Median pay", numeric: true, render: (r) => formatGBP(r.median ?? 0) },
            {
              key: "p25",
              header: "Lower quarter",
              numeric: true,
              render: (r) => (r.p25 === null ? <span className="text-mute">not published</span> : formatGBP(r.p25)),
            },
            { key: "route", header: "Way in", render: routeCell },
          ]}
          rows={facts.noDegree}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <ApprenticeshipSourceNote />
            </div>
          }
          notes="Where several jobs share one ONS group they share one pay figure. Lower quarter: a quarter of full-time employees in the group earn less than this."
        />
      </GuideSection>

      <GuideSection
        id="with-degree"
        title={`Jobs paying ${label} that usually need a degree`}
        intro={
          <p>
            These usually need a degree, a degree apprenticeship or a professional registration that follows one.
          </p>
        }
      >
        {facts.degree.length > 0 ? (
          <DataTable<SocRow>
            caption={`${label} jobs that usually need a degree, by median pay`}
            description="Median gross annual pay, full-time employee jobs, UK, 2025."
            rowKey={(r) => r.soc}
            columns={[
              { key: "job", header: "Job", rowHeader: true, render: nameCell },
              { key: "median", header: "Median pay", numeric: true, render: (r) => formatGBP(r.median ?? 0) },
              { key: "route", header: "Registration or route", render: degreeRouteCell },
            ]}
            rows={facts.degree}
            source={<AsheSourceNote />}
          />
        ) : (
          <p className="mt-4 max-w-reading text-ink-2">None of the jobs in our list that need a degree has a median in this band.</p>
        )}
      </GuideSection>

      {props.extra && <div className="mt-14">{props.extra(facts)}</div>}

      <GuideSection
        id="all-groups"
        title={`Every ONS occupation group with a median of ${range}`}
        intro={
          <p>
            ONS publishes a full-time median for {facts.published} of the 412 occupation groups in the Standard
            Occupational Classification. These {facts.inBand.length}{" "}fall in this band. Group names are the official
            ONS titles, so some are broad (&ldquo;n.e.c.&rdquo; means &ldquo;not elsewhere classified&rdquo;).
          </p>
        }
      >
        <details className="mt-6 rounded-[22px] bg-cloud">
          <summary className="flex min-h-14 cursor-pointer items-center px-6 font-semibold text-ink">
            Show all {facts.inBand.length} occupation groups
          </summary>
          <div className="border-t border-black/[0.06] px-4 pb-5 sm:px-6">
            <DataTable<UnitGroupPay>
              caption={`All occupation groups with a median of ${range}`}
              description="Median and indicative number of full-time employee jobs, UK, 2025."
              rowKey={(r) => r.soc}
              columns={[
                {
                  key: "title",
                  header: "Occupation group",
                  rowHeader: true,
                  render: (r) => (
                    <>
                      {r.title} <span className="text-xs font-normal text-mute">({r.soc})</span>
                    </>
                  ),
                },
                { key: "median", header: "Median pay", numeric: true, render: (r) => formatGBP(r.median ?? 0) },
                {
                  key: "jobs",
                  header: "Jobs (thousands)",
                  numeric: true,
                  render: (r) => (r.jobsThousands === null ? <span className="text-mute">n/a</span> : String(r.jobsThousands)),
                },
              ]}
              rows={facts.inBand}
              source={<AsheSourceNote note="Job counts are indicative only, as ONS warns." />}
            />
          </div>
        </details>
      </GuideSection>

      <GuideSection id="read-the-numbers" title="How to read these numbers">
        <Prose>
          <ul>
            <li>
              <strong>Median, not starting pay.</strong> Half of full-time employees in the group earn more than the
              median and half earn less. Someone new to the job usually starts nearer the lower quarter.
            </li>
            <li>
              <strong>Whole occupation groups.</strong>{" "}ONS publishes pay for four-digit SOC 2020 groups. A group such
              as &ldquo;Programmers and software development professionals&rdquo; covers many job titles and levels.
            </li>
            <li>
              <strong>Employees only.</strong> The survey (ASHE) does not cover the self-employed, and it counts
              people who have been in the same job for more than a year.
            </li>
            <li>
              <strong>Tax year ending 5 April 2025.</strong> ONS publishes the 2026 figures on{" "}
              <a href="https://www.ons.gov.uk/releases/employeeearningsintheuk2026" className="link" rel="noopener">
                22 October 2026
              </a>
              , and this page will be updated then.
            </li>
            <li>
              <strong>These are UK-wide figures.</strong> Pay varies by region and employer; ONS publishes regional
              tables separately.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Which of these could you move into?"
        body={
          <p>
            Paste your CV to see the jobs your skills lead to, with ONS pay for each, and the gaps you would need to
            close. Free, and you do not need an account.
          </p>
        }
      />

      <FaqSection items={props.faq(facts)} />

      <RelatedLinks
        links={[
          { href: "/what-jobs/jobs-that-pay-30k", label: "Jobs that pay £30k" },
          { href: "/what-jobs/jobs-that-pay-40k", label: "Jobs that pay £40k" },
          { href: "/what-jobs/jobs-that-pay-50k", label: "Jobs that pay £50k" },
          { href: "/highest-paying-careers-uk", label: "The highest-paid jobs in the UK" },
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ].filter((l) => l.href !== path)}
      />
      <p className="mt-10 max-w-reading text-sm text-mute">
        Leaving a particular job? See where people go after{" "}
        <Link href="/career-change-from-teaching" className="link">
          teaching
        </Link>
        ,{" "}
        <Link href="/non-clinical-jobs-for-nurses" className="link">
          nursing
        </Link>
        ,{" "}
        <Link href="/jobs-for-ex-police-officers" className="link">
          the police
        </Link>{" "}
        or{" "}
        <Link href="/jobs-for-ex-military" className="link">
          the armed forces
        </Link>
        .
      </p>
    </GuideShell>
  );
}
