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

// Fetch featured jobs from our API and convert to UnifiedJob format
async function fetchFeaturedJobs(
  query: string
): Promise<{ jobs: UnifiedJob[]; total: number }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";
    const res = await fetch(`${baseUrl}/api/featured-jobs`, {
      cache: "no-store",
    });

    if (!res.ok) return { jobs: [], total: 0 };

    const data = await res.json();
    const allFeatured = (data.jobs || []) as Array<{
      id: string;
      title: string;
      company: string;
      location: string;
      salaryMin?: number;
      salaryMax?: number;
      description: string;
      requiredSkills: string[];
      isHidden: boolean;
      createdAt: string;
    }>;

    // Filter by query (title or skills match)
    const q = query.toLowerCase();
    const matched = allFeatured.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );

    const jobs: UnifiedJob[] = matched.map((j) => ({
      id: j.id,
      source: "featured" as const,
      title: j.title,
      company: j.company,
      location: j.location || "UK",
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      salaryDisplay:
        j.salaryMin && j.salaryMax
          ? `£${Math.round(j.salaryMin / 1000)}k - £${Math.round(j.salaryMax / 1000)}k`
          : undefined,
      description: j.description,
      descriptionSnippet: j.description.slice(0, 200),
      url: `/jobs/${j.id}`,
      postedDate: j.createdAt,
      isFeatured: true,
      isHidden: j.isHidden,
      skills: j.requiredSkills,
    }));

    return { jobs, total: jobs.length };
  } catch (err) {
    console.error("[jobs] Featured jobs fetch failed:", err);
    return { jobs: [], total: 0 };
  }
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

  // Fetch from all sources in parallel (including featured jobs)
  const [featuredResult, adzunaResult, reedResult, joobleResult, himalayasResult] =
    await Promise.all([
      fetchFeaturedJobs(query.trim()).catch(() => ({
        jobs: [] as UnifiedJob[],
        total: 0,
      })),
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

  // Merge: featured first, then external
  const allJobs = [
    ...featuredResult.jobs,
    ...adzunaResult.jobs,
    ...reedResult.jobs,
    ...joobleResult.jobs,
    ...himalayasResult.jobs,
  ];

  // Deduplicate
  const uniqueJobs = deduplicateJobs(allJobs);

  // Sort: featured first, then by posted date (newest first)
  uniqueJobs.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
    const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
    return dateB - dateA;
  });

  const totalResults =
    featuredResult.total +
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
