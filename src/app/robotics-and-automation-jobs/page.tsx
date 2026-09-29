import type { Metadata } from "next";
import { Breadcrumbs, FaqSection, PageHeader, SourceNote, ToolCallout, formatGBP, type FaqItem } from "@/components/content";
import {
  ApprenticeshipTable,
  ArticleJsonLd,
  FundedTraining,
  HubPage,
  HubPayTable,
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
  ukFullTimeMedian,
  type RouteSpec,
} from "@/components/hubs";
import { CAREERS_HREF } from "@/components/site";

const PATH = "/robotics-and-automation-jobs";
const UPDATED = "2026-09-29";
const TITLE = "Robotics and automation jobs: pay, skills and how to get in";
const DESCRIPTION =
  "Robotics, automation, controls and mechatronics jobs with ONS pay, the skills that matter and the apprenticeships in, plus how technicians move up.";

export const metadata: Metadata = {
  title: { absolute: "Robotics and Automation Jobs UK: Pay, Skills, Routes In" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

const NCS_ROBOTICS = "https://nationalcareers.service.gov.uk/job-profiles/robotics-engineer";

const TECHNICIAN: RouteSpec[] = [
  {
    id: "automation-technician",
    why: "Keeps robots and automated lines running: fault finding across mechanical, electrical and control systems, planned maintenance, and changes to PLC programs to get a line back up.",
  },
  {
    id: "maintenance-fitter",
    why: "Multi-skilled maintenance on production lines builds the fault finding that automation work depends on, which makes it a natural first step.",
    jobsQuery: "Multi skilled maintenance engineer",
  },
  {
    id: "electrical-electronics-technician",
    why: "Control panels, sensors and drives are electrical and electronic equipment, so testing and repairing them from schematics is a direct way into controls work.",
    jobsQuery: "Electronics technician",
  },
];

const ENGINEER: RouteSpec[] = [
  {
    id: "automation-engineer",
    why: "Designs, programs and commissions the control systems behind automated machines: PLCs, drives, sensors and operator screens. Controls engineer and control and instrumentation engineer are other names for similar work.",
  },
  {
    id: "robotics-engineer",
    why: "Designs and programs robot cells, from choosing the robot and tooling to writing and proving the program and handing it to production.",
  },
  {
    id: "mechatronics-engineer",
    why: "Brings mechanical, electrical and control engineering together in one machine, such as packaging lines and automated test rigs.",
  },
  {
    id: "embedded-software-engineer",
    why: "Writes the software inside controllers, sensors and connected devices, the layer that robots and IoT products run on.",
  },
];

const SKILLS: { name: string; text: string }[] = [
  { name: "PLC programming", text: "Writing and changing the programs in programmable logic controllers, for example Siemens (TIA Portal) or Allen-Bradley (Studio 5000), in ladder logic or structured text." },
  { name: "Robot programming", text: "Teaching and programming industrial robots and cobots from makers such as FANUC, ABB, KUKA and Universal Robots, on the pendant or offline." },
  { name: "SCADA and HMI", text: "The operator screens and supervisory software that show and control what a line is doing." },
  { name: "Electrical fault finding", text: "Finding faults in control panels, wiring and three-phase equipment from drawings and schematics, safely." },
  { name: "Industrial automation", text: "Drives, servos, motion control and the industrial networks (Profinet, EtherCAT and others) that link them." },
  { name: "Sensors and instrumentation", text: "Choosing, fitting and calibrating the sensors that tell a machine what is happening." },
  { name: "Machine vision", text: "Cameras and software that inspect parts or guide robots." },
  { name: "Mechatronics", text: "Understanding how the mechanical, electrical and control sides of a machine work together." },
];

export default function RoboticsHubPage() {
  const uk = ukFullTimeMedian();
  const tech = resolveRoutes(TECHNICIAN);
  const eng = resolveRoutes(ENGINEER);
  const routes = [...tech, ...eng];
  const byId = (id: string) => routes.find((r) => r.id === id)!;
  const robotics = byId("robotics-engineer");
  const automation = byId("automation-engineer");
  const autoTech = byId("automation-technician");
  const std = (id: string, ref: string) => byId(id).apprenticeships.find((s) => s.referenceNumber === ref);
  const st0662 = std("automation-technician", "ST0662");
  const st1326 = std("automation-technician", "ST1326");
  const st1317 = std("robotics-engineer", "ST1317");
  const st1381 = std("robotics-engineer", "ST1381");

  const faqs: FaqItem[] = [
    {
      question: "How much does a robotics engineer earn in the UK?",
      answer: `ONS codes robotics engineers to engineering professionals not elsewhere classified (unit group 2129), which had a full-time median of ${formatGBP(robotics.median as number)} in 2025 (ONS ASHE 2025). That group is broad, so read it as a guide, and it is a median across all experience levels, not a starting salary.`,
    },
    {
      question: "How much does an automation engineer earn?",
      answer: `A professional automation or control engineer is coded by ONS to production and process engineers (2125): a full-time median of ${formatGBP(automation.median as number)}. An automation technician who maintains equipment is coded to maintenance fitters and technicians (5223): ${formatGBP(autoTech.median as number)} (ONS ASHE 2025).`,
    },
    {
      question: "Do I need a degree to work in robotics or automation?",
      answer:
        "Not for technician roles: automation technicians can come through maintenance or an apprenticeship at level 3 or 4. Robotics and automation engineer roles usually need a degree or a degree apprenticeship, according to the routes ONS and the National Careers Service describe.",
    },
    {
      question: "How do I become a robotics engineer?",
      answer:
        "The National Careers Service lists four routes: a degree in a subject such as robotics, mechatronics, or mechanical or electronics engineering; a college course that could lead to a robotics technician job; a level 6 degree apprenticeship; or starting as a robotics technician or junior engineer and studying for higher education qualifications while you work.",
    },
    {
      question: "Is there a robotics apprenticeship?",
      answer:
        st1317 && st1381
          ? `Yes. Skills England's ${st1317.title} standard is a level ${st1317.level} degree apprenticeship that typically takes ${st1317.typicalDurationMonths} months, and ${st1381.title} is level ${st1381.level}, typically ${st1381.typicalDurationMonths} months. For technicians, the ${st0662?.title ?? "automation and controls"} apprenticeship is level ${st0662?.level ?? 4}. They apply in England.`
          : "Yes, at degree level. Skills England lists robotics engineer and advanced robotics engineer standards, and an automation and controls engineering technician standard for technicians.",
    },
    {
      question: "Can a maintenance engineer move into automation?",
      answer: st0662
        ? `Yes. Add PLC, drives and robot skills to your fault finding, then apply for automation technician roles. The ${st0662.title} apprenticeship (level ${st0662.level}, typically ${st0662.typicalDurationMonths} months) and ${st1326 ? `${st1326.title} (level ${st1326.level})` : "mechatronics maintenance technician"} are both open to adults in England.`
        : "Yes. Add PLC, drives and robot skills to your fault finding, then apply for automation technician roles.",
    },
    {
      question: "What is a PLC?",
      answer:
        "A programmable logic controller: a rugged industrial computer that reads sensors and switches motors, valves and robots on and off to run a machine or line. Writing and changing PLC programs is a core skill in controls and automation work.",
    },
    {
      question: "What is the difference between an automation technician and an automation engineer?",
      answer:
        "Technicians mostly keep automated equipment running: maintenance, fault finding and program changes. Engineers mostly design, program and commission new systems. ONS reflects the difference by coding them to different groups (5223 and 2125), with different pay.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Engineering and manufacturing careers", href: CAREERS_HREF }, { name: "Robotics and automation jobs" }]} />}
        kicker="Robotics and automation"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            Robotics and automation work runs from technicians who keep automated lines running to engineers who design and program them.
            Automation technicians share an ONS group with maintenance fitters, with a full-time median of {formatGBP(autoTech.median as number)};
            professional automation engineers had {formatGBP(automation.median as number)} and robotics engineers{" "}
            {formatGBP(robotics.median as number)} (ONS ASHE 2025). Below: the careers, the skills and the ways in, including how technicians
            move up.
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#at-a-glance", label: "Pay at a glance" },
            { href: "#careers", label: "The careers in detail" },
            { href: "#skills", label: "The skills that matter" },
            { href: "#upskill", label: "From maintenance, CNC or electrical work into automation" },
            { href: "#graduates", label: "Graduates and degree apprenticeships" },
            { href: "#live-jobs", label: "Search live jobs" },
            { href: "#faq", label: "Common questions" },
          ]}
        />
      </PageHeader>

      <HubSection
        id="at-a-glance"
        title="Pay at a glance"
        intro={<p>The change column compares each ONS full-time median with the UK median for all full-time employees, {formatGBP(uk)}.</p>}
      >
        <HubPayTable
          caption="Robotics and automation careers and what they pay"
          description="Median gross annual pay for full-time employees, UK, tax year to April 2025."
          routes={routes}
          comparator={{ header: "Change vs UK full-time median", mobileLabel: "vs UK median", value: uk }}
        />
      </HubSection>

      <ToolCallout
        looking="Robotics and automation"
        heading="See the automation jobs your CV fits"
        body={
          <p>
            Upload your CV and we pick out skills such as fault finding, PLC programming and robot programming, then score live adverts against
            them, including roles that would be a step up. Free, with no account.
          </p>
        }
        className="mt-12"
      />

      <HubSection id="careers" title="The careers in detail">
        <div id="technician" className="mt-10 scroll-mt-24">
          <h3 className="font-sans text-2xl font-bold text-ink">Technician roles</h3>
          <p className="mt-2 max-w-reading text-ink-2">Hands-on roles with routes that do not need a degree.</p>
          <HubRouteCards routes={tech} from="Maintenance, electrical or production work" headingLevel={4} />
        </div>
        <div id="engineer" className="mt-10 scroll-mt-24">
          <h3 className="font-sans text-2xl font-bold text-ink">Engineering roles</h3>
          <p className="mt-2 max-w-reading text-ink-2">Design, programming and commissioning roles that usually need a degree or a degree apprenticeship.</p>
          <HubRouteCards routes={eng} from="An engineering degree, apprenticeship or technician role" headingLevel={4} />
        </div>
      </HubSection>

      <HubSection
        id="skills"
        title="The skills that matter"
        intro={<p>The technical skills these roles are built on. Our CV reader looks for each of them by name.</p>}
      >
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {SKILLS.map((s) => (
            <li key={s.name} className="tile p-6">
              <p className="text-[19px] font-bold tracking-[-0.02em] text-ink">{s.name}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ul>
      </HubSection>

      <HubSection
        id="upskill"
        title="From maintenance, CNC or electrical work into automation"
        intro={
          <p>
            Automation technician roles build on maintenance, electrical or production experience. The step up is adding control skills to the
            fault finding you already do.
          </p>
        }
      >
        <div className="prose-mms mt-6">
          <ol>
            <li>
              <strong>Build on what you have.</strong> Electrical and mechanical fault finding, reading drawings and working safely on live
              equipment are the base. If your experience is mechanical only, a multi-skilled maintenance role adds the electrical side.
            </li>
            <li>
              <strong>Add control skills.</strong> PLC programming, drives and robot programming, through an apprenticeship, a college course or
              training your employer pays for.
            </li>
            <li>
              <strong>Apply for automation technician roles,</strong> then move towards controls or automation engineering with experience and
              further study, such as an HNC or a degree apprenticeship.
            </li>
          </ol>
        </div>
        <ApprenticeshipTable routes={tech} caption="Apprenticeships for automation and maintenance technicians" />
        <p className="mt-4 max-w-reading text-[15px] text-ink-2">
          Apprenticeships have no upper age limit in England: GOV.UK&apos;s only age rule is that you are 16 or over. Upload your CV and tell us
          you want automation, and your results search for those roles first.
        </p>
      </HubSection>

      <HubSection
        id="graduates"
        title="Graduates and degree apprenticeships"
        intro={
          <p>
            The National Careers Service lists degrees in subjects such as robotics, mechatronics, mechanical or electronics engineering,
            computer science or maths for robotics engineering, and level 6 degree apprenticeships as a paid alternative.
          </p>
        }
      >
        <ApprenticeshipTable routes={eng} minLevel={6} caption="Degree-level apprenticeships for automation and robotics engineers" />
        <div className="mt-8">
          <PayRangeTable routes={eng} caption="Engineering roles: ONS pay ranges" />
        </div>
        <SourceNote className="mt-4" source="National Careers Service, Robotics engineer" href={NCS_ROBOTICS} published="retrieved 29 September 2026" />
      </HubSection>

      <HubSection id="live-jobs" title="Search live jobs" intro={<p>Live UK adverts from Reed, Adzuna and more, and jobs posted on MatchMySkillset.</p>}>
        <LiveJobLinks terms={["Automation engineer", "Automation technician", "Robotics engineer", "Robotics technician", "Controls engineer", "PLC programmer", "Mechatronics engineer", "Embedded software engineer"]} />
      </HubSection>

      <HubSection id="funded" title="Free and funded training">
        <FundedTraining
          lead={<p>The main free and funded ways to train in England. Scotland, Wales and Northern Ireland run their own schemes.</p>}
          bootcampFit="Subjects include technical skills such as engineering, and digital skills such as data."
        />
      </HubSection>

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            The change column compares each career&apos;s full-time median with the UK full-time median for all employees, {formatGBP(uk)}. ONS
            codes automation work to different groups by level: a professional automation engineer to production and process engineers (2125),
            and an automation engineer who maintains equipment to maintenance fitters and technicians (5223). Robotics and mechatronics engineers
            are in engineering professionals not elsewhere classified (2129), a broad group.
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
          { name: "National Careers Service, Robotics engineer", href: NCS_ROBOTICS, date: "retrieved 29 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 29 September 2026" },
          { name: "GOV.UK, Become an apprentice", href: "https://www.gov.uk/become-apprentice", date: "checked 28 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?looking=Robotics%20and%20automation", label: "Upload your CV", note: "Free: see automation jobs scored against your skills." },
          { href: CAREERS_HREF, label: "Engineering and manufacturing jobs", note: "The full guide, from maintenance to design." },
          { href: "/3d-printing-jobs", label: "3D printing and additive manufacturing jobs" },
          { href: "/graduate-engineering-jobs", label: "Graduate engineering jobs" },
          { href: "/jobs-for-ex-military", label: "Jobs for ex-military technicians and engineers" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
        ]}
      />
    </HubPage>
  );
}
