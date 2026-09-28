import type { Metadata } from "next";
import { Breadcrumbs, FaqSection, PageHeader, SourceNote, ToolCallout, formatGBP, type FaqItem } from "@/components/content";
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
  gbpFt,
  resolveRoutes,
  type Fact,
  type RouteSpec,
} from "@/components/hubs";

const PATH = "/jobs-for-ex-police-officers";
const UPDATED = "2026-09-28";
const TITLE = "Jobs for ex-police officers in the UK: 15 routes and what they pay";
const DESCRIPTION =
  "Where ex-police officers go: 15 civilian jobs with ONS pay, the police pay scale for comparison, SIA and other licences, and funded retraining. Checked September 2026.";

export const metadata: Metadata = {
  title: { absolute: "Jobs for Ex-Police Officers UK: 15 Routes and What They Pay" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

/* Police constable pay scale from 1 September 2025 (Home Office evidence to the PRRB, Annex A). */
const PC_MIN = 31164;
const PC_MAX = 50256;

const HO_WORKFORCE =
  "https://www.gov.uk/government/statistics/police-workforce-england-and-wales-31-march-2026/police-workforce-england-and-wales-31-march-2026";
const HO_PRRB =
  "https://www.gov.uk/government/publications/home-office-evidence-to-the-police-remuneration-review-body-2026-to-2027/home-office-evidence-to-the-police-remuneration-review-body-2026-to-2027-accessible";
const NPCC_PAY = "https://news.npcc.police.uk/releases/government-confirms-police-pay-award";
const ONS_BULLETIN =
  "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025";
const SIA = "https://www.gov.uk/guidance/apply-for-an-sia-licence";
const HSE_STRESS = "https://www.hse.gov.uk/Statistics/assets/docs/stress.pdf";

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

const INVESTIGATION: RouteSpec[] = [
  {
    id: "fraud-investigator",
    why: "Interviewing, handling evidence, building a case file and giving evidence are the job, applied to fraud against an organisation.",
  },
  {
    id: "intelligence-analyst",
    why: "If you have used intelligence reports, briefed a team or worked in CID or an intelligence unit, the analysis side of the work is familiar.",
  },
  {
    id: "cyber-security-analyst",
    why: "Digital evidence, online fraud and harm cases give useful context, but the technical skills are new, so budget real time for training.",
    aiSlug: "cybersecurity-analyst",
  },
  {
    id: "trading-standards-officer",
    why: "Investigating complaints, taking statements and preparing prosecution files, under consumer law instead of criminal law.",
    note: "The National Careers Service says a law degree, or one with consumer protection units, can exempt you from some professional exams, and some councils sponsor trainees.",
  },
];

const SECURITY_RISK: RouteSpec[] = [
  {
    id: "security-manager",
    why: "Incident response, risk assessment, briefing staff and working with the police from the other side of the table.",
    note: "An SIA licence costs £204 from 1 April 2026 and lasts 3 years (Security Industry Authority).",
  },
  {
    id: "border-force-officer",
    why: "Searching, questioning, detaining and giving evidence all carry straight over, inside a uniformed civil service role.",
  },
  {
    id: "compliance-officer",
    why: "Applying rules precisely, recording decisions and spotting when something is off are everyday police habits, and regulated firms need them.",
    aiSlug: "compliance-officer",
  },
  {
    id: "risk-manager",
    why: "Threat and risk assessment, from a missing person to a public order plan, is structured risk management with the vocabulary changed.",
  },
  {
    id: "health-and-safety-adviser",
    why: "Scene safety, dynamic risk assessment and incident reporting translate into workplace health and safety, where NEBOSH and IOSH are the named qualifications.",
  },
];

const JUSTICE: RouteSpec[] = [
  {
    id: "probation-services-officer",
    why: "Assessing risk, working with people on licence and writing reports for court and partner agencies.",
  },
  {
    id: "probation-officer",
    why: "The qualified version of probation work: supervising higher-risk cases and advising courts, built on the same risk and offender management skills.",
    note: "The National Careers Service says you complete the Professional Qualification in Probation (PQiP), which takes 15 to 21 months depending on your degree.",
  },
  {
    id: "safeguarding-officer",
    why: "Child protection referrals, strategy meetings and multi-agency work are core police safeguarding tasks.",
    note: "The National Careers Service says the level 3 Safeguarding support officer apprenticeship takes up to 2 years, with further training for child protection work.",
  },
  {
    id: "legal-executive",
    why: "Case building, disclosure and courtroom experience are a strong base for criminal litigation work in a law firm.",
    note: "The National Careers Service says you register with the Chartered Institute of Legal Executives to start training.",
    aiSlug: "paralegal",
  },
];

const TEACH_DRIVE: RouteSpec[] = [
  {
    id: "secondary-school-teacher",
    why: "Managing a room, explaining rules and consequences, and defusing conflict all carry over to the classroom.",
    note: "You need a degree and QTS to teach in a state school in England. Get Into Teaching lists salaried routes as well as fee-paying ones.",
    aiSlug: "teacher",
  },
  {
    id: "driving-instructor",
    why: "Police driver training is a strong base, but you still take the three approved driving instructor tests like anyone else.",
    note: "The National Careers Service says you pass ADI parts 1 and 2 to get a 6-month trainee licence, then part 3 to qualify, and renew your registration every 4 years.",
  },
];

const GROUPS = [
  {
    id: "investigation",
    title: "Investigation and intelligence",
    intro: "The most direct use of police skills. Expect to add a specialist qualification, such as counter-fraud or trading standards exams, rather than start again.",
    specs: INVESTIGATION,
  },
  {
    id: "security-risk",
    title: "Security, borders and risk",
    intro: "Security managers and Border Force officers share one ONS pay figure with fraud investigators (protective service associate professionals), so compare them on the work, not the number.",
    specs: SECURITY_RISK,
  },
  {
    id: "justice",
    title: "Justice and safeguarding",
    intro: "Staying in the justice system, with a different relationship to the people you work with. Pay is lower at the median than the top of the constable scale.",
    specs: JUSTICE,
  },
  {
    id: "teach-drive",
    title: "Teaching and driving",
    intro: "Two routes with their own qualifications to pass, whatever your police training.",
    specs: TEACH_DRIVE,
  },
];

const ALL_SPECS = GROUPS.flatMap((g) => g.specs);

export default function PoliceHubPage() {
  const routes = resolveRoutes(ALL_SPECS);
  const higher = routes.filter((r) => r.basis === "ft" && r.median !== null && r.median > PC_MAX);
  const top = [...routes].filter((r) => r.basis === "ft").sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0];

  const facts: Fact[] = [
    {
      figure: "9,240",
      text: "full-time-equivalent officers left the 43 territorial forces in England and Wales in the year to 31 March 2026, excluding transfers: a leaver rate of 6.3%.",
      source: "Home Office, Police workforce, England and Wales: 31 March 2026",
      href: HO_WORKFORCE,
      published: "2026-07-22",
    },
    {
      figure: "60.6%",
      text: "of officers who resigned voluntarily had less than 5 years' service. The voluntary resignation rate was 3.2%, the same as the year before.",
      source: "Home Office, Police workforce, England and Wales: 31 March 2026",
      href: HO_WORKFORCE,
      published: "2026-07-22",
    },
    {
      figure: `${formatGBP(PC_MIN)} to ${formatGBP(PC_MAX)}`,
      text: "the constable pay scale from 1 September 2025. The government then announced a 3.5% award for all ranks from September 2026.",
      source: "Home Office evidence to the PRRB 2026 to 2027, Annex A; NPCC",
      href: HO_PRRB,
      published: "2026-03-27",
    },
    {
      figure: "Not published",
      text: "ONS suppressed its 2025 annual pay figures for police officers, sergeant and below, after an error in the returns it received. That is why this page compares with the pay scale instead.",
      source: "ONS, ASHE 2025 correction notice",
      href: ASHE.href,
      published: "2025-12-19",
    },
    {
      figure: "3,470",
      text: "workers per 100,000 in public administration and defence reported work-related stress, depression or anxiety (2022/23 to 2024/25), against 2,040 across all industries.",
      source: "HSE, Work-related stress, depression or anxiety statistics, 2025",
      href: HSE_STRESS,
      published: "2025-11-20",
    },
    {
      figure: "£204",
      text: "for an SIA licence from 1 April 2026, needed for licensable security work such as door supervision and close protection. Licences last 3 years.",
      source: "Security Industry Authority, Apply for an SIA licence (GOV.UK)",
      href: SIA,
      published: "updated 19 June 2026",
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: "What jobs can ex-police officers do in the UK?",
      answer:
        "The closest matches are investigation and intelligence work (fraud investigation, intelligence analysis, trading standards), security and risk (security management, Border Force, compliance, risk management, health and safety), and justice and safeguarding (probation, safeguarding, legal executive work). This page lists 15 with ONS pay for each, plus teaching and driving instruction.",
    },
    {
      question: "What is the best-paid job for an ex-police officer?",
      answer: `Of the 15 routes here, ${top.title.toLowerCase()} has the highest ONS full-time median at ${formatGBP(top.median as number)} (ONS ASHE 2025). ${countWord(higher.length)} of the 15 have a median above the top of the constable scale (${formatGBP(PC_MAX)} from September 2025). A median covers everyone in the job, so it is not a starting salary.`,
    },
    {
      question: "How much does a police constable earn?",
      answer:
        "From 1 September 2025 the constable pay scale ran from £31,164 to £50,256, and sergeants from £53,568 to £56,208 (Home Office evidence to the Police Remuneration Review Body, March 2026). The government announced a 3.5% award for all ranks from September 2026.",
    },
    {
      question: "Why is there no ONS pay figure for police officers?",
      answer:
        "ONS suppressed its 2025 annual earnings estimates for police officers, sergeant and below (SOC 3312), after an error in the returns it received, in a correction dated 19 December 2025. ONS says the figures will be reviewed for the revised 2025 dataset. We compare with the constable pay scale instead, which is basic pay rather than total earnings.",
    },
    {
      question: "How many police officers leave each year?",
      answer:
        "9,240 full-time-equivalent officers left the 43 territorial forces in England and Wales in the year to 31 March 2026, excluding transfers, a leaver rate of 6.3%. The voluntary resignation rate was 3.2%, and 60.6% of those resigning had less than 5 years' service (Home Office, 22 July 2026).",
    },
    {
      question: "Can ex-police officers work in fraud investigation?",
      answer: `Yes, and it is one of the closest matches. Skills England has a level 4 Counter fraud investigator apprenticeship, typically 24 months. ONS pay for the wider protective service group that includes fraud investigators was ${gbpFt("3319")} (ONS ASHE 2025).`,
    },
    {
      question: "Do I need an SIA licence to work in security after the police?",
      answer:
        "For licensable security work, yes. An SIA licence costs £204 from 1 April 2026 and lasts 3 years. For close protection, the National Careers Service says you first complete the Level 3 Certificate for Working as a Close Protection Operative with an SIA-approved provider, plus a close protection first aid qualification.",
    },
    {
      question: "Can a police officer become a teacher?",
      answer:
        "Yes, if you have a degree. You need QTS to teach in a state school in England, and there are salaried as well as fee-paying teacher training routes. Skills England's Teacher (postgraduate) apprenticeship is level 6. The ONS full-time median for secondary teachers was " +
        `${gbpFt("2313")} (ONS ASHE 2025).`,
    },
    {
      question: "Can ex-police officers become probation officers?",
      answer: `Yes. The National Careers Service says you complete the Professional Qualification in Probation (PQiP), which takes 15 to 21 months. ONS did not publish a reliable 2025 full-time median for probation officers. Probation services officers, the unqualified grade, had a median of ${gbpFt("3229")} for their wider ONS group.`,
    },
    {
      question: "What driving jobs can ex-police officers do?",
      answer:
        "Driving instruction and HGV driving are the main ones. To teach, you pass the three approved driving instructor tests and renew your registration every 4 years; the National Careers Service says you must be over 21 and have held a full licence for 3 years. HGV driving needs the right lorry licence and the Driver CPC.",
    },
    {
      question: "Do I need a degree to leave the police?",
      answer:
        "For most routes on this page, no. Fraud investigation, intelligence analysis, compliance, security, Border Force and safeguarding all have documented routes without a degree, several of them apprenticeships. Teaching needs a degree and QTS.",
    },
    {
      question: "Can I retrain for free?",
      answer:
        "In England, often yes. Skills Bootcamps are free courses of up to 16 weeks for adults aged 19 and over, with a guaranteed job interview. Apprenticeships have no upper age limit and your employer and provider cannot charge you for the training. If you earn under £25,750 or are unemployed, Free Courses for Jobs can pay for a level 3 qualification.",
    },
    {
      question: "Is policing more stressful than other jobs?",
      answer:
        "HSE puts public administration and defence at 3,470 cases of work-related stress, depression or anxiety per 100,000 workers over 2022/23 to 2024/25, the highest of the three broad industries with significantly higher rates, against a 2,040 average. Protective service occupations also had a statistically higher rate than average (HSE, November 2025).",
    },
    {
      question: "Can I join Border Force after the police?",
      answer:
        "Yes. The National Careers Service lists UK citizenship, 5 years' residence, security and medical checks, a fitness standard and a full driving licence. There is a level 3 Public service operational delivery officer apprenticeship, typically 12 months.",
    },
    {
      question: "How long does it take to move out of the police?",
      answer:
        "Some routes are direct applications, such as security management or compliance. Most of the apprenticeships on this page take 12 to 24 months while you are paid. PQiP takes 15 to 21 months, and a Skills Bootcamp up to 16 weeks.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Leaving your job", href: "/careers-for" }, { name: "Jobs for ex-police officers" }]} />}
        kicker="Leaving the police"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            9,240 full-time-equivalent officers left forces in England and Wales in the year to March 2026 (Home Office,
            July 2026). Below are 15 civilian routes with ONS pay for each. {countWord(higher.length)} have a median above the{" "}
            {formatGBP(PC_MAX)} top of the constable scale, led by {top.title.toLowerCase()} at{" "}
            {formatGBP(top.median as number)} (ONS ASHE 2025).
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#in-numbers", label: "Leaving the police in numbers" },
            { href: "#at-a-glance", label: "15 routes at a glance" },
            { href: "#routes", label: "Each route in detail" },
            { href: "#what-carries-over", label: "What your police experience counts for" },
            { href: "#funded", label: "Free and funded retraining" },
            { href: "#faq", label: "Common questions" },
            { href: "#method", label: "How we worked this out" },
          ]}
        />
      </PageHeader>

      <HubSection
        id="in-numbers"
        title="Leaving the police in numbers"
        intro={
          <p>
            Each figure comes from the body that publishes it. One gap matters: ONS has not published reliable 2025 pay for
            police officers, so the pay comparisons here use the constable pay scale.
          </p>
        }
      >
        <FactList facts={facts} />
      </HubSection>

      <ToolCallout
        current="police officer"
        heading="Leaving the police? See where your own experience fits"
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
        title="15 routes out of the police at a glance"
        intro={
          <p>
            The change column compares each job&apos;s ONS full-time median with the top of the constable scale,{" "}
            {formatGBP(PC_MAX)} from September 2025. That scale is basic pay, while ONS reports what employees earned over
            a year, so treat the column as a rough guide rather than an exact difference.
          </p>
        }
      >
        <HubPayTable
          caption="Where police officers can go, and what it pays"
          description="Median gross annual pay for full-time employees, UK, tax year to April 2025."
          routes={routes}
          comparator={{ header: "Change vs top of constable scale", mobileLabel: "vs PC scale top", value: PC_MAX }}
          notes={
            <p>
              Constable scale: {formatGBP(PC_MIN)} to {formatGBP(PC_MAX)} from 1 September 2025 (Home Office evidence to
              the PRRB, Annex A, published 27 March 2026). A 3.5% award applies from September 2026.
            </p>
          }
        />
      </HubSection>


      <HubSection
        id="routes"
        title="Each route in detail"
        intro={
          <p>
            For each job: why police skills carry over, the realistic way in, the checks the National Careers Service
            lists, whether you need a degree, and the ONS figure with its caveats. Pay changes are not shown on these
            cards because ONS has no police figure to compare against.
          </p>
        }
      >
        {GROUPS.map((g) => (
          <div key={g.id} id={g.id} className="mt-10 scroll-mt-24">
            <h3 className="font-sans text-2xl font-bold text-ink">{g.title}</h3>
            <p className="mt-2 max-w-reading text-ink-2">{g.intro}</p>
            <HubRouteCards routes={routes.filter((r) => g.specs.some((s) => s.id === r.id))} from="Police officer" headingLevel={4} />
          </div>
        ))}
      </HubSection>

      <HubSection
        id="what-carries-over"
        title="What your police experience counts for"
        intro={
          <>
            <p>
              <strong>Investigation is the most portable skill.</strong> Interviewing, evidence handling, disclosure and
              building a file that stands up in court are exactly what counter-fraud, trading standards and compliance
              teams recruit for. Put the volume and type of cases on your CV, not only your rank.
            </p>
            <p>
              <strong>Expect new checks.</strong> The National Careers Service lists checks for many of these jobs, from
              enhanced background checks to nationality and residence rules for Border Force and intelligence work. They
              are shown on each card above.
            </p>
            <p>
              <strong>Some jobs need a licence whatever your background.</strong> Licensable security work needs an SIA
              licence (£204, 3 years). Close protection also needs the Level 3 close protection certificate and a first
              aid qualification. Driving instruction needs the three ADI tests.
            </p>
            <p>
              <strong>Leaving early is common.</strong> Of officers who resigned voluntarily in the year to March 2026,
              60.6% had less than 5 years&apos; service (Home Office). If that is you, apprenticeships are open at any age
              and pay you while you train.
            </p>
          </>
        }
      >
        <div className="mt-4 space-y-1">
          <SourceNote source="Security Industry Authority, Apply for an SIA licence (GOV.UK)" href={SIA} published="updated 19 June 2026" />
          <SourceNote source="Home Office, Police workforce, England and Wales: 31 March 2026" href={HO_WORKFORCE} published="2026-07-22" />
        </div>
      </HubSection>

      <HubSection id="funded" title="Free and funded ways to retrain">
        <FundedTraining
          lead={
            <p>
              Most of the investigation, security and justice routes above have an apprenticeship, which is paid and free
              to you. These are the schemes for England; Scotland, Wales and Northern Ireland run their own.
            </p>
          }
          bootcampFit="Subjects include digital skills such as cyber security and data, business skills such as project management, and HGV driving."
        />
      </HubSection>

      <ToolCallout
        id="check-your-options-2"
        current="police officer"
        heading="Not sure which route fits you?"
        body={
          <p>
            Tell us your role, such as response, CID or neighbourhood, or paste your CV, and see which of these jobs your
            experience points to, with the gaps to close.
          </p>
        }
        className="mt-14"
      />

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            ONS suppressed its 2025 annual pay figures for police officers, sergeant and below (SOC 3312), and for the
            groups that contain it, after an error in the returns it received (correction of 19 December 2025). So instead
            of an ONS pay change, the table compares each job with the top of the constable pay scale,{" "}
            {formatGBP(PC_MAX)} from 1 September 2025. The pay scale is basic pay and the ONS figure is annual earnings, so
            the comparison is approximate. The{" "}
            <a href={ONS_BULLETIN} rel="noopener">
              ASHE 2025 bulletin
            </a>{" "}
            explains the survey.
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional, corrected 19 December 2025)", href: ASHE.href, date: "published 23 October 2025" },
          { name: "Home Office, Police workforce, England and Wales: 31 March 2026", href: HO_WORKFORCE, date: "published 22 July 2026" },
          { name: "Home Office evidence to the Police Remuneration Review Body, 2026 to 2027 (Annex A)", href: HO_PRRB, date: "published 27 March 2026" },
          { name: "National Police Chiefs' Council, Government confirms police pay award", href: NPCC_PAY, date: "published 15 July 2026" },
          { name: "Security Industry Authority, Apply for an SIA licence (GOV.UK)", href: SIA, date: "updated 19 June 2026" },
          { name: "HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025", href: HSE_STRESS, date: "published 20 November 2025" },
          { name: "National Careers Service job profiles (routes, checks and requirements for each job)", href: "https://nationalcareers.service.gov.uk/job-profiles/criminal-intelligence-analyst", date: "retrieved 28 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?current=police%20officer", label: "Analyse my CV", note: "Free, no account: see which routes your experience fits." },
          { href: "/jobs?q=former%20police%20officer", label: "Live jobs for former police officers", note: "Search current UK vacancies." },
          { href: "/jobs?q=investigator", label: "Live investigator jobs" },
          { href: "/transferable-skills", label: "Transferable skills", note: "How to describe police work to other employers." },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree" },
          { href: "/career-change-at-50", label: "Career change at 50", note: "Useful if you are leaving at or near retirement." },
          { href: "/jobs-for-ex-military", label: "Jobs for ex-military", note: "Many of the same routes, from the forces side." },
          { href: "https://aicareerswap.com/will-ai-replace/police-officer", label: "Will AI replace police officers?", note: "Our sister site on AI and policing." },
          { href: "/careers-for", label: "Career change from other jobs", note: "Firefighters, prison officers and more." },
        ]}
      />
    </HubPage>
  );
}
