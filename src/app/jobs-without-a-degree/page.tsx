import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  Prose,
  SalaryFigure,
  SourceNote,
  ToolCallout,
  formatGBP,
  formatGBPChange,
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import {
  ApprenticeshipSourceNote,
  AsheSourceNote,
  RouteList,
  UK_FT_MEDIAN,
  lcFirst,
  allOccupationPay,
  groupBySoc,
  rowLicences,
  subDegreeApprenticeships,
  type SocRow,
} from "@/components/guides/pay";
import { SOC_SOURCE, getSocUnitGroup } from "@/data/careers";

const PATH = "/jobs-without-a-degree";
const TITLE = "Jobs without a degree that pay well (UK, ONS 2025 data)";
const DESCRIPTION =
  "The best-paid UK jobs you can get into without a degree, with ONS 2025 median pay, the apprenticeship or licence that gets you in, and how long it takes.";
const H1 = "Well-paid jobs you can get without a degree";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const NMW_URL = "https://www.gov.uk/national-minimum-wage-rates";
const APPRENTICE_URL = "https://www.gov.uk/become-apprentice";

/** First sentence(s) of the ONS entry-route text, up to about 260 characters. */
function onsEntrySnippet(soc: string): string {
  const text = getSocUnitGroup(soc)?.entryRoutes ?? "";
  const sentences = text.match(/[^.]+\./g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > 260 && out) break;
    out += s;
  }
  return out.trim();
}

function buildRows() {
  const noDegree = allOccupationPay().filter((p) => !p.degreeUsuallyRequired);
  const rows = groupBySoc(noDegree);
  const withRoute = rows
    .map((row) => ({ row, apps: subDegreeApprenticeships(row.occupations), licences: rowLicences(row.occupations) }))
    .filter((r) => r.row.median !== null);

  // Jobs with a documented way to train in below degree level.
  const trainIn = withRoute.filter((r) => r.apps.length > 0 && !r.row.soc.startsWith("1")).slice(0, 20);
  // Management roles, and roles with no sub-degree apprenticeship: reached by working up.
  const trainInSocs = new Set(trainIn.map((r) => r.row.soc));
  const workUp = withRoute
    .filter((r) => !trainInSocs.has(r.row.soc) && (r.row.median ?? 0) >= UK_FT_MEDIAN)
    .filter((r) => r.row.soc.startsWith("1") || r.apps.length === 0)
    .slice(0, 10);

  const aboveMedian = rows.filter((r) => (r.median ?? 0) > UK_FT_MEDIAN).length;
  return { trainIn, workUp, aboveMedian, groups: rows.length, occupations: noDegree.length };
}

type TrainRow = ReturnType<typeof buildRows>["trainIn"][number];

function routeCell(r: TrainRow) {
  return <RouteList occupations={r.row.occupations} />;
}

function nameCell(row: SocRow) {
  return (
    <span className="block">
      <span className="block">{row.name}</span>
      <span className="block text-xs font-normal text-muted">
        ONS group {row.soc}: {row.socTitle}
      </span>
    </span>
  );
}

export default function JobsWithoutADegreePage() {
  const { trainIn, workUp, aboveMedian, groups, occupations } = buildRows();
  const top = trainIn[0];
  const second = trainIn[1];

  const faq = [
    {
      question: "What is the highest-paid job you can get without a degree in the UK?",
      answer: `Among the ${occupations} jobs in our list that do not normally need a degree, the best paid by ONS median full-time pay in 2025 are ${lcFirst(top.row.name)} (${formatGBP(top.row.median ?? 0)}) and ${lcFirst(second.row.name)} (${formatGBP(second.row.median ?? 0)}).${top.row.payNote ? ` ${top.row.payNote}` : ""} Both need a licence, and the apprenticeships that lead into them last ${top.apps[0]?.typicalDurationMonths} and ${second.apps[0]?.typicalDurationMonths} months.`,
    },
    {
      question: "Can I start an apprenticeship as an adult?",
      answer:
        "Yes. GOV.UK says you need to be 16 or over, living in England and not in full-time education, and it lists no upper age limit. Apprenticeships last from 8 months to 6 years depending on the type and level, and you are paid while you train.",
    },
    {
      question: "How much do apprentices earn?",
      answer:
        "From April 2026 the apprentice minimum wage is £8.00 an hour. It applies if you are under 19, or 19 or over and in the first year of your apprenticeship. After that you are entitled to the minimum wage for your age: £12.71 an hour if you are 21 or over. Many employers pay more than the minimum, but not all.",
    },
    {
      question: "Why is the median pay higher than what a new starter earns?",
      answer:
        "The ONS median covers everyone in that job, most of whom have years of experience. A new starter or apprentice usually earns less. The lower quarter figure in the table (the pay that a quarter of full-time employees earn less than) is a more realistic guide to early pay.",
    },
    {
      question: "Do self-employed tradespeople earn more than these figures?",
      answer:
        "The ONS survey behind these figures (ASHE) covers employees only, so it cannot tell you what self-employed electricians, plumbers or other trades earn. Treat any figure for self-employed earnings you see elsewhere with care unless it names its source.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Pay", href: "/what-jobs" }, { name: "Jobs without a degree" }]} />}
        kicker="Pay and routes"
        title={H1}
        intro={
          <p>
            You do not need a degree to earn more than the UK median of{" "}
            <SalaryFigure value={UK_FT_MEDIAN} size="sm" /> for full-time work. Of the {groups} occupation groups in
            our list that do not normally need a degree, {aboveMedian} have a median above it in the latest ONS
            figures. The best paid are {lcFirst(top.row.name)} and {lcFirst(second.row.name)}, both reached
            through licensed training rather than university.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <AsheSourceNote />
      </PageHeader>

      <OnThisPage
        items={[
          { id: "train-in", label: "Jobs you can train into" },
          { id: "routes", label: "How the routes work" },
          { id: "work-up", label: "Senior roles you can work up to" },
          { id: "about-the-data", label: "What the figures can and cannot tell you" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="train-in"
        title="The best-paid jobs you can train into without a degree"
        intro={
          <p>
            Each of these has an apprenticeship below degree level (level 2 to 5) that leads into the job. Pay is the
            ONS median for full-time employees in the whole occupation group, not a starting salary. The lower quarter
            column is closer to what people earn in their first years.
          </p>
        }
      >
        <DataTable<TrainRow>
          caption="Jobs with a route in below degree level, by median pay"
          description="Median and lower quarter gross annual pay, full-time employee jobs, UK, 2025."
          rowKey={(r) => r.row.soc}
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: (r) => nameCell(r.row) },
            { key: "median", header: "Median pay", numeric: true, render: (r) => formatGBP(r.row.median ?? 0) },
            {
              key: "p25",
              header: "Lower quarter",
              numeric: true,
              render: (r) => (r.row.p25 === null ? <span className="text-muted">not published</span> : formatGBP(r.row.p25)),
            },
            {
              key: "vsUk",
              header: "vs UK median",
              numeric: true,
              render: (r) => formatGBPChange((r.row.median ?? 0) - UK_FT_MEDIAN),
            },
            { key: "route", header: "Way in without a degree", render: routeCell },
          ]}
          rows={trainIn}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <ApprenticeshipSourceNote />
            </div>
          }
          notes={
            <>
              Pay covers every job ONS codes to the group, so some rows include other jobs: air traffic controllers
              share a group with airline pilots, and web developers share one with software developers. &ldquo;Does
              not normally need a degree&rdquo; means ONS or the National Careers Service documents a route in below
              degree level; it is not a claim about how many people in the job hold degrees.
            </>
          }
        />
      </GuideSection>

      <GuideSection id="routes" title="How the routes in work">
        <Prose>
          <h3>Apprenticeships</h3>
          <p>
            An apprenticeship is a paid job with training built in. According to{" "}
            <a href={APPRENTICE_URL} className="link" rel="noopener">
              GOV.UK
            </a>
            , you need to be 16 or over, living in England and not in full-time education, and at least 20% of your
            working hours go on training. There is no upper age limit on that page, and apprenticeships run from 8
            months to 6 years. Levels 2 and 3 are equivalent to GCSEs and A levels; levels 4 and 5 sit above A level
            but below a degree.
          </p>
          <p>
            The catch for career changers is money. The{" "}
            <a href={NMW_URL} className="link" rel="noopener">
              apprentice minimum wage
            </a>{" "}
            is £8.00 an hour from April 2026 for anyone in the first year of an apprenticeship (or under 19), compared
            with £12.71 for workers aged 21 and over. Some employers pay apprentices well above the minimum; check the
            advert before you apply.
          </p>
          <h3>Licences and industry cards</h3>
          <p>
            Several of the best-paid routes depend on a licence rather than a qualification: train drivers need a
            licence and certificate regulated by the Office of Rail and Road, air traffic controllers need a licence
            from the Civil Aviation Authority, and lorry drivers need the right driving licence and a Driver CPC.
            The ONS description of these jobs notes the hurdles: train driver entrants must pass a series of tests
            and a medical examination, and air traffic controller training lasts 74 weeks, with a medical and normal
            colour vision required.
          </p>
          <h3>Moving across from related work</h3>
          <p>
            Some of these jobs can be reached by moving sideways inside an employer, for example from a customer
            service role into training, or from a station role into a conductor or driver vacancy. If you already
            work for a large employer, ask about internal routes before you apply elsewhere.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="work-up"
        title="Senior roles people reach without a degree"
        intro={
          <p>
            These pay well above the UK median but are rarely a first job. People usually get there through
            experience, internal promotion or professional qualifications taken while working. The entry notes are
            the ONS&apos;s own description of how people get into each group.
          </p>
        }
      >
        <DataTable<TrainRow>
          caption="Senior roles without a degree requirement, by median pay"
          description="Median gross annual pay, full-time employee jobs, UK, 2025, with the ONS description of typical entry routes."
          rowKey={(r) => r.row.soc}
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: (r) => nameCell(r.row) },
            { key: "median", header: "Median pay", numeric: true, render: (r) => formatGBP(r.row.median ?? 0) },
            { key: "ons", header: "How ONS says people get in", render: (r) => onsEntrySnippet(r.row.soc) },
          ]}
          rows={workUp}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <SourceNote
                label="Entry routes"
                source="ONS, SOC 2020 Volume 1: structure and descriptions of unit groups"
                href={SOC_SOURCE.pageUrl}
                note={SOC_SOURCE.attribution}
              />
            </div>
          }
        />
      </GuideSection>

      <GuideSection id="about-the-data" title="What the figures can and cannot tell you">
        <Prose>
          <ul>
            <li>
              <strong>They are medians for whole occupation groups.</strong> Half of full-time employees in the group
              earn more and half earn less. ONS publishes pay by four-digit Standard Occupational Classification
              (SOC 2020) group, so a figure can cover several job titles.
            </li>
            <li>
              <strong>They are for the tax year ending 5 April 2025</strong>, published by ONS on 23 October 2025.
              ONS publishes the 2026 figures on{" "}
              <a href="https://www.ons.gov.uk/releases/employeeearningsintheuk2026" className="link" rel="noopener">
                22 October 2026
              </a>
              , and this page will be updated then.
            </li>
            <li>
              <strong>They leave out the self-employed</strong> and anyone who has been in their job for less than a
              year, so they say nothing about new starters or people running their own business.
            </li>
            <li>
              <strong>Some figures are missing</strong> because ONS does not publish estimates it considers
              unreliable. Police officers and driving instructors are examples: we show no pay for them rather than
              guess.
            </li>
            <li>
              <strong>&ldquo;No degree needed&rdquo; is our judgement from official sources</strong>, based on the
              entry routes ONS and the National Careers Service describe. Employers can still ask for a degree.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See which of these fit the skills you already have"
        body={
          <p>
            Paste your CV and we will show the skills you already have, the jobs they lead to, and the gaps to close.
            It is free and you do not need an account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/what-jobs/jobs-that-pay-30k", label: "Jobs that pay £30k", note: "Occupations with a median of £30,000 to £39,999" },
          { href: "/what-jobs/jobs-that-pay-40k", label: "Jobs that pay £40k", note: "Occupations with a median of £40,000 to £49,999" },
          { href: "/what-jobs/jobs-that-pay-50k", label: "Jobs that pay £50k", note: "Occupations with a median of £50,000 to £59,999" },
          { href: "/highest-paying-careers-uk", label: "The highest-paid jobs in the UK" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ]}
      />
      <p className="mt-10 max-w-reading text-sm text-muted">
        Looking for something specific? Our guides for people leaving{" "}
        <Link href="/career-change-from-teaching" className="link">
          teaching
        </Link>
        ,{" "}
        <Link href="/career-change-from-retail" className="link">
          retail
        </Link>{" "}
        and{" "}
        <Link href="/jobs-for-ex-military" className="link">
          the armed forces
        </Link>{" "}
        show where people in those jobs usually go next.
      </p>
    </GuideShell>
  );
}
