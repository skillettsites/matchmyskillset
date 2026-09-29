// Reads and writes for the job seeker side of the job board (service role
// only): mms_job_alerts, mms_candidates, mms_applications and the candidate's
// side of mms_contact_requests. Server-side only. Tables: migration 006.

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { DatabaseUnavailableError } from "@/lib/apis/reports-db";
import type { FitAnchor, PersonFit } from "@/lib/apis/jobs/fit";
import type { SnapshotPlace } from "@/lib/apis/jobs/match";
import { deleteTrackerDataForEmail } from "@/lib/tracking/tracker";

export { newToken } from "@/lib/apis/reports-db";

export const MANAGE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;

function db() {
  if (!isSupabaseConfigured()) throw new DatabaseUnavailableError();
  return createAdminClient();
}

function fail(what: string, error: { message?: string } | null): never {
  throw new Error(`${what}: ${error?.message ?? "no row"}`);
}

// ---------------------------------------------------------------------------
// Job alerts
// ---------------------------------------------------------------------------

export interface AlertQuery {
  /** What job titles are compared with: the person's own job first, then career matches. */
  anchors: FitAnchor[];
  place: SnapshotPlace | null;
  remote: boolean;
  salaryMin: number | null;
  /** The person's level and pay, for comparing with each advert's (alerts set up from September 2026 v3 on). */
  person?: PersonFit;
}

export interface AlertRow {
  id: string;
  created_at: string;
  email: string;
  manage_token: string;
  report_id: string | null;
  skills: unknown;
  query: AlertQuery | null;
  frequency: "daily" | "weekly";
  active: boolean;
  consent_at: string;
  last_sent_at: string | null;
  sent_job_keys: string[] | null;
}

const ALERT_COLUMNS = "id, created_at, email, manage_token, report_id, skills, query, frequency, active, consent_at, last_sent_at, sent_job_keys";

export async function createAlert(row: {
  email: string;
  manageToken: string;
  reportId: string | null;
  skills: unknown;
  query: AlertQuery;
  frequency: "daily" | "weekly";
  sentJobKeys: string[];
}): Promise<AlertRow> {
  const { data, error } = await db()
    .from("mms_job_alerts")
    .insert({
      email: row.email,
      manage_token: row.manageToken,
      report_id: row.reportId,
      skills: row.skills,
      query: row.query,
      frequency: row.frequency,
      active: true,
      consent_at: new Date().toISOString(),
      sent_job_keys: row.sentJobKeys,
    })
    .select(ALERT_COLUMNS)
    .single();
  if (error || !data) fail("mms_job_alerts insert failed", error);
  return data as AlertRow;
}

/** An existing alert for this email and results link, so signing up twice updates rather than duplicates. */
export async function findAlert(email: string, reportId: string): Promise<AlertRow | null> {
  const { data, error } = await db().from("mms_job_alerts").select(ALERT_COLUMNS).eq("report_id", reportId).ilike("email", email).limit(1);
  if (error) fail("mms_job_alerts read failed", error);
  return ((data ?? [])[0] as AlertRow | undefined) ?? null;
}

export async function getAlertByToken(token: string): Promise<AlertRow | null> {
  if (!MANAGE_TOKEN_PATTERN.test(token)) return null;
  const { data, error } = await db().from("mms_job_alerts").select(ALERT_COLUMNS).eq("manage_token", token).maybeSingle();
  if (error) fail("mms_job_alerts read failed", error);
  return (data as AlertRow | null) ?? null;
}

export async function updateAlert(id: string, patch: Partial<Pick<AlertRow, "frequency" | "active" | "query" | "skills" | "sent_job_keys" | "consent_at">>): Promise<void> {
  const { error } = await db().from("mms_job_alerts").update(patch).eq("id", id);
  if (error) fail("mms_job_alerts update failed", error);
}

export async function deleteAlertByToken(token: string): Promise<boolean> {
  if (!MANAGE_TOKEN_PATTERN.test(token)) return false;
  const { data, error } = await db().from("mms_job_alerts").delete().eq("manage_token", token).select("id");
  if (error) fail("mms_job_alerts delete failed", error);
  return (data ?? []).length > 0;
}

/** Active alerts of one frequency not run since `cutoffIso`, oldest first. */
export async function dueAlerts(frequency: "daily" | "weekly", cutoffIso: string, limit: number): Promise<AlertRow[]> {
  const { data, error } = await db()
    .from("mms_job_alerts")
    .select(ALERT_COLUMNS)
    .eq("active", true)
    .eq("frequency", frequency)
    .or(`last_sent_at.is.null,last_sent_at.lt.${cutoffIso}`)
    .order("last_sent_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  if (error) fail("mms_job_alerts due read failed", error);
  return (data ?? []) as AlertRow[];
}

/**
 * Claims an alert for this run: sets last_sent_at to now only if it has not
 * been run since the cutoff. A second, overlapping run gets false and skips
 * it, so nobody gets the same email twice.
 */
export async function claimAlert(id: string, cutoffIso: string, nowIso: string): Promise<boolean> {
  const { data, error } = await db()
    .from("mms_job_alerts")
    .update({ last_sent_at: nowIso })
    .eq("id", id)
    .eq("active", true)
    .or(`last_sent_at.is.null,last_sent_at.lt.${cutoffIso}`)
    .select("id");
  if (error) fail("mms_job_alerts claim failed", error);
  return (data ?? []).length > 0;
}

export async function releaseAlert(id: string, previous: string | null): Promise<void> {
  const { error } = await db().from("mms_job_alerts").update({ last_sent_at: previous }).eq("id", id);
  if (error) console.error("[alerts] release failed:", error.message);
}

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------

export interface CandidateRow {
  id: string;
  created_at: string;
  updated_at: string;
  manage_token: string;
  email: string;
  first_name: string | null;
  current_role: string | null;
  location: string | null;
  region: string | null;
  years_experience: number | null;
  skills: unknown;
  headline: string | null;
  cv_text: string | null;
  report_id: string | null;
  discoverable: boolean;
  discoverable_consent_at: string | null;
  consent_text: string | null;
  withdrawn_at: string | null;
  expires_at: string | null;
}

const CANDIDATE_COLUMNS =
  "id, created_at, updated_at, manage_token, email, first_name, current_role, location, region, years_experience, skills, headline, cv_text, report_id, discoverable, discoverable_consent_at, consent_text, withdrawn_at, expires_at";

export async function createCandidate(row: {
  manageToken: string;
  email: string;
  firstName: string;
  currentRole: string | null;
  location: string | null;
  region: string | null;
  yearsExperience: number | null;
  skills: string[];
  headline: string;
  cvText: string | null;
  reportId: string | null;
  consentText: string;
}): Promise<CandidateRow> {
  const { data, error } = await db()
    .from("mms_candidates")
    .insert({
      manage_token: row.manageToken,
      email: row.email,
      first_name: row.firstName,
      current_role: row.currentRole,
      location: row.location,
      region: row.region,
      years_experience: row.yearsExperience,
      skills: row.skills,
      headline: row.headline,
      cv_text: row.cvText,
      report_id: row.reportId,
      // Hidden until the person confirms from the email we send (double opt-in).
      discoverable: false,
      consent_text: row.consentText,
    })
    .select(CANDIDATE_COLUMNS)
    .single();
  if (error || !data) fail("mms_candidates insert failed", error);
  return data as CandidateRow;
}

export async function getCandidateByToken(token: string): Promise<CandidateRow | null> {
  if (!MANAGE_TOKEN_PATTERN.test(token)) return null;
  const { data, error } = await db().from("mms_candidates").select(CANDIDATE_COLUMNS).eq("manage_token", token).maybeSingle();
  if (error) fail("mms_candidates read failed", error);
  const row = (data as CandidateRow | null) ?? null;
  if (!row || row.withdrawn_at) return null;
  if (row.expires_at && Date.parse(row.expires_at) < Date.now()) return null;
  return row;
}

export async function getCandidateById(id: string): Promise<CandidateRow | null> {
  const { data, error } = await db().from("mms_candidates").select(CANDIDATE_COLUMNS).eq("id", id).maybeSingle();
  if (error) fail("mms_candidates read failed", error);
  return (data as CandidateRow | null) ?? null;
}

/** A live profile for this email, if there is one (to link applications to it). */
export async function findCandidateByEmail(email: string): Promise<CandidateRow | null> {
  const { data, error } = await db().from("mms_candidates").select(CANDIDATE_COLUMNS).ilike("email", email).is("withdrawn_at", null).limit(1);
  if (error) fail("mms_candidates read failed", error);
  return ((data ?? [])[0] as CandidateRow | undefined) ?? null;
}

export async function updateCandidate(
  id: string,
  patch: Partial<{
    headline: string;
    current_role: string | null;
    location: string | null;
    region: string | null;
    years_experience: number | null;
    skills: string[];
    cv_text: string | null;
    discoverable: boolean;
    discoverable_consent_at: string | null;
    first_name: string;
  }>
): Promise<void> {
  const { error } = await db()
    .from("mms_candidates")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) fail("mms_candidates update failed", error);
}

/**
 * Deletes a profile and everything we hold about the person on the job
 * seeker side: their copies of applications, contact requests (cascade) and
 * job alerts sent to the same address.
 */
export async function deleteCandidateEverything(c: CandidateRow): Promise<void> {
  const client = db();
  const apps = await client.from("mms_applications").delete().eq("candidate_id", c.id);
  if (apps.error) fail("mms_applications delete failed", apps.error);
  const appsByEmail = await client.from("mms_applications").delete().ilike("email", c.email);
  if (appsByEmail.error) fail("mms_applications delete failed", appsByEmail.error);
  const alerts = await client.from("mms_job_alerts").delete().ilike("email", c.email);
  if (alerts.error) fail("mms_job_alerts delete failed", alerts.error);
  // Their application tracker too (migration 010; does nothing before it is applied).
  await deleteTrackerDataForEmail(c.email);
  const cand = await client.from("mms_candidates").delete().eq("id", c.id);
  if (cand.error) fail("mms_candidates delete failed", cand.error);
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export interface ApplicationRow {
  id: string;
  created_at: string;
  job_id: string;
  candidate_id: string | null;
  name: string;
  email: string;
  match_score: number | null;
  status: string;
  employer_notified_at: string | null;
}

export async function hasApplied(jobId: string, email: string): Promise<boolean> {
  const { data, error } = await db().from("mms_applications").select("id").eq("job_id", jobId).ilike("email", email).limit(1);
  if (error) fail("mms_applications read failed", error);
  return (data ?? []).length > 0;
}

export async function insertApplication(row: {
  jobId: string;
  candidateId: string | null;
  name: string;
  email: string;
  phone: string | null;
  cvText: string;
  note: string | null;
  matchScore: number | null;
  matchedSkills: { id: string; name: string }[];
  consentText: string;
}): Promise<{ id: string }> {
  const { data, error } = await db()
    .from("mms_applications")
    .insert({
      job_id: row.jobId,
      candidate_id: row.candidateId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      cv_text: row.cvText,
      cover_note: row.note,
      match_score: row.matchScore,
      matched_skills: row.matchedSkills,
      consent_at: new Date().toISOString(),
      consent_text: row.consentText,
    })
    .select("id")
    .single();
  if (error || !data) fail("mms_applications insert failed", error);
  return data as { id: string };
}

export async function markEmployerNotified(id: string): Promise<void> {
  const { error } = await db().from("mms_applications").update({ employer_notified_at: new Date().toISOString() }).eq("id", id);
  if (error) console.error("[applications] notified update failed:", error.message);
}

export async function applicationsForCandidate(c: CandidateRow): Promise<(ApplicationRow & { job_title: string | null; company_name: string | null })[]> {
  const { data, error } = await db()
    .from("mms_applications")
    .select("id, created_at, job_id, candidate_id, name, email, match_score, status, employer_notified_at, mms_jobs(title, company_name)")
    .or(`candidate_id.eq.${c.id},email.ilike.${c.email.replace(/[,()]/g, "")}`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) fail("mms_applications read failed", error);
  return ((data ?? []) as unknown as (ApplicationRow & { mms_jobs: { title: string; company_name: string } | null })[]).map((r) => ({
    ...r,
    job_title: r.mms_jobs?.title ?? null,
    company_name: r.mms_jobs?.company_name ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Employers (read only, for names and addresses)
// ---------------------------------------------------------------------------

export interface EmployerBrief {
  id: string;
  email: string;
  company_name: string | null;
  website: string | null;
}

export async function getEmployer(id: string | null): Promise<EmployerBrief | null> {
  if (!id) return null;
  const { data, error } = await db().from("mms_employer_accounts").select("id, email, company_name, website").eq("id", id).maybeSingle();
  if (error) fail("mms_employer_accounts read failed", error);
  return (data as EmployerBrief | null) ?? null;
}

// ---------------------------------------------------------------------------
// Contact requests (candidate side)
// ---------------------------------------------------------------------------

export interface ContactRow {
  id: string;
  created_at: string;
  account_id: string;
  candidate_id: string;
  job_id: string | null;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "expired";
  response_token: string;
  responded_at: string | null;
}

const CONTACT_COLUMNS = "id, created_at, account_id, candidate_id, job_id, message, status, response_token, responded_at";

/** Requests left unanswered this long count as expired. */
export const CONTACT_EXPIRY_DAYS = 30;

export function effectiveStatus(c: ContactRow, now = Date.now()): ContactRow["status"] {
  if (c.status === "pending" && now - Date.parse(c.created_at) > CONTACT_EXPIRY_DAYS * 86_400_000) return "expired";
  return c.status;
}

export async function getContactByToken(token: string): Promise<ContactRow | null> {
  if (!MANAGE_TOKEN_PATTERN.test(token)) return null;
  const { data, error } = await db().from("mms_contact_requests").select(CONTACT_COLUMNS).eq("response_token", token).maybeSingle();
  if (error) fail("mms_contact_requests read failed", error);
  return (data as ContactRow | null) ?? null;
}

export async function contactsForCandidate(candidateId: string): Promise<ContactRow[]> {
  const { data, error } = await db().from("mms_contact_requests").select(CONTACT_COLUMNS).eq("candidate_id", candidateId).order("created_at", { ascending: false }).limit(50);
  if (error) fail("mms_contact_requests read failed", error);
  return (data ?? []) as ContactRow[];
}

/** Records the answer once: only a pending request changes, so a double click cannot email twice. */
export async function answerContact(id: string, status: "accepted" | "declined"): Promise<boolean> {
  const { data, error } = await db()
    .from("mms_contact_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) fail("mms_contact_requests update failed", error);
  return (data ?? []).length > 0;
}

// ---------------------------------------------------------------------------
// Retention (run by the daily alerts job)
// ---------------------------------------------------------------------------

/**
 * Deletes expired profiles (12 months), never-confirmed profiles older than 14
 * days, applications past delete_after (12 months) and alerts set up more than
 * 12 months ago.
 */
export async function purgeExpired(): Promise<{ candidates: number; unconfirmed: number; applications: number; alerts: number }> {
  const client = db();
  const now = new Date().toISOString();
  const twoWeeks = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const a = await client.from("mms_candidates").delete().lt("expires_at", now).select("id");
  const b = await client.from("mms_candidates").delete().eq("discoverable", false).is("discoverable_consent_at", null).lt("created_at", twoWeeks).select("id");
  const c = await client.from("mms_applications").delete().lt("delete_after", now).select("id");
  const yearAgo = new Date();
  yearAgo.setMonth(yearAgo.getMonth() - 12);
  const d = await client.from("mms_job_alerts").delete().lt("consent_at", yearAgo.toISOString()).select("id");
  for (const r of [a, b, c, d]) if (r.error) console.error("[purge] failed:", r.error.message);
  return { candidates: a.data?.length ?? 0, unconfirmed: b.data?.length ?? 0, applications: c.data?.length ?? 0, alerts: d.data?.length ?? 0 };
}
