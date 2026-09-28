import type { Metadata } from "next";
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
  gbpFt,
  resolveRoutes,
  ukFullTimeMedian,
  type Fact,
  type RouteSpec,
} from "@/components/hubs";
import { assertHubRoutes } from "@/lib/skills/families";

const PATH = "/jobs-for-ex-military";
const UPDATED = "2026-09-28";
const TITLE = "Jobs for ex-military in the UK: civilian careers and what they pay";
const DESCRIPTION =
  "15 civilian jobs for armed forces veterans with ONS pay, plus your resettlement support: the Career Transition Partnership, Enhanced Learning Credits and veteran schemes.";

export const metadata: Metadata = {
  title: { absolute: "Jobs for Ex-Military UK: Civilian Careers and What They Pay" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

const QSPS =
  "https://www.gov.uk/government/statistics/quarterly-service-personnel-statistics-2026/quarterly-service-personnel-statistics-1-july-2026";
const CTP_GUIDE = "https://www.gov.uk/guidance/getting-employment-support-when-leaving-the-armed-forces";
const CTP_PAGE = "https://www.gov.uk/guidance/career-transition-partnership";
const VETERAN_JOBS = "https://www.gov.uk/guidance/finding-a-job-as-a-veteran";
const FEC = "https://www.gov.uk/veteran-support-organisations/forces-employment-charity";
const ELC_NEWS = "https://www.gov.uk/government/news/enhanced-learning-credits-further-and-higher-education-scheme-changes-for-veterans";
const ELCAS = "https://www.enhancedlearningcredits.com/";
const SERVICE_LEAVERS_GUIDE = "https://www.gov.uk/government/publications/service-leavers-pack/service-leavers-guide";
const GIT_VETERANS = "https://getintoteaching.education.gov.uk/funding-and-support/if-youre-a-veteran";
const SIA = "https://www.gov.uk/guidance/apply-for-an-sia-licence";

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

const PLAN_SUPPLY: RouteSpec[] = [
  {
    id: "project-manager",
    why: "Planning an operation, writing orders, tracking timelines and managing kit and people is project management in different words.",
    aiSlug: "project-manager",
  },
  {
    id: "logistics-manager",
    why: "Moving people, kit and supplies to the right place on time, with a paper trail, is what logistics managers do in every kind of supply chain.",
  },
  {
    id: "transport-manager",
    why: "Fleet planning, driver hours and vehicle compliance will be familiar to anyone from a transport or logistics trade.",
  },
  {
    id: "facilities-manager",
    why: "Running the services on a base or a ship is facilities management: maintenance, contractors, safety and budgets.",
  },
];

const ENGINEERING: RouteSpec[] = [
  {
    id: "aircraft-maintenance-engineer",
    why: "Aircraft technicians work to maintenance procedures, inspections and records that civil aviation depends on too.",
  },
  {
    id: "engineering-technician",
    why: "Maintaining vehicles, weapons systems, plant or electronics builds the fault-finding and procedure skills engineering technicians use. ONS puts wind turbine technicians in the same pay group.",
  },
  {
    id: "electrician",
    why: "Service electricians and technicians bring theory and hands-on experience, which you then show against the civilian qualification.",
    note: "The National Careers Service lists a work accreditation scheme as one route in, alongside apprenticeships and college courses.",
    aiSlug: "electrician",
  },
];

const DIGITAL: RouteSpec[] = [
  {
    id: "cyber-security-analyst",
    why: "Communications and information systems trades, and experience of handling classified information, give a head start in cyber security.",
    aiSlug: "cybersecurity-analyst",
  },
  {
    id: "network-engineer",
    why: "Military communications and IT trades set up and maintain networks in hard conditions. The level 4 apprenticeship gives you the civilian qualification to match.",
  },
  {
    id: "intelligence-analyst",
    why: "If you worked in intelligence or on threat assessments, you already know the collect, analyse and brief cycle this job runs on.",
  },
];

const TRANSPORT: RouteSpec[] = [
  {
    id: "hgv-driver",
    why: "If you drove heavy vehicles in service, you know the vehicles and the discipline. The National Careers Service notes the armed forces offer HGV driving apprenticeships.",
    aiSlug: "lorry-driver",
  },
  {
    id: "train-driver",
    why: "Long periods of concentration, strict procedures and shift work will be familiar. It has the second-highest ONS median of the 141 destination jobs we track that do not usually need a degree.",
    note: "The National Careers Service says you apply to a train operating company for a place on the Train driver apprenticeship, which takes between 1 and 2 years.",
  },
];

const SECURITY_SAFETY: RouteSpec[] = [
  {
    id: "close-protection-officer",
    why: "Personal security, route planning and threat assessment are the job. The National Careers Service says police, armed forces or prison service experience could be useful.",
    note: "You need an SIA close protection licence, which means first completing the Level 3 Certificate for Working as a Close Protection Operative with an SIA-approved provider, plus a close protection first aid qualification (National Careers Service). The licence costs £204 and lasts 3 years (SIA).",
  },
  {
    id: "health-and-safety-adviser",
    why: "Risk assessments, safety briefings and incident reporting are routine in service life, and they are the base of civilian health and safety work.",
  },
  {
    id: "secondary-school-teacher",
    why: "Instructing, leading and keeping a group on task carry over to the classroom, and there is dedicated funding for veterans in some subjects.",
    note: "Get Into Teaching offers veterans a £40,000 tax-free bursary to train through a bachelor's degree with QTS in secondary biology, chemistry, computing, languages, maths or physics, if you left full-time service no more than 5 years before the course.",
    aiSlug: "teacher",
  },
];

const GROUPS = [
  { id: "plan-supply", title: "Plan, run and supply", intro: "Management routes built on planning, logistics and leading people. Recognised civilian qualifications, such as PRINCE2 for projects, help translate service experience.", specs: PLAN_SUPPLY },
  { id: "engineering", title: "Engineering and trades", intro: "For technical trades. Service training is a strong base, and apprenticeships or accreditation schemes turn it into a civilian qualification.", specs: ENGINEERING },
  { id: "digital", title: "Digital, cyber and intelligence", intro: "Well paid at the median. Expect to add civilian certifications or an apprenticeship to your service experience.", specs: DIGITAL },
  { id: "transport", title: "Driving and rail", intro: "Licences and medical checks come first. Train driving pays far above the UK median; HGV driving pays just above it.", specs: TRANSPORT },
  { id: "security-safety", title: "Security, safety and teaching", intro: "Protecting people, keeping workplaces safe, or teaching the next generation.", specs: SECURITY_SAFETY },
];

const ALL_SPECS = GROUPS.flatMap((g) => g.specs);
// The matcher boosts these routes for people from this line of work; this keeps the two lists the same.
assertHubRoutes("military", ALL_SPECS);

interface ResettlementRow {
  who: string;
  programme: string;
  when: string;
}
const RESETTLEMENT: ResettlementRow[] = [
  { who: "Served more than 6 years", programme: "Core Resettlement Programme (CTP)", when: "From 2 years before discharge to 2 years after, with up to 35 days of graduated resettlement time" },
  { who: "Served 4 to 6 years", programme: "Employment Support Programme (CTP)", when: "From 2 years before discharge to 2 years after" },
  { who: "Served under 4 years", programme: "CTP Future Horizons", when: "For 2 years after discharge" },
  { who: "Medically discharged or facing significant barriers", programme: "CTP Assist", when: "Regardless of time served, with a longer timeline if needed" },
  { who: "Left more than 2 years ago", programme: "Op ASCEND: Careers After Service, run by the Forces Employment Charity", when: "Free and government-backed" },
];

export default function MilitaryHubPage() {
  const uk = ukFullTimeMedian();
  const routes = resolveRoutes(ALL_SPECS);
  const higher = routes.filter((r) => r.basis === "ft" && r.median !== null && r.median > uk);
  const top = [...routes].filter((r) => r.basis === "ft").sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0];

  const facts: Fact[] = [
    {
      figure: "13,050",
      text: "people left the UK Regular Armed Forces in the 12 months to 30 June 2026, 970 fewer than the year before.",
      source: "MOD, Quarterly service personnel statistics: 1 July 2026",
      href: QSPS,
      published: "updated 23 September 2026",
    },
    {
      figure: "60.6%",
      text: "of outflow from the trained and trade-trained strength was voluntary: 5,800 people, a voluntary outflow rate of 4.8%.",
      source: "MOD, Quarterly service personnel statistics: 1 July 2026",
      href: QSPS,
      published: "updated 23 September 2026",
    },
    {
      figure: formatGBP(uk),
      text: "the UK median full-time pay for all employees. ONS publishes no pay figures for the armed forces, so this page compares civilian jobs with it.",
      source: ASHE.short,
      href: ASHE.href,
      published: ASHE.published,
    },
    {
      figure: "2 years",
      text: "either side of discharge: the Career Transition Partnership's core programme runs from 2 years before you leave to 2 years after, if you served more than 6 years.",
      source: "MOD, Getting employment support when leaving the armed forces (GOV.UK)",
      href: CTP_GUIDE,
      published: "updated 2 October 2024",
    },
    {
      figure: "5 years",
      text: "after discharge to use Enhanced Learning Credits if you registered in service and left on or after 1 April 2016. They fund level 3 and above in up to three separate financial years.",
      source: "MOD (GOV.UK) and ELCAS",
      href: ELC_NEWS,
      published: "2021-03-30",
    },
    {
      figure: "£40,000",
      text: "tax-free bursary for veterans training to teach some secondary subjects through a bachelor's degree with QTS, within 5 years of leaving.",
      source: "Get Into Teaching (DfE), Funding and support if you're a veteran",
      href: GIT_VETERANS,
      published: "checked 28 September 2026",
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: "What jobs can ex-military personnel do in the UK?",
      answer: `Common routes use planning and leadership (project, logistics, transport and facilities management), technical trades (aircraft maintenance, engineering technician, electrician), digital and intelligence work, driving and rail, and security, safety or teaching. This page lists 15 with ONS pay: ${higher.length} have a median above the UK full-time median of ${formatGBP(uk)} (ONS ASHE 2025).`,
    },
    {
      question: "What are the best-paid civilian jobs for veterans?",
      answer: `Of the 15 routes here, ${top.title.toLowerCase()} has the highest ONS full-time median at ${formatGBP(top.median as number)}, followed by project management at ${gbpFt("2440")} (ONS ASHE 2025). A median covers everyone in the job, including people with years of experience, so it is not a starting salary.`,
    },
    {
      question: "What resettlement support do I get when I leave the armed forces?",
      answer:
        "It depends on how long you served. Over 6 years: the Career Transition Partnership's Core Resettlement Programme, from 2 years before discharge to 2 years after, with up to 35 days of resettlement time. 4 to 6 years: the Employment Support Programme over the same window. Under 4 years: CTP Future Horizons for 2 years after discharge. CTP Assist covers medical discharges regardless of time served (GOV.UK).",
    },
    {
      question: "What are Enhanced Learning Credits?",
      answer:
        "An MOD scheme that pays towards nationally recognised qualifications at level 3 or above with an approved provider, in each of up to three separate financial years (ELCAS). If you registered during service and left on or after 1 April 2016, you can claim for up to 5 years after discharge (GOV.UK).",
    },
    {
      question: "Can I use Enhanced Learning Credits after I leave?",
      answer:
        "Yes, if you registered while serving. GOV.UK says you can keep claiming for up to 5 years after your discharge date, or 10 years for some earlier leavers and some medical discharges. You can also combine credits with the Individual Resettlement Training Costs grant towards tuition fees.",
    },
    {
      question: "Is there a guaranteed interview scheme for veterans?",
      answer:
        "In the Civil Service, yes. Under the Great Place to Work for Veterans scheme you progress to the next stage for most vacancies, whether that is an interview or an online test. HM Prison and Probation Service runs Advance into Justice for veterans and their spouses or civil partners, and employers who sign the Armed Forces Covenant may offer their own guaranteed interview schemes (GOV.UK).",
    },
    {
      question: "I left the forces more than two years ago. Can I still get help?",
      answer:
        "Yes. GOV.UK points veterans who left more than 2 years ago to Op ASCEND: Careers After Service, a free, government-backed scheme run by the Forces Employment Charity, with specialist employment advice and access to veteran-friendly employers.",
    },
    {
      question: "Can veterans get paid to train as teachers?",
      answer:
        "Yes. Get Into Teaching offers a £40,000 tax-free bursary, paid as £20,000 in each of the last 2 years, to veterans training through a bachelor's degree with QTS to teach secondary biology, chemistry, computing, languages, maths or physics, if they left full-time service no more than 5 years before the course. You do not need a degree or QTS to teach in further education.",
    },
    {
      question: "Do I need an SIA licence for close protection?",
      answer:
        "Yes. The National Careers Service says you first complete the Level 3 Certificate for Working as a Close Protection Operative with an SIA-approved provider and hold a close protection first aid qualification. The licence costs £204 from 1 April 2026 and lasts 3 years (SIA).",
    },
    {
      question: "Can I become a train driver after the forces?",
      answer: `Yes, through a train operating company's trainee scheme or the Train driver apprenticeship, which the National Careers Service says takes 1 to 2 years. It lists medical and background checks and living within 45 minutes to 1 hour of the depot. The ONS full-time median was ${gbpFt("8231")} (ONS ASHE 2025).`,
    },
    {
      question: "How many people leave the armed forces each year?",
      answer:
        "13,050 people left the UK Regular Armed Forces in the 12 months to 30 June 2026, down 970 on the year before. Voluntary outflow was 60.6% of outflow from the trained strength, 5,800 people (MOD, Quarterly service personnel statistics).",
    },
    {
      question: "Why is there no ONS pay figure for soldiers?",
      answer:
        "ONS ASHE Table 14 publishes no pay figures for the two armed forces unit groups (officers, and non-commissioned officers and other ranks). So this page compares civilian jobs with the UK full-time median for all employees, " +
        `${formatGBP(uk)} in 2025, instead of with service pay.`,
    },
    {
      question: "Do I need a degree for a civilian career?",
      answer:
        "For most routes on this page, no. Project, logistics and facilities management, trades, cyber, driving and security all have documented routes without a degree. Teaching in a state school needs a degree and QTS.",
    },
    {
      question: "What if I served less than four years?",
      answer:
        "You can use CTP Future Horizons for 2 years after discharge (GOV.UK). Apprenticeships have no upper age limit, and Skills Bootcamps are free for adults in England, with a guaranteed job interview at the end.",
    },
    {
      question: "Can my spouse or partner get help too?",
      answer:
        "Yes. GOV.UK says the Forces Employment Charity supports spouses and partners of serving personnel and veterans, including those who are separated, divorced or bereaved.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Leaving your job", href: "/careers-for" }, { name: "Jobs for ex-military" }]} />}
        kicker="Leaving the armed forces"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            13,050 people left the UK Regular Armed Forces in the year to 30 June 2026 (MOD, September 2026). Below are 15
            civilian routes with ONS pay for each: {higher.length} pay more than the {formatGBP(uk)} UK full-time median,
            led by {top.title.toLowerCase()} at {formatGBP(top.median as number)} (ONS ASHE 2025). Your resettlement
            support is set out below too.
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#in-numbers", label: "Leaving the forces in numbers" },
            { href: "#at-a-glance", label: "15 routes at a glance" },
            { href: "#routes", label: "Each route in detail" },
            { href: "#resettlement", label: "Your resettlement support" },
            { href: "#funded", label: "Funded training and schemes" },
            { href: "#faq", label: "Common questions" },
            { href: "#method", label: "How we worked this out" },
          ]}
        />
      </PageHeader>

      <HubSection
        id="in-numbers"
        title="Leaving the forces in numbers"
        intro={
          <p>
            Each figure comes from the body that publishes it. ONS does not publish pay for the armed forces, so civilian
            jobs are compared with the UK median for all full-time employees.
          </p>
        }
      >
        <FactList facts={facts} />
      </HubSection>

      <ToolCallout
        current="armed forces"
        heading="Leaving the forces? See where your own experience fits"
        body={
          <p>
            Paste your CV and get a free analysis of the skills you already have, in civilian language, and which of these
            routes they point to. No account, and nothing to pay.
          </p>
        }
        className="mt-12"
      />

      <HubSection
        id="at-a-glance"
        title="15 civilian routes at a glance"
        intro={
          <p>
            The change column compares each job&apos;s ONS full-time median with the UK full-time median for all
            employees, {formatGBP(uk)}. It tells you how a job pays against the whole labour market, not against your
            service pay.
          </p>
        }
      >
        <HubPayTable
          caption="Where service leavers can go, and what it pays"
          description="Median gross annual pay for full-time employees, UK, tax year to April 2025."
          routes={routes}
          comparator={{ header: "Change vs UK full-time median", mobileLabel: "vs UK median", value: uk }}
        />
      </HubSection>


      <HubSection
        id="routes"
        title="Each route in detail"
        intro={
          <p>
            For each job: why service experience carries over, the realistic way in, the checks the National Careers
            Service lists, whether you need a degree, and the ONS figure with its caveats.
          </p>
        }
      >
        {GROUPS.map((g) => (
          <div key={g.id} id={g.id} className="mt-10 scroll-mt-24">
            <h3 className="font-sans text-2xl font-bold text-ink">{g.title}</h3>
            <p className="mt-2 max-w-reading text-ink-2">{g.intro}</p>
            <HubRouteCards routes={routes.filter((r) => g.specs.some((s) => s.id === r.id))} from="Armed forces" headingLevel={4} />
          </div>
        ))}
      </HubSection>

      <HubSection
        id="resettlement"
        title="Your resettlement support"
        intro={
          <p>
            The Career Transition Partnership (CTP) is the MOD&apos;s resettlement service, run with Reed in Partnership.
            What you get depends on how long you served. Start with a CTP workshop, which GOV.UK calls the best way to begin.
          </p>
        }
      >
        <DataTable<ResettlementRow>
          caption="Resettlement support by length of service"
          rowKey={(r) => r.who}
          rows={RESETTLEMENT}
          columns={[
            { key: "who", header: "If you", rowHeader: true },
            { key: "programme", header: "Programme" },
            { key: "when", header: "When you can use it", mobileLabel: "When" },
          ]}
          source={
            <SourceNote
              label="Sources"
              source="MOD, Getting employment support when leaving the armed forces; Finding an ex-military job after leaving the armed forces (GOV.UK)"
              href={CTP_GUIDE}
              published="updated 2 October 2024 and 25 February 2025"
            />
          }
        />
        <div className="prose-mms mt-6">
          <h3>Schemes that open doors</h3>
          <ul>
            <li>
              <strong>Civil Service, Great Place to Work for Veterans:</strong> you progress to the next stage for most
              vacancies, whether an interview or an online test.
            </li>
            <li>
              <strong>Advance into Justice:</strong> HM Prison and Probation Service career opportunities exclusively for
              veterans and their spouses or civil partners.
            </li>
            <li>
              <strong>Armed Forces Covenant employers:</strong> GOV.UK links to a searchable list of organisations that
              have signed the Covenant, some offering guaranteed interviews or flexible working for veterans.
            </li>
            <li>
              <strong>Forces Employment Charity:</strong> career advice, job matching, CV and interview help for veterans,
              reservists and their spouses or partners.
            </li>
          </ul>
          <SourceNote source="GOV.UK, Finding an ex-military job after leaving the armed forces" href={VETERAN_JOBS} published="updated 25 February 2025" />
          <SourceNote source="GOV.UK, Forces Employment Charity" href={FEC} published="updated 12 September 2024" />
        </div>
      </HubSection>

      <HubSection id="funded" title="Funded training and schemes">
        <FundedTraining
          lead={
            <p>
              Service leavers have their own funding on top of the schemes open to everyone in England. Enhanced Learning
              Credits pay towards level 3 and above qualifications with an approved provider, in up to three separate
              financial years, and you can combine them with the Individual Resettlement Training Costs grant towards
              tuition fees. Check your eligibility with{" "}
              <a href={ELCAS} rel="noopener">
                ELCAS
              </a>{" "}
              before you book a course.
            </p>
          }
          bootcampFit="Subjects include digital skills such as cyber security and data, technical skills such as construction and engineering, and HGV driving."
        >
          <div className="mt-4 space-y-1">
            <SourceNote source="MOD, Service leavers' guide: educational support (GOV.UK)" href={SERVICE_LEAVERS_GUIDE} published="updated 18 September 2024" />
            <SourceNote source="ELCAS, the Enhanced Learning Credits Administration Service" href={ELCAS} published="checked 28 September 2026" />
          </div>
        </FundedTraining>
      </HubSection>

      <ToolCallout
        id="check-your-options-2"
        current="armed forces"
        heading="Not sure which route fits you?"
        body={
          <p>
            Tell us your trade and rank, or paste your CV, and see which of these jobs your experience points to, with the
            gaps to close for each.
          </p>
        }
        className="mt-14"
      />

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            ONS ASHE Table 14 publishes no pay figures for the armed forces unit groups (SOC 1161, officers, and SOC 3311,
            non-commissioned officers and other ranks). So the change column compares each job with the UK full-time
            median for all employees, {formatGBP(uk)}, rather than with service pay.
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional)", href: ASHE.href, date: "published 23 October 2025" },
          { name: "MOD, Quarterly service personnel statistics: 1 July 2026", href: QSPS, date: "updated 23 September 2026" },
          { name: "MOD, Getting employment support when leaving the armed forces (GOV.UK)", href: CTP_GUIDE, date: "updated 2 October 2024" },
          { name: "MOD, Career Transition Partnership (GOV.UK)", href: CTP_PAGE, date: "updated 1 October 2024" },
          { name: "GOV.UK, Finding an ex-military job after leaving the armed forces", href: VETERAN_JOBS, date: "updated 25 February 2025" },
          { name: "GOV.UK, Forces Employment Charity", href: FEC, date: "updated 12 September 2024" },
          { name: "MOD, Enhanced Learning Credits and Further and Higher Education scheme changes for veterans", href: ELC_NEWS, date: "published 30 March 2021" },
          { name: "MOD, Service leavers' guide (educational support)", href: SERVICE_LEAVERS_GUIDE, date: "updated 18 September 2024" },
          { name: "ELCAS, Enhanced Learning Credits Administration Service", href: ELCAS, date: "checked 28 September 2026" },
          { name: "Get Into Teaching (DfE), Funding and support if you're a veteran", href: GIT_VETERANS, date: "checked 28 September 2026" },
          { name: "Security Industry Authority, Apply for an SIA licence (GOV.UK)", href: SIA, date: "updated 19 June 2026" },
          { name: "National Careers Service job profiles (routes, checks and requirements for each job)", href: "https://nationalcareers.service.gov.uk/job-profiles/bodyguard", date: "retrieved 28 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?current=armed%20forces", label: "Analyse my CV", note: "Free, no account: see which routes your experience fits." },
          { href: "/jobs?q=ex%20military", label: "Live jobs for ex-military", note: "Search current UK vacancies." },
          { href: "/transferable-skills", label: "Transferable skills", note: "How to put service experience in civilian language." },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree" },
          { href: "/highest-paying-careers-uk", label: "Highest-paying careers in the UK" },
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "/career-change-at-50", label: "Career change at 50" },
          { href: "/jobs-for-ex-police-officers", label: "Jobs for ex-police officers", note: "Security, investigation and justice routes in more depth." },
          { href: "/careers-for", label: "Career change from other jobs", note: "Firefighters, engineers and more." },
        ]}
      />
    </HubPage>
  );
}
