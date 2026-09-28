import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, entryApprenticeship, occupationPayById, type OccupationPay } from "@/components/guides/pay";

const PATH = "/career-change-no-experience";
const TITLE = "Career change with no experience: UK routes and real pay";
const DESCRIPTION =
  "How to get into a new field with no experience in it: apprenticeships, funded courses and trainee roles for UK adults, with ONS pay for each job.";
const H1 = "How to change career with no experience in the new field";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Jobs with an approved apprenticeship that a new entrant can start (England). Selection is ours.
const JOB_IDS = [
  "software-developer",
  "rail-track-maintenance-worker",
  "train-conductor",
  "hgv-driver",
  "electrician",
  "data-analyst",
  "plumber",
  "bus-driver",
  "paralegal",
  "hr-officer",
  "recruitment-consultant",
  "it-support-technician",
  "security-officer",
  "marketing-executive",
  "bookkeeper",
  "estate-agent",
  "healthcare-assistant",
  "teaching-assistant",
];

// Apprentice minimum wage from April 2026 (GOV.UK National Minimum Wage rates), and the rate at 21 and over.
const APPRENTICE_RATE = 8.0;
const NMW_21_PLUS = 12.71;
const EXAMPLE_WEEK_HOURS = 37.5;

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link" rel="noopener">
      {children}
    </a>
  );
}

interface JobRow {
  id: string;
  p: OccupationPay;
  median: number | null;
}

export default function Page() {
  const rows: JobRow[] = JOB_IDS.map((id) => {
    const p = occupationPayById(id);
    return { id, p, median: p.median };
  }).sort((a, b) => (b.median ?? -1) - (a.median ?? -1));

  const apprenticeWeek = APPRENTICE_RATE * EXAMPLE_WEEK_HOURS;
  const apprenticeYear = apprenticeWeek * 52;
  const nmwYear = NMW_21_PLUS * EXAMPLE_WEEK_HOURS * 52;

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Career change with no experience" }]} />
        }
        kicker="Career change"
        title={H1}
        intro={
          <p>
            You can get into a new field without experience in it, usually through a route built for new entrants: an
            apprenticeship, a funded course, or a junior or trainee role. Below are the routes open to adults in England,
            what they pay or cost, and jobs where a published apprenticeship gives you a way in, with ONS pay for each.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "experience", label: "You have more to offer than you think" },
          { id: "routes", label: "Routes built for new entrants" },
          { id: "jobs", label: "Jobs with a way in for new entrants" },
          { id: "evidence", label: "Build evidence before you apply" },
          { id: "cost", label: "What it costs you" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection id="experience" title="You have more to offer than you think">
        <Prose className="mt-4">
          <p>
            &ldquo;No experience&rdquo; usually means no experience with the job title. The tasks behind it are often
            familiar. Some examples of how everyday work translates:
          </p>
          <ul>
            <li>Managing a class of 30: running a group, planning sessions, tracking progress.</li>
            <li>Working a shop floor: customer service, handling complaints, cash and stock.</li>
            <li>Dealing with patient complaints: calming tense situations, listening, following a process.</li>
            <li>Processing invoices: accuracy, financial records, working to deadlines.</li>
            <li>Training new starters: coaching, explaining clearly, checking understanding.</li>
          </ul>
          <p>
            Describe these in the words your target job uses. Our{" "}
            <Link href="/transferable-skills">transferable skills guide</Link> helps with the wording, and the{" "}
            <Link href="/how-to-write-a-cv-for-career-change">career change CV guide</Link> shows where to put it.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="routes"
        title="Routes built for new entrants"
        intro={<p>These are the main routes for adults in England, as GOV.UK and the Department for Education describe them today.</p>}
      >
        <Prose className="mt-4">
          <h3>Apprenticeships</h3>
          <p>
            You need to be 16 or over. You are an employee earning a wage, and at least 20% of your normal working hours
            are for training. Apprenticeships take from 8 months to 6 years depending on the type and level (
            <Ext href="https://www.gov.uk/become-apprentice">GOV.UK</Ext>). Search vacancies on{" "}
            <Ext href="https://www.findapprenticeship.service.gov.uk/">Find an apprenticeship</Ext>.
          </p>
          <p>
            The legal minimum is the apprentice rate of £8.00 an hour if you are under 19, or 19 or over and in the first
            year of your apprenticeship. After that you must get at least the minimum wage for your age: £12.71 an hour
            at 21 and over, from April 2026 (<Ext href="https://www.gov.uk/national-minimum-wage-rates">GOV.UK</Ext>).
          </p>

          <h3>Skills Bootcamps</h3>
          <p>
            Courses of up to 16 weeks for people aged 19 or over. Most need no previous knowledge of the subject, and you
            are guaranteed a job interview with an employer at the end (
            <Ext href="https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp">Skills for Careers</Ext>
            ). The government&apos;s JobHelp site says they are free if you take the course yourself rather than through
            your employer, and open to people living in England (
            <Ext href="https://jobhelp.campaign.gov.uk/skills-bootcamps/">JobHelp</Ext>).
          </p>

          <h3>Free Courses for Jobs</h3>
          <p>
            If you are 19 or over and earn below £25,750 a year, or are unemployed, you may get a level 3 qualification
            in a listed subject, or a level 2 in construction, engineering or manufacturing, with the fees paid (
            <Ext href="https://www.gov.uk/guidance/free-courses-for-jobs">GOV.UK, updated 29 July 2025</Ext>). Some areas
            set slightly different limits.
          </p>

          <h3>Advanced Learner Loan</h3>
          <p>
            For a level 3 to 6 course in England if you are 19 or over, with no income or credit check. You repay it once
            you earn over the threshold (<Ext href="https://www.gov.uk/advanced-learner-loan">GOV.UK</Ext>).
          </p>

          <h3>Trainee and junior roles</h3>
          <p>
            Some employers train new starters themselves, without a formal apprenticeship. Look for
            &ldquo;trainee&rdquo;, &ldquo;junior&rdquo; or &ldquo;no experience needed&rdquo; in{" "}
            <Link href="/jobs">live vacancies</Link>. A job in the right sector, even in a different function, can make a
            later internal move easier.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="jobs"
        title="Jobs with a way in for new entrants"
        intro={
          <p>
            Each job below has an apprenticeship approved for delivery in England. Pay is the ONS median for full-time
            employees in the job&apos;s occupation group, which includes experienced staff. Starting pay can be lower,
            and during an apprenticeship it can be much lower.
          </p>
        }
      >
        <DataTable<JobRow>
          caption="Jobs you can train into as a new entrant, with ONS median pay"
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
            {
              key: "median",
              header: "Median pay",
              numeric: true,
              render: (r) => (r.median === null ? <span className="text-muted">Not published</span> : formatGBP(r.median)),
            },
            {
              key: "apprenticeship",
              header: "Entry apprenticeship",
              render: (r) => {
                const s = entryApprenticeship(r.p);
                if (!s) return <span className="text-muted">None listed</span>;
                return (
                  <>
                    <Ext href={s.url}>{s.title}</Ext>, level {s.level}, typically {s.typicalDurationMonths} months
                  </>
                );
              },
            },
            {
              key: "licence",
              header: "Licence or card you may need",
              mobileLabel: "Licence or card",
              render: (r) =>
                r.p.licences.length === 0 ? (
                  <span className="text-muted">None listed</span>
                ) : (
                  r.p.licences.map((l) => (
                    <span key={l.id} className="block">
                      <Ext href={l.sources[0].url}>{l.name}</Ext>
                    </span>
                  ))
                ),
            },
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
                note="Checked 28 September 2026. Typical durations as Skills England publishes them. Licences and cards link to the body that issues them; some apply only to part of the job, such as gas work for plumbers."
              />
            </>
          }
        />
      </GuideSection>

      <div className="mt-14">
        <ToolCallout />
      </div>

      <GuideSection id="evidence" title="Build evidence before you apply">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Do a small project.</strong> For a data role, analyse a public dataset and write up what you found.
              For marketing, run social media for a local club. Employers can judge a piece of work more easily than a
              claim.
            </li>
            <li>
              <strong>Volunteer in the field.</strong> Charities and community groups often need help with admin,
              events, fundraising or digital work. GOV.UK lists{" "}
              <Ext href="https://www.gov.uk/volunteering">where to find volunteering opportunities</Ext>.
            </li>
            <li>
              <strong>Talk to people who do the job.</strong> Ask how they got in and what they would do in your place.
            </li>
            <li>
              <strong>Take one relevant course, not five.</strong>{" "}Check the advert or the job&apos;s apprenticeship
              standard to see what employers ask for, then do that.
            </li>
          </ul>
          <p>
            Examples from outside paid work can count. The Civil Service, for instance, says examples of the behaviours it
            assesses can come from work experience, volunteering or a hobby (
            <Ext href="https://www.gov.uk/government/publications/success-profiles/success-profiles-candidate-overview">
              Success Profiles
            </Ext>
            ).
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="cost" title="What it costs you">
        <Prose className="mt-4">
          <p>
            Starting again usually means a lower wage for a while. As an example, an apprentice aged 19 or over in their
            first year can legally be paid {formatGBP(APPRENTICE_RATE, "hour")} an hour. For a {EXAMPLE_WEEK_HOURS}-hour
            week that is {formatGBP(apprenticeWeek)} a week before tax, or about {formatGBP(apprenticeYear)} a year. At the
            minimum wage for people aged 21 and over the same hours come to about {formatGBP(Math.round(nmwYear / 100) * 100)}{" "}
            a year. These are legal minimums (our calculation from the{" "}
            <Ext href="https://www.gov.uk/national-minimum-wage-rates">GOV.UK rates</Ext>), so check the wage on each
            vacancy.
          </p>
          <p>
            Work out how long your savings would cover the gap between that and your outgoings. If you claim Universal
            Credit, GOV.UK says many claimants can take full-time training for up to 16 weeks and keep claiming, and
            JobHelp says the same for Skills Bootcamps; ask your local Jobcentre Plus before you start. Our guide to{" "}
            <Link href="/career-change-with-no-money">changing career with no money</Link> has more on this.
          </p>
        </Prose>
      </GuideSection>

      <FaqSection
        items={[
          {
            question: "Can I start an apprenticeship at 30, 40 or 50?",
            answer:
              "Yes. GOV.UK says you need to be 16 or over to start an apprenticeship in England. From the second year, if you are 19 or over, you must be paid at least the minimum wage for your age rather than the apprentice rate.",
          },
          {
            question: "What is the quickest way into a new career with no experience?",
            answer:
              "There is no reliable data on which change is easiest. The shortest published routes in our table are level 2 apprenticeships: Skills England gives a typical length of 8 months for healthcare support worker, 12 months for bus and coach driver, security operative and junior estate agent, and 13 months for HGV driver.",
          },
          {
            question: "Are Skills Bootcamps free?",
            answer:
              "The government's JobHelp site says Skills Bootcamps are free if you take the course yourself rather than through your employer. You need to be 19 or over and living in England. Courses last up to 16 weeks and end with a guaranteed job interview.",
          },
          {
            question: "Do I need a degree to change career?",
            answer:
              "Not for most jobs in the table above, which all have apprenticeships below degree level. Some professions do need one: in England the apprenticeships for registered nurse, social worker and paramedic are all at level 6, which is degree level.",
          },
          {
            question: "Can I get paid while I retrain?",
            answer:
              "An apprenticeship pays a wage while you train. If you claim Universal Credit, GOV.UK says many claimants can take full-time training for up to 16 weeks and keep claiming, and JobHelp says you can keep claiming while on a Skills Bootcamp. Check with your Jobcentre Plus first.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/jobs-without-a-degree", label: "Jobs without a degree, with ONS pay" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
          { href: "/jobs-you-can-do-from-home-with-no-experience", label: "Home-based jobs with no experience" },
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
          { href: "/how-to-write-a-cv-for-career-change", label: "How to write a CV for a career change" },
        ]}
      />
    </GuideShell>
  );
}
