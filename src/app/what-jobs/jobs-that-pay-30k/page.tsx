import type { Metadata } from "next";
import { SalaryFigure, formatGBP } from "@/components/content";
import { guideMetadata } from "@/components/guides/meta";
import { UK_FT_MEDIAN } from "@/components/guides/pay";
import { PayBandPage } from "../_components/PayBand";
import { bracketText, listRows } from "../_components/band-text";

const PATH = "/what-jobs/jobs-that-pay-30k";
const TITLE = "Jobs that pay £30k without a degree (UK, ONS 2025 data)";
const DESCRIPTION =
  "UK jobs with a median salary of £30,000 to £39,999 that you can get into without a degree, with ONS 2025 pay, the apprenticeship route and £30k after tax.";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

/** Apprentice minimum wage from April 2026 (GOV.UK). */
const APPRENTICE_RATE = 8.0;

export default function JobsThatPay30kPage() {
  const apprenticeYear = APPRENTICE_RATE * 37.5 * 52;
  return (
    <PayBandPage
      path={PATH}
      lo={30000}
      hi={40000}
      label="£30k"
      h1="Jobs that pay £30k a year without a degree"
      description={DESCRIPTION}
      intro={(f) => (
        <p>
          £30,000 is below the UK median of <SalaryFigure value={UK_FT_MEDIAN} size="sm" /> for full-time work:{" "}
          {bracketText(f.bracket)} of full-time employee jobs pay less. It is the most common £10,000 band in the ONS figures:{" "}
          {f.inBand.length} of the {f.published} occupation groups with a published median sit between £30,000 and
          £39,999. Jobs in this band with a route in below degree level include {listRows(f.noDegreeWithRoute, 3)}.
        </p>
      )}
      faq={(f) => [
        {
          question: "What jobs pay £30k without a degree?",
          answer: `In the latest ONS figures (2025), jobs with a full-time median between £30,000 and £39,999 that do not normally need a degree include ${listRows(f.noDegree, 8)}. The median covers everyone in the job, so a new starter usually earns less.`,
        },
        {
          question: "How much is £30k a year after tax?",
          answer: `About ${formatGBP(f.takeHome.yearly)} a year, or ${formatGBP(f.takeHome.monthly)} a month, in 2026/27 if you live in England, Wales or Northern Ireland. That is after income tax (20% on earnings between £12,570 and £50,270) and employee National Insurance (8% on the same band), before any pension contribution or student loan repayment. Scottish income tax bands are different.`,
        },
        {
          question: "Can you earn £30k as an apprentice?",
          answer: `Not on the minimum. From April 2026 the apprentice minimum wage is £8.00 an hour, which is ${formatGBP(apprenticeYear)} a year for a 37.5-hour week. It applies to apprentices under 19, or 19 and over in their first year; after that you are entitled to the minimum wage for your age (£12.71 an hour at 21 and over). Some employers pay apprentices more, so check each advert.`,
        },
        {
          question: "Is £30k a good salary in the UK?",
          answer: `It is below the middle for full-time work. The UK median for full-time employees was ${formatGBP(UK_FT_MEDIAN)} in April 2025, and ${bracketText(f.bracket)} of full-time employee jobs paid less than £30,000.`,
        },
      ]}
    />
  );
}
