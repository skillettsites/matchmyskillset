import { after, NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/apis/jobs";
import { isSameSiteRequest } from "@/lib/api-guard";
import { regionFromLocation } from "@/lib/apis/regions";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { TOKEN_PATTERN, getReportByToken } from "@/lib/apis/reports-db";
import { isMatchesDoc, isSkillsDoc } from "@/lib/skills/profile";
import { skillName } from "@/lib/skills/taxonomy";
import { fitContextFromDoc, fitInputFor } from "@/lib/apis/jobs/match";
import { scoreJobFit } from "@/lib/apis/jobs/fit";
import type { JobListing } from "@/lib/apis/jobs";
import { rememberListings } from "@/lib/apis/jobs/job-page";

// Live listings from every enabled board. Each search spends free-tier quota
// (Jooble's key allows 500 calls in total), so only our own pages may call
// this, input is capped and each IP is limited; a person browsing will not
// hit the limit. With ?token=<results link> each advert is also scored
// against that person's skills (no extra board calls, no model call).

export const runtime = "nodejs";
export const maxDuration = 30;

const RATE_LIMIT = 30;
const RATE_WINDOW_SECONDS = 5 * 60;
const PER_PAGE = 25;
const MAX_PAGE = 10;

export async function GET(request: NextRequest) {
  // Checked first, so a refused request never reaches a job board or the rate-limit table.
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const { searchParams } = request.nextUrl;

  const query = cleanText(searchParams.get("q"), 100);
  if (query.length < 2) return NextResponse.json({ error: "Please type a job title or skill." }, { status: 400 });

  const remote = searchParams.get("remote") === "1";
  let location = cleanText(searchParams.get("location"), 80) || undefined;
  // "remote" typed as a place used to be sent to the boards as a town name.
  if (location && /^(remote|anywhere|work from home|wfh|home)$/i.test(location)) location = undefined;
  // "South West" and the other regions are searched as regions, not as a town name.
  const region = !remote ? regionFromLocation(location) ?? undefined : undefined;

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
      region,
      remote,
      page,
      perPage: PER_PAGE,
      salaryMin,
      userIp: ip !== "unknown" ? ip : undefined,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) || undefined,
    });
    const token = searchParams.get("token") ?? "";
    let scored = false;
    if (TOKEN_PATTERN.test(token)) {
      const report = await getReportByToken(token).catch(() => null);
      const doc = report && isSkillsDoc(report.skills) ? report.skills : null;
      if (report && doc) {
        const ctx = fitContextFromDoc(doc, isMatchesDoc(report.matches) ? report.matches.items : []);
        result.jobs = result.jobs.map((job: JobListing) => {
          const fit = scoreJobFit(fitInputFor(job, remote ? "remote" : undefined), ctx);
          return {
            ...job,
            fit: {
              match: fit.match,
              reason: fit.reason,
              explain: fit.explain,
              matched: fit.matched.map(skillName),
              missing: fit.missing.map(skillName),
              typical: fit.typical.map(skillName),
              evidence: fit.evidence,
              ...(fit.level ? { level: fit.level } : {}),
            },
          };
        });
        scored = true;
      }
    }
    // Advert text is for scoring only: never sent to the browser in bulk.
    // Job pages (/jobs/<id>) open from the listing id, so keep what was shown.
    after(() => rememberListings(result.jobs));
    const jobs = result.jobs.map((j) => {
      const { text: _text, skillHits: _hits, advertHtml: _html, ...rest } = j;
      void _text;
      void _hits;
      void _html;
      return rest.mms ? { ...rest, mms: { ...rest.mms, description: "" } } : rest;
    });
    return NextResponse.json({ ...result, jobs, scored }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    console.error("[jobs/search] error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not search the job boards just now. Please try again." }, { status: 500 });
  }
}
