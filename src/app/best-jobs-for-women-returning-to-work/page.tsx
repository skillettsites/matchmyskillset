import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, entryApprenticeship, occupationPayById, type OccupationPay } from "@/components/guides/pay";
import { getAsheUnitGroup } from "@/data/careers";
import { titleInSentence } from "@/lib/text";

const PATH = "/best-jobs-for-women-returning-to-work";
const TITLE = "Best jobs for women returning to work in the UK";
const DESCRIPTION =
  "Jobs for women returning to work after a career break: ONS pay and part-time share, your right to ask for flexible working, and help with childcare costs.";
const H1 = "Best jobs for women returning to work after a career break";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Jobs with a documented way in and, in most cases, a large share of part-time
// jobs in ONS data. The selection is editorial; the figures come from the dataset.
const JOB_IDS = [
  "teaching-assistant",
  "healthcare-assistant",
  "nurse",
  "bookkeeper",
  "family-support-worker",
  "local-government-officer",
  "secondary-school-teacher",
  "office-manager",
  "marketing-executive",
  "clinical-coder",
  "hr-officer",
  "data-analyst",
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

/**
 * Share of employee jobs in the unit group that are part-time, from the ONS job
 * counts for all employee jobs and for full-time jobs. ONS says the counts are
 * indicative only, so the share is rounded to the nearest 5%.
 */
function partTimeShare(soc: string): number | null {
  const g = getAsheUnitGroup(soc);
  const all = g?.all.jobsThousands ?? null;
  const ft = g?.ft.jobsThousands ?? null;
  if (all === null || ft === null || all <= 0) return null;
  return Math.round(((all - ft) / all) * 20) * 5;
}

interface JobRow {
  id: string;
  p: OccupationPay;
  median: number | null;
  partTime: number | null;
}

interface SchemeRow {
  scheme: string;
  who: ReactNode;
  what: ReactNode;
  source: ReactNode;
}

export default function Page() {
  const rows: JobRow[] = JOB_IDS.map((id) => {
    const p = occupationPayById(id);
    return { id, p, median: p.median, partTime: partTimeShare(p.soc) };
  }).sort((a, b) => (b.partTime ?? -1) - (a.partTime ?? -1));
  const notes = rows.filter((r) => r.p.payNote);
  const top = rows.filter((r) => r.partTime !== null).slice(0, 2);
  if (top.length < 2) throw new Error("Expected part-time figures for at least two jobs");

  const schemes: SchemeRow[] = [
    {
      scheme: "Free Childcare for Working Parents",
      who: (
        <>
          Children aged 9 months to 4 years, in England. You (and any partner) must be working or about to start a job
          and each expect to earn at least the minimum wage for 16 hours a week: £2,643.68 over 3 months if you are 21 or
          over.
        </>
      ),
      what: <>30 hours of free childcare a week for 38 weeks of the year, at a registered provider.</>,
      source: <Ext href="https://www.gov.uk/free-childcare-if-working">GOV.UK: free childcare if you work</Ext>,
    },
    {
      scheme: "Tax-Free Childcare",
      who: (
        <>
          Children aged 11 or under (16 or under if disabled). You usually need to be working or returning to work, with
          the same minimum earnings.
        </>
      ),
      what: (
        <>
          The government adds £2 for every £8 you pay into a childcare account, up to £2,000 a year per child (£4,000
          if your child is disabled).
        </>
      ),
      source: <Ext href="https://www.gov.uk/tax-free-childcare">GOV.UK: Tax-Free Childcare</Ext>,
    },
    {
      scheme: "Universal Credit childcare",
      who: <>People on Universal Credit who pay for childcare so they can work. Couples usually both need to work.</>,
      what: (
        <>
          Up to 85% of childcare costs, capped at £1,071.09 per assessment period for one child or £1,836.16 for
          two or more (from April 2026). Help with upfront costs may be available when you start work.
        </>
      ),
      source: (
        <Ext href="https://www.gov.uk/guidance/universal-credit-childcare-costs">GOV.UK: Universal Credit childcare</Ext>
      ),
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Returning to work" }]} />
        }
        kicker="Returning to work"
        title={H1}
        intro={
          <p>
            The best job after a career break fits the hours you can work and pays enough to cover childcare. You can
            ask for flexible working from your first day in a new job, and working parents in England may be able to get
            30 hours a week of free childcare for children aged 9 months to 4 years. Below: ONS pay and how common part-time work is
            in jobs with a clear way back in.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <GuideSection
        id="jobs"
        title="Jobs to consider, with pay and part-time share"
        intro={
          <p>
            These jobs all have a documented route in. The part-time column shows roughly what share of employee jobs in
            the ONS occupation group are part-time, which tells you how normal it is to work reduced hours there.
          </p>
        }
      >
        <DataTable<JobRow>
          className="mt-8"
          caption="Jobs for returners, sorted by share of part-time jobs"
          description="Median pay is for full-time employees. Part-time pay is lower in proportion to the hours worked."
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: (r) => r.p.title },
            { key: "median", header: "Median pay (full-time)", mobileLabel: "Median pay", numeric: true, render: (r) => money(r.median) },
            {
              key: "partTime",
              header: "Jobs that are part-time",
              mobileLabel: "Part-time jobs",
              numeric: true,
              render: (r) => (r.partTime === null ? <span className="text-muted">Not published</span> : `about ${r.partTime}%`),
            },
            { key: "route", header: "One way in", render: (r) => <WayIn p={r.p} /> },
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
            <div className="space-y-1 text-xs text-muted">
              <p>
                Part-time share is worked out from the ONS job counts for all employee jobs and full-time jobs in each
                occupation group (ASHE 2025, Table 14.7a), rounded to the nearest 5%. ONS says its job counts are
                indicative only.
              </p>
              {notes.map((r) => (
                <p key={r.id}>
                  {r.p.title}: {r.p.payNote}
                </p>
              ))}
            </div>
          }
        />
        <Prose className="mt-6">
          <p>
            The two jobs here with the most part-time work, {titleInSentence(top[0].p.title)} and{" "}
            {titleInSentence(top[1].p.title)}, have full-time medians of {money(top[0].median)} and {money(top[1].median)}.
            If you need a higher income, look further down the table, where part-time roles are less common but you can
            still ask for flexible working once you are in.
          </p>
          <p>
            Every route in the table is an apprenticeship, so you are paid while you train. For more ideas, see{" "}
            <Link href="/jobs-without-a-degree">jobs without a degree</Link> and{" "}
            <Link href="/best-jobs-for-work-life-balance">jobs with a good work-life balance</Link>.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="flexible-working" title="Your right to ask for flexible working">
        <Prose className="mt-4">
          <p>
            In England, Scotland and Wales every employee can make a statutory request for flexible working from their
            first day in a job. You can ask to change your hours, your start and finish times, the days you work, or
            where you work. Northern Ireland has its own rules.
          </p>
          <ul>
            <li>Put the request in writing, with the date, a statement that it is a statutory request, and what you want to change and from when.</li>
            <li>Your employer must discuss it with you before refusing, and decide within 2 months unless you agree to longer.</li>
            <li>They can refuse only for set business reasons, such as extra costs or not being able to reorganise the work.</li>
            <li>You can make 2 requests in any 12-month period.</li>
          </ul>
          <p>
            Sources: <Ext href="https://www.gov.uk/flexible-working">GOV.UK: flexible working</Ext>. Acas has a{" "}
            <Ext href="https://www.acas.org.uk/flexible-working-request-letter-template">request letter template</Ext>.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="childcare"
        title="Help with childcare costs"
        intro={
          <p>
            Childcare costs can decide whether going back to work pays. These are the three main schemes in England. You
            cannot get Tax-Free Childcare and Universal Credit childcare at the same time. Scotland, Wales and Northern
            Ireland run different free childcare schemes.
          </p>
        }
      >
        <DataTable<SchemeRow>
          className="mt-8"
          caption="Childcare support for parents going back to work"
          columns={[
            { key: "scheme", header: "Scheme", rowHeader: true },
            { key: "who", header: "Who can get it", render: (r) => r.who },
            { key: "what", header: "What you get", render: (r) => r.what },
            { key: "source", header: "Source", render: (r) => r.source },
          ]}
          rows={schemes}
          rowKey={(r) => r.scheme}
          source={<SourceNote source="GOV.UK pages linked in each row" note="Checked 28 September 2026." />}
        />
        <Prose className="mt-6">
          <p>
            If you are returning to work, the date you start decides when you can apply for Tax-Free Childcare, so check
            the <Ext href="https://www.gov.uk/tax-free-childcare/apply-for-tax-free-childcare">application dates</Ext>{" "}
            early. GOV.UK has a <Ext href="https://www.gov.uk/childcare-calculator">childcare calculator</Ext> that shows
            which schemes you could get.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="return-routes" title="Routes back into a profession you left">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Teaching.</strong> The Department for Education&apos;s{" "}
              <Ext href="https://teaching-vacancies.service.gov.uk/jobseeker-guides/return-to-teaching-in-england/return-to-teaching/">
                returning to teaching guide
              </Ext>{" "}
              (updated September 2026) covers support for people who taught or trained to teach in the UK, with a
              step-by-step guide to coming back.
            </li>
            <li>
              <strong>Nursing and midwifery.</strong> If your registration has lapsed, the Nursing and Midwifery Council
              explains how to apply for readmission, either through a return to practice course or a Test of Competence.{" "}
              <Ext href="https://www.nmc.org.uk/registration/returning-to-the-register/">NMC: returning to the register</Ext>
            </li>
            <li>
              <strong>Returnships.</strong> Some employers run paid returner programmes for people who have been out of
              work for a while. National Highways, for example, runs a six-month{" "}
              <Ext href="https://nationalhighways.co.uk/work-with-us/careers/career-programmes/returning-to-work/">
                returnship
              </Ext>{" "}
              for people with a career break of two or more years; its 2026 intake had closed when we checked in
              September 2026. Programmes like this open and close through the year, so check employers&apos; careers
              pages for dates.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="retraining" title="Retraining while you look">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Free Courses for Jobs.</strong> A free level 3 course if you are 19 or over and earn below £25,750
              or are unemployed. Subjects include childcare and early years, health and social care, accounting and
              finance, and digital.{" "}
              <Ext href="https://www.gov.uk/guidance/free-courses-for-jobs">GOV.UK: Free Courses for Jobs</Ext>
            </li>
            <li>
              <strong>Skills Bootcamps.</strong> Courses of up to 16 weeks for people aged 19 or over, designed to fit
              around family and other commitments, with a guaranteed job interview at the end. Areas include early years,
              health and social care, and business and administration.{" "}
              <Ext href="https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp">
                Department for Education: Skills Bootcamps
              </Ext>
            </li>
            <li>
              <strong>Learner Support.</strong> If you are on a further education course at level 3 or below and facing
              financial hardship, your college may help with travel, equipment or childcare (you must be 20 or over for
              childcare). <Ext href="https://www.gov.uk/learner-support">GOV.UK: Learner Support</Ext>
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="cv" title="How to explain a career break">
        <Prose className="mt-4">
          <p>
            Keep it short and factual. One line on your CV, such as &quot;Career break to care for my children, 2021 to
            2026&quot;, is enough. Then spend the space on what you can do now: recent courses, volunteering, school or
            community roles, and the skills from your last job that still apply. In an interview, say why you are
            coming back and what you want next, rather than apologising for the gap.
          </p>
          <p>
            Our guide to <Link href="/how-to-write-a-cv-for-career-change">writing a CV for a career change</Link> has a
            layout that works well when your most recent job was a few years ago.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See where your experience could take you"
        body={
          <p>
            Tell us the job you did before your break, or paste your CV, and we will show the jobs people with your
            skills move into, with ONS pay for each. Free, and no account needed.
          </p>
        }
      />

      <FaqSection
        className="mt-14"
        items={[
          {
            question: "Can I ask for part-time hours in a new job?",
            answer:
              "Yes. In England, Scotland and Wales every employee can make a statutory request for flexible working, including part-time hours, from their first day. Your employer must deal with it reasonably and decide within 2 months, but can refuse for a business reason. You can make 2 requests in any 12 months.",
          },
          {
            question: "What help is there with childcare when I go back to work?",
            answer:
              "In England, working parents of children aged 9 months to 4 years may be able to get 30 hours of free childcare a week for 38 weeks a year. Tax-Free Childcare adds £2 for every £8 you pay, up to £2,000 a year per child aged 11 or under. On Universal Credit you can get up to 85% of childcare costs back. You cannot get Tax-Free Childcare and Universal Credit childcare at the same time.",
          },
          {
            question: "Which jobs have the most part-time work?",
            answer: `Of the jobs on this page, ${titleInSentence(top[0].p.title)} and ${titleInSentence(top[1].p.title)} have the highest share of part-time jobs in ONS data (ASHE 2025), at about ${top[0].partTime}% and ${top[1].partTime}%. Their full-time medians are ${top[0].median === null ? "not published" : formatGBP(top[0].median)} and ${top[1].median === null ? "not published" : formatGBP(top[1].median)}, so compare pay before you decide.`,
          },
          {
            question: "Are there free courses for people returning to work?",
            answer:
              "Yes. Free Courses for Jobs pays for a level 3 qualification if you are 19 or over and earn below £25,750 or are unemployed. Skills Bootcamps last up to 16 weeks, are open to anyone aged 19 or over, and end with a guaranteed job interview.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/best-jobs-for-work-life-balance", label: "Best jobs for work-life balance" },
          { href: "/work-from-home-jobs", label: "Work from home jobs" },
          { href: "/jobs-you-can-do-from-home-with-no-experience", label: "Jobs you can do from home with no experience" },
          { href: "/career-change-with-no-money", label: "Career change with no money" },
          { href: "/how-to-write-a-cv-for-career-change", label: "How to write a CV for a career change" },
        ]}
      />
    </GuideShell>
  );
}
