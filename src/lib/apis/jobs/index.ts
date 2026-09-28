// Searches every enabled job board in parallel and merges the results.
// Server-side only. Listings are never stored or given their own pages: each
// card links to the original advert on the board that supplied it.

import { JOB_SOURCES, adzunaTitleCount, describeSourceError } from "./sources";
import type { JobListing, JobQuery, JobSearchResponse, SourceSummary } from "./types";
import { dedupeKey, titleIsRelevant } from "./util";

export type { JobListing, JobQuery, JobSearchResponse, SourceSummary } from "./types";
export { adzunaTitleCount };

/** Below this many close matches on a page, looser title matches are allowed in. */
const RELAX_BELOW = 5;

/** Adverts the board dates further back than this are treated as stale and left out. */
export const MAX_AGE_DAYS = 60;

function isFresh(job: JobListing, cutoff: number): boolean {
  if (!job.postedAt) return true;
  const t = Date.parse(job.postedAt);
  return Number.isNaN(t) || t >= cutoff;
}

export async function searchJobs(q: JobQuery): Promise<JobSearchResponse> {
  const active = JOB_SOURCES.filter((s) => s.enabled() && s.appliesTo(q));
  // Boards that would have been asked without the region, but cannot be narrowed to one.
  const skippedForRegion = q.region
    ? JOB_SOURCES.filter((s) => s.enabled() && !s.appliesTo(q) && s.appliesTo({ ...q, region: undefined })).map((s) => s.label)
    : [];
  const cutoff = Date.now() - MAX_AGE_DAYS * 86_400_000;

  const settled = await Promise.all(
    active.map(async (s) => {
      try {
        const r = await s.search(q);
        return { source: s, ...r, jobs: r.jobs.filter((j) => isFresh(j, cutoff)) };
      } catch (err) {
        const reason = describeSourceError(err);
        console.warn(`[jobs] ${s.id} failed: ${reason}`);
        return { source: s, jobs: [] as JobListing[], total: null, error: reason };
      }
    })
  );

  const strict = settled.flatMap((r) => r.jobs.filter((j) => titleIsRelevant(q.query, j.title, "strict")));
  const relaxed = strict.length < RELAX_BELOW;
  const kept = relaxed ? settled.flatMap((r) => r.jobs.filter((j) => titleIsRelevant(q.query, j.title, "loose"))) : strict;

  const seen = new Set<string>();
  const unique: JobListing[] = [];
  for (const job of kept) {
    const key = dedupeKey(job.title, job.company, job.location);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(job);
  }

  // Newest first; ads without a date go last, in board order.
  unique.sort((a, b) => (b.postedAt ? Date.parse(b.postedAt) : 0) - (a.postedAt ? Date.parse(a.postedAt) : 0));

  const sources: SourceSummary[] = settled.map((r) => ({
    id: r.source.id,
    label: r.source.label,
    total: r.total,
    shown: unique.filter((j) => j.source === r.source.id).length,
    ...(r.error ? { error: r.error } : {}),
  }));

  const hasMore = settled.some((r) => (r.total !== null ? r.total > q.page * q.perPage : r.jobs.length >= q.perPage));

  return {
    jobs: unique,
    page: q.page,
    hasMore: hasMore && q.page < 10,
    relaxed,
    sources,
    maxAgeDays: MAX_AGE_DAYS,
    ...(q.region ? { region: q.region, skippedForRegion } : {}),
  };
}

/**
 * Live UK adverts with this job title (or its first alias, if the title
 * itself finds none), from Adzuna's title-only search. Cached for a day.
 */
export async function liveVacancyCount(title: string, aliases: string[] = []): Promise<{ count: number; searchedFor: string } | null> {
  for (const term of [title, ...aliases.slice(0, 1)]) {
    const count = await adzunaTitleCount(term.toLowerCase());
    if (count === null) return null;
    if (count > 0 || term === aliases[0] || aliases.length === 0) return { count, searchedFor: term };
  }
  return null;
}
