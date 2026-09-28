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
import { AsheSourceNote, UK_FT_MEDIAN, unitGroupPay, type UnitGroupPay } from "@/components/guides/pay";
import { GOV, HSE_STRESS_2025, ONS_HYBRID_2024, OPN_2026 } from "../work-from-home-jobs/_data/sources";

const PATH = "/best-jobs-for-work-life-balance";
const TITLE = "Best jobs for work-life balance in the UK, with pay data";
const DESCRIPTION =
  "UK jobs with regular hours and room for flexible working, with ONS 2025 pay, what HSE stress data shows by sector, and the rights working parents can use.";
const H1 = "Jobs with a better work-life balance";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

/**
 * Editorial picks: desk-based jobs with regular hours, in occupation groups where
 * home and hybrid working is common and outside the smaller groups HSE flags for
 * higher stress rates. `why` and `watch` are our judgement, not sourced data.
 */
const PICKS: { soc: string; name: string; why: string; watch: string }[] = [
  {
    soc: "2134",
    name: "Software developer",
    why: "Work is planned in projects and done at a computer, and hybrid working is common.",
    watch: "Some teams run on-call rotas for live systems. Ask before you accept an offer.",
  },
  {
    soc: "2433",
    name: "Actuary, economist or statistician",
    why: "Analytical work to reporting cycles rather than shifts.",
    watch: "ONS says professional qualifications are mandatory for actuaries, so expect professional exams.",
  },
  {
    soc: "2482",
    name: "Compliance or quality assurance manager",
    why: "Work runs to audit and regulatory calendars that are known in advance.",
    watch: "Busy periods around audits and reporting deadlines.",
  },
  {
    soc: "2136",
    name: "Software tester",
    why: "Testing is scheduled as part of project plans.",
    watch: "Release dates can squeeze testing time at the end of a project.",
  },
  {
    soc: "3412",
    name: "Technical author or copywriter",
    why: "Deadline-based work that is often done from home.",
    watch: "Writers who work for themselves are not in the ONS pay figures, and freelance income is less predictable.",
  },
  {
    soc: "4215",
    name: "Personal assistant or secretary",
    why: "Office hours, in the administrative group where hybrid working is common.",
    watch: "Your hours can follow the person you support.",
  },
  {
    soc: "4122",
    name: "Bookkeeper or payroll clerk",
    why: "Regular hours with deadlines you can see coming.",
    watch: "Month-end, payroll dates and the tax year-end are busy.",
  },
];

type PickRow = UnitGroupPay & { name: string; why: string; watch: string; someHome: number | null };

function majorGroupSomeHome(soc: string): number | null {
  const row = OPN_2026.byOccupation.find((o) => o.code === soc.charAt(0));
  return row ? row.homeOnly + row.hybrid : null;
}

export default function WorkLifeBalancePage() {
  const rows: PickRow[] = PICKS.map((p) => ({ ...unitGroupPay(p.soc), ...p, someHome: majorGroupSomeHome(p.soc) })).sort(
    (a, b) => (b.median ?? 0) - (a.median ?? 0),
  );
  const hse = HSE_STRESS_2025;
  const parents = OPN_2026.parents;
  const nonParents = OPN_2026.nonParents;

  const faq = [
    {
      question: "Which jobs have the best work-life balance in the UK?",
      answer: `No official source ranks jobs by work-life balance. Our picks are desk-based jobs with regular hours and flexible working, outside the sectors where HSE records the most work-related stress. Examples with ONS 2025 median full-time pay include ${rows
        .slice(0, 3)
        .map((r) => `${r.name.toLowerCase()} (${formatGBP(r.median ?? 0)})`)
        .join("; ")}.`,
    },
    {
      question: "Which jobs are the most stressful in the UK?",
      answer: `HSE's 2025 statistics show the highest rates of work-related stress, depression or anxiety in public administration and defence (${formatNumber(hse.publicAdminRate)} cases per 100,000 workers), human health and social work (${formatNumber(hse.healthSocialWorkRate)}) and education (${formatNumber(hse.educationRate)}), against ${formatNumber(hse.allIndustriesRate)} across all industries, averaged over 2022/23 to 2024/25. By job, health professionals, teaching professionals, health and social care associate professionals and protective service occupations were among those with higher rates.`,
    },
    {
      question: "Can my employer make me work more than 48 hours a week?",
      answer:
        "Not on average, unless you agree. GOV.UK says you cannot work more than 48 hours a week on average, normally averaged over 17 weeks, but you can choose to opt out. Some jobs are exceptions, including those needing 24-hour staffing, the armed forces, emergency services and police.",
    },
    {
      question: "Can I ask to work part time or from home?",
      answer:
        "Yes. In England, Scotland and Wales every employee can make a statutory request for flexible working from their first day in a job, covering hours, start and finish times, days and where they work. You can make 2 requests in 12 months, and your employer must decide within 2 months unless you agree longer. They can refuse for a business reason.",
    },
    {
      question: "What time off can working parents take?",
      answer:
        "Employees can take up to 18 weeks of unpaid parental leave for each child before their 18th birthday, usually no more than 4 weeks a year per child. You also have the right to a reasonable amount of time off to deal with an emergency involving a dependant, such as a child falling ill. Your employer does not have to pay you for it.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Jobs for work-life balance" }]} />
        }
        kicker="Choosing a career"
        title={H1}
        intro={
          <p>
            No official source ranks jobs by work-life balance, so this guide uses what can be measured: where
            flexible and hybrid working is common, which sectors report the most work-related stress, and what the
            jobs pay. Desk jobs offer the most flexible and hybrid working, but they are not automatically low-stress,
            and public-facing jobs in the public sector report the most stress.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <SourceNote source={hse.source} href={hse.href} published={hse.published} />
      </PageHeader>

      <OnThisPage
        items={[
          { id: "evidence", label: "What the evidence says" },
          { id: "jobs", label: "Jobs with regular hours and flexibility" },
          { id: "rights", label: "Your rights on hours and holiday" },
          { id: "parents", label: "If you are a parent" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection id="evidence" title="What the evidence says about balance">
        <Prose>
          <p>
            The Health and Safety Executive estimates that {formatNumber(hse.workers2425)} workers in Great Britain
            had work-related stress, depression or anxiety in 2024/25, with {hse.daysLost2425Millions} million working
            days lost. Averaged over 2022/23 to 2024/25, three sectors had significantly higher rates than the{" "}
            {formatNumber(hse.allIndustriesRate)} per 100,000 workers across all industries:
          </p>
          <ul>
            <li>public administration and defence: {formatNumber(hse.publicAdminRate)} per 100,000</li>
            <li>human health and social work: {formatNumber(hse.healthSocialWorkRate)} per 100,000</li>
            <li>education: {formatNumber(hse.educationRate)} per 100,000</li>
          </ul>
          <p>
            Office jobs are not automatically calmer. Professional occupations ({formatNumber(hse.professionalRate)})
            and associate professional occupations ({formatNumber(hse.associateProfessionalRate)}) also had higher
            rates than average. HSE says the jobs with higher rates often involve a lot of contact with the public,
            and many are largely in the public sector. In HSE&apos;s latest data on causes (2009/10 to 2011/12), the
            main cause people gave was workload: tight deadlines, too much work, or too much pressure and
            responsibility. Other factors included a lack of support from managers, bullying and changes at work.
          </p>
          <p>
            So the workload, the manager and how much control you have over your hours matter as much as the job
            title. When you compare offers, ask about typical weekly hours, on-call or weekend work, and how many days
            you can work from home.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="jobs"
        title="Jobs with regular hours and room for flexible working"
        intro={
          <p>
            These are our picks: desk-based jobs with regular hours, in occupation groups where home and hybrid
            working is common, and outside the smaller job groups HSE flags for higher stress. The reasons and
            warnings are our judgement. Pay is the ONS median for full-time employees; the UK median for all full-time
            jobs is {formatGBP(UK_FT_MEDIAN)}.
          </p>
        }
      >
        <DataTable<PickRow>
          caption="Jobs with regular hours and flexible working: UK pay"
          description={`Median gross annual pay, full-time employee jobs, UK, 2025. Home working is the share of people in the job's ONS major group who worked at home for part or all of the week, ${OPN_2026.period}.`}
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
            {
              key: "someHome",
              header: "Home working in group",
              numeric: true,
              render: (r) => (r.someHome === null ? <span className="text-muted">n/a</span> : `${r.someHome}%`),
            },
            { key: "why", header: "Why it can suit" },
            { key: "watch", header: "Watch for" },
          ]}
          rows={rows}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <SourceNote source={OPN_2026.source} href={OPN_2026.href} published={OPN_2026.published} />
            </div>
          }
        />
        <Prose>
          <p>
            <strong>What we left out.</strong> Earlier versions of this page listed teaching, therapy, some NHS roles
            and the civil service because of their holidays, fixed shifts or flexitime. Education, health and social
            work, and public administration are the three sectors HSE found to have significantly higher stress rates
            than average, so we no longer suggest them for balance, though individual employers vary. For jobs chosen mainly for lower pressure, see{" "}
            <Link href="/low-stress-jobs-uk" className="link">
              low-stress jobs in the UK
            </Link>
            .
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="rights" title="Your rights on hours and holiday">
        <Prose>
          <ul>
            <li>
              <strong>Working hours.</strong> You cannot be made to work more than 48 hours a week on average,
              normally averaged over 17 weeks, but you can choose to opt out. Some jobs are exceptions, such as those
              needing 24-hour staffing (
              <a href={GOV.maxHours} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Holiday.</strong>{" "}Almost all workers are entitled to 5.6 weeks&apos; paid holiday a year. For
              someone working 5 days a week that is 28 days, and employers can count bank holidays as part of it (
              <a href={GOV.holiday} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Flexible working.</strong> In England, Scotland and Wales, employees can ask from their first
              day to change their hours, their start and finish times, the days they work or where they work. Options
              include part time, compressed hours, flexitime, job sharing and hybrid working. You can make 2 requests
              in 12 months; your employer must decide within 2 months and can refuse for a business reason (
              <a href={GOV.flexibleWorking} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="parents" title="If you are a parent">
        <Prose>
          <p>
            Parents are more likely than other workers to work from home. In ONS&apos;s survey for {OPN_2026.period},{" "}
            {parents.homeOnly}% of parents of dependent children worked only from home and {parents.hybrid}% were
            hybrid, compared with {nonParents.homeOnly}% and {nonParents.hybrid}% of other workers. An earlier{" "}
            <a href={ONS_HYBRID_2024.href} className="link" rel="noopener">
              ONS analysis
            </a>{" "}
            for {ONS_HYBRID_2024.period} found working fathers more likely to be hybrid than working mothers:{" "}
            {ONS_HYBRID_2024.fathers}% against {ONS_HYBRID_2024.mothers}%.
          </p>
          <p>The rights and help that make most difference, from GOV.UK:</p>
          <ul>
            <li>
              <strong>Flexible working from day one</strong>, including part time, compressed hours, flexitime or
              staggered hours, as above.
            </li>
            <li>
              <strong>Unpaid parental leave:</strong> up to 18 weeks for each child before their 18th birthday,
              usually no more than 4 weeks a year per child. It applies to employees, not the self-employed or agency
              workers (
              <a href={GOV.parentalLeaveEntitlement} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Time off for dependants:</strong> a reasonable amount of time to deal with an emergency, such as
              a child falling ill. Your employer does not have to pay you for it (
              <a href={GOV.dependants} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Tax-Free Childcare:</strong> for every £8 you pay into a childcare account, the government adds
              £2, up to £2,000 a year for each child aged 11 or under (£4,000 for a disabled child, up to age 16) (
              <a href={GOV.taxFreeChildcare} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
          </ul>
          <p>
            If you are returning after time away, our guide to{" "}
            <Link href="/best-jobs-for-women-returning-to-work" className="link">
              jobs for returning to work
            </Link>{" "}
            covers refreshing skills and routes back in.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Find jobs that fit your skills and your life"
        body={
          <p>
            Paste your CV or type the job you do now. We will show the jobs your experience leads to, with UK pay, so
            you can weigh up the ones that give you more control over your time. It is free and there is no account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/low-stress-jobs-uk", label: "Low-stress jobs in the UK" },
          { href: "/work-from-home-jobs", label: "Work from home and hybrid jobs" },
          { href: "/best-jobs-for-women-returning-to-work", label: "Jobs for returning to work" },
          { href: "/jobs-for-people-who-hate-their-job", label: "If you hate your job" },
          { href: "/what-job-is-right-for-me", label: "What job is right for me?" },
        ]}
      />
    </GuideShell>
  );
}
