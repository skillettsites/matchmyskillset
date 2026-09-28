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
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, UK_FT_MEDIAN, groupPay, unitGroupPay, type UnitGroupPay } from "@/components/guides/pay";
import { SOC_SOURCE, getSocUnitGroup } from "@/data/careers";
import { GOV, HSE_HOME_WORKERS, ONS_HYBRID_2024, ONS_HYBRID_2025, OPN_2026 } from "./_data/sources";

const PATH = "/work-from-home-jobs";
const TITLE = "Work from home jobs in the UK: who does them and the pay";
const DESCRIPTION =
  "How many UK workers work from home or hybrid (ONS 2026), which kinds of job allow it, what those jobs pay, and your right to ask for flexible working.";
const H1 = "Work from home and hybrid jobs in the UK";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

/** Mid-level jobs in the office-based occupation groups where home and hybrid working is most common. */
const MID_LEVEL: { soc: string; name: string }[] = [
  { soc: "3412", name: "Writer, copywriter or translator" },
  { soc: "3544", name: "Data analyst" },
  { soc: "3133", name: "Database administrator or web content editor" },
  { soc: "3571", name: "HR or recruitment officer" },
  { soc: "3132", name: "IT support technician" },
  { soc: "4215", name: "Personal assistant or secretary" },
  { soc: "3554", name: "Marketing executive" },
  { soc: "4122", name: "Bookkeeper or payroll clerk" },
];

type MidRow = UnitGroupPay & { name: string; titles: string };

type OccRow = (typeof OPN_2026.byOccupation)[number] & { median: number | null; some: number };

export default function WorkFromHomeJobsPage() {
  const occRows: OccRow[] = OPN_2026.byOccupation.map((o) => ({
    ...o,
    median: groupPay(o.code).median,
    some: o.homeOnly + o.hybrid,
  }));
  const midRows: MidRow[] = MID_LEVEL.map((m) => ({
    ...unitGroupPay(m.soc),
    name: m.name,
    titles: (getSocUnitGroup(m.soc)?.relatedJobTitles ?? []).slice(0, 4).join(", "),
  })).sort((a, b) => (b.median ?? 0) - (a.median ?? 0));
  const all = OPN_2026.all;
  const someHome = all.homeOnly + all.hybrid;
  const office = occRows.filter((o) => ["1", "2", "3", "4"].includes(o.code));
  const handsOn = occRows.filter((o) => ["5", "6", "7", "8", "9"].includes(o.code));
  const officeMin = Math.min(...office.map((o) => o.some));
  const officeMax = Math.max(...office.map((o) => o.some));
  const handsOnMax = Math.max(...handsOn.map((o) => o.some));

  const faq = [
    {
      question: "How many people in the UK work from home?",
      answer: `In the ONS Opinions and Lifestyle Survey for ${OPN_2026.period}, ${all.homeOnly}% of working adults in Great Britain worked only from home in the previous week and ${all.hybrid}% were hybrid, working partly at home and partly at a workplace. ${all.travelOnly}% only travelled to work. ONS asks about the previous seven days, so the figures are a snapshot rather than people's contracts.`,
    },
    {
      question: "Which jobs can you do from home?",
      answer: `Mostly office-based work. Among managers, professionals, associate professionals and administrative staff, between ${officeMin}% and ${officeMax}% worked at home for at least part of the week in ${OPN_2026.period}. In trades, caring, sales and customer service, machine operation and elementary jobs it was ${handsOnMax}% or less.`,
    },
    {
      question: "Can I ask my employer to let me work from home?",
      answer: `Yes. Every employee in England, Scotland and Wales can make a statutory request for flexible working, including where they work, from their first day in a job. You can make 2 requests in any 12 months. Your employer must deal with it reasonably, discuss it with you before refusing, and decide within 2 months unless you agree longer. They can refuse for one of the business reasons GOV.UK lists, such as extra costs or an effect on quality. Northern Ireland has different rules.`,
    },
    {
      question: "Can I claim tax relief for working from home?",
      answer:
        "Not for the 2026 to 2027 tax year: GOV.UK says the relief is not available from 6 April 2026. You can still claim for the 4 previous tax years, but only if you had to work from home, for example because your employer has no office. If you chose to work from home, or your contract lets you, you cannot claim.",
    },
    {
      question: "Do work from home jobs pay less?",
      answer: `ONS does not publish pay by where people work. What it does show is that home and hybrid working is most common among managers and professionals, the two best-paid occupation groups, and that ${ONS_HYBRID_2025.income50kPlus}% of workers earning £50,000 or more were hybrid working in ${ONS_HYBRID_2025.period}, compared with ${ONS_HYBRID_2025.incomeUnder20k}% of those earning under £20,000.`,
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Work from home jobs" }]} />}
        kicker="Working from home"
        title={H1}
        intro={
          <p>
            About {someHome}% of working adults in Great Britain did some work from home in {OPN_2026.period}:{" "}
            {all.homeOnly}% worked only from home and {all.hybrid}% split their week between home and a workplace,
            according to ONS. Hybrid is more common than fully remote work, and whether you can do either depends
            heavily on the type of job.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <SourceNote source={OPN_2026.source} href={OPN_2026.href} published={OPN_2026.published} />
      </PageHeader>

      <OnThisPage
        items={[
          { id: "which-jobs", label: "Which kinds of job are done from home" },
          { id: "jobs-to-look-at", label: "Jobs to look at" },
          { id: "your-rights", label: "Your right to ask for flexible working" },
          { id: "costs-and-rules", label: "Tax, costs and safety" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="which-jobs"
        title="Which kinds of job are done from home"
        intro={
          <p>
            ONS regularly asks working adults whether they worked from home, travelled to work, or both, in the
            previous seven days. The split by occupation group shows where home working actually happens. Pay is the
            ONS median for full-time employees in the same group.
          </p>
        }
      >
        <DataTable<OccRow>
          caption="Where people worked, by occupation group, with median pay"
          description={`Great Britain, ${OPN_2026.period} (working arrangements); UK, 2025 (pay).`}
          rowKey={(r) => r.code}
          columns={[
            { key: "label", header: "Occupation group", rowHeader: true },
            { key: "homeOnly", header: "Only from home", numeric: true, render: (r) => `${r.homeOnly}%` },
            { key: "hybrid", header: "Hybrid", numeric: true, render: (r) => `${r.hybrid}%` },
            { key: "travelOnly", header: "Only travelled to work", numeric: true, render: (r) => `${r.travelOnly}%` },
            {
              key: "median",
              header: "Median full-time pay",
              numeric: true,
              render: (r) => (r.median === null ? <span className="text-muted">not published</span> : formatGBP(r.median)),
            },
          ]}
          rows={occRows}
          source={
            <div className="space-y-1.5">
              <SourceNote source={OPN_2026.source} href={OPN_2026.href} published={OPN_2026.published} note={OPN_2026.note} />
              <AsheSourceNote />
            </div>
          }
          notes="Rows do not add up to 100% because ONS also counts people who neither worked from home nor travelled that week, for example because they were on leave."
        />
        <Prose>
          <p>
            In the four office-based groups, {officeMin}% to {officeMax}% worked at home for at least part of the week.
            In the other five it was {handsOnMax}% or less. Within the office-based groups, hybrid working is roughly
            twice as common as working only from home, so most &ldquo;remote&rdquo; jobs you see advertised will
            expect some days in a workplace.
          </p>
          <p>
            Home working also follows pay and qualifications. ONS found that {ONS_HYBRID_2025.income50kPlus}% of
            workers earning £50,000 or more were hybrid working in {ONS_HYBRID_2025.period}, against{" "}
            {ONS_HYBRID_2025.incomeUnder20k}% of those earning under £20,000 (
            <a href={ONS_HYBRID_2025.href} className="link" rel="noopener">
              ONS, June 2025
            </a>
            ). In the 2026 survey, {OPN_2026.degree.hybrid}% of workers with a degree were hybrid, compared with{" "}
            {OPN_2026.noQualifications.hybrid}% of those with no qualifications. Self-employed people were far more
            likely than employees to work only from home ({OPN_2026.selfEmployed.homeOnly}% against{" "}
            {OPN_2026.employed.homeOnly}%).
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="jobs-to-look-at"
        title="Jobs to look at, depending on where you are starting"
        intro={
          <p>
            We have split home-friendly jobs across three guides so each can go into detail. This page covers the
            middle: jobs in the office-based groups above that people often move into with some work experience or
            training, rather than years in a profession.
          </p>
        }
      >
        <div className="mt-6 grid max-w-reading gap-3 sm:grid-cols-2">
          <Link
            href="/jobs-you-can-do-from-home-with-no-experience"
            className="block min-h-11 rounded-[20px] bg-cloud p-5 text-ink hover:border-accent"
          >
            <span className="block font-semibold">Starting with no experience</span>
            <span className="mt-1 block text-sm text-ink-2">Customer service, admin, data entry and typing, and how to avoid job scams.</span>
          </Link>
          <Link
            href="/highest-paying-remote-jobs-uk"
            className="block min-h-11 rounded-[20px] bg-cloud p-5 text-ink hover:border-accent"
          >
            <span className="block font-semibold">Already a professional or manager</span>
            <span className="mt-1 block text-sm text-ink-2">The best-paid jobs that are commonly done from home, with ONS pay.</span>
          </Link>
        </div>
        <DataTable<MidRow>
          caption="Home-friendly jobs with some experience: UK median pay"
          description="Median and lower-quarter gross annual pay, full-time employee jobs, UK, 2025, with job titles ONS codes to each group."
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
            { key: "median", header: "Median pay", numeric: true, format: "gbp" },
            {
              key: "p25",
              header: "Lower quarter",
              numeric: true,
              render: (r) => (r.p25 === null ? <span className="text-muted">not published</span> : formatGBP(r.p25)),
            },
            { key: "titles", header: "Job titles ONS codes here" },
          ]}
          rows={midRows}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <SourceNote
                label="Job titles"
                source="ONS, SOC 2020 Volume 1: structure and descriptions of unit groups"
                href={SOC_SOURCE.pageUrl}
                note={SOC_SOURCE.attribution}
              />
            </div>
          }
          notes={`All of these groups are in the associate professional or administrative major groups, where ${office.find((o) => o.code === "3")?.some}% and ${office.find((o) => o.code === "4")?.some}% of people worked at home for part or all of the week. ONS does not publish home working rates for individual jobs, so a given employer may still want you in the office. For comparison, the UK median for all full-time jobs is ${formatGBP(UK_FT_MEDIAN)}.`}
        />
      </GuideSection>

      <GuideSection id="your-rights" title="Your right to ask for flexible working">
        <Prose>
          <p>
            In England, Scotland and Wales every employee has the legal right to ask for flexible working from their
            first day in a job, including a change to where they work (
            <a href={GOV.flexibleWorking} className="link" rel="noopener">
              GOV.UK
            </a>
            ). It is a right to ask, not a right to get it. The rules on{" "}
            <a href={GOV.flexibleWorkingApply} className="link" rel="noopener">
              applying
            </a>{" "}
            and{" "}
            <a href={GOV.flexibleWorkingAfter} className="link" rel="noopener">
              what happens next
            </a>
            :
          </p>
          <ul>
            <li>Put the request in writing, say it is a statutory request, and say how and when you want to work.</li>
            <li>You can make 2 requests in any 12-month period.</li>
            <li>
              Your employer must discuss the request with you before refusing it, and decide within 2 months unless
              you agree to a longer period.
            </li>
            <li>
              They can refuse for one of the business reasons GOV.UK lists, such as extra costs that would damage the
              business, an effect on quality or performance, or not being able to reorganise the work among other
              staff.
            </li>
          </ul>
          <p>
            Northern Ireland has its own rules. If you are job hunting, remember that an advert saying &ldquo;hybrid&rdquo;
            is the employer&apos;s current policy, which can change; ask how many office days are expected and whether
            that is in the contract.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="costs-and-rules" title="Tax, costs and safety when you work from home">
        <Prose>
          <ul>
            <li>
              <strong>No new tax relief from April 2026.</strong> GOV.UK says you cannot claim tax relief for working
              from home for the 2026 to 2027 tax year. You can still claim for the 4 previous tax years, but only if
              you had to work from home, for example because your employer has no office. If your contract simply lets
              you work from home, you cannot claim (
              <a href={GOV.wfhTaxRelief} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Your employer is still responsible for your safety.</strong> The Health and Safety Executive says
              employers have the same health and safety duties for people working at home, including hybrid workers,
              as for anyone else. Their risk assessment should cover stress, safe use of computers and your working
              environment (
              <a href={HSE_HOME_WORKERS} className="link" rel="noopener">
                HSE
              </a>
              ).
            </li>
            <li>
              <strong>You get time back.</strong> People who worked from home on a given day saved an average of{" "}
              {ONS_HYBRID_2024.commuteMinutesSaved} minutes of commuting, according to the ONS Time Use Survey for March
              2024 (
              <a href={ONS_HYBRID_2024.href} className="link" rel="noopener">
                ONS, November 2024
              </a>
              ).
            </li>
            <li>
              <strong>Watch for scams.</strong> The Disclosure and Barring Service has warned jobseekers about fake job
              adverts that ask for money or personal details. Never pay to start a job; our{" "}
              <Link href="/jobs-you-can-do-from-home-with-no-experience#scams" className="link">
                guide to spotting job scams
              </Link>{" "}
              lists the warning signs.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Find the home-friendly jobs your experience fits"
        body={
          <p>
            Paste your CV or type the job you do now. We will show the skills you already have and the jobs they lead
            to, with UK pay for each. It is free and there is no account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/jobs-you-can-do-from-home-with-no-experience", label: "Jobs you can do from home with no experience" },
          { href: "/highest-paying-remote-jobs-uk", label: "The best-paid remote-friendly jobs" },
          { href: "/freelance-careers-uk", label: "Going freelance in the UK" },
          { href: "/best-jobs-for-work-life-balance", label: "Jobs with a better work-life balance" },
          { href: "/jobs", label: "Search live vacancies" },
        ]}
      />
    </GuideShell>
  );
}
