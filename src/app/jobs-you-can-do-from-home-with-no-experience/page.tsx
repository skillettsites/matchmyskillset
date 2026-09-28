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
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, UK_FT_MEDIAN, unitGroupPay, type UnitGroupPay } from "@/components/guides/pay";
import { SOC_SOURCE, getSocUnitGroup } from "@/data/careers";
import { GOV, NCA_MONEY_MULES, OPN_2026 } from "../work-from-home-jobs/_data/sources";

const PATH = "/jobs-you-can-do-from-home-with-no-experience";
const TITLE = "Jobs you can do from home with no experience (UK)";
const DESCRIPTION =
  "Home-based UK jobs that take beginners (customer service, admin, data entry, typing), what ONS says they pay, how to spot job scams and where to start.";
const H1 = "Jobs you can do from home with no experience";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

/** Entry-level jobs that are advertised as home-based, keyed to their ONS SOC 2020 unit group. */
const ENTRY_ROLES: { soc: string; name: string; detail?: string }[] = [
  { soc: "7219", name: "Customer service adviser", detail: "Phone, email and live chat" },
  { soc: "7211", name: "Call or contact centre agent" },
  { soc: "7113", name: "Telesales adviser" },
  { soc: "4159", name: "Administrator or admin assistant", detail: "ONS also codes proof readers here" },
  { soc: "4152", name: "Data entry clerk" },
  { soc: "4151", name: "Sales administrator" },
  { soc: "4132", name: "Claims handler", detail: "Insurance and pensions administration" },
  { soc: "4217", name: "Audio typist or transcriber" },
];

type EntryRow = UnitGroupPay & { name: string; detail?: string; entry: string };

/** The first sentences of the ONS entry-route text, up to about 250 characters. */
function onsEntry(soc: string): string {
  const text = getSocUnitGroup(soc)?.entryRoutes ?? "";
  // Split only where a full stop is followed by a capital, so "e.g. marketing" stays in one sentence.
  const sentences = text.split(/(?<=\.)\s+(?=[A-Z])/).map((x) => `${x} `);
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > 250 && out) break;
    out += s;
  }
  return out.trim();
}

function buildRows(): EntryRow[] {
  return ENTRY_ROLES.map((r) => ({ ...unitGroupPay(r.soc), name: r.name, detail: r.detail, entry: onsEntry(r.soc) }));
}

function jobCell(r: EntryRow) {
  return (
    <span className="block">
      <span className="block">{r.name}</span>
      {r.detail && <span className="block text-sm font-normal text-ink-2">{r.detail}</span>}
      <span className="block text-xs font-normal text-muted">
        ONS group {r.soc}: {r.title}
      </span>
    </span>
  );
}

function payCell(value: number | null, quality: EntryRow["quality"]) {
  if (value === null) return <span className="text-muted">not published</span>;
  return (
    <span className="block">
      {formatGBP(value)}
      {quality && quality !== "precise" && <span className="block text-xs font-normal text-muted">ONS: {quality}</span>}
    </span>
  );
}

export default function WorkFromHomeNoExperiencePage() {
  const rows = buildRows();
  const medians = rows.map((r) => r.median).filter((m): m is number => m !== null);
  const low = Math.min(...medians);
  const high = Math.max(...medians);
  const sales = OPN_2026.byOccupation.find((o) => o.code === "7")!;
  const admin = OPN_2026.byOccupation.find((o) => o.code === "4")!;
  const supervisors = unitGroupPay("7220");
  const itSupport = unitGroupPay("3132");
  const bookkeepers = unitGroupPay("4122");
  const tutors = unitGroupPay("2319");
  const dataEntry = rows.find((r) => r.soc === "4152")!;

  const faq = [
    {
      question: "Can I get a work from home job with no experience?",
      answer: `Yes, mainly in customer service, contact centres and admin, where ONS says there are no formal academic entry requirements and training is usually given on the job. They are a minority of jobs, though: in ONS's survey for ${OPN_2026.period}, ${sales.homeOnly}% of people in sales and customer service jobs worked only from home and ${sales.hybrid}% split their week. Admin work is more often home-based (${admin.homeOnly}% home only, ${admin.hybrid}% hybrid).`,
    },
    {
      question: "How much do work from home jobs with no experience pay?",
      answer: `ONS does not publish pay by where people work, but for the jobs in this guide the 2025 median for full-time employees ranges from ${formatGBP(low)} to ${formatGBP(high)} a year, against ${formatGBP(UK_FT_MEDIAN)} for all full-time jobs. Those medians cover people who have been in the job for more than a year, so starting pay is usually lower. The legal minimum from April 2026 is £12.71 an hour if you are 21 or over.`,
    },
    {
      question: "Should I pay for training, equipment or a DBS check to start a job?",
      answer:
        "No. The Disclosure and Barring Service warns jobseekers never to send money before starting a job, including for training, uniforms or DBS checks. GOV.UK also says recruitment agencies cannot charge you a fee for finding or trying to find you work. Being asked to pay up front is one of the clearest signs of a scam.",
    },
    {
      question: "Are data entry jobs from home real?",
      answer: `Some are. ONS codes data entry clerks to its data entry administrators group, where the 2025 full-time median was ${formatGBP(dataEntry.median ?? 0)}. ONS also says entrants are expected to have relevant experience and some employers ask for a minimum typing speed, so adverts that promise high pay for simple typing with no checks deserve suspicion, especially if they ask for money or your bank details.`,
    },
    {
      question: "Do I need to tell HMRC about money from online tasks or surveys?",
      answer:
        "If you earn money for yourself rather than through an employer, the first £1,000 of gross trading income in a tax year is covered by the trading allowance. Above that you must register for Self Assessment, by 5 October after the end of the tax year. GOV.UK has a checker for additional income if you are unsure.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[{ name: "Work from home jobs", href: "/work-from-home-jobs" }, { name: "With no experience" }]}
          />
        }
        kicker="Working from home"
        title={H1}
        intro={
          <p>
            Yes, but they are a small share of jobs. The home-based jobs open to people new to the work are mainly
            in customer service, admin, data entry and typing. ONS puts median full-time pay
            for these jobs at <SalaryFigure value={low} size="sm" showPeriod={false} /> to{" "}
            <SalaryFigure value={high} size="sm" />, below the UK median of{" "}
            <SalaryFigure value={UK_FT_MEDIAN} size="sm" showPeriod={false} />, and new starters usually earn less.
            Most people in customer-facing jobs still travel to work.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <AsheSourceNote />
      </PageHeader>

      <OnThisPage
        items={[
          { id: "jobs", label: "Jobs that take beginners" },
          { id: "how-many", label: "How many are really home-based" },
          { id: "pay", label: "What you will earn at first" },
          { id: "tutoring-and-online", label: "Tutoring, freelance and online tasks" },
          { id: "scams", label: "Spotting job scams" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="jobs"
        title="Home-based jobs that take people without experience"
        intro={
          <p>
            These are common home-based roles that do not ask for experience in the same job. Pay is the ONS median for full-time employees in the whole occupation group, wherever they work. The
            right-hand column is ONS&apos;s own summary of how people get in.
          </p>
        }
      >
        <DataTable<EntryRow>
          caption="Entry-level jobs that can be home-based: UK pay and entry requirements"
          description="Median and lower-quarter gross annual pay, full-time employee jobs, UK, 2025."
          rowKey={(r) => r.soc}
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: jobCell },
            { key: "median", header: "Median pay", numeric: true, render: (r) => payCell(r.median, r.quality) },
            {
              key: "p25",
              header: "Lower quarter",
              numeric: true,
              render: (r) => (r.p25 === null ? <span className="text-muted">not published</span> : formatGBP(r.p25)),
            },
            { key: "entry", header: "What ONS says about getting in", render: (r) => r.entry },
          ]}
          rows={rows}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <SourceNote
                label="Entry text"
                source="ONS, SOC 2020 Volume 1: structure and descriptions of unit groups"
                href={SOC_SOURCE.pageUrl}
                note={SOC_SOURCE.attribution}
              />
            </div>
          }
          notes={
            <>
              &ldquo;Lower quarter&rdquo; is the pay a quarter of full-time employees in the group earn less than. ONS
              grades each estimate as precise, reasonably precise or acceptable; the table shows the grade when it is
              not &ldquo;precise&rdquo;.
            </>
          }
        />
      </GuideSection>

      <GuideSection id="how-many" title="How many of these jobs are really done from home">
        <Prose>
          <p>
            Home working is common in office jobs and rare in customer-facing ones. In the ONS Opinions and Lifestyle
            Survey for {OPN_2026.period}, {OPN_2026.all.homeOnly}% of all working adults in Great Britain worked only
            from home in the previous week and {OPN_2026.all.hybrid}% split their time between home and a workplace.
          </p>
          <ul>
            <li>
              <strong>Sales and customer service jobs:</strong> {sales.homeOnly}% worked only from home and{" "}
              {sales.hybrid}% were hybrid. {sales.travelOnly}% only travelled to work.
            </li>
            <li>
              <strong>Administrative and secretarial jobs:</strong> {admin.homeOnly}% worked only from home and{" "}
              {admin.hybrid}% were hybrid, so admin is the likelier way into home working.
            </li>
            <li>
              <strong>People with no qualifications:</strong> {OPN_2026.noQualifications.homeOnly}% worked only from
              home and {OPN_2026.noQualifications.hybrid}% were hybrid, compared with {OPN_2026.degree.homeOnly}% and{" "}
              {OPN_2026.degree.hybrid}% of people with a degree.
            </li>
          </ul>
          <p>
            So remote customer service jobs are real, but you are competing for the smaller share of roles that are
            fully home-based. Hybrid roles outnumber fully home-based ones, so a hybrid admin job is a realistic first
            step. Before you apply, check three things in the advert or at interview: where the training takes place,
            whether the employer supplies the laptop and headset, and whether you need a quiet room and a wired
            internet connection.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source={OPN_2026.source}
          href={OPN_2026.href}
          published={OPN_2026.published}
          note={OPN_2026.note}
        />
      </GuideSection>

      <GuideSection id="pay" title="What you will earn at first, and where it can lead">
        <Prose>
          <p>
            ONS pay figures only include people who have been in the same job for more than a year, so a new starter
            usually earns less than the median. The lower-quarter column is a better guide to early pay. The legal
            floor from April 2026 is £12.71 an hour if you are 21 or over and £10.85 an hour at 18 to 20 (
            <a href={GOV.minimumWage} className="link" rel="noopener">
              GOV.UK National Minimum Wage rates
            </a>
            ). If you work part time, your yearly total will be lower.
          </p>
          <p>
            These jobs are a way in, and a year or two of experience opens better-paid options. ONS medians for
            full-time employees in 2025:
          </p>
          <ul>
            <li>
              Customer service supervisors and team leaders: <SalaryFigure value={supervisors.median} size="sm" />.
            </li>
            <li>
              IT user support technicians, which includes help desk roles:{" "}
              <SalaryFigure value={itSupport.median} size="sm" />.
            </li>
            <li>
              Book-keepers, payroll managers and wages clerks: <SalaryFigure value={bookkeepers.median} size="sm" />.
              They sit in the administrative group, where home and hybrid working is more common.
            </li>
          </ul>
          <p>
            For roles that pay more and are commonly done from home, see{" "}
            <Link href="/highest-paying-remote-jobs-uk" className="link">
              the best-paid remote-friendly jobs
            </Link>
            . For the wider picture of who works from home and your right to ask for it, see{" "}
            <Link href="/work-from-home-jobs" className="link">
              our guide to home and hybrid working
            </Link>
            .
          </p>
        </Prose>
        <AsheSourceNote className="mt-4 max-w-reading" />
      </GuideSection>

      <GuideSection id="tutoring-and-online" title="Tutoring, freelance and online tasks">
        <Prose>
          <p>
            <strong>Tutoring.</strong>{" "}For the group that includes private tutors, ONS says entry is possible with a
            range of academic or professional qualifications or relevant experience, and that a DBS check may be
            required. ONS&apos;s pay
            figure for the group that includes
            private tutors is <SalaryFigure value={tutors.median} size="sm" /> for full-time employees, but many tutors
            work for themselves, and the survey behind that figure leaves out the self-employed. It cannot tell you
            what tutoring through an app or agency pays.
          </p>
          <p>
            <strong>Surveys, website testing and mystery shopping.</strong> These are side income, not a job. ONS did
            not publish a reliable 2025 pay figure for market research interviewers, the group that includes mystery
            shoppers. Treat any site that promises a full-time income from surveys with suspicion.
          </p>
          <p>
            <strong>Working for yourself.</strong> If you are paid for a service or sell things regularly to make a
            profit, GOV.UK says you are probably trading. The first £1,000 of gross trading income in a tax year is covered by the{" "}
            <a href={GOV.tradingAllowance} className="link" rel="noopener">
              trading allowance
            </a>
            ; above that you must{" "}
            <a href={GOV.registerSelfAssessment} className="link" rel="noopener">
              register for Self Assessment
            </a>{" "}
            by 5 October after the tax year ends. Our{" "}
            <Link href="/best-side-hustles-uk" className="link">
              side hustles guide
            </Link>{" "}
            and{" "}
            <Link href="/freelance-careers-uk" className="link">
              freelance guide
            </Link>{" "}
            cover the rules.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="scams"
        title="How to spot a work from home job scam"
        intro={
          <p>
            JobsAware, quoted by the Disclosure and Barring Service, says the rise in remote jobs and online hiring
            has made it easier for fraudsters to fool jobseekers. These warning signs come from the DBS&apos;s{" "}
            <a href={GOV.jobScamSigns} className="link" rel="noopener">
              guidance on job scams
            </a>{" "}
            (GOV.UK, 2023) and other official sources.
          </p>
        }
      >
        <Prose>
          <ul>
            <li>
              <strong>You are asked for money.</strong> Never send money before starting a job, including for
              training, uniforms or DBS checks. Recruitment agencies{" "}
              <a href={GOV.agencyFees} className="link" rel="noopener">
                cannot charge you a fee
              </a>{" "}
              for finding or trying to find you work.
            </li>
            <li>
              <strong>You get an offer without an interview</strong>, or the advert has no named contact person or
              company email address.
            </li>
            <li>
              <strong>The pay does not fit the job</strong>, or the advert leaves out basic details such as duties,
              hours and salary.
            </li>
            <li>
              <strong>The company cannot be checked.</strong> Look up any UK company on the free{" "}
              <a href={GOV.companiesHouse} className="link" rel="noopener">
                Companies House register
              </a>{" "}
              before you send your passport, driving licence or bank details.
            </li>
            <li>
              <strong>The job involves your bank account.</strong>{" "}A &ldquo;job&rdquo; that asks you to receive money
              and pass it on, or to buy crypto for someone, is money muling. The{" "}
              <a href={NCA_MONEY_MULES} className="link" rel="noopener">
                National Crime Agency
              </a>{" "}
              says it is a crime that can mean up to 14 years in prison, and that recruiters use social media job
              offers.
            </li>
          </ul>
          <h3>If you think you have been targeted</h3>
          <p>
            GOV.UK says to{" "}
            <a href={GOV.reportScams} className="link" rel="noopener">
              contact Report Fraud
            </a>{" "}
            on 0300 123 2040 if you have lost money and live in England or Wales, and to report it to Police Scotland if
            you live in Scotland. Forward suspicious emails to report@phishing.gov.uk and suspicious texts to 7726.
          </p>
          <h3>Where to look instead</h3>
          <p>
            Apply through employers&apos; own careers pages, the government&apos;s{" "}
            <a href={GOV.findAJob} className="link" rel="noopener">
              Find a job
            </a>{" "}
            service (England, Scotland and Wales), or{" "}
            <Link href="/jobs" className="link">
              our live vacancy search
            </Link>
            , and check anything you find elsewhere against the signs above.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="No experience in a job is not the same as no skills"
        body={
          <p>
            Handling complaints, keeping records, working to targets and writing clearly all count, whether you did
            them in a shop, a warehouse or at home. Paste your CV or type the job you do now, and we will show the
            skills that carry over and the jobs they lead to. It is free and there is no account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/work-from-home-jobs", label: "Work from home and hybrid jobs", note: "Who works from home, the pay, and your right to ask" },
          { href: "/highest-paying-remote-jobs-uk", label: "The best-paid remote-friendly jobs" },
          { href: "/career-change-no-experience", label: "Changing career with no experience" },
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
          { href: "/best-side-hustles-uk", label: "Side hustles and the tax rules" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ]}
      />
    </GuideShell>
  );
}
