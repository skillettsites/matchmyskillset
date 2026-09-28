import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, entryApprenticeship, occupationPayById, UK_FT_MEDIAN, type OccupationPay } from "@/components/guides/pay";

const PATH = "/career-change-with-no-money";
const TITLE = "Career change with no money: free and funded UK routes";
const DESCRIPTION =
  "How to change career without savings: free courses, Skills Bootcamps, paid apprenticeships, learner loans, and how to plan for a pay dip using ONS data.";
const H1 = "How to change career with no money";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const FCFJ_URL = "https://www.gov.uk/guidance/free-courses-for-jobs";
const BOOTCAMP_URL = "https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp";
const BOOTCAMP_FUNDING_URL =
  "https://www.gov.uk/government/publications/esfa-skills-bootcamps/dfe-skills-bootcamps-technical-funding-guide-from-august-2025";
const BOOTCAMP_FPM_URL = "https://www.gov.uk/government/publications/skills-bootcamps-funding-and-performance-management";
const ALL_URL = "https://www.gov.uk/advanced-learner-loan";
const REPAY_URL = "https://www.gov.uk/repaying-your-student-loan/what-you-pay";
const LLE_URL = "https://www.gov.uk/student-finance-on-or-after-1-january-2027";
const FUNDING_RULES_URL =
  "https://www.gov.uk/government/publications/apprenticeship-funding-rules-and-assessment-plan-guidance-2026-to-2027";
const NCS_CHANGE_URL = "https://nationalcareers.service.gov.uk/service-is-changing";

// Jobs with a way in you can fund without savings (an apprenticeship, and in
// several cases a free course area too). Editorial selection; figures from the dataset.
const DESTINATION_IDS = [
  "hgv-driver",
  "data-analyst",
  "paralegal",
  "hr-officer",
  "it-support-technician",
  "bookkeeper",
  "marketing-executive",
  "healthcare-assistant",
];

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link" rel="noopener">
      {children}
    </a>
  );
}

function money(value: number | null) {
  return value === null ? <span className="text-muted">Not published</span> : formatGBP(value);
}

function WayIn({ p }: { p: OccupationPay }) {
  const s = entryApprenticeship(p);
  if (!s) return <span className="text-muted">No apprenticeship listed</span>;
  return (
    <>
      <Ext href={s.url}>{s.title}</Ext> apprenticeship, level {s.level}, typically {s.typicalDurationMonths} months
    </>
  );
}

interface RouteRow {
  route: string;
  who: ReactNode;
  cost: ReactNode;
  source: ReactNode;
}

interface DestRow {
  id: string;
  p: OccupationPay;
  median: number | null;
  p25: number | null;
}

export default function Page() {
  const routes: RouteRow[] = [
    {
      route: "Apprenticeship",
      who: <>Aged 16 or over, living in England and not in full-time education. No upper age limit.</>,
      cost: (
        <>
          Nothing for the training, and you are paid: at least £8.00 an hour in the first year, then the minimum wage for
          your age (£12.71 an hour at 21 and over, from April 2026).
        </>
      ),
      source: (
        <>
          <Ext href="https://www.gov.uk/become-apprentice/pay-and-conditions">GOV.UK: apprentice pay</Ext>;{" "}
          <Ext href={FUNDING_RULES_URL}>funding rules 2026 to 2027</Ext>
        </>
      ),
    },
    {
      route: "Free Courses for Jobs",
      who: (
        <>
          Aged 19 or over and earning below £25,750, or unemployed. Some areas set slightly different rules.
        </>
      ),
      cost: (
        <>
          Free. Covers a level 3 qualification in subjects such as accounting, digital, health and social care or
          engineering, or a level 2 in construction, engineering or manufacturing.
        </>
      ),
      source: <Ext href={FCFJ_URL}>GOV.UK, updated July 2025</Ext>,
    },
    {
      route: "Skills Bootcamp",
      who: <>Aged 19 or over. Most need no previous knowledge of the subject.</>,
      cost: (
        <>
          Free to you. Up to 16 weeks, with a guaranteed job interview at the end. If your employer puts you on one to
          upskill you, the employer pays 10% (fewer than 250 staff) or 30% (250 or more).
        </>
      ),
      source: (
        <>
          <Ext href={BOOTCAMP_URL}>Department for Education</Ext>;{" "}
          <Ext href={BOOTCAMP_FUNDING_URL}>funding guide from August 2025</Ext>
        </>
      ),
    },
    {
      route: "Advanced Learner Loan",
      who: <>Aged 19 or over, for a level 3 to 6 course at an approved college or provider in England.</>,
      cost: (
        <>
          A loan for course fees only, with no credit check. You repay 9% of your income over £25,000 a year, and
          interest is charged from the first payment.
        </>
      ),
      source: (
        <>
          <Ext href={ALL_URL}>GOV.UK: Advanced Learner Loan</Ext>; <Ext href={REPAY_URL}>repayment plans</Ext>
        </>
      ),
    },
    {
      route: "Learner Support",
      who: <>Aged 19 or over, on a further education course at level 3 or below, and in financial hardship.</>,
      cost: (
        <>
          Money from your college for travel, equipment, a laptop or childcare (20 or over for childcare). It may be a
          grant or a loan.
        </>
      ),
      source: <Ext href="https://www.gov.uk/learner-support">GOV.UK: Learner Support</Ext>,
    },
  ];

  const rows: DestRow[] = DESTINATION_IDS.map((id) => {
    const p = occupationPayById(id);
    return { id, p, median: p.median, p25: p.p25 };
  }).sort((a, b) => (b.p25 ?? -1) - (a.p25 ?? -1));
  const notes = rows.filter((r) => r.p.payNote);

  // Worked example: someone on the UK full-time median moving to IT support.
  const it = occupationPayById("it-support-technician");
  const itLow = it.p25;
  const gap = itLow === null ? null : UK_FT_MEDIAN - itLow;
  const apprenticeYear = Math.round(8 * 37.5 * 52);

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Career change with no money" }]} />
        }
        kicker="Career change"
        title={H1}
        intro={
          <p>
            You can change career without savings if you choose a route that pays you or costs nothing up front. In
            England that means an apprenticeship (paid, at least £8.00 an hour in the first year), a free course such as
            Free Courses for Jobs or a Skills Bootcamp, or a loan you only repay once you earn over £25,000. Then plan
            for any drop in pay, using real figures rather than hope.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <GuideSection
        id="routes"
        title="Free and funded ways to retrain"
        intro={
          <p>
            These are the main routes in England that do not need savings. Scotland, Wales and Northern Ireland have
            their own schemes.
          </p>
        }
      >
        <DataTable<RouteRow>
          className="mt-8"
          caption="Ways to retrain without paying up front"
          columns={[
            { key: "route", header: "Route", rowHeader: true },
            { key: "who", header: "Who can use it", render: (r) => r.who },
            { key: "cost", header: "What it costs you", render: (r) => r.cost },
            { key: "source", header: "Source", render: (r) => r.source },
          ]}
          rows={routes}
          rowKey={(r) => r.route}
          source={<SourceNote source="GOV.UK and Department for Education pages linked in each row" note="Checked 28 September 2026." />}
        />
        <Prose className="mt-6">
          <p>
            <strong>On Universal Credit?</strong> GOV.UK says you can apply for a Free Courses for Jobs course if it will
            improve your chances of getting work, and that many claimants can take full-time training for up to 16 weeks
            and keep claiming. Ask your work coach before you enrol.
          </p>
          <p>
            <strong>Degree-level study.</strong> From 1 January 2027, student finance for certain level 4 to 6 courses
            and modules, including most undergraduate courses, moves to the{" "}
            <Ext href={LLE_URL}>Lifelong Learning Entitlement</Ext>, with Tuition Fee Loans of up
            to £39,160 in total, repaid once you earn over £25,000 a year. Applications open at the end of October 2026.
          </p>
          <p>
            Skills Bootcamps are described as free in the Department for Education&apos;s{" "}
            <Ext href={BOOTCAMP_FPM_URL}>funding and performance management guidance</Ext>. Find one, or a free course,
            with the <Ext href="https://nationalcareers.service.gov.uk/find-a-course">course finder</Ext>. For more on
            paid training, see <Link href="/apprenticeships-for-adults-uk">apprenticeships for adults</Link>.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="careers-advice" title="Free careers advice changes on 1 October 2026">
        <Prose className="mt-4">
          <p>
            The National Careers Service website is being renamed &quot;Get careers information and advice&quot; from 1
            October 2026. The address stays the same, and the job profiles, skills assessment and course finder stay
            online. What changes is personal advice: you will no longer be able to chat online, email or ask for a call
            through the site. Adults in England will instead get careers advice from the Department for Work and Pensions
            Careers Service, and the government&apos;s new{" "}
            <Ext href="https://www.jobs.service.gov.uk/">Jobs and Careers Service</Ext> has a CV builder and job search.
          </p>
          <p>
            Source: <Ext href={NCS_CHANGE_URL}>National Careers Service, &quot;The National Careers Service is changing&quot;</Ext>
            , checked 28 September 2026.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="pay-dip"
        title="Plan for the pay dip"
        intro={
          <p>
            ONS annual pay only covers people who have been in the same job for more than a year, so a median is not a
            starting salary. The lower quartile, the level a quarter of full-time employees earn less than, is a more
            careful figure to plan with.
          </p>
        }
      >
        <DataTable<DestRow>
          className="mt-8"
          caption="Jobs you can train for without savings, with UK pay"
          description={<>Full-time employees. The UK median for all full-time employees is {formatGBP(UK_FT_MEDIAN)}.</>}
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: (r) => r.p.title },
            {
              key: "p25",
              header: "Lower quartile",
              mobileLabel: "A quarter earn less than",
              numeric: true,
              render: (r) => money(r.p25),
            },
            { key: "median", header: "Median pay", numeric: true, render: (r) => money(r.median) },
            { key: "route", header: "Paid way in", render: (r) => <WayIn p={r.p} /> },
          ]}
          rows={rows}
          rowKey={(r) => r.id}
          source={
            <>
              <AsheSourceNote />
              <SourceNote
                className="mt-1"
                source="Skills England, apprenticeship standards"
                href="https://skillsengland.education.gov.uk/apprenticeships/"
                note="Checked 28 September 2026. Apprenticeship standards cover England."
              />
            </>
          }
          notes={
            notes.length > 0 ? (
              <ul className="space-y-1 text-xs text-muted">
                {notes.map((r) => (
                  <li key={r.id}>
                    {r.p.title}: {r.p.payNote}
                  </li>
                ))}
              </ul>
            ) : undefined
          }
        />
        <Prose className="mt-6">
          <p>
            A worked example. If you earn the UK full-time median of {formatGBP(UK_FT_MEDIAN)} and move into IT support,
            planning on the lower quartile of {money(itLow)} means{" "}
            {gap === null ? (
              "working out the gap from a real job offer"
            ) : (
              <>
                a gap of about {formatGBP(gap)} a year before tax, or {formatGBP(Math.round(gap / 12))} a month
              </>
            )}
            . Going in through an apprenticeship on the £8.00 minimum would pay {formatGBP(apprenticeYear)} a year at 37.5
            hours a week in the first year, so ask employers what they really pay.
          </p>
          <ol>
            <li>Work out your monthly gap from the figures above, or better, from real job adverts.</li>
            <li>Count how many months you could cover it, from savings, a partner&apos;s income or overtime before you move.</li>
            <li>
              Check whether you would get any benefits on the lower income with a{" "}
              <Ext href="https://www.gov.uk/benefits-calculators">GOV.UK benefits calculator</Ext>.
            </li>
            <li>If the gap is too big, look at the ways to switch without a gap below.</li>
          </ol>
        </Prose>
      </GuideSection>

      <GuideSection id="without-losing-money" title="How to change careers without losing money">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Train while you keep your job.</strong> Part-time and online courses let you keep your income. Every
              employee has the right to ask for flexible working, such as compressed hours, to make time to study.{" "}
              <Ext href="https://www.gov.uk/flexible-working">GOV.UK: flexible working</Ext>
            </li>
            <li>
              <strong>Move inside your employer.</strong> A move to another team keeps your income while you change the
              work you do. Existing staff can also become apprentices, as long as the role needs significant new skills.{" "}
              <Ext href={FUNDING_RULES_URL}>Funding rules 2026 to 2027</Ext>
            </li>
            <li>
              <strong>Take a bridge role.</strong> Move to a job that uses your current skills in the sector you want,
              then move again from the inside. Our <Link href="/transferable-skills">transferable skills guide</Link>{" "}
              helps you spot them.
            </li>
            <li>
              <strong>If you are being made redundant,</strong>{" "}with 2 years&apos; service you can take reasonable time
              off during your notice to look for work or arrange training, and statutory redundancy pay under £30,000 is
              not taxed. <Ext href="https://www.gov.uk/redundancy-your-rights">GOV.UK: redundancy rights</Ext>
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Find careers your current skills already fit"
        body={
          <p>
            Tell us the job you do now, or paste your CV, and we will show the jobs people with your skills move into,
            with ONS pay and the free or paid training that leads to each. Free, and no account needed.
          </p>
        }
      />

      <FaqSection
        className="mt-14"
        items={[
          {
            question: "How do I change careers without losing money?",
            answer:
              "Keep earning while you train. You can take a part-time course and ask your employer for flexible working, move to another team inside your employer, or start an apprenticeship, which pays a wage while you train. Before you move, compare the lower-quartile pay for the new job with what you earn now and work out how many months you could cover the difference.",
          },
          {
            question: "Can I retrain for free in the UK?",
            answer:
              "In England, often yes. Free Courses for Jobs pays for a level 3 qualification if you are 19 or over and earn below £25,750 or are unemployed. Skills Bootcamps are free to learners, last up to 16 weeks and end with a guaranteed job interview. Apprenticeship training is free to the apprentice and you are paid a wage.",
          },
          {
            question: "Can I retrain while claiming Universal Credit?",
            answer:
              "Often, yes. GOV.UK says Universal Credit claimants can apply for a free course if it will improve their chances of getting work, and that many can take full-time training for up to 16 weeks and continue to claim. Talk to your work coach first.",
          },
          {
            question: "What is happening to the National Careers Service?",
            answer:
              "From 1 October 2026 the website is renamed Get careers information and advice. It keeps its address, job profiles and course finder, but you can no longer chat, email or ask for a call through it. Adults in England get careers advice from the Department for Work and Pensions Careers Service instead.",
          },
          {
            question: "Do I have to pay back an Advanced Learner Loan?",
            answer:
              "Yes, but only when your income is over the threshold. For courses started since August 2023 you repay 9% of your income over £25,000 a year, and interest is charged from the first payment. If you take the loan for an Access to Higher Education course, Student Finance England writes off the balance once you complete an eligible higher education course.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree, with ONS pay" },
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "/career-change-at-50", label: "Career change at 50" },
          { href: "/jobs-for-people-who-hate-their-job", label: "Jobs for people who hate their job" },
        ]}
      />
    </GuideShell>
  );
}
