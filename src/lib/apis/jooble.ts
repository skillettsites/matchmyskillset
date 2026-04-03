import type { UnifiedJob } from "@/lib/types";

interface JoobleResult {
  title: string;
  location: string;
  snippet: string;
  salary: string;
  source: string;
  type: string;
  link: string;
  company: string;
  updated: string;
  id: string;
}

interface JoobleResponse {
  totalCount: number;
  jobs: JoobleResult[];
}

function parseSalary(salaryStr: string): { min?: number; max?: number; display?: string } {
  if (!salaryStr) return {};

  // Try to extract numbers from salary strings like "£30,000 - £45,000"
  const numbers = salaryStr.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return { display: salaryStr };

  const parsed = numbers.map((n) => parseInt(n.replace(/,/g, ""), 10));

  if (parsed.length >= 2) {
    return {
      min: Math.min(...parsed),
      max: Math.max(...parsed),
      display: salaryStr,
    };
  }

  return { min: parsed[0], display: salaryStr };
}

function normalise(result: JoobleResult): UnifiedJob {
  const salary = parseSalary(result.salary);

  return {
    id: `jooble_${result.id || Math.random().toString(36).slice(2)}`,
    source: "jooble",
    title: result.title || "Untitled",
    company: result.company || result.source || "Unknown",
    location: result.location || "UK",
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryDisplay: salary.display,
    description: result.snippet || "",
    descriptionSnippet: (result.snippet || "").slice(0, 200),
    url: result.link,
    postedDate: result.updated,
    isFeatured: false,
    contractType: result.type || undefined,
  };
}

export async function searchJooble(params: {
  query: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}): Promise<{ jobs: UnifiedJob[]; total: number }> {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    console.warn("[jooble] API key not configured, skipping");
    return { jobs: [], total: 0 };
  }

  const url = `https://jooble.org/api/${apiKey}`;

  const body: Record<string, unknown> = {
    keywords: params.query,
    page: String(params.page || 1),
    searchMode: 1, // any words
  };

  if (params.location) {
    body.location = params.location;
  }
  if (params.salaryMin) {
    body.salary = String(params.salaryMin);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[jooble] HTTP ${res.status}: ${res.statusText}`);
      return { jobs: [], total: 0 };
    }

    const data = (await res.json()) as JoobleResponse;
    const limit = params.limit || 20;

    return {
      jobs: (data.jobs || []).slice(0, limit).map(normalise),
      total: data.totalCount || 0,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[jooble] Request timed out");
    } else {
      console.error("[jooble] Error:", error);
    }
    return { jobs: [], total: 0 };
  }
}
