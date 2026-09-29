// Recruiter shortlists (supabase/migrations/008_shortlists.sql). Growth and
// Enterprise employers get a shortlist of the best people for each live job,
// picked and ordered by our recruiters in /recruiter. Server code only.
//
// Life cycle: the employer ticks "Send me a recruiter shortlist" on the job
// form (mms_jobs.shortlist_wanted) or asks from the job page later. The
// request (mms_shortlists, status "requested") is opened when the job is
// approved and goes live, so recruiters only work on approved jobs. The
// recruiter saves picks (in_progress) and sends it (sent), which emails the
// employer; or cancels it.
//
// Privacy: applicants on a shortlist are shown to the employer in full (they
// applied to this employer); opted-in candidates who have not applied stay
// anonymous until they accept a contact request. Recruiter notes and the
// summary have email addresses, phone numbers, links and the candidate's own
// first name removed before they are saved.
//
// Every function fails soft until 008 is applied: callers get `ready: false`
// or "off" and show SHORTLISTS_OFF instead of an error.

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/components/site";
import { notifyOwner } from "./telegram";
import { effectivePlan, JOBS_EMAIL, PLAN_NAMES } from "./plans";
import type { EmployerAccount, JobRow, ShortlistItemRow, ShortlistRow, ShortlistStatus } from "./types";
import type { Tone } from "@/components/employer/ui";

export const SHORTLISTS_OFF = `Recruiter shortlists are not switched on yet. Please try again later, or email ${JOBS_EMAIL}.`;

/** Most people a recruiter can put on one shortlist. */
export const MAX_SHORTLIST_ITEMS = 25;
export const MAX_NOTE_LENGTH = 600;
export const MAX_SUMMARY_LENGTH = 2000;

const SHORTLIST_COLUMNS = "id, created_at, updated_at, job_id, account_id, status, requested_at, started_at, sent_at, recruiter_name, summary";

/** Postgres / PostgREST codes for a missing table or column: migration 008 is not applied yet. */
export function isShortlistSchemaMissing(error: { code?: string } | null | undefined): boolean {
  return Boolean(error && ["42P01", "PGRST205", "42703", "PGRST204"].includes(error.code || ""));
}

/** True once migration 008 is applied (checked once per request). */
export const shortlistsReady = cache(async (): Promise<boolean> => {
  const { error } = await createAdminClient().from("mms_shortlists").select("id", { head: true, count: "exact" }).limit(1);
  if (error && !isShortlistSchemaMissing(error)) console.error("[shortlists] check failed:", error.message);
  return !error;
});

export function isShortlistStatus(value: unknown): value is ShortlistStatus {
  return value === "requested" || value === "in_progress" || value === "sent" || value === "cancelled";
}

/** What the employer sees for each status. */
export const EMPLOYER_SHORTLIST_STATUS: Record<ShortlistStatus, { label: string; tone: Tone }> = {
  requested: { label: "Requested", tone: "blue" },
  in_progress: { label: "Being prepared", tone: "amber" },
  sent: { label: "Ready", tone: "green" },
  cancelled: { label: "Cancelled", tone: "grey" },
};

/** One line for the employer about where their shortlist is. */
export const EMPLOYER_SHORTLIST_TEXT: Record<ShortlistStatus, string> = {
  requested: "Requested. An experienced recruiter will review your applicants and the people who asked to be found. We email you when it is ready.",
  in_progress: "Being prepared. A recruiter is reviewing your applicants and the people who asked to be found. We email you when it is ready.",
  sent: "Ready. Your recruiter shortlist for this role is on the Recruiter shortlist tab.",
  cancelled: "This shortlist request was cancelled. You can ask for it again.",
};

export async function getJobShortlist(jobId: string): Promise<{ ready: boolean; shortlist: ShortlistRow | null }> {
  const { data, error } = await createAdminClient().from("mms_shortlists").select(SHORTLIST_COLUMNS).eq("job_id", jobId).maybeSingle();
  if (error) {
    if (!isShortlistSchemaMissing(error)) console.error("[shortlists] get failed:", error.message);
    return { ready: !isShortlistSchemaMissing(error), shortlist: null };
  }
  return { ready: true, shortlist: (data as ShortlistRow) ?? null };
}

export async function getShortlist(id: string): Promise<{ ready: boolean; shortlist: ShortlistRow | null }> {
  const { data, error } = await createAdminClient().from("mms_shortlists").select(SHORTLIST_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    if (!isShortlistSchemaMissing(error)) console.error("[shortlists] get failed:", error.message);
    return { ready: !isShortlistSchemaMissing(error), shortlist: null };
  }
  return { ready: true, shortlist: (data as ShortlistRow) ?? null };
}

/** The shortlist (if any) of each of an account's jobs. */
export async function accountShortlists(accountId: string): Promise<Map<string, ShortlistRow>> {
  const out = new Map<string, ShortlistRow>();
  const { data, error } = await createAdminClient().from("mms_shortlists").select(SHORTLIST_COLUMNS).eq("account_id", accountId).limit(500);
  if (error) {
    if (!isShortlistSchemaMissing(error)) console.error("[shortlists] list failed:", error.message);
    return out;
  }
  for (const row of (data as ShortlistRow[]) ?? []) out.set(row.job_id, row);
  return out;
}

export async function shortlistItems(shortlistId: string): Promise<ShortlistItemRow[]> {
  const { data, error } = await createAdminClient()
    .from("mms_shortlist_items")
    .select("id, created_at, shortlist_id, application_id, candidate_id, rank, recruiter_note")
    .eq("shortlist_id", shortlistId)
    .order("rank", { ascending: true })
    .limit(MAX_SHORTLIST_ITEMS * 2);
  if (error) {
    if (!isShortlistSchemaMissing(error)) console.error("[shortlists] items failed:", error.message);
    return [];
  }
  return (data as ShortlistItemRow[]) ?? [];
}

/**
 * Remembers whether the employer wants a shortlist for this job (the job-form
 * box). Returns false when migration 008 is not applied.
 */
export async function setShortlistWanted(jobId: string, wanted: boolean): Promise<boolean> {
  const { error } = await createAdminClient().from("mms_jobs").update({ shortlist_wanted: wanted }).eq("id", jobId);
  if (error) {
    if (!isShortlistSchemaMissing(error)) console.error("[shortlists] wanted flag failed:", error.message);
    return false;
  }
  return true;
}

export type OpenResult = "created" | "reopened" | "exists" | "off" | "error";

/**
 * Opens the recruiter shortlist request for a live job (one per job) and
 * alerts Dave on Telegram. A cancelled request is opened again. The caller
 * checks the plan and that the job is live.
 */
export async function openShortlistRequest(job: Pick<JobRow, "id" | "title" | "company_name">, account: EmployerAccount): Promise<OpenResult> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const inserted = await admin
    .from("mms_shortlists")
    .insert({ job_id: job.id, account_id: account.id, status: "requested", requested_at: now, updated_at: now })
    .select("id")
    .maybeSingle();
  let result: OpenResult = "created";
  if (inserted.error) {
    if (isShortlistSchemaMissing(inserted.error)) return "off";
    if (inserted.error.code !== "23505") {
      console.error("[shortlists] open failed:", inserted.error.message);
      return "error";
    }
    // One per job: there is one already. Open it again only if it was cancelled.
    const again = await admin
      .from("mms_shortlists")
      .update({ status: "requested", requested_at: now, started_at: null, sent_at: null, updated_at: now })
      .eq("job_id", job.id)
      .eq("status", "cancelled")
      .select("id")
      .maybeSingle();
    if (again.error) {
      console.error("[shortlists] reopen failed:", again.error.message);
      return "error";
    }
    if (!again.data) return "exists";
    result = "reopened";
  }
  const plan = effectivePlan(account);
  await notifyOwner(
    [
      "MatchMySkillset recruiter shortlist requested",
      `${job.title} at ${job.company_name}`,
      plan ? `${PLAN_NAMES[plan]} plan` : "No active plan",
      result === "reopened" ? "Asked for again after a cancelled request" : "New request",
    ],
    [{ text: "Open the recruiter queue", url: `${SITE_URL}/recruiter` }]
  );
  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Cleans a recruiter note or summary before it is saved and shown to an
 * employer: keeps line breaks, removes control characters, email addresses,
 * links and phone numbers, and any of `names` (a candidate's own first name),
 * so an anonymous candidate is never identified through the note.
 */
export function cleanRecruiterText(value: unknown, max: number, names: (string | null | undefined)[] = []): string {
  if (typeof value !== "string") return "";
  let text = value
    .slice(0, max * 3)
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, " ")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email removed]")
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, "[link removed]")
    .replace(/\b(?:[a-z0-9-]+\.)*(?:linkedin|github|facebook|instagram|twitter|x)\.com\/\S*/gi, "[link removed]")
    // Phone numbers: 10 or more digits, allowing spaces, dots, dashes and brackets (years like 2015-2023 have 8).
    .replace(/(?:\+|\b)\d[\d\s().-]{7,}\d\b/g, (m) => (m.replace(/\D/g, "").length >= 10 ? "[phone removed]" : m));
  for (const name of names) {
    const n = (name ?? "").trim();
    if (n.length >= 2) text = text.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(n)}(?![\\p{L}\\p{N}])`, "giu"), "[name removed]");
  }
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}
