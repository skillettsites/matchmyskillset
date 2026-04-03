import type { UnifiedJob } from "@/lib/types";

const BASE_URL = "https://www.reed.co.uk/api/1.0";

interface ReedResult {
  jobId: number;
  employerName: string;
  employerProfileId?: number;
  employerProfileName?: string;
  jobTitle: string;
  locationName: string;
  minimumSalary?: number;
  maximumSalary?: number;
  currency?: string;
  expirationDate: string;
  date: string;
  jobDescription: string;
  applications?: number;
  jobUrl: string;
}

interface ReedResponse {
  results: ReedResult[];
  totalResults: number;
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

function normalise(result: ReedResult): UnifiedJob {
  return {
    id: `reed_${result.jobId}`,
    source: "reed",
    title: result.jobTitle,
    company: result.employerName || "Unknown",
    location: result.locationName || "UK",
    salaryMin: result.minimumSalary && result.minimumSalary > 0 ? result.minimumSalary : undefined,
    salaryMax: result.maximumSalary && result.maximumSalary > 0 ? result.maximumSalary : undefined,
    salaryDisplay: formatSalary(
      result.minimumSalary && result.minimumSalary > 0 ? result.minimumSalary : undefined,
      result.maximumSalary && result.maximumSalary > 0 ? result.maximumSalary : undefined
    ),
    description: result.jobDescription || "",
    descriptionSnippet: (result.jobDescription || "").slice(0, 200),
    url: result.jobUrl,
    postedDate: result.date,
    isFeatured: false,
  };
}

export async function searchReed(params: {
  query: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}): Promise<{ jobs: UnifiedJob[]; total: number }> {
  const apiKey = process.env.REED_API_KEY;

  if (!apiKey) {
    console.warn("[reed] API key not configured, skipping");
    return { jobs: [], total: 0 };
  }

  const limit = params.limit || 20;
  const skip = ((params.page || 1) - 1) * limit;

  const searchParams = new URLSearchParams({
    keywords: params.query,
    resultsToTake: String(limit),
    resultsToSkip: String(skip),
  });

  if (params.location) {
    searchParams.set("locationName", params.location);
    searchParams.set("distanceFromLocation", "30");
  }
  if (params.salaryMin) {
    searchParams.set("minimumSalary", String(params.salaryMin));
  }
  if (params.salaryMax) {
    searchParams.set("maximumSalary", String(params.salaryMax));
  }

  const url = `${BASE_URL}/search?${searchParams.toString()}`;

  // Reed uses Basic Auth: API key as username, empty password
  const authToken = Buffer.from(`${apiKey}:`).toString("base64");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${authToken}`,
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[reed] HTTP ${res.status}: ${res.statusText}`);
      return { jobs: [], total: 0 };
    }

    const data = (await res.json()) as ReedResponse;

    return {
      jobs: (data.results || []).map(normalise),
      total: data.totalResults || 0,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[reed] Request timed out");
    } else {
      console.error("[reed] Error:", error);
    }
    return { jobs: [], total: 0 };
  }
}
