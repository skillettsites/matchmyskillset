import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import {
  ASHE_BULLETIN_URL,
  AsheSourceNote,
  entryApprenticeship,
  occupationPayById,
  UK_FT_MEDIAN,
  type OccupationPay,
} from "@/components/guides/pay";

const PATH = "/career-change/how-to-change-careers";
const TITLE = "How to change careers in the UK: a step-by-step guide";
const DESCRIPTION =
  "Change career in six steps: find the real problem, check ONS pay and entry routes, fund the training, test the move, rewrite your CV and apply.";
const H1 = "How to change careers in the UK";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Jobs where ONS or the National Careers Service describe a way in below degree
// level (degreeUsuallyRequired is false for every one). The selection is ours.
const EXAMPLE_IDS = [
  "project-manager",
  "business-analyst",
  "compliance-officer",
  "health-and-safety-adviser",
  "hgv-driver",
  "electrician",
  "data-analyst",
  "sales-representative",
  "learning-and-development-adviser",
  "paralegal",
  "hr-officer",
  "recruitment-consultant",
  "it-support-technician",
];

const SKILLS_ENGLAND_URL = "https://skillsengland.education.gov.uk/apprenticeships/";

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link" rel="noopener">
      {children}
    </a>
  );
}

function WayIn({ p }: { p: OccupationPay }) {
  const s = entryApprenticeship(p);
  if (!s) return <span className="text-muted">No apprenticeship listed</span>;
  return (
    <>
      <Ext href={s.url}>{s.title}</Ext>, level {s.level}, typically {s.typicalDurationMonths} months
    </>
  );
}

function money(value: number | null) {
  return value === null ? <span className="text-muted">Not published</span> : formatGBP(value);
}

interface PayRow {
  id: string;
  p: OccupationPay;
  median: number | null;
  p25: number | null;
}

interface RouteRow {
  route: string;
  who: ReactNode;
  cost: ReactNode;
  source: ReactNode;
}

export default function Page() {
  const rows: PayRow[] = EXAMPLE_IDS.map((id) => {
    const p = occupationPayById(id);
    return { id, p, median: p.median, p25: p.p25 };
  }).sort((a, b) => (b.median ?? -1) - (a.median ?? -1));

  const pm = occupationPayById("project-manager");

  const routes: RouteRow[] = [
    {
      route: "Apprenticeship",
      who: (
        <>
          Anyone aged 16 or over. You are an employee, and at least 20% of your normal working hours go on training.
          Apprenticeships take from 8 months to 6 years.
        </>
      ),
      cost: (
        <>
          You are paid a wage. The legal minimum is £8.00 an hour if you are under 19 or in the first year of the
          apprenticeship; after that it is the minimum wage for your age (£12.71 an hour at 21 and over, from April 2026).
        </>
      ),
      source: (
        <>
          <Ext href="https://www.gov.uk/become-apprentice">GOV.UK: become an apprentice</Ext>;{" "}
          <Ext href="https://www.gov.uk/national-minimum-wage-rates">minimum wage rates</Ext>
        </>
      ),
    },
    {
      route: "Skills Bootcamp",
      who: (
        <>
          Aged 19 or over and living in England. Courses last up to 16 weeks, most need no previous knowledge of the
          subject, and you are guaranteed a job interview with an employer at the end.
        </>
      ),
      cost: <>Free if you take the course yourself rather than through your employer.</>,
      source: (
        <>
          <Ext href="https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp">Skills for Careers</Ext>;{" "}
          <Ext href="https://jobhelp.campaign.gov.uk/skills-bootcamps/">JobHelp (DWP)</Ext>
        </>
      ),
    },
    {
      route: "Free Courses for Jobs",
      who: (
        <>
          Aged 19 or over and earning below £25,750 a year, or unemployed. Some areas set slightly different limits.
        </>
      ),
      cost: (
        <>
          A level 3 qualification in a listed subject, or level 2 in construction, engineering or manufacturing, with the
          course fees paid by the government.
        </>
      ),
      source: <Ext href="https://www.gov.uk/guidance/free-courses-for-jobs">GOV.UK, updated 29 July 2025</Ext>,
    },
    {
      route: "Advanced Learner Loan",
      who: (
        <>
          Aged 19 or over on the first day of a level 3, 4, 5 or 6 course at an approved college or provider in England.
          There is no income check or credit check.
        </>
      ),
      cost: (
        <>
          A loan you repay once your income is over the repayment threshold. Level 4 to 6 courses starting on or after 1
          January 2027 are funded through the Lifelong Learning Entitlement instead.
        </>
      ),
      source: <Ext href="https://www.gov.uk/advanced-learner-loan/eligibility">GOV.UK: Advanced Learner Loan</Ext>,
    },
    {
      route: "Time off to train",
      who: (
        <>
          Employees with at least 26 weeks&apos; service, at an organisation with 250 or more staff, can ask for time off
          for training that helps them do their job better.
        </>
      ),
      cost: <>Usually unpaid, unless your employer agrees to pay.</>,
      source: <Ext href="https://www.gov.uk/training-study-work-your-rights">GOV.UK: training and study at work</Ext>,
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "How to change careers" }]} />
        }
        kicker="Career change"
        title={H1}
        intro={
          <p>
            Do it in order. Be clear about what you are leaving, check what the new job pays and how people get in, test
            it while you are still earning, then apply with a CV rewritten for the new role. This guide takes each step
            in turn, with ONS pay figures and the official rules on notice, training time and course funding.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "problem", label: "1. Pin down what you want to change" },
          { id: "skills", label: "2. List what you can already do" },
          { id: "pay", label: "3. Check the pay and the way in" },
          { id: "training", label: "4. Close the gap" },
          { id: "test", label: "5. Test the move before you leave" },
          { id: "apply", label: "6. Apply with a rewritten CV" },
          { id: "advice", label: "Free careers advice" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection id="problem" title="1. Pin down what you want to change">
        <Prose className="mt-4">
          <p>
            Write down what is wrong with your job, as precisely as you can. A difficult manager, long hours or low pay
            can often be fixed by moving employer or changing your hours, without changing career. A new career makes
            sense when the work itself is the problem: the tasks, the setting or the people you serve.
          </p>
          <p>
            Then write down what you want to keep. It might be your pay, your pension, working with people, or a skill
            you are proud of. The two lists become the test for every option you look at.
          </p>
          <p>
            If hours are the main problem, try asking first. Every employee has the legal right to request flexible
            working from their first day in a job, covering the hours, days and place they work (
            <Ext href="https://www.gov.uk/flexible-working">GOV.UK</Ext>). If you are not sure what is wrong, our guide
            for people who{" "}
            <Link href="/jobs-for-people-who-hate-their-job">hate their job</Link> goes through it in more detail.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="skills" title="2. List what you can already do">
        <Prose className="mt-4">
          <p>
            Ignore your job title. List the tasks you do every week and the results you can prove, then name the skill
            behind each one. &ldquo;Dealt with complaints from parents&rdquo; is handling difficult conversations.
            &ldquo;Ran the staff rota&rdquo; is scheduling and people management. &ldquo;Rebuilt the stock
            spreadsheet&rdquo; is working with data.
          </p>
          <p>
            Note any result you can put a number on from your own work: a budget you managed, people you trained, a
            target you hit. Those go on your CV later. Our{" "}
            <Link href="/transferable-skills">transferable skills guide</Link> gives the wording employers use for common
            skills.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="pay"
        title="3. Check the pay and the way in"
        intro={
          <p>
            Before you spend money on training, check two things for each job on your list: what it pays, and how people
            normally get in. For comparison, the UK median for full-time employee jobs was {formatGBP(UK_FT_MEDIAN)} in
            the tax year to April 2025.
          </p>
        }
      >
        <DataTable<PayRow>
          caption="Pay and an apprenticeship route for jobs you can enter without a degree"
          description={
            <>
              A selection of jobs where ONS or the National Careers Service describe a way in below degree level. Median
              is the middle of all full-time jobs in the occupation group; a quarter of those jobs pay less than the
              lower quarter figure.
            </>
          }
          columns={[
            {
              key: "job",
              header: "Job",
              rowHeader: true,
              render: (r) => (
                <>
                  {r.p.title}
                  {r.p.payNote && <span className="mt-1 block text-sm font-normal text-muted">{r.p.payNote}</span>}
                </>
              ),
            },
            { key: "median", header: "Median pay", numeric: true, render: (r) => money(r.median) },
            { key: "p25", header: "Lower quarter", numeric: true, render: (r) => money(r.p25) },
            { key: "way", header: "An apprenticeship route in (England)", mobileLabel: "Apprenticeship", render: (r) => <WayIn p={r.p} /> },
          ]}
          rows={rows}
          rowKey={(r) => r.id}
          source={
            <>
              <AsheSourceNote />
              <SourceNote
                className="mt-1"
                source="Skills England, apprenticeship standards"
                href={SKILLS_ENGLAND_URL}
                note="Checked 28 September 2026. Typical durations are as Skills England publishes them. Apprenticeship standards apply in England."
              />
            </>
          }
        />
        <Prose className="mt-6">
          <p>
            The median covers everyone in the group, from new starters to people with decades of experience, so plan
            with the lower quarter figure as well. ONS figures are for the whole UK and for employees only; they do not
            show what employers near you pay or how many vacancies there are. For that, search{" "}
            <Link href="/jobs">live vacancies</Link>{" "}and read the entry requirements on the job&apos;s National Careers
            Service profile.
          </p>
        </Prose>
      </GuideSection>

      <div className="mt-14">
        <ToolCallout />
      </div>

      <GuideSection
        id="training"
        title="4. Close the gap: training and funding"
        intro={
          <p>
            Check what the job actually asks for before you pay for anything. Some need only a short course; others need
            a licence or registration. These are the main routes for adults in England, as GOV.UK describes them today.
          </p>
        }
      >
        <DataTable<RouteRow>
          caption="Training routes for adults in England"
          columns={[
            { key: "route", header: "Route", rowHeader: true },
            { key: "who", header: "Who it is for", render: (r) => r.who },
            { key: "cost", header: "Pay or cost", render: (r) => r.cost },
            { key: "source", header: "Official source", mobileLabel: "Source", render: (r) => r.source },
          ]}
          rows={routes}
          rowKey={(r) => r.route}
          source={<SourceNote label="Sources" source="GOV.UK and Department for Education pages linked in each row" note="Checked 28 September 2026." />}
        />
        <Prose className="mt-6">
          <p>
            If you claim Universal Credit, GOV.UK says many claimants can take full-time training for up to 16 weeks and
            keep claiming; your local Jobcentre Plus can advise. In Scotland, Wales and Northern Ireland the funding
            schemes are different: start with{" "}
            <Ext href="https://www.myworldofwork.co.uk/">My World of Work</Ext>,{" "}
            <Ext href="https://careerswales.gov.wales/">Careers Wales</Ext> or{" "}
            <Ext href="https://www.nidirect.gov.uk/campaigns/careers">nidirect careers</Ext>. Our guides to{" "}
            <Link href="/apprenticeships-for-adults-uk">apprenticeships for adults</Link> and{" "}
            <Link href="/career-change-with-no-money">changing career with no money</Link> go further.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="test" title="5. Test the move before you leave">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Talk to people who do the job.</strong> Ask two or three what a normal week looks like, what they
              wish they had known and how they got in. Your own contacts, professional bodies and LinkedIn are the usual
              places to find them.
            </li>
            <li>
              <strong>Try the work in a small way.</strong> A short course, a project at your current employer, a day of
              shadowing or some volunteering. GOV.UK lists{" "}
              <Ext href="https://www.gov.uk/volunteering">places to find volunteering opportunities</Ext>.
            </li>
            <li>
              <strong>Work out your money gap.</strong> Compare your take-home pay now with what you would take home at
              the lower quarter figure for the new job, and how many months of savings would cover the difference while
              you retrain.
            </li>
            <li>
              <strong>Check your notice period before you resign.</strong> The legal minimum is one week once you have
              been in a job for more than a month, but your contract can ask for more, and leaving early can breach it (
              <Ext href="https://www.gov.uk/handing-in-your-notice/giving-notice">GOV.UK</Ext>).
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="apply" title="6. Apply with a rewritten CV">
        <Prose className="mt-4">
          <p>
            Write your CV for the job you want, not the job you have: a short profile, a skills section that uses the
            advert&apos;s own wording, then your work history with real results. Our{" "}
            <Link href="/how-to-write-a-cv-for-career-change">career change CV guide</Link> has the structure and
            example lines.
          </p>
          <p>
            Some employers assess skills directly. The Civil Service asks candidates for examples of set behaviours and
            says the examples can come from work, work experience, volunteering or a hobby (
            <Ext href="https://www.gov.uk/government/publications/success-profiles/success-profiles-candidate-overview">
              Success Profiles candidate overview, updated 29 January 2025
            </Ext>
            ). Our guide to <Link href="/career-change/skills-based-hiring">skills-based hiring</Link> explains how to
            prepare for that kind of assessment.
          </p>
          <p>
            Apply for fewer jobs, more carefully. Rewrite the top third of your CV and your cover letter for each advert
            so the reader can see the match without working it out.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="advice" title="Free careers advice">
        <Prose className="mt-4">
          <p>
            In England, the <Ext href="https://nationalcareers.service.gov.uk/">National Careers Service</Ext>{" "}website
            has a skills assessment, job profiles and a course finder. From 1 October 2026 it is renamed &ldquo;Get
            careers information and advice&rdquo; at the same address, and one-to-one advice for adults moves to the
            Department for Work and Pensions: anyone aged 18 or over can contact the DWP Careers Service for a careers
            adviser (<Ext href="https://nationalcareers.service.gov.uk/service-is-changing">National Careers Service</Ext>
            ).
          </p>
          <p>
            In Scotland use <Ext href="https://www.myworldofwork.co.uk/">My World of Work</Ext>, in Wales{" "}
            <Ext href="https://careerswales.gov.wales/">Careers Wales</Ext>, and in Northern Ireland{" "}
            <Ext href="https://www.nidirect.gov.uk/campaigns/careers">nidirect careers</Ext>.
          </p>
        </Prose>
      </GuideSection>

      <FaqSection
        items={[
          {
            question: "How long does a career change take?",
            answer:
              "It depends on the route. The fixed timings are course lengths: Skills Bootcamps last up to 16 weeks and apprenticeships take from 8 months to 6 years, according to GOV.UK. If the new job needs no new qualification, the time is whatever your job search takes.",
          },
          {
            question: "Will I have to take a pay cut to change career?",
            answer: `Not always, but plan for one. Compare the ONS median for the new job with what you earn now, then look at the lower quarter as well, because the median includes people with years of experience. For project managers, for example, the ONS full-time median is ${formatGBP(pm.median ?? 0)}, but a quarter of full-time jobs in that group pay less than ${formatGBP(pm.p25 ?? 0)} (ONS ASHE 2025).`,
          },
          {
            question: "Can I start an apprenticeship as an adult?",
            answer:
              "Yes. In England you need to be 16 or over to start one. The apprentice minimum wage (£8.00 an hour from April 2026) only applies if you are under 19 or in the first year of your apprenticeship. After that you must get at least the minimum wage for your age, which is £12.71 an hour if you are 21 or over.",
          },
          {
            question: "How much notice do I have to give when I leave?",
            answer:
              "At least one week if you have been in the job for more than a month, according to GOV.UK. Your contract can require more, and it may say the notice must be in writing. Check it before you resign.",
          },
          {
            question: "Can I ask my employer for time off to retrain?",
            answer:
              "If you are an employee with at least 26 weeks' service and your organisation has 250 or more staff, you can ask for time off for training that helps you do your job better, so it may not cover training for a different career. It is usually unpaid unless your employer agrees to pay. You can also ask for flexible working from your first day in a job, for example to fit in a course.",
          },
          {
            question: "Where can I get free careers advice?",
            answer:
              "In England, the National Careers Service website has a skills assessment and course finder. From 1 October 2026 one-to-one advice for adults is given by the DWP Careers Service, open to anyone aged 18 or over. Scotland has My World of Work, Wales has Careers Wales and Northern Ireland has nidirect careers.",
          },
        ]}
      />

      <p className="mt-4 max-w-reading text-sm text-muted">
        National Minimum Wage rates from{" "}
        <Ext href="https://www.gov.uk/national-minimum-wage-rates">GOV.UK</Ext>. UK median from the{" "}
        <Ext href={ASHE_BULLETIN_URL}>ONS ASHE 2025 bulletin</Ext>, published 23 October 2025. All other pages checked on
        28 September 2026.
      </p>

      <RelatedLinks
        links={[
          { href: "/career-change-no-experience", label: "Changing career with no experience" },
          { href: "/how-to-write-a-cv-for-career-change", label: "How to write a CV for a career change" },
          { href: "/career-change/skills-based-hiring", label: "Skills-based hiring explained" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree, with ONS pay" },
          { href: "/career-change", label: "All career change guides" },
        ]}
      />
    </GuideShell>
  );
}
