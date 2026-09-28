import type { Metadata } from "next";
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
import {
  ApprenticeshipSourceNote,
  AsheSourceNote,
  RouteList,
  UK_FT_MEDIAN,
  lcFirst,
  occupationPayById,
  type OccupationPay,
} from "@/components/guides/pay";
import { SOC_SOURCE } from "@/data/careers";

const PATH = "/jobs-for-introverts";
const TITLE = "Jobs for introverts in the UK, with real ONS pay data";
const DESCRIPTION =
  "Quieter UK jobs with ONS 2025 median pay and the way in, what to look for in a role, and options if constant emotional labour wears you out.";
const H1 = "Jobs for introverts in the UK";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Sources, checked on 28 September 2026.
const HSE_STRESS = "https://www.hse.gov.uk/Statistics/assets/docs/stress.pdf";
const NHS_SOCIAL_ANXIETY = "https://www.nhs.uk/mental-health/conditions/social-anxiety/";
const ADJUSTMENTS = "https://www.gov.uk/reasonable-adjustments-for-disabled-workers";
const DISABILITY_DEFINITION = "https://www.gov.uk/definition-of-disability-under-equality-act-2010";

interface Row {
  kind: string;
  pay: OccupationPay;
  why: string;
}

/** Editorial selection: jobs with long spells of focused work and limited group contact. */
const QUIET_PICKS: { kind: string; id: string; why: string }[] = [
  {
    kind: "Data and numbers",
    id: "data-analyst",
    why: "Long spells of focused work with data. Findings are usually shared through reports and dashboards.",
  },
  {
    kind: "Data and numbers",
    id: "accountant",
    why: "Detailed work you mostly do on your own, with client or management meetings at set points.",
  },
  {
    kind: "Data and numbers",
    id: "bookkeeper",
    why: "Steady, detailed work keeping records and accounts up to date.",
  },
  {
    kind: "Technical and IT",
    id: "software-developer",
    why: "Much of the day is focused coding. Teams often discuss work in writing, through tickets and code reviews.",
  },
  {
    kind: "Technical and IT",
    id: "software-tester",
    why: "Methodical checking, with problems logged in writing.",
  },
  {
    kind: "Technical and IT",
    id: "cyber-security-analyst",
    why: "Monitoring and investigating, mostly at a screen, with bursts of pressure when an incident happens.",
  },
  {
    kind: "Technical and IT",
    id: "cad-technician",
    why: "Drawing and modelling work at a screen, taking briefs from engineers or designers.",
  },
  {
    kind: "Writing",
    id: "technical-author",
    why: "You communicate mainly in writing, checking detail with subject experts rather than presenting to groups.",
  },
  {
    kind: "Working on your own",
    id: "hgv-driver",
    why: "Long periods alone in the cab. You need the right licence and a Driver CPC.",
  },
  {
    kind: "Working on your own",
    id: "train-driver",
    why: "Mostly alone in the cab, following signals and strict rules. ONS says entrants must pass a series of tests and a medical examination.",
  },
];

/** For people worn out by constant emotional labour rather than by people as such. */
const CALMER_PICKS: { kind: string; id: string; why: string }[] = [
  {
    kind: "Health, away from the bedside",
    id: "clinical-coder",
    why: "Uses knowledge of care and medical terms, working from patient records rather than with patients.",
  },
  {
    kind: "Helping people, by appointment",
    id: "careers-adviser",
    why: "Guidance interviews and group sessions, usually booked in advance rather than crisis work.",
  },
  {
    kind: "Helping people learn",
    id: "learning-and-development-adviser",
    why: "Designing and running training. Contact with people is mostly planned sessions.",
  },
  {
    kind: "Listening, with structure",
    id: "user-researcher",
    why: "Interviews are structured and time-limited, and much of the job is analysis and writing up.",
  },
  {
    kind: "Improving services from the policy side",
    id: "policy-officer",
    why: "Research and written advice for a department, council or charity, rather than frontline casework.",
  },
];

function toRows(picks: { kind: string; id: string; why: string }[]): Row[] {
  return picks.map((p) => ({ kind: p.kind, pay: occupationPayById(p.id), why: p.why }));
}

function payCell(p: OccupationPay) {
  if (p.median === null) {
    return <span className="text-ink-2">ONS did not publish a reliable figure</span>;
  }
  return (
    <span className="block">
      <span className="block">{formatGBP(p.median)}</span>
      {p.payNote && <span className="mt-1 block text-xs font-normal text-muted">{p.payNote}</span>}
    </span>
  );
}

function jobCell(r: Row) {
  return (
    <span className="block">
      <span className="block">{r.pay.title}</span>
      <span className="block text-xs font-normal text-muted">{r.kind}</span>
    </span>
  );
}

export default function JobsForIntrovertsPage() {
  const quiet = toRows(QUIET_PICKS);
  const calmer = toRows(CALMER_PICKS);

  const byPay = [...quiet].filter((r) => r.pay.median !== null).sort((a, b) => (b.pay.median ?? 0) - (a.pay.median ?? 0));
  const [first, second, third] = byPay;
  const noDegree = quiet.filter((r) => !r.pay.degreeUsuallyRequired);
  const withApprenticeship = noDegree.filter((r) => r.pay.apprenticeships.some((a) => a.level <= 5));
  const noDegreeLead =
    noDegree.length === quiet.length
      ? `None of the ${quiet.length} quieter jobs in our main table normally needs a degree`
      : `${noDegree.length} of the ${quiet.length} quieter jobs in our main table do not normally need a degree`;

  const faq = [
    {
      question: "What are the best-paid jobs for introverts in the UK?",
      answer: `Of the quieter jobs on this page, the highest ONS median pay for full-time employees in 2025 was for ${lcFirst(first.pay.title)}s (${formatGBP(first.pay.median ?? 0)}), followed by ${lcFirst(second.pay.title)}s (${formatGBP(second.pay.median ?? 0)}) and ${lcFirst(third.pay.title)}s (${formatGBP(third.pay.median ?? 0)}). The UK median for full-time work was ${formatGBP(UK_FT_MEDIAN)}. These are medians for everyone in the job, so new starters usually earn less.`,
    },
    {
      question: "Which quiet jobs can I do without a degree?",
      answer: `${noDegreeLead}, going by the entry routes ONS and the National Careers Service describe. These have an apprenticeship below degree level: ${withApprenticeship
        .map((r) => lcFirst(r.pay.title))
        .join(", ")}. Driving jobs also need the right licence. Employers can still ask for a degree.`,
    },
    {
      question: "Is being an introvert the same as social anxiety?",
      answer:
        "No. The NHS describes social anxiety disorder as a long-term and overwhelming fear of social situations, and says it is more than shyness: it is a fear that does not go away and affects everyday life, including work. Preferring quiet work is not the same thing. If fear of social situations is affecting your work, the NHS suggests seeing a GP, and in England you can also refer yourself to an NHS talking therapies service.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Jobs for introverts" }]} />}
        kicker="Finding the right fit"
        title={H1}
        intro={
          <p>
            There is no official list of introvert jobs. What most people mean is work with long stretches of focused
            time, communication mostly in writing or one to one, and fewer meetings. The jobs below tend to have those
            features, from data analyst to train driver. Pay is the ONS median for full-time employees in 2025; the UK
            figure was {formatGBP(UK_FT_MEDIAN)}.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "what-to-look-for", label: "What makes a job quieter" },
          { id: "jobs", label: "Quieter jobs and their pay" },
          { id: "emotional-labour", label: "If emotional labour wears you out" },
          { id: "job-hunting", label: "Job hunting without the small talk" },
        ]}
      />

      <GuideSection id="what-to-look-for" title="What makes a job easier for an introvert">
        <Prose>
          <p>Job titles tell you less than the way a team works. Look for:</p>
          <ul>
            <li>
              <strong>Time for focused work.</strong> Blocks of the day without meetings or constant messages.
            </li>
            <li>
              <strong>Written communication.</strong> Teams that use tickets, shared documents and email rather than
              quick calls for everything.
            </li>
            <li>
              <strong>Planned contact.</strong> Meetings and client calls that are booked, with an agenda, rather than
              open-ended.
            </li>
            <li>
              <strong>Small teams</strong> where you know who you are working with.
            </li>
            <li>
              <strong>Some control over where you work</strong>, such as hybrid or home working.
            </li>
          </ul>
          <p>
            Be realistic about the trade-offs. Almost every job has some meetings, and moving into management usually
            means more time with people, not less. The same job can feel very different from one employer to the next,
            so ask how the team works before you accept an offer.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="jobs"
        title="Quieter jobs and what they pay"
        intro={
          <p>
            Our own selection, grouped by type of work. The notes on why each can suit are our judgement, not research
            findings; pay and routes in come from ONS and Skills England.
          </p>
        }
      >
        <DataTable<Row>
          caption="Quieter jobs with UK median pay and the way in"
          description="Median gross annual pay for full-time employees in 2025, for the whole ONS occupation group."
          rowKey={(r) => r.pay.id}
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: jobCell },
            { key: "why", header: "Why it can suit" },
            { key: "median", header: "Median pay", numeric: true, render: (r) => payCell(r.pay) },
            { key: "route", header: "Way in", render: (r) => <RouteList occupations={[r.pay]} /> },
          ]}
          rows={quiet}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <ApprenticeshipSourceNote />
              <SourceNote
                label="Train driver entry"
                source="ONS, SOC 2020 Volume 1: structure and descriptions of unit groups (unit group 8231)"
                href={SOC_SOURCE.pageUrl}
                note={SOC_SOURCE.attribution}
              />
            </div>
          }
          notes="The pay figure covers everyone ONS codes to that occupation group, most of them experienced, so a new starter usually earns less. It leaves out the self-employed."
        />
      </GuideSection>

      <GuideSection
        id="emotional-labour"
        title="If constant emotional labour is what wears you out"
        intro={
          <p>
            Some people do not mind being around others. What drains them is a job where they deal with distress,
            anger or crisis all day. That is a different problem from introversion, and it points to different choices.
          </p>
        }
      >
        <Prose>
          <p>
            It is worth knowing where stress at work is most reported. The Health and Safety Executive&apos;s 2025
            statistics show that over 2022/23 to 2024/25, work-related stress, depression or anxiety was most prevalent in
            public administration and defence, human health and social work, and education. Health professionals,
            teaching professionals, health and social care associate professionals and protective service occupations
            all had rates statistically higher than the average for all jobs. So did business and public service
            associate professionals, a group that includes careers advisers, trainers and clinical coders.
          </p>
          <p>
            HSE&apos;s figures on causes point mainly to workload, including tight deadlines and too much
            responsibility, although that breakdown comes from older survey years (2009/10 to 2011/12). Moving away
            from crisis work will not on its own make a job low-stress.
          </p>
          <p>
            That does not mean leaving people-focused work behind. The jobs below still help people or public services,
            but with more structure, contact that is mostly planned, or distance from the front line. Every one of them
            has hard days, so talk to people who do the job before you commit.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source="HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025"
          href={HSE_STRESS}
          published="2025-11-20"
          note="Self-reported rates from the Labour Force Survey, averaged over 2022/23 to 2024/25; causes averaged over 2009/10 to 2011/12."
        />
        <DataTable<Row>
          className="mt-8"
          caption="People-focused jobs with less crisis work"
          description="Median gross annual pay for full-time employees in 2025, for the whole ONS occupation group."
          rowKey={(r) => r.pay.id}
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: jobCell },
            { key: "why", header: "Why it can suit" },
            { key: "median", header: "Median pay", numeric: true, render: (r) => payCell(r.pay) },
            { key: "route", header: "Way in", render: (r) => <RouteList occupations={[r.pay]} /> },
          ]}
          rows={calmer}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <ApprenticeshipSourceNote />
            </div>
          }
        />
        <Prose className="mt-8">
          <p>
            Whichever job you choose, it is reasonable to ask at interview how the team supports staff after difficult
            cases, how big caseloads are, and whether anyone is expected to answer messages out of hours.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="job-hunting" title="Job hunting without the small talk">
        <Prose>
          <ul>
            <li>
              <strong>Put the effort into written applications.</strong> A clear CV and a tailored cover letter do a
              lot of the work before you ever speak to anyone.
            </li>
            <li>
              <strong>Prepare interview examples in advance.</strong> Write down four or five short stories from past
              work (the situation, what you did, what happened) so you are not thinking on the spot.
            </li>
            <li>
              <strong>Ask how the team works.</strong> &ldquo;How does the team communicate day to day?&rdquo; and
              &ldquo;How much of the week is meetings?&rdquo; tell you more than the job title.
            </li>
            <li>
              <strong>Build contacts in writing.</strong> A short, specific message to someone doing the job you want is
              often easier than a networking event, and people are more likely to reply to a clear question.
            </li>
          </ul>
          <p>
            If anxiety rather than preference is holding you back, the law may help. A mental health condition that
            has a substantial and long-term effect on your daily life can count as a disability under the{" "}
            <a href={DISABILITY_DEFINITION} className="link" rel="noopener">
              Equality Act 2010
            </a>
            , and your employer must then make reasonable adjustments. GOV.UK&apos;s own example of a{" "}
            <a href={ADJUSTMENTS} className="link" rel="noopener">
              reasonable adjustment
            </a>{" "}
            is letting someone with social anxiety disorder have their own desk instead of hot-desking. The{" "}
            <a href={NHS_SOCIAL_ANXIETY} className="link" rel="noopener">
              NHS page on social anxiety
            </a>{" "}
            explains how to get help.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See which quieter jobs fit your experience"
        body={
          <p>
            Paste your CV or type the job you do now. We show the skills you already have, the jobs they lead to and
            what they pay. It is free and you do not need an account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/work-from-home-jobs", label: "Work from home jobs" },
          { href: "/low-stress-jobs-uk", label: "Lower-stress jobs in the UK" },
          { href: "/best-jobs-for-work-life-balance", label: "Jobs with a better work-life balance" },
          { href: "/jobs-for-people-with-adhd", label: "Jobs for people with ADHD", note: "What to look for, and the support you can get" },
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ]}
      />
    </GuideShell>
  );
}
