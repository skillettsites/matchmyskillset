import type { Metadata } from "next";
import Link from "next/link";
import { RouteCard } from "@/components/content/RouteCard";
import { ToolCallout } from "@/components/content/ToolCallout";
import { FIT_LINKS, GUIDE_LINKS, JOB_HUBS, TOOL_LINKS, type NavItem } from "@/components/site";

export const metadata: Metadata = {
  title: { absolute: "Leaving your job? Real routes and UK pay | MatchMySkillset" },
  description:
    "See where people like you actually go after leaving a job, what it pays in the UK, and how to get there. Start from your current job or paste your CV for a free analysis. No account needed.",
  alternates: { canonical: "/" },
};

/*
 * Example routes. Deliberately no pay or time figures: those only appear once
 * they can be cited from ONS data. Every "way in" below was checked against
 * the body that runs it (CIPD, NIHR, SIA on GOV.UK, the Career Transition
 * Partnership on GOV.UK) on 28 September 2026.
 */
const ROUTES = [
  {
    from: "Teacher",
    to: "Learning and development",
    href: "/career-change-from-teaching",
    summary: "Planning lessons, delivering them and checking what people learned is the core of workplace training.",
    entryRoute: "CIPD Level 5 Associate Diploma in Organisational Learning and Development",
    linkLabel: "Leaving teaching",
  },
  {
    from: "Nurse",
    to: "Clinical research",
    href: "/non-clinical-jobs-for-nurses",
    summary: "Clinical trials need people who understand patients, consent and careful record keeping.",
    entryRoute: "Good Clinical Practice (GCP) training, free from the NIHR for NHS staff",
    linkLabel: "Non-clinical jobs for nurses",
  },
  {
    from: "Police officer",
    to: "Security and investigations",
    href: "/jobs-for-ex-police-officers",
    summary: "Investigation, risk assessment and staying calm under pressure carry straight over.",
    entryRoute: "A front-line SIA licence for roles such as close protection",
    linkLabel: "Jobs for ex-police officers",
  },
  {
    from: "Armed forces",
    to: "Project and operations management",
    href: "/jobs-for-ex-military",
    summary: "Planning, logistics and leading teams map onto civilian project and operations roles.",
    entryRoute: "Resettlement support from the Career Transition Partnership, the official service for service leavers",
    linkLabel: "Jobs for ex-military",
  },
  {
    from: "Retail manager",
    to: "Human resources",
    href: "/career-change-from-retail",
    summary: "Recruiting, training and managing a shop team is people work every day.",
    entryRoute: "CIPD Level 3 Foundation Certificate in People Practice",
    linkLabel: "Leaving retail",
  },
] as const;

const REASSURANCE = ["Free to use", "No account needed", "Written for the UK"];

const STEPS = [
  {
    title: "Start from your job or your CV",
    body: "Pick the job you do now to read its guide, or paste your CV for a personal analysis. Both are free, and you do not need an account.",
  },
  {
    title: "See realistic destinations",
    body: "The jobs people with your background move into, the skills that carry over, the gaps to close, and UK pay where the Office for National Statistics publishes it.",
  },
  {
    title: "Choose your next step",
    body: "Read the route in full, look at live vacancies, or get everything for one chosen job in a single Career Change Report, paid once.",
    tag: "Report coming soon",
  },
];

const TRUST = [
  {
    title: "Official pay data, cited",
    body: (
      <>
        Pay comes from the{" "}
        <a
          className="link"
          href="https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025"
          rel="noopener"
        >
          ONS Annual Survey of Hours and Earnings
        </a>
        . Each figure shows its source and publication date.
      </>
    ),
  },
  {
    title: "Real ways in",
    body: "Qualifications and schemes link to GOV.UK or the body that runs them, such as the CIPD, the NIHR or the Career Transition Partnership.",
  },
  {
    title: "Nothing made up",
    body: "No invented statistics, no success stories we cannot show you, no star ratings and no match percentages we cannot explain.",
  },
  {
    title: "Clear about what is changing",
    body: "We are bringing older guides up to this standard. Every rebuilt guide shows the date it was last checked.",
  },
];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function LinkList({ title, links }: { title: string; links: NavItem[] }) {
  return (
    <div>
      <h3 className="kicker">{title}</h3>
      <ul className="mt-3 border-t border-ink">
        {links.map((link) => (
          <li key={link.href} className="border-b border-rule">
            <Link
              href={link.href}
              className="group flex min-h-12 items-center justify-between gap-3 py-2 text-lg text-ink hover:text-accent"
            >
              <span className="group-hover:underline group-hover:underline-offset-4">{link.label}</span>
              <Arrow className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero: the promise and both ways in */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-page gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-20 lg:pt-20">
          <div className="lg:pt-6">
            <p className="kicker text-accent">The UK guide for people leaving a job</p>
            <h1 className="mt-4 text-display font-semibold text-ink">
              Leaving your job? See where people like you{" "}
              <span className="relative whitespace-nowrap">
                actually go
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-highlight"
                >
                  <path d="M2 8c50-6 120-7 216-2" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-6 max-w-[34rem] text-lede text-ink-2">
              What it pays in the UK, and how to get there. Start from the job
              you do now, or paste your CV for a free personal analysis. No
              account needed.
            </p>
            <ul className="mt-9 hidden gap-x-8 gap-y-3 border-t border-rule pt-6 text-[0.9375rem] font-semibold text-ink-2 lg:flex lg:flex-wrap">
              {REASSURANCE.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Job picker, drawn as stops on a route */}
          <div className="rounded-xl border border-rule bg-surface p-5 shadow-card sm:p-7">
            <h2 className="font-sans text-xl font-bold tracking-normal text-ink">Start from the job you do now</h2>
            <p className="mt-1 text-[0.9375rem] text-muted">Choose one to see where people go from it.</p>
            <ol className="relative mt-4">
              <span
                aria-hidden="true"
                className="absolute bottom-6 left-[0.6875rem] top-6 border-l-2 border-dotted border-rule-strong"
              />
              {JOB_HUBS.map((hub) => (
                <li key={hub.href}>
                  <Link
                    href={hub.href}
                    className="group relative flex min-h-12 items-center gap-4 rounded-md py-1.5 pr-2 text-lg text-ink hover:bg-accent-wash"
                  >
                    <span
                      aria-hidden="true"
                      className="relative ml-1 h-4 w-4 shrink-0 rounded-full border-2 border-ink-2 bg-surface transition-colors group-hover:border-accent group-hover:bg-accent"
                    />
                    <span className="flex-1 font-medium">{hub.short}</span>
                    <Arrow className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex items-center gap-3 text-sm text-muted" aria-hidden="true">
              <span className="h-px flex-1 bg-rule" />
              or
              <span className="h-px flex-1 bg-rule" />
            </div>

            <div className="mt-4 rounded-lg bg-accent-wash p-4">
              <p className="font-semibold text-ink">Paste your CV instead</p>
              <p className="mt-1 text-[0.9375rem] text-ink-2">
                A free personal analysis of the skills you have and the jobs
                they lead to.
              </p>
              <Link href="/discover" className="btn btn-primary mt-3 w-full">
                Analyse my CV
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Where people actually go */}
      <section className="py-16 sm:py-24" aria-labelledby="routes-title">
        <div className="mx-auto max-w-page px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="kicker">Example routes</p>
            <h2 id="routes-title" className="mt-3 text-h2 text-ink">
              Where people actually go
            </h2>
            <p className="mt-4 text-lede text-ink-2">
              Five common starting points and one route out of each. Every
              guide sets out more options and the first steps. We add pay only
              where we can cite the Office for National Statistics.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ROUTES.map((route) => (
              <RouteCard key={route.href} {...route} />
            ))}

            <div className="flex flex-col justify-between rounded-lg bg-night p-6 text-night-text">
              <div>
                <p className="kicker text-night-muted">Your job is not listed?</p>
                <p className="mt-3 font-serif text-[1.625rem] font-semibold leading-tight">
                  Start from your own experience
                </p>
                <p className="mt-3 text-night-muted">
                  Paste your CV and we will map the skills you already have to
                  jobs across the UK market.
                </p>
              </div>
              <svg viewBox="0 0 240 84" aria-hidden="true" className="my-6 h-auto w-full max-w-xs">
                <path
                  d="M28 62C80 62 120 22 200 22"
                  fill="none"
                  stroke="#7fb89f"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="0.01 9"
                />
                <circle cx="16" cy="62" r="9" fill="none" stroke="#e9e3d6" strokeWidth="3" />
                <circle cx="220" cy="22" r="13" fill="#7fb89f" />
                <circle cx="220" cy="22" r="5" fill="#e0a030" />
              </svg>
              <div className="mt-6 flex flex-col gap-2">
                <Link href="/discover" className="btn bg-night-text text-night hover:bg-white focus-visible:outline-highlight">
                  Analyse my CV
                  <Arrow />
                </Link>
                <Link
                  href="/careers-for"
                  className="inline-flex min-h-11 items-center justify-center font-semibold text-night-text underline-offset-4 hover:underline focus-visible:outline-highlight"
                >
                  Browse jobs by profession
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-rule bg-paper-2/60 py-16 sm:py-24" aria-labelledby="how-title">
        <div className="mx-auto max-w-page px-4 sm:px-6">
          <h2 id="how-title" className="text-h2 text-ink">
            How it works
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg font-semibold ${
                      i === STEPS.length - 1 ? "bg-accent text-white" : "border-2 border-ink-2 bg-paper text-ink"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="hidden flex-1 border-t-2 border-dotted border-rule-strong md:block" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-ink">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-ink-2">{step.body}</p>
                {step.tag && (
                  <p className="mt-3 inline-block rounded bg-highlight-soft px-2 py-0.5 text-sm font-semibold text-highlight-ink">
                    {step.tag}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Guides and tools */}
      <section className="py-16 sm:py-24" aria-labelledby="guides-title">
        <div className="mx-auto max-w-page px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 id="guides-title" className="text-h2 text-ink">
              Guides for where you are now
            </h2>
            <p className="mt-4 text-lede text-ink-2">
              Not tied to one profession? Start with your situation.
            </p>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            <LinkList title="Your situation" links={GUIDE_LINKS} />
            <LinkList title="Finding the right fit" links={FIT_LINKS} />
            <LinkList title="Tools" links={TOOL_LINKS} />
          </div>
        </div>
      </section>

      {/* Why trust us */}
      <section className="bg-night py-16 text-night-text sm:py-24" aria-labelledby="trust-title">
        <div className="mx-auto grid max-w-page gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <p className="kicker text-night-muted">How we work</p>
            <h2 id="trust-title" className="mt-3 text-h2">
              Why you can trust what you read here
            </h2>
            <p className="mt-4 text-night-muted">
              Changing career is a big decision. You should be able to check
              every number we show you.
            </p>
          </div>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {TRUST.map((item) => (
              <div key={item.title} className="border-t border-white/20 pt-4">
                <dt className="flex items-center gap-2 text-lg font-bold">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-highlight" />
                  {item.title}
                </dt>
                <dd className="mt-2 text-night-muted [&_.link]:text-night-text">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final call to action */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-page px-4 sm:px-6">
          <ToolCallout heading="Not sure where to start? Begin with what you already do." />
        </div>
      </section>
    </>
  );
}
