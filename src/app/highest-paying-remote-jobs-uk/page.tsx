import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  Prose,
  SalaryFigure,
  SourceNote,
  ToolCallout,
  formatGBP,
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import {
  AsheSourceNote,
  UK_FT_MEDIAN,
  allOccupationPay,
  unitGroupPay,
  type UnitGroupPay,
} from "@/components/guides/pay";
import { SOC_SOURCE, getSocUnitGroup, type ApprenticeshipStandard } from "@/data/careers";
import { GOV, ONS_HYBRID_2025, OPN_2026 } from "../work-from-home-jobs/_data/sources";

const PATH = "/highest-paying-remote-jobs-uk";
const TITLE = "Highest-paying remote jobs in the UK, with ONS pay data";
const DESCRIPTION =
  "Well-paid UK desk jobs where home or hybrid working is common, with ONS 2025 median pay, how people get in, and what the data cannot say about remote pay.";
const H1 = "The best-paid jobs you can usually do from home";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const SKILLS_ENGLAND_URL = "https://skillsengland.education.gov.uk/apprenticeships/";

/**
 * Desk-based SOC 2020 unit groups in the managers and professional major groups,
 * where ONS finds home and hybrid working most common. The choice of groups is
 * editorial: ONS does not publish home working rates for individual jobs.
 */
const REMOTE_FRIENDLY: { soc: string; name: string }[] = [
  { soc: "1132", name: "Marketing, sales or advertising director" },
  { soc: "1137", name: "IT director" },
  { soc: "1131", name: "Finance director or financial manager" },
  { soc: "1136", name: "HR manager or director" },
  { soc: "2133", name: "IT business analyst, architect or systems designer" },
  { soc: "2440", name: "Project manager (business and finance)" },
  { soc: "2131", name: "IT project manager" },
  { soc: "2134", name: "Software developer or engineer" },
  { soc: "2132", name: "IT or product manager" },
  { soc: "2135", name: "Cyber security professional" },
  { soc: "2432", name: "Marketing or commercial manager" },
  { soc: "2433", name: "Actuary, economist, statistician or data scientist" },
  { soc: "2431", name: "Management consultant or business analyst" },
  { soc: "2482", name: "Compliance or quality assurance manager" },
  { soc: "2421", name: "Chartered or certified accountant" },
];

type RemoteRow = UnitGroupPay & { name: string; entry: string; apprenticeship?: ApprenticeshipStandard };

/** "IT directors" stays as is; "Chartered and certified accountants" becomes "chartered and certified accountants". */
function lowerTitle(title: string): string {
  const first = title.split(" ")[0];
  return first === first.toUpperCase() ? title : title.charAt(0).toLowerCase() + title.slice(1);
}

/** First sentence of the ONS entry-route text. */
function onsEntry(soc: string): string {
  const text = getSocUnitGroup(soc)?.entryRoutes ?? "";
  // Split only where a full stop is followed by a capital, so "e.g. marketing" stays in one sentence.
  return text.split(/(?<=\.)\s+(?=[A-Z])/)[0].trim();
}

function buildRows(): RemoteRow[] {
  const occupations = allOccupationPay();
  return REMOTE_FRIENDLY.map((r) => {
    const apprenticeship = occupations
      .filter((o) => o.soc === r.soc)
      .flatMap((o) => o.apprenticeships)
      .sort((a, b) => a.level - b.level || a.typicalDurationMonths - b.typicalDurationMonths)[0];
    return { ...unitGroupPay(r.soc), name: r.name, entry: onsEntry(r.soc), apprenticeship };
  }).sort((a, b) => (b.median ?? 0) - (a.median ?? 0));
}

function rangeCell(r: RemoteRow) {
  if (r.p25 === null || r.p75 === null) return <span className="text-muted">not published</span>;
  return `${formatGBP(r.p25)} to ${formatGBP(r.p75)}`;
}

function routeCell(r: RemoteRow) {
  return (
    <span className="block space-y-1">
      <span className="block">{r.entry}</span>
      {r.apprenticeship && (
        <span className="block text-sm text-ink-2">
          Apprenticeship in England:{" "}
          <a href={r.apprenticeship.url} className="link" rel="noopener">
            {r.apprenticeship.title}
          </a>{" "}
          (level {r.apprenticeship.level}, typically {r.apprenticeship.typicalDurationMonths} months)
        </span>
      )}
    </span>
  );
}

export default function HighestPayingRemoteJobsPage() {
  const rows = buildRows();
  const top = rows[0];
  const bottom = rows[rows.length - 1];
  const managers = OPN_2026.byOccupation.find((o) => o.code === "1")!;
  const professionals = OPN_2026.byOccupation.find((o) => o.code === "2")!;
  const software = rows.find((r) => r.soc === "2134")!;
  const withApprenticeship = rows
    .filter((r, i) => r.apprenticeship && rows.findIndex((x) => x.apprenticeship?.referenceNumber === r.apprenticeship?.referenceNumber) === i)
    .slice(0, 2);
  const apprenticeshipExamples = withApprenticeship
    .map((r) => `${r.apprenticeship!.title.toLowerCase()} (level ${r.apprenticeship!.level})`)
    .join(" and ");
  const softwareRange =
    software.p25 !== null && software.p75 !== null
      ? `, and the middle half earned between ${formatGBP(software.p25)} and ${formatGBP(software.p75)}`
      : "";

  const faq = [
    {
      question: "What is the highest-paying job you can do from home in the UK?",
      answer: `ONS does not publish pay by where people work, so no official source can answer this exactly. Among desk-based jobs where home and hybrid working is common, the highest 2025 median for full-time employees was ${formatGBP(top.median ?? 0)} for ${lowerTitle(top.title)}. These are senior roles that people usually reach after years in a related job.`,
    },
    {
      question: "Do remote jobs pay more than office jobs?",
      answer: `There is no official UK figure comparing pay for the same job done at home and in an office. ONS does show that home working is more common among higher earners: ${ONS_HYBRID_2025.income50kPlus}% of workers earning £50,000 or more were hybrid working in ${ONS_HYBRID_2025.period}, against ${ONS_HYBRID_2025.incomeUnder20k}% of those earning under £20,000. That reflects the kind of jobs that can be done from home, not a premium for working remotely.`,
    },
    {
      question: "Are these jobs fully remote?",
      answer: `Mostly not. In ONS's survey for ${OPN_2026.period}, ${managers.homeOnly}% of managers and directors worked only from home and ${managers.hybrid}% were hybrid. For professionals it was ${professionals.homeOnly}% and ${professionals.hybrid}%. Expect most well-paid remote adverts to ask for some office days.`,
    },
    {
      question: "How much does a remote software developer earn in the UK?",
      answer: `The ONS median for full-time programmers and software development professionals was ${formatGBP(software.median ?? 0)} in 2025${softwareRange}. That covers all employees in the group, whether they work at home or in an office, and leaves out contractors who work for themselves.`,
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Work from home jobs", href: "/work-from-home-jobs" }, { name: "Best-paid remote jobs" }]} />
        }
        kicker="Working from home"
        title={H1}
        intro={
          <p>
            The best-paid jobs that are commonly done from home are in senior management, IT, finance and consultancy.
            For the {rows.length} groups below, the ONS median for full-time employees in 2025 runs from{" "}
            <SalaryFigure value={bottom.median} size="sm" showPeriod={false} /> ({lowerTitle(bottom.title)}) to{" "}
            <SalaryFigure value={top.median} size="sm" /> ({lowerTitle(top.title)}). ONS does not split pay by where
            people work, and most of these jobs are hybrid rather than fully remote.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <AsheSourceNote />
      </PageHeader>

      <OnThisPage
        items={[
          { id: "jobs", label: "The best-paid remote-friendly jobs" },
          { id: "about-the-data", label: "What the figures can and cannot tell you" },
          { id: "getting-there", label: "How people get there" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="jobs"
        title="Well-paid jobs where home working is common"
        intro={
          <p>
            All {rows.length} are desk-based jobs in the two ONS major groups with the most home working: managers and
            directors, where {managers.homeOnly + managers.hybrid}% worked at home for part or all of the week in{" "}
            {OPN_2026.period}, and professionals, where {professionals.homeOnly + professionals.hybrid}% did. The UK
            median for all full-time jobs is <SalaryFigure value={UK_FT_MEDIAN} size="sm" showPeriod={false} />.
          </p>
        }
      >
        <DataTable<RemoteRow>
          caption="Remote-friendly jobs by UK median pay"
          description="Median gross annual pay and the middle half (25th to 75th percentile), full-time employee jobs, UK, 2025."
          rowKey={(r) => r.soc}
          columns={[
            {
              key: "job",
              header: "Job",
              rowHeader: true,
              render: (r) => (
                <span className="block">
                  <span className="block">{r.name}</span>
                  <span className="block text-xs font-normal text-muted">
                    ONS group {r.soc}: {r.title}
                  </span>
                </span>
              ),
            },
            {
              key: "median",
              header: "Median pay",
              numeric: true,
              render: (r) => (r.median === null ? <span className="text-muted">not published</span> : formatGBP(r.median)),
            },
            { key: "range", header: "Middle half earn", numeric: true, render: rangeCell },
            { key: "route", header: "How people get in", render: routeCell },
          ]}
          rows={rows}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <SourceNote
                label="Entry text"
                source="ONS, SOC 2020 Volume 1: structure and descriptions of unit groups"
                href={SOC_SOURCE.pageUrl}
                note={SOC_SOURCE.attribution}
              />
              <SourceNote
                label="Apprenticeships"
                source="Skills England, apprenticeship standards approved for delivery"
                href={SKILLS_ENGLAND_URL}
                note="England only. Checked 28 September 2026."
              />
              <SourceNote source={OPN_2026.source} href={OPN_2026.href} published={OPN_2026.published} />
            </div>
          }
          notes="The choice of jobs is ours: ONS publishes home working rates only for broad occupation groups, not for individual jobs. Pay covers every employee ONS codes to each group, wherever they work."
        />
      </GuideSection>

      <GuideSection id="about-the-data" title="What the figures can and cannot tell you">
        <Prose>
          <ul>
            <li>
              <strong>There is no official &ldquo;remote pay&rdquo; figure.</strong>{" "}The ONS Annual Survey of Hours
              and Earnings does not record whether people work from home, so it cannot show whether the same job pays
              more or less when done remotely. Any site quoting a UK &ldquo;remote premium&rdquo; should name its
              source.
            </li>
            <li>
              <strong>Hybrid is the norm, even at the top.</strong> In {OPN_2026.period}, {managers.hybrid}% of
              managers and directors were hybrid and {managers.homeOnly}% worked only from home. Among professionals
              the split was {professionals.hybrid}% and {professionals.homeOnly}%.
            </li>
            <li>
              <strong>Higher earners are far more likely to work from home.</strong> ONS found that{" "}
              {ONS_HYBRID_2025.income50kPlus}% of workers earning £50,000 or more were hybrid working in{" "}
              {ONS_HYBRID_2025.period}, compared with {ONS_HYBRID_2025.incomeUnder20k}% of those earning under £20,000 (
              <a href={ONS_HYBRID_2025.href} className="link" rel="noopener">
                ONS, June 2025
              </a>
              ).
            </li>
            <li>
              <strong>Medians are not starting salaries.</strong> They cover employees who have been in the same job
              for more than a year, and several of these groups are senior roles people reach after years in a related
              job.
            </li>
            <li>
              <strong>They are UK-wide and exclude the self-employed.</strong> Pay differs by region, and contractors
              who work through their own company are not counted. For working for yourself, see{" "}
              <Link href="/freelance-careers-uk" className="link">
                our freelance guide
              </Link>
              .
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="getting-there" title="How people get there from another career">
        <Prose>
          <p>
            The ONS descriptions in the table show two main routes in: a relevant degree, or significant experience
            in related work. The director roles generally need substantial experience, and ONS notes that internal
            promotion into management is possible.
          </p>
          <ul>
            <li>
              <strong>Move within your field first.</strong> If you already work in finance, HR, marketing or
              operations, a remote-friendly manager or analyst role in the same field is often a shorter step than
              retraining for a new one.
            </li>
            <li>
              <strong>Use a paid apprenticeship where one exists.</strong> In England, several of these jobs have an
              apprenticeship route listed in the table{apprenticeshipExamples ? `, such as ${apprenticeshipExamples}` : ""}
              . You are paid while you train, but check the pay: the{" "}
              <a href={GOV.minimumWage} className="link" rel="noopener">
                apprentice minimum wage
              </a>{" "}
              is £8.00 an hour from April 2026 for apprentices under 19 or in their first year, against £12.71 for
              workers aged 21 and over.
            </li>
            <li>
              <strong>Ask about remote working before you apply, not after.</strong> A well-paid role advertised as
              hybrid will usually expect set office days, so ask how many. Once you are in the job, you have the{" "}
              <Link href="/work-from-home-jobs#your-rights" className="link">
                right to request flexible working
              </Link>{" "}
              from day one, but your employer can refuse for business reasons.
            </li>
          </ul>
          <p>
            If you are starting with little experience, the{" "}
            <Link href="/jobs-you-can-do-from-home-with-no-experience" className="link">
              entry-level home jobs guide
            </Link>{" "}
            is a better place to begin.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See how close you are to one of these jobs"
        body={
          <p>
            Paste your CV and we will match your skills to jobs like these, show UK pay for each, and point out the
            gaps you would need to close. It is free and there is no account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/work-from-home-jobs", label: "Work from home and hybrid jobs", note: "Who works from home, the pay, and your rights" },
          { href: "/jobs-you-can-do-from-home-with-no-experience", label: "Jobs you can do from home with no experience" },
          { href: "/highest-paying-careers-uk", label: "The highest-paid jobs in the UK" },
          { href: "/what-jobs/jobs-that-pay-50k", label: "Jobs that pay £50k" },
          { href: "/freelance-careers-uk", label: "Going freelance in the UK" },
        ]}
      />
    </GuideShell>
  );
}
