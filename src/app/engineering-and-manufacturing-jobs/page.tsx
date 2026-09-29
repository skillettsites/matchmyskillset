import type { Metadata } from "next";
import { Breadcrumbs, FaqSection, PageHeader, ToolCallout, formatGBP, type FaqItem } from "@/components/content";
import {
  ArticleJsonLd,
  AudienceCards,
  FundedTraining,
  HubPage,
  HubPayTable,
  HubRouteCards,
  HubSection,
  LiveJobLinks,
  MethodNote,
  OnThisPage,
  OtherCareers,
  RelatedLinks,
  SourcesList,
  ASHE,
  resolveRoutes,
  ukFullTimeMedian,
  type AudienceCard,
  type RouteSpec,
} from "@/components/hubs";
import { assertHubRoutes } from "@/lib/skills/families";
import { capitalise, titleInSentence } from "@/lib/text";

const PATH = "/engineering-and-manufacturing-jobs";
const UPDATED = "2026-09-29";
const TITLE = "Engineering and manufacturing jobs: careers, pay and the ways in";
const DESCRIPTION =
  "Engineering and manufacturing careers with ONS pay and routes in, from maintenance and CNC to robotics, automation and 3D printing. Match your CV free.";

export const metadata: Metadata = {
  title: { absolute: "Engineering and Manufacturing Jobs UK: Careers and Pay" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

const HANDS_ON: RouteSpec[] = [
  {
    id: "maintenance-fitter",
    why: "The backbone of any factory: planned maintenance, breakdowns and fault finding on production machinery. Multi-skilled maintenance, electrical and mechanical, leads naturally towards automation work.",
    jobsQuery: "Maintenance engineer",
  },
  {
    id: "engineering-technician",
    why: "Builds, tests and maintains equipment alongside engineers in manufacturing, energy and defence. ONS codes commissioning engineers and wind turbine technicians to the same pay group.",
  },
  {
    id: "electrical-electronics-technician",
    why: "Tests, services and repairs electrical and electronic equipment and control panels from schematics: a natural first step into electronics, controls and automation.",
    jobsQuery: "Electronics technician",
  },
  {
    id: "field-service-engineer",
    why: "Installs, services and repairs machines at customers' sites, so it suits people who like variety, fault finding on the spot and dealing with customers.",
  },
  {
    id: "cnc-machinist",
    why: "Sets up and runs computer-controlled machine tools to make precision parts from drawings. Setting and programming skills lead on to CAM programming, inspection and automation.",
  },
  {
    id: "3d-printing-technician",
    why: "Prepares files, runs and maintains 3D printers and finishes printed parts: one of the newer ways into advanced manufacturing.",
  },
];

const AUTOMATION: RouteSpec[] = [
  {
    id: "automation-technician",
    why: "Keeps robots and automated lines running: fault finding, planned maintenance and changes to PLC programs. The next step for maintenance and electrical technicians who want to specialise.",
  },
  {
    id: "automation-engineer",
    why: "Designs, programs and commissions the PLC, drive and operator-screen systems behind automated machines and lines.",
  },
  {
    id: "robotics-engineer",
    why: "Designs and programs robot cells, from choosing the robot and tooling to proving the program safe and handing it to production.",
  },
  {
    id: "mechatronics-engineer",
    why: "Works across mechanical, electrical and control engineering on machines that combine all three, such as packaging lines and automated test rigs.",
  },
  {
    id: "embedded-software-engineer",
    why: "Writes the software inside machines, sensors and connected devices: the software side of Industry 4.0.",
  },
];

const DESIGN: RouteSpec[] = [
  {
    id: "mechanical-engineer",
    why: "Designs machines, parts and equipment in CAD and proves them with calculations and tests before they are built.",
  },
  {
    id: "electrical-engineer",
    why: "Designs and looks after power distribution, motor control and the electrical side of machines and plant.",
  },
  {
    id: "electronics-engineer",
    why: "Designs and tests circuit boards, sensors and the electronics inside connected products.",
  },
  {
    id: "additive-manufacturing-engineer",
    why: "Decides what to 3D print and how: designing for additive manufacturing, choosing materials and machine settings, and proving parts meet the specification.",
  },
];

const OPERATIONS: RouteSpec[] = [
  {
    id: "manufacturing-engineer",
    why: "Improves how products are made: line layouts, tooling, new equipment and fixing the causes of defects. Continuous improvement experience from the shop floor counts here.",
  },
  {
    id: "quality-engineer",
    why: "Stops defects reaching customers: inspection plans, audits against standards such as ISO 9001, and root cause investigations when something goes wrong.",
  },
  {
    id: "production-manager",
    why: "Runs a factory's output day to day: people, plans, quality, safety and cost. The National Careers Service describes starting as an engineering technician or quality control officer and moving up through training and promotion.",
  },
  {
    id: "project-engineer",
    why: "Delivers engineering projects such as new production lines, equipment installs and plant upgrades, keeping design, suppliers, budget and installation on track.",
  },
];

const COMMERCIAL: RouteSpec[] = [
  {
    id: "technical-sales-engineer",
    why: "Sells engineering products, equipment and services by understanding what the customer needs and specifying the right solution. It suits engineers and technicians who like working with customers.",
  },
  {
    id: "data-analyst",
    why: "Turns production, quality and machine data into decisions. Connected machines and sensors make more of that data available in modern factories.",
  },
];

const GROUPS = [
  {
    id: "hands-on",
    title: "Maintenance, machining and technician roles",
    from: "Hands-on technical work",
    intro: "Roles with documented routes that do not need a degree, through apprenticeships, college courses or experience.",
    specs: HANDS_ON,
  },
  {
    id: "automation",
    title: "Automation, robotics and embedded systems",
    from: "Maintenance, electrical or technician work",
    intro: "The Industry 4.0 core. Technicians can move in through automation maintenance; the engineering roles usually need a degree or a degree apprenticeship.",
    specs: AUTOMATION,
  },
  {
    id: "design",
    title: "Engineering and design",
    from: "An engineering degree or apprenticeship",
    intro: "Professional engineering roles. Degree apprenticeships are a paid alternative to a full-time degree.",
    specs: DESIGN,
  },
  {
    id: "operations",
    title: "Manufacturing, quality and operations",
    from: "Production or engineering experience",
    intro: "Roles that improve, check and run production, and deliver the projects that change it.",
    specs: OPERATIONS,
  },
  {
    id: "commercial",
    title: "Commercial and data roles",
    from: "Engineering or manufacturing experience",
    intro: "For experienced people who want to use their technical knowledge with customers or with data.",
    specs: COMMERCIAL,
  },
];

const ALL_SPECS = GROUPS.flatMap((g) => g.specs);
// The matcher boosts these routes for people in engineering and manufacturing jobs; this keeps the two lists the same.
assertHubRoutes("engineering", ALL_SPECS);

const AUDIENCES: AudienceCard[] = [
  {
    kicker: "Leaving the forces",
    title: "Ex-military technicians and engineers",
    text: "Maintenance, electrical, electronics and aircraft trades lead into civilian maintenance, automation and advanced manufacturing roles.",
    href: "/jobs-for-ex-military",
    linkLabel: "Jobs for ex-military",
  },
  {
    kicker: "Starting out",
    title: "Graduates and early-career engineers",
    text: "Where an engineering degree or degree apprenticeship leads in advanced manufacturing, with ONS pay ranges.",
    href: "/graduate-engineering-jobs",
    linkLabel: "Graduate engineering jobs",
  },
  {
    kicker: "Moving up",
    title: "Technicians and operators moving into automation",
    text: "From maintenance, CNC or electrical work into automation, robotics and AI-enabled production, and the apprenticeships that get you there.",
    href: "/robotics-and-automation-jobs#upskill",
    linkLabel: "Robotics and automation jobs",
  },
  {
    kicker: "Experienced",
    title: "Commercial, operations, service and product people",
    text: "Production management, quality, projects, field service, technical sales and data roles in advanced manufacturing.",
    href: "#operations",
    linkLabel: "See these careers",
  },
];

const LIVE_TERMS = [
  "Maintenance engineer",
  "Automation engineer",
  "Robotics engineer",
  "Field service engineer",
  "Manufacturing engineer",
  "CNC machinist",
  "Quality engineer",
  "Mechanical design engineer",
  "Electrical engineer",
  "3D printing",
];

const NCS = "https://nationalcareers.service.gov.uk/explore-careers";

export default function EngineeringHubPage() {
  const uk = ukFullTimeMedian();
  const routes = resolveRoutes(ALL_SPECS);
  const ft = routes.filter((r) => r.basis === "ft" && r.median !== null).sort((a, b) => (b.median ?? 0) - (a.median ?? 0));
  const top = ft[0];
  const higher = ft.filter((r) => (r.median ?? 0) > uk);
  const noDegree = routes.filter((r) => !r.degreeUsuallyRequired);
  const noDegreeTop = [...noDegree].filter((r) => r.basis === "ft").sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0];
  const byId = (id: string) => routes.find((r) => r.id === id)!;
  const maintenance = byId("maintenance-fitter");
  const automationTech = byId("automation-technician");
  const automationStd = automationTech.apprenticeships.find((s) => s.referenceNumber === "ST0662");

  const faqs: FaqItem[] = [
    {
      question: "Which engineering and manufacturing jobs pay the most?",
      answer: `Of the ${routes.length} careers in this guide, ${titleInSentence(top.title)} has the highest ONS full-time median, ${formatGBP(top.median as number)}, and ${higher.length} pay more than the UK full-time median of ${formatGBP(uk)} (ONS ASHE 2025). A median covers everyone in the ONS group, from new starters to people with decades of experience, so it is not a starting salary.`,
    },
    {
      question: "Can I get into engineering without a degree?",
      answer: `Yes. ${noDegree.length} of the ${routes.length} careers here have a documented route below degree level, through an apprenticeship, a college course or experience. The best paid of them at the ONS median is ${titleInSentence(noDegreeTop.title)} at ${formatGBP(noDegreeTop.median as number)} (ONS ASHE 2025). Professional roles such as robotics engineer usually need a degree, but degree apprenticeships let you earn while you get one.`,
    },
    {
      question: "What is Industry 4.0?",
      answer:
        "It is the name for bringing connected, data-driven technology into production: robots and collaborative robots, automated lines run by PLCs, 3D printing (additive manufacturing), sensors that report how machines are running, and software, including AI, that uses that data to spot defects or plan maintenance. The jobs are the people who design, program, run and maintain it.",
    },
    {
      question: "What does a maintenance engineer earn in the UK?",
      answer: `ONS codes maintenance engineers and fitters to metal working production and maintenance fitters and technicians (SOC 2020 unit group 5223), which had a full-time median of ${formatGBP(maintenance.median as number)} in 2025 (ONS ASHE 2025). The figure covers the whole group, including automation technicians who maintain automated equipment.`,
    },
    {
      question: "How do I move from maintenance into automation?",
      answer: automationStd
        ? `Build on fault finding with PLC, drives and robot skills, then look at automation technician roles. Skills England's ${automationStd.title} apprenticeship is level ${automationStd.level} and typically takes ${automationStd.typicalDurationMonths} months, and an apprenticeship is open at any adult age in England. Our robotics and automation guide has the full set of routes.`
        : "Build on fault finding with PLC, drives and robot skills, then look at automation technician roles. Our robotics and automation guide has the apprenticeships and routes.",
    },
    {
      question: "Are there engineering apprenticeships for adults?",
      answer:
        "Yes. GOV.UK's only age rule is that you are 16 or over, living in England and not in full-time education, and you can already hold a degree. Your employer and training provider must not ask you to pay for the training. Check the pay: employers can pay the apprentice rate of £8 an hour in your first year.",
    },
    {
      question: "Does MatchMySkillset only work for engineering jobs?",
      answer:
        "No. Our guides focus on engineering, manufacturing and Industry 4.0, but the CV match works for any job: we pick out your skills and score live UK adverts in any field against them.",
    },
    {
      question: "Where does the pay data come from?",
      answer:
        "From the ONS Annual Survey of Hours and Earnings 2025 (provisional), Table 14.7a, published on 23 October 2025: median gross annual pay for full-time employees in the UK. ONS publishes the 2026 figures on 22 October 2026, and we will update the page then.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Engineering and manufacturing careers" }]} />}
        kicker="Engineering, manufacturing and Industry 4.0"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            From maintenance and machining to robotics, automation and 3D printing: {routes.length} careers with ONS pay and the real ways
            in. {capitalise(titleInSentence(top.title))} has the highest median here at {formatGBP(top.median as number)}, and {noDegree.length} of the{" "}
            {routes.length} have a documented route that does not need a degree (ONS ASHE 2025). Upload your CV and we score live adverts
            against your skills; it works for any other job too.
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#who", label: "Who this guide is for" },
            { href: "#at-a-glance", label: `${routes.length} careers at a glance` },
            { href: "#routes", label: "Each career in detail" },
            { href: "#industry-4", label: "What Industry 4.0 means for jobs" },
            { href: "#live-jobs", label: "Search live jobs" },
            { href: "#funded", label: "Free and funded training" },
            { href: "#other-careers", label: "Other careers" },
            { href: "#faq", label: "Common questions" },
          ]}
        />
      </PageHeader>

      <HubSection id="who" title="Who this guide is for" intro={<p>We wrote it for four groups of people. Pick yours for a guide that starts where you are.</p>}>
        <AudienceCards items={AUDIENCES} />
      </HubSection>

      <ToolCallout
        looking="Engineering and manufacturing"
        heading="See the engineering jobs your CV fits"
        body={
          <p>
            Upload your CV and we pick out your skills, from fault finding and PLC programming to CAD and quality systems, then score live UK
            adverts against them. Free, with no account.
          </p>
        }
        className="mt-12"
      />

      <HubSection
        id="at-a-glance"
        title={`${routes.length} careers at a glance`}
        intro={
          <p>
            The change column compares each career&apos;s ONS full-time median with the UK full-time median for all employees,{" "}
            {formatGBP(uk)}. Where careers share an ONS group they share its figure.
          </p>
        }
      >
        <HubPayTable
          caption="Engineering and manufacturing careers and what they pay"
          description="Median gross annual pay for full-time employees, UK, tax year to April 2025."
          routes={routes}
          comparator={{ header: "Change vs UK full-time median", mobileLabel: "vs UK median", value: uk }}
        />
      </HubSection>

      <HubSection
        id="routes"
        title="Each career in detail"
        intro={<p>For each career: what the work is, the realistic way in, whether you need a degree, and the ONS figure with its caveats.</p>}
      >
        {GROUPS.map((g) => (
          <div key={g.id} id={g.id} className="mt-10 scroll-mt-24">
            <h3 className="font-sans text-2xl font-bold text-ink">{g.title}</h3>
            <p className="mt-2 max-w-reading text-ink-2">{g.intro}</p>
            <HubRouteCards routes={routes.filter((r) => g.specs.some((s) => s.id === r.id))} from={g.from} headingLevel={4} />
          </div>
        ))}
      </HubSection>

      <HubSection id="industry-4" title="What Industry 4.0 means for jobs">
        <div className="prose-mms mt-5">
          <p>
            Industry 4.0 is the name for connecting machines, sensors and data in production. In practice that means robots and collaborative
            robots on the line, automated equipment run by PLCs and operator screens, 3D printing for parts and tooling, sensors that report how
            machines are running, and software, including AI, that uses the data to catch defects or plan maintenance before a breakdown.
          </p>
          <p>It creates work at every level:</p>
          <ul>
            <li>
              <strong>Keeping it running:</strong> maintenance engineers and automation technicians who can fault-find across mechanical,
              electrical and control systems.
            </li>
            <li>
              <strong>Designing and programming it:</strong> automation, robotics, mechatronics and embedded software engineers.
            </li>
            <li>
              <strong>Making things with it:</strong> CNC machinists, 3D printing technicians and additive manufacturing engineers.
            </li>
            <li>
              <strong>Running and improving production:</strong> manufacturing and quality engineers, production managers and data analysts.
            </li>
          </ul>
          <p>
            When you upload your CV we look for these skills by name, including PLC programming, robot programming, SCADA and HMI, industrial
            automation, additive manufacturing, machine vision, IoT, and preventive and predictive maintenance, so the match reflects them.
          </p>
        </div>
      </HubSection>

      <HubSection
        id="live-jobs"
        title="Search live jobs"
        intro={<p>Live UK adverts from Reed, Adzuna and more, and jobs posted on MatchMySkillset. Upload your CV first and each one gets a match score.</p>}
      >
        <LiveJobLinks terms={LIVE_TERMS} />
      </HubSection>

      <HubSection id="funded" title="Free and funded training">
        <FundedTraining
          lead={<p>These are the main free and funded ways to train in England. Scotland, Wales and Northern Ireland run their own schemes.</p>}
          bootcampFit="Subjects include technical skills such as engineering, and digital skills such as data."
        />
      </HubSection>

      <HubSection
        id="other-careers"
        title="Other careers"
        intro={<p>Not in engineering? Our guides for other jobs, and the CV match itself, work for any background.</p>}
      >
        <OtherCareers />
      </HubSection>

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            The change column compares each career&apos;s full-time median with the UK full-time median for all employees, {formatGBP(uk)}. Each
            career is placed in the SOC 2020 unit group the ONS coding index gives for its title: for example ONS codes a professional
            automation engineer with production and process engineers (2125), and an automation engineer who maintains equipment with
            maintenance fitters and technicians (5223).
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional)", href: ASHE.href, date: "published 23 October 2025" },
          {
            name: "ONS, SOC 2020 Volume 2: the coding index (version 14)",
            href: "https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020/soc2020volume2codingrulesandconventions",
            date: "retrieved 29 September 2026",
          },
          { name: "National Careers Service job profiles (routes into each career)", href: NCS, date: "retrieved 29 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 29 September 2026" },
          { name: "GOV.UK, Become an apprentice", href: "https://www.gov.uk/become-apprentice", date: "checked 28 September 2026" },
          { name: "GOV.UK, Free courses for jobs", href: "https://www.gov.uk/guidance/free-courses-for-jobs", date: "updated 29 July 2025" },
          { name: "Department for Education, Skills for Careers: Skills Bootcamps", href: "https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp", date: "checked 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover", label: "Upload your CV", note: "Free, no account: live jobs scored against your skills." },
          { href: "/robotics-and-automation-jobs", label: "Robotics and automation jobs", note: "Technician to engineer, and how to move up." },
          { href: "/3d-printing-jobs", label: "3D printing and additive manufacturing jobs" },
          { href: "/graduate-engineering-jobs", label: "Graduate engineering jobs" },
          { href: "/jobs-for-ex-military", label: "Jobs for ex-military technicians and engineers" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
        ]}
      />
    </HubPage>
  );
}
