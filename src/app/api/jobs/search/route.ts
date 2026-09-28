import { NextRequest, NextResponse } from "next/server";
import { searchAllJobs } from "@/lib/apis/jobs";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";

// Every search spends free-tier quota on Reed, Adzuna and Himalayas, so input
// is capped and each IP is limited. A person browsing will not hit the limit.
const RATE_LIMIT = 30;
const RATE_WINDOW_SECONDS = 5 * 60;

const MAX_QUERY_LENGTH = 100;
const MAX_LOCATION_LENGTH = 80;
const MAX_PAGE = 10;
const MAX_SALARY = 1_000_000;

function parseSalary(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(n, MAX_SALARY);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = cleanText(searchParams.get("q"), MAX_QUERY_LENGTH);
  if (query.length < 2) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  const location = cleanText(searchParams.get("location"), MAX_LOCATION_LENGTH) || undefined;

  let salaryMin = parseSalary(searchParams.get("salaryMin"));
  let salaryMax = parseSalary(searchParams.get("salaryMax"));
  if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
    [salaryMin, salaryMax] = [salaryMax, salaryMin];
  }

  const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) ? Math.min(Math.max(pageParam, 1), MAX_PAGE) : 1;

  const { allowed, retryAfter } = await checkRateLimit(
    `jobs-search:${clientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_SECONDS
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    // Fetch more results from each source so client-side filtering has a bigger pool
    const results = await searchAllJobs({
      query,
      location,
      salaryMin,
      salaryMax,
      page,
      limit: 50,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("[jobs/search] Error:", error);
    return NextResponse.json(
      { error: "Failed to search jobs. Please try again." },
      { status: 500 }
    );
  }
}
