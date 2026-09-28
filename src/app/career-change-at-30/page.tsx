import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, entryApprenticeship, occupationPayById, UK_FT_MEDIAN, type OccupationPay } from "@/components/guides/pay";

const PATH = "/career-change-at-30";
const TITLE = "Career change at 30: a UK guide with real pay data";
const DESCRIPTION =
  "How to change career at 30 in the UK: ONS pay for realistic new jobs, the free and funded ways to retrain, and what a switch could cost you in year one.";
const H1 = "How to change career at 30 in the UK";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// ONS ASHE 2025 (provisional) Table 6.7a, gross annual pay for full-time employee
// jobs by age group, UK, published 23 October 2025. Checked 28 September 2026.
const AGE_TABLE_URL =
  "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/agegroupashetable6";
const AGE_MEDIANS: { age: string; median: number }[] = [
  { age: "22 to 29", median: 32347 },
  { age: "30 to 39", median: 40668 },
  { age: "40 to 49", median: 44244 },
  { age: "50 to 59", median: 41866 },
  { age: "60 and over", median: 36467 },
];
const MEDIAN_30S = 40668;

// Destinations with a documented way in that does not need a new first degree.
// The selection is editorial; pay and apprenticeship details come from the dataset.
const DESTINATION_IDS = [
  "train-driver",
  "project-manager",
  "software-developer",
  "business-analyst",
  "cyber-security-analyst",
  "accountant",
  "electrician",
  "data-analyst",
  "paralegal",
  "hr-officer",
  "it-support-technician",
];

const SPA_CHECKER_URL = "https://www.gov.uk/state-pension-age";
const SPA_REVIEW_URL = "https://www.gov.uk/government/collections/third-state-pension-age-review";

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

/** A specific Skills England standard listed for an occupation in the dataset. */
function standard(p: OccupationPay, ref: string) {
  const s = p.apprenticeships.find((x) => x.referenceNumber === ref);
  if (!s) throw new Error(`${p.id} has no apprenticeship ${ref} in the dataset`);
  return s;
}

interface DestRow {
  id: string;
  p: OccupationPay;
  median: number | null;
  p25: number | null;
}

export default function Page() {
  const rows: DestRow[] = DESTINATION_IDS.map((id) => {
    const p = occupationPayById(id);
    return { id, p, median: p.median, p25: p.p25 };
  }).sort((a, b) => (b.median ?? -1) - (a.median ?? -1));

  const daStd = standard(occupationPayById("data-analyst"), "ST0118");
  const baStd = standard(occupationPayById("business-analyst"), "ST0117");
  const notes = rows.filter((r) => r.p.payNote);

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Career change at 30" }]} />
        }
        kicker="Career change"
        title={H1}
        intro={
          <p>
            Yes, you can change career at 30, and you have time to make it pay. GOV.UK puts State Pension age at 68 for
            anyone who is 30 now, so you have around 38 working years ahead. The hard part is money: ONS puts median
            full-time pay for people aged 30 to 39 at {formatGBP(MEDIAN_30S)}, and a trainee route such as an
            apprenticeship can start at £8 an hour.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <GuideSection id="can-you" title="Can you change your career at 30?">
        <Prose className="mt-4">
          <p>
            Nothing in law or in the main training schemes stops you. According to{" "}
            <Ext href="https://www.gov.uk/become-apprentice">GOV.UK</Ext>, apprenticeships in England are open to anyone
            aged 16 or over who is not in full-time education, and{" "}
            <Ext href="https://www.gov.uk/apply-apprenticeship">you can start one even if you already have a degree</Ext>.
            Advanced Learner Loans, Free Courses for Jobs and Skills Bootcamps are all for people aged 19 or over. The
            sources for each are in the funding section below.
          </p>
          <p>
            Time is on your side too. Using the{" "}
            <Ext href={SPA_CHECKER_URL}>GOV.UK State Pension age checker</Ext>, anyone who turns 30 in 2026 reaches State
            Pension age at 68 under the current law. The government started a{" "}
            <Ext href={SPA_REVIEW_URL}>third review of State Pension age</Ext> in July 2025, so that could change.
          </p>
          <p>
            In ONS figures, median full-time pay is higher for people in their forties than for people in their
            thirties. If a move sets you back for a year or two, the age group with the highest median pay is still in
            front of you.
          </p>
        </Prose>

        <DataTable<{ age: string; median: number }>
          className="mt-8"
          caption="Median full-time pay by age, UK, 2025"
          description="Gross annual pay for full-time employee jobs, April 2025."
          columns={[
            { key: "age", header: "Age group", rowHeader: true },
            { key: "median", header: "Median pay", numeric: true, format: "gbp" },
          ]}
          rows={AGE_MEDIANS}
          rowKey={(r) => r.age}
          source={
            <SourceNote
              source="ONS, Annual Survey of Hours and Earnings 2025 (provisional), Table 6.7a"
              href={AGE_TABLE_URL}
              published="2025-10-23"
              note="Full-time employees on adult rates who had been in the same job for more than a year."
            />
          }
        />
      </GuideSection>

      <GuideSection
        id="destinations"
        title="What could you earn? Realistic new careers at 30"
        intro={
          <p>
            There is no single best career change at 30. A good one pays at least what you earn now within a few years,
            has a way in you can afford, and is work you would still want to do at 50. These jobs all have an
            apprenticeship route listed by Skills England, so you can train without going back to university.
          </p>
        }
      >
        <DataTable<DestRow>
          className="mt-8"
          caption="Jobs with a way in that does not need a new degree"
          description={
            <>
              Median and lower-quartile pay for full-time employees. For comparison, the median for all full-time
              employees aged 30 to 39 is {formatGBP(MEDIAN_30S)} and for all ages it is {formatGBP(UK_FT_MEDIAN)}.
            </>
          }
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: (r) => r.p.title },
            { key: "median", header: "Median pay", numeric: true, render: (r) => money(r.median) },
            {
              key: "p25",
              header: "Lower quartile",
              mobileLabel: "A quarter earn less than",
              numeric: true,
              render: (r) => money(r.p25),
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
                note="Checked 28 September 2026. Typical durations as published for each standard. Apprenticeship standards cover England."
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
            Two things to keep in mind. ONS annual pay only counts people who have been in the same job for more than a
            year, so these are not starting salaries. And each figure covers a whole ONS occupation group, which can
            be wider than the job title shown. The lower quartile is a more cautious figure to plan with.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="steps" title="How to change careers at 30, step by step">
        <Prose className="mt-4">
          <ol>
            <li>
              <strong>Name the problem.</strong> Write down what you want to leave behind: the work itself, the hours,
              the pay, the employer or the sector. A new employer fixes some of these. Only a new career fixes the work
              itself.
            </li>
            <li>
              <strong>List what you already do well.</strong> Skills like running projects, handling customers or
              working with numbers carry across. Our <Link href="/transferable-skills">transferable skills guide</Link>{" "}
              helps you put them into words employers use.
            </li>
            <li>
              <strong>Check the pay honestly.</strong> Compare the lower quartile in the table above with what you earn
              now. If there is a gap, work out how many months you could cover it.
            </li>
            <li>
              <strong>Test it before you jump.</strong> Talk to two or three people who do the job, try a short course
              or volunteer. It is cheaper to find out now that you dislike the work.
            </li>
            <li>
              <strong>Pick a route you can fund.</strong> See the options below. Many let you keep earning.
            </li>
            <li>
              <strong>Rewrite your CV for the new job.</strong> Lead with the skills the new role needs.{" "}
              <Link href="/how-to-write-a-cv-for-career-change">How to write a CV for a career change</Link> covers the
              layout.
            </li>
          </ol>
          <p>
            For a longer version of these steps, read{" "}
            <Link href="/career-change/how-to-change-careers">how to change careers in the UK</Link>.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="funding" title="How to pay for retraining at 30">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Apprenticeship.</strong> You are an employee and you are paid while you train. The legal minimum is
              £8.00 an hour in your first year, then the National Living Wage of £12.71 an hour if you are 21 or over
              (rates from April 2026). Employers can pay more than the minimum.{" "}
              <Ext href="https://www.gov.uk/become-apprentice/pay-and-conditions">GOV.UK: apprentice pay</Ext>
            </li>
            <li>
              <strong>Free Courses for Jobs.</strong> A free level 3 course if you are 19 or over and earn below
              £25,750 or are unemployed.{" "}
              <Ext href="https://www.gov.uk/guidance/free-courses-for-jobs">GOV.UK, updated July 2025</Ext>
            </li>
            <li>
              <strong>Skills Bootcamps.</strong> Courses of up to 16 weeks for people aged 19 or over, with a
              guaranteed job interview at the end.{" "}
              <Ext href="https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp">
                Department for Education: Skills Bootcamps
              </Ext>
            </li>
            <li>
              <strong>Advanced Learner Loan.</strong> Covers course fees for level 3 to 6 courses at approved providers
              in England, with no credit check. On a course started since August 2023 you repay 9% of your income over
              £25,000 a year, and interest is charged from the first payment.{" "}
              <Ext href="https://www.gov.uk/advanced-learner-loan">GOV.UK: Advanced Learner Loan</Ext>;{" "}
              <Ext href="https://www.gov.uk/repaying-your-student-loan/what-you-pay">repayment plans</Ext>
            </li>
            <li>
              <strong>Lifelong Learning Entitlement.</strong> For level 4 to 6 courses and modules starting on or after 1
              January 2027, student finance moves to the Lifelong Learning Entitlement, with Tuition Fee Loans of up to
              £39,160 in total. Applications open at the end of October 2026.{" "}
              <Ext href="https://www.gov.uk/student-finance-on-or-after-1-january-2027">GOV.UK, January 2026</Ext>
            </li>
          </ul>
          <p>
            As an example of timing, Skills England gives a typical {daStd.typicalDurationMonths} months for the{" "}
            {daStd.title.toLowerCase()} apprenticeship (level {daStd.level}) and {baStd.typicalDurationMonths} months for
            the {baStd.title.toLowerCase()} apprenticeship (level {baStd.level}). If you have no savings,
            our guide to a <Link href="/career-change-with-no-money">career change with no money</Link> goes through each
            option in more detail, and{" "}
            <Link href="/apprenticeships-for-adults-uk">apprenticeships for adults</Link> covers pay and levels.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See where your experience could take you"
        body={
          <p>
            Tell us the job you do now, or paste your CV, and we will show the jobs people with your skills move into,
            with ONS pay for each. Free, and no account needed.
          </p>
        }
      />

      <FaqSection
        className="mt-14"
        items={[
          {
            question: "Is 30 too old to change career?",
            answer:
              "No. Under current law, GOV.UK's State Pension age checker gives 68 for anyone who turns 30 in 2026, so you have around 38 working years ahead. There is no upper age limit on apprenticeships in England, and Advanced Learner Loans, Free Courses for Jobs and Skills Bootcamps are open to anyone aged 19 or over.",
          },
          {
            question: "Can I change my career at 30 with no experience in the new field?",
            answer:
              "Yes, through routes that train you from the start. An apprenticeship pays you while you learn, and GOV.UK says you can start one even if you already have a degree. Most Skills Bootcamps need no previous knowledge of the subject, last up to 16 weeks and end with a guaranteed job interview.",
          },
          {
            question: "Will I take a pay cut if I change career at 30?",
            answer: `You might, at least at first. ONS puts the median for full-time employees aged 30 to 39 at ${formatGBP(MEDIAN_30S)} a year (ASHE 2025). The legal minimum for an apprentice in their first year is £8.00 an hour from April 2026. Compare the lower-quartile pay for your target job with what you earn now, and plan for the gap.`,
          },
          {
            question: "How long does a career change take at 30?",
            answer: `It depends on the route. Skills Bootcamps last up to 16 weeks. GOV.UK says apprenticeships take from 8 months to 6 years, and Skills England gives a typical ${daStd.typicalDurationMonths} months for the ${daStd.title.toLowerCase()} apprenticeship and ${baStd.typicalDurationMonths} months for the ${baStd.title.toLowerCase()} one.`,
          },
          {
            question: "Can I get funding to retrain at 30?",
            answer:
              "Often, yes. Free Courses for Jobs pays for a level 3 course if you earn below £25,750 or are unemployed. Skills Bootcamps are free when you take them yourself. An Advanced Learner Loan covers fees for level 3 to 6 courses, and from 1 January 2027 level 4 to 6 courses are funded through the Lifelong Learning Entitlement.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
          { href: "/career-change-with-no-money", label: "Career change with no money" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree, with ONS pay" },
          { href: "/career-change-at-50", label: "Career change at 50" },
        ]}
      />
    </GuideShell>
  );
}
