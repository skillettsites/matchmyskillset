import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection, type FaqItem } from "@/components/content";
import { REPORT_PRICE_LABEL } from "@/lib/apis/report-product";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing: the free career check and the £9.99 report",
  description:
    "The career check is free with no account or email. The optional Career Change Report is a one-off £9.99 for one career: pay, ways in, a skills plan, a 90-day plan and CV wording.",
  alternates: { canonical: "/pricing" },
};

const FREE = [
  "Start from the job you do now, or paste or upload your CV",
  "Your skills profile, including skills from volunteering, caring and hobbies",
  "Up to 8 UK careers ranked by how many of their key skills you have",
  "ONS median pay for each, the pay range for the middle half, and the change from your current job where we can compare",
  "Whether a degree is usually needed, apprenticeships and licences",
  "How many live adverts there are for each career",
  "A private results link that works for 12 months",
  "Live job search across several UK job boards",
];

const REPORT = [
  "Everything from your free results for that career, in more detail",
  "The pay picture from ONS: the median, the range for the middle half and, where ONS publishes them, the lowest and highest tenth, compared with your current job",
  "Every way in we hold: apprenticeship standards with level, typical length and government funding band, licences, named qualifications and typical entry requirements",
  "Government-funded Skills Bootcamps where they exist for the field",
  "A plan for each skill gap, with course links",
  "A 90-day plan",
  "A skills-first CV summary and 5 to 8 CV bullet points written for that job from your own experience",
  "Interview talking points and live vacancies",
];

const FAQ: FaqItem[] = [
  {
    question: "Is the free check really free?",
    answer:
      "Yes. You do not need an account or an email address to see your results. You can choose to email yourself the results link, and that is the only email we send.",
  },
  {
    question: "What exactly do I get for £9.99?",
    answer: `One Career Change Report for one career from your results, for a single payment of ${REPORT_PRICE_LABEL}. It is not a subscription and there is nothing to cancel. The report appears on screen straight after payment and we email you the link. You can print it or save it as a PDF, and the link works for 12 months.`,
  },
  {
    question: "Where do the pay figures come from?",
    answer:
      "From the Office for National Statistics Annual Survey of Hours and Earnings (ASHE). We show the figure ONS publishes for the whole occupation group and say which group it is. When ONS did not publish a reliable figure, we say so rather than estimate one.",
  },
  {
    question: "Is the report written by a person?",
    answer:
      "No. Pay, ways in and course links come straight from our data. The written parts, such as the 90-day plan and the CV wording, are drafted by an AI model (Claude, by Anthropic) using only those facts and your skills profile. It is a starting point for your own research, not professional careers advice.",
  },
  {
    question: "Can I cancel or get a refund?",
    answer: `The report is digital content that you ask to receive straight away. Before paying, you tick a box agreeing to that, which means the 14-day cancellation right ends once delivery starts. This does not affect your legal rights: if a report is faulty or not as described, you are entitled to have it fixed or replaced, or in some cases a refund. Email ${CONTACT_EMAIL} and tell us what went wrong.`,
  },
  {
    question: "Do you keep my CV?",
    answer:
      "No. Your CV text is used for the analysis and not kept afterwards. We keep your results (skills, career matches and the job title you gave) for 12 months so your link works. Payments are handled by Stripe; we never see your card details.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-reading">
        <p className="kicker text-accent">Pricing</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">Free to check. {REPORT_PRICE_LABEL} if you want the full plan.</h1>
        <p className="mt-3 text-lede text-ink-2">
          The career check is free, with no account and no email needed. If one career stands out, you can buy a one-off
          report on it. There are no subscriptions.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="free-title" className="flex flex-col rounded-lg border border-rule bg-surface p-6 shadow-card sm:p-8">
          <h2 id="free-title" className="font-serif text-h3 font-semibold text-ink">
            Free career check
          </h2>
          <p className="mt-1 text-3xl font-bold text-ink">£0</p>
          <ul className="mt-5 flex-1 space-y-2.5 text-ink-2">
            {FREE.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/discover" className="btn btn-primary btn-lg mt-6">
            Start the free check
          </Link>
        </section>

        <section aria-labelledby="report-title" className="flex flex-col rounded-lg border border-rule bg-surface p-6 shadow-card sm:p-8">
          <h2 id="report-title" className="font-serif text-h3 font-semibold text-ink">
            Career Change Report
          </h2>
          <p className="mt-1 text-ink">
            <span className="text-3xl font-bold">{REPORT_PRICE_LABEL}</span> <span className="text-muted">one payment, for one career</span>
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-ink-2">
            {REPORT.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            You buy it from your results page: pick a career and choose &ldquo;Get the full report&rdquo;. Payment is by card
            through Stripe, with no account.
          </p>
        </section>
      </div>

      <section id="money" aria-labelledby="money-title" className="mt-14 max-w-reading scroll-mt-24">
        <h2 id="money-title" className="font-serif text-h2 font-semibold text-ink">
          How we make money
        </h2>
        <p className="mt-3 text-ink-2">
          From the {REPORT_PRICE_LABEL} report, and from some course links. Where a course provider runs an affiliate scheme, we
          may earn a commission if you sign up through our link, at no extra cost to you. Those links are marked on the page.
          Nobody pays to appear in your career matches: they are ranked only by how many of each career&apos;s key skills you
          have.
        </p>
      </section>

      <div className="mt-14 max-w-reading">
        <FaqSection items={FAQ} heading="Questions about pricing" />
      </div>
    </div>
  );
}
