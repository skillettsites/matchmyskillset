import type { UnifiedJob, JobSearchParams, JobSearchResult } from "@/lib/types";
import { searchAdzuna } from "./adzuna";
import { searchReed } from "./reed";
import { searchJooble } from "./jooble";
import { searchHimalayas } from "./himalayas";

// Deduplicate jobs by normalising title + company
function deduplicateJobs(jobs: UnifiedJob[]): UnifiedJob[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().replace(/\b(ltd|limited|plc|inc)\b/gi, "").trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Search all job sources in parallel
export async function searchAllJobs(
  params: JobSearchParams
): Promise<JobSearchResult> {
  const { query, location, salaryMin, salaryMax, page = 1, limit = 20 } = params;

  if (!query || query.trim().length === 0) {
    return { jobs: [], totalResults: 0, page: 1, hasMore: false };
  }

  const searchParams = {
    query: query.trim(),
    location,
    salaryMin,
    salaryMax,
    page,
    limit,
  };

  // Fetch from all sources in parallel. Each adapter already swallows its own
  // errors and returns an empty list, so one slow or failing board never
  // blocks the others.
  const [adzunaResult, reedResult, joobleResult, himalayasResult] =
    await Promise.all([
      searchAdzuna(searchParams).catch((err) => {
        console.error("[jobs] Adzuna failed:", err);
        return { jobs: [] as UnifiedJob[], total: 0 };
      }),
      searchReed(searchParams).catch((err) => {
        console.error("[jobs] Reed failed:", err);
        return { jobs: [] as UnifiedJob[], total: 0 };
      }),
      searchJooble(searchParams).catch((err) => {
        console.error("[jobs] Jooble failed:", err);
        return { jobs: [] as UnifiedJob[], total: 0 };
      }),
      searchHimalayas(searchParams).catch((err) => {
        console.error("[jobs] Himalayas failed:", err);
        return { jobs: [] as UnifiedJob[], total: 0 };
      }),
    ]);

  const allJobs = [
    ...adzunaResult.jobs,
    ...reedResult.jobs,
    ...joobleResult.jobs,
    ...himalayasResult.jobs,
  ];

  // Deduplicate
  const uniqueJobs = deduplicateJobs(allJobs);

  // Newest first
  uniqueJobs.sort((a, b) => {
    const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
    const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
    return dateB - dateA;
  });

  const totalResults =
    adzunaResult.total +
    reedResult.total +
    joobleResult.total +
    himalayasResult.total;

  return {
    jobs: uniqueJobs.slice(0, limit),
    totalResults,
    page,
    hasMore: uniqueJobs.length >= limit,
  };
}
