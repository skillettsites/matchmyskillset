import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, entryApprenticeship, occupationPayById, UK_FT_MEDIAN, type OccupationPay } from "@/components/guides/pay";

const PATH = "/career-change-at-50";
const TITLE = "Career change at 50: a UK guide with real pay data";
const DESCRIPTION =
  "Changing career at 50 in the UK: your rights on age, pensions and redundancy pay, ONS pay for jobs where experience counts, and funded ways to retrain.";
const H1 = "Changing career at 50 in the UK";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// ONS ASHE 2025 (provisional) Table 6.7a, gross annual pay for full-time employee
// jobs by age group, UK, published 23 October 2025. Checked 28 September 2026.
const AGE_TABLE_URL =
  "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/agegroupashetable6";
const MEDIAN_40S = 44244;
const MEDIAN_50S = 41866;

// Jobs where years of work experience are useful and a route in is documented.
// The selection is editorial; pay and apprenticeship details come from the dataset.
const DESTINATION_IDS = [
  "project-manager",
  "purchasing-manager",
  "compliance-officer",
  "health-and-safety-adviser",
  "facilities-manager",
  "further-education-lecturer",
  "hgv-driver",
  "learning-and-development-adviser",
  "work-coach",
  "careers-adviser",
  "counsellor",
];

const AICS_40_URL = "https://aicareerswap.com/guides/career-change-at-40";

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
  if (s) {
    return (
      <>
        <Ext href={s.url}>{s.title}</Ext> apprenticeship, level {s.level}, typically {s.typicalDurationMonths} months
      </>
    );
  }
  if (p.qualifications.length > 0 && p.ncsUrl) {
    return (
      <>
        The <Ext href={p.ncsUrl}>National Careers Service profile</Ext> names {p.qualifications.join(", ")}
      </>
    );
  }
  return <span className="text-muted">No apprenticeship listed</span>;
}

interface DestRow {
  id: string;
  p: OccupationPay;
  median: number | null;
  p25: number | null;
}

interface FactRow {
  what: string;
  figure: ReactNode;
  source: ReactNode;
}

export default function Page() {
  const rows: DestRow[] = DESTINATION_IDS.map((id) => {
    const p = occupationPayById(id);
    return { id, p, median: p.median, p25: p.p25 };
  }).sort((a, b) => (b.median ?? -1) - (a.median ?? -1));
  const notes = rows.filter((r) => r.p.payNote);

  const facts: FactRow[] = [
    {
      what: "State Pension age if you turn 50 in 2026",
      figure: "67, under current law",
      source: <Ext href="https://www.gov.uk/state-pension-age">GOV.UK State Pension age checker</Ext>,
    },
    {
      what: "Earliest age most private and workplace pensions can be taken",
      figure: "Usually 55, rising to 57 from 6 April 2028",
      source: (
        <>
          <Ext href="https://www.gov.uk/early-retirement-pension/personal-and-workplace-pensions">GOV.UK</Ext>;{" "}
          <Ext href="https://www.gov.uk/government/publications/increasing-normal-minimum-pension-age">
            HMRC policy paper, 2021
          </Ext>
        </>
      ),
    },
    {
      what: "Statutory redundancy pay for each full year of service from age 41",
      figure: "1.5 weeks' pay",
      source: <Ext href="https://www.gov.uk/redundancy-your-rights/redundancy-pay">GOV.UK: redundancy pay</Ext>,
    },
    {
      what: "Cap on a week's pay for statutory redundancy pay",
      figure: "£751, so no more than £22,530 in total (redundancy on or after 6 April 2026)",
      source: <Ext href="https://www.gov.uk/redundancy-your-rights/redundancy-pay">GOV.UK: redundancy pay</Ext>,
    },
    {
      what: "Statutory redundancy pay that is not taxed",
      figure: "Under £30,000",
      source: <Ext href="https://www.gov.uk/redundancy-your-rights/tax-and-national-insurance">GOV.UK: redundancy and tax</Ext>,
    },
    {
      what: "Flexible working requests",
      figure: "From day one in a new job, 2 requests in any 12 months, decision within 2 months",
      source: <Ext href="https://www.gov.uk/flexible-working/applying-for-flexible-working">GOV.UK: flexible working</Ext>,
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Career change at 50" }]} />
        }
        kicker="Career change"
        title={H1}
        intro={
          <p>
            It is not too late. GOV.UK gives a State Pension age of 67 for anyone who turns 50 in 2026, which leaves
            around 17 working years, and the Equality Act 2010 protects you from age discrimination when you apply. The
            trade-off is pay: ONS puts median full-time pay for people aged 50 to 59 at {formatGBP(MEDIAN_50S)}, and
            starting again as a trainee can mean a large drop.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <GuideSection id="rights" title="Your rights when you change job at 50">
        <Prose className="mt-4">
          <p>
            Age is one of the protected characteristics in the Equality Act 2010. GOV.UK lists what that covers at work:
            recruitment, pay, training, promotion, redundancy and dismissal.{" "}
            <Ext href="https://www.gov.uk/discrimination-your-rights">GOV.UK: discrimination, your rights</Ext>.{" "}
            <Ext href="https://www.acas.org.uk/age-discrimination">Acas has more detail on age discrimination</Ext>.
          </p>
          <ul>
            <li>
              <strong>You do not have to give your date of birth</strong> when you apply for a job, and there is no
              longer a default retirement age.{" "}
              <Ext href="https://www.gov.uk/working-retirement-pension-age">GOV.UK: working after State Pension age</Ext>
            </li>
            <li>
              <strong>You can ask for flexible working from your first day</strong> in a new job, for example part-time
              hours or working from home. Your employer must deal with the request reasonably and decide within 2
              months, but can refuse it for a business reason.{" "}
              <Ext href="https://www.gov.uk/flexible-working">GOV.UK: flexible working</Ext>
            </li>
            <li>
              <strong>If you have a health condition or disability</strong>, an Access to Work grant can pay for things
              like equipment, a support worker or travel to work. It does not affect other benefits and you do not pay
              it back. <Ext href="https://www.gov.uk/access-to-work">GOV.UK: Access to Work</Ext>
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection
        id="money"
        title="Money to check before you move"
        intro={
          <p>
            Before you resign or accept a redundancy offer, check these numbers. Some decisions, such as taking pension
            money early, are hard to undo.
          </p>
        }
      >
        <DataTable<FactRow>
          className="mt-8"
          caption="Key figures for a career change at 50"
          columns={[
            { key: "what", header: "What", rowHeader: true },
            { key: "figure", header: "Figure", render: (r) => r.figure },
            { key: "source", header: "Source", render: (r) => r.source },
          ]}
          rows={facts}
          rowKey={(r) => r.what}
          source={<SourceNote source="GOV.UK and HMRC pages linked in each row" note="Checked 28 September 2026." />}
        />
        <Prose className="mt-6">
          <p>
            If you are being made redundant after at least 2 years with your employer, you are also allowed reasonable
            time off during your notice to look for work or arrange training, though your employer only has to pay up
            to 40% of a week&apos;s pay for it. GOV.UK has a{" "}
            <Ext href="https://www.gov.uk/calculate-your-redundancy-pay">redundancy pay calculator</Ext>.
          </p>
          <p>
            Taking money from a pension early to cover a pay gap has costs. GOV.UK warns that the pot will probably be
            smaller, and that it can reduce means-tested benefits such as Universal Credit.
          </p>
          <p>
            On pay, the ONS figures cut both ways. Median full-time pay for people aged 50 to 59 is{" "}
            {formatGBP(MEDIAN_50S)}, below the {formatGBP(MEDIAN_40S)} for people in their forties. Several jobs in the
            table below have medians above that level. Starting again as a trainee is different: an apprentice aged 50
            can be paid as little as £8.00 an hour in the first year.
          </p>
          <SourceNote
            source="ONS, Annual Survey of Hours and Earnings 2025 (provisional), Table 6.7a"
            href={AGE_TABLE_URL}
            published="2025-10-23"
            note="Median gross annual pay, full-time employee jobs, UK."
          />
        </Prose>
      </GuideSection>

      <GuideSection
        id="destinations"
        title="Jobs where experience counts"
        intro={
          <p>
            These jobs draw on judgement, dealing with people and knowing how organisations work. Each has a documented
            way in, so you are not starting from nothing. Pay is the ONS figure for the whole occupation group.
          </p>
        }
      >
        <DataTable<DestRow>
          className="mt-8"
          caption="Where people with long experience can move, with UK pay"
          description={
            <>
              Median and lower-quartile pay for full-time employees. The median for all full-time employees is{" "}
              {formatGBP(UK_FT_MEDIAN)}.
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
            You may also be thinking about consultancy, non-executive roles or freelance work. ONS earnings data covers
            employees only, so there is no ONS pay figure for self-employed work. If you are weighing it up,
            read our guide to <Link href="/freelance-careers-uk">freelance careers in the UK</Link>.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="help" title="Free help and training at 50">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Midlife MOT.</strong> The government&apos;s free online{" "}
              <Ext href="https://jobhelp.campaign.gov.uk/midlifemot/home-page/">Midlife MOT</Ext> brings together tools
              on work, health and money. It is aimed at people aged 45 to 65.
            </li>
            <li>
              <strong>Careers advice.</strong> From 1 October 2026 the National Careers Service website is renamed
              &quot;Get careers information and advice&quot; and keeps its address. Face-to-face careers advice for
              adults in England moves to the Department for Work and Pensions Careers Service.{" "}
              <Ext href="https://nationalcareers.service.gov.uk/service-is-changing">National Careers Service notice</Ext>
            </li>
            <li>
              <strong>Apprenticeships.</strong> There is no upper age limit: you need to be 16 or over, living in England
              and not in full-time education.{" "}
              <Ext href="https://www.gov.uk/become-apprentice">GOV.UK: become an apprentice</Ext>.{" "}
              <Ext href="https://www.gov.uk/government/publications/apprenticeship-funding-rules-and-assessment-plan-guidance-2026-to-2027">
                The funding rules
              </Ext>{" "}
              say you cannot be asked to pay for the training, but your employer may pay part: at an employer that does not pay the apprenticeship levy, the government
              pays the full training cost for apprentices aged 16 to 24 and 95% for older apprentices, leaving the
              employer to pay 5%.{" "}
              <Ext href="https://www.gov.uk/employing-an-apprentice/get-funding">GOV.UK: apprenticeship funding</Ext>
            </li>
            <li>
              <strong>Course fees.</strong> Free Courses for Jobs pays for a level 3 course if you earn below £25,750
              or are unemployed, and an Advanced Learner Loan can cover level 3 to 6 course fees for anyone aged 19 or
              over. <Ext href="https://www.gov.uk/guidance/free-courses-for-jobs">GOV.UK: Free Courses for Jobs</Ext>;{" "}
              <Ext href="https://www.gov.uk/advanced-learner-loan">Advanced Learner Loan</Ext>
            </li>
          </ul>
          <p>
            A sensible order: check your pension and redundancy position, use the Midlife MOT to take stock, try the new
            work part-time or as a volunteer, then rewrite your CV around recent, relevant experience.{" "}
            <Link href="/how-to-write-a-cv-for-career-change">How to write a CV for a career change</Link> shows how.
            If you are in your forties rather than your fifties, AICareerSwap has a separate{" "}
            <Ext href={AICS_40_URL}>guide to changing career at 40</Ext>.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See where your experience could take you"
        body={
          <p>
            Tell us the job you do now, or paste your CV, and we will show the jobs people with your background move
            into, with ONS pay for each. Free, and no account needed.
          </p>
        }
      />

      <FaqSection
        className="mt-14"
        items={[
          {
            question: "Is 50 too late to change career?",
            answer:
              "No. GOV.UK's State Pension age checker gives 67 for anyone who turns 50 in 2026, so most people have around 17 working years left. There is no upper age limit on apprenticeships, and Advanced Learner Loans and Free Courses for Jobs are open to anyone aged 19 or over.",
          },
          {
            question: "Can an employer turn me down because of my age?",
            answer:
              "Age is a protected characteristic under the Equality Act 2010, and GOV.UK says the law protects you against discrimination in recruitment, pay, training, promotion, redundancy and dismissal. You do not have to give your date of birth when you apply. If you think you have been treated unlawfully, Acas and Citizens Advice can help, and you may be able to bring a claim at an employment tribunal.",
          },
          {
            question: "Can I do an apprenticeship at 50?",
            answer:
              "Yes. GOV.UK says you need to be 16 or over, living in England and not in full-time education. The minimum pay is £8.00 an hour in the first year and then the National Living Wage (£12.71 an hour from April 2026), though employers can pay more. You do not pay for the training. For apprentices aged 25 and over, an employer that does not pay the apprenticeship levy pays 5% of the training cost.",
          },
          {
            question: "When can I take money from my private pension?",
            answer:
              "Usually from 55, depending on your scheme's rules. HMRC is raising the normal minimum pension age from 55 to 57 from 6 April 2028. GOV.UK warns that taking money early will probably leave a smaller pot and can affect means-tested benefits.",
          },
          {
            question: "How much redundancy pay will I get at 50?",
            answer:
              "If you have worked for your employer for at least 2 years, statutory redundancy pay is one and a half weeks' pay for each full year you worked from age 41, one week's pay for each year from 22 to 40, and half a week's pay for each year under 22. Service is capped at 20 years and a week's pay at £751 for redundancies on or after 6 April 2026, so the most you can get is £22,530.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/career-change-with-no-money", label: "Career change with no money" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
          { href: "/freelance-careers-uk", label: "Freelance careers in the UK" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
          { href: "/low-stress-jobs-uk", label: "Low-stress jobs in the UK" },
          { href: "/career-change-at-30", label: "Career change at 30" },
        ]}
      />
    </GuideShell>
  );
}
