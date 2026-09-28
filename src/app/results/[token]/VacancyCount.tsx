import Link from "next/link";
import { liveVacancyCount } from "@/lib/apis/jobs";
import { titleInSentence } from "@/lib/text";

function jobsHref(title: string, region: string | null): string {
  const p = new URLSearchParams({ q: title });
  if (region) p.set("location", region);
  return `/jobs?${p}`;
}

/**
 * Live UK adverts with the job title in their title, from Adzuna (cached for
 * a day). Rendered inside Suspense so a slow board never holds up the page.
 */
export async function VacancyCount({ title, aliases, region }: { title: string; aliases: string[]; region: string | null }) {
  const result = await liveVacancyCount(title, aliases);
  const href = jobsHref(title, region);
  if (!result) {
    return (
      <p className="text-[0.9375rem] text-ink-2">
        <Link href={href} className="link">
          Search live {titleInSentence(title)} jobs
        </Link>
      </p>
    );
  }
  return (
    <p className="text-[0.9375rem] text-ink-2">
      <span className="font-semibold tabular-nums text-ink">{result.count.toLocaleString("en-GB")}</span> live UK{" "}
      {result.count === 1 ? "advert has" : "adverts have"} &ldquo;{titleInSentence(result.searchedFor)}&rdquo; in the job title
      (Adzuna, checked in the last day).{" "}
      <Link href={href} className="link">
        See jobs
      </Link>
    </p>
  );
}

export function VacancyFallback() {
  return <p className="text-[0.9375rem] text-muted">Checking live vacancies…</p>;
}
