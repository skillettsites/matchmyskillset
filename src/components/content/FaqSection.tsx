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
    <section id={id} aria-labelledby={`${id}-title`} className={`my-12 ${className}`}>
      <H id={`${id}-title`} className="font-serif text-h2 font-semibold text-ink">
        {heading}
      </H>
      {intro && <p className="mt-3 max-w-reading text-ink-2">{intro}</p>}
      <div className="mt-6 border-t border-ink">
        {items.map((item, i) => (
          <details key={`${i}-${item.question}`} className="group border-b border-rule" open={openFirst && i === 0}>
            <summary className="flex min-h-14 cursor-pointer list-none items-start justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
              <Q className="text-lg font-semibold leading-snug text-ink">{item.question}</Q>
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule-strong text-accent transition-transform group-open:rotate-45"
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 1.5v9M1.5 6h9" />
                </svg>
              </span>
            </summary>
            <div className="prose-mms pb-5 text-base">{renderAnswer(item.answer)}</div>
          </details>
        ))}
      </div>
      {schema && <JsonLd data={jsonLd} />}
    </section>
  );
}
