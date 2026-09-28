import type { Metadata } from "next";
import Link from "next/link";
import { CAREER_OCCUPATIONS } from "@/data/careers";
import { getJobIndex, suggestJobs } from "@/lib/skills/job-lookup";
import { UK_REGIONS } from "@/lib/apis/regions";
import { RECRUITER_SHARING_ENABLED, RECRUITMENT_PARTNER_NAME } from "@/lib/site";
import { recruiterConsentText } from "./consent";
import { DiscoverClient } from "./DiscoverClient";

export const metadata: Metadata = {
  title: "Free career change check: your job or CV",
  description:
    "Type your job or paste your CV to see UK careers that use your skills, with ONS pay, the ways in and live vacancies. Free, and no account or email needed.",
  alternates: { canonical: "/discover" },
};

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = typeof sp.current === "string" ? sp.current : "";
  const current = raw.replace(/\s+/g, " ").trim().slice(0, 80);
  const suggestions = current
    ? suggestJobs(current, 6).map((r) => ({ key: r.entry.key, title: r.entry.title, matchedOn: r.matchedOn }))
    : [];

  return (
    <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-reading">
        <p className="kicker text-accent">Free, no account or email needed</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">See where your experience could take you</h1>
        <p className="mt-3 text-lede text-ink-2">
          Start from the job you do now for an instant answer, or paste your CV for results built on your own experience.
          Either way you get UK careers that use your skills, what they pay according to the Office for National
          Statistics, and how people get in.
        </p>
      </div>

      <DiscoverClient
        index={getJobIndex()}
        initialCurrent={current}
        initialSuggestions={suggestions}
        regions={[...UK_REGIONS]}
        recruiter={RECRUITER_SHARING_ENABLED ? { partner: RECRUITMENT_PARTNER_NAME, text: recruiterConsentText() } : null}
      />

      <section aria-labelledby="how-title" className="mt-14 max-w-reading">
        <h2 id="how-title" className="font-serif text-h3 font-semibold text-ink">
          How the check works
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-2">
          <li>
            We turn your job or CV into a list of skills from our skills list. For a CV, an AI model (Claude, by Anthropic)
            reads the text and picks the skills; it does not choose your careers.
          </li>
          <li>
            We compare those skills with {CAREER_OCCUPATIONS.length}{" "}UK careers that people commonly move into. The score is the share of each
            career&apos;s key skills we found, weighted by how essential each skill is and by how few careers need it, so
            everyday skills such as communication count for less. The same profile always gets the
            same score.
          </li>
          <li>
            Pay comes from the ONS Annual Survey of Hours and Earnings. Ways in come from the National Careers Service and
            Skills England.
          </li>
        </ol>
        <p className="mt-4 text-sm text-muted">
          Your CV text is used for the analysis and not kept afterwards. Your results are saved behind a private link for
          12 months. See our <Link href="/privacy" className="link">privacy policy</Link>.
        </p>
      </section>
    </div>
  );
}
