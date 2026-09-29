import Link from "next/link";
import type { ReactNode } from "react";
import { SourceNote, formatDate } from "@/components/content";
import { ASHE } from "./routes";

/* ------------------------------------------------------------------ */
/* Section wrapper                                                     */
/* ------------------------------------------------------------------ */

export interface HubSectionProps {
  id: string;
  title: string;
  kicker?: string;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** A titled page section with an anchor, used for every block on a hub. */
export function HubSection({ id, title, kicker, intro, children, className = "" }: HubSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`mt-20 scroll-mt-24 sm:mt-24 [&>h2+.prose-mms]:mt-5 ${className}`}>
      {kicker && <p className="eyebrow text-link">{kicker}</p>}
      <h2 id={`${id}-title`} className="mt-1 max-w-[26ch] text-h2 font-bold text-ink">
        {title}
      </h2>
      {intro && <div className="prose-mms mt-5">{intro}</div>}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Key facts                                                           */
/* ------------------------------------------------------------------ */

export interface Fact {
  /** The number, as printed on the source, e.g. "38,600". */
  figure: string;
  /** What the number means, in a sentence. */
  text: ReactNode;
  source: string;
  href: string;
  /** ISO date or free text. */
  published: string;
}

/** A grid of sourced headline figures. Every figure carries its own citation. */
export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map((f) => (
        <li key={f.figure + f.source} className="tile flex flex-col p-6 sm:p-7">
          <p className="gradient-text self-start text-[40px] font-bold leading-none tracking-[-0.04em] tabular-nums lining-nums">{f.figure}</p>
          <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-2">{f.text}</p>
          <SourceNote className="mt-3" source={f.source} href={f.href} published={f.published} />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Free and funded training                                            */
/* ------------------------------------------------------------------ */

const NCS_BOOTCAMP_FINDER =
  "https://nationalcareers.service.gov.uk/find-a-course/page?searchTerm=&distance=10%20miles&town=&orderByValue=Relevance&startDate=Anytime&courseType=Skills%20Bootcamp&sectors=&learningMethod=&courseHours=&courseStudyTime=&filterA=true&page=1&D=0&coordinates=&campaignCode=&qualificationLevels=";

export interface FundedTrainingProps {
  /** A profession-specific opening paragraph. */
  lead?: ReactNode;
  /** Examples of bootcamp subjects that suit this reader. Plain text. */
  bootcampFit?: ReactNode;
  /** Extra blocks specific to the profession (e.g. Enhanced Learning Credits). */
  children?: ReactNode;
  /** Show Advanced Learner Loans. Defaults to true. */
  showLoans?: boolean;
  /** Show Free Courses for Jobs. Defaults to true. */
  showFreeCourses?: boolean;
}

function FundBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-card ring-1 ring-black/[0.05] sm:p-7">
      <h3 className="text-[21px] font-bold leading-tight tracking-[-0.025em] text-ink">{title}</h3>
      <div className="prose-mms mt-3 max-w-none text-base">{children}</div>
    </div>
  );
}

/**
 * The free and funded ways to retrain in England, each checked on GOV.UK or
 * the Department for Education on 28 September 2026.
 */
export function FundedTraining({ lead, bootcampFit, children, showLoans = true, showFreeCourses = true }: FundedTrainingProps) {
  return (
    <>
      {lead && <div className="prose-mms mt-4">{lead}</div>}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <FundBlock title="Skills Bootcamps (free, up to 16 weeks)">
          <p>
            Skills Bootcamps are free, flexible courses of up to 16 weeks for adults aged 19 or over in England. They are
            free if you take the course yourself rather than through your employer, and you are guaranteed a job interview
            with an employer at the end. If you claim Universal Credit, you can keep claiming while you study.
          </p>
          {bootcampFit && <p>{bootcampFit}</p>}
          <p>
            <a href={NCS_BOOTCAMP_FINDER} rel="noopener">
              Find a Skills Bootcamp on the official National Careers Service course finder
            </a>
            .
          </p>
          <SourceNote
            source="Department for Education, Skills for Careers: Skills Bootcamps; DWP JobHelp: Skills Bootcamps"
            href="https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp"
            published="checked 28 September 2026"
          />
        </FundBlock>

        <FundBlock title="Apprenticeships at any adult age">
          <p>
            GOV.UK&apos;s only age rule is that you are 16 or over. You must live in England and not be in full-time
            education, and you can already hold a degree. You are an employee earning a wage, at least 20% of your normal
            working hours go on training, and relevant experience can shorten it. Your employer and training provider must
            not ask you to pay towards the training or assessment.
          </p>
          <p>
            Check the pay before you apply. An employer can pay the apprentice rate of £8 an hour in your first year, even
            if you are 19 or over. After the first year you are entitled to the minimum wage for your age: £12.71 an hour
            at 21 and over from April 2026.
          </p>
          <SourceNote
            source="GOV.UK, Become an apprentice; Apprenticeship funding rules August 2026 to July 2027 (paragraph 220); National Minimum Wage rates"
            href="https://www.gov.uk/become-apprentice"
            published="checked 28 September 2026"
          />
        </FundBlock>

        {showFreeCourses && (
          <FundBlock title="Free Courses for Jobs (level 3 and some level 2)">
            <p>
              If you are 19 or over and earn below £25,750, or are unemployed, you can get a level 3 qualification free in
              England, or a level 2 in construction, engineering or manufacturing. Subjects include accounting, business
              management, digital, health and social care, and teaching and lecturing. Local rules can differ, so ask the
              provider.
            </p>
            <SourceNote
              source="GOV.UK, Free courses for jobs (DWP)"
              href="https://www.gov.uk/guidance/free-courses-for-jobs"
              published="2025-07-29"
            />
          </FundBlock>
        )}

        {showLoans && (
          <FundBlock title="Advanced Learner Loans (level 3 to 6)">
            <p>
              For a level 3, 4, 5 or 6 course at an approved college or provider in England, if you are 19 or over on the
              first day. There is no credit check and it does not depend on your income. You repay once you earn over the
              threshold, and interest runs from the first payment. For level 3, ask about an Adult Skills Fund grant first,
              which you do not repay. Level 4 to 6 courses starting on or after 1 January 2027 move to the Lifelong
              Learning Entitlement.
            </p>
            <SourceNote
              source="GOV.UK, Advanced Learner Loan"
              href="https://www.gov.uk/advanced-learner-loan"
              published="checked 28 September 2026"
            />
          </FundBlock>
        )}
      </div>
      {children}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Method note                                                         */
/* ------------------------------------------------------------------ */

/** "How we worked this out": what the ONS figures are, and their limits. */
export function MethodNote({ baseline, extra }: { baseline: ReactNode; extra?: ReactNode }) {
  return (
    <section id="method" aria-labelledby="method-title" className="mt-20 scroll-mt-24 rounded-[28px] bg-cloud p-6 sm:p-10">
      <h2 id="method-title" className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink">
        How we worked this out
      </h2>
      <div className="prose-mms mt-4 max-w-none text-base">
        <p>
          Pay is the median gross annual pay for full-time employees in the UK from the{" "}
          <a href={ASHE.href} rel="noopener">
            ONS Annual Survey of Hours and Earnings {ASHE.year}
          </a>{" "}
          (provisional, Table 14.7a, published {formatDate(ASHE.published)}). It covers the {ASHE.period}, for employees
          who had been in the same job for more than a year. A median is the midpoint for everyone in the job, from new
          starters to people with decades behind them, so it is not a starting salary.
        </p>
        <p>{baseline}</p>
        <ul>
          <li>
            Each job is matched to an ONS SOC 2020 unit group using the ONS coding index. Where several jobs share a
            group, the figure covers all of them, and the card says so.
          </li>
          <li>
            ONS does not publish a figure when the estimate is too uncertain (a coefficient of variation over 20%) or could
            identify people. We say &quot;not published&quot; rather than fill the gap.
          </li>
          <li>ASHE counts employees only. It says nothing about self-employed earnings, such as private tutoring or consultancy.</li>
          <li>
            &quot;Degree usually needed&quot; is our judgement from the entry routes that ONS and the National Careers Service
            describe. &quot;No&quot; means a documented route exists below degree level, not that nobody in the job has a degree.
          </li>
          <li>
            Apprenticeships are Skills England standards approved for delivery on 29 September 2026. They apply in England.
            Durations are Skills England&apos;s typical figures, and relevant experience can shorten them.
          </li>
          <li>
            ONS publishes ASHE 2026 on 22 October 2026. We will update these figures when it does.
          </li>
        </ul>
        {extra}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sources and related links                                           */
/* ------------------------------------------------------------------ */

export interface SourceItem {
  name: string;
  href: string;
  /** Publication or update date as shown on the source. */
  date: string;
}

export function SourcesList({ items }: { items: SourceItem[] }) {
  return (
    <section id="sources" aria-labelledby="sources-title" className="mt-16 scroll-mt-24">
      <h2 id="sources-title" className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink">
        Sources
      </h2>
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2 marker:text-mute">
        {items.map((s) => (
          <li key={s.href + s.name}>
            <a href={s.href} className="link" rel="noopener">
              {s.name}
            </a>
            , {s.date}.
          </li>
        ))}
      </ol>
    </section>
  );
}

export interface RelatedLink {
  href: string;
  label: string;
  /** One line on why it is useful. */
  note?: string;
}

export function RelatedLinks({ title = "Keep going", links }: { title?: string; links: RelatedLink[] }) {
  return (
    <section aria-labelledby="related-title" className="mt-16">
      <h2 id="related-title" className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map((l) => {
          const external = /^https?:\/\//.test(l.href);
          const inner = (
            <>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold tracking-[-0.02em] text-ink group-hover:underline group-hover:underline-offset-4">
                  {l.label}
                </span>
                {l.note && <span className="mt-0.5 block text-[14px] text-mute">{l.note}</span>}
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </>
          );
          const cls = "group flex h-full min-h-14 items-center justify-between gap-4 rounded-[20px] bg-cloud px-5 py-4 transition-colors hover:bg-hair";
          return (
            <li key={l.href}>
              {external ? (
                <a href={l.href} rel="noopener" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link href={l.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Container used by every hub page. */
export function HubPage({ children }: { children: ReactNode }) {
  return <article className="mx-auto max-w-page px-4 pb-24 sm:px-6">{children}</article>;
}

/** An in-page table of contents. */
export function OnThisPage({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="mt-10 rounded-[22px] bg-cloud p-5 sm:p-6">
      <p className="kicker">On this page</p>
      <ol className="mt-2 grid gap-x-8 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.href}>
            <a href={i.href} className="flex min-h-11 items-center text-[15px] text-ink-2 underline-offset-4 hover:text-link hover:underline">
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
