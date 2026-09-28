import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";

/**
 * One question and answer. A string answer is used for both the page and the
 * FAQPage JSON-LD (blank lines split paragraphs). A rich answer (links,
 * lists) needs `answerText`, the plain-text version for the structured data.
 */
export type FaqItem =
  | { question: string; answer: string; answerText?: string }
  | { question: string; answer: ReactNode; answerText: string };

/** Props for {@link FaqSection}. */
export interface FaqSectionProps {
  /** The questions, phrased the way people ask them. */
  items: FaqItem[];
  /** Section heading. Defaults to "Common questions". */
  heading?: string;
  /** Short line under the heading. */
  intro?: ReactNode;
  /** Anchor id for the section. Defaults to "faq". */
  id?: string;
  /** Heading level of the section title; questions use the next level down. Defaults to 2. */
  headingLevel?: 2 | 3;
  /** Emit FAQPage JSON-LD. Defaults to true. Use it once per page at most. */
  schema?: boolean;
  /** Open the first question by default. Defaults to false. */
  openFirst?: boolean;
  /** Extra classes for the section. */
  className?: string;
}

function renderAnswer(answer: ReactNode) {
  if (typeof answer !== "string") return answer;
  return answer
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((para, i) => <p key={i}>{para.trim()}</p>);
}

/**
 * Questions and answers as native `<details>` disclosures (no JavaScript),
 * each question a heading, plus FAQPage JSON-LD built from the same items
 * so the markup and the page can never disagree.
 */
export function FaqSection({
  items,
  heading = "Common questions",
  intro,
  id = "faq",
  headingLevel = 2,
  schema = true,
  openFirst = false,
  className = "",
}: FaqSectionProps) {
  if (items.length === 0) return null;
  const H = `h${headingLevel}` as "h2" | "h3";
  const Q = `h${headingLevel + 1}` as "h3" | "h4";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerText ?? (typeof item.answer === "string" ? item.answer : ""),
      },
    })),
  };

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`my-16 scroll-mt-24 ${className}`}>
      <H id={`${id}-title`} className="text-h2 font-bold text-ink">
        {heading}
      </H>
      {intro && <p className="mt-4 max-w-reading text-[17px] text-mute">{intro}</p>}
      <div className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {items.map((item, i) => (
          <details key={`${i}-${item.question}`} className="faq group" open={openFirst && i === 0}>
            <summary className="flex min-h-11 items-center justify-between gap-6 py-5 text-left sm:py-6">
              <Q className="text-[18px] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-[20px]">{item.question}</Q>
              <span
                aria-hidden="true"
                className="faq-icon grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.05] text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <div className="prose-mms pb-7 pr-2 text-[17px] sm:pr-12">{renderAnswer(item.answer)}</div>
          </details>
        ))}
      </div>
      {schema && <JsonLd data={jsonLd} />}
    </section>
  );
}
