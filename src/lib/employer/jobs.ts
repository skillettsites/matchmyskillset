// Jobs that employers post on MatchMySkillset (mms_jobs). Validation, skill
// tagging, SOC mapping, plan limits and the approval life cycle. Server code
// only (it loads the careers dataset for the SOC mapping).
//
// Life cycle: draft -> pending (submitted, waiting for Dave) -> live (approved,
// runs for LISTING_DAYS) -> closed; or pending -> rejected (with a reason) ->
// edited and resubmitted. A live job whose expires_at has passed is "expired":
// it is off the site until renewed. Public job lists must show only
// status = 'live' AND expires_at > now().

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { findJobByTitle } from "@/lib/skills/job-lookup";
import { regionsForLocations } from "@/lib/apis/jobs/place-region";
import { cleanHttpUrl, cleanText } from "@/lib/input";
import { isValidEmail } from "@/lib/email/results-email";
import { effectivePlan, limitsFor, LISTING_DAYS } from "./plans";
import { tagJobSkills } from "./matching";
import { isMissingColumn } from "./server";
import type { ApplyMethod, EmployerAccount, JobRow, RemoteMode } from "./types";

/**
 * Cache tag of the public live-jobs list (the candidate side's mms job source
 * uses the same string). Expire it whenever a job goes live, changes or closes.
 */
export const MMS_JOBS_CACHE_TAG = "mms-jobs";

export function invalidatePublicJobs(): void {
  try {
    revalidateTag(MMS_JOBS_CACHE_TAG, { expire: 0 });
  } catch (err) {
    console.warn("[employer-jobs] could not expire the live jobs cache:", err instanceof Error ? err.message : err);
  }
}

/** The public page of a job posted on MatchMySkillset (built by the candidate side). */
export function publicJobPath(jobId: string): string {
  return `/jobs/mms/${jobId}`;
}

export const REMOTE_OPTIONS: { value: RemoteMode; label: string }[] = [
  { value: "onsite", label: "On site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];
export const CONTRACT_OPTIONS = [
  { value: "permanent", label: "Permanent" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "apprenticeship", label: "Apprenticeship" },
];
export const HOURS_OPTIONS = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
];
export const PERIOD_OPTIONS = [
  { value: "year", label: "a year" },
  { value: "day", label: "a day" },
  { value: "hour", label: "an hour" },
];

export interface JobInput {
  title: string;
  location: string;
  remote: RemoteMode;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: "year" | "day" | "hour";
  contract_type: string;
  hours: string;
  description: string;
  apply_method: ApplyMethod;
  apply_url: string | null;
  apply_email: string | null;
}

/** Keeps line breaks (adverts need paragraphs and lists) but strips other control characters. */
function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .slice(0, max * 2)
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function toMoney(value: unknown): number | null | "bad" {
  if (value === null || value === undefined) return null;
  const raw = String(value).replace(/[£,\s]/g, "");
  if (!raw) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return "bad";
  const n = Math.round(Number(raw));
  return n >= 0 && n <= 1_000_000 ? n : "bad";
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function readJobForm(form: FormData): { input: JobInput; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = cleanText(form.get("title"), 120);
  const location = cleanText(form.get("location"), 120);
  const remote = pick(form.get("remote"), ["onsite", "hybrid", "remote"] as const, "onsite");
  const min = toMoney(form.get("salary_min"));
  const max = toMoney(form.get("salary_max"));
  const salary_period = pick(form.get("salary_period"), ["year", "day", "hour"] as const, "year");
  const contract_type = pick(form.get("contract_type"), ["permanent", "contract", "temporary", "apprenticeship"] as const, "permanent");
  const hours = pick(form.get("hours"), ["full_time", "part_time"] as const, "full_time");
  const description = cleanMultiline(form.get("description"), 10_000);
  const apply_method = pick(form.get("apply_method"), ["mms", "url", "email"] as const, "mms");
  const apply_url = apply_method === "url" ? cleanHttpUrl(String(form.get("apply_url") ?? "").trim(), 500) : null;
  const rawEmail = String(form.get("apply_email") ?? "").trim().toLowerCase();
  const apply_email = apply_method === "email" && isValidEmail(rawEmail) ? rawEmail : null;

  if (title.length < 3) errors.title = "Add a job title.";
  if (remote !== "remote" && location.length < 2) errors.location = "Add where the job is based (a town, city or postcode).";
  if (min === "bad") errors.salary_min = "Use a number, for example 32000.";
  if (max === "bad") errors.salary_max = "Use a number, for example 38000.";
  if (typeof min === "number" && typeof max === "number" && max < min) errors.salary_max = "The top of the range is below the bottom.";
  if (description.length < 150) errors.description = "Describe the job in at least 150 characters: what the person will do and the skills you need.";
  if (apply_method === "url" && !apply_url) errors.apply_url = "Add the full link to your application page, starting https://";
  if (apply_method === "email" && !apply_email) errors.apply_email = "Add the email address applications should go to.";

  return {
    input: {
      title,
      location,
      remote,
      salary_min: typeof min === "number" ? min : null,
      salary_max: typeof max === "number" ? max : null,
      salary_period,
      contract_type,
      hours,
      description,
      apply_method,
      apply_url,
      apply_email,
    },
    errors,
  };
}

/** Skills, SOC code and region worked out from what the employer typed. */
export async function deriveJobFields(input: JobInput): Promise<{ skills: string[]; soc_code: string | null; region: string | null }> {
  const skills = tagJobSkills(input.title, input.description);
  const soc_code = findJobByTitle(input.title)?.soc ?? null;
  let region: string | null = null;
  if (input.location) {
    // "Leeds LS1" is neither a full postcode nor a plain place name, so also try it without the postcode part.
    const withoutPostcode = input.location
      .replace(/\b[A-Z]{1,2}\d[A-Z\d]?(\s*\d[A-Z]{2})?\b/gi, " ")
      .replace(/\s+/g, " ")
      .replace(/^[\s,]+|[\s,]+$/g, "");
    const tries = [...new Set([input.location, withoutPostcode].filter(Boolean))];
    try {
      const found = await regionsForLocations(tries);
      region = tries.map((t) => found.get(t) ?? null).find(Boolean) ?? null;
    } catch {
      region = null;
    }
  }
  return { skills, soc_code, region };
}

export function isExpired(job: Pick<JobRow, "status" | "expires_at">): boolean {
  return job.status === "live" && Boolean(job.expires_at) && new Date(job.expires_at as string).getTime() <= Date.now();
}

/** What the employer sees: draft, waiting for approval, live, expired, closed or changes needed. */
export function displayStatus(job: Pick<JobRow, "status" | "expires_at">): { label: string; tone: "grey" | "amber" | "green" | "red" } {
  if (isExpired(job)) return { label: "Expired", tone: "amber" };
  switch (job.status) {
    case "draft":
      return { label: "Draft", tone: "grey" };
    case "pending":
      return { label: "Waiting for approval", tone: "amber" };
    case "live":
      return { label: "Live", tone: "green" };
    case "rejected":
      return { label: "Changes needed", tone: "red" };
    default:
      return { label: "Closed", tone: "grey" };
  }
}

export function formatSalary(job: Pick<JobRow, "salary_min" | "salary_max" | "salary_period">): string | null {
  const fmt = (n: number) => `£${n.toLocaleString("en-GB")}`;
  const per = PERIOD_OPTIONS.find((p) => p.value === job.salary_period)?.label ?? "a year";
  if (job.salary_min && job.salary_max && job.salary_max !== job.salary_min) return `${fmt(job.salary_min)} to ${fmt(job.salary_max)} ${per}`;
  if (job.salary_min) return `${fmt(job.salary_min)} ${per}`;
  if (job.salary_max) return `Up to ${fmt(job.salary_max)} ${per}`;
  return null;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });
}

export async function getAccountJob(accountId: string, jobId: string): Promise<JobRow | null> {
  const { data, error } = await createAdminClient().from("mms_jobs").select("*").eq("id", jobId).eq("account_id", accountId).maybeSingle();
  if (error) {
    console.error("[employer-jobs] get failed:", error.message);
    return null;
  }
  return (data as JobRow) ?? null;
}

export async function listAccountJobs(accountId: string): Promise<JobRow[]> {
  const { data, error } = await createAdminClient()
    .from("mms_jobs")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[employer-jobs] list failed:", error.message);
    return [];
  }
  return (data as JobRow[]) ?? [];
}

/** Live (not expired) jobs plus jobs waiting for approval, optionally leaving one job out. */
export async function countActiveListings(accountId: string, exceptJobId?: string): Promise<{ live: number; pending: number }> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  let liveQ = admin.from("mms_jobs").select("id", { count: "exact", head: true }).eq("account_id", accountId).eq("status", "live").gt("expires_at", now);
  let pendingQ = admin.from("mms_jobs").select("id", { count: "exact", head: true }).eq("account_id", accountId).eq("status", "pending");
  if (exceptJobId) {
    liveQ = liveQ.neq("id", exceptJobId);
    pendingQ = pendingQ.neq("id", exceptJobId);
  }
  const [live, pending] = await Promise.all([liveQ, pendingQ]);
  return { live: live.count ?? 0, pending: pending.count ?? 0 };
}

/** Null when the account may put one more job live (or in the queue); otherwise the reason it cannot. */
export async function listingBlocker(account: EmployerAccount, exceptJobId?: string, includePending = true): Promise<string | null> {
  const plan = effectivePlan(account);
  const limits = limitsFor(plan);
  if (!plan || !limits) return "You need an active plan before a job can go live. Choose a plan on the Billing page.";
  if (limits.liveJobs === null) return null;
  const { live, pending } = await countActiveListings(account.id, exceptJobId);
  const used = live + (includePending ? pending : 0);
  if (used >= limits.liveJobs) {
    return `Your plan allows ${limits.liveJobs} live ${limits.liveJobs === 1 ? "job" : "jobs"} at once and you have ${live} live${
      includePending && pending ? ` and ${pending} waiting for approval` : ""
    }. Close a job or move to a bigger plan first.`;
  }
  return null;
}

/** Applications per job (all, and still marked new), counted in Postgres. */
export async function applicationCounts(jobIds: string[]): Promise<Map<string, { total: number; fresh: number }>> {
  const admin = createAdminClient();
  const ids = jobIds.slice(0, 200);
  const rows = await Promise.all(
    ids.map(async (id) => {
      const [total, fresh] = await Promise.all([
        admin.from("mms_applications").select("id", { count: "exact", head: true }).eq("job_id", id),
        admin.from("mms_applications").select("id", { count: "exact", head: true }).eq("job_id", id).eq("status", "new"),
      ]);
      return [id, { total: total.count ?? 0, fresh: fresh.count ?? 0 }] as const;
    })
  );
  return new Map(rows);
}

/** Applications divided by views, as a percentage string, or "n/a" when there are no views yet. */
export function applicationRate(apps: number, views: number): string {
  if (!views) return "n/a";
  const rate = (apps / views) * 100;
  return `${rate < 10 ? rate.toFixed(1) : Math.round(rate)}%`;
}

/** Sets the reviewer's note if migration 007 has added the column; ignored otherwise. */
export async function setReviewNote(jobId: string, note: string | null): Promise<void> {
  const { error } = await createAdminClient().from("mms_jobs").update({ review_note: note }).eq("id", jobId);
  if (error && !isMissingColumn(error)) console.error("[employer-jobs] review note failed:", error.message);
}

export function listingExpiry(from = Date.now()): string {
  return new Date(from + LISTING_DAYS * 86_400_000).toISOString();
}

/**
 * Counts one view of a live MatchMySkillset job. For the public job page (or
 * apply page) to call; uses the atomic mms_job_view() from migration 007 and
 * falls back to read-then-write before that is applied.
 */
export async function recordJobView(jobId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("mms_job_view", { p_id: jobId });
  if (!error) return;
  if (!isMissingColumn(error)) {
    console.warn("[employer-jobs] view count failed:", error.message);
    return;
  }
  const { data } = await admin.from("mms_jobs").select("views, status").eq("id", jobId).maybeSingle();
  if (data && data.status === "live") await admin.from("mms_jobs").update({ views: (data.views ?? 0) + 1 }).eq("id", jobId);
}
