import type { UnifiedJob } from "@/lib/types";

const BASE_URL = "https://api.adzuna.com/v1/api/jobs/gb/search";

interface AdzunaResult {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  created: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_time?: string;
  contract_type?: string;
  category?: { label: string; tag: string };
}

interface AdzunaResponse {
  results: AdzunaResult[];
  count: number;
}

function formatSalary(min?: number, max?: number): string | undefined {
  const validMin = min && min > 0 ? min : undefined;
  const validMax = max && max > 0 ? max : undefined;
  if (!validMin && !validMax) return undefined;
  if (validMin && validMax && validMin !== validMax) {
    return `£${Math.round(validMin / 1000)}k - £${Math.round(validMax / 1000)}k`;
  }
  const val = validMin || validMax;
  return val ? `£${Math.round(val / 1000)}k` : undefined;
}

function normalise(result: AdzunaResult): UnifiedJob {
  return {
    id: `adzuna_${result.id}`,
    source: "adzuna",
    title: result.title,
    company: result.company?.display_name || "Unknown",
    location: result.location?.display_name || "UK",
    salaryMin: result.salary_min ? Math.round(result.salary_min) : undefined,
    salaryMax: result.salary_max ? Math.round(result.salary_max) : undefined,
    salaryDisplay: formatSalary(result.salary_min, result.salary_max),
    description: result.description || "",
    descriptionSnippet: (result.description || "").slice(0, 200),
    url: result.redirect_url,
    postedDate: result.created,
    isFeatured: false,
    contractType: result.contract_time || result.contract_type,
  };
}

export async function searchAdzuna(params: {
  query: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}): Promise<{ jobs: UnifiedJob[]; total: number }> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("[adzuna] API keys not configured, skipping");
    return { jobs: [], total: 0 };
  }

  const page = params.page || 1;
  const limit = params.limit || 20;

  const searchParams = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(limit),
    what: params.query,
    content_type: "application/json",
    sort_by: "relevance",
  });

  if (params.location) {
    searchParams.set("where", params.location);
  }
  if (params.salaryMin) {
    searchParams.set("salary_min", String(params.salaryMin));
  }
  if (params.salaryMax) {
    searchParams.set("salary_max", String(params.salaryMax));
  }

  const url = `${BASE_URL}/${page}?${searchParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[adzuna] HTTP ${res.status}: ${res.statusText}`);
      return { jobs: [], total: 0 };
    }

    const data = (await res.json()) as AdzunaResponse;

    return {
      jobs: (data.results || []).map(normalise),
      total: data.count || 0,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[adzuna] Request timed out");
    } else {
      console.error("[adzuna] Error:", error);
    }
    return { jobs: [], total: 0 };
  }
}
