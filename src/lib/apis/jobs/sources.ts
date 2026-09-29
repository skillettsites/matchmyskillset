// Job board adapters. Each one is enabled by config (its env keys), has its
// own timeout, never throws past search(), and maps the board's fields to
// JobListing. Keys are always read through env() because production values in
// this stack can end in a stray newline, which is what broke Adzuna live.
//
// Attribution: every listing carries its board's name and links to the
// original ad, as Remotive's and Teaching Vacancies' terms require.

import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { ADZUNA_REGION, UK_NATIONS, regionByName } from "@/lib/apis/regions";
import type { JobListing, JobQuery, SourceId, SourceResult } from "./types";
import { regionsForLocations } from "./place-region";
import { MMS_SOURCE_LABEL, searchMmsJobs } from "./mms";
import { skillsInText, type TextSkillHit } from "@/lib/skills/text-skills";
import { usOnly } from "./role";
import {
  SourceHttpError,
  fetchJson,
  formatSalary,
  isoOrUndefined,
  looksNonUk,
  parseUkDate,
  remoteLocationLabel,
  stripHtml,
  tidyLocation,
  trimBoilerplate,
  tidySnippet,
  ukEligible,
} from "./util";

export interface JobSource {
  id: SourceId;
  label: string;
  /** Board home page, for "More on <board>" links. */
  homepage: string;
  timeoutMs: number;
  enabled(): boolean;
  /** Whether to ask this board at all for this query (remote-only boards, etc.). */
  appliesTo(q: JobQuery): boolean;
  search(q: JobQuery): Promise<SourceResult>;
}

function compactHits(hits: TextSkillHit[]): [string, boolean][] {
  return hits.map((h) => [h.id, h.inTitle]);
}

function expandHits(skills: [string, boolean][]): TextSkillHit[] {
  return skills.map(([id, inTitle]) => ({ id, hits: 1, inTitle }));
}

// ---------------------------------------------------------------------------
// MatchMySkillset: jobs employers post on this site (mms_jobs, live and
// unexpired only). Always asked first, so they lead every list.
// ---------------------------------------------------------------------------

const mms: JobSource = {
  id: "mms",
  label: MMS_SOURCE_LABEL,
  homepage: "/jobs",
  timeoutMs: 5000,
  enabled: () => true,
  appliesTo: () => true,
  search: (q) => searchMmsJobs(q),
};

// ---------------------------------------------------------------------------
// Reed (UK). Basic auth with the key as the user name.
// ---------------------------------------------------------------------------

interface ReedJob {
  jobId: number;
  employerName?: string;
  jobTitle: string;
  locationName?: string;
  minimumSalary?: number | null;
  maximumSalary?: number | null;
  currency?: string | null;
  date?: string;
  jobDescription?: string;
  jobUrl: string;
}

// Reed reads Wales, Scotland and Northern Ireland as places but not the
// English regions: "South West" returned Reading, Birmingham and Cardiff
// (checked 28 September 2026). For a region search it is asked for more
// adverts (UK-wide, or the nation) and each advert's location is checked.
const REED_REGION_TAKE = 100;

const reed: JobSource = {
  id: "reed",
  label: "Reed",
  homepage: "https://www.reed.co.uk/jobs",
  timeoutMs: 8000,
  enabled: () => Boolean(env("REED_API_KEY")),
  appliesTo: () => true,
  async search(q) {
    const take = q.region ? REED_REGION_TAKE : q.perPage;
    const params = new URLSearchParams({
      keywords: q.remote ? `${q.query} remote` : q.query,
      resultsToTake: String(take),
      resultsToSkip: String((q.page - 1) * take),
    });
    if (q.region) {
      if (UK_NATIONS.includes(q.region)) params.set("locationName", q.region);
    } else if (q.location && !q.remote) {
      params.set("locationName", q.location);
      params.set("distanceFromLocation", "15");
    }
    if (q.salaryMin) params.set("minimumSalary", String(q.salaryMin));
    const auth = Buffer.from(`${env("REED_API_KEY")}:`).toString("base64");
    const data = await fetchJson<{ results?: ReedJob[]; totalResults?: number }>(
      `https://www.reed.co.uk/api/1.0/search?${params}`,
      { headers: { Authorization: `Basic ${auth}` }, next: { revalidate: 1800 } },
      this.timeoutMs
    );
    const jobs = (data.results ?? []).map(
      (r): JobListing => ({
        id: `reed_${r.jobId}`,
        source: "reed",
        sourceLabel: "Reed",
        title: r.jobTitle,
        company: r.employerName || "Employer not named",
        location: tidyLocation(r.locationName) || "UK",
        remote: q.remote ? "maybe" : "no",
        salary: formatSalary(r.minimumSalary ?? undefined, r.maximumSalary ?? undefined, r.currency || "GBP"),
        salaryMin: r.minimumSalary ?? undefined,
        salaryMax: r.maximumSalary ?? undefined,
        salaryCurrency: r.currency || "GBP",
        snippet: stripHtml(r.jobDescription),
        // Reed's search gives the first 450 or so characters of the advert.
        text: stripHtml(r.jobDescription, 1200),
        url: r.jobUrl,
        postedAt: parseUkDate(r.date),
      })
    );
    if (q.region) {
      // Reed's own total is for the UK or the whole nation, so it is not reported for a region.
      const where = await regionsForLocations(jobs.map((j) => j.location));
      return { jobs: jobs.filter((j) => where.get(j.location) === q.region), total: null };
    }
    return { jobs, total: data.totalResults ?? null };
  },
};

// Reed's job details endpoint gives the whole advert (checked 28 September
// 2026: GET /api/1.0/jobs/{jobId}, same basic auth, answers in about 60 ms
// with jobDescription as HTML, contractType, partTime, fullTime and
// expirationDate). The search only gives the first 450 or so characters, so
// the job matcher asks for the whole advert for its best Reed matches.

interface ReedDetailRaw {
  jobId?: number;
  jobDescription?: string;
  contractType?: string | null;
  partTime?: boolean | null;
  fullTime?: boolean | null;
  expirationDate?: string | null;
}

export interface ReedDetail {
  text: string;
  contractType?: string;
  expires?: string;
}

/** One advert in full, cached for a day per job. Null when Reed does not answer. */
const reedDetailCached = unstable_cache(
  async (jobId: string): Promise<ReedDetail | null> => {
    const key = env("REED_API_KEY");
    if (!key || !/^[0-9]+$/.test(jobId)) return null;
    const auth = Buffer.from(`${key}:`).toString("base64");
    const d = await fetchJson<ReedDetailRaw>(`https://www.reed.co.uk/api/1.0/jobs/${jobId}`, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" }, 3500);
    const text = trimBoilerplate(stripHtml(d.jobDescription, 12_000));
    if (!text) return null;
    const hours = d.partTime ? "part time" : d.fullTime ? "full time" : "";
    const contractType = [d.contractType, hours].filter(Boolean).join(", ") || undefined;
    const expires = parseUkDate(d.expirationDate);
    return { text, ...(contractType ? { contractType } : {}), ...(expires ? { expires } : {}) };
  },
  ["mms-reed-detail-v2"],
  { revalidate: 86_400 }
);

/**
 * Whole adverts for these Reed jobs ("reed_<id>" or bare ids), a few at a
 * time, giving up on whatever has not arrived by the deadline. Never throws.
 */
export async function reedDetails(ids: string[], deadlineMs = 4000, concurrency = 8): Promise<Map<string, ReedDetail>> {
  const out = new Map<string, ReedDetail>();
  if (!env("REED_API_KEY") || ids.length === 0) return out;
  const queue = [...ids];
  const stopAt = Date.now() + deadlineMs;
  const worker = async () => {
    while (queue.length && Date.now() < stopAt) {
      const id = queue.shift()!;
      try {
        const detail = await reedDetailCached(id.replace(/^reed_/, ""));
        if (detail) out.set(id, detail);
      } catch (err) {
        console.warn(`[jobs] reed detail ${id} failed: ${describeSourceError(err)}`);
      }
    }
  };
  const run = Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([run, new Promise((resolve) => (timer = setTimeout(resolve, deadlineMs + 200)))]);
  if (timer) clearTimeout(timer);
  return out;
}

// ---------------------------------------------------------------------------
// Adzuna (UK). app_id and app_key as query parameters. The old adapter also
// sent content_type=application/json, which makes Adzuna answer HTTP 400.
// ---------------------------------------------------------------------------

interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  redirect_url: string;
  created?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_time?: string;
  contract_type?: string;
}

// Adzuna's default API allowance is 25 calls a minute, 250 a day, 1,000 a week
// and 2,500 a month (developer.adzuna.com terms, checked 28 September 2026).
// Every Adzuna call from this site (searches, job matching, alerts, title
// counts) spends one unit of a shared daily budget; when it is spent, Adzuna is
// skipped until the next UTC day and the other boards carry on.
const ADZUNA_DAILY_BUDGET_DEFAULT = 200;

function adzunaDailyBudget(): number {
  const n = Number.parseInt(env("ADZUNA_DAILY_BUDGET"), 10);
  return Number.isFinite(n) && n > 0 ? n : ADZUNA_DAILY_BUDGET_DEFAULT;
}

export class BudgetSpentError extends Error {
  constructor(board: string) {
    super(`${board} daily budget spent`);
    this.name = "BudgetSpentError";
  }
}

/** Spends one unit of Adzuna's daily budget, or throws BudgetSpentError. */
async function spendAdzuna(): Promise<void> {
  const { allowed } = await checkRateLimit("adzuna:daily-budget", adzunaDailyBudget(), 86_400);
  if (!allowed) throw new BudgetSpentError("Adzuna");
}

function adzunaCreds(): { id: string; key: string } | null {
  const id = env("ADZUNA_APP_ID");
  const key = env("ADZUNA_APP_KEY");
  return id && key ? { id, key } : null;
}

/**
 * One Adzuna search, cached for 30 minutes per URL. Only a real call (not a
 * cache hit) spends the daily budget.
 */
const adzunaSearch = unstable_cache(
  async (url: string, timeoutMs: number): Promise<{ results?: AdzunaJob[]; count?: number }> => {
    await spendAdzuna();
    return fetchJson<{ results?: AdzunaJob[]; count?: number }>(url, { headers: { Accept: "application/json" }, cache: "no-store" }, timeoutMs);
  },
  ["mms-adzuna-search-v1"],
  { revalidate: 1800 }
);

const adzuna: JobSource = {
  id: "adzuna",
  label: "Adzuna",
  homepage: "https://www.adzuna.co.uk/",
  timeoutMs: 8000,
  enabled: () => adzunaCreds() !== null,
  appliesTo: () => true,
  async search(q) {
    const creds = adzunaCreds()!;
    const params = new URLSearchParams({
      app_id: creds.id,
      app_key: creds.key,
      results_per_page: String(q.perPage),
      what: q.query,
    });
    if (q.remote) params.set("what_and", "remote");
    // A region is asked for through Adzuna's location tree (location0=UK,
    // location1=<region>), and each result's `location.area` is checked too.
    const adzunaRegion = q.region ? ADZUNA_REGION[q.region] : null;
    if (adzunaRegion) {
      params.set("location0", "UK");
      params.set("location1", adzunaRegion);
    } else if (q.location && !q.remote) {
      params.set("where", q.location);
      params.set("distance", "25");
    }
    if (q.salaryMin) params.set("salary_min", String(q.salaryMin));
    const data = await adzunaSearch(`https://api.adzuna.com/v1/api/jobs/gb/search/${q.page}?${params}`, this.timeoutMs);
    const results = (data.results ?? []).filter((r) => !adzunaRegion || r.location?.area?.[1] === adzunaRegion);
    const jobs = results.map((r): JobListing => {
      // Adzuna estimates salaries it was not given; show only the advertised ones.
      const advertised = r.salary_is_predicted !== "1";
      return {
        id: `adzuna_${r.id}`,
        source: "adzuna",
        sourceLabel: "Adzuna",
        title: stripHtml(r.title, 200),
        company: r.company?.display_name || "Employer not named",
        location: r.location?.display_name || "UK",
        remote: q.remote ? "maybe" : "no",
        salary: advertised ? formatSalary(r.salary_min, r.salary_max, "GBP") : undefined,
        salaryMin: advertised ? r.salary_min : undefined,
        salaryMax: advertised ? r.salary_max : undefined,
        salaryCurrency: "GBP",
        snippet: stripHtml(r.description),
        // Adzuna's API gives the first 500 characters of the advert.
        text: stripHtml(r.description, 1200),
        url: r.redirect_url,
        postedAt: isoOrUndefined(r.created),
        contractType: [r.contract_time, r.contract_type].filter(Boolean).join(", ").replace(/_/g, " ") || undefined,
        region: regionByName(r.location?.area?.[1]) ?? undefined,
      };
    });
    return { jobs, total: data.count ?? null };
  },
};

/**
 * Live adverts with this phrase in the job title, UK-wide, from Adzuna
 * (title_only). Cached for a day per title. Null when Adzuna is not set up
 * or does not answer.
 */
export const adzunaTitleCount = unstable_cache(
  async (title: string): Promise<number | null> => {
    const creds = adzunaCreds();
    if (!creds) return null;
    const params = new URLSearchParams({ app_id: creds.id, app_key: creds.key, results_per_page: "1", title_only: title });
    try {
      await spendAdzuna();
      const data = await fetchJson<{ count?: number }>(
        `https://api.adzuna.com/v1/api/jobs/gb/search/1?${params}`,
        { headers: { Accept: "application/json" }, cache: "no-store" },
        6000
      );
      return typeof data.count === "number" ? data.count : null;
    } catch (err) {
      console.warn("[jobs] adzuna count failed:", err instanceof Error ? err.message : err);
      return null;
    }
  },
  ["mms-adzuna-title-count-v1"],
  { revalidate: 86_400 }
);

// ---------------------------------------------------------------------------
// GOV.UK Teaching Vacancies (keyless, Open Government Licence). The API has no
// search parameter, so the newest listings are cached for an hour and
// filtered here. Terms: reuse is free under the OGL provided no fee is charged
// for contacting, interviewing or hiring a respondent to a listing.
// ---------------------------------------------------------------------------

interface TvJob {
  title: string;
  datePosted?: string;
  description?: string;
  employmentType?: string[];
  url: string;
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string; postalCode?: string } } | { address?: { addressLocality?: string; addressRegion?: string; postalCode?: string } }[];
  baseSalary?: { currency?: string; value?: { value?: string | number; unitText?: string } };
  hiringOrganization?: { name?: string };
  validThrough?: string;
}

interface TvLite {
  title: string;
  org: string;
  place: string;
  region: string;
  postcode: string;
  salary: string;
  posted?: string;
  closes?: string;
  url: string;
  snippet: string;
  type: string;
  /** Skills found in the whole advert: [skill id, found in the title]. The text itself is not cached. */
  skills: [string, boolean][];
}

const TV_PAGES = 8; // the 800 newest listings (100 per page)

const teachingVacanciesFeed = unstable_cache(
  async (): Promise<TvLite[]> => {
    const pages = await Promise.allSettled(
      Array.from({ length: TV_PAGES }, (_, i) =>
        fetchJson<{ data?: TvJob[] }>(`https://teaching-vacancies.service.gov.uk/api/v1/jobs.json?page=${i + 1}`, { cache: "no-store" }, 9000)
      )
    );
    const out: TvLite[] = [];
    for (const p of pages) {
      if (p.status !== "fulfilled") continue;
      for (const j of p.value.data ?? []) {
        const loc = Array.isArray(j.jobLocation) ? j.jobLocation[0] : j.jobLocation;
        const a = loc?.address ?? {};
        const pay = j.baseSalary?.value?.value;
        out.push({
          title: j.title,
          org: j.hiringOrganization?.name ?? "School",
          place: a.addressLocality ?? "",
          region: a.addressRegion ?? "",
          postcode: a.postalCode ?? "",
          salary: typeof pay === "number" ? `£${pay.toLocaleString("en-GB")}` : typeof pay === "string" ? pay.slice(0, 90) : "",
          posted: isoOrUndefined(j.datePosted),
          closes: j.validThrough,
          url: j.url,
          snippet: stripHtml(j.description, 220),
          type: (j.employmentType ?? []).join(", ").replace(/_/g, " ").toLowerCase(),
          skills: compactHits(skillsInText(trimBoilerplate(stripHtml(j.description, 20_000)), j.title)),
        });
      }
    }
    if (out.length === 0) throw new Error("Teaching Vacancies returned nothing");
    return out;
  },
  ["mms-teaching-vacancies-v3"],
  { revalidate: 3600 }
);

const teachingVacancies: JobSource = {
  id: "teaching-vacancies",
  label: "GOV.UK Teaching Vacancies",
  homepage: "https://teaching-vacancies.service.gov.uk/jobs",
  timeoutMs: 12000,
  enabled: () => true,
  // School jobs are on site, so this board is skipped for remote searches. It
  // covers England only, so it is skipped for Wales, Scotland and Northern Ireland.
  appliesTo: (q) => !q.remote && !(q.region && UK_NATIONS.includes(q.region)),
  async search(q) {
    const feed = await teachingVacanciesFeed();
    const now = Date.now();
    const words = q.query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const loc = (q.location ?? "").toLowerCase().trim();
    const hits = feed.filter((j) => {
      if (j.closes && new Date(j.closes).getTime() < now) return false;
      const hay = `${j.title} ${j.org}`.toLowerCase();
      if (!words.some((w) => hay.includes(w))) return false;
      // The feed's addressRegion uses the same region names as the site (checked 28 September 2026).
      if (q.region) return j.region === q.region;
      if (loc) {
        const where = `${j.place} ${j.region} ${j.postcode}`.toLowerCase();
        if (!where.includes(loc) && !loc.includes(j.place.toLowerCase() || "\u0000")) return false;
      }
      return true;
    });
    const start = (q.page - 1) * q.perPage;
    const jobs = hits.slice(start, start + q.perPage).map(
      (j): JobListing => ({
        id: `teaching-vacancies_${j.url.split("/").pop()}`,
        source: "teaching-vacancies",
        sourceLabel: "GOV.UK Teaching Vacancies",
        title: j.title,
        company: j.org,
        location: [j.place, j.region].filter(Boolean).join(", ") || "England",
        remote: "no",
        salary: j.salary || undefined,
        salaryCurrency: "GBP",
        snippet: j.snippet,
        fullText: true,
        skillHits: expandHits(j.skills ?? []),
        url: j.url,
        postedAt: j.posted,
        contractType: j.type || undefined,
        region: regionByName(j.region) ?? undefined,
      })
    );
    // The total is only for the newest listings we hold, so it is not reported as a board total.
    return { jobs, total: null };
  },
};

// ---------------------------------------------------------------------------
// Himalayas (remote, keyless). Only asked for remote searches; UK-eligible only.
// ---------------------------------------------------------------------------

interface HimalayasJob {
  title: string;
  excerpt?: string;
  companyName?: string;
  employmentType?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  locationRestrictions?: string[];
  pubDate?: number | string;
  applicationLink: string;
  guid?: string;
  description?: string;
}

const himalayas: JobSource = {
  id: "himalayas",
  label: "Himalayas",
  homepage: "https://himalayas.app/jobs",
  timeoutMs: 8000,
  enabled: () => true,
  appliesTo: (q) => q.remote,
  async search(q) {
    // country=GB returns roles open to UK residents. Checked 28 September 2026:
    // adding sort=recent made the search return almost nothing.
    const params = new URLSearchParams({ q: q.query, limit: String(Math.min(q.perPage, 20)), country: "GB" });
    if (q.page > 1) params.set("offset", String((q.page - 1) * Math.min(q.perPage, 20)));
    const data = await fetchJson<{ jobs?: HimalayasJob[]; totalCount?: number }>(
      `https://himalayas.app/jobs/api/search?${params}`,
      { next: { revalidate: 3600 } },
      this.timeoutMs
    );
    const jobs = (data.jobs ?? [])
      .filter((j) => ukEligible(j.locationRestrictions ?? []))
      .map((j): JobListing => {
        const currency = j.currency || "USD";
        return {
          id: `himalayas_${(j.guid || j.applicationLink).split("/").filter(Boolean).slice(-2).join("-")}`,
          source: "himalayas",
          sourceLabel: "Himalayas",
          title: j.title,
          company: j.companyName || "Employer not named",
          location: remoteLocationLabel(j.locationRestrictions ?? []),
          remote: "yes",
          salary: formatSalary(j.minSalary ?? undefined, j.maxSalary ?? undefined, currency, "a year"),
          salaryMin: currency === "GBP" ? j.minSalary ?? undefined : undefined,
          salaryMax: currency === "GBP" ? j.maxSalary ?? undefined : undefined,
          salaryCurrency: currency,
          snippet: stripHtml(j.excerpt),
          // The whole advert, for scoring and for spotting roles only open to people in the US.
          text: trimBoilerplate(stripHtml(j.description || j.excerpt, 8000)),
          fullText: Boolean(j.description),
          ...(j.description ? { advertHtml: j.description.slice(0, 40_000) } : {}),
          url: j.applicationLink,
          postedAt: isoOrUndefined(j.pubDate),
          contractType: j.employmentType?.replace(/_/g, " ").toLowerCase(),
        };
      });
    return { jobs, total: data.totalCount ?? null };
  },
};

// ---------------------------------------------------------------------------
// Remotive (remote, keyless). Their terms: link back to the Remotive URL,
// name Remotive as the source, and fetch at most about four times a day. The
// whole active list is cached for six hours and filtered here.
// ---------------------------------------------------------------------------

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name?: string;
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
}

interface RemotiveLite {
  id: number;
  url: string;
  title: string;
  company: string;
  type: string;
  posted?: string;
  where: string;
  salary: string;
  /** Skills found in the whole advert (UK-eligible roles only): [skill id, found in the title]. */
  skills?: [string, boolean][];
  /** The advert asks for a US licence, registration or right to work. */
  us?: boolean;
}

const remotiveFeed = unstable_cache(
  async (): Promise<RemotiveLite[]> => {
    const data = await fetchJson<{ jobs?: RemotiveJob[] }>("https://remotive.com/api/remote-jobs", { cache: "no-store" }, 15000);
    return (data.jobs ?? []).map((j) => {
      const where = j.candidate_required_location ?? "";
      const lite: RemotiveLite = {
        id: j.id,
        url: j.url,
        title: j.title,
        company: j.company_name ?? "",
        type: (j.job_type ?? "").replace(/_/g, " "),
        posted: isoOrUndefined(j.publication_date ? `${j.publication_date}Z` : undefined),
        where,
        salary: (j.salary ?? "").slice(0, 60),
      };
      // Only roles open to the UK are ever shown, so only theirs are read in full.
      if (ukEligible(where.split(/[,;]/).map((x) => x.trim()).filter(Boolean))) {
        const text = stripHtml(j.description, 20_000);
        lite.skills = compactHits(skillsInText(trimBoilerplate(text), j.title));
        lite.us = usOnly(j.title, text, true);
      }
      return lite;
    });
  },
  ["mms-remotive-v3"],
  { revalidate: 21_600 }
);

const remotive: JobSource = {
  id: "remotive",
  label: "Remotive",
  homepage: "https://remotive.com/",
  timeoutMs: 16000,
  enabled: () => true,
  appliesTo: (q) => q.remote,
  async search(q) {
    const feed = await remotiveFeed();
    const words = q.query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const hits = feed.filter((j) => {
      const where = j.where.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      return ukEligible(where) && words.some((w) => j.title.toLowerCase().includes(w));
    });
    const start = (q.page - 1) * q.perPage;
    const jobs = hits.slice(start, start + q.perPage).map(
      (j): JobListing => ({
        id: `remotive_${j.id}`,
        source: "remotive",
        sourceLabel: "Remotive",
        title: j.title,
        company: j.company || "Employer not named",
        location: remoteLocationLabel(j.where ? [j.where] : []),
        remote: "yes",
        salary: j.salary ? `${j.salary} (currency as advertised)` : undefined,
        snippet: "",
        ...(j.skills ? { fullText: true, skillHits: expandHits(j.skills) } : {}),
        ...(j.us ? { usOnly: true } : {}),
        url: j.url,
        postedAt: j.posted,
        contractType: j.type || undefined,
      })
    );
    return { jobs, total: hits.length };
  },
};

// ---------------------------------------------------------------------------
// Careerjet v4 (UK). Only runs once CAREERJET_API_KEY is set. Needs the
// visitor's IP address and user agent on every call.
// ---------------------------------------------------------------------------

interface CareerjetJob {
  title: string;
  company?: string;
  date?: string;
  description?: string;
  locations?: string;
  salary?: string;
  salary_currency_code?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  url: string;
}

const CJ_PERIOD: Record<string, string> = { Y: "a year", M: "a month", W: "a week", D: "a day", H: "an hour" };

const careerjet: JobSource = {
  id: "careerjet",
  label: "Careerjet",
  homepage: "https://www.careerjet.co.uk/",
  timeoutMs: 8000,
  enabled: () => Boolean(env("CAREERJET_API_KEY")),
  // Not checked against regions yet, so left out of region searches.
  appliesTo: (q) => Boolean(q.userIp && q.userAgent) && !q.region,
  async search(q) {
    const params = new URLSearchParams({
      locale_code: "en_GB",
      keywords: q.remote ? `${q.query} remote` : q.query,
      page: String(Math.min(q.page, 10)),
      page_size: String(q.perPage),
      sort: "relevance",
      fragment_size: "200",
      user_ip: q.userIp!,
      user_agent: q.userAgent!,
    });
    if (q.location && !q.remote) params.set("location", q.location);
    const auth = Buffer.from(`${env("CAREERJET_API_KEY")}:`).toString("base64");
    const data = await fetchJson<{ type?: string; hits?: number; jobs?: CareerjetJob[]; message?: string }>(
      `https://search.api.careerjet.net/v4/query?${params}`,
      { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" },
      this.timeoutMs
    );
    if (data.type !== "JOBS") return { jobs: [], total: 0, error: data.message ?? "no jobs" };
    const jobs = (data.jobs ?? []).map((j, i): JobListing => {
      const currency = j.salary_currency_code || "GBP";
      return {
        id: `careerjet_${q.page}_${i}_${j.url.slice(-24)}`,
        source: "careerjet",
        sourceLabel: "Careerjet",
        title: j.title,
        company: j.company || "Employer not named",
        location: j.locations || "UK",
        remote: q.remote ? "maybe" : "no",
        salary: formatSalary(j.salary_min, j.salary_max, currency, j.salary_type ? CJ_PERIOD[j.salary_type] : undefined) ?? (j.salary || undefined),
        salaryMin: currency === "GBP" && j.salary_type === "Y" ? j.salary_min : undefined,
        salaryMax: currency === "GBP" && j.salary_type === "Y" ? j.salary_max : undefined,
        salaryCurrency: currency,
        snippet: stripHtml(j.description),
        url: j.url,
        postedAt: isoOrUndefined(j.date),
      };
    });
    return { jobs, total: data.hits ?? null };
  },
};

// ---------------------------------------------------------------------------
// Jooble. Only runs once JOOBLE_API_KEY is set. The key works on the main
// endpoint (jooble.org/api) only: uk.jooble.org/api answers 403. The main
// endpoint searches worldwide, so the location always ends ", United Kingdom"
// (checked 28 September 2026: "nurse" in "Manchester, United Kingdom" gave
// only UK adverts, where "Manchester" alone gave Manchester, New Hampshire),
// and anything that still looks non-UK is dropped. Jooble's total counts its
// worldwide index, so it is never shown.
// ---------------------------------------------------------------------------

interface JoobleJob {
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  source?: string;
  type?: string;
  link: string;
  company?: string;
  updated?: string;
  id?: string | number;
}

// Jooble's free key allows 500 requests in total until they raise it, so each
// distinct search is cached for 12 hours and live calls are capped per day.
// When the daily budget is spent the board is simply skipped.
const JOOBLE_DAILY_BUDGET = 15;

const joobleCached = unstable_cache(
  async (bodyJson: string): Promise<{ totalCount?: number; jobs?: JoobleJob[] }> => {
    const { allowed } = await checkRateLimit("jooble:daily-budget", JOOBLE_DAILY_BUDGET, 86_400);
    if (!allowed) return { totalCount: undefined, jobs: [] };
    return fetchJson<{ totalCount?: number; jobs?: JoobleJob[] }>(
      `https://jooble.org/api/${encodeURIComponent(env("JOOBLE_API_KEY"))}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: bodyJson, cache: "no-store" },
      8000
    );
  },
  ["jooble-search"],
  { revalidate: 43_200 }
);

const jooble: JobSource = {
  id: "jooble",
  label: "Jooble",
  homepage: "https://uk.jooble.org/",
  timeoutMs: 8000,
  enabled: () => Boolean(env("JOOBLE_API_KEY")),
  // Its UK adverts often give only "United Kingdom" as the place, so it cannot be narrowed to a region.
  appliesTo: (q) => !q.region,
  async search(q) {
    const body: Record<string, string> = {
      keywords: q.remote ? `${q.query} remote` : q.query,
      location: joobleLocation(q.remote ? undefined : q.location),
      page: String(q.page),
      ResultOnPage: String(q.perPage),
    };
    if (q.salaryMin) body.salary = String(q.salaryMin);
    const data = await joobleCached(JSON.stringify(body));
    const jobs = (data.jobs ?? [])
      .filter((j) => !looksNonUk(j.location, j.salary))
      .map(
        (j, i): JobListing => ({
          id: `jooble_${j.id ?? `${q.page}_${i}`}`,
          source: "jooble",
          sourceLabel: "Jooble",
          title: stripHtml(j.title, 200) || "Untitled role",
          company: j.company || j.source || "Employer not named",
          location: j.location || "UK",
          remote: q.remote ? "maybe" : "no",
          salary: j.salary || undefined,
          snippet: tidySnippet(stripHtml(j.snippet)),
          url: j.link,
          postedAt: isoOrUndefined(j.updated),
          contractType: j.type || undefined,
        })
      );
    // Only the adverts that survive the UK check are reported, never Jooble's worldwide total.
    return { jobs, total: null };
  },
};

/** "Manchester" becomes "Manchester, United Kingdom"; no place searches the whole UK. */
function joobleLocation(place: string | undefined): string {
  const p = (place ?? "").trim();
  if (!p) return "United Kingdom";
  return /\b(uk|united kingdom|great britain)\b/i.test(p) ? p : `${p}, United Kingdom`;
}

/** Every board, in the order results are interleaved. Add new boards here. */
export const JOB_SOURCES: JobSource[] = [mms, reed, adzuna, careerjet, jooble, teachingVacancies, himalayas, remotive];

export function getJobSource(id: string): JobSource | undefined {
  return JOB_SOURCES.find((s) => s.id === id);
}

export function describeSourceError(err: unknown): string {
  if (err instanceof BudgetSpentError) return "daily limit reached";
  if (err instanceof SourceHttpError) return `HTTP ${err.status}`;
  if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) return "timed out";
  return err instanceof Error ? err.message : "failed";
}
