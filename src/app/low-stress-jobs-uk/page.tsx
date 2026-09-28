import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  Prose,
  SourceNote,
  ToolCallout,
  formatGBP,
  formatNumber,
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import {
  ApprenticeshipSourceNote,
  AsheSourceNote,
  RouteList,
  UK_FT_MEDIAN,
  allOccupationPay,
  groupBySoc,
  groupPay,
  lcFirst,
  unitGroupPay,
  type SocRow,
} from "@/components/guides/pay";
import {
  ALL_3YR,
  ALL_5YR,
  HSE_PUBLISHED,
  HSE_REPORT_URL,
  HSE_TABLE_URL,
  MAJOR_3YR,
  UNIT_5YR,
  type HseRate,
} from "./hse-data";
import { titleInSentence } from "@/lib/text";

const PATH = "/low-stress-jobs-uk";
const TITLE = "Low-stress jobs in the UK that pay well (HSE and ONS data)";
const DESCRIPTION =
  "Which UK jobs report the least work-related stress, what they pay, and what the official HSE figures can and cannot tell you about any one job.";
const H1 = "Low-stress jobs in the UK: what the official data shows";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const ACCESS_TO_WORK_URL = "https://www.gov.uk/access-to-work";
const HSE_HELP_URL = "https://www.hse.gov.uk/stress/help-employee.htm";

interface MajorRow extends HseRate {
  median: number | null;
}

const VS_LABEL: Record<HseRate["vsAll"], string> = {
  higher: "Higher than average",
  lower: "Lower than average",
  no: "No significant difference",
};

function HseSourceNote({ period = "2022/23 to 2024/25" }: { period?: string }) {
  return (
    <SourceNote
      source="HSE, Self-reported work-related illness by occupation (LFSILLOCC), Table 5"
      href={HSE_TABLE_URL}
      published={HSE_PUBLISHED}
      note={`Prevalence of self-reported work-related stress, depression or anxiety per 100,000 workers, Great Britain, average for ${period}. Labour Force Survey.`}
    />
  );
}

export default function LowStressJobsPage() {
  const byRate = [...MAJOR_3YR].sort((a, b) => a.rate - b.rate);
  const majorRows: MajorRow[] = byRate.map((r) => ({ ...r, median: groupPay(r.soc).median }));
  const lowest = byRate.filter((r) => r.vsAll === "lower");
  const trades = MAJOR_3YR.find((r) => r.soc === "5")!;
  const operatives = MAJOR_3YR.find((r) => r.soc === "8")!;
  const assocProf = MAJOR_3YR.find((r) => r.soc === "3")!;

  // Better-paid jobs from our list in the two groups with the lowest reported rates.
  const lowerStressJobs: SocRow[] = groupBySoc(
    allOccupationPay().filter((p) => (p.soc.startsWith("5") || p.soc.startsWith("8")) && p.median !== null),
  ).slice(0, 12);

  const highestUnits = [...UNIT_5YR].filter((r) => r.vsAll === "higher").sort((a, b) => b.rate - a.rate);
  const lowerUnits = UNIT_5YR.filter((r) => r.vsAll === "lower");
  const unitPay = (soc: string) => unitGroupPay(soc).median;

  const faq = [
    {
      question: "What is the least stressful job in the UK?",
      answer: `No official source ranks individual jobs by stress. The closest measure is the rate of self-reported work-related stress, depression or anxiety that HSE publishes for occupation groups. In 2022/23 to 2024/25 the lowest rates were in skilled trades (${formatNumber(trades.rate)} per 100,000 workers) and process, plant and machine operatives, which includes drivers (${formatNumber(operatives.rate)}), against ${formatNumber(ALL_3YR.rate)} for all occupations.`,
    },
    {
      question: "Which low-stress jobs pay well?",
      answer: `Within the groups that report the least work-related stress, the best-paid jobs in our list by ONS median full-time pay (2025) are ${lowerStressJobs
        .slice(0, 5)
        .map((r) => `${lcFirst(r.name)} (${formatGBP(r.median ?? 0)})`)
        .join(", ")}. The stress figures are for whole groups, so they do not prove that any one of these jobs is low in stress.`,
    },
    {
      question: "Which jobs report the most work-related stress?",
      answer: `Over the five years 2020/21 to 2024/25, the highest rates HSE could estimate for individual occupations were for ${highestUnits
        .slice(0, 4)
        .map((r) => `${titleInSentence(r.title)} (${formatNumber(r.rate)} per 100,000)`)
        .join(", ")}, against ${formatNumber(ALL_5YR.rate)} for all occupations. HSE notes that the groups with higher rates often involve a lot of contact with the public and many are in the public sector.`,
    },
    {
      question: "What causes most work-related stress?",
      answer:
        "HSE says the main cause reported in the Labour Force Survey is workload: tight deadlines, too much work, or too much pressure or responsibility. Other factors include a lack of support from managers, violence and bullying, change at work, and not being clear about your role.",
    },
    {
      question: "Can I get support at work if I have anxiety or stress?",
      answer:
        "Your employer has a legal duty to assess the risk of stress at work, according to HSE, and HSE suggests talking to your manager, HR, a trade union representative, an employee assistance programme or your GP. If you have a mental health condition, the government's Access to Work scheme can help you get or stay in work, including a tailored plan and one-to-one sessions with a mental health professional.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Finding the right fit", href: "/what-job-is-right-for-me" }, { name: "Low-stress jobs" }]} />}
        kicker="Finding the right fit"
        title={H1}
        intro={
          <p>
            No official source ranks individual jobs by stress. What HSE does publish is how often people in each
            occupation group say their job caused or worsened stress, depression or anxiety. Skilled trades (
            {formatNumber(trades.rate)} per 100,000 workers) and machine operatives and drivers (
            {formatNumber(operatives.rate)}) report it least, against {formatNumber(ALL_3YR.rate)} for all jobs, and
            some of those jobs pay well above the UK median.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <HseSourceNote />
      </PageHeader>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-rule bg-surface p-5">
          <dt className="text-sm text-muted">Workers with work-related stress, depression or anxiety, 2024/25</dt>
          <dd className="mt-1 font-serif text-3xl font-semibold text-ink">964,000</dd>
        </div>
        <div className="rounded-lg border border-rule bg-surface p-5">
          <dt className="text-sm text-muted">Working days lost to it, 2024/25</dt>
          <dd className="mt-1 font-serif text-3xl font-semibold text-ink">22.1 million</dd>
        </div>
        <div className="rounded-lg border border-rule bg-surface p-5">
          <dt className="text-sm text-muted">Share of all work-related ill health</dt>
          <dd className="mt-1 font-serif text-3xl font-semibold text-ink">52%</dd>
        </div>
      </dl>
      <SourceNote
        className="mt-3"
        source="HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025"
        href={HSE_REPORT_URL}
        published={HSE_PUBLISHED}
        note="Labour Force Survey, Great Britain, new and long-standing cases."
      />

      <OnThisPage
        items={[
          { id: "by-group", label: "Stress and pay by occupation group" },
          { id: "jobs", label: "Better-paid jobs in lower-stress groups" },
          { id: "highest", label: "Jobs with the highest reported stress" },
          { id: "limits", label: "What the data cannot tell you" },
          { id: "support", label: "If stress is why you want to leave" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="by-group"
        title="Work-related stress and pay by occupation group"
        intro={
          <p>
            HSE&apos;s rate counts people who say a stress, depression or anxiety condition was caused or made worse
            by their current or most recent job. {lowest.length} of the nine broad groups have a rate that is
            statistically lower than average; professional and associate professional jobs are higher. Pay is the ONS
            median for full-time employees in the same group.
          </p>
        }
      >
        <DataTable<MajorRow>
          caption="Self-reported work-related stress and median pay, by occupation group"
          description="Rate per 100,000 workers, 2022/23 to 2024/25 (HSE), and median full-time pay, 2025 (ONS). Lowest rate first."
          rowKey={(r) => r.soc}
          columns={[
            { key: "title", header: "Occupation group", rowHeader: true },
            { key: "rate", header: "Stress rate per 100,000", numeric: true, format: "number" },
            {
              key: "ci",
              header: "95% range",
              numeric: true,
              render: (r) => `${formatNumber(r.ciLow)} to ${formatNumber(r.ciHigh)}`,
            },
            { key: "vs", header: "Compared with all jobs", render: (r) => VS_LABEL[r.vsAll] },
            { key: "median", header: "Median pay", numeric: true, format: "gbp" },
          ]}
          rows={majorRows}
          source={
            <div className="space-y-1.5">
              <HseSourceNote />
              <AsheSourceNote note="Median gross annual pay for full-time employee jobs, UK, 2025, for the same SOC 2020 major group." />
            </div>
          }
          notes={`All occupations: ${formatNumber(ALL_3YR.rate)} per 100,000 workers (95% range ${formatNumber(ALL_3YR.ciLow)} to ${formatNumber(ALL_3YR.ciHigh)}). The stress figures cover Great Britain; the pay figures cover the UK.`}
        />
      </GuideSection>

      <GuideSection
        id="jobs"
        title="Better-paid jobs in the groups that report the least stress"
        intro={
          <p>
            These jobs sit in the skilled trades or the operatives and drivers groups, the two with the lowest rates.
            The rate belongs to the whole group, not to each job, and many of these jobs bring pressures of their own:
            shift work, physical work, time away from home or strict safety rules. The UK median for full-time work
            is {formatGBP(UK_FT_MEDIAN)}.
          </p>
        }
      >
        <DataTable<SocRow>
          caption="Best-paid jobs in the skilled trades and operatives groups"
          description="Median gross annual pay, full-time employee jobs, UK, 2025, with the usual way in."
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
                    ONS group {r.soc}: {r.socTitle}
                  </span>
                </span>
              ),
            },
            { key: "median", header: "Median pay", numeric: true, render: (r) => formatGBP(r.median ?? 0) },
            { key: "route", header: "Way in", render: (r) => <RouteList occupations={r.occupations} /> },
          ]}
          rows={lowerStressJobs}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <ApprenticeshipSourceNote />
            </div>
          }
        />
        <Prose>
          <p>
            Managers, directors and senior officials also report less stress than average (
            {formatNumber(MAJOR_3YR.find((r) => r.soc === "1")!.rate)} per 100,000). That group is broad, from shop
            managers to chief executives, so the average says little about any one management job.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="highest"
        title="Where people report the most work-related stress"
        intro={
          <p>
            HSE has enough survey responses to estimate a rate for only a few individual occupations. Over the five
            years 2020/21 to 2024/25 (which include the pandemic), these had rates statistically higher than the{" "}
            {formatNumber(ALL_5YR.rate)} per 100,000 for all occupations. Associate professional jobs as a whole, which
            include health and social care roles and the police, averaged {formatNumber(assocProf.rate)} in 2022/23 to
            2024/25.
          </p>
        }
      >
        <DataTable<HseRate>
          caption="Occupations with the highest reported work-related stress"
          description="Rate per 100,000 workers, five-year average 2020/21 to 2024/25, Great Britain, with ONS median full-time pay for 2025."
          rowKey={(r) => r.soc}
          columns={[
            {
              key: "title",
              header: "Occupation",
              rowHeader: true,
              render: (r) => (
                <>
                  {r.title}
                  {r.lowSample && <span className="text-xs font-normal text-muted"> (small sample)</span>}
                </>
              ),
            },
            { key: "rate", header: "Stress rate per 100,000", numeric: true, format: "number" },
            {
              key: "ci",
              header: "95% range",
              numeric: true,
              render: (r) => `${formatNumber(r.ciLow)} to ${formatNumber(r.ciHigh)}`,
            },
            {
              key: "pay",
              header: "Median pay",
              numeric: true,
              render: (r) => {
                const m = unitPay(r.soc);
                return m === null ? <span className="text-muted">not published</span> : formatGBP(m);
              },
            },
          ]}
          rows={highestUnits}
          source={
            <div className="space-y-1.5">
              <HseSourceNote period="2020/21 to 2024/25" />
              <AsheSourceNote note="ONS did not publish 2025 pay for police officers (sergeant and below) after a correction on 19 December 2025." />
            </div>
          }
          notes={`For comparison, HSE's estimates for ${lowerUnits.map((r) => `${titleInSentence(r.title)} (${formatNumber(r.rate)})`).join(" and ")} were statistically lower than average over the same period. Small sample: HSE flags the estimate as based on 20 to 29 survey cases.`}
        />
        <Prose>
          <p>
            If you are in one of these jobs and thinking of leaving, our guides for{" "}
            <Link href="/career-change-from-teaching">teachers</Link>,{" "}
            <Link href="/non-clinical-jobs-for-nurses">nurses</Link> and{" "}
            <Link href="/jobs-for-ex-police-officers">police officers</Link> show where people usually go next and what
            it pays.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="limits" title="What the data cannot tell you">
        <Prose>
          <ul>
            <li>
              <strong>It is about groups, not jobs.</strong> HSE publishes rates for broad occupation groups. A job in a
              low-rate group can still be stressful, and the reverse.
            </li>
            <li>
              <strong>It is self-reported.</strong> The figures count people who believe their condition was caused
              or made worse by work. They come from the Labour Force Survey, a sample of households, so each estimate
              has a range of uncertainty (the 95% range in the tables).
            </li>
            <li>
              <strong>It reflects who does the job now.</strong> People who found a job stressful may already have
              left it, and different jobs attract different people, so a low rate is not proof that the job itself is
              calm.
            </li>
            <li>
              <strong>It does not measure other things that matter.</strong> Physical risks, night and shift work,
              and time away from home are not part of this measure.
            </li>
            <li>
              <strong>Your own situation matters most.</strong> HSE says the main causes are workload, lack of
              managerial support, violence and bullying, change at work and unclear roles. The same job can feel very
              different with a different employer or manager.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="support" title="If stress is the reason you want to leave">
        <Prose>
          <p>
            A new career takes time, and the pressure you are under now matters in the meantime. HSE says your
            employer must assess the risks to your health from stress at work and share the results with you, and it
            suggests talking to your manager early, or to HR, a trade union representative, an employee assistance
            programme or your GP if your manager is part of the problem (
            <a href={HSE_HELP_URL} rel="noopener">
              HSE: help for employees on stress at work
            </a>
            ).
          </p>
          <p>
            If you have anxiety, depression or another mental health condition, the government&apos;s{" "}
            <a href={ACCESS_TO_WORK_URL} rel="noopener">
              Access to Work
            </a>{" "}
            scheme can help you get or stay in work. Its mental health support can include a tailored plan and
            one-to-one sessions with a mental health professional. Our guide to{" "}
            <Link href="/jobs-for-people-with-adhd">jobs for people with ADHD</Link> covers workplace adjustments in
            more detail.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Find calmer work that uses the skills you have"
        body={
          <p>
            Paste your CV to see the jobs your skills lead to, with ONS pay for each. Free, and you do not need an
            account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/best-jobs-for-work-life-balance", label: "Jobs with a good work-life balance" },
          { href: "/jobs-for-introverts", label: "Jobs for introverts" },
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
          { href: "/jobs-for-people-who-hate-their-job", label: "If you hate your job" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ]}
      />
    </GuideShell>
  );
}
