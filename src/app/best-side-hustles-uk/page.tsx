import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { GOV } from "../work-from-home-jobs/_data/sources";

const PATH = "/best-side-hustles-uk";
const TITLE = "Best side hustles in the UK and the tax rules to know";
const DESCRIPTION =
  "Realistic UK side hustle ideas, including ones you can do from home, and the HMRC rules: the £1,000 trading allowance, Self Assessment and platform reporting.";
const H1 = "Side hustles in the UK: realistic ideas and the tax rules";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

interface Hustle {
  idea: string;
  home: "Yes" | "Partly" | "No";
  need: string;
  tax: string;
}

/** Editorial list. The tax column summarises the GOV.UK rules explained below the table. */
const HUSTLES: Hustle[] = [
  { idea: "Writing, editing or proofreading", home: "Yes", need: "A few samples of your work.", tax: "Trading income" },
  { idea: "Online tutoring", home: "Yes", need: "Strong subject knowledge; a DBS check may be needed to teach children.", tax: "Trading income" },
  { idea: "Bookkeeping or admin for small businesses", home: "Yes", need: "Confidence with spreadsheets or accounting software.", tax: "Trading income" },
  { idea: "Design or website work", home: "Yes", need: "A portfolio. Free tools are enough to start.", tax: "Trading income" },
  { idea: "Creating content online", home: "Yes", need: "Time: ad or sponsorship income can take months, if it comes at all.", tax: "Check with HMRC's income checker" },
  { idea: "Selling things you no longer need", home: "Yes", need: "Photos and honest descriptions.", tax: "Usually no tax on personal items" },
  { idea: "Making or buying things to resell", home: "Yes", need: "Money for stock and a record of costs.", tax: "Likely to be trading" },
  { idea: "Renting a room in your home", home: "Yes", need: "A furnished spare room and a lodger you have checked.", tax: "Rent a Room Scheme" },
  { idea: "Hiring out equipment you own", home: "Partly", need: "Tools or kit people want.", tax: "Trading income" },
  { idea: "Pet sitting and dog walking", home: "No", need: "Local clients; check your insurance.", tax: "Trading income" },
  { idea: "Delivery and driving apps", home: "No", need: "A vehicle or bike and insurance that covers the work.", tax: "Trading income" },
];

export default function SideHustlesPage() {
  const faq = [
    {
      question: "How much can you earn from a side hustle before paying tax in the UK?",
      answer:
        "The first £1,000 of gross trading income in a tax year is tax-free under the trading allowance. Letting furnished accommodation in your own home has a separate limit of £7,500 a year under the Rent a Room Scheme, or £3,750 if you share the income.",
    },
    {
      question: "Do I have to register as self-employed for a side hustle?",
      answer:
        "Yes, if your gross trading income is more than £1,000 in a tax year. You must register for Self Assessment by 5 October after the tax year ends: 5 October 2026 for the year to 5 April 2026. Registering late can mean a penalty.",
    },
    {
      question: "Will Vinted or eBay report me to HMRC?",
      answer:
        "They may. Since 1 January 2024, digital platforms may have to report sellers to HMRC each year, unless the seller made fewer than 30 sales of goods and received 2,000 euros (about £1,700) or less. Being reported does not mean you owe tax: HMRC says you are unlikely to pay tax on personal items you sell, but buying or making things to sell at a profit is likely to be trading.",
    },
    {
      question: "What side hustles can I do from home in the UK?",
      answer:
        "Writing and editing, online tutoring, bookkeeping or admin for small businesses, design and website work, creating content, selling online and letting a spare room can all be done from home. Most count as trading income, so the £1,000 trading allowance and Self Assessment rules apply.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Side hustles" }]} />}
        kicker="Extra income"
        title={H1}
        intro={
          <p>
            A side hustle is paid work you do alongside your main job, and most of the ideas below can be done from
            home. We do not quote typical earnings, because we could not find a reliable source for them. The rules
            that matter most come from HMRC: the first £1,000 of trading income a year is tax-free, and above that you
            must register for Self Assessment.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <SourceNote
          source="HMRC, Tax-free allowances on property and trading income"
          href={GOV.tradingAllowance}
          note="Checked 28 September 2026."
        />
      </PageHeader>

      <GuideSection
        id="ideas"
        title="Side hustle ideas that work in the UK"
        intro={
          <p>
            Skills you already use at work are often the quickest to sell, because you can start without training or
            stock.
          </p>
        }
      >
        <DataTable<Hustle>
          caption="Side hustle ideas: what you need and which tax rule applies"
          rowKey={(h) => h.idea}
          columns={[
            { key: "idea", header: "Idea", rowHeader: true },
            { key: "home", header: "From home?" },
            { key: "need", header: "What you need" },
            { key: "tax", header: "Tax rule" },
          ]}
          rows={HUSTLES}
          notes="The list is our own selection. Before you start, check your employment contract for rules on outside work, and whether the work needs a licence, insurance or a criminal record check."
        />
      </GuideSection>

      <GuideSection id="tax" title="The tax rules for side income">
        <Prose>
          <ul>
            <li>
              <strong>The £1,000 trading allowance.</strong> Gross income of up to £1,000 a year from self-employment,
              casual services such as babysitting or gardening, or hiring out personal equipment is tax-free, and you
              usually do not need to tell HMRC. Above £1,000 you can deduct the allowance instead of your actual
              expenses, but not both. It cannot be used at all in a year when you have trading income from your
              employer or from a company you or someone connected to you owns or controls (
              <a href={GOV.tradingAllowance} className="link" rel="noopener">
                HMRC
              </a>
              ).
            </li>
            <li>
              <strong>When to register.</strong> With gross trading income over £1,000 in a tax year (6 April to 5
              April), you must register for Self Assessment by 5 October after that year ends (
              <a href={GOV.registerSelfAssessment} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Tax on the profit.</strong> If your job already uses your £12,570 Personal Allowance, side
              profit is taxed at the rate you pay on the top slice of your income: 20% for basic-rate taxpayers outside
              Scotland in 2026 to 2027 (
              <a href={GOV.incomeTaxRates} className="link" rel="noopener">
                GOV.UK
              </a>
              ). Class 4 National Insurance starts only once self-employed profit is over £12,570 (
              <a href={GOV.selfEmployedNi} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
            <li>
              <strong>Renting a room.</strong> The Rent a Room Scheme lets you earn up to £7,500 a year tax-free from
              letting furnished accommodation in your own home, or £3,750 if you share the income (
              <a href={GOV.rentARoom} className="link" rel="noopener">
                GOV.UK
              </a>
              ).
            </li>
          </ul>
          <p>
            If you are not sure which rule applies, HMRC&apos;s{" "}
            <a href={GOV.checkAdditionalIncome} className="link" rel="noopener">
              additional income checker
            </a>{" "}
            covers selling things, casual jobs, renting out part of your home and creating content online.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="platforms" title="Selling online: when platforms report you to HMRC">
        <Prose>
          <p>
            Since 1 January 2024, apps and websites that let you sell goods or services may have to collect your
            details, including your National Insurance number, and report your income to HMRC each year by 31 January
            (
            <a href={GOV.platformSellers} className="link" rel="noopener">
              HMRC guidance for sellers
            </a>
            ).
          </p>
          <ul>
            <li>
              They do not have to report you if you made fewer than 30 sales of goods in the calendar year and
              received 2,000 euros (about £1,700) or less. That exception does not cover services or rentals (
              <a href={GOV.platformOperators} className="link" rel="noopener">
                HMRC
              </a>
              ).
            </li>
            <li>
              A report does not mean you owe tax. You are unlikely to pay tax on personal items you sell, but buying or
              making goods to sell at a profit is likely to be trading.
            </li>
            <li>
              Reports cover the calendar year and HMRC taxes the tax year, so keep your own records of sales and costs.
            </li>
          </ul>
          <p>
            Be wary of any course, starter kit or &ldquo;opportunity&rdquo; that asks for money up front; the warning
            signs are the same as for{" "}
            <Link href="/jobs-you-can-do-from-home-with-no-experience#scams" className="link">
              work from home job scams
            </Link>
            . If your side hustle is turning into your main work, our{" "}
            <Link href="/freelance-careers-uk" className="link">
              freelance guide
            </Link>{" "}
            covers the next steps.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="When a side hustle is a sign you want a different job"
        body={
          <p>
            If you want extra income because your job no longer fits, see what else your experience could lead to.
            Paste your CV or type the job you do now. It is free and there is no account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/freelance-careers-uk", label: "Going freelance in the UK" },
          { href: "/jobs-you-can-do-from-home-with-no-experience", label: "Jobs you can do from home with no experience" },
          { href: "/work-from-home-jobs", label: "Work from home and hybrid jobs" },
          { href: "/career-change-with-no-money", label: "Changing career with no money" },
        ]}
      />
    </GuideShell>
  );
}
