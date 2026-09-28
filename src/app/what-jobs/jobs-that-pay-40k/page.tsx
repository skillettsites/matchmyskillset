import type { Metadata } from "next";
import { SalaryFigure, formatGBP } from "@/components/content";
import { guideMetadata } from "@/components/guides/meta";
import { UK_FT_MEDIAN, allOccupationPay, groupBySoc } from "@/components/guides/pay";
import { PayBandPage } from "../_components/PayBand";
import { bracketText, listRows } from "../_components/band-text";

const PATH = "/what-jobs/jobs-that-pay-40k";
const TITLE = "Jobs that pay £40k a year in the UK (ONS 2025 data)";
const DESCRIPTION =
  "UK jobs with a median salary of £40,000 to £49,999, which ones need no degree, how to get in, and what £40k is after tax. Based on ONS 2025 pay data.";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function JobsThatPay40kPage() {
  // Jobs where even the lower quarter of full-time employees earn £40,000 or more.
  const mostOver40k = groupBySoc(allOccupationPay().filter((p) => p.p25 !== null && p.p25 >= 40000));

  return (
    <PayBandPage
      path={PATH}
      lo={40000}
      hi={50000}
      label="£40k"
      h1="Jobs that pay £40k a year in the UK"
      description={DESCRIPTION}
      intro={(f) => (
        <p>
          £40,000 is just above the UK median of <SalaryFigure value={UK_FT_MEDIAN} size="sm" /> for full-time work:{" "}
          {bracketText(f.bracket)} of full-time employee jobs pay less. ONS publishes a median for {f.published}{" "}
          occupation groups, and {f.inBand.length} of them sit between £40,000 and £49,999. Among them, jobs that do
          not normally need a degree include {listRows(f.noDegreeWithRoute, 3)}.
        </p>
      )}
      faq={(f) => [
        {
          question: "What jobs pay £40k a year without a degree?",
          answer: `In the latest ONS figures (2025), jobs with a full-time median between £40,000 and £49,999 that do not normally need a degree include ${listRows(f.noDegree, 6)}. These are medians for everyone in the job; new starters usually earn less.`,
        },
        {
          question: "Which jobs pay over £40k to most people who do them?",
          answer: `In these jobs even the lower quarter of full-time employees earned £40,000 or more in 2025, so at least three in four earn over £40k: ${listRows(mostOver40k, 8)}. Figures are ONS medians and lower quarters for the whole occupation group.`,
        },
        {
          question: "How much is £40k a year after tax?",
          answer: `About ${formatGBP(f.takeHome.yearly)} a year, or ${formatGBP(f.takeHome.monthly)} a month, in 2026/27 if you live in England, Wales or Northern Ireland. That is after income tax (20% on earnings between £12,570 and £50,270) and employee National Insurance (8% on the same band), before any pension contribution or student loan repayment. Scottish income tax bands are different.`,
        },
        {
          question: "Is £40k a good salary in the UK?",
          answer: `It is above the middle. The median for full-time employees was ${formatGBP(UK_FT_MEDIAN)} in April 2025, and ${bracketText(f.bracket)} of full-time employee jobs paid less than £40,000. Whether it feels comfortable depends on where you live, your housing costs and who depends on your income.`,
        },
      ]}
    />
  );
}
