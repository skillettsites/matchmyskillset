// Jobs posted on MatchMySkillset itself (table mms_jobs). Server-side only.
//
// Only live, unexpired jobs are ever read here: an employer's draft, a job
// waiting for approval, a rejected or closed job never reaches a job seeker.
// The live list is small, so it is read in one query and cached briefly.

import { unstable_cache } from "next/cache";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { regionByName, type UkRegion } from "@/lib/apis/regions";
import { isSkillId } from "@/lib/skills/taxonomy";
import type { JobListing, JobQuery, SourceResult, Workplace } from "./types";
import { formatSalary, stripHtml } from "./util";

export const MMS_SOURCE_LABEL = "Posted on MatchMySkillset";

/** Cache tag for the live list. Revalidate it when a job is approved, edited or closed. */
export const MMS_JOBS_CACHE_TAG = "mms-jobs";

const LIVE_CACHE_SECONDS = 120;
const MAX_LIVE = 500;

export interface MmsJobRow {
  id: string;
  created_at: string;
  updated_at: string;
  account_id: string | null;
  status: string;
  title: string;
  company_name: string;
  location: string | null;
  region: string | null;
  remote: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string | null;
  contract_type: string | null;
  hours: string | null;
  description: string;
  apply_method: string;
  apply_url: string | null;
  apply_email: string | null;
  soc_code: string | null;
  skills: unknown;
  featured: boolean;
  approved_at: string | null;
  expires_at: string | null;
  views: number;
}

export const MMS_JOB_COLUMNS =
  "id, created_at, updated_at, account_id, status, title, company_name, location, region, remote, salary_min, salary_max, salary_period, contract_type, hours, description, apply_method, apply_url, apply_email, soc_code, skills, featured, approved_at, expires_at, views";

export function isLiveRow(row: Pick<MmsJobRow, "status" | "expires_at">, now = Date.now()): boolean {
  if (row.status !== "live") return false;
  return !row.expires_at || Date.parse(row.expires_at) > now;
}

export function workplaceOf(value: string | null | undefined): Workplace {
  return value === "remote" || value === "hybrid" ? value : "onsite";
}

const PERIOD_TEXT: Record<string, string> = { year: "a year", hour: "an hour", day: "a day" };

export function mmsSalaryText(row: Pick<MmsJobRow, "salary_min" | "salary_max" | "salary_period">): string | undefined {
  const period = PERIOD_TEXT[row.salary_period ?? "year"] ?? "a year";
  return formatSalary(row.salary_min ?? undefined, row.salary_max ?? undefined, "GBP", period);
}

export function mmsSkillIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isSkillId).slice(0, 40);
}

const CONTRACT_TEXT: Record<string, string> = {
  permanent: "Permanent",
  contract: "Contract",
  temporary: "Temporary",
  apprenticeship: "Apprenticeship",
};
const HOURS_TEXT: Record<string, string> = { full_time: "full-time", part_time: "part-time" };

export function mmsContractText(row: Pick<MmsJobRow, "contract_type" | "hours">): string | undefined {
  const c = row.contract_type ? CONTRACT_TEXT[row.contract_type] : undefined;
  const h = row.hours ? HOURS_TEXT[row.hours] : undefined;
  if (c && h) return `${c}, ${h}`;
  if (c) return c;
  return h ? h.charAt(0).toUpperCase() + h.slice(1) : undefined;
}

export function mmsLocationText(row: Pick<MmsJobRow, "location" | "remote">): string {
  const w = workplaceOf(row.remote);
  const place = (row.location ?? "").trim();
  if (w === "remote") return place ? `Remote (${place})` : "Remote (UK)";
  if (w === "hybrid") return place ? `${place} (hybrid)` : "Hybrid";
  return place || "UK";
}

/** A posted job as a listing, linking to its own page on this site. */
export function mmsListing(row: MmsJobRow): JobListing {
  const w = workplaceOf(row.remote);
  const region = regionByName(row.region) ?? undefined;
  return {
    id: `mms_${row.id}`,
    source: "mms",
    sourceLabel: MMS_SOURCE_LABEL,
    title: row.title,
    company: row.company_name,
    location: mmsLocationText(row),
    remote: w === "remote" ? "yes" : "no",
    salary: mmsSalaryText(row),
    salaryMin: (row.salary_period ?? "year") === "year" ? row.salary_min ?? undefined : undefined,
    salaryMax: (row.salary_period ?? "year") === "year" ? row.salary_max ?? undefined : undefined,
    salaryCurrency: "GBP",
    snippet: stripHtml(row.description, 240),
    url: `/jobs/mms/${row.id}`,
    postedAt: row.approved_at ?? row.created_at,
    contractType: mmsContractText(row),
    region: region as UkRegion | undefined,
    mms: {
      id: row.id,
      workplace: w,
      description: row.description.slice(0, 20_000),
      skillIds: mmsSkillIds(row.skills),
      hours: row.hours,
      contract: row.contract_type,
      closesAt: row.expires_at,
    },
  };
}

const liveRows = unstable_cache(
  async (): Promise<MmsJobRow[]> => {
    if (!isSupabaseConfigured()) return [];
    const nowIso = new Date().toISOString();
    const { data, error } = await createAdminClient()
      .from("mms_jobs")
      .select(MMS_JOB_COLUMNS)
      .eq("status", "live")
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order("featured", { ascending: false })
      .order("approved_at", { ascending: false, nullsFirst: false })
      .limit(MAX_LIVE);
    if (error) throw new Error(`mms_jobs read failed: ${error.message}`);
    return (data ?? []) as MmsJobRow[];
  },
  ["mms-live-jobs-v1"],
  { revalidate: LIVE_CACHE_SECONDS, tags: [MMS_JOBS_CACHE_TAG] }
);

/** Every live, unexpired job posted on the site, featured first, then newest. */
export async function listLiveMmsJobs(): Promise<JobListing[]> {
  const now = Date.now();
  try {
    return (await liveRows()).filter((r) => isLiveRow(r, now)).map(mmsListing);
  } catch (err) {
    console.warn("[jobs] mms list failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** One posted job by id, whatever its status (callers decide what to show). Uncached. */
export async function getMmsJobRow(id: string): Promise<MmsJobRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !isSupabaseConfigured()) return null;
  const { data, error } = await createAdminClient().from("mms_jobs").select(MMS_JOB_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`mms_jobs read failed: ${error.message}`);
  return (data as MmsJobRow | null) ?? null;
}

/** The job search adapter: live posted jobs whose title or advert mentions the search words. */
export async function searchMmsJobs(q: JobQuery): Promise<SourceResult> {
  const all = await listLiveMmsJobs();
  const words = q.query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const loc = (q.location ?? "").toLowerCase().trim();
  const hits = all.filter((j) => {
    const hay = `${j.title} ${j.mms?.description ?? ""}`.toLowerCase();
    if (words.length && !words.some((w) => hay.includes(w))) return false;
    const w = j.mms?.workplace ?? "onsite";
    if (q.remote) return w !== "onsite";
    if (w === "remote") return true;
    if (q.region) return j.region === q.region;
    if (loc) return j.location.toLowerCase().includes(loc) || (j.region ?? "").toLowerCase() === loc;
    return true;
  });
  const start = (q.page - 1) * q.perPage;
  return { jobs: hits.slice(start, start + q.perPage), total: hits.length };
}
