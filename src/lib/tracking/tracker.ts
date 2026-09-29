// The job seeker's application tracker (mms_tracked_applications, migration
// 010). Server code only.
//
// Rows that share a manage_token make up one private tracker page
// (/tracker/<token>). A row is added when someone applies through
// MatchMySkillset, or tells us they applied for an outside job from a results
// card. Each row gets two "Did you hear back?" emails, 7 and 21 days after
// applying (src/lib/tracking/checkins.ts), unless it is stopped, answered
// "placed" or "withdrawn", or deleted.
//
// Safety: a tracker token is only ever given to the browser that created it
// (or already had it). Someone who types another person's email address gets a
// new, separate tracker, never the existing one; the owner can stop or delete
// anything from the links in their emails.

import { db, isTrackingSchemaMissing, logEvent, reachStage, stageKey, type EventContext } from "./db";
import { CHECKIN_DAYS, CHECKIN_NOTICE, type TrackedStatus } from "./constants";
import { emailHash, isTestEmail, newTrackerToken, TRACKER_TOKEN_RE } from "./sign";
import { fieldOfTitle } from "./field";
import { recordPlacement, retractPlacement } from "./placements";

export interface TrackedRow {
  id: string;
  created_at: string;
  updated_at: string;
  manage_token: string;
  email: string;
  email_hash: string;
  results_token: string | null;
  account_id: string | null;
  candidate_id: string | null;
  application_id: string | null;
  job_id: string | null;
  employer_account_id: string | null;
  source: "mms" | "external";
  job_source: string | null;
  job_key: string;
  job_title: string;
  company: string | null;
  job_location: string | null;
  job_url: string | null;
  salary: string | null;
  field: string | null;
  soc_code: string | null;
  applied_at: string;
  status: TrackedStatus;
  status_at: string | null;
  next_checkin_at: string | null;
  checkins_sent: number;
  last_checkin_at: string | null;
  checkins_stopped_at: string | null;
  consent_at: string;
  consent_text: string;
  is_test: boolean;
  delete_after: string;
}

export const TRACKED_COLUMNS =
  "id, created_at, updated_at, manage_token, email, email_hash, results_token, account_id, candidate_id, application_id, job_id, employer_account_id, source, job_source, job_key, job_title, company, job_location, job_url, salary, field, soc_code, applied_at, status, status_at, next_checkin_at, checkins_sent, last_checkin_at, checkins_stopped_at, consent_at, consent_text, is_test, delete_after";

const DAY = 86_400_000;

export interface TrackJob {
  /** Job board id: mms, reed, adzuna, ... */
  source: string;
  /** The board's own id for the job, when it has one. */
  externalId?: string | null;
  title: string;
  company?: string | null;
  location?: string | null;
  url?: string | null;
  salary?: string | null;
  /** Posted on MatchMySkillset. */
  mmsJobId?: string | null;
  employerAccountId?: string | null;
  socCode?: string | null;
}

/** One key per job, so tracking the same job twice updates rather than duplicates. */
export function jobKeyFor(job: TrackJob): string {
  if (job.mmsJobId) return `mms:${job.mmsJobId}`;
  if (job.externalId) return `${job.source}:${job.externalId}`.slice(0, 300);
  const url = (job.url ?? "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
  return `url:${url || job.title.toLowerCase()}`.slice(0, 300);
}

function contextOf(row: TrackedRow): EventContext {
  return {
    applicationId: row.application_id,
    trackedId: row.id,
    jobId: row.job_id,
    accountId: row.employer_account_id,
    emailHash: row.email_hash,
    candidateId: row.candidate_id,
    candidateAccountId: row.account_id,
    field: row.field,
    channel: row.source,
    isTest: row.is_test,
  };
}

async function rowsForToken(token: string, limit = 200): Promise<TrackedRow[] | "off"> {
  if (!TRACKER_TOKEN_RE.test(token)) return [];
  const { data, error } = await db().from("mms_tracked_applications").select(TRACKED_COLUMNS).eq("manage_token", token).order("applied_at", { ascending: false }).limit(limit);
  if (error) {
    if (isTrackingSchemaMissing(error)) return "off";
    throw new Error(`mms_tracked_applications read failed: ${error.message}`);
  }
  return (data ?? []) as TrackedRow[];
}

/** Every row on one tracker page, newest first ("off" before migration 010). */
export async function trackerRows(token: string): Promise<TrackedRow[] | "off"> {
  return rowsForToken(token);
}

/** The same list for a candidate account (see src/lib/tracking/identity.ts). */
export async function trackedForAccount(accountId: string): Promise<TrackedRow[] | "off"> {
  const { data, error } = await db().from("mms_tracked_applications").select(TRACKED_COLUMNS).eq("account_id", accountId).order("applied_at", { ascending: false }).limit(200);
  if (error) {
    if (isTrackingSchemaMissing(error)) return "off";
    throw new Error(`mms_tracked_applications read failed: ${error.message}`);
  }
  return (data ?? []) as TrackedRow[];
}

/** On candidate sign-up (verified email): attach their guest rows to the account. */
export async function claimTrackedForAccount(accountId: string, email: string): Promise<number> {
  const hash = emailHash(email);
  if (!hash) return 0;
  const { data, error } = await db().from("mms_tracked_applications").update({ account_id: accountId }).eq("email_hash", hash).is("account_id", null).select("id");
  if (error) {
    if (!isTrackingSchemaMissing(error)) console.error("[tracker] claim failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

export async function getTracked(id: string): Promise<TrackedRow | null | "off"> {
  const { data, error } = await db().from("mms_tracked_applications").select(TRACKED_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    if (isTrackingSchemaMissing(error)) return "off";
    if (error.code === "22P02") return null;
    throw new Error(`mms_tracked_applications read failed: ${error.message}`);
  }
  return (data as TrackedRow | null) ?? null;
}

export interface TrackInput {
  job: TrackJob;
  source: "mms" | "external";
  /** A tracker link the browser already holds; its email is used and the typed one ignored. */
  trackerToken?: string | null;
  email?: string | null;
  resultsToken?: string | null;
  accountId?: string | null;
  candidateId?: string | null;
  applicationId?: string | null;
  appliedAt?: string;
}

export type TrackResult =
  | { ok: true; row: TrackedRow; token: string; created: boolean; newTracker: boolean }
  | { ok: false; reason: "off" | "email" | "error" };

/** Adds one job to a tracker (a new tracker when the browser has none). */
export async function trackApplication(input: TrackInput): Promise<TrackResult> {
  const client = db();
  let token: string | null = null;
  let email = (input.email ?? "").trim().toLowerCase();

  if (input.trackerToken && TRACKER_TOKEN_RE.test(input.trackerToken)) {
    const { data, error } = await client.from("mms_tracked_applications").select("email, manage_token").eq("manage_token", input.trackerToken).limit(1);
    if (error) return { ok: false, reason: isTrackingSchemaMissing(error) ? "off" : "error" };
    const found = data?.[0];
    if (found) {
      token = found.manage_token as string;
      email = found.email as string;
    }
  }
  if (!email) return { ok: false, reason: "email" };
  const newTracker = !token;
  if (!token) token = newTrackerToken();

  const hash = emailHash(email);
  if (!hash) return { ok: false, reason: "error" };
  const jobKey = jobKeyFor(input.job);

  if (!newTracker) {
    const { data, error } = await client.from("mms_tracked_applications").select(TRACKED_COLUMNS).eq("manage_token", token).eq("job_key", jobKey).maybeSingle();
    if (error) return { ok: false, reason: isTrackingSchemaMissing(error) ? "off" : "error" };
    if (data) return { ok: true, row: data as TrackedRow, token, created: false, newTracker: false };
  }

  const appliedAt = input.appliedAt ?? new Date().toISOString();
  const field = fieldOfTitle(input.job.title);
  const row = {
    manage_token: token,
    email,
    email_hash: hash,
    results_token: input.resultsToken && /^[A-Za-z0-9_-]{20,64}$/.test(input.resultsToken) ? input.resultsToken : null,
    account_id: input.accountId ?? null,
    candidate_id: input.candidateId ?? null,
    application_id: input.applicationId ?? null,
    job_id: input.job.mmsJobId ?? null,
    employer_account_id: input.job.employerAccountId ?? null,
    source: input.source,
    job_source: input.job.source.slice(0, 40),
    job_key: jobKey,
    job_title: input.job.title.slice(0, 200),
    company: input.job.company?.slice(0, 200) || null,
    job_location: input.job.location?.slice(0, 200) || null,
    job_url: input.job.url?.slice(0, 1000) || null,
    salary: input.job.salary?.slice(0, 120) || null,
    field,
    soc_code: input.job.socCode ?? null,
    applied_at: appliedAt,
    next_checkin_at: new Date(Date.parse(appliedAt) + CHECKIN_DAYS[0] * DAY).toISOString(),
    consent_text: CHECKIN_NOTICE,
    is_test: isTestEmail(email),
  };
  const { data, error } = await client.from("mms_tracked_applications").insert(row).select(TRACKED_COLUMNS).single();
  if (error?.code === "23505") {
    // Tracked a moment ago (a double click, or this application already has a row): return that row.
    const base = client.from("mms_tracked_applications").select(TRACKED_COLUMNS);
    const again = await (input.applicationId ? base.eq("application_id", input.applicationId) : base.eq("manage_token", token).eq("job_key", jobKey)).maybeSingle();
    if (again.data) {
      const existing = again.data as TrackedRow;
      return { ok: true, row: existing, token: existing.manage_token, created: false, newTracker: false };
    }
    return { ok: false, reason: "error" };
  }
  if (error || !data) {
    if (isTrackingSchemaMissing(error)) return { ok: false, reason: "off" };
    console.error("[tracker] insert failed:", error?.message);
    return { ok: false, reason: "error" };
  }
  const saved = data as TrackedRow;
  await logEvent("tracked", "candidate", "applied", contextOf(saved), { job_source: saved.job_source, new_tracker: newTracker });
  await reachStage(stageKey({ applicationId: saved.application_id, trackedId: saved.id }), "applied", "candidate", contextOf(saved));
  return { ok: true, row: saved, token, created: true, newTracker };
}

/**
 * The job seeker's own answer, from a check-in link or the tracker page.
 * Logs it, counts funnel stages, and records (or takes back) a placement.
 */
export async function setTrackedStatus(row: TrackedRow, status: TrackedStatus, via: "checkin" | "tracker", source: "candidate" | "admin" = "candidate"): Promise<boolean> {
  const now = new Date().toISOString();
  const finished = status === "placed" || status === "withdrawn";
  const patch: Record<string, unknown> = { status, status_at: now, updated_at: now };
  if (finished) patch.next_checkin_at = null;
  const { error } = await db().from("mms_tracked_applications").update(patch).eq("id", row.id);
  if (error) {
    console.error("[tracker] status update failed:", error.message);
    return false;
  }
  const ctx = contextOf(row);
  await logEvent(via === "checkin" ? "checkin_answer" : "tracker_update", source, status, ctx, { from: row.status });
  if (status === "interview" || status === "offer" || status === "placed") {
    await reachStage(stageKey({ applicationId: row.application_id, trackedId: row.id }), status, source, ctx);
  }
  if (status === "placed" && row.status !== "placed") {
    await recordPlacement({
      source,
      applicationId: row.application_id,
      trackedId: row.id,
      jobId: row.job_id,
      employerAccountId: row.employer_account_id,
      email: row.email,
      candidateId: row.candidate_id,
      candidateAccountId: row.account_id,
      jobTitle: row.job_title,
      company: row.company,
      location: row.job_location,
      field: row.field,
      socCode: row.soc_code,
      channel: row.source,
    }).catch((err) => console.error("[tracker] placement failed:", err instanceof Error ? err.message : err));
  } else if (row.status === "placed" && status !== "placed") {
    await retractPlacement({ applicationId: row.application_id, trackedId: row.id }, source);
  }
  return true;
}

/** "Stop asking about this job". */
export async function stopCheckins(row: TrackedRow, via: "checkin" | "tracker"): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await db().from("mms_tracked_applications").update({ checkins_stopped_at: now, next_checkin_at: null, updated_at: now }).eq("id", row.id);
  if (error) {
    console.error("[tracker] stop failed:", error.message);
    return false;
  }
  await logEvent("checkins_stopped", "candidate", "one", contextOf(row), { via });
  return true;
}

/** "Stop all check-in emails": every tracked job for this address, on any tracker. */
export async function stopAllCheckins(row: TrackedRow, via: "checkin" | "tracker" | "unsubscribe"): Promise<number> {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("mms_tracked_applications")
    .update({ checkins_stopped_at: now, next_checkin_at: null, updated_at: now })
    .eq("email_hash", row.email_hash)
    .is("checkins_stopped_at", null)
    .select("id");
  if (error) {
    console.error("[tracker] stop all failed:", error.message);
    return -1;
  }
  await logEvent("checkins_stopped", "candidate", "all", contextOf(row), { via, rows: data?.length ?? 0 });
  return data?.length ?? 0;
}

export async function deleteTrackedRow(token: string, id: string): Promise<boolean> {
  const { data, error } = await db().from("mms_tracked_applications").delete().eq("manage_token", token).eq("id", id).select("id");
  if (error) {
    console.error("[tracker] delete failed:", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function deleteTracker(token: string): Promise<number> {
  if (!TRACKER_TOKEN_RE.test(token)) return 0;
  const { data, error } = await db().from("mms_tracked_applications").delete().eq("manage_token", token).select("id");
  if (error) {
    console.error("[tracker] delete all failed:", error.message);
    return -1;
  }
  return data?.length ?? 0;
}

/**
 * Deletes every tracked application for an address (a job seeker deleting
 * their profile and everything with it). Placements and events keep only the
 * keyed hash. Safe before migration 010.
 */
export async function deleteTrackerDataForEmail(email: string): Promise<void> {
  const hash = emailHash(email);
  if (!hash) return;
  const { error } = await db().from("mms_tracked_applications").delete().eq("email_hash", hash);
  if (error && !isTrackingSchemaMissing(error)) throw new Error(`mms_tracked_applications delete failed: ${error.message}`);
  const cleared = await db().from("mms_placements").update({ candidate_email: null }).eq("candidate_email_hash", hash);
  if (cleared.error && !isTrackingSchemaMissing(cleared.error)) throw new Error(`mms_placements update failed: ${cleared.error.message}`);
}

/**
 * Tracks an application made through MatchMySkillset ("Apply with
 * MatchMySkillset"), so it gets check-ins too. Never throws: applying must
 * work whatever happens here. Returns the tracker token for the browser.
 */
export async function trackMmsApplication(opts: {
  applicationId: string;
  job: { id: string; title: string; company_name: string; location: string | null; account_id: string | null; soc_code?: string | null };
  email: string;
  candidateId: string | null;
  accountId?: string | null;
  resultsToken?: string | null;
  trackerToken?: string | null;
}): Promise<string | null> {
  try {
    const r = await trackApplication({
      source: "mms",
      job: {
        source: "mms",
        mmsJobId: opts.job.id,
        title: opts.job.title,
        company: opts.job.company_name,
        location: opts.job.location,
        url: `/jobs/mms/${opts.job.id}`,
        employerAccountId: opts.job.account_id,
        socCode: opts.job.soc_code ?? null,
      },
      trackerToken: opts.trackerToken,
      email: opts.email,
      resultsToken: opts.resultsToken,
      accountId: opts.accountId ?? null,
      candidateId: opts.candidateId,
      applicationId: opts.applicationId,
    });
    if (!r.ok) {
      if (r.reason !== "off") console.error(`[tracker] could not track application ${opts.applicationId}: ${r.reason}`);
      return null;
    }
    return r.token;
  } catch (err) {
    console.error("[tracker] track application failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** For the employer's applicants list: each application's own answer, only interview, offer or placed. */
export async function candidateReports(applicationIds: string[]): Promise<Map<string, TrackedStatus>> {
  const map = new Map<string, TrackedStatus>();
  if (applicationIds.length === 0) return map;
  try {
    const { data, error } = await db()
      .from("mms_tracked_applications")
      .select("application_id, status")
      .in("application_id", applicationIds.slice(0, 500))
      .in("status", ["interview", "offer", "placed"]);
    if (error) {
      if (!isTrackingSchemaMissing(error)) console.error("[tracker] candidate reports failed:", error.message);
      return map;
    }
    for (const r of data ?? []) if (r.application_id) map.set(r.application_id as string, r.status as TrackedStatus);
  } catch (err) {
    console.error("[tracker] candidate reports failed:", err instanceof Error ? err.message : err);
  }
  return map;
}
