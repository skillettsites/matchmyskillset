import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/apis/jobs";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";

// Live listings from every enabled board. Each search spends free-tier quota,
// so input is capped and each IP is limited; a person browsing will not hit it.

export const runtime = "nodejs";
export const maxDuration = 30;

const RATE_LIMIT = 30;
const RATE_WINDOW_SECONDS = 5 * 60;
const PER_PAGE = 25;
const MAX_PAGE = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = cleanText(searchParams.get("q"), 100);
  if (query.length < 2) return NextResponse.json({ error: "Please type a job title or skill." }, { status: 400 });

  const remote = searchParams.get("remote") === "1";
  let location = cleanText(searchParams.get("location"), 80) || undefined;
  // "remote" typed as a place used to be sent to the boards as a town name.
  if (location && /^(remote|anywhere|work from home|wfh|home)$/i.test(location)) location = undefined;

  const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) ? Math.min(Math.max(pageParam, 1), MAX_PAGE) : 1;
  const salaryParam = Number.parseInt(searchParams.get("salaryMin") || "", 10);
  const salaryMin = Number.isFinite(salaryParam) && salaryParam > 0 ? Math.min(salaryParam, 500_000) : undefined;

  const ip = clientIp(request);
  const { allowed, retryAfter } = await checkRateLimit(`jobs-search:${ip}`, RATE_LIMIT, RATE_WINDOW_SECONDS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const result = await searchJobs({
      query,
      location,
      remote,
      page,
      perPage: PER_PAGE,
      salaryMin,
      userIp: ip !== "unknown" ? ip : undefined,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) || undefined,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    console.error("[jobs/search] error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not search the job boards just now. Please try again." }, { status: 500 });
  }
}
