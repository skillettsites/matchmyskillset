import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, FaqSection, PageHeader, SourceNote, ToolCallout, type FaqItem } from "@/components/content";
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
  countWord,
  ftMedian,
  gbpFt,
  resolveRoutes,
  type Fact,
  type RouteSpec,
} from "@/components/hubs";
import { assertHubRoutes } from "@/lib/skills/families";
import { formatGBP } from "@/components/content";
import { titleInSentence } from "@/lib/text";

const PATH = "/career-change-from-teaching";
const UPDATED = "2026-09-28";
const TITLE = "Jobs for ex-teachers in the UK: where teachers go and what it pays";
const DESCRIPTION =
  "15 realistic jobs for ex-teachers with ONS pay, the change against a teacher's salary, how to get in, and funded retraining in England. Checked September 2026.";

export const metadata: Metadata = {
  title: { absolute: "Jobs for Ex-Teachers UK: Where Teachers Go and What It Pays" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

/* Source job: ONS SOC 2020 unit groups for classroom teachers. */
const SECONDARY = "2313";
const PRIMARY = "2314";

const DFE_SWF = "https://explore-education-statistics.service.gov.uk/find-statistics/school-workforce-in-england/2025";
const GIT_PAY = "https://getintoteaching.education.gov.uk/life-as-a-teacher/pay-and-benefits/teacher-pay";
const HSE_STRESS = "https://www.hse.gov.uk/Statistics/assets/docs/stress.pdf";
const NASUWT_NOTICE = "https://www.nasuwt.org.uk/advice/conditions-of-service/teachers-notice-periods-resigning-from-your-job.html";
const SOUTHWARK_DATES = "https://education.southwark.gov.uk/assets/attach/6428/Resignation-dates.pdf";
const GIT_VETERANS_FE = "https://getintoteaching.education.gov.uk/funding-and-support/if-youre-a-veteran";
const RETURN_TO_TEACHING = "https://teaching-vacancies.service.gov.uk/jobseeker-guides/return-to-teaching-in-england/return-to-teaching/";
const QTS_GUIDE = "https://www.gov.uk/guidance/qualified-teacher-status-qts";

/* ------------------------------------------------------------------ */
/* Routes, grouped. "why" is our reading of how the skills carry over. */
/* ------------------------------------------------------------------ */

const EDUCATION: RouteSpec[] = [
  {
    id: "school-business-manager",
    why: "You already know how a school spends its budget, staffs its timetable and reports to governors, because you have lived with those decisions. This role runs them.",
  },
  {
    id: "ofsted-inspector",
    why: "Inspection and school improvement are judged on classroom and leadership experience. Lesson observation, curriculum review and writing clear reports are the core of the job.",
    note: "The National Careers Service says you need QTS to inspect schools, and at least 5 years' leadership experience, such as headteacher, to become one of His Majesty's Inspectors.",
  },
  {
    id: "further-education-lecturer",
    why: "The teaching craft is the same. The learners are 16 and over, often adults, and many courses are vocational, so a subject you know well can become the thing you teach.",
    note: "Get Into Teaching says you do not need a degree or QTS to teach in further education.",
  },
  {
    id: "careers-adviser",
    why: "Guiding students through options, applications and UCAS is careers work. This job does it one to one, with young people and adults.",
    note: "The National Careers Service notes that people often take the postgraduate career guidance qualification after working in teaching. It takes 1 year full time or 2 years part time.",
  },
  {
    id: "private-tutor",
    why: "The most direct use of your subject knowledge, with no marking load or behaviour policy, and you can test it alongside your current job before relying on it.",
    note: "ONS pay covers employed tutors only. ASHE says nothing about self-employed tutoring income.",
  },
];

const ADULT_LEARNING: RouteSpec[] = [
  {
    id: "learning-and-development-adviser",
    why: "Planning a sequence of sessions, delivering them to a room and checking what stuck is the job. The audience changes from pupils to staff, and success is measured against business goals instead of exam results.",
    note: "The National Careers Service lists a CIPD-accredited postgraduate qualification among the university routes.",
  },
  {
    id: "learning-and-development-manager",
    why: "Heads of department and senior leaders already run CPD, induction and appraisal for colleagues. L&D management is that leadership role inside a company.",
  },
  {
    id: "e-learning-developer",
    why: "Breaking a topic into short, assessed steps is lesson design. The new parts are authoring software and working to a client brief.",
    jobsQuery: "instructional designer",
  },
];

const PUBLIC_SERVICE: RouteSpec[] = [
  {
    id: "civil-service-executive-officer",
    why: "Casework, fixed deadlines, writing for different readers and applying policy consistently are daily work in both jobs.",
    note: "The National Careers Service says a university qualification is not essential to join the Civil Service.",
    aiSlug: "civil-servant",
    jobsQuery: "civil service executive officer",
  },
  {
    id: "policy-officer",
    why: "You have seen how national education policy lands in a real classroom. Policy teams in government, councils and charities need people who can explain that and write it down clearly.",
    aiSlug: "civil-servant",
  },
];

const ANALYSIS: RouteSpec[] = [
  {
    id: "data-analyst",
    why: "Tracking attainment, spotting which groups are falling behind and presenting it to leaders is data analysis. To move across you would need to show analysis tools as well as that experience.",
    aiSlug: "data-analyst",
  },
  {
    id: "user-researcher",
    why: "Watching how people learn, asking open questions without leading, and noticing where someone gets stuck are the core of user research on digital services.",
    aiSlug: "ux-designer",
  },
  {
    id: "project-manager",
    why: "An exam season, a trip abroad or a new scheme of work are projects with fixed deadlines, budgets, risks and people who need to be kept informed.",
    aiSlug: "project-manager",
  },
];

const FAMILIES: RouteSpec[] = [
  {
    id: "social-worker",
    why: "Safeguarding training, work with families and multi-agency meetings give teachers a head start. The job is statutory casework, so expect a new qualification.",
    note: "The National Careers Service says a postgraduate social work degree normally takes 2 years if you have a degree in another subject, and a social work bursary may be available.",
    aiSlug: "social-worker",
  },
  {
    id: "family-support-worker",
    why: "Pastoral work on attendance, behaviour and home life is the centre of family support, without the teaching timetable.",
  },
];

const GROUPS = [
  {
    id: "stay-in-education",
    title: "Stay in education, out of the classroom",
    intro: "These keep your subject knowledge and school experience in play. One of them, school inspection, requires QTS.",
    specs: EDUCATION,
  },
  {
    id: "adult-learning",
    title: "Teach adults at work",
    intro: "Workplace learning uses the skills teachers use every day. Pay varies widely between adviser and manager level, as the ONS figures show.",
    specs: ADULT_LEARNING,
  },
  {
    id: "public-service",
    title: "Public service and policy",
    intro: "The National Careers Service says a university qualification is not essential to join the Civil Service, and there is a level 4 policy officer apprenticeship.",
    specs: PUBLIC_SERVICE,
  },
  {
    id: "analysis-projects",
    title: "Analysis, research and projects",
    intro: "Project management pays more than teaching at the median; data and research roles pay less. In all three you will need to show the tools or methods, not only the teaching experience behind them.",
    specs: ANALYSIS,
  },
  {
    id: "children-families",
    title: "Work with children and families",
    intro: "For teachers who want to keep working with young people but leave the classroom. Both roles pay less than teaching at the median.",
    specs: FAMILIES,
  },
];

const ALL_SPECS = GROUPS.flatMap((g) => g.specs);
// The matcher boosts these routes for people from this line of work; this keeps the two lists the same.
assertHubRoutes("teachers", ALL_SPECS);

export default function TeachingHubPage() {
  const secondary = ftMedian(SECONDARY) as number;
  const primary = ftMedian(PRIMARY) as number;
  const routes = resolveRoutes(ALL_SPECS);
  const higher = routes.filter((r) => r.basis === "ft" && r.median !== null && r.median > secondary);
  const top = [...routes].filter((r) => r.basis === "ft").sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0];
  const noDegree = routes.filter((r) => !r.degreeUsuallyRequired).length;

  const facts: Fact[] = [
    {
      figure: "38,600",
      text: "full-time-equivalent teachers left state-funded schools in England in 2024/25: 1 in 12 (8.5%) of qualified teachers.",
      source: "DfE, School workforce in England, reporting year 2025",
      href: DFE_SWF,
      published: "2026-06-04",
    },
    {
      figure: "91%",
      text: "of those leavers left for reasons other than retirement, for example a change of career or a move to another UK education sector.",
      source: "DfE, School workforce in England, reporting year 2025",
      href: DFE_SWF,
      published: "2026-06-04",
    },
    {
      figure: gbpFt(SECONDARY),
      text: (
        <>
          ONS median full-time pay for secondary teachers ({gbpFt(PRIMARY)} for primary), tax year to April 2025. The pay
          changes on this page are measured against the secondary figure.
        </>
      ),
      source: ASHE.short,
      href: ASHE.href,
      published: ASHE.published,
    },
    {
      figure: "£34,069 to £52,835",
      text: "the qualified teacher pay range in England outside London from 1 September 2026, after the 3.5% award.",
      source: "Get Into Teaching (DfE), Teacher pay",
      href: GIT_PAY,
      published: "checked 28 September 2026",
    },
    {
      figure: "28.6%",
      text: "employer contribution to the Teachers' Pension Scheme. When you compare a job offer, compare the whole package, not only the salary.",
      source: "Get Into Teaching (DfE), Teacher pay",
      href: GIT_PAY,
      published: "checked 28 September 2026",
    },
    {
      figure: "2,620",
      text: "workers per 100,000 in education reported work-related stress, depression or anxiety (2022/23 to 2024/25), against 2,040 across all industries.",
      source: "HSE, Work-related stress, depression or anxiety statistics, 2025",
      href: HSE_STRESS,
      published: "2025-11-20",
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: "What jobs can ex-teachers do in the UK?",
      answer: `Routes that use teaching skills directly include learning and development, e-learning design, further education, careers advice, school business management and inspection. Others use the organisational side of teaching: civil service casework, policy, data analysis, user research and project management. This page lists 15 with ONS pay for each. Only ${higher.length} have a higher full-time median than secondary teaching (${formatGBP(secondary)}, ONS ASHE 2025).`,
    },
    {
      question: "What is the best-paid job for an ex-teacher?",
      answer: `Of the 15 routes here, ${titleInSentence(top.title)} has the highest ONS full-time median at ${formatGBP(top.median as number)}, against ${formatGBP(secondary)} for secondary teachers (ONS ASHE 2025). Policy work and L&D management are close behind, though their ONS figures cover broad groups that include other jobs. A median covers everyone in the job, including people with years of experience, so it is not a starting salary.`,
    },
    {
      question: "Can a teacher become a civil servant without another degree?",
      answer:
        "Yes. The National Careers Service says a university qualification is not essential to join the Civil Service, and executive officer roles are open to direct application. You will need to pass background checks and meet the nationality rules. The ONS full-time median for national government administrative jobs, which include executive officers, was " +
        `${gbpFt("4111")} in 2025, below the secondary teacher median.`,
    },
    {
      question: "Can I leave teaching without taking a pay cut?",
      answer: `Sometimes, but not usually straight away. ${countWord(higher.length)} of the 15 routes on this page have a higher ONS full-time median than secondary teaching. Most pay less at the median, and every median includes people with years in the job. Remember the Teachers' Pension Scheme employer contribution of 28.6% (DfE) when you compare offers.`,
    },
    {
      question: "How many teachers leave teaching each year?",
      answer:
        "In 2024/25, 38,600 full-time-equivalent teachers left state-funded schools in England, 1 in 12 (8.5%) of qualified teachers and 2,100 fewer than the year before. 91% left for reasons other than retirement (DfE, School workforce in England, published 4 June 2026).",
    },
    {
      question: "When do teachers have to hand in their notice?",
      answer:
        "Under the Burgundy Book, which sets notice periods in local authority maintained schools and which most publicly funded schools follow, the deadlines are 31 October to leave on 31 December, 28 February to leave on 30 April, and 31 May to leave on 31 August. Your contract states your own notice terms, so check it. Your school can agree to release you early but does not have to (NASUWT; Southwark Council schools HR).",
    },
    {
      question: "Do I need a new degree to leave teaching?",
      answer:
        "For most routes on this page, no. You already have a degree, and civil service, L&D, school business management, data and project roles all have documented routes that do not need another one. Social work and cognitive behavioural therapy normally need a new postgraduate qualification (National Careers Service).",
    },
    {
      question: "Is learning and development a good move for teachers?",
      answer: `It is the closest match to what you do now. The pay depends on level: the ONS full-time median was ${gbpFt("3574")} for trainers and L&D advisers, and ${gbpFt("1136")} for the HR managers and directors group that includes L&D managers (ONS ASHE 2025).`,
    },
    {
      question: "Can teachers become instructional designers in the UK?",
      answer:
        "Yes. ONS codes the job as an e-learning developer, inside the same unit group as software developers, so its pay figure describes that whole group and will overstate typical e-learning pay. Skills England has a level 5 Digital learning designer apprenticeship, typically 24 months.",
    },
    {
      question: "Can I retrain for free?",
      answer:
        "In England, often yes. Skills Bootcamps are free courses of up to 16 weeks for adults aged 19 and over, with a guaranteed job interview at the end. Apprenticeships have no upper age limit and your employer and provider cannot charge you for the training. If you earn under £25,750 or are unemployed, Free Courses for Jobs can pay for a level 3 qualification.",
    },
    {
      question: "Can I do an apprenticeship after teaching, at 35 or 45?",
      answer:
        "Yes. GOV.UK's only age rule is that you are 16 or over, you can already have a degree, and you are paid as an employee. Check the pay: employers can pay £8 an hour in the first year of an apprenticeship even if you are over 19 (National Minimum Wage rates, April 2026).",
    },
    {
      question: "Can I teach in a college without QTS?",
      answer:
        "Yes. Get Into Teaching says you do not need a degree or QTS to teach in further education. The Teach in Further Education service says industry experience is not a requirement but can make you a stronger candidate. The Skills England Learning and skills teacher apprenticeship is level 5 and typically 18 months.",
    },
    {
      question: "Can I go back to teaching later?",
      answer:
        "Yes. The Department for Education's Teaching Vacancies service runs a return-to-teaching guide and says schools are interested in recruiting former teachers. QTS is still usually needed to teach in a state school in England, so keep your QTS details and teacher reference number.",
    },
    {
      question: "How long does it take to change career from teaching?",
      answer:
        "It depends on the route. Direct applications, such as civil service or L&D roles, can take as long as a normal job search. A Skills Bootcamp is up to 16 weeks. The level 4 apprenticeships on this page typically take 18 to 24 months while you are paid. A postgraduate social work degree normally takes 2 years, and a career guidance qualification 1 year full time.",
    },
    {
      question: "Are teachers more stressed than other workers?",
      answer:
        "HSE's Labour Force Survey figures put education at 2,620 cases of work-related stress, depression or anxiety per 100,000 workers over 2022/23 to 2024/25, significantly above the 2,040 average for all industries. Teaching and other educational professionals were one of the occupational groups with a statistically higher rate (HSE, November 2025).",
    },
    {
      question: "Is private tutoring a realistic full-time job?",
      answer: `It can be. ONS publishes a full-time median of ${gbpFt("2319")} for the teaching professionals group that includes employed tutors, but ASHE does not cover the self-employed, so it says nothing about what freelance tutors earn. You can test tutoring alongside your current job before relying on it.`,
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Leaving your job", href: "/careers-for" }, { name: "Leaving teaching" }]} />}
        kicker="Leaving teaching"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            About 38,600 full-time-equivalent teachers left England&apos;s state schools in 2024/25, and 91% left for
            reasons other than retirement (DfE, June 2026). Below are 15 realistic next jobs with ONS pay for each. Only{" "}
            {higher.length} pay more than the {formatGBP(secondary)} median for secondary teachers (ONS ASHE 2025), and{" "}
            {noDegree} of the 15 do not usually need a new degree.
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#in-numbers", label: "Leaving teaching in numbers" },
            { href: "#at-a-glance", label: "15 routes at a glance" },
            { href: "#routes", label: "Each route in detail" },
            { href: "#before-you-resign", label: "Before you hand in your notice" },
            { href: "#qts", label: "What QTS is worth outside schools" },
            { href: "#funded", label: "Free and funded retraining" },
            { href: "#faq", label: "Common questions" },
            { href: "#method", label: "How we worked this out" },
          ]}
        />
      </PageHeader>

      <HubSection
        id="in-numbers"
        title="Leaving teaching in numbers"
        intro={
          <p>
            These are the figures that matter when you weigh up a move, each from the body that publishes it. The
            Department for Education&apos;s own median pay for school teachers was £51,048 in November 2025. That is a
            later date and a different source from ONS, so we use ONS on both sides of every pay comparison.
          </p>
        }
      >
        <FactList facts={facts} />
      </HubSection>

      <ToolCallout
        current="teacher"
        heading="Leaving teaching? See where your own experience fits"
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
        title="15 routes out of teaching at a glance"
        intro={
          <p>
            Sorted into five groups below. The pay change compares each job&apos;s ONS full-time median with the{" "}
            {formatGBP(secondary)} median for secondary teachers. For primary teachers ({formatGBP(primary)}), add{" "}
            {formatGBP(secondary - primary)} to each change.
          </p>
        }
      >
        <HubPayTable
          caption="Where teachers can go, and what it pays"
          description="Median gross annual pay for full-time employees, UK, tax year to April 2025."
          routes={routes}
          comparator={{ header: "Change vs secondary teacher", mobileLabel: "vs teacher", value: secondary }}
        />
      </HubSection>


      <HubSection
        id="routes"
        title="Each route in detail"
        intro={
          <p>
            For each job: why teaching skills carry over, the realistic way in, whether you need a degree, and the ONS
            figure with its caveats. Apprenticeship durations are Skills England&apos;s typical figures for England.
          </p>
        }
      >
        {GROUPS.map((g) => (
          <div key={g.id} id={g.id} className="mt-10 scroll-mt-24">
            <h3 className="font-sans text-2xl font-bold text-ink">{g.title}</h3>
            <p className="mt-2 max-w-reading text-ink-2">{g.intro}</p>
            <HubRouteCards
              routes={routes.filter((r) => g.specs.some((s) => s.id === r.id))}
              from="Secondary teacher"
              fromPay={secondary}
              headingLevel={4}
            />
          </div>
        ))}
      </HubSection>

      <HubSection
        id="before-you-resign"
        title="Before you hand in your notice"
        intro={
          <>
            <p>
              Teaching has fixed resignation dates. The Burgundy Book sets notice periods in local authority maintained
              schools, and most publicly funded schools follow it: you give notice by <strong>31 October</strong> to leave
              on 31 December, by <strong>28 February</strong> to leave on 30 April, and by <strong>31 May</strong> to
              leave on 31 August. Miss a date and you may have to wait for the next one, although your school can agree
              to release you sooner. Your contract states your own notice terms, so read it.
            </p>
            <p>
              Two money points are easy to miss. The Teachers&apos; Pension Scheme has an employer contribution of
              28.6%, so a private-sector salary that looks the same may be worth less once the pension is counted. And
              teacher pay is rising: 3.5% from September 2026 and 3% from September 2027, which moves the qualified
              range outside London to £34,069 to £52,835 this year.
            </p>
            <p>
              If you are unsure, test a route before you resign. Tutoring, exam marking, a Skills Bootcamp or a short
              course can run alongside the job, and a live job search on{" "}
              <Link href="/jobs?q=former%20teacher">MatchMySkillset jobs</Link> shows what employers are asking for right
              now.
            </p>
          </>
        }
      >
        <div className="mt-4 space-y-1">
          <SourceNote source="NASUWT, Teachers' notice periods and resigning from your job" href={NASUWT_NOTICE} published="checked 28 September 2026" />
          <SourceNote
            source="Southwark Council schools HR, Teacher resignation dates (Burgundy Book, August 2000 edition)"
            href={SOUTHWARK_DATES}
            published="checked 28 September 2026"
          />
          <SourceNote
            source="Department for Education, Teachers to benefit from multi-year pay deal"
            href="https://www.gov.uk/government/news/teachers-to-benefit-from-multi-year-pay-deal"
            published="2026-07-01"
          />
        </div>
      </HubSection>

      <HubSection
        id="qts"
        title="What QTS is worth outside schools"
        intro={
          <>
            <p>
              Qualified teacher status is usually needed to teach in a state school in England, and the National Careers
              Service says it is needed to inspect schools for Ofsted. Outside those, it is a signal of training rather
              than a requirement.
            </p>
            <ul>
              <li>
                <strong>Further education and early years:</strong> Get Into Teaching says you do not need a degree or
                QTS to teach in either.
              </li>
              <li>
                <strong>Tutoring:</strong> the National Careers Service says you might need QTS if you teach academic
                qualifications, and some agencies ask for it.
              </li>
              <li>
                <strong>Corporate training, civil service, data and projects:</strong> employers look at what you
                delivered, not the letters. Describe outcomes, such as results you moved or staff you trained.
              </li>
              <li>
                <strong>Coming back:</strong> the Department for Education runs a{" "}
                <a href={RETURN_TO_TEACHING} rel="noopener">
                  return-to-teaching guide
                </a>{" "}
                for former teachers.
              </li>
            </ul>
          </>
        }
      >
        <div className="mt-4 space-y-1">
          <SourceNote source="GOV.UK, Qualified teacher status (QTS)" href={QTS_GUIDE} published="checked 28 September 2026" />
          <SourceNote source="Get Into Teaching (DfE), Funding and support if you're a veteran: other routes into teaching" href={GIT_VETERANS_FE} published="checked 28 September 2026" />
        </div>
      </HubSection>

      <HubSection id="funded" title="Free and funded ways to retrain">
        <FundedTraining
          lead={
            <p>
              A degree does not stop you starting an apprenticeship, and most Skills Bootcamps need no previous knowledge
              of the subject. These are the schemes for England; Scotland, Wales and Northern Ireland run their own.
            </p>
          }
          bootcampFit="Subjects include digital skills such as data and marketing, business skills such as project management, and early years. Courses run at colleges, with other training providers or online."
        />
      </HubSection>

      <ToolCallout
        id="check-your-options-2"
        current="teacher"
        heading="Not sure which route fits you?"
        body={
          <p>
            Tell us what you teach, or paste your CV, and see which of these jobs your experience points to, with the gaps
            to close for each.
          </p>
        }
        className="mt-14"
      />

      <FaqSection
        items={faqs}
        intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated."
      />

      <MethodNote
        baseline={
          <>
            Pay changes compare each job&apos;s full-time median with the ONS full-time median for secondary education
            teaching professionals (SOC 2313), {formatGBP(secondary)}. The primary figure (SOC 2314) was{" "}
            {formatGBP(primary)}. We do not mix in the DfE&apos;s £51,048 school teacher median, because it is for a
            later date (November 2025) and a different source.
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional)", href: ASHE.href, date: "published 23 October 2025" },
          { name: "Department for Education, School workforce in England: reporting year 2025", href: DFE_SWF, date: "published 4 June 2026, updated 17 August 2026" },
          { name: "Get Into Teaching (DfE), Teacher pay (amounts from 1 September 2026)", href: GIT_PAY, date: "checked 28 September 2026" },
          { name: "Department for Education, Teachers to benefit from multi-year pay deal", href: "https://www.gov.uk/government/news/teachers-to-benefit-from-multi-year-pay-deal", date: "published 1 July 2026" },
          { name: "HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025", href: HSE_STRESS, date: "published 20 November 2025" },
          { name: "NASUWT, Teachers' notice periods and resigning from your job", href: NASUWT_NOTICE, date: "checked 28 September 2026" },
          { name: "Southwark Council schools HR, Teacher resignation dates (citing the Burgundy Book, August 2000)", href: SOUTHWARK_DATES, date: "checked 28 September 2026" },
          { name: "Get Into Teaching (DfE), Funding and support if you're a veteran (other routes into teaching)", href: GIT_VETERANS_FE, date: "checked 28 September 2026" },
          { name: "National Careers Service job profiles (routes and requirements for each job)", href: "https://nationalcareers.service.gov.uk/job-profiles/careers-adviser", date: "retrieved 28 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?current=teacher#cv", label: "Analyse my CV", note: "Free, no account: see which routes your experience fits." },
          { href: "/jobs?q=former%20teacher", label: "Live jobs for former teachers", note: "Search current UK vacancies." },
          { href: "/transferable-skills", label: "Transferable skills", note: "How to describe teaching skills to other employers." },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree", note: "Useful if you are weighing up apprenticeships." },
          { href: "/highest-paying-careers-uk", label: "Highest-paying careers in the UK", note: "The ONS top of the table, for context." },
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "/career-change-at-50", label: "Career change at 50" },
          { href: "https://aicareerswap.com/will-ai-replace/teacher", label: "Will AI replace teachers?", note: "Our sister site on AI and teaching." },
          { href: "/careers-for", label: "Career change from other jobs", note: "Nursing, policing, the armed forces, retail and more." },
        ]}
      />
    </HubPage>
  );
}
