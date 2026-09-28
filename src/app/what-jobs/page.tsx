import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, DataTable, PageHeader, Prose, SalaryFigure, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, UK_FT_MEDIAN, allUnitGroupPay } from "@/components/guides/pay";
import { ASHE_NATIONAL } from "@/data/careers";

const PATH = "/what-jobs";
const TITLE = "UK jobs by salary band: £30k, £40k, £50k (ONS 2025)";
const DESCRIPTION =
  "How UK occupations spread across salary bands in the latest ONS figures, how your pay compares with everyone else's, and which jobs sit at £30k, £40k and £50k.";
const H1 = "UK jobs by salary band";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

interface BandRow {
  label: string;
  lo: number;
  hi: number;
  href?: string;
  count: number;
}

interface PercentileRow {
  pct: string;
  value: number | null;
}

export default function WhatJobsIndexPage() {
  const units = allUnitGroupPay().filter((u) => u.median !== null);
  const bands: Omit<BandRow, "count">[] = [
    { label: "Under £25,000", lo: 0, hi: 25000 },
    { label: "£25,000 to £29,999", lo: 25000, hi: 30000 },
    { label: "£30,000 to £39,999", lo: 30000, hi: 40000, href: "/what-jobs/jobs-that-pay-30k" },
    { label: "£40,000 to £49,999", lo: 40000, hi: 50000, href: "/what-jobs/jobs-that-pay-40k" },
    { label: "£50,000 to £59,999", lo: 50000, hi: 60000, href: "/what-jobs/jobs-that-pay-50k" },
    { label: "£60,000 and over", lo: 60000, hi: Infinity, href: "/highest-paying-careers-uk" },
  ];
  const rows: BandRow[] = bands.map((b) => ({
    ...b,
    count: units.filter((u) => (u.median ?? 0) >= b.lo && (u.median ?? 0) < b.hi).length,
  }));

  const ft = ASHE_NATIONAL.ft;
  const percentiles: PercentileRow[] = [
    { pct: "10%", value: ft.p10 },
    { pct: "20%", value: ft.p20 },
    { pct: "25%", value: ft.p25 },
    { pct: "30%", value: ft.p30 },
    { pct: "40%", value: ft.p40 },
    { pct: "50% (median)", value: ft.median },
    { pct: "60%", value: ft.p60 },
    { pct: "70%", value: ft.p70 },
    { pct: "75%", value: ft.p75 },
    { pct: "80%", value: ft.p80 },
    { pct: "90%", value: ft.p90 },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Jobs by salary" }]} />}
        kicker="Pay"
        title={H1}
        intro={
          <p>
            Half of full-time employees in the UK earned less than <SalaryFigure value={UK_FT_MEDIAN} size="sm" /> a
            year in the latest ONS figures, and half earned more. ONS publishes a median for {units.length} occupation
            groups; most of them sit between £25,000 and £50,000. Pick a band to see the jobs in it, which need a
            degree, and how people get in.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <AsheSourceNote />
      </PageHeader>

      <GuideSection id="bands" title="How many occupations sit in each salary band">
        <DataTable<BandRow>
          caption="Occupation groups by median full-time pay"
          description={`${units.length} ONS occupation groups with a published full-time median, UK, 2025.`}
          rowKey={(r) => r.label}
          columns={[
            {
              key: "label",
              header: "Median pay band",
              rowHeader: true,
              render: (r) =>
                r.href ? (
                  <Link href={r.href} className="link">
                    {r.label}
                  </Link>
                ) : (
                  r.label
                ),
            },
            { key: "count", header: "Occupation groups", numeric: true, format: "number" },
          ]}
          rows={rows}
          source={<AsheSourceNote />}
        />
      </GuideSection>

      <GuideSection
        id="compare"
        title="How your salary compares"
        intro={
          <p>
            These are the points that split UK full-time employee jobs by pay. For example, 10% of full-time jobs paid
            less than {formatGBP(ft.p10 ?? 0)} and 90% paid less than {formatGBP(ft.p90 ?? 0)}.
          </p>
        }
      >
        <DataTable<PercentileRow>
          caption="UK full-time pay: the share of jobs paying less than each amount"
          description="Gross annual pay, full-time employee jobs, UK, tax year ending 5 April 2025."
          rowKey={(r) => r.pct}
          columns={[
            { key: "pct", header: "Share of jobs paying less", rowHeader: true },
            { key: "value", header: "Annual pay", numeric: true, format: "gbp" },
          ]}
          rows={percentiles}
          source={<AsheSourceNote note="Percentiles of gross annual pay for all full-time employee jobs in the UK (the All employees row of Table 14.7a)." />}
        />
      </GuideSection>

      <GuideSection id="notes" title="Before you compare">
        <Prose>
          <p>
            These figures are gross pay before tax, for full-time employee jobs, from the ONS Annual Survey of Hours and
            Earnings. They leave out the self-employed and people who had been in their job for less than a year. ONS
            publishes the 2026 figures on{" "}
            <a href="https://www.ons.gov.uk/releases/employeeearningsintheuk2026" className="link" rel="noopener">
              22 October 2026
            </a>
            .
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See what your skills could earn elsewhere"
        body={
          <p>
            Paste your CV to see the jobs your experience leads to, with ONS pay for each. Free, and you do not need
            an account.
          </p>
        }
      />

      <RelatedLinks
        links={[
          { href: "/what-jobs/jobs-that-pay-30k", label: "Jobs that pay £30k without a degree" },
          { href: "/what-jobs/jobs-that-pay-40k", label: "Jobs that pay £40k a year" },
          { href: "/what-jobs/jobs-that-pay-50k", label: "Jobs that pay £50k a year" },
          { href: "/highest-paying-careers-uk", label: "The highest-paid jobs in the UK" },
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
        ]}
      />
    </GuideShell>
  );
}
