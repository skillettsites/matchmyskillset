import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, entryApprenticeship, occupationPayById, UK_FT_MEDIAN, type OccupationPay } from "@/components/guides/pay";

const PATH = "/what-job-is-right-for-me";
const TITLE = "What job is right for me? A UK guide with real pay data";
const DESCRIPTION =
  "Narrow down the right job by skills, values, working style and pay, with example jobs for sociable, creative, analytical and caring people and ONS pay.";
const H1 = "What job is right for me?";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const NCS_ASSESSMENT_URL = "https://nationalcareers.service.gov.uk/discover-your-skills-and-careers";

interface TypeGroup {
  id: string;
  title: string;
  intro: ReactNode;
  ids: string[];
}

// Example jobs for each type. The grouping is our editorial judgement, not a test result.
const GROUPS: TypeGroup[] = [
  {
    id: "people",
    title: "If you like being around people",
    intro: (
      <>
        If you get energy from other people (the classic extrovert), look at jobs built on conversations: selling,
        recruiting, representing an organisation or running events. Before you accept a sales or recruitment job, ask how
        targets and commission work.
      </>
    ),
    ids: ["business-development-manager", "sales-representative", "pr-officer", "recruitment-consultant", "events-manager", "estate-agent"],
  },
  {
    id: "creative",
    title: "If you are creative",
    intro: (
      <>
        Creative jobs that pay a steady wage usually mix ideas with a brief, a client and a deadline. Expect to be asked
        for examples of your work, so start building a portfolio now.
      </>
    ),
    ids: ["web-developer", "ux-designer", "copywriter", "social-media-manager", "marketing-executive"],
  },
  {
    id: "analytical",
    title: "If you are analytical",
    intro: (
      <>
        If you like finding patterns, checking detail and working problems through, look at jobs built on data, systems
        or rules. Many have apprenticeships, and several pay well above the UK median.
      </>
    ),
    ids: ["cyber-security-analyst", "business-analyst", "accountant", "software-tester", "intelligence-analyst", "data-analyst"],
  },
  {
    id: "helping",
    title: "If you like helping people",
    intro: (
      <>
        Caring and support jobs range from roles with a level 2 apprenticeship to regulated professions that need a degree
        and registration. Pay varies widely, so check the figure before you commit to training.
      </>
    ),
    ids: ["paramedic", "social-worker", "occupational-therapist", "youth-worker", "careers-adviser", "counsellor", "healthcare-assistant"],
  },
  {
    id: "graduates",
    title: "If you have a degree",
    intro: (
      <>
        A degree opens the professions that require one, and some accept a degree in any subject. The Solicitors
        Regulation Authority, for example, says the degree for the SQE route can be in any subject or an equivalent level
        6 qualification (
        <a href="https://www.sra.org.uk/become-solicitor/sqe/" className="link" rel="noopener">
          SRA
        </a>
        ). These are examples where a degree or degree apprenticeship is the usual way in.
      </>
    ),
    ids: ["data-scientist", "solicitor", "quantity-surveyor", "secondary-school-teacher", "nurse", "town-planner"],
  },
];

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link" rel="noopener">
      {children}
    </a>
  );
}

function WayIn({ p }: { p: OccupationPay }) {
  const s = entryApprenticeship(p);
  if (p.degreeUsuallyRequired) {
    return (
      <>
        Usually a degree
        {s && (
          <>
            . Apprenticeship: <Ext href={s.url}>{s.title}</Ext> (level {s.level})
          </>
        )}
      </>
    );
  }
  if (!s) {
    return p.ncsUrl ? <Ext href={p.ncsUrl}>See the National Careers Service profile</Ext> : <>No apprenticeship listed</>;
  }
  return (
    <>
      <Ext href={s.url}>{s.title}</Ext> apprenticeship, level {s.level}
    </>
  );
}

interface Row {
  id: string;
  p: OccupationPay;
  median: number | null;
}

function GroupTable({ group }: { group: TypeGroup }) {
  const rows: Row[] = group.ids
    .map((id) => {
      const p = occupationPayById(id);
      return { id, p, median: p.median };
    })
    .sort((a, b) => (b.median ?? -1) - (a.median ?? -1));
  return (
    <DataTable<Row>
      caption={`Example jobs ${group.title.replace(/^If you /, "for people who ")}`}
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
        { key: "way", header: "Usual way in", render: (r) => <WayIn p={r.p} /> },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      source={<AsheSourceNote />}
    />
  );
}

export default function Page() {
  const analyst = occupationPayById("data-analyst");
  const recruiter = occupationPayById("recruitment-consultant");
  const ux = occupationPayById("ux-designer");

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "What job is right for me?" }]} />}
        kicker="Choosing a career"
        title={H1}
        intro={
          <p>
            No quiz can tell you for certain. What works is narrowing it down with four things you can check: what you are
            good at, what you want from work, how you like to work and what you need to earn. Our free{" "}
            <Link href="/quiz" className="link">
              career quiz
            </Link>{" "}
            starts from how you like to work; our{" "}
            <Link href="/discover" className="link">
              CV tool
            </Link>{" "}
            starts from what you have already done.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "tools", label: "Two free ways to start" },
          { id: "questions", label: "Four questions to narrow it down" },
          { id: "people", label: "If you like being around people" },
          { id: "creative", label: "If you are creative" },
          { id: "analytical", label: "If you are analytical" },
          { id: "helping", label: "If you like helping people" },
          { id: "graduates", label: "If you have a degree" },
          { id: "limits", label: "What a quiz cannot tell you" },
        ]}
      />

      <GuideSection id="tools" title="Two free ways to start">
        <div className="mt-6 grid max-w-reading gap-4 sm:grid-cols-2">
          <div className="rounded-[22px] bg-cloud p-6">
            <h3 className="text-h3 font-bold text-ink">Take the career quiz</h3>
            <p className="mt-2 text-ink-2">
              A short multiple-choice quiz about what you enjoy and how you like to work. Good if you have no idea where
              to start.
            </p>
            <Link href="/quiz" className="btn btn-secondary mt-4">
              Start the quiz
            </Link>
          </div>
          <div className="rounded-[22px] bg-cloud p-6">
            <h3 className="text-h3 font-bold text-ink">Analyse your CV</h3>
            <p className="mt-2 text-ink-2">
              Paste your CV and see the skills you already have and the jobs they lead to. Good if you have been working
              for a while.
            </p>
            <Link href="/discover" className="btn btn-secondary mt-4">
              Analyse my CV
            </Link>
          </div>
        </div>
        <Prose className="mt-6">
          <p>
            The National Careers Service also has a free{" "}
            <Ext href={NCS_ASSESSMENT_URL}>Discover your skills and careers</Ext> assessment: 40 multiple-choice questions
            that take 5 to 10 minutes and give career suggestions to compare.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="questions" title="Four questions to narrow it down">
        <Prose className="mt-4">
          <h3>1. What are you good at?</h3>
          <p>
            Not what you enjoy yet, but what you do well. What do colleagues ask you to help with? What comes easily to
            you that others find hard? What could you teach someone? Our{" "}
            <Link href="/transferable-skills">transferable skills guide</Link> helps you name these in the words
            employers use.
          </p>

          <h3>2. What do you want from work?</h3>
          <p>
            Put these in order: security, pay, flexibility, independence, helping people, creativity, status, variety.
            Then check every option against your top two or three, and be honest about them.
          </p>

          <h3>3. How do you like to work?</h3>
          <p>
            Alone or in a team? With the public or behind the scenes? Routine or variety? Desk, outdoors or on your feet?
            If you prefer quiet, focused work, see our guide to <Link href="/jobs-for-introverts">jobs for introverts</Link>
            .
          </p>

          <h3>4. What do you need to earn?</h3>
          <p>
            Work out the minimum you need, then check each job against it. For reference, the UK median for full-time
            employee jobs was {formatGBP(UK_FT_MEDIAN)} in the tax year to April 2025. Our pages on jobs that pay{" "}
            <Link href="/what-jobs/jobs-that-pay-30k">£30k</Link>, <Link href="/what-jobs/jobs-that-pay-40k">£40k</Link>{" "}
            and <Link href="/what-jobs/jobs-that-pay-50k">£50k</Link> list options at each level.
          </p>
        </Prose>
      </GuideSection>

      <div className="mt-14">
        <ToolCallout />
      </div>

      {GROUPS.map((group) => (
        <GuideSection key={group.id} id={group.id} title={group.title} intro={<p>{group.intro}</p>}>
          <GroupTable group={group} />
        </GuideSection>
      ))}

      <SourceNote
        className="mt-6 max-w-reading"
        label="Note"
        source="Apprenticeships from Skills England; entry routes from ONS SOC 2020 and National Careers Service job profiles"
        note="Checked 28 September 2026. Which jobs appear under each heading is our judgement, and “usually a degree” is our reading of the published entry routes. Medians cover everyone in the job, not starting salaries."
      />

      <GuideSection id="limits" title="What a quiz cannot tell you">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>What a normal day is like.</strong> Talk to two or three people who do the job before you spend money
              on training.
            </li>
            <li>
              <strong>What employers near you pay.</strong> ONS medians are for the whole UK. Check{" "}
              <Link href="/jobs">live vacancies</Link> in your area.
            </li>
            <li>
              <strong>Whether you will enjoy it.</strong> Try it in a small way first: a short course, a project, a day of
              shadowing or some volunteering.
            </li>
          </ul>
          <p>
            When you have a shortlist, our guide to{" "}
            <Link href="/career-change/how-to-change-careers">changing careers step by step</Link> covers pay, training and
            funding.
          </p>
        </Prose>
      </GuideSection>

      <FaqSection
        items={[
          {
            question: "How do I know what job is right for me?",
            answer:
              "Narrow it down with four checks: what you are good at, what you want from work, how you like to work and what you need to earn. Then test the shortlist by talking to people who do the jobs and trying the work in a small way before you commit to training.",
          },
          {
            question: "Is there a free career test in the UK?",
            answer:
              "Yes. Our career quiz is free with no account. The National Careers Service also has a free Discover your skills and careers assessment with 40 multiple-choice questions that takes 5 to 10 minutes.",
          },
          {
            question: "What jobs suit extroverts?",
            answer: `Jobs built on conversations, such as recruitment, sales, public relations and events. The ONS full-time median for recruitment consultants' occupation group was ${formatGBP(recruiter.median ?? 0)} in 2025 (ONS ASHE 2025).`,
          },
          {
            question: "What jobs suit creative people?",
            answer: `Design, writing, marketing and web development, where you work to a brief. The ONS full-time median for the occupation group that includes UX designers was ${formatGBP(ux.median ?? 0)} in 2025 (ONS ASHE 2025). Expect employers to ask for examples of your work.`,
          },
          {
            question: "What jobs suit analytical people?",
            answer: `Jobs built on data, systems or rules, such as data analysis, business analysis, accountancy and cyber security. The ONS full-time median for data analysts' occupation group was ${formatGBP(analyst.median ?? 0)} in 2025 (ONS ASHE 2025).`,
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/jobs-for-people-who-hate-their-job", label: "I hate my job: what should I do?" },
          { href: "/jobs-for-introverts", label: "Jobs for introverts" },
          { href: "/low-stress-jobs-uk", label: "Low-stress jobs in the UK" },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree" },
          { href: "/highest-paying-careers-uk", label: "Highest paying careers in the UK" },
          { href: "/career-change", label: "All career change guides" },
        ]}
      />
    </GuideShell>
  );
}
