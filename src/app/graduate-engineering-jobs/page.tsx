import type { Metadata } from "next";
import { Breadcrumbs, FaqSection, PageHeader, SourceNote, ToolCallout, formatGBP, type FaqItem } from "@/components/content";
import {
  ApprenticeshipTable,
  ArticleJsonLd,
  HubPage,
  HubRouteCards,
  HubSection,
  LiveJobLinks,
  MethodNote,
  OnThisPage,
  PayRangeTable,
  RelatedLinks,
  SourcesList,
  ASHE,
  resolveRoutes,
  type RouteSpec,
} from "@/components/hubs";
import { CAREERS_HREF } from "@/components/site";
import { getAsheUnitGroup, getSocUnitGroup } from "@/data/careers";
import { capitalise, titleInSentence } from "@/lib/text";

const PATH = "/graduate-engineering-jobs";
const UPDATED = "2026-09-29";
const TITLE = "Graduate engineering jobs: where your degree leads in Industry 4.0";
const DESCRIPTION =
  "Where an engineering degree or degree apprenticeship leads in advanced manufacturing: 11 engineering careers with ONS pay ranges and the ways in.";

export const metadata: Metadata = {
  title: { absolute: "Graduate Engineering Jobs UK: Pay and Industry 4.0 Routes" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

const SOC_VOL1 =
  "https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020/soc2020volume1structureanddescriptionsofunitgroups";
const NCS_MECH = "https://nationalcareers.service.gov.uk/job-profiles/mechanical-engineer";
const NCS_ELEC = "https://nationalcareers.service.gov.uk/job-profiles/electrical-engineer";
const NCS_ROBOTICS = "https://nationalcareers.service.gov.uk/job-profiles/robotics-engineer";

const CORE: RouteSpec[] = [
  {
    id: "mechanical-engineer",
    why: "The broadest route for a mechanical, manufacturing or product design degree: design and development work on machines, parts and equipment.",
    jobsQuery: "Graduate mechanical engineer",
  },
  {
    id: "electrical-engineer",
    why: "Power, motor control and machine electrics, in factories, energy and infrastructure. The electrical side of automation starts here.",
    jobsQuery: "Graduate electrical engineer",
  },
  {
    id: "electronics-engineer",
    why: "Circuit boards, sensors and the electronics inside connected products, a natural fit for an electronic or electrical and electronic degree.",
    jobsQuery: "Graduate electronics engineer",
  },
  {
    id: "manufacturing-engineer",
    why: "How products are made and how to make them better: processes, tooling, new equipment and lean improvement.",
    jobsQuery: "Graduate manufacturing engineer",
  },
  {
    id: "project-engineer",
    why: "Delivering engineering projects such as new lines and equipment, a role that shows you a project from start to finish.",
    jobsQuery: "Graduate project engineer",
  },
  {
    id: "quality-engineer",
    why: "Making sure products are made right first time, with statistics, root cause analysis and quality systems: a good fit if you like data and problem solving.",
    jobsQuery: "Graduate quality engineer",
  },
];

const INDUSTRY4: RouteSpec[] = [
  {
    id: "automation-engineer",
    why: "Programming and commissioning the control systems behind automated lines. Suits mechatronics, electrical and control engineering graduates.",
    jobsQuery: "Graduate automation engineer",
  },
  {
    id: "robotics-engineer",
    why: "Designing and programming robot cells. The National Careers Service lists degrees in robotics, mechatronics, mechanical or electronics engineering, computer science or maths.",
    jobsQuery: "Graduate robotics engineer",
  },
  {
    id: "mechatronics-engineer",
    why: "Machines that combine mechanical, electrical and control engineering, for graduates who do not want to pick one.",
  },
  {
    id: "additive-manufacturing-engineer",
    why: "Designing for 3D printing and running the process, for mechanical, materials or product design graduates.",
  },
  {
    id: "embedded-software-engineer",
    why: "Software for devices, controllers and IoT products, for electronics, computing or software graduates who like working close to the hardware.",
  },
];

export default function GraduateHubPage() {
  const core = resolveRoutes(CORE);
  const i40 = resolveRoutes(INDUSTRY4);
  const routes = [...core, ...i40];
  const ft = routes.filter((r) => r.basis === "ft" && r.median !== null).sort((a, b) => (b.median ?? 0) - (a.median ?? 0));
  const top = ft[0];
  const p25s = [...new Set(routes.map((r) => r.soc))]
    .map((soc) => getAsheUnitGroup(soc)?.ft.p25 ?? null)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const lowP25 = p25s[0];
  const highP25 = p25s[p25s.length - 1];
  const mechEntry = getSocUnitGroup("2122")?.entryRoutes ?? "";
  const robotics = routes.find((r) => r.id === "robotics-engineer")!;
  const roboticsDegreeApp = robotics.apprenticeships.find((s) => s.referenceNumber === "ST1317");

  const faqs: FaqItem[] = [
    {
      question: "What do graduate engineers earn in the UK?",
      answer: `ONS does not publish pay by years of experience in this table, so there is no official graduate figure. For the ${routes.length} careers here, the lower quartile, the point a quarter of full-time employees in each group earn less than, runs from ${formatGBP(lowP25)} to ${formatGBP(highP25)} (ONS ASHE 2025). Medians cover everyone in the group, so they are not starting salaries.`,
    },
    {
      question: "Which engineering jobs pay the most?",
      answer: `Of the careers here, ${titleInSentence(top.title)} has the highest ONS full-time median, ${formatGBP(top.median as number)} (ONS ASHE 2025). Pay varies a great deal by employer, sector and place, and ONS figures cover whole occupation groups.`,
    },
    {
      question: "Can I become an engineer without a degree?",
      answer:
        "Yes. ONS notes that incorporated engineers can qualify with a degree, a BTEC or SQA award, or an apprenticeship leading to a level 4 qualification. Degree apprenticeships are another way: you work and are paid while you earn the degree, and GOV.UK says your employer and training provider must not ask you to pay for the training.",
    },
    {
      question: "What is a degree apprenticeship?",
      answer: roboticsDegreeApp
        ? `An apprenticeship at level 6 or 7 that includes a degree or equivalent. For example, Skills England's ${roboticsDegreeApp.title} standard is level ${roboticsDegreeApp.level} and typically takes ${roboticsDegreeApp.typicalDurationMonths} months. The table on this page lists every degree-level standard linked to these careers. They apply in England.`
        : "An apprenticeship at level 6 or 7 that includes a degree or equivalent. The table on this page lists every degree-level standard linked to these careers. They apply in England.",
    },
    {
      question: "Is a mechanical engineering degree useful for robotics?",
      answer:
        "Yes. The National Careers Service lists degrees in artificial intelligence and robotics, mechatronics, robotics engineering, mechanical or electronics engineering, and computer science or maths as routes into robotics engineering.",
    },
    {
      question: "Do I need to be chartered to work as an engineer?",
      answer:
        "No, not to start. ONS says that after qualifying, periods of appropriate training and experience are needed before membership of a chartered engineering institution, so chartered status comes later in a career.",
    },
    {
      question: "How do I find graduate engineering jobs?",
      answer:
        "Search for graduate, trainee and junior titles in the field you want, and look at graduate schemes. The National Careers Service says work experience during your course, such as internships, placements and vacation schemes, can give you an advantage when applying for jobs or graduate training schemes. Upload your CV and we score live adverts against the skills you have, including your degree projects.",
    },
    {
      question: "What is Industry 4.0?",
      answer:
        "The name for bringing connected, data-driven technology into production: robots and automated lines, 3D printing, sensors that report how machines run, and software, including AI, that uses the data. Graduates design, program and improve those systems.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Engineering and manufacturing careers", href: CAREERS_HREF }, { name: "Graduate engineering jobs" }]} />}
        kicker="Graduates and early-career engineers"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            An engineering degree, or a degree apprenticeship, opens {routes.length} careers in advanced manufacturing below, from mechanical
            design to robotics and automation. {capitalise(titleInSentence(top.title))} has the highest ONS median of them at {formatGBP(top.median as number)};
            ONS does not publish graduate pay, so we show each group&apos;s lower quartile too (ONS ASHE 2025).
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#pay", label: "Pay ranges" },
            { href: "#careers", label: "The careers in detail" },
            { href: "#degree-apprenticeships", label: "Degree apprenticeships" },
            { href: "#chartered", label: "Chartered and incorporated engineers" },
            { href: "#finding", label: "Finding graduate roles" },
            { href: "#faq", label: "Common questions" },
          ]}
        />
      </PageHeader>

      <HubSection
        id="pay"
        title="Pay ranges"
        intro={
          <p>
            ONS publishes pay by occupation group, not by years of experience, so there is no official graduate salary. The lower quartile is the
            closest guide the data gives to the lower end of each group.
          </p>
        }
      >
        <PayRangeTable routes={routes} caption="Engineering careers for graduates: ONS pay ranges" />
      </HubSection>

      <ToolCallout
        looking="Graduate engineering roles"
        heading="See the graduate engineering jobs your CV fits"
        body={
          <p>
            Upload your CV, including your degree projects and placements, and we pick out skills such as CAD, simulation, PLC programming and
            project work, then score live adverts against them. Free, with no account.
          </p>
        }
        className="mt-12"
      />

      <HubSection id="careers" title="The careers in detail">
        <div className="mt-10">
          <h3 className="font-sans text-2xl font-bold text-ink">Core engineering roles</h3>
          <HubRouteCards routes={core} from="An engineering degree or degree apprenticeship" headingLevel={4} />
        </div>
        <div className="mt-10">
          <h3 className="font-sans text-2xl font-bold text-ink">Industry 4.0 roles</h3>
          <p className="mt-2 max-w-reading text-ink-2">Automation, robotics, 3D printing and embedded systems: the connected, data-driven side of production.</p>
          <HubRouteCards routes={i40} from="An engineering, computing or science degree" headingLevel={4} />
        </div>
      </HubSection>

      <HubSection
        id="degree-apprenticeships"
        title="Degree apprenticeships"
        intro={<p>Paid jobs that include a degree or equivalent. Your employer and training provider must not ask you to pay for the training (GOV.UK).</p>}
      >
        <ApprenticeshipTable routes={routes} minLevel={6} caption="Degree-level apprenticeships for these careers" />
      </HubSection>

      <HubSection id="chartered" title="Chartered and incorporated engineers">
        <div className="prose-mms mt-5">
          <p>ONS describes the entry routes for professional mechanical engineers like this:</p>
          <blockquote>{mechEntry}</blockquote>
          <SourceNote source="ONS, SOC 2020 Volume 1, unit group 2122 Mechanical engineers (professional)" href={SOC_VOL1} published="retrieved 28 September 2026" />
          <p>
            The entry text is much the same for electrical, electronics, production and process, and project engineers. In short: you can start
            work as a graduate engineer, and chartered status comes after further training and experience.
          </p>
        </div>
      </HubSection>

      <HubSection id="finding" title="Finding graduate roles">
        <div className="prose-mms mt-5">
          <ul>
            <li>
              Search for graduate, trainee and junior versions of the job you want, and for graduate schemes.
            </li>
            <li>
              Work experience counts. The National Careers Service says internships, placements and vacation schemes during your course can give
              you an advantage when you apply for jobs or graduate training schemes.
            </li>
            <li>
              Put your projects on your CV in detail: the software, tools and methods you used are the skills our matching, and employers, look
              for.
            </li>
          </ul>
          <SourceNote source="National Careers Service, Electrical engineer and Mechanical engineer" href={NCS_ELEC} published="retrieved 29 September 2026" />
        </div>
        <LiveJobLinks
          terms={["Graduate engineer", "Graduate mechanical engineer", "Graduate electrical engineer", "Graduate manufacturing engineer", "Graduate automation engineer", "Engineering graduate scheme", "Trainee engineer"]}
        />
      </HubSection>

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time figures unless stated." />

      <MethodNote
        baseline={
          <>
            ONS does not publish pay by years of experience in ASHE Table 14, so this page shows each group&apos;s lower quartile, median and
            upper quartile rather than a graduate figure. Each career is placed in the SOC 2020 unit group the ONS coding index gives for its
            title.
          </>
        }
      />

      <SourcesList
        items={[
          { name: "ONS, Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14 (2025 provisional)", href: ASHE.href, date: "published 23 October 2025" },
          { name: "ONS, SOC 2020 Volume 1: structure and descriptions of unit groups", href: SOC_VOL1, date: "retrieved 28 September 2026" },
          { name: "National Careers Service, Mechanical engineer", href: NCS_MECH, date: "retrieved 29 September 2026" },
          { name: "National Careers Service, Electrical engineer", href: NCS_ELEC, date: "retrieved 29 September 2026" },
          { name: "National Careers Service, Robotics engineer", href: NCS_ROBOTICS, date: "retrieved 29 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 29 September 2026" },
          { name: "GOV.UK, Become an apprentice", href: "https://www.gov.uk/become-apprentice", date: "checked 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?looking=Graduate%20engineering%20roles", label: "Upload your CV", note: "Free: see graduate engineering jobs scored against your skills." },
          { href: CAREERS_HREF, label: "Engineering and manufacturing jobs", note: "The full guide, from maintenance to design." },
          { href: "/robotics-and-automation-jobs", label: "Robotics and automation jobs" },
          { href: "/3d-printing-jobs", label: "3D printing and additive manufacturing jobs" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
        ]}
      />
    </HubPage>
  );
}
