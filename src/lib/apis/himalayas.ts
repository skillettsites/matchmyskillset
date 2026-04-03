import type { UnifiedJob } from "@/lib/types";

const BASE_URL = "https://himalayas.app/jobs/api";

interface HimalayasJob {
  title: string;
  excerpt: string;
  companyName: string;
  companyLogo?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  seniority?: string;
  currency?: string;
  locationRestrictions?: string[];
  categories?: string[];
  description?: string;
  pubDate: string;
  applicationLink: string;
  guid: string;
}

interface HimalayasResponse {
  totalCount?: number;
  jobs: HimalayasJob[];
}

function formatSalary(min?: number, max?: number, currency?: string): string | undefined {
  if (!min && !max) return undefined;
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  if (min && max && min !== max) {
    return `${sym}${Math.round(min / 1000)}k - ${sym}${Math.round(max / 1000)}k`;
  }
  const val = min || max;
  return val ? `${sym}${Math.round(val / 1000)}k` : undefined;
}

function normalise(result: HimalayasJob): UnifiedJob {
  return {
    id: `himalayas_${result.guid || Math.random().toString(36).slice(2)}`,
    source: "adzuna", // Display as generic for now since UI only has adzuna/reed/jooble/featured
    title: result.title,
    company: result.companyName || "Unknown",
    location: result.locationRestrictions?.join(", ") || "Remote",
    salaryMin: result.minSalary || undefined,
    salaryMax: result.maxSalary || undefined,
    salaryDisplay: formatSalary(result.minSalary, result.maxSalary, result.currency),
    description: result.description || result.excerpt || "",
    descriptionSnippet: (result.excerpt || "").slice(0, 200),
    url: result.applicationLink,
    postedDate: result.pubDate,
    isFeatured: false,
    contractType: result.employmentType || undefined,
    workType: "remote",
  };
}

export async function searchHimalayas(params: {
  query: string;
  location?: string;
  page?: number;
  limit?: number;
}): Promise<{ jobs: UnifiedJob[]; total: number }> {
  const limit = params.limit || 20;

  const searchParams = new URLSearchParams({
    q: params.query,
    country: "GB",
    limit: String(limit),
    sort: "recent",
  });

  if (params.page && params.page > 1) {
    searchParams.set("offset", String((params.page - 1) * limit));
  }

  const url = `${BASE_URL}/search?${searchParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[himalayas] HTTP ${res.status}: ${res.statusText}`);
      return { jobs: [], total: 0 };
    }

    const data = (await res.json()) as HimalayasResponse;

    return {
      jobs: (data.jobs || []).slice(0, limit).map(normalise),
      total: data.totalCount || data.jobs?.length || 0,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[himalayas] Request timed out");
    } else {
      console.error("[himalayas] Error:", error);
    }
    return { jobs: [], total: 0 };
  }
}
