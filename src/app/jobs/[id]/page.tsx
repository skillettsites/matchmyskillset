import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SITE_NAME } from "@/lib/site";
import { CV_HREF } from "@/components/site";
import { TOKEN_PATTERN, getReportByToken } from "@/lib/apis/reports-db";
import { snapshotFrom, type MatchedJob } from "@/lib/apis/jobs/match";
import { loadJobView, matchedToView, parseListingId, type AdvertBlock, type JobView } from "@/lib/apis/jobs/job-page";
import { postedLabel } from "@/components/jobs/format";
import { MatchDial } from "@/components/jobs/MatchJobCard";
import { SourceBadge } from "@/components/jobs/SourceBadge";
import { JobApplyButton, JobBackLink } from "@/components/jobs/JobPageControls";
import { TrackApplied } from "@/components/tracking/TrackApplied";

// One advert from another job board (Reed, Adzuna, Teaching Vacancies,
// Himalayas, Remotive): pay, contract, dates and the advert itself, with the
// person's match when opened from their results (?r=<results token>). Jobs
// posted on MatchMySkillset have their own page, /jobs/mms/<id>.
//
// Not indexed: the adverts belong to the boards, and Himalayas asks that its
// jobs are not passed on to search engines' job listings.

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type Search = Promise<{ r?: string }>;

const LEVEL_TEXT: Record<"up" | "similar" | "down", string> = { up: "A step up from your level", similar: "Similar level to yours", down: "A step down from your level" };

const load = cache(async (rawId: string, r: string | null) => {
  const id = decodeURIComponent(rawId);
  if (!parseListingId(id)) return null;
  let match: MatchedJob | null = null;
  let names: Record<string, string> = {};
  if (r && TOKEN_PATTERN.test(r)) {
    const report = await getReportByToken(r).catch(() => null);
    const snap = report ? snapshotFrom(report.matches) : null;
    match = snap?.jobs.find((j) => j.id === id) ?? null;
    names = snap?.skillNames ?? {};
  }
  const view: JobView | null = (await loadJobView(id)) ?? (match ? matchedToView(match) : null);
  return { id, view, match, names, results: match ? r : null };
});

function day(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const [{ id }, { r }] = await Promise.all([params, searchParams]);
  const data = await load(id, r ?? null);
  if (!data?.view) return { title: "Job no longer available", robots: { index: false, follow: false } };
  const v = data.view;
  const base = `${v.title} at ${v.company}`;
  const withSite = `${base} | ${SITE_NAME}`;
  return {
    title: { absolute: withSite.length <= 60 ? withSite : base.length > 60 ? `${base.slice(0, 59).trimEnd()}…` : base },
    description: `${v.title} at ${v.company}, ${v.location}${v.salary ? `, ${v.salary}` : ""}. See the advert, the pay and how well your CV matches.`,
    robots: { index: false, follow: true },
  };
}

function Fact({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mute">{label}</dt>
      <dd className={`mt-0.5 text-[15px] ${strong ? "font-semibold text-ink" : "font-medium text-ink"} first-letter:uppercase`}>{value}</dd>
    </div>
  );
}

/** The advert as plain blocks: headings, paragraphs and lists. No HTML from the board is rendered. */
function Advert({ blocks }: { blocks: AdvertBlock[] }) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flushList = (key: number) => {
    if (!list.length) return;
    out.push(
      <ul key={`ul-${key}`} className="list-disc space-y-1.5 pl-5 marker:text-mute">
        {list.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    );
    list = [];
  };
  blocks.forEach((b, i) => {
    if (b.k === "li") {
      list.push(b.t);
      return;
    }
    flushList(i);
    out.push(
      b.k === "h" ? (
        <h3 key={i} className="pt-2 text-[18px] font-semibold tracking-[-0.02em] text-ink first-letter:uppercase">
          {b.t}
        </h3>
      ) : (
        <p key={i}>{b.t}</p>
      )
    );
  });
  flushList(blocks.length);
  return <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-ink-2">{out}</div>;
}

function MatchPanel({ match, names, results, jobId }: { match: MatchedJob; names: Record<string, string>; results: string; jobId: string }) {
  const n = (ids: string[] | undefined) => (ids ?? []).map((id) => names[id] ?? id);
  const matched = n(match.matched);
  const missing = n(match.missing);
  const typical = n(match.typical);
  return (
    <div className="card-white p-6">
      <div className="flex items-center gap-4">
        <MatchDial value={match.match} />
        <div>
          <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{match.evidence === "title" ? "Title match only" : "Your match"}</p>
          {match.level && <p className="text-[14px] text-mute">{LEVEL_TEXT[match.level]}</p>}
        </div>
      </div>
      {match.reason && <p className="mt-4 text-[15px] text-ink">{match.reason}</p>}
      {matched.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[13px] font-medium text-ink-2">Your matching skills</p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Your skills that this advert names">
            {matched.map((s) => (
              <li key={s} className="rounded-full bg-green-soft px-2.5 py-1 text-[13px] font-medium text-green">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {typical.length > 0 && (
        <p className="mt-3 text-[14px] text-mute">
          <span className="font-medium text-ink-2">Typical for this role, you have:</span> {typical.join(", ")} <span>(from our careers data, not the advert)</span>
        </p>
      )}
      {missing.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[13px] font-medium text-ink-2">The advert also asks for</p>
          <ul className="flex flex-wrap gap-1.5">
            {missing.map((s) => (
              <li key={s} className="rounded-full bg-cloud px-2.5 py-1 text-[13px] font-medium text-ink-2">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {match.explain && (
        <details className="mt-4 text-[14px]">
          <summary className="cursor-pointer text-link">How we worked out {match.match}%</summary>
          <p className="mt-2 rounded-xl bg-cloud px-3 py-2 leading-relaxed text-ink-2">{match.explain}</p>
        </details>
      )}
      <div className="mt-5 border-t hairline pt-5">
        <p className="text-[15px] font-semibold text-ink">Tailor your CV for this job</p>
        <p className="mt-1 text-[14px] text-mute">We rewrite your own CV to lead with what this advert asks for. Your first tailored CV is free.</p>
        <Link href={`/tools/tailor?from=${encodeURIComponent(results)}&job=${encodeURIComponent(jobId)}`} className="btn btn-secondary btn-sm mt-3">
          Tailor my CV for this job
        </Link>
      </div>
    </div>
  );
}

export default async function JobPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const [{ id }, { r }] = await Promise.all([params, searchParams]);
  const data = await load(id, r ?? null);
  if (!data) notFound();
  const { view, match, names, results } = data;
  const backHref = results ? `/results/${results}#jobs` : "/jobs";
  const backLabel = results ? "Back to your matches" : "Back to job search";

  if (!view) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-24 text-center sm:px-6">
        <h1 className="headline">This job is no longer here.</h1>
        <p className="lede mt-4">The advert may have closed, or we have not shown it for a while. Search again for live jobs.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/jobs" className="btn btn-primary">
            Search jobs
          </Link>
          <Link href={CV_HREF} className="btn btn-secondary">
            Match my CV
          </Link>
        </div>
      </div>
    );
  }

  const posted = postedLabel(view.postedAt);
  const trackable = { id: view.id, source: view.source, title: view.title, company: view.company, location: view.location, url: view.url, ...(view.salary ? { salary: view.salary } : {}) };

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-45%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px] px-4 pb-20 pt-8 sm:px-6 md:pt-12">
        <JobBackLink id={view.id} href={backHref} label={backLabel} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <SourceBadge source={view.source} label={view.sourceLabel} />
              {view.remote && <span className="pill !px-2.5 !py-0.5 bg-green-soft text-[12px] text-green">Remote</span>}
              {posted && <span className="text-mute">{posted}</span>}
            </div>
            <h1 className="headline mt-4 !text-[32px] sm:!text-[44px]">{view.title}</h1>
            <p className="mt-2 text-[21px] font-medium tracking-[-0.02em] text-ink-2">{view.company}</p>
            <p className="mt-0.5 text-[17px] text-mute">{view.location}</p>

            <dl className="card-white mt-8 grid grid-cols-2 gap-5 p-5 sm:grid-cols-3 sm:p-6">
              <Fact label="Salary" value={view.salary ?? "See the advert"} strong={Boolean(view.salary)} />
              <Fact label="Contract" value={view.contract ?? "Not given"} />
              <Fact label="Location" value={view.remote && !/remote/i.test(view.location) ? `${view.location} (remote)` : view.location} />
              <Fact label="Posted" value={day(view.postedAt) || "Not given"} />
              {view.closesAt && <Fact label="Closing date" value={day(view.closesAt)} />}
              <Fact label="Advert from" value={view.sourceLabel} />
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <JobApplyButton job={{ ...trackable, sourceLabel: view.sourceLabel }} match={match?.match} />
            </div>
            <div className="max-w-[560px]">
              <TrackApplied job={trackable} />
            </div>
            {/* Phones: the match comes before the advert. Wider screens show it in the side column. */}
            {match && results && (
              <div className="mt-8 lg:hidden">
                <MatchPanel match={match} names={names} results={results} jobId={view.id} />
              </div>
            )}

            <section aria-labelledby="advert-title" className="mt-10">
              <h2 id="advert-title" className="title">
                {view.full ? "The advert" : "About the job"}
              </h2>
              {!view.full && (
                <p className="mt-3 rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink-2">
                  {view.advert.length
                    ? `${view.sourceLabel} shares only the start of this advert with us. Read the whole advert on ${view.sourceLabel} before you apply.`
                    : `${view.sourceLabel} does not share the advert text with us. Read it on ${view.sourceLabel}.`}
                </p>
              )}
              {view.advert.length > 0 && <Advert blocks={view.advert} />}
              <p className="mt-8 text-[13px] text-mute">
                This advert comes from {view.sourceLabel}
                {view.source === "adzuna" ? " (Jobs by Adzuna)" : ""}. We show it as they supply it and do not check adverts from other sites, so confirm the
                details on{" "}
                <a href={view.url} target="_blank" rel="noopener noreferrer nofollow" className="text-link hover:underline">
                  the original advert
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                .
              </p>
            </section>
          </div>

          <aside className={`space-y-5 lg:sticky lg:top-24 ${match && results ? "hidden lg:block" : ""}`}>
            {match && results ? (
              <MatchPanel match={match} names={names} results={results} jobId={view.id} />
            ) : (
              <div className="card-white p-6">
                <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">How well do you match?</p>
                <p className="mt-1 text-[15px] text-mute">Upload your CV and we score this kind of job, and hundreds of live adverts, against the skills you already have. Free, no account.</p>
                <Link href={CV_HREF} className="btn btn-primary mt-4 w-full">
                  Match my CV
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
