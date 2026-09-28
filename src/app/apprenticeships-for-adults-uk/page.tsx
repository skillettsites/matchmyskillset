import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, occupationPayById, UK_FT_MEDIAN, type OccupationPay } from "@/components/guides/pay";
import type { ApprenticeshipStandard } from "@/data/careers";

const PATH = "/apprenticeships-for-adults-uk";
const TITLE = "Apprenticeships for adults in the UK: pay, age and levels";
const DESCRIPTION =
  "Adult apprenticeships in England: no upper age limit, £8 an hour minimum in year one, real standards with levels and length, and what employers pay.";
const H1 = "Apprenticeships for adults: age, pay and how to start";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const NMW_URL = "https://www.gov.uk/national-minimum-wage-rates";
const BECOME_URL = "https://www.gov.uk/become-apprentice";
const FUNDING_RULES_URL =
  "https://www.gov.uk/government/publications/apprenticeship-funding-rules-and-assessment-plan-guidance-2026-to-2027";
const EMPLOYER_FUNDING_URL = "https://www.gov.uk/employing-an-apprentice/get-funding";
const FIND_URL = "https://www.gov.uk/apply-apprenticeship";
const SKILLS_ENGLAND_URL = "https://skillsengland.education.gov.uk/apprenticeships/";

// GOV.UK National Minimum Wage rates from 1 April 2026 (checked 28 September 2026).
const APPRENTICE_RATE = 8.0;
const NLW_21_PLUS = 12.71;
const NMW_18_TO_20 = 10.85;

// Apprenticeships that adults use to move into a new job. Each pair is an
// occupation in the dataset and a Skills England standard linked to it there.
const EXAMPLES: { id: string; ref: string }[] = [
  { id: "hgv-driver", ref: "ST0257" },
  { id: "train-driver", ref: "ST0645" },
  { id: "hr-officer", ref: "ST0239" },
  { id: "paralegal", ref: "ST0245" },
  { id: "plumber", ref: "ST0303" },
  { id: "electrician", ref: "ST0152" },
  { id: "project-manager", ref: "ST0310" },
  { id: "business-analyst", ref: "ST0117" },
  { id: "accountant", ref: "ST0003" },
  { id: "data-analyst", ref: "ST0118" },
  { id: "software-developer", ref: "ST0116" },
  { id: "cyber-security-analyst", ref: "ST1021" },
  { id: "nursing-associate", ref: "ST0827" },
  { id: "secondary-school-teacher", ref: "ST0490" },
  { id: "social-worker", ref: "ST0510" },
  { id: "police-officer", ref: "ST0304" },
  { id: "solicitor", ref: "ST0246" },
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

interface ExampleRow {
  key: string;
  s: ApprenticeshipStandard;
  p: OccupationPay;
  median: number | null;
}

interface PayRow {
  when: string;
  hourly: number;
  at30: number;
  at375: number;
}

interface LevelRow {
  name: string;
  level: string;
  equivalent: string;
}

export default function Page() {
  const examples: ExampleRow[] = EXAMPLES.map(({ id, ref }) => {
    const p = occupationPayById(id);
    const s = p.apprenticeships.find((x) => x.referenceNumber === ref);
    if (!s) throw new Error(`${id} has no apprenticeship ${ref} in the dataset`);
    return { key: `${id}-${ref}`, s, p, median: p.median };
  }).sort((a, b) => a.s.level - b.s.level || a.s.typicalDurationMonths - b.s.typicalDurationMonths);
  const notes = examples.filter((r) => r.p.payNote);

  const yearly = (hourly: number, hours: number) => Math.round(hourly * hours * 52);
  const payRows: PayRow[] = [
    { when: "First year of the apprenticeship, any age", hourly: APPRENTICE_RATE },
    { when: "After the first year, aged 21 or over", hourly: NLW_21_PLUS },
    { when: "After the first year, aged 19 or 20", hourly: NMW_18_TO_20 },
  ].map((r) => ({ ...r, at30: yearly(r.hourly, 30), at375: yearly(r.hourly, 37.5) }));

  const levels: LevelRow[] = [
    { name: "Foundation and intermediate", level: "2", equivalent: "GCSE" },
    { name: "Advanced", level: "3", equivalent: "A level" },
    { name: "Higher", level: "4, 5, 6 and 7", equivalent: "Foundation degree and above" },
    { name: "Degree", level: "6 and 7", equivalent: "Bachelor's or master's degree" },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[{ name: "Career change", href: "/career-change" }, { name: "Apprenticeships for adults" }]}
          />
        }
        kicker="Retraining"
        title={H1}
        intro={
          <p>
            There is no upper age limit. GOV.UK says you can start an apprenticeship if you are 16 or over, live in
            England and are not in full-time education, and you can do one even if you already have a degree. The catch
            is pay: the legal minimum for an apprentice in the first year is £8.00 an hour at any age (from April 2026),
            then the minimum wage for your age, which is £12.71 an hour at 21 and over.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <GuideSection id="who" title="Who can do an apprenticeship as an adult">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Age.</strong> You must be 16 or over. There is no maximum.{" "}
              <Ext href={BECOME_URL}>GOV.UK: become an apprentice</Ext>
            </li>
            <li>
              <strong>Existing qualifications.</strong> You can have a previous qualification, like a degree, and still
              start one. <Ext href={FIND_URL}>GOV.UK: find an apprenticeship</Ext>
            </li>
            <li>
              <strong>Your current job.</strong> Existing staff can become apprentices in their own role, but the
              training provider has to show that you need significant new knowledge and skills to be fully competent in
              it. <Ext href={FUNDING_RULES_URL}>Apprenticeship funding rules 2026 to 2027</Ext>
            </li>
            <li>
              <strong>Experience you already have.</strong> Relevant qualifications, work experience or training can
              shorten the apprenticeship. You agree this with the employer and training provider at the start.
            </li>
            <li>
              <strong>English and maths.</strong> If you are 19 or over, studying English and maths is agreed with your
              employer rather than required, and you do not have to pass them to complete the apprenticeship.{" "}
              <Ext href={FUNDING_RULES_URL}>Funding rules 2026 to 2027, rules 50 and 55</Ext>
            </li>
          </ul>
          <p>
            This guide covers England. Scotland, Wales and Northern Ireland run their own schemes:{" "}
            <Ext href="https://www.apprenticeships.scot/">Apprenticeships.scot</Ext>,{" "}
            <Ext href="https://careerswales.gov.wales/apprenticeship-search">Careers Wales</Ext> and{" "}
            <Ext href="https://www.nidirect.gov.uk/campaigns/apprenticeships">nidirect</Ext>.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="pay"
        title="What adult apprentices are paid"
        intro={
          <p>
            You are an employee, so you get a wage, holiday pay (at least 20 days a year plus bank holidays) and normal
            employee rights. You must be paid for your working hours and your training time, which is at least 20% of
            your normal hours. Employers can pay more than the minimum, but plan around the legal floor.
          </p>
        }
      >
        <DataTable<PayRow>
          className="mt-8"
          caption="Minimum pay for an apprentice aged 19 or over, from April 2026"
          description="Yearly figures are the hourly rate times the weekly hours times 52 weeks, before tax."
          columns={[
            { key: "when", header: "When", rowHeader: true },
            { key: "hourly", header: "Minimum an hour", numeric: true, render: (r) => formatGBP(r.hourly, "hour") },
            { key: "at30", header: "A year at 30 hours a week", mobileLabel: "30 hours a week", numeric: true, format: "gbp" },
            { key: "at375", header: "A year at 37.5 hours a week", mobileLabel: "37.5 hours a week", numeric: true, format: "gbp" },
          ]}
          rows={payRows}
          rowKey={(r) => r.when}
          source={
            <SourceNote
              source="GOV.UK, National Minimum Wage and National Living Wage rates"
              href={NMW_URL}
              note="Rates from 1 April 2026. The apprentice rate applies to apprentices under 19, or 19 and over in the first year of the apprenticeship."
            />
          }
        />
        <Prose className="mt-6">
          <p>
            For comparison, the median for all full-time employees in the UK is {formatGBP(UK_FT_MEDIAN)} a year (ONS,
            ASHE 2025). If you earn around that now, a first year on the apprentice minimum would more than halve your
            pay, so it is worth asking employers what they actually pay before you apply. Our guide to a{" "}
            <Link href="/career-change-with-no-money">career change with no money</Link> covers ways to bridge the gap.
          </p>
          <p>
            Sources: <Ext href="https://www.gov.uk/become-apprentice/pay-and-conditions">GOV.UK: apprentice pay and conditions</Ext>;{" "}
            <Ext href="https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025">
              ONS, Employee earnings in the UK: 2025
            </Ext>
            .
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="levels" title="Apprenticeship levels">
        <DataTable<LevelRow>
          className="mt-6"
          caption="Apprenticeship levels and what they are equivalent to"
          columns={[
            { key: "name", header: "Name", rowHeader: true },
            { key: "level", header: "Level" },
            { key: "equivalent", header: "Equivalent education level" },
          ]}
          rows={levels}
          rowKey={(r) => r.name}
          source={
            <SourceNote
              source="GOV.UK, Become an apprentice: how apprenticeships work"
              href="https://www.gov.uk/become-apprentice/how-apprenticeships-work"
              note="Checked 28 September 2026."
            />
          }
        />
        <Prose className="mt-6">
          <p>
            GOV.UK says apprenticeships take from 8 months to 6 years, depending on the type and level. The 2026 to 2027
            funding rules set the minimum at 8 months, based on working at least 30 hours a week. You can do one
            part-time: the training provider must then set a length that is realistic for your hours.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="examples"
        title="Real apprenticeships adults use to change career"
        intro={
          <p>
            These are Skills England standards approved for delivery, each linked to the job it leads to. Length is the typical duration
            Skills England publishes; yours may be shorter if you have relevant experience. Pay is the ONS median for the
            job once qualified, not what you earn as an apprentice.
          </p>
        }
      >
        <DataTable<ExampleRow>
          className="mt-8"
          caption="Apprenticeship standards and the jobs they lead to"
          columns={[
            {
              key: "standard",
              header: "Apprenticeship",
              rowHeader: true,
              render: (r) => <Ext href={r.s.url}>{r.s.title}</Ext>,
            },
            { key: "level", header: "Level", numeric: true, render: (r) => r.s.level },
            {
              key: "length",
              header: "Typical length",
              numeric: true,
              render: (r) => `${r.s.typicalDurationMonths} months`,
            },
            { key: "job", header: "Leads to", render: (r) => r.p.title },
            { key: "median", header: "Median pay for the job", mobileLabel: "Median pay", numeric: true, render: (r) => money(r.median) },
          ]}
          rows={examples}
          rowKey={(r) => r.key}
          source={
            <>
              <SourceNote
                source="Skills England, apprenticeship standards"
                href={SKILLS_ENGLAND_URL}
                note="Checked 28 September 2026. All standards shown were approved for delivery."
              />
              <AsheSourceNote className="mt-1" />
            </>
          }
          notes={
            notes.length > 0 ? (
              <ul className="space-y-1 text-xs text-muted">
                {notes.map((r) => (
                  <li key={r.key}>
                    {r.p.title}: {r.p.payNote}
                  </li>
                ))}
              </ul>
            ) : undefined
          }
        />
        <Prose className="mt-6">
          <p>
            Some of these have extra entry rules. Skills England says the{" "}
            <Ext href="https://skillsengland.education.gov.uk/apprenticeships/st0490-v2-0">teacher apprenticeship</Ext>{" "}
            requires a UK first degree or equivalent and grade 4 GCSEs in English and maths (or an equivalency test).
            Nursing associates must register with the Nursing and Midwifery Council, and social workers in England with
            Social Work England.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="funding" title="Who pays for the training">
        <Prose className="mt-4">
          <p>
            You do not. The 2026 to 2027 funding rules say neither the training provider nor the employer can ask an
            apprentice to contribute to the cost of training or assessment, including if you leave early.{" "}
            <Ext href={FUNDING_RULES_URL}>Apprenticeship funding rules 2026 to 2027 (rule 220)</Ext>
          </p>
          <p>
            Employers pay more towards the training for older apprentices, which is worth knowing when you apply. At an employer that does
            not pay the apprenticeship levy, the government pays the full training cost for apprentices aged 16 to 24,
            but 95% for everyone else, so the employer pays 5%. A levy-paying employer that has used up its levy funds
            pays 25% for apprentices aged 25 and over. From 1 October 2026 employers may also get a hiring payment of up
            to £2,000 for new apprentices aged 16 to 24.{" "}
            <Ext href={EMPLOYER_FUNDING_URL}>GOV.UK: apprenticeship funding for employers</Ext>
          </p>
          <p>
            So when you apply as an adult, show what you already bring: experience of work, reliability and any skills
            that make you useful from the first week.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="apply" title="How to find and apply">
        <Prose className="mt-4">
          <ol>
            <li>
              Search the government&apos;s <Ext href={FIND_URL}>Find an apprenticeship</Ext> service. You can filter by
              job, place and level.
            </li>
            <li>Sign in or create an account.</li>
            <li>Complete and submit your application. You can ask for feedback if you are not picked.</li>
          </ol>
          <p>
            You can also ask your current employer whether they would take you on as an apprentice in a new role. The
            apprenticeship helpline is 0800 015 0400, Monday to Friday, 9am to 5pm (
            <Ext href="https://www.gov.uk/become-apprentice/apply-for-an-apprenticeship">GOV.UK</Ext>).
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Find out which apprenticeships fit your experience"
        body={
          <p>
            Tell us the job you do now, or paste your CV, and we will show the jobs people with your skills move into,
            with ONS pay and the apprenticeships that lead to each. Free, and no account needed.
          </p>
        }
      />

      <FaqSection
        className="mt-14"
        items={[
          {
            question: "Is there an age limit for apprenticeships?",
            answer:
              "There is a minimum age of 16 but no maximum. GOV.UK says you need to be 16 or over, living in England and not in full-time education.",
          },
          {
            question: "Can I do an apprenticeship if I already have a degree?",
            answer:
              "Yes. GOV.UK says you can have a previous qualification, like a degree, and still start an apprenticeship. Some need one: Skills England says the postgraduate teacher apprenticeship requires a UK first degree or equivalent.",
          },
          {
            question: "How much are adult apprentices paid?",
            answer: `At least £8.00 an hour in the first year, whatever your age (from April 2026). After the first year, apprentices aged 21 or over must get the National Living Wage of £12.71 an hour. At 37.5 hours a week, £8.00 an hour works out at ${formatGBP(yearly(APPRENTICE_RATE, 37.5))} a year before tax. Employers can pay more than the minimum.`,
          },
          {
            question: "Do I have to pay for an apprenticeship?",
            answer:
              "No. Under the apprenticeship funding rules for 2026 to 2027, the training provider and the employer must not ask you to contribute to the cost of training or assessment, even if you leave early.",
          },
          {
            question: "Can I do an apprenticeship part-time?",
            answer:
              "Yes. The funding rules say working fewer than 30 hours a week must not be a barrier. The training provider has to agree a realistic length with your employer, so a part-time apprenticeship usually takes longer.",
          },
          {
            question: "Do I need GCSE English and maths?",
            answer:
              "Not to finish, if you are 19 or over when you start. Under the 2026 to 2027 funding rules, English and maths for adult apprentices is agreed with the employer, and you do not have to achieve the qualifications to complete the apprenticeship. Some employers and some jobs still ask for them.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/career-change-with-no-money", label: "Career change with no money" },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree, with ONS pay" },
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "/career-change-at-50", label: "Career change at 50" },
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
        ]}
      />
    </GuideShell>
  );
}
