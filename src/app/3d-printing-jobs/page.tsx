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
  ukFullTimeMedian,
  type RouteSpec,
} from "@/components/hubs";
import { CAREERS_HREF } from "@/components/site";

const PATH = "/3d-printing-jobs";
const UPDATED = "2026-09-29";
const TITLE = "3D printing and additive manufacturing jobs: pay and routes in";
const DESCRIPTION =
  "3D printing technician and additive manufacturing engineer jobs, and the design, quality and manufacturing roles around them, with ONS pay and routes in.";

export const metadata: Metadata = {
  title: { absolute: "3D Printing Jobs UK: Additive Manufacturing Careers and Pay" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: PATH },
};

const NCS_3D = "https://nationalcareers.service.gov.uk/job-profiles/3d-printing-technician";

const CORE: RouteSpec[] = [
  {
    id: "3d-printing-technician",
    why: "The hands-on role: preparing print files, setting up and running printers, looking after machines and materials, and finishing and checking parts.",
    jobsQuery: "3D printing technician",
  },
  {
    id: "additive-manufacturing-engineer",
    why: "The engineering role: deciding which parts are worth printing, designing them for the process, choosing materials and settings, and proving parts meet the specification.",
    jobsQuery: "Additive manufacturing engineer",
  },
];

const AROUND: RouteSpec[] = [
  {
    id: "cad-technician",
    why: "Every print starts as a 3D model. CAD skills are a direct way into the design side of additive manufacturing.",
  },
  {
    id: "mechanical-engineer",
    why: "Designing parts for additive manufacturing, such as lighter brackets or parts made in one piece, is mechanical design work with a different process in mind.",
    jobsQuery: "Mechanical design engineer",
  },
  {
    id: "quality-engineer",
    why: "Printed parts need inspection and measurement like any other, and the process has to be controlled so every build comes out the same.",
  },
  {
    id: "manufacturing-engineer",
    why: "Moving a part from prototype to repeatable production, whether printed or not, is manufacturing engineering.",
  },
];

export default function PrintingHubPage() {
  const uk = ukFullTimeMedian();
  const core = resolveRoutes(CORE);
  const around = resolveRoutes(AROUND);
  const routes = [...core, ...around];
  const tech = core[0];
  const eng = core[1];

  const faqs: FaqItem[] = [
    {
      question: "What does a 3D printing technician earn in the UK?",
      answer: `ONS codes 3D printing technicians with CAD, drawing and architectural technicians (unit group 3120), which had a full-time median of ${formatGBP(tech.median as number)} in 2025 (ONS ASHE 2025). The figure covers the whole group, not only 3D printing roles.`,
    },
    {
      question: "What does an additive manufacturing engineer earn?",
      answer: `ONS codes 3D printing and additive manufacturing engineers to engineering professionals not elsewhere classified (2129), with a full-time median of ${formatGBP(eng.median as number)} (ONS ASHE 2025). It is a broad group, so read it as a guide.`,
    },
    {
      question: "How do I become a 3D printing technician?",
      answer:
        "The National Careers Service lists four routes: a foundation degree, HND or degree in a subject such as 3D design, product design, engineering or materials science; a college course such as a Level 3 Award in 3D Computer Aided Design, a Level 3 Diploma in Engineering Technology or the T Level in Design and Development for Engineering and Manufacturing; an apprenticeship; or starting as an assistant in a 3D printing workshop and training on the job.",
    },
    {
      question: "Is there a 3D printing apprenticeship?",
      answer:
        "We found no Skills England standard just for 3D printing. The National Careers Service suggests the Engineering Technician and Digital Engineering Technician apprenticeships, both at level 3, among others. Apprenticeships apply in England.",
    },
    {
      question: "Do I need a degree to work in additive manufacturing?",
      answer:
        "Not for technician roles: the National Careers Service describes college, apprenticeship and on-the-job routes. Additive manufacturing engineer roles usually need an engineering or materials degree, or a degree apprenticeship, going by the routes ONS describes for professional engineers.",
    },
    {
      question: "Is additive manufacturing the same as 3D printing?",
      answer:
        "Yes. Additive manufacturing is the industrial name for 3D printing: building a part layer by layer from a digital model, in plastics, resins or metal powders, instead of cutting it from a solid block.",
    },
    {
      question: "What skills do 3D printing jobs need?",
      answer:
        "CAD and 3D modelling, knowing how the different processes and materials behave, setting up and maintaining printers, finishing printed parts, and inspecting them against the drawing. The National Careers Service says experience in manufacturing, model making, printing, technology or design helps.",
    },
  ];

  return (
    <HubPage>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} dateModified={UPDATED} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Engineering and manufacturing careers", href: CAREERS_HREF }, { name: "3D printing jobs" }]} />}
        kicker="3D printing and additive manufacturing"
        title={TITLE}
        updated={UPDATED}
        intro={
          <p>
            Additive manufacturing, better known as 3D printing, builds parts layer by layer from a digital model. The jobs run from technicians
            who run the printers to engineers who decide what to print and how. 3D printing technicians share an ONS group with CAD technicians,
            with a full-time median of {formatGBP(tech.median as number)}; additive manufacturing engineers sit in a broad engineering group with{" "}
            {formatGBP(eng.median as number)} (ONS ASHE 2025).
          </p>
        }
      >
        <OnThisPage
          items={[
            { href: "#what", label: "What the work involves" },
            { href: "#careers", label: "The careers in detail" },
            { href: "#pay", label: "Pay ranges" },
            { href: "#routes-in", label: "How to get in" },
            { href: "#live-jobs", label: "Search live jobs" },
            { href: "#faq", label: "Common questions" },
          ]}
        />
      </PageHeader>

      <HubSection id="what" title="What the work involves">
        <div className="prose-mms mt-5">
          <p>
            Industrial 3D printing is used for prototypes, for tooling and jigs, and for finished parts. The main processes print with
            plastic filament (fused deposition modelling, FDM), liquid resin (stereolithography) or powder melted or fused by a laser (for
            example selective laser sintering, and metal powder bed fusion).
          </p>
          <p>Around each build there is work at every level:</p>
          <ul>
            <li>preparing and checking the digital model and the build file;</li>
            <li>setting up, running and maintaining the printers and handling the materials safely;</li>
            <li>removing supports, finishing and heat treating parts;</li>
            <li>inspecting parts against the drawing and keeping the process under control;</li>
            <li>designing parts to get the most from the process, and deciding when printing beats machining or moulding.</li>
          </ul>
        </div>
      </HubSection>

      <ToolCallout
        looking="3D printing and additive manufacturing"
        heading="See the 3D printing jobs your CV fits"
        body={
          <p>
            Upload your CV and we pick out skills such as CAD, additive manufacturing, materials and inspection, then score live adverts against
            them. It works for any other job too.
          </p>
        }
        className="mt-12"
      />

      <HubSection id="careers" title="The careers in detail">
        <div className="mt-10">
          <h3 className="font-sans text-2xl font-bold text-ink">Additive manufacturing roles</h3>
          <HubRouteCards routes={core} from="Design, engineering or manufacturing" headingLevel={4} />
        </div>
        <div className="mt-10">
          <h3 className="font-sans text-2xl font-bold text-ink">Roles around it</h3>
          <p className="mt-2 max-w-reading text-ink-2">Design, quality and manufacturing roles that work with printed parts and lead into the field.</p>
          <HubRouteCards routes={around} from="Design, engineering or manufacturing" headingLevel={4} />
        </div>
      </HubSection>

      <HubSection
        id="pay"
        title="Pay ranges"
        intro={<p>ONS publishes pay by occupation group, not for 3D printing roles on their own, so each figure covers the whole group. The UK full-time median for all employees was {formatGBP(uk)}.</p>}
      >
        <PayRangeTable routes={routes} caption="3D printing and related careers: ONS pay ranges" />
      </HubSection>

      <HubSection id="routes-in" title="How to get in">
        <div className="prose-mms mt-5">
          <p>For a 3D printing technician role, the National Careers Service describes four routes:</p>
          <ul>
            <li>
              <strong>College:</strong> a course in creative design, model making or engineering, such as a Level 2 Certificate in Computer Aided
              Design, a Level 3 Award in 3D Computer Aided Design, a Level 3 Diploma in Engineering Technology, or the T Level in Design and
              Development for Engineering and Manufacturing.
            </li>
            <li>
              <strong>Apprenticeship:</strong> for example Engineering Technician or Digital Engineering Technician, both level 3.
            </li>
            <li>
              <strong>Work:</strong> starting as an assistant in a 3D printing workshop and training on the job. Experience in manufacturing, model
              making, printing, technology or design helps.
            </li>
            <li>
              <strong>University:</strong> a foundation degree, HND or degree in a subject such as 3D design, product design, engineering or
              materials science.
            </li>
          </ul>
          <SourceNote source="National Careers Service, 3D printing technician" href={NCS_3D} published="retrieved 29 September 2026" />
        </div>
        <ApprenticeshipTable routes={routes} caption="Apprenticeships for 3D printing and related careers" />
      </HubSection>

      <HubSection id="live-jobs" title="Search live jobs" intro={<p>Live UK adverts from Reed, Adzuna and more, and jobs posted on MatchMySkillset.</p>}>
        <LiveJobLinks terms={["3D printing", "Additive manufacturing", "3D printing technician", "Additive manufacturing engineer", "CAD technician", "Design engineer"]} />
      </HubSection>

      <FaqSection items={faqs} intro="Short answers, each with its source. Pay figures are ONS ASHE 2025 full-time medians unless stated." />

      <MethodNote
        baseline={
          <>
            ONS does not publish pay for 3D printing on its own. Each career is placed in the SOC 2020 unit group the ONS coding index gives for
            its title: 3D printing technicians with CAD, drawing and architectural technicians (3120), and 3D printing and additive
            manufacturing engineers with engineering professionals not elsewhere classified (2129).
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
          { name: "National Careers Service, 3D printing technician", href: NCS_3D, date: "retrieved 29 September 2026" },
          { name: "Skills England, apprenticeship standards", href: "https://skillsengland.education.gov.uk/apprenticeships/", date: "retrieved 29 September 2026" },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/discover?looking=3D%20printing%20and%20additive%20manufacturing", label: "Upload your CV", note: "Free: see 3D printing jobs scored against your skills." },
          { href: CAREERS_HREF, label: "Engineering and manufacturing jobs", note: "The full guide, from maintenance to design." },
          { href: "/robotics-and-automation-jobs", label: "Robotics and automation jobs" },
          { href: "/graduate-engineering-jobs", label: "Graduate engineering jobs" },
          { href: "/jobs-for-ex-military", label: "Jobs for ex-military technicians and engineers" },
        ]}
      />
    </HubPage>
  );
}
