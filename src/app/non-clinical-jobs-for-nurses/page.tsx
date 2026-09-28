import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  SourceNote,
  ToolCallout,
  formatGBP,
  type FaqItem,
} from "@/components/content";
import {
  ArticleJsonLd,
  FactList,
  FundedTraining,
  HubPage,
  HubPayTable,
  HubRouteCards,
  HubSection,
  MethodNote,
  OnThisPage,
  RelatedLinks,
  SourcesList,
  ASHE,
  ftMedian,
  countWord,
  gbpFt,
  resolveRoutes,
  type Fact,
  type RouteSpec,
} from "@/components/hubs";

const PATH = "/non-clinical-jobs-for-nurses";
const UPDATED = "2026-09-28";
const TITLE = "Non-clinical jobs for nurses in the UK: 15 routes and what they pay";
const DESCRIPTION =
  "Non-clinical jobs for nurses and NHS staff with ONS pay, Agenda for Change bands for 2026/27, what leaving practice means for your NMC registration, and funded retraining.";

export const metadata: Metadata = {
  title: { absolute: "Non-Clinical Jobs for Nurses UK: 15 Routes and What They Pay" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

/* Source job: ONS SOC 2020 2237 "Other registered nursing professionals", the largest nursing group. */
const NURSE = "2237";

const NMC_STATS = "https://www.nmc.org.uk/about-us/reports-and-accounts/registration-statistics/";
const NMC_HOURS = "https://www.nmc.org.uk/revalidation/requirements/practice-hours/";
const NMC_FEE = "https://www.nmc.org.uk/registration/your-registration/paying-your-fee/";
const NMC_RETURN = "https://www.nmc.org.uk/registration/returning-to-the-register/";
const AFC = "https://www.nhsemployers.org/articles/pay-scales-202627";
const HC_CODING =
  "https://www.healthcareers.nhs.uk/explore-roles/digital-data-and-informatics/roles-digital-data-informatics/patient-record-and-coding";
const HC_INFORMATICS =
  "https://www.healthcareers.nhs.uk/explore-roles/digital-data-and-informatics/roles-digital-data-informatics/clinical-informatics";
const HC_CLIN_MANAGER = "https://www.healthcareers.nhs.uk/explore-roles/management/roles-management/clinical-manager";
const NIHR_GCP = "https://www.nihr.ac.uk/career-development/clinical-research-courses-and-support/good-clinical-practice";
const HSE_STRESS = "https://www.hse.gov.uk/Statistics/assets/docs/stress.pdf";

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

const USE_REGISTRATION: RouteSpec[] = [
  {
    id: "occupational-health-nurse-adviser",
    why: "Fitness-for-work assessments, health surveillance and advice to managers on adjustments all rely on clinical judgement, away from ward shifts.",
    note: "The National Careers Service says you need NMC registration, and registered nurses can take the Specialist Community Public Health Nurse degree apprenticeship, which takes up to 2 years.",
    jobsQuery: "occupational health nurse",
  },
  {
    id: "clinical-research-associate",
    why: "Trials depend on informed consent, accurate source records and spotting adverse events. Nurses already do all three, to an audit standard.",
    note: "The NIHR offers free Good Clinical Practice (GCP) training for people supporting research delivery in the UK.",
  },
  {
    id: "nurse-lecturer",
    why: "If you enjoy supervising students and new starters, lecturing makes that the main job, and your practice experience is what you teach from.",
    note: "The National Careers Service says lecturers usually need a master's or PhD, or to be working towards one, and take a teaching qualification after starting.",
    aiSlug: "university-lecturer",
  },
];

const MANAGE_SERVICES: RouteSpec[] = [
  {
    id: "health-service-manager",
    why: "Ward and team leaders already run rotas, budgets, incident reviews and recruitment. Service management does the same across a department or pathway.",
    note: "NHS Health Careers says a career in clinical management typically starts at Agenda for Change band 6 or 7. The National Careers Service lists the NHS graduate management scheme, usually with a 2:1 degree or above.",
    aiSlug: "nhs-administrator",
  },
  {
    id: "gp-practice-manager",
    why: "You know how appointments, recalls, prescriptions and complaints work from the clinical side, and a practice manager runs all of them.",
    note: "The National Careers Service says you could start as an assistant office manager in a health centre or hospital and work your way up.",
  },
  {
    id: "clinical-coder",
    why: "Coding turns clinical notes into standard classifications. Knowing anatomy, procedures and abbreviations gives nurses a genuine head start.",
    note: "NHS Health Careers lists clinical coders at Agenda for Change band 4 and senior clinical coders at band 5 or 6. Band 4 pays £28,392 to £31,157 in 2026/27, so the first step is usually a pay cut.",
  },
  {
    id: "pals-officer",
    why: "Calming worried relatives, resolving complaints and knowing who to call in a hospital are everyday nursing skills, and this job is built on them.",
    jobsQuery: "PALS officer",
  },
];

const HEALTH_ADJACENT: RouteSpec[] = [
  {
    id: "health-and-safety-adviser",
    why: "Risk assessment, infection prevention and incident reporting are nursing routines, and they are the base of workplace health and safety.",
  },
  {
    id: "medical-sales-representative",
    why: "Clinicians listen to people who understand how wards and practices actually use a product. Targets, travel and selling are the new parts.",
    aiSlug: "sales-representative",
  },
  {
    id: "cbt-therapist",
    why: "Mental health nurses use structured therapeutic conversations every day, and the National Careers Service names mental health nursing as a usual first degree for CBT training.",
    note: "The National Careers Service says you usually need an accredited postgraduate CBT course and experience of mental health work.",
    aiSlug: "mental-health-counsellor",
  },
];

const OUTSIDE_HEALTH: RouteSpec[] = [
  {
    id: "project-manager",
    why: "Rolling out a new pathway, running an audit cycle or moving a ward is project work, with deadlines, risks and people to keep informed.",
    aiSlug: "project-manager",
  },
  {
    id: "data-analyst",
    why: "Audit results, early warning scores and outcome data make more sense to someone who knows what they mean clinically, which is useful in health analytics.",
    aiSlug: "data-analyst",
  },
  {
    id: "training-assessor",
    why: "Assessing students and new starters against competencies is what workplace assessors do in every industry.",
    note: "The National Careers Service says you need a level 3 qualification in the work you assess plus an assessing qualification, such as the Level 3 Award in Assessing Competence in the Work Environment.",
  },
  {
    id: "policy-officer",
    why: "Nurses who have worked on guidelines, audit or patient safety bring front-line evidence to health policy work in government, the NHS and charities.",
    aiSlug: "civil-servant",
  },
  {
    id: "social-worker",
    why: "Safeguarding, discharge planning and family meetings overlap with adult and children's social work, which is statutory casework with its own registration.",
    note: "The National Careers Service says a postgraduate social work degree normally takes 2 years if you already have a degree.",
    aiSlug: "social-worker",
  },
];

const GROUPS = [
  {
    id: "use-your-registration",
    title: "Build directly on nursing practice",
    intro: "Whether the hours count towards NMC revalidation depends on how far the job relies on your nursing knowledge. The NMC section below explains the rule.",
    specs: USE_REGISTRATION,
  },
  {
    id: "run-services",
    title: "Run and support health services",
    intro: "Non-clinical NHS and GP roles. Pay ranges from well below band 5 (clinical coding at band 4) to well above it (service management).",
    specs: MANAGE_SERVICES,
  },
  {
    id: "health-adjacent",
    title: "Health-related work outside the NHS",
    intro: "Employers here value clinical knowledge but do not need you to hold a nursing post.",
    specs: HEALTH_ADJACENT,
  },
  {
    id: "outside-health",
    title: "Out of healthcare altogether",
    intro: "Roles where nursing is the background rather than the job. Expect to show new tools or methods as well as clinical experience.",
    specs: OUTSIDE_HEALTH,
  },
];

const ALL_SPECS = GROUPS.flatMap((g) => g.specs);

/* Agenda for Change 2026/27 (NHS Employers, effective 1 April 2026) with example non-clinical roles from NHS Health Careers. */
interface BandRow {
  band: string;
  entry: number;
  top: number;
  roles: string;
}
const AFC_ROWS: BandRow[] = [
  { band: "Band 2", entry: 25272, top: 25272, roles: "Health records operative; ward clerk (band 2 or 3)" },
  { band: "Band 3", entry: 25760, top: 27476, roles: "Inpatient or outpatient booking clerk" },
  { band: "Band 4", entry: 28392, top: 31157, roles: "Clinical coder; health records team leader" },
  { band: "Band 5", entry: 32073, top: 39043, roles: "Some clinical management roles start here" },
  { band: "Band 6", entry: 39959, top: 48117, roles: "Senior clinical coder (band 5 or 6); entry-level clinical informatics; clinical management often starts here or at 7" },
  { band: "Band 7", entry: 49387, top: 56515, roles: "Patient record and coding service manager; clinical management" },
  { band: "Band 8a", entry: 57528, top: 64750, roles: "Patient services manager (listed as band 8, sub-band not stated)" },
  { band: "Band 8b", entry: 66582, top: 77368, roles: "Senior clinical informatics roles (8b and above)" },
];

export default function NursesHubPage() {
  const nurse = ftMedian(NURSE) as number;
  const routes = resolveRoutes(ALL_SPECS);
  const higher = routes.filter((r) => r.basis === "ft" && r.median !== null && r.median > nurse);
  const top = [...routes].filter((r) => r.basis === "ft").sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0];

  const facts: Fact[] = [
    {
      figure: "30,323",
      text: "people left the NMC register in the year to March 2026, 5.3% more than the year before.",
      source: "NMC, The NMC Register 1 April 2025 to 31 March 2026",
      href: NMC_STATS,
      published: "page updated 29 July 2026",
    },
    {
      figure: "Top 3",
      text: "reasons for leaving in the NMC leavers' survey have stayed the same over time: retirement, physical or mental health, and burnout or exhaustion.",
      source: "NMC, The NMC Register 1 April 2025 to 31 March 2026",
      href: NMC_STATS,
      published: "page updated 29 July 2026",
    },
    {
      figure: gbpFt(NURSE),
      text: (
        <>
          ONS median full-time pay for registered nurses in the largest nursing group (SOC 2237), tax year to April 2025.
          Mental health nurses: {gbpFt("2235")}. The pay changes on this page use {gbpFt(NURSE)}.
        </>
      ),
      source: ASHE.short,
      href: ASHE.href,
      published: ASHE.published,
    },
    {
      figure: "£32,073 to £48,117",
      text: "the Agenda for Change range across bands 5 and 6 from 1 April 2026. Band 7 runs from £49,387 to £56,515.",
      source: "NHS Employers, Pay scales for 2026/27",
      href: AFC,
      published: "2026-02-12",
    },
    {
      figure: "450 hours",
      text: "of practice over the three years since you last renewed are needed to revalidate as a nurse. Teaching, managing teams and running a care service can count.",
      source: "NMC, Revalidation: practice hours",
      href: NMC_HOURS,
      published: "page last updated 26 May 2021",
    },
    {
      figure: "2,830",
      text: "workers per 100,000 in human health and social work reported work-related stress, depression or anxiety (2022/23 to 2024/25), against 2,040 across all industries.",
      source: "HSE, Work-related stress, depression or anxiety statistics, 2025",
      href: HSE_STRESS,
      published: "2025-11-20",
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: "What non-clinical jobs can nurses do?",
      answer: `Some keep your registration in use, such as occupational health, clinical research and nurse lecturing. Others are non-clinical NHS roles, such as service management, clinical coding and patient advice (PALS). Outside health, nurses move into health and safety, project management, data analysis, training and policy. This page lists 15 with ONS pay: ${higher.length} have a higher full-time median than the ${formatGBP(nurse)} registered nurse median (ONS ASHE 2025).`,
    },
    {
      question: "What is the best-paid non-clinical job for a nurse?",
      answer: `Of the 15 routes here, ${top.title.toLowerCase()} has the highest ONS full-time median at ${formatGBP(top.median as number)}, against ${formatGBP(nurse)} for registered nurses (ONS ASHE 2025). Project management is close behind. A median covers everyone in the job, including people with years of experience, so it is not a starting salary.`,
    },
    {
      question: "Do I lose my NMC registration if I leave nursing?",
      answer:
        "Not straight away. Your registration continues while you pay the annual fee and revalidate every three years. To revalidate you need 450 practice hours in that period, in work that relies on your skills and knowledge as a nurse. If you do not have the hours, the NMC says you must complete an approved return to practice programme or a Test of Competence before you renew.",
    },
    {
      question: "Do non-clinical jobs count towards NMC revalidation?",
      answer:
        "Some do. The NMC says practice hours are those in which you rely on your skills, knowledge and experience as a registered nurse, and they can include managing teams, teaching others and helping to shape or run a care service. A job that does not use your nursing knowledge at all, such as data analysis in another industry, is unlikely to count. Check your own role against the NMC guidance.",
    },
    {
      question: "How much does NMC registration cost?",
      answer:
        "The annual fee is £120. The NMC says it rises to £143 from 1 October 2026: if your payment notification arrives after that date, you pay £143.",
    },
    {
      question: "What band is a clinical coder in the NHS?",
      answer:
        "NHS Health Careers lists clinical coders at Agenda for Change band 4 and senior clinical coders at band 5 or 6. Band 4 pays £28,392 to £31,157 from 1 April 2026 (NHS Employers). The Skills England clinical coder apprenticeship is level 3 and typically 18 months.",
    },
    {
      question: "What are the Agenda for Change pay bands for 2026/27?",
      answer:
        "From 1 April 2026, band 4 runs from £28,392 to £31,157, band 5 from £32,073 to £39,043, band 6 from £39,959 to £48,117, band 7 from £49,387 to £56,515 and band 8a from £57,528 to £64,750 (NHS Employers, published 12 February 2026). These are basic salaries before any high cost area supplement.",
    },
    {
      question: "Can a nurse become a clinical research associate?",
      answer: `Yes, and it is one of the closest matches. The NIHR offers free Good Clinical Practice training for people supporting research delivery. ONS codes clinical research associates with biochemists and biomedical scientists, where the full-time median was ${gbpFt("2113")} (ONS ASHE 2025), so treat that as a guide to the group rather than the job.`,
    },
    {
      question: "Are there non-clinical NHS jobs that pay more than band 5?",
      answer:
        "Yes. NHS Health Careers says clinical management usually starts at band 6 or 7, entry-level clinical informatics roles typically start at band 6, and senior clinical coders sit at band 5 or 6. Band 6 starts at £39,959 in 2026/27 (NHS Employers).",
    },
    {
      question: "Can nurses work from home?",
      answer:
        "It depends on the employer and the role, and we have no reliable figure for how many nursing jobs are remote. Search current remote and hybrid vacancies on our jobs page to see what employers are advertising now.",
    },
    {
      question: "Can a nurse become a lecturer?",
      answer: `Yes. The National Careers Service says higher education lecturers usually need a master's or PhD, or to be working towards one, and take a teaching qualification after starting. The ONS full-time median for higher education teaching professionals was ${gbpFt("2311")} (ONS ASHE 2025).`,
    },
    {
      question: "Can a nurse become a social worker?",
      answer:
        "Yes, with a new qualification and registration. The National Careers Service says a postgraduate social work degree normally takes 2 years for people with a degree in another subject, and a bursary may be available. In England you register with Social Work England.",
    },
    {
      question: "Can I retrain for free?",
      answer:
        "In England, often yes. Skills Bootcamps are free courses of up to 16 weeks for adults aged 19 and over, with a guaranteed job interview at the end. Apprenticeships have no upper age limit, you can already hold a degree, and your employer and provider cannot charge you for the training. The NIHR's Good Clinical Practice training is also free.",
    },
    {
      question: "Can I go back to nursing later?",
      answer:
        "Yes. The NMC has a process for returning to the register. If you have not met the practice hours, you complete an approved return to practice programme or a Test of Competence first.",
    },
    {
      question: "How many nurses are leaving the NMC register?",
      answer:
        "30,323 people left the NMC register in the year to March 2026, up 5.3% on the year before, while 41,542 joined. The register reached a record 867,935 people (NMC, 2026).",
    },
    {
      question: "Is nursing more stressful than other jobs?",
      answer:
        "HSE's figures put human health and social work at 2,830 cases of work-related stress, depression or anxiety per 100,000 workers over 2022/23 to 2024/25, against 2,040 for all industries. Health professionals and health and social care associate professionals both had statistically higher rates than average (HSE, November 2025).",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Leaving your job", href: "/careers-for" }, { name: "Non-clinical jobs for nurses" }]} />
        }
        kicker="Leaving nursing, or leaving the ward"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            30,323 people left the NMC register in the year to March 2026, and burnout is one of the three most common
            reasons (NMC, 2026). Below are 15 non-clinical routes with ONS pay for each. {countWord(higher.length)} pay more than the{" "}
            {formatGBP(nurse)} median for registered nurses (ONS ASHE 2025), and three build directly on nursing practice.
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#in-numbers", label: "Leaving nursing in numbers" },
            { href: "#at-a-glance", label: "15 routes at a glance" },
            { href: "#routes", label: "Each route in detail" },
            { href: "#nmc", label: "What happens to your NMC registration" },
            { href: "#nhs-bands", label: "Non-clinical NHS jobs by band" },
            { href: "#funded", label: "Free and funded retraining" },
            { href: "#faq", label: "Common questions" },
            { href: "#method", label: "How we worked this out" },
          ]}
        />
      </PageHeader>

      <HubSection
        id="in-numbers"
        title="Leaving nursing in numbers"
        intro={
          <p>
            The figures behind the decision, each from the body that publishes it. ONS pay and NHS pay bands measure
            different things: ONS reports what full-time employees in a job group earned over a year, while the bands
            are basic salaries.
          </p>
        }
      >
        <FactList facts={facts} />
      </HubSection>

      <ToolCallout
        current="nurse"
        heading="Leaving nursing? See where your own experience fits"
        body={
          <p>
            Paste your CV and get a free analysis of the skills you already have and which of these routes they point to.
            No account, and nothing to pay.
          </p>
        }
        className="mt-12"
      />

      <HubSection
        id="at-a-glance"
        title="15 non-clinical routes at a glance"
        intro={
          <p>
            Pay changes compare each job&apos;s ONS full-time median with the {formatGBP(nurse)} median for registered
            nurses in SOC 2237, the largest nursing group. Specialist nurses ({gbpFt("2233")}) and nurse practitioners (
            {gbpFt("2234")}) earn more at the median, so the change for you may be smaller.
          </p>
        }
      >
        <HubPayTable
          caption="Where nurses can go, and what it pays"
          description="Median gross annual pay for full-time employees, UK, tax year to April 2025."
          routes={routes}
          comparator={{ header: "Change vs registered nurse", mobileLabel: "vs nurse", value: nurse }}
        />
      </HubSection>


      <HubSection
        id="routes"
        title="Each route in detail"
        intro={
          <p>
            For each job: why nursing skills carry over, the realistic way in, whether you need a degree, and the ONS
            figure with its caveats. Several of these jobs sit in broad ONS groups, and the cards say so.
          </p>
        }
      >
        {GROUPS.map((g) => (
          <div key={g.id} id={g.id} className="mt-10 scroll-mt-24">
            <h3 className="font-sans text-2xl font-bold text-ink">{g.title}</h3>
            <p className="mt-2 max-w-reading text-ink-2">{g.intro}</p>
            <HubRouteCards
              routes={routes.filter((r) => g.specs.some((s) => s.id === r.id))}
              from="Registered nurse"
              fromPay={nurse}
              headingLevel={4}
            />
          </div>
        ))}
      </HubSection>

      <HubSection
        id="nmc"
        title="What happens to your NMC registration"
        intro={
          <>
            <p>
              Leaving the ward does not end your registration, but it changes how you keep it. The NMC asks for{" "}
              <strong>450 practice hours</strong> over the three years since you last renewed or joined. The hours that
              count are those in which you rely on your skills, knowledge and experience as a registered nurse. The NMC
              says this can include managing teams, teaching others and helping to shape or run a care service, not only
              direct patient care.
            </p>
            <p>
              So the question for each job is simple: does it rely on you being a nurse? Occupational health, clinical
              research, nurse lecturing and many service management roles do. Clinical coding, PALS and roles outside
              health may not. If you do not have the hours when you renew, the NMC says you must complete an approved
              return to practice programme or a Test of Competence first.
            </p>
            <p>
              The annual fee is £120, rising to £143 for payment notifications sent after 1 October 2026. If you are
              unsure whether you will return, weigh that fee against the cost and time of a return to practice programme
              later. The NMC also has a process for{" "}
              <a href={NMC_RETURN} rel="noopener">
                returning to the register
              </a>
              .
            </p>
          </>
        }
      >
        <div className="mt-4 space-y-1">
          <SourceNote source="NMC, Revalidation: practice hours" href={NMC_HOURS} published="page last updated 26 May 2021" />
          <SourceNote source="NMC, Paying your annual fee" href={NMC_FEE} published="checked 28 September 2026" />
        </div>
      </HubSection>

      <HubSection
        id="nhs-bands"
        title="Non-clinical NHS jobs and their Agenda for Change bands"
        intro={
          <p>
            If you want to stay in the NHS but leave clinical work, the band matters more than the job title. This table
            puts the 2026/27 pay scales next to the non-clinical roles NHS Health Careers places in each band. Band 5 is
            included for comparison.
          </p>
        }
      >
        <DataTable<BandRow>
          caption="Agenda for Change pay from 1 April 2026, with example non-clinical roles"
          description="Basic annual pay, entry and top points. High cost area supplements are extra."
          rowKey={(r) => r.band}
          rows={AFC_ROWS}
          columns={[
            { key: "band", header: "Band", rowHeader: true },
            { key: "entry", header: "Entry", numeric: true, format: "gbp" },
            { key: "top", header: "Top", numeric: true, format: "gbp" },
            { key: "roles", header: "Example non-clinical roles (NHS Health Careers)", mobileLabel: "Examples" },
          ]}
          source={
            <SourceNote label="Sources" source="NHS Employers, Pay scales for 2026/27" href={AFC} published="2026-02-12" />
          }
          notes={
            <>
              <p>
                Role examples: NHS Health Careers pages on{" "}
                <a href={HC_CODING} className="link" rel="noopener">
                  patient record and coding services
                </a>
                ,{" "}
                <a href={HC_INFORMATICS} className="link" rel="noopener">
                  clinical informatics
                </a>{" "}
                and{" "}
                <a href={HC_CLIN_MANAGER} className="link" rel="noopener">
                  clinical management
                </a>
                , checked 28 September 2026. Search current posts on{" "}
                <a href="https://www.jobs.nhs.uk/" className="link" rel="noopener">
                  NHS Jobs
                </a>
                .
              </p>
            </>
          }
        />
      </HubSection>

      <HubSection id="funded" title="Free and funded ways to retrain">
        <FundedTraining
          lead={
            <p>
              A nursing degree does not stop you starting an apprenticeship, and several NHS apprenticeships, such as
              clinical coding, are listed on the route cards above. For research roles, start with the{" "}
              <a href={NIHR_GCP} rel="noopener">
                NIHR&apos;s free Good Clinical Practice training
              </a>
              . These are the schemes for England; Scotland, Wales and Northern Ireland run their own.
            </p>
          }
          bootcampFit="Subjects include digital skills such as data, health and social care, and business skills such as project management."
        />
      </HubSection>

      <ToolCallout
        id="check-your-options-2"
        current="nurse"
        heading="Not sure which route fits you?"
        body={
          <p>
            Tell us your specialty, or paste your CV, and see which of these jobs your experience points to, with the gaps
            to close for each.
          </p>
        }
        className="mt-14"
      />

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            Pay changes compare each job&apos;s full-time median with the ONS full-time median for SOC 2237 &quot;Other
            registered nursing professionals&quot;, {formatGBP(nurse)}, the largest nursing group in ASHE. ONS reports what
            employees earned over a year, while Agenda for Change bands are basic pay, so the two are shown side by side
            but never subtracted from each other.
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional)", href: ASHE.href, date: "published 23 October 2025" },
          { name: "NMC, Registration data reports: The NMC Register 1 April 2025 to 31 March 2026", href: NMC_STATS, date: "page updated 29 July 2026" },
          { name: "NMC, Revalidation: practice hours", href: NMC_HOURS, date: "page last updated 26 May 2021" },
          { name: "NMC, Paying your annual fee", href: NMC_FEE, date: "checked 28 September 2026" },
          { name: "NMC, Returning to the register", href: NMC_RETURN, date: "checked 28 September 2026" },
          { name: "NHS Employers, Pay scales for 2026/27", href: AFC, date: "published 12 February 2026, effective 1 April 2026" },
          { name: "NHS Health Careers, Patient record and coding services", href: HC_CODING, date: "checked 28 September 2026" },
          { name: "NHS Health Careers, Clinical informatics", href: HC_INFORMATICS, date: "checked 28 September 2026" },
          { name: "NHS Health Careers, Clinical manager", href: HC_CLIN_MANAGER, date: "checked 28 September 2026" },
          { name: "NIHR, Good Clinical Practice (GCP)", href: NIHR_GCP, date: "checked 28 September 2026" },
          { name: "HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025", href: HSE_STRESS, date: "published 20 November 2025" },
          { name: "National Careers Service job profiles (routes and requirements for each job)", href: "https://nationalcareers.service.gov.uk/job-profiles/occupational-health-nurse", date: "retrieved 28 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?current=nurse", label: "Analyse my CV", note: "Free, no account: see which routes your experience fits." },
          { href: "/jobs?q=non%20clinical%20nurse", label: "Live non-clinical nursing jobs", note: "Search current UK vacancies." },
          { href: "/jobs?q=remote%20nurse", label: "Remote and hybrid nursing jobs", note: "See what employers advertise now." },
          { href: "/transferable-skills", label: "Transferable skills", note: "How to describe clinical skills to other employers." },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree" },
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "/career-change-at-50", label: "Career change at 50" },
          { href: "https://aicareerswap.com/will-ai-replace/nurse", label: "Will AI replace nurses?", note: "Our sister site on AI and nursing." },
          { href: "/careers-for", label: "Career change from other jobs", note: "Doctors, pharmacists, paramedics and more." },
        ]}
      />
      <p className="mt-8 text-sm text-muted">
        Looking at clinical roles instead? See <Link href="/careers-for#paramedics" className="link">paramedics</Link> and{" "}
        <Link href="/careers-for#doctors" className="link">doctors</Link> on our career change by profession page.
      </p>
    </HubPage>
  );
}
