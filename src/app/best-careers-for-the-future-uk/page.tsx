import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  Prose,
  SourceNote,
  ToolCallout,
  formatGBP,
  formatNumber,
  type DataTableColumn,
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, UK_FT_MEDIAN, groupPay, occupationPayById, unitGroupPay } from "@/components/guides/pay";
import { titleInSentence } from "@/lib/text";

const PATH = "/best-careers-for-the-future-uk";
const TITLE = "Best careers for the future in the UK: 2035 projections";
const DESCRIPTION =
  "Which UK jobs are projected to grow or shrink by 2035, from the DfE-published Skills Imperative 2035 projections, with ONS pay for jobs in each group.";
const H1 = "Best careers for the future in the UK: what the 2035 projections show";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Sources, checked on 28 September 2026.
const DFE_PROJECTIONS = "https://www.gov.uk/government/publications/labour-market-and-skills-projections-2020-to-2035";
const NFER_PROGRAMME = "https://www.nfer.ac.uk/key-topics-expertise/education-to-employment/the-skills-imperative-2035/";
const NFER_REVISIONS =
  "https://www.nfer.ac.uk/media/dvbevx0q/revised-employment-and-skills-projections-for-the-skills-imperative-2035.pdf";
const NFER_SKILLS = "https://www.nfer.ac.uk/media/2p5lkqim/an-analysis-of-the-demand-for-skills_revised-projections.pdf";
const AICS = "https://aicareerswap.com/will-ai-replace/";

/**
 * DfE, Labour market and skills projections: 2020 to 2035 (revised projections,
 * files replaced 5 August 2024), United_Kingdom_Main_Tables.ods, sheet Occ_T2
 * "Employment Change by Occupation (SOC 2020) and Replacement Demand". Figures in
 * thousands as published, rounded to the nearest thousand.
 */
interface Projection {
  soc: string;
  title: string;
  y2020: number;
  y2035: number;
  net: number;
  replacement: number;
}

const ALL_OCCUPATIONS = { y2020: 34_975, y2035: 37_568, net: 2_593, replacement: 17_534, total: 20_127 };

const GROWING: Projection[] = [
  { soc: "24", title: "Business, media and public service professionals", y2020: 2_564, y2035: 3_234, net: 670, replacement: 1_419 },
  { soc: "12", title: "Other managers and proprietors", y2020: 1_143, y2035: 1_637, net: 494, replacement: 824 },
  { soc: "61", title: "Caring personal service occupations", y2020: 2_366, y2035: 2_832, net: 466, replacement: 1_474 },
  { soc: "21", title: "Science, research, engineering and technology professionals", y2020: 2_168, y2035: 2_563, net: 394, replacement: 894 },
  { soc: "22", title: "Health professionals", y2020: 1_653, y2035: 1_963, net: 310, replacement: 974 },
  { soc: "72", title: "Customer service occupations", y2020: 605, y2035: 889, net: 285, replacement: 363 },
  { soc: "23", title: "Teaching and other educational professionals", y2020: 1_814, y2035: 2_082, net: 268, replacement: 994 },
  { soc: "33", title: "Protective service occupations", y2020: 397, y2035: 541, net: 144, replacement: 169 },
];

const SHRINKING: Projection[] = [
  { soc: "41", title: "Administrative occupations", y2020: 3_066, y2035: 2_685, net: -381, replacement: 1_390 },
  { soc: "71", title: "Sales occupations", y2020: 2_182, y2035: 1_927, net: -255, replacement: 926 },
  { soc: "42", title: "Secretarial and related occupations", y2020: 676, y2035: 570, net: -105, replacement: 349 },
  { soc: "91", title: "Elementary trades and related occupations", y2020: 465, y2035: 368, net: -97, replacement: 153 },
  { soc: "52", title: "Skilled metal, electrical and electronic trades", y2020: 1_102, y2035: 1_030, net: -72, replacement: 410 },
  { soc: "92", title: "Elementary administration and service occupations", y2020: 3_134, y2035: 3_086, net: -48, replacement: 1_536 },
  { soc: "31", title: "Science, engineering and technology associate professionals", y2020: 694, y2035: 660, net: -34, replacement: 262 },
  { soc: "53", title: "Skilled construction and building trades", y2020: 903, y2035: 889, net: -14, replacement: 388 },
];

type Example = { kind: "occ"; id: string } | { kind: "soc"; soc: string; label: string };

/** Example jobs in each group. Every one is coded by ONS to a unit group inside that sub-major group. */
const EXAMPLES: Record<string, Example[]> = {
  "24": [{ kind: "occ", id: "solicitor" }, { kind: "occ", id: "accountant" }, { kind: "occ", id: "social-worker" }],
  "12": [{ kind: "occ", id: "logistics-manager" }, { kind: "occ", id: "facilities-manager" }, { kind: "occ", id: "gp-practice-manager" }],
  "61": [
    { kind: "soc", soc: "6135", label: "Care workers and home carers" },
    { kind: "occ", id: "healthcare-assistant" },
    { kind: "occ", id: "teaching-assistant" },
  ],
  "21": [{ kind: "occ", id: "software-developer" }, { kind: "occ", id: "cyber-security-analyst" }, { kind: "occ", id: "it-project-manager" }],
  "22": [{ kind: "occ", id: "nurse" }, { kind: "occ", id: "paramedic" }, { kind: "occ", id: "occupational-therapist" }],
  "72": [
    { kind: "soc", soc: "7219", label: "Other customer service jobs" },
    { kind: "soc", soc: "7211", label: "Call and contact centre staff" },
  ],
  "23": [{ kind: "occ", id: "secondary-school-teacher" }, { kind: "occ", id: "further-education-lecturer" }],
  "33": [{ kind: "occ", id: "firefighter" }, { kind: "occ", id: "prison-officer" }, { kind: "occ", id: "police-officer" }],
  "41": [{ kind: "occ", id: "civil-service-executive-officer" }, { kind: "occ", id: "local-government-officer" }, { kind: "occ", id: "bookkeeper" }],
  "71": [{ kind: "soc", soc: "7111", label: "Sales and retail assistants" }],
  "42": [
    { kind: "soc", soc: "4215", label: "Personal assistants and other secretaries" },
    { kind: "soc", soc: "4216", label: "Receptionists" },
  ],
  "91": [{ kind: "soc", soc: "9129", label: "Elementary construction jobs" }],
  "52": [{ kind: "occ", id: "electrician" }, { kind: "occ", id: "maintenance-fitter" }, { kind: "occ", id: "welder" }],
  "92": [
    { kind: "soc", soc: "9252", label: "Warehouse operatives" },
    { kind: "soc", soc: "9223", label: "Cleaners and domestics" },
  ],
  "31": [{ kind: "occ", id: "engineering-technician" }, { kind: "occ", id: "cad-technician" }],
  "53": [{ kind: "occ", id: "carpenter" }, { kind: "occ", id: "bricklayer" }, { kind: "occ", id: "plasterer" }],
};

interface ExamplePay {
  label: string;
  soc: string;
  median: number | null;
}

function examplePay(e: Example): ExamplePay {
  if (e.kind === "occ") {
    const p = occupationPayById(e.id);
    return { label: p.title, soc: p.soc, median: p.median };
  }
  const u = unitGroupPay(e.soc);
  return { label: e.label, soc: e.soc, median: u.median };
}

interface Row extends Projection {
  groupMedian: number | null;
  examples: ExamplePay[];
}

function buildRows(list: Projection[]): Row[] {
  return list.map((p) => {
    const examples = (EXAMPLES[p.soc] ?? []).map(examplePay);
    for (const e of examples) {
      if (!e.soc.startsWith(p.soc)) throw new Error(`Example ${e.label} (${e.soc}) is not in group ${p.soc}`);
    }
    return { ...p, groupMedian: groupPay(p.soc).median, examples };
  });
}

/** Thousands to a readable count: 2,564 becomes "2.6 million", 397 becomes "397,000". */
function people(thousands: number): string {
  return thousands >= 1_000 ? `${(thousands / 1_000).toFixed(1)} million` : formatNumber(thousands * 1_000);
}

/** "a; b; and c" for a list of phrases that may contain commas. */
function listWithAnd(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join("; ")}; and ${items[items.length - 1]}`;
}

function change(p: Projection): string {
  const pct = Math.round((p.net / p.y2020) * 100);
  const sign = p.net >= 0 ? "+" : "−";
  return `${sign}${formatNumber(Math.abs(p.net) * 1_000)} (${sign}${Math.abs(pct)}%)`;
}

function examplesCell(r: Row) {
  return (
    <span className="block space-y-0.5">
      {r.examples.map((e) => (
        <span key={e.label} className="block">
          {e.label}:{" "}
          {e.median === null ? (
            <span className="text-muted">ONS did not publish a reliable figure</span>
          ) : (
            <span className="tabular-nums">{formatGBP(e.median)}</span>
          )}
        </span>
      ))}
    </span>
  );
}

function projectionColumns(): DataTableColumn<Row>[] {
  return [
    {
      key: "group",
      header: "Occupation group",
      rowHeader: true,
      render: (r: Row) => (
        <span className="block">
          <span className="block">{r.title}</span>
          <span className="block text-xs font-normal text-muted">
            SOC 2020 group {r.soc}: {people(r.y2020)} in 2020, {people(r.y2035)} projected for 2035
          </span>
        </span>
      ),
    },
    { key: "net", header: "Projected change, 2020 to 2035", mobileLabel: "Change to 2035", numeric: true, render: (r: Row) => change(r) },
    {
      key: "replacement",
      header: "Needed to replace leavers",
      mobileLabel: "Replacement demand",
      numeric: true,
      render: (r: Row) => formatNumber(r.replacement * 1_000),
    },
    {
      key: "pay",
      header: "Group median pay, 2025",
      mobileLabel: "Group median pay",
      numeric: true,
      render: (r: Row) =>
        r.groupMedian === null ? <span className="text-muted">Not published</span> : formatGBP(r.groupMedian),
    },
    { key: "examples", header: "Example jobs and median pay", mobileLabel: "Examples", render: examplesCell },
  ];
}

function ProjectionSource() {
  return (
    <div className="space-y-1.5">
      <SourceNote
        label="Projections"
        source="DfE, Labour market and skills projections: 2020 to 2035 (revised), UK main tables, occupation table 2"
        href={DFE_PROJECTIONS}
        published="2024-08-05"
        note="Produced for The Skills Imperative 2035 (NFER, funded by the Nuffield Foundation) by the Warwick Institute for Employment Research and Cambridge Econometrics. First published March 2023; revised files published August 2024."
      />
      <AsheSourceNote note="Median gross annual pay for full-time employee jobs in the UK, tax year ending 5 April 2025, for the whole sub-major group and for the unit group of each example job." />
    </div>
  );
}

export default function FutureCareersPage() {
  const growing = buildRows(GROWING);
  const shrinking = buildRows(SHRINKING);
  const allPct = Math.round((ALL_OCCUPATIONS.net / ALL_OCCUPATIONS.y2020) * 100);
  const customer = growing.find((r) => r.soc === "72");
  const construction = shrinking.find((r) => r.soc === "53");
  const metal = shrinking.find((r) => r.soc === "52");
  const admin = shrinking.find((r) => r.soc === "41");
  const electrician = occupationPayById("electrician");
  const carpenter = occupationPayById("carpenter");

  const faq = [
    {
      question: "Which jobs will be most in demand in the UK by 2035?",
      answer: `The DfE-published projections expect the biggest growth between 2020 and 2035 in ${listWithAnd(
        growing.slice(0, 4).map((r) => `${titleInSentence(r.title)} (about ${formatNumber(r.net * 1_000)} more jobs)`),
      )}. Health and teaching professionals also grow. These are broad groups; the projections do not rank individual job titles.`,
    },
    {
      question: "Which jobs are expected to decline?",
      answer: `The largest projected falls between 2020 and 2035 are in ${listWithAnd(
        shrinking.slice(0, 3).map((r) => `${titleInSentence(r.title)} (down about ${formatNumber(Math.abs(r.net) * 1_000)})`),
      )}. Even so, the same projections expect about ${people(admin?.replacement ?? 0)} people to be needed in administrative jobs over that period to replace those who retire or leave.`,
    },
    {
      question: "Are skilled trades a good choice for the future?",
      answer: `The projections do not show construction or electrical trades growing: skilled construction and building trades are projected to shrink slightly (by about ${formatNumber(Math.abs(construction?.net ?? 0) * 1_000)} between 2020 and 2035) and skilled metal, electrical and electronic trades by about ${formatNumber(Math.abs(metal?.net ?? 0) * 1_000)}. But because people retire or leave, about ${formatNumber((construction?.replacement ?? 0) * 1_000)} and ${formatNumber((metal?.replacement ?? 0) * 1_000)} new workers are projected to be needed. ONS median full-time pay in 2025 was ${formatGBP(electrician.median ?? 0)} for electricians and ${formatGBP(carpenter.median ?? 0)} for carpenters and joiners, and those figures leave out the self-employed.`,
    },
    {
      question: "How reliable are these projections?",
      answer:
        "The published workbooks say they are not precise predictions but the most likely path of change, and that precise margins of error cannot be given. They start from 2020 and were revised in 2024 after ONS corrected errors in how it had coded occupations in its 2021 Labour Force Survey data. Use them for the direction and rough size of change in broad groups, not for any single job.",
    },
    {
      question: "What skills will matter most by 2035?",
      answer:
        "The Skills Imperative 2035 researchers at the University of Sheffield named six essential employment skills likely to be used most in 2035: communication; collaboration; information literacy; problem solving and decision making; organising, planning and prioritising work; and creative thinking. Their revised analysis (NFER, March 2024) says these conclusions were largely unchanged by the data corrections.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Best careers for the future" }]} />
        }
        kicker="Future jobs"
        title={H1}
        intro={
          <p>
            Long-term projections published by the Department for Education (revised in 2024) expect UK employment to
            rise by about 2.6 million between 2020 and 2035. The biggest growth is in professional and managerial work,
            care, and customer service. Administrative, secretarial and sales jobs are projected to shrink, though every
            group will still need new people to replace those who leave.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "growing", label: "Where jobs are projected to grow" },
          { id: "shrinking", label: "Where they are projected to shrink" },
          { id: "replacement", label: "Why shrinking jobs still hire" },
          { id: "skills", label: "The skills behind the growth" },
          { id: "caveats", label: "How much to trust the numbers" },
          { id: "ai", label: "What about AI?" },
        ]}
      />

      <GuideSection
        id="growing"
        title="Where employment is projected to grow"
        intro={
          <p>
            The projections come from The Skills Imperative 2035, a research programme led by NFER and funded by the
            Nuffield Foundation, and are published by the Department for Education. They cover 26 broad occupation
            groups. These are the eight with the largest projected growth in jobs between 2020 and 2035, with what those
            jobs pay today.
          </p>
        }
      >
        <DataTable<Row>
          caption="UK occupation groups with the largest projected growth, 2020 to 2035"
          description="Projected net change in employment, the number needed to replace people leaving, and ONS median full-time pay in 2025."
          rowKey={(r) => r.soc}
          columns={projectionColumns()}
          rows={growing}
          source={<ProjectionSource />}
          notes="Protective service pay is not shown for the whole group because ONS suppressed its 2025 figures for police officers after an error in the returns it received. Example jobs are our choice of jobs ONS codes to each group."
        />
      </GuideSection>

      <GuideSection
        id="shrinking"
        title="Where employment is projected to shrink"
        intro={
          <p>
            These are the eight groups with the largest projected fall in jobs. Look at the replacement column before
            you rule any of them out.
          </p>
        }
      >
        <DataTable<Row>
          caption="UK occupation groups with a projected fall in employment, 2020 to 2035"
          description="Projected net change in employment, the number needed to replace people leaving, and ONS median full-time pay in 2025."
          rowKey={(r) => r.soc}
          columns={projectionColumns()}
          rows={shrinking}
          source={<ProjectionSource />}
        />
      </GuideSection>

      <GuideSection id="replacement" title="Why a shrinking job can still be a good bet">
        <Prose>
          <p>
            Growth is only part of the picture. Across all jobs, the projections expect a net rise of about{" "}
            {people(ALL_OCCUPATIONS.net)} ({allPct}%) between 2020 and 2035, but about{" "}
            {people(ALL_OCCUPATIONS.replacement)} people needed to replace those who leave the workforce through
            retirement or for other reasons. Together that is about {people(ALL_OCCUPATIONS.total)} jobs to fill.
          </p>
          <p>
            So a group that shrinks can still hire a lot of people. Administrative jobs are projected to fall by about{" "}
            {formatNumber(Math.abs(admin?.net ?? 0) * 1_000)}, yet about {people(admin?.replacement ?? 0)} people are
            projected to be needed to replace leavers. Skilled construction trades barely change in size, but
            about {formatNumber((construction?.replacement ?? 0) * 1_000)} new workers are projected to be needed.
          </p>
          <p>
            Growth does not mean good pay either. In percentage terms, customer service jobs grow faster than any other
            group in these projections
            {customer && (
              <>
                {" "}
                (up about {formatNumber(customer.net * 1_000)}, or {Math.round((customer.net / customer.y2020) * 100)}%)
              </>
            )}
            , but the ONS median for the group was{" "}
            {customer?.groupMedian ? formatGBP(customer.groupMedian) : "not published"} in 2025, against{" "}
            {formatGBP(UK_FT_MEDIAN)} for all full-time employees. When you compare careers, look at three things
            together: how many openings there are likely to be, what the job pays, and how long it takes to get in.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="skills" title="The skills behind the growth">
        <Prose>
          <p>
            The revised skills analysis for the programme, by Andy Dickerson and Gennaro Rossi at the University of
            Sheffield (NFER, March 2024), found that all of the projected rise in employment between 2020 and 2035 is in
            jobs at the two highest skill levels in the ONS classification. Employment at the two lower levels is
            projected to be almost unchanged.
          </p>
          <p>It names six essential employment skills likely to be used most across the labour market in 2035:</p>
          <ul>
            <li>communication</li>
            <li>collaboration</li>
            <li>information literacy</li>
            <li>problem solving and decision making</li>
            <li>organising, planning and prioritising work</li>
            <li>creative thinking</li>
          </ul>
          <p>
            For what employers say they cannot find today, see our guide to the{" "}
            <Link href="/skills-employers-want-2026" className="link">
              skills UK employers want in 2026
            </Link>
            , based on the Employer Skills Survey.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source="Dickerson and Rossi, An analysis of the demand for skills in the labour market in 2035: revised projections (Working paper 3b)"
          href={NFER_SKILLS}
          published="March 2024"
          note="The Skills Imperative 2035, NFER."
        />
      </GuideSection>

      <GuideSection id="caveats" title="How much weight to put on these numbers">
        <Prose>
          <ul>
            <li>
              <strong>They are projections, not certainties.</strong> The workbooks say they are not precise
              predictions but the most likely trajectory of change, and that precise margins of error cannot be given.
            </li>
            <li>
              <strong>They start from 2020.</strong> Figures up to 2020 are historical estimates; everything from 2021
              is projected.
            </li>
            <li>
              <strong>They were revised in 2024.</strong>{" "}ONS found errors in how it had coded occupations in its 2021
              Labour Force Survey data. NFER&apos;s{" "}
              <a href={NFER_REVISIONS} className="link" rel="noopener">
                note on the revisions
              </a>{" "}
              says the effect on overall employment is fairly minimal, but the projected growth in the share of
              employment taken by science, research, engineering and technology professionals, and by health and
              social care associate professionals, is now substantially smaller than first reported. We use the
              revised figures.
            </li>
            <li>
              <strong>They are for broad groups, not job titles.</strong> The workbooks also give figures for individual
              occupations, but those apply the same growth rate to every job within a group, so we do not quote them as
              forecasts for single jobs.
            </li>
            <li>
              <strong>They allow for technology, but they are not an AI forecast.</strong> NFER says the method captures
              technological and organisational change in how goods and services are produced. It does not model the
              effect of AI on any one job.
            </li>
          </ul>
          <p>
            More on the programme is on the{" "}
            <a href={NFER_PROGRAMME} className="link" rel="noopener">
              NFER Skills Imperative 2035 page
            </a>
            .
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="ai" title="What about AI?">
        <Prose>
          <p>
            This guide sticks to the published employment projections. If you are worried about how AI could change a
            particular job, our sister site AICareerSwap looks at that job by job, for example for{" "}
            <a href={`${AICS}nurse`} className="link" rel="noopener">
              nurses
            </a>
            ,{" "}
            <a href={`${AICS}care-assistant`} className="link" rel="noopener">
              care assistants
            </a>
            ,{" "}
            <a href={`${AICS}software-developer`} className="link" rel="noopener">
              software developers
            </a>
            ,{" "}
            <a href={`${AICS}electrician`} className="link" rel="noopener">
              electricians
            </a>
            ,{" "}
            <a href={`${AICS}accountant`} className="link" rel="noopener">
              accountants
            </a>{" "}
            and{" "}
            <a href={`${AICS}data-analyst`} className="link" rel="noopener">
              data analysts
            </a>
            .
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See which growing jobs fit your experience"
        body={
          <p>
            Paste your CV or type the job you do now. We show the skills you already have, the jobs they lead to and
            what they pay. It is free and you do not need an account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/skills-employers-want-2026", label: "Skills UK employers want in 2026" },
          { href: "/highest-paying-careers-uk", label: "The highest-paid careers in the UK" },
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
          { href: "/career-change/how-to-change-careers", label: "How to change careers" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ]}
      />
      <p className="mt-10 max-w-reading text-sm text-muted">
        Pay figures on this page come from the ONS Annual Survey of Hours and Earnings 2025. ONS publishes the 2026
        figures on 22 October 2026.
      </p>
    </GuideShell>
  );
}
