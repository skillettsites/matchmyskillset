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
  allMedian,
  countWord,
  ftMedian,
  gbpFt,
  resolveRoutes,
  type Fact,
  type RouteSpec,
} from "@/components/hubs";

const PATH = "/career-change-from-retail";
const UPDATED = "2026-09-28";
const TITLE = "Career change from retail: better-paid jobs and how to get them";
const DESCRIPTION =
  "14 jobs that pay more than shop work, with ONS pay, the change against a retail assistant's pay, apprenticeships, and free courses you may qualify for. Checked September 2026.";

export const metadata: Metadata = {
  title: { absolute: "Career Change From Retail UK: Better-Paid Jobs to Move Into" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

const ASSISTANT = "7111";
const SUPERVISOR = "7132";
const MANAGER = "1150";

const NMW = "https://www.gov.uk/national-minimum-wage-rates";
const FCFJ = "https://www.gov.uk/guidance/free-courses-for-jobs";

const CUSTOMER_SALES: RouteSpec[] = [
  {
    id: "customer-service-manager",
    why: "Handling complaints, coaching staff and hitting service targets is the job, moved from a shop floor to a contact centre or service team.",
  },
  {
    id: "sales-representative",
    why: "Selling face to face, knowing your products and reading customers carry into business-to-business sales, where you sell to organisations instead of shoppers.",
    aiSlug: "sales-representative",
    jobsQuery: "sales executive",
  },
  {
    id: "estate-agent",
    why: "Talking to the public all day, following up leads and closing a sale are estate agency basics.",
    aiSlug: "estate-agent",
  },
  {
    id: "mortgage-adviser",
    why: "Explaining products clearly and handling money conversations with care. It is regulated work, so expect exams and checks.",
    note: "The National Careers Service says you register as an approved person with the Financial Conduct Authority.",
    aiSlug: "mortgage-broker",
  },
  {
    id: "recruitment-consultant",
    why: "Recruitment is sales with people as the product: targets, phone work and building relationships with clients and candidates.",
    aiSlug: "recruitment-consultant",
  },
];

const OFFICE: RouteSpec[] = [
  {
    id: "office-manager",
    why: "Rotas, ordering, cash reconciliation and staff issues are office management already, just in a shop.",
    aiSlug: "office-manager",
  },
  {
    id: "hr-officer",
    why: "Supervisors and managers already recruit, induct and manage staff, and deal with absence and disciplinaries. HR does that full time.",
  },
  {
    id: "bookkeeper",
    why: "Cashing up, reconciling tills and spotting discrepancies build the accuracy bookkeeping needs.",
    aiSlug: "bookkeeper",
  },
  {
    id: "civil-service-executive-officer",
    why: "Dealing with the public, following procedures and working to targets. The National Careers Service says a university qualification is not essential.",
    aiSlug: "civil-servant",
    jobsQuery: "civil service executive officer",
  },
];

const OPERATIONS: RouteSpec[] = [
  {
    id: "warehouse-manager",
    why: "Stock control, deliveries, rotas and health and safety are shared with warehouse work.",
  },
  {
    id: "train-conductor",
    why: "Customer service, safety announcements and handling difficult passengers, at a much higher median than shop work.",
  },
  {
    id: "bus-driver",
    why: "Serving the public all day, from the driving seat. You need the bus licence and the Driver CPC.",
  },
];

const TECH_CARE: RouteSpec[] = [
  {
    id: "it-support-technician",
    why: "Patient, step-by-step help for someone who is stuck is customer service. The technical knowledge is new, and the level 3 apprenticeship teaches it on the job.",
  },
  {
    id: "healthcare-assistant",
    why: "Being calm and kind with the public is central to healthcare support work, and the level 2 apprenticeship is the shortest on this page.",
    aiSlug: "care-assistant",
  },
];

const GROUPS = [
  { id: "customer-sales", title: "Customer and sales roles that pay more", intro: "The skills you use every day, in jobs where they are paid better at the median.", specs: CUSTOMER_SALES },
  {
    id: "office",
    title: "Office, people and money",
    intro: "Good moves from supervisor level. If you already manage a store, note that HR officer and office manager medians are close to or below the retail manager median.",
    specs: OFFICE,
  },
  { id: "operations", title: "Operations and transport", intro: "Shift work you are used to, at higher medians than shop work.", specs: OPERATIONS },
  { id: "tech-care", title: "Tech support and care", intro: "Two routes with short apprenticeships: typically 8 months for healthcare support and 18 for IT support.", specs: TECH_CARE },
];

const ALL_SPECS = GROUPS.flatMap((g) => g.specs);

export default function RetailHubPage() {
  const assistant = ftMedian(ASSISTANT) as number;
  const assistantAll = allMedian(ASSISTANT) as number;
  const manager = ftMedian(MANAGER) as number;
  const routes = resolveRoutes(ALL_SPECS);
  const aboveManager = routes.filter((r) => r.basis === "ft" && r.median !== null && r.median > manager);
  const top = [...routes].filter((r) => r.basis === "ft").sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0];

  const facts: Fact[] = [
    {
      figure: formatGBP(assistant),
      text: (
        <>
          ONS median full-time pay for sales and retail assistants, tax year to April 2025. Counting part-time jobs too,
          the median was {formatGBP(assistantAll)}.
        </>
      ),
      source: ASHE.short,
      href: ASHE.href,
      published: ASHE.published,
    },
    {
      figure: gbpFt(MANAGER),
      text: <>ONS median full-time pay for managers and directors in retail and wholesale. Retail sales supervisors: {gbpFt(SUPERVISOR)}.</>,
      source: ASHE.short,
      href: ASHE.href,
      published: ASHE.published,
    },
    {
      figure: "£12.71",
      text: "an hour: the National Living Wage for workers aged 21 and over from April 2026.",
      source: "GOV.UK, National Minimum Wage and National Living Wage rates",
      href: NMW,
      published: "checked 28 September 2026",
    },
    {
      figure: "£25,750",
      text: "the earnings limit for Free Courses for Jobs in England. Earn below it and you can get a level 3 qualification free. The full-time retail assistant median is below it.",
      source: "GOV.UK, Free courses for jobs",
      href: FCFJ,
      published: "2025-07-29",
    },
    {
      figure: "£8",
      text: "an hour: the minimum an employer can pay in the first year of an apprenticeship, even if you are over 19. Check the advertised pay before you leave a better-paid job.",
      source: "GOV.UK, National Minimum Wage and National Living Wage rates",
      href: NMW,
      published: "checked 28 September 2026",
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: "What jobs can I do after working in retail?",
      answer: `Customer service management, business sales, estate agency, mortgage advice, recruitment, office and HR work, bookkeeping, the Civil Service, warehouse management, rail and bus work, IT support and healthcare support all use retail skills. All 14 on this page have a higher ONS full-time median than sales and retail assistants (${formatGBP(assistant)}, ONS ASHE 2025).`,
    },
    {
      question: "What pays more than retail without a degree?",
      answer: `None of the 14 jobs on this page usually needs a degree. The highest ONS full-time median among them is ${top.title.toLowerCase()} at ${formatGBP(top.median as number)}, then train conductor at ${gbpFt("6214")} (ONS ASHE 2025). Both have a level 2 or 3 apprenticeship.`,
    },
    {
      question: "Can I get a free qualification if I work in retail?",
      answer:
        "Often, yes. In England, if you are 19 or over and earn below £25,750 or are unemployed, Free Courses for Jobs pays for a level 3 qualification, in subjects including accounting, business management, digital, and health and social care. Skills Bootcamps are free courses of up to 16 weeks with a guaranteed job interview at the end.",
    },
    {
      question: "How do I move from retail into an office job?",
      answer:
        "Start from what you already do: rotas, cash handling, stock and staff issues. Office manager, HR officer, bookkeeper and civil service executive officer roles all have documented routes without a degree, and most have a level 2 or 3 apprenticeship. Put figures on your CV, such as team size, takings or targets met.",
    },
    {
      question: "Can a retail manager move into HR?",
      answer: `Yes, but check the pay. The ONS full-time median for HR officers was ${gbpFt("3571")}, below the ${formatGBP(manager)} median for retail managers, while HR managers had ${gbpFt("1136")} (ONS ASHE 2025). The National Careers Service names CIPD qualifications for HR roles, and the level 5 People professional apprenticeship is typically 22 months.`,
    },
    {
      question: "Is recruitment a good move from retail?",
      answer: `It uses the same sales and people skills. The ONS full-time median for the group that includes recruitment consultants was ${gbpFt("3571")} (ONS ASHE 2025), ${formatGBP((ftMedian("3571") as number) - assistant)} more than retail assistants. The Skills England Recruiter apprenticeship is level 3 and typically 18 months.`,
    },
    {
      question: "Can I become a mortgage adviser without a degree?",
      answer:
        "Yes. The National Careers Service lists college, apprenticeship and on-the-job routes. The Skills England Mortgage adviser apprenticeship is level 3 and typically 12 months. You register as an approved person with the Financial Conduct Authority and pass a credit check and background checks.",
    },
    {
      question: "What does a train conductor earn?",
      answer: `The ONS full-time median for rail travel assistants, which includes conductors, was ${gbpFt("6214")} (ONS ASHE 2025). The Skills England Passenger transport operative apprenticeship is level 2 and typically 12 months. The National Careers Service lists a medical check and drug and alcohol screening.`,
    },
    {
      question: "Can I do an apprenticeship if I already work in retail?",
      answer:
        "Yes. GOV.UK's only age rule is that you are 16 or over, and you can already hold qualifications, including a degree. Your employer and provider cannot charge you for the training. Check the pay: employers can pay £8 an hour in your first year, even if you are over 19.",
    },
    {
      question: "What is the National Living Wage in 2026?",
      answer:
        "£12.71 an hour for workers aged 21 and over from April 2026, £10.85 for 18 to 20 year olds, and £8 for under-18s and apprentices in their first year (GOV.UK).",
    },
    {
      question: "Why is ONS retail pay so much lower for all employees?",
      answer: `Because many retail jobs are part time. The ONS median for sales and retail assistants was ${formatGBP(assistant)} for full-time jobs but ${formatGBP(assistantAll)} across all jobs, including part-time ones (ONS ASHE 2025). This page compares full-time figures only.`,
    },
    {
      question: "How long does it take to leave retail?",
      answer:
        "Direct applications, such as customer service or recruitment roles, can take as long as a normal job search. Most apprenticeships on this page take 8 to 18 months while you are paid, and a Skills Bootcamp is up to 16 weeks.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Leaving your job", href: "/careers-for" }, { name: "Leaving retail" }]} />}
        kicker="Leaving retail"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            Full-time sales and retail assistants had a median of {formatGBP(assistant)} in 2025 (ONS ASHE). All 14 jobs
            below pay more at the median, none usually needs a degree, and most have a paid apprenticeship. The best paid
            is {top.title.toLowerCase()} at {formatGBP(top.median as number)}.{" "}
            {countWord(aboveManager.length)} beat the {formatGBP(manager)} retail manager median too.
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#in-numbers", label: "Retail pay in numbers" },
            { href: "#at-a-glance", label: "14 routes at a glance" },
            { href: "#routes", label: "Each route in detail" },
            { href: "#funded", label: "Free and funded retraining" },
            { href: "#faq", label: "Common questions" },
            { href: "#method", label: "How we worked this out" },
          ]}
        />
      </PageHeader>

      <HubSection id="in-numbers" title="Retail pay in numbers" intro={<p>The figures to know before you move, each from the body that publishes it.</p>}>
        <FactList facts={facts} />
      </HubSection>

      <ToolCallout
        current="retail assistant"
        heading="Leaving retail? See where your own experience fits"
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
        title="14 routes out of retail at a glance"
        intro={
          <p>
            The change column compares each job&apos;s ONS full-time median with the {formatGBP(assistant)} full-time
            median for sales and retail assistants. If you manage a store, compare with {formatGBP(manager)} instead.
          </p>
        }
      >
        <HubPayTable
          caption="Where retail workers can go, and what it pays"
          description="Median gross annual pay for full-time employees, UK, tax year to April 2025."
          routes={routes}
          comparator={{ header: "Change vs retail assistant", mobileLabel: "vs retail assistant", value: assistant }}
        />
      </HubSection>


      <HubSection
        id="routes"
        title="Each route in detail"
        intro={<p>For each job: why retail skills carry over, the realistic way in, the checks listed for it, and the ONS figure with its caveats.</p>}
      >
        {GROUPS.map((g) => (
          <div key={g.id} id={g.id} className="mt-10 scroll-mt-24">
            <h3 className="font-sans text-2xl font-bold text-ink">{g.title}</h3>
            <p className="mt-2 max-w-reading text-ink-2">{g.intro}</p>
            <HubRouteCards
              routes={routes.filter((r) => g.specs.some((s) => s.id === r.id))}
              from="Retail assistant"
              fromPay={assistant}
              headingLevel={4}
            />
          </div>
        ))}
      </HubSection>

      <HubSection id="funded" title="Free and funded ways to retrain">
        <FundedTraining
          lead={
            <p>
              Retail pay often qualifies you for free training. If you earn under £25,750, Free Courses for Jobs can cover
              a level 3 qualification, and an apprenticeship lets you earn while you train. These are the schemes for
              England; Scotland, Wales and Northern Ireland run their own.
            </p>
          }
          bootcampFit="Subjects include digital skills, business and administration, HGV driving, and health and social care."
        >
          <div className="mt-4">
            <SourceNote source="GOV.UK, Free courses for jobs" href={FCFJ} published="2025-07-29" />
          </div>
        </FundedTraining>
      </HubSection>

      <ToolCallout
        id="check-your-options-2"
        current="retail assistant"
        heading="Not sure which route fits you?"
        body={<p>Tell us your role, or paste your CV, and see which of these jobs your experience points to, with the gaps to close.</p>}
        className="mt-14"
      />

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            Pay changes compare each job&apos;s full-time median with the ONS full-time median for sales and retail
            assistants (SOC 7111), {formatGBP(assistant)}. Retail managers (SOC 1150, {formatGBP(manager)}) and retail
            sales supervisors (SOC 7132, {gbpFt(SUPERVISOR)}) are shown for comparison.
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional)", href: ASHE.href, date: "published 23 October 2025" },
          { name: "GOV.UK, National Minimum Wage and National Living Wage rates", href: NMW, date: "checked 28 September 2026" },
          { name: "GOV.UK, Free courses for jobs (DWP)", href: FCFJ, date: "updated 29 July 2025" },
          { name: "National Careers Service job profiles (routes, checks and requirements for each job)", href: "https://nationalcareers.service.gov.uk/job-profiles/mortgage-adviser", date: "retrieved 28 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?current=retail%20assistant", label: "Analyse my CV", note: "Free, no account: see which routes your experience fits." },
          { href: "/jobs?q=customer%20service", label: "Live customer service jobs", note: "Search current UK vacancies." },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree", note: "More well-paid routes with no degree needed." },
          { href: "/transferable-skills", label: "Transferable skills", note: "How to describe shop-floor skills to other employers." },
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "/career-change-at-50", label: "Career change at 50" },
          { href: "https://aicareerswap.com/will-ai-replace/retail-cashier", label: "Will AI replace retail cashiers?", note: "Our sister site on AI and retail." },
          { href: "/careers-for", label: "Career change from other jobs", note: "Hospitality, cabin crew, hairdressing and more." },
        ]}
      />
    </HubPage>
  );
}
