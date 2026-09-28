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
  ASHE_2026_RELEASE_URL,
  AsheSourceNote,
  UK_FT_MEDIAN,
  allOccupationPay,
  allUnitGroupPay,
  groupBySoc,
  lcFirst,
  type UnitGroupPay,
} from "@/components/guides/pay";
import { ASHE_NATIONAL, SOC_SOURCE, getSocUnitGroup } from "@/data/careers";
import { titleInSentence } from "@/lib/text";

const PATH = "/highest-paying-careers-uk";
const TITLE = "Highest paying jobs in the UK: ONS 2025 pay table";
const DESCRIPTION =
  "The UK's highest-paid occupations ranked by ONS median full-time pay for 2025, with pay ranges, how people get in, and which need no degree.";
const H1 = "The highest-paid jobs in the UK";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const QUALITY_LABEL: Record<string, string> = {
  precise: "Precise",
  "reasonably precise": "Reasonably precise",
  acceptable: "Acceptable",
};

interface RankedRow extends UnitGroupPay {
  rank: number;
}

function firstSentences(text: string, max = 240): string {
  const sentences = text.match(/[^.]+\./g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max && out) break;
    out += s;
  }
  return out.trim();
}

export default function HighestPayingCareersPage() {
  const ranked = allUnitGroupPay()
    .filter((u) => u.median !== null)
    .sort((a, b) => (b.median ?? 0) - (a.median ?? 0));
  const top: RankedRow[] = ranked.slice(0, 30).map((u, i) => ({ ...u, rank: i + 1 }));
  const first = top[0];
  const count = (min: number) => ranked.filter((u) => (u.median ?? 0) >= min).length;
  const over60 = count(60000);
  const over70 = count(70000);
  const over80 = count(80000);
  const over100 = count(100000);
  const ft = ASHE_NATIONAL.ft;

  const noDegreeTop = groupBySoc(allOccupationPay().filter((p) => !p.degreeUsuallyRequired && p.median !== null)).slice(0, 3);

  const specialists = top.find((u) => u.soc === "2212");
  const over100Upper = ranked.filter((u) => (u.p75 ?? 0) >= 100000);

  const faq = [
    {
      question: "What is the highest-paid job in the UK?",
      answer: `In the 2025 ONS figures the occupation group with the highest median full-time pay was ${titleInSentence(first.title)} (SOC ${first.soc}), at ${formatGBP(first.median ?? 0)} a year.${specialists ? ` Specialist medical practitioners and consultants were next among professional jobs at ${formatGBP(specialists.median ?? 0)}.` : ""} These are medians: individual pay in these groups varies widely.`,
    },
    {
      question: "Which jobs pay over £100,000 a year?",
      answer: `No occupation group had a median full-time salary of £100,000 or more in the 2025 ONS figures. In a few groups at least a quarter of full-time employees earned over £100,000: ${over100Upper.map((u) => `${titleInSentence(u.title)} (upper quarter ${formatGBP(u.p75 ?? 0)})`).join(", ")}. Across all full-time employee jobs, 90% paid less than ${formatGBP(ft.p90 ?? 0)}.`,
    },
    {
      question: "How many jobs pay over £60,000?",
      answer: `${over60} of the ${ranked.length} occupation groups ONS publishes had a full-time median of £60,000 or more in 2025, and ${over70} had one of £70,000 or more. Across all full-time employee jobs, 80% paid less than ${formatGBP(ft.p80 ?? 0)}.`,
    },
    {
      question: "What is the highest-paid job without a degree?",
      answer: `Among the jobs in our list that do not normally need a degree, the best paid by ONS median are ${noDegreeTop.map((r) => `${lcFirst(r.name)} (${formatGBP(r.median ?? 0)})`).join(", ")}. Our guide to well-paid jobs without a degree shows the apprenticeship or licence route for each.`,
    },
    {
      question: "When will the 2026 figures be published?",
      answer:
        "ONS publishes Employee earnings in the UK: 2026, which includes the new occupation tables, on 22 October 2026 at 9:30am. We will update this table when it is out.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Jobs by salary", href: "/what-jobs" }, { name: "Highest-paid jobs" }]} />}
        kicker="Pay"
        title={H1}
        intro={
          <p>
            The best-paid occupation group in the UK is {titleInSentence(first.title)}, with a median of{" "}
            <SalaryFigure value={first.median} size="sm" /> for full-time employees in the latest ONS figures. Only{" "}
            {over60} of the {ranked.length} groups ONS publishes have a median of £60,000 or more, and none reaches
            £100,000. The UK median for full-time work is <SalaryFigure value={UK_FT_MEDIAN} size="sm" />.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <AsheSourceNote />
      </PageHeader>

      <aside className="max-w-reading rounded-[22px] bg-sky p-6 text-ink">
        <p className="font-semibold">New figures on 22 October 2026</p>
        <p className="mt-1 text-ink-2">
          These are the 2025 figures, the latest available. ONS publishes the 2026 edition on{" "}
          <a href={ASHE_2026_RELEASE_URL} className="link" rel="noopener">
            22 October 2026 at 9:30am
          </a>
          , and this table will be updated with it.
        </p>
      </aside>

      <OnThisPage
        items={[
          { id: "table", label: "The top 30 by median pay" },
          { id: "thresholds", label: "How many pay £60k, £70k or £100k" },
          { id: "routes", label: "How people get into the top 10" },
          { id: "missing", label: "Who is not in the table" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="table"
        title="The 30 highest-paid occupations in the UK"
        intro={
          <p>
            Ranked by median gross annual pay for full-time employees. The quarter columns show the spread: a quarter
            of people in the group earn less than the lower figure and a quarter earn more than the upper one. ONS does
            not publish a figure it considers unreliable, so some cells are blank.
          </p>
        }
      >
        <DataTable<RankedRow>
          caption="Highest-paid occupation groups, UK, 2025"
          description="Median, lower and upper quarter gross annual pay, full-time employee jobs, tax year ending 5 April 2025."
          rowKey={(r) => r.soc}
          columns={[
            { key: "rank", header: "Rank", numeric: true, className: "w-14" },
            {
              key: "title",
              header: "Occupation group",
              rowHeader: true,
              render: (r) => (
                <>
                  {r.title} <span className="text-xs font-normal text-muted">({r.soc})</span>
                </>
              ),
            },
            { key: "median", header: "Median", numeric: true, format: "gbp" },
            { key: "p25", header: "Lower quarter", numeric: true, format: "gbp" },
            { key: "p75", header: "Upper quarter", numeric: true, format: "gbp" },
            {
              key: "jobsThousands",
              header: "Jobs (000s)",
              numeric: true,
              render: (r) => (r.jobsThousands === null ? <span className="text-muted">n/a</span> : String(r.jobsThousands)),
            },
            {
              key: "quality",
              header: "ONS reliability",
              render: (r) => (r.quality ? QUALITY_LABEL[r.quality] ?? r.quality : <span className="text-muted">n/a</span>),
            },
          ]}
          rows={top}
          source={<AsheSourceNote />}
          notes={
            <>
              n/a: not published by ONS. Job counts are indicative only. Reliability is the ONS quality band for the
              median, based on its coefficient of variation (precise up to 5%, reasonably precise up to 10%,
              acceptable up to 20%).
            </>
          }
        />
      </GuideSection>

      <GuideSection id="thresholds" title="How many jobs pay £60k, £70k, £80k or £100k?">
        <DataTable<{ label: string; groups: number }>
          caption="Occupation groups by median full-time pay threshold"
          rowKey={(r) => r.label}
          columns={[
            { key: "label", header: "Median of at least", rowHeader: true },
            { key: "groups", header: "Occupation groups", numeric: true, format: "number" },
          ]}
          rows={[
            { label: "£60,000", groups: over60 },
            { label: "£70,000", groups: over70 },
            { label: "£80,000", groups: over80 },
            { label: "£100,000", groups: over100 },
          ]}
          source={<AsheSourceNote />}
        />
        <Prose>
          <p>
            Looked at another way, across every full-time employee job in the UK, 80% paid less than{" "}
            {formatGBP(ft.p80 ?? 0)} and 90% paid less than {formatGBP(ft.p90 ?? 0)} in the tax year to April 2025.
            A salary of £60,000 or more puts you in the top fifth of full-time employee jobs.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="routes"
        title="How people get into the ten best-paid occupations"
        intro={<p>In the ONS&apos;s own words, from its description of each occupation group.</p>}
      >
        <ol className="mt-6 max-w-reading space-y-4">
          {top.slice(0, 10).map((r) => (
            <li key={r.soc} className="rounded-[20px] bg-cloud p-5">
              <p className="font-semibold text-ink">
                {r.rank}. {r.title}{" "}
                <span className="font-normal text-muted">
                  ({formatGBP(r.median ?? 0)})
                </span>
              </p>
              <p className="mt-1 text-ink-2">{firstSentences(getSocUnitGroup(r.soc)?.entryRoutes ?? "")}</p>
            </li>
          ))}
        </ol>
        <SourceNote
          className="mt-4"
          label="Entry routes"
          source="ONS, SOC 2020 Volume 1: structure and descriptions of unit groups"
          href={SOC_SOURCE.pageUrl}
          note={SOC_SOURCE.attribution}
        />
      </GuideSection>

      <GuideSection id="missing" title="Who is not in the table">
        <Prose>
          <ul>
            <li>
              <strong>The self-employed.</strong> The survey behind these figures covers employees only, so it says
              nothing about people who work for themselves, including partners who own their business or practice.
            </li>
            <li>
              <strong>Groups ONS did not publish.</strong> ONS suppresses estimates that are unreliable or could
              identify people. In the 2025 tables that includes dental practitioners and officers in the armed forces.
              Figures for police officers (sergeant and below) were withdrawn in an ONS correction on 19 December 2025.
            </li>
          </ul>
          <p>
            Want a well-paid job you can train into without a degree? Our guide to{" "}
            <Link href="/jobs-without-a-degree">well-paid jobs without a degree</Link> shows the apprenticeship or
            licence route for each, and{" "}
            <Link href="/what-jobs/jobs-that-pay-50k">jobs that pay £50k</Link> covers the next band down.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See which well-paid jobs your experience leads to"
        body={
          <p>
            Paste your CV and we will show the skills you already have, the jobs they lead to with ONS pay, and the
            gaps to close. Free, and you do not need an account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
          { href: "/what-jobs/jobs-that-pay-50k", label: "Jobs that pay £50k a year" },
          { href: "/what-jobs/jobs-that-pay-40k", label: "Jobs that pay £40k a year" },
          { href: "/what-jobs", label: "UK jobs by salary band" },
          { href: "/best-careers-for-the-future-uk", label: "Best careers for the future in the UK" },
        ]}
      />
    </GuideShell>
  );
}
