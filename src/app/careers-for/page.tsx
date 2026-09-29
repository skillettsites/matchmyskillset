import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, FaqSection, PageHeader, ToolCallout, formatGBP, type FaqItem } from "@/components/content";
import { ENGINEERING_HUBS, OTHER_CAREER_HUBS } from "@/components/site";
import {
  ArticleJsonLd,
  FundedTraining,
  HubPage,
  HubPayTable,
  HubSection,
  MethodNote,
  OnThisPage,
  RelatedLinks,
  SourcesList,
  ASHE,
  ftMedian,
  gbpFt,
  resolveRoutes,
  type RouteSpec,
} from "@/components/hubs";
import { CAREER_OCCUPATIONS } from "@/data/careers";

const PATH = "/careers-for";
const UPDATED = "2026-09-29";
const TITLE = "Career change by profession: where people go and what it pays";
const DESCRIPTION =
  "Start from the job you do now. Engineering and manufacturing guides first, then teachers, nurses, police and retail, plus ONS pay for 18 more professions.";

export const metadata: Metadata = {
  title: { absolute: "Career Change by Profession UK: Where People Go and the Pay" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

/* ------------------------------------------------------------------ */
/* The five in-depth hubs                                              */
/* ------------------------------------------------------------------ */

const HUB_FACTS: Record<string, { stat: string; source: string }> = {
  "/career-change-from-teaching": {
    stat: "38,600 full-time-equivalent teachers left England's state schools in 2024/25.",
    source: "DfE, School workforce in England, June 2026",
  },
  "/non-clinical-jobs-for-nurses": {
    stat: "30,323 people left the NMC register in the year to March 2026.",
    source: "NMC register data, 2026",
  },
  "/jobs-for-ex-police-officers": {
    stat: "9,240 full-time-equivalent officers left forces in England and Wales in the year to March 2026.",
    source: "Home Office, July 2026",
  },
  "/jobs-for-ex-military": {
    stat: "13,050 people left the UK Regular Armed Forces in the year to 30 June 2026.",
    source: "MOD, September 2026",
  },
  "/career-change-from-retail": {
    stat: "", // filled with the ONS figure at render time
    source: "ONS ASHE 2025",
  },
};

/* ------------------------------------------------------------------ */
/* Other professions: a short, specific section each                   */
/* ------------------------------------------------------------------ */

interface Profession {
  id: string;
  title: string;
  /** SOC unit group the pay change is measured against, or null when there is no fair comparator. */
  soc: string | null;
  /** Label for the comparator column, e.g. "vs GP". */
  vs?: string;
  intro: (fmt: (soc: string) => string) => string;
  routes: RouteSpec[];
  hub?: { href: string; label: string };
}

const r = (id: string, why = ""): RouteSpec => ({ id, why });

const PROFESSIONS: Profession[] = [
  {
    id: "doctors",
    title: "Doctors",
    soc: "2211",
    vs: "GP",
    intro: (f) =>
      `ONS puts generalist medical practitioners (GPs) at a full-time median of ${f("2211")} and specialists at ${f("2212")}. None of the routes below reaches the specialist median, but health service management and policy work beat the GP figure. Medical knowledge is used most directly in research, health management and policy.`,
    routes: [r("health-service-manager"), r("clinical-research-associate"), r("policy-officer"), r("management-consultant"), r("data-scientist")],
  },
  {
    id: "pharmacists",
    title: "Pharmacists",
    soc: "2251",
    vs: "pharmacist",
    intro: (f) =>
      `The ONS full-time median for pharmacists was ${f("2251")}. Clinical trials, regulatory compliance and health service management use pharmacology and governance knowledge most directly.`,
    routes: [r("clinical-research-associate"), r("compliance-officer"), r("health-service-manager"), r("medical-sales-representative"), r("data-analyst")],
  },
  {
    id: "paramedics",
    title: "Paramedics",
    soc: "2255",
    vs: "paramedic",
    intro: (f) =>
      `Paramedics had a full-time median of ${f("2255")}. Emergency planning and health and safety use incident command and risk assessment; teaching and assessing build on mentoring experience.`,
    routes: [r("emergency-planning-officer"), r("health-and-safety-adviser"), r("further-education-lecturer"), r("training-assessor"), r("health-service-manager")],
  },
  {
    id: "care-workers",
    title: "Care workers",
    soc: "6135",
    vs: "care worker",
    intro: (f) =>
      `Care workers and home carers had a full-time median of ${f("6135")}. Healthcare assistant is the shortest step, with a level 2 apprenticeship of typically 8 months, and nursing associate and registered nurse can both be reached through apprenticeships while you are paid.`,
    routes: [r("healthcare-assistant"), r("nursing-associate"), r("nurse"), r("occupational-therapist"), r("family-support-worker")],
  },
  {
    id: "chefs",
    title: "Chefs and hospitality",
    soc: "5434",
    vs: "chef",
    intro: (f) =>
      `Chefs had a full-time median of ${f("5434")}, and catering and bar managers ${f("5436")}. Running a pass or a busy bar is operations management under pressure: events, facilities and customer service management use it, and catering is taught in further education, where Get Into Teaching says you need neither a degree nor QTS to teach.`,
    routes: [r("events-manager"), r("customer-service-manager"), r("facilities-manager"), r("further-education-lecturer")],
  },
  {
    id: "accountants",
    title: "Accountants and finance",
    soc: "2421",
    vs: "accountant",
    intro: (f) =>
      `Chartered and certified accountants had a full-time median of ${f("2421")}. Analysis, risk and compliance roles pay similar or more at the median, and value audit and reporting experience.`,
    routes: [r("business-analyst"), r("risk-manager"), r("compliance-officer"), r("financial-adviser"), r("data-scientist")],
  },
  {
    id: "lawyers",
    title: "Solicitors and lawyers",
    soc: "2412",
    vs: "solicitor",
    intro: (f) =>
      `Solicitors and lawyers had a full-time median of ${f("2412")}. Compliance, risk and policy work use legal reasoning and drafting in-house.`,
    routes: [r("compliance-officer"), r("risk-manager"), r("policy-officer")],
  },
  {
    id: "engineers",
    title: "Engineers",
    soc: "2129",
    vs: "engineer",
    intro: (f) =>
      `ONS puts engineering professionals not elsewhere classified at ${f("2129")}, civil engineers at ${f("2121")} and mechanical engineers at ${f("2122")}. Project and construction management pay more at the median; teaching is a lower-paid option, with bursaries for some subjects (Get Into Teaching).`,
    routes: [r("project-manager"), r("construction-manager"), r("data-scientist"), r("health-and-safety-adviser"), r("secondary-school-teacher")],
  },
  {
    id: "construction",
    title: "Construction and trades",
    soc: "5316",
    vs: "carpenter",
    intro: (f) =>
      `Carpenters and joiners had a full-time median of ${f("5316")}, bricklayers ${f("5313")} and electricians ${f("5241")}. Moving off the tools usually means supervision, management or surveying, and trades are taught in further education, where you need neither a degree nor QTS to teach.`,
    routes: [r("construction-site-supervisor"), r("construction-manager"), r("quantity-surveyor"), r("health-and-safety-adviser"), r("further-education-lecturer")],
  },
  {
    id: "hr",
    title: "HR professionals",
    soc: "3571",
    vs: "HR officer",
    intro: (f) =>
      `HR and industrial relations officers had a full-time median of ${f("3571")}, and HR managers and directors ${f("1136")}. Learning and development, careers advice, projects and policy use the same people and process skills.`,
    routes: [r("learning-and-development-adviser"), r("careers-adviser"), r("project-manager"), r("policy-officer")],
  },
  {
    id: "social-workers",
    title: "Social workers",
    soc: "2461",
    vs: "social worker",
    intro: (f) =>
      `Social workers had a full-time median of ${f("2461")}. Most exits keep the safeguarding and assessment skills but pay less; policy work is the exception at the median.`,
    routes: [r("policy-officer"), r("safeguarding-officer"), r("probation-officer"), r("counsellor"), r("further-education-lecturer")],
  },
  {
    id: "civil-servants",
    title: "Civil servants and council staff",
    soc: "4111",
    vs: "civil service admin",
    intro: (f) =>
      `National government administrative jobs had a full-time median of ${f("4111")}, and local government administrative jobs ${f("4112")}. Policy, analysis, project and compliance roles all pay more at the median, inside or outside government.`,
    routes: [r("policy-officer"), r("business-analyst"), r("project-manager"), r("data-analyst"), r("compliance-officer")],
  },
  {
    id: "admin",
    title: "Admin and office workers",
    soc: "4159",
    vs: "admin role",
    intro: (f) =>
      `Other administrative occupations had a full-time median of ${f("4159")}, and personal assistants and secretaries ${f("4215")}. Office management, HR, project support and bookkeeping build on the same organisation and systems skills.`,
    routes: [r("office-manager"), r("project-support-officer"), r("hr-officer"), r("bookkeeper"), r("data-analyst")],
  },
  {
    id: "firefighters",
    title: "Firefighters",
    soc: "3313",
    vs: "firefighter",
    intro: (f) =>
      `Fire service officers (watch manager and below) had a full-time median of ${f("3313")}. Fire safety, risk assessment and incident command lead naturally into health and safety, emergency planning and training.`,
    routes: [r("health-and-safety-adviser"), r("emergency-planning-officer"), r("facilities-manager"), r("training-assessor")],
  },
  {
    id: "prison-officers",
    title: "Prison officers",
    soc: "3314",
    vs: "prison officer",
    intro: (f) =>
      `Prison service officers had a full-time median of ${f("3314")}, though ONS rates that estimate as acceptable rather than precise. Probation, youth justice and security use the same risk and de-escalation skills.`,
    routes: [r("probation-services-officer"), r("youth-offending-team-officer"), r("security-manager"), r("safeguarding-officer")],
  },
  {
    id: "cabin-crew",
    title: "Cabin crew",
    soc: "6213",
    vs: "cabin crew",
    intro: (f) =>
      `ONS codes cabin crew as air travel assistants, with a full-time median of ${f("6213")}. Safety briefings, customer service and calm under pressure transfer to rail, events and customer service management.`,
    routes: [r("train-conductor"), r("customer-service-manager"), r("events-manager"), r("recruitment-consultant")],
  },
  {
    id: "journalists",
    title: "Journalists",
    soc: "2492",
    vs: "journalist",
    intro: (f) =>
      `Newspaper, periodical and broadcast journalists had a full-time median of ${f("2492")}. Communications, copywriting, marketing and policy use research and clear writing; marketing management and policy work pay more at the median.`,
    routes: [r("pr-officer"), r("copywriter"), r("marketing-manager"), r("policy-officer")],
  },
  {
    id: "hairdressers",
    title: "Hairdressers and beauty",
    soc: "6221",
    vs: "hairdresser",
    intro: (f) =>
      `Hairdressers and barbers had a full-time median of ${f("6221")}. Client care, sales and managing a full appointment book transfer to customer service, sales and healthcare support, and hairdressing is taught in further education.`,
    routes: [r("further-education-lecturer"), r("customer-service-manager"), r("sales-representative"), r("healthcare-assistant")],
  },
  {
    id: "returning-to-work",
    title: "Returning to work after a career break",
    soc: null,
    intro: () =>
      "There is no ONS figure for a career break, so these routes show pay without a comparison. They all have documented routes without a degree and an apprenticeship, which is open at any adult age. If you are unemployed, Free Courses for Jobs can pay for a level 3 qualification in England.",
    routes: [r("bookkeeper"), r("hr-officer"), r("office-manager"), r("healthcare-assistant"), r("data-analyst")],
  },
];

export default function CareersForPage() {
  const retailAssistant = ftMedian("7111") as number;
  const noDegreeCount = CAREER_OCCUPATIONS.filter((o) => !o.degreeUsuallyRequired).length;
  const hubFacts: Record<string, { stat: string; source: string }> = {
    ...HUB_FACTS,
    "/career-change-from-retail": {
      stat: `Full-time sales and retail assistants had a median of ${formatGBP(retailAssistant)} in 2025.`,
      source: "ONS ASHE 2025",
    },
  };
  const hubs = OTHER_CAREER_HUBS.filter((h) => h.href !== "/careers-for");
  const gp = ftMedian("2211") as number;
  const hsm = ftMedian("1171") as number;

  const faqs: FaqItem[] = [
    {
      question: "How do I find jobs that use the skills from my current job?",
      answer:
        "Start from your profession on this page: each one lists realistic next jobs with ONS pay and the usual way in. For a personal answer, paste your CV into our free analysis, which needs no account, and it shows the skills you already have and the jobs they point to.",
    },
    {
      question: "Can I retrain for free in England?",
      answer:
        "Often, yes. Skills Bootcamps are free courses of up to 16 weeks for adults aged 19 and over, with a guaranteed job interview. Apprenticeships are paid and your employer and provider cannot charge you for the training. If you earn under £25,750 or are unemployed, Free Courses for Jobs pays for a level 3 qualification. Advanced Learner Loans cover level 3 to 6 courses.",
    },
    {
      question: "Is there an age limit on apprenticeships?",
      answer:
        "GOV.UK's only age rule is that you are 16 or over, living in England and not in full-time education. You can already hold a degree. Employers can pay the apprentice rate of £8 an hour in your first year even if you are over 19, so check the pay before you apply.",
    },
    {
      question: "Do I need a degree to change career?",
      answer: `Usually not. Of the ${CAREER_OCCUPATIONS.length} destination jobs we track, ${noDegreeCount} have a documented route in without a degree, such as an apprenticeship, a college course or working up from a junior role, according to ONS and the National Careers Service.`,
    },
    {
      question: "Where does the pay data come from?",
      answer:
        "From the ONS Annual Survey of Hours and Earnings 2025 (provisional), Table 14, published on 23 October 2025. We quote the median gross annual pay for full-time employees in the UK. ONS publishes the 2026 figures on 22 October 2026, and we will update the pages then.",
    },
    {
      question: "Why do some jobs show no pay figure?",
      answer:
        "ONS does not publish an estimate when it is too uncertain or could identify people. In 2025 that included probation officers and driving instructors, and ONS suppressed its figures for police officers after an error in the returns it received. ASHE Table 14 publishes no pay for the armed forces at all. We say so rather than fill the gap.",
    },
    {
      question: "Can doctors leave medicine without losing pay?",
      answer: `Rarely at the median. Specialists had a full-time median of ${gbpFt("2212")} in 2025, above every destination job in our dataset. Against the GP median of ${formatGBP(gp)}, health service management (${formatGBP(hsm)}) and policy work (${gbpFt("2439")}) pay more (ONS ASHE 2025).`,
    },
    {
      question: "What jobs can firefighters do after the fire service?",
      answer: `Health and safety, emergency planning, facilities management and training. Health and safety advisers had a full-time median of ${gbpFt("3582")}, against ${gbpFt("3313")} for fire service officers (ONS ASHE 2025).`,
    },
    {
      question: "What jobs suit ex-cabin crew?",
      answer: `Rail work, customer service management, events and recruitment. Rail travel assistants, which include train conductors, had a full-time median of ${gbpFt("6214")}, against ${gbpFt("6213")} for air travel assistants, where ONS codes cabin crew (ONS ASHE 2025).`,
    },
    {
      question: "My job is not listed. What should I do?",
      answer:
        "Type your job title into our free analysis or paste your CV. It works for any job, needs no account, and shows the skills you already have and where they lead.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Leaving your job" }]} />}
        kicker="Leaving your job"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            Start from the job you do now. Engineering, manufacturing and Industry 4.0 come first, with guides for ex-military
            technicians and graduates; then in-depth guides for leaving teaching, nursing, policing and retail; then 18 more professions,
            plus returning after a career break, each with 3 to 5 realistic routes and 2025 ONS pay. For example, chefs had a full-time
            median of {gbpFt("5434")} and events managers {gbpFt("3557")} (ONS ASHE 2025).
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#engineering", label: "Engineering, manufacturing and Industry 4.0" },
            { href: "#guides", label: "Other careers: in-depth guides" },
            { href: "#professions", label: "18 more professions, and returning after a break" },
            { href: "#funded", label: "Free and funded retraining" },
            { href: "#faq", label: "Common questions" },
          ]}
        />
      </PageHeader>

      <HubSection
        id="engineering"
        title="Engineering, manufacturing and Industry 4.0"
        intro={<p>Careers from maintenance and machining to robotics, automation and 3D printing, with ONS pay and the ways in.</p>}
      >
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENGINEERING_HUBS.map((h) => (
            <li key={h.href}>
              <Link
                href={h.href}
                className="group flex h-full flex-col rounded-[28px] bg-white p-6 shadow-card ring-1 ring-black/[0.05] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-7"
              >
                <span className="kicker !text-link">{h.short}</span>
                <span className="mt-1.5 text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-ink group-hover:underline group-hover:underline-offset-4">
                  {h.label}
                </span>
                <span className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-2">{h.blurb}</span>
                <span className="mt-5 inline-flex items-center gap-0.5 text-[15px] text-link">Read the guide</span>
              </Link>
            </li>
          ))}
        </ul>
      </HubSection>

      <HubSection id="guides" title="Other careers: in-depth guides" intro={<p>Each guide has 14 or 15 routes, the facts specific to leaving that job, and a full FAQ.</p>}>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((h) => {
            const f = hubFacts[h.href];
            return (
              <li key={h.href}>
                <Link
                  href={h.href}
                  className="group flex h-full flex-col rounded-[28px] bg-white p-6 shadow-card ring-1 ring-black/[0.05] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-7"
                >
                  <span className="kicker !text-link">{h.short}</span>
                  <span className="mt-1.5 text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-ink group-hover:underline group-hover:underline-offset-4">
                    {h.label}
                  </span>
                  {f && (
                    <span className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-2">
                      {f.stat} <span className="text-mute">({f.source})</span>
                    </span>
                  )}
                  <span className="mt-5 inline-flex items-center gap-0.5 text-[15px] text-link">
                    Read the guide
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </HubSection>

      <ToolCallout className="mt-16" heading="Any other job? Start from yours" />

      <HubSection
        id="professions"
        title="18 more professions, and returning after a break"
        intro={
          <p>
            Each section compares a few realistic next jobs with the ONS full-time median for the job you do now. Job
            titles link to live vacancies. Pay covers the whole ONS unit group behind each job, so read it as a guide.
          </p>
        }
      >
        <nav aria-label="Professions on this page" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {PROFESSIONS.map((p) => (
              <li key={p.id}>
                <a
                  href={`#${p.id}`}
                  className="inline-flex min-h-11 items-center rounded-full bg-cloud px-4 text-[15px] font-medium text-ink transition-colors hover:bg-hair"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {PROFESSIONS.map((p) => {
          const routes = resolveRoutes(p.routes);
          const base = p.soc ? ftMedian(p.soc) : null;
          return (
            <section key={p.id} id={p.id} aria-labelledby={`${p.id}-title`} className="mt-14 scroll-mt-24 border-t border-hair pt-10">
              <h3 id={`${p.id}-title`} className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink">
                {p.title}
              </h3>
              <p className="mt-3 max-w-reading text-[17px] leading-relaxed text-ink-2">{p.intro(gbpFt)}</p>
              <HubPayTable
                caption={`${p.title}: routes and pay`}
                routes={routes}
                jobLink="jobs"
                comparator={base !== null && p.vs ? { header: `Change vs ${p.vs}`, mobileLabel: `vs ${p.vs}`, value: base } : undefined}
              />
            </section>
          );
        })}
      </HubSection>

      <HubSection id="funded" title="Free and funded ways to retrain">
        <FundedTraining
          lead={<p>Whatever your job now, these are the main free and funded routes in England. Scotland, Wales and Northern Ireland run their own.</p>}
        />
      </HubSection>

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            Each profession&apos;s pay change compares a destination&apos;s full-time median with the full-time median for
            the ONS unit group the profession belongs to, named in its section. Where no fair comparison exists, as for a
            career break, the change column is left out.
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional)", href: ASHE.href, date: "published 23 October 2025" },
          { name: "National Careers Service job profiles (routes into each destination job)", href: "https://nationalcareers.service.gov.uk/explore-careers", date: "retrieved 28 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 28 September 2026" },
          { name: "GOV.UK, Become an apprentice", href: "https://www.gov.uk/become-apprentice", date: "checked 28 September 2026" },
          { name: "GOV.UK, Free courses for jobs", href: "https://www.gov.uk/guidance/free-courses-for-jobs", date: "updated 29 July 2025" },
          { name: "GOV.UK, Advanced Learner Loan", href: "https://www.gov.uk/advanced-learner-loan", date: "checked 28 September 2026" },
          { name: "Department for Education, Skills for Careers: Skills Bootcamps", href: "https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp", date: "checked 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover#cv", label: "Analyse my CV", note: "Free, no account, works for any job." },
          { href: "/jobs", label: "Find jobs", note: "Search live UK vacancies." },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree" },
          { href: "/transferable-skills", label: "Transferable skills" },
          { href: "/highest-paying-careers-uk", label: "Highest-paying careers in the UK" },
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "https://aicareerswap.com/guides/career-change-at-40", label: "Career change at 40", note: "On our sister site, AICareerSwap." },
          { href: "/career-change-at-50", label: "Career change at 50" },
        ]}
      />
    </HubPage>
  );
}
