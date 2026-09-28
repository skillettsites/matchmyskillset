import type { Metadata } from "next";
import { SalaryFigure, formatGBP } from "@/components/content";
import { guideMetadata } from "@/components/guides/meta";
import { UK_FT_MEDIAN } from "@/components/guides/pay";
import { PayBandPage, takeHome } from "../_components/PayBand";
import { bracketText, listRows } from "../_components/band-text";

const PATH = "/what-jobs/jobs-that-pay-50k";
const TITLE = "Jobs that pay £50k a year in the UK (ONS 2025 data)";
const DESCRIPTION =
  "UK jobs with a median salary of £50,000 to £59,999, which need no degree, how people get in, and what £50k is after tax. Based on ONS 2025 pay data.";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

export default function JobsThatPay50kPage() {
  const at60 = takeHome(60000);
  return (
    <PayBandPage
      path={PATH}
      lo={50000}
      hi={60000}
      label="£50k"
      h1="Jobs that pay £50k a year in the UK"
      description={DESCRIPTION}
      intro={(f) => (
        <p>
          £50,000 is well above the UK median of <SalaryFigure value={UK_FT_MEDIAN} size="sm" /> for full-time work:{" "}
          {bracketText(f.bracket)} of full-time employee jobs pay less. Only {f.inBand.length} of the {f.published}{" "}
          occupation groups ONS publishes have a median between £50,000 and £59,999. Most are professional or
          management roles, but some have a route in without a degree, such as {listRows(f.noDegreeWithRoute, 3)}.
        </p>
      )}
      faq={(f) => [
        {
          question: "What jobs pay £50k without a degree?",
          answer: `In the latest ONS figures (2025), jobs with a full-time median between £50,000 and £59,999 that do not normally need a degree include ${listRows(f.noDegree, 6)}. Most people in these jobs have years of experience; the median is not a starting salary.`,
        },
        {
          question: "How much is £50k a year after tax?",
          answer: `About ${formatGBP(f.takeHome.yearly)} a year, or ${formatGBP(f.takeHome.monthly)} a month, in 2026/27 if you live in England, Wales or Northern Ireland, before pension or student loan deductions. The 40% higher rate of income tax starts at £50,271, so each extra pound above that is taxed more heavily: £60,000 comes to about ${formatGBP(at60.monthly)} a month on the same basis. Scottish income tax bands are different.`,
        },
        {
          question: "Is £50k a good salary in the UK?",
          answer: `Yes, by UK standards. The full-time median was ${formatGBP(UK_FT_MEDIAN)} in April 2025 and ${bracketText(f.bracket)} of full-time employee jobs paid less than £50,000.`,
        },
        {
          question: "What jobs pay more than £60k?",
          answer:
            "Our page on the highest-paid jobs in the UK lists every occupation group with a median above £60,000 in the 2025 ONS figures. More than half of them are director and senior management groups.",
        },
      ]}
    />
  );
}
