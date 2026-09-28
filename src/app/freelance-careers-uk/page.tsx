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
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, unitGroupPay, type UnitGroupPay } from "@/components/guides/pay";
import { GOV, ONS_SELF_EMPLOYED, OPN_2026 } from "../work-from-home-jobs/_data/sources";

const PATH = "/freelance-careers-uk";
const TITLE = "Freelance careers in the UK: the rules, tax and pay data";
const DESCRIPTION =
  "Going freelance in the UK: when to register as self-employed, the £1,000 trading allowance, 2026 to 2027 tax and NI rates, IR35, and what pay data can show.";
const H1 = "Going freelance in the UK: the rules and what to expect";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

/** Fields people often freelance in, keyed to the ONS group that employees in the same work are coded to. */
const FIELDS: { soc: string; name: string }[] = [
  { soc: "2134", name: "Software and web development" },
  { soc: "2431", name: "Management consultancy" },
  { soc: "2141", name: "Web and UX design" },
  { soc: "3412", name: "Copywriting, editing and translation" },
  { soc: "2319", name: "Private tutoring" },
  { soc: "3417", name: "Photography and video" },
  { soc: "2142", name: "Graphic design" },
  { soc: "4122", name: "Bookkeeping and payroll" },
];

type FieldRow = UnitGroupPay & { name: string };

export default function FreelanceCareersPage() {
  const rows: FieldRow[] = FIELDS.map((f) => ({ ...unitGroupPay(f.soc), name: f.name })).sort(
    (a, b) => (b.median ?? 0) - (a.median ?? 0),
  );
  const selfEmployedMillions = (ONS_SELF_EMPLOYED.thousands / 1000).toFixed(2);

  const faq = [
    {
      question: "How much can I earn freelancing before I pay tax?",
      answer:
        "The first £1,000 of gross trading income in a tax year is covered by the trading allowance, and you do not need to tell HMRC about it unless another rule applies. Above that you pay tax on your profit. For 2026 to 2027 the standard Personal Allowance is £12,570 across all your income, and Class 4 National Insurance is 6% on profits between £12,570 and £50,270.",
    },
    {
      question: "When do I need to register as self-employed?",
      answer:
        "You can start trading straight away, but you must register for Self Assessment as a sole trader if you earn more than £1,000 in a tax year (6 April to 5 April). The deadline is 5 October after that tax year ends: 5 October 2026 for the year to 5 April 2026. Registering late can mean a penalty.",
    },
    {
      question: "Can I freelance while I am still employed?",
      answer:
        "Yes. GOV.UK says you can run a business and be employed at the same time, for example working for an employer during the day and on your own business in the evenings. Your job's tax is still paid through PAYE, and your freelance profit goes on a Self Assessment return. Check your employment contract for any rules about outside work.",
    },
    {
      question: "What is IR35?",
      answer:
        "IR35 is the common name for the off-payroll working rules. They apply when you work through your own intermediary, usually a limited company, for a client who would have employed you if you worked for them directly, and they make you pay broadly the same Income Tax and National Insurance as an employee. For public sector clients, and clients outside the public sector that are not small, the client decides whether the rules apply. HMRC's CEST tool gives its view of a contract.",
    },
    {
      question: "How much do freelancers earn in the UK?",
      answer:
        "The main official source of UK pay by job, the ONS Annual Survey of Hours and Earnings, covers employees only and leaves out the self-employed, so it cannot answer this. Treat any freelance day rate or income figure you see with care unless it names its source.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Freelance careers" }]} />}
        kicker="Working for yourself"
        title={H1}
        intro={
          <p>
            About {selfEmployedMillions} million people in the UK were self-employed in {ONS_SELF_EMPLOYED.period},
            according to ONS. You can start freelancing straight away, even alongside a job, but once your income from
            it passes £1,000 in a tax year you must register for Self Assessment. What freelancers earn is harder to
            pin down: the main ONS pay survey covers employees only.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <SourceNote
          source={ONS_SELF_EMPLOYED.source}
          href={ONS_SELF_EMPLOYED.href}
          published={ONS_SELF_EMPLOYED.published}
          note={`${formatNumber(ONS_SELF_EMPLOYED.thousands)} thousand people aged 16 and over, ${ONS_SELF_EMPLOYED.period}.`}
        />
      </PageHeader>

      <OnThisPage
        items={[
          { id: "business-or-job", label: "Freelancing or a job in disguise" },
          { id: "tax", label: "Registering and paying tax" },
          { id: "ir35", label: "Contracting through a company (IR35)" },
          { id: "pay", label: "What the same skills pay in a job" },
          { id: "before-you-leave", label: "Before you leave your job" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection id="business-or-job" title="Is it freelancing, or a job in disguise?">
        <Prose>
          <p>
            Freelancing means running a business, even a small one. GOV.UK says you are probably running a business
            if you:
          </p>
          <ul>
            <li>take responsibility for its success or failure</li>
            <li>have several customers at the same time</li>
            <li>can decide how, where and when you do your work</li>
            <li>can hire other people at your own expense to help or to do the work for you</li>
            <li>provide the main equipment you need</li>
            <li>have to fix unsatisfactory work in your own time</li>
            <li>charge an agreed fixed price for your work</li>
          </ul>
          <p>
            If a single client sets your hours, supplies your equipment and treats you like staff, check your
            employment status before you rely on being self-employed. HMRC&apos;s{" "}
            <a href={GOV.cest} className="link" rel="noopener">
              Check employment status for tax (CEST) tool
            </a>{" "}
            gives its view, and HMRC says it will stand by the result as long as the information you give is accurate.
            Read the full list on{" "}
            <a href={GOV.workingForYourself} className="link" rel="noopener">
              GOV.UK&apos;s working for yourself page
            </a>
            .
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="tax" title="Registering and paying tax as a sole trader">
        <Prose>
          <p>
            GOV.UK says most people start out as a sole trader, the simplest business structure. The main rules, all
            from GOV.UK:
          </p>
          <ul>
            <li>
              <strong>Registering.</strong> You can start trading without registering, but you must{" "}
              <a href={GOV.soleTrader} className="link" rel="noopener">
                register for Self Assessment as a sole trader
              </a>{" "}
              if you earn more than £1,000 in a tax year. The deadline is 5 October after the tax year ends, so 5
              October 2026 for the year to 5 April 2026, and you could get a penalty if you are late (
              <a href={GOV.registerSelfAssessment} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>The £1,000 trading allowance.</strong> If your gross trading income is £1,000 or less, it is
              tax-free. If it is more, you can deduct the £1,000 allowance instead of your actual expenses, but not
              both. You cannot use it at all in a year when you have trading income from your employer, or from a
              company or partnership you or someone connected to you owns or controls (
              <a href={GOV.tradingAllowance} className="link" rel="noopener">
                HMRC guidance
              </a>
              ).
            </li>
            <li>
              <strong>Income Tax.</strong> The standard Personal Allowance is £12,570. Above it, the basic rate of 20%
              applies up to £50,270, the higher rate of 40% up to £125,140 and 45% above that. Scotland has different
              bands (
              <a href={GOV.incomeTaxRates} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>National Insurance.</strong> Class 4 is 6% on profits between £12,570 and £50,270 and 2% above
              that. If your profits are £7,105 or more, Class 2 is treated as paid, which protects your National
              Insurance record without you paying it. Below that you can choose to pay voluntary Class 2 at £3.65 a
              week (
              <a href={GOV.selfEmployedNi} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Payments on account.</strong> Once your yearly Self Assessment bill is £1,000 or more, and you
              paid no more than 80% of your tax at source, HMRC asks for two advance payments towards next year&apos;s
              bill, due by 31 January and 31 July, each half of last year&apos;s tax. In the first year this applies,
              the January bill can include both the balance for last year and the first advance payment (
              <a href={GOV.paymentsOnAccount} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Making Tax Digital.</strong> Sole traders and landlords whose qualifying income for 2024 to 2025
              was over £50,000 should have started using Making Tax Digital for Income Tax from 6 April 2026. The
              threshold falls to £30,000 (2025 to 2026 income) from 6 April 2027 and £20,000 (2026 to 2027 income)
              from 6 April 2028 (
              <a href={GOV.makingTaxDigital} className="link" rel="noopener">
                HMRC
              </a>
              ).
            </li>
          </ul>
          <p>
            You may also need to register for VAT once your turnover is high enough, and some work needs a licence,
            insurance or a criminal record check.{" "}
            <a href={GOV.soleTrader} className="link" rel="noopener">
              GOV.UK&apos;s sole trader guide
            </a>{" "}
            lists what to check.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="ir35" title="Contracting through your own company: IR35">
        <Prose>
          <p>
            Some freelancers work through their own limited company rather than as a sole trader. The{" "}
            <a href={GOV.offPayroll} className="link" rel="noopener">
              off-payroll working rules
            </a>
            , known as IR35, make sure that if you would be an employee were you working for the client directly, you
            pay broadly the same Income Tax and National Insurance as an employee would.
          </p>
          <ul>
            <li>
              For public sector clients, and for clients outside the public sector that are not small, the client
              decides whether the rules apply and should give you a status determination statement with its reasons.
            </li>
            <li>For a small client outside the public sector, your own company makes that decision.</li>
            <li>The rules apply contract by contract, so one contract can be inside IR35 and another outside.</li>
            <li>They are unlikely to apply if you are employed by an umbrella company.</li>
          </ul>
          <p>
            HMRC warns that some schemes wrongly claim to get around these rules. If an arrangement promises you will
            keep far more of your pay than an employee would, get independent advice first.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="pay"
        title="What the same skills pay in a job"
        intro={
          <p>
            The ONS pay survey used throughout this site leaves out the self-employed, so it cannot show what
            freelancers earn. What it can tell you is what employers pay employees for the same kind of work, which is a
            useful benchmark when you set your prices or weigh up going back to a job.
          </p>
        }
      >
        <DataTable<FieldRow>
          caption="Employee pay in fields people often freelance in"
          description="Median and lower-quarter gross annual pay, full-time employee jobs, UK, 2025. Not freelance earnings."
          rowKey={(r) => r.soc}
          columns={[
            {
              key: "field",
              header: "Field",
              rowHeader: true,
              render: (r) => (
                <span className="block">
                  <span className="block">{r.name}</span>
                  <span className="block text-xs font-normal text-muted">
                    ONS group {r.soc}: {r.title}
                  </span>
                </span>
              ),
            },
            {
              key: "median",
              header: "Employee median",
              numeric: true,
              render: (r) => (r.median === null ? <span className="text-muted">not published</span> : formatGBP(r.median)),
            },
            {
              key: "p25",
              header: "Lower quarter",
              numeric: true,
              render: (r) => (r.p25 === null ? <span className="text-muted">not published</span> : formatGBP(r.p25)),
            },
          ]}
          rows={rows}
          source={<AsheSourceNote />}
          notes="Employees are entitled to paid holiday and may qualify for statutory sick pay and an employer pension contribution. A freelancer has to fund all of these from their own fees."
        />
        <Prose>
          <p>
            Self-employed people are also far more likely to work only from home. In the ONS survey for {OPN_2026.period},{" "}
            {OPN_2026.selfEmployed.homeOnly}% of self-employed people worked only from home, compared with{" "}
            {OPN_2026.employed.homeOnly}% of employees (
            <a href={OPN_2026.href} className="link" rel="noopener">
              ONS, July 2026
            </a>
            ). If home working is what you want and you would rather stay employed, see{" "}
            <Link href="/work-from-home-jobs" className="link">
              our guide to home and hybrid jobs
            </Link>
            .
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="before-you-leave" title="Before you leave your job">
        <Prose>
          <ul>
            <li>
              <strong>Start on the side if you can.</strong> GOV.UK says you can be employed and run a business at the
              same time. A few paying clients before you resign tell you more than any forecast. Check your contract
              for rules on outside work first.
            </li>
            <li>
              <strong>Keep records from the first job.</strong> HMRC says you must keep a record of your income even
              if you use the trading allowance. Its examples include copies of invoices and a spreadsheet of income
              received.
            </li>
            <li>
              <strong>Plan for gaps.</strong> Nobody pays you when you are ill, on holiday or between clients, and your
              tax bill arrives months after you earn the money. Build savings before you rely on freelance income
              alone.
            </li>
            <li>
              <strong>Try it at low cost first.</strong> Smaller gigs are covered in our{" "}
              <Link href="/best-side-hustles-uk" className="link">
                side hustles guide
              </Link>
              , including when online platforms report your sales to HMRC.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Find out which of your skills people pay for"
        body={
          <p>
            Paste your CV and we will pick out the skills you already have and the jobs they lead to, with UK pay for
            each, so you can compare freelancing with a job. It is free and there is no account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/best-side-hustles-uk", label: "Side hustles and the tax rules" },
          { href: "/work-from-home-jobs", label: "Work from home and hybrid jobs" },
          { href: "/highest-paying-remote-jobs-uk", label: "The best-paid remote-friendly jobs" },
          { href: "/career-change-with-no-money", label: "Changing career with no money" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ]}
      />
    </GuideShell>
  );
}
