// Placements: people who got the job (mms_placements, migration 010).
// Server code only.
//
// A placement is recorded when an employer marks an applicant hired, when the
// job seeker answers "Placed" (check-in email or tracker page), or when admin
// records one. One placement per application made through us, and one per
// tracked outside job: a second confirmation (the job seeker after the
// employer, say) adds to confirmed_by rather than making a second row. If the
// only side that confirmed it takes it back (an employer moves "hired" back),
// the placement is cancelled and drops out of the funnel.
//
// Case studies: about a day after a placement is recorded, the check-in cron
// emails the job seeker a separate question with a link to an unticked box
// (MARKETING_CONSENT_TEXT). Until they tick it, the placement is anonymous and
// must not be used in marketing. Their answer is stored with its time and the
// exact wording, and they can change it from the same link.

import { db, isTrackingSchemaMissing, logEvent, reachStage, stageKey, type EventContext } from "./db";
import { MARKETING_CONSENT_TEXT } from "./constants";
import { emailHash, isTestEmail, newTrackerToken, TRACKER_TOKEN_RE } from "./sign";

export type PlacementSource = "employer" | "candidate" | "admin";

export interface PlacementRow {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string | null;
  application_id: string | null;
  tracked_id: string | null;
  employer_account_id: string | null;
  candidate_email_hash: string | null;
  candidate_id: string | null;
  candidate_account_id: string | null;
  candidate_email: string | null;
  job_title: string | null;
  company: string | null;
  job_location: string | null;
  field: string | null;
  soc_code: string | null;
  source: PlacementSource;
  confirmed_by: string;
  employer_confirmed_at: string | null;
  candidate_confirmed_at: string | null;
  admin_confirmed_at: string | null;
  started_on: string | null;
  admin_note: string | null;
  cancelled_at: string | null;
  consent_token: string | null;
  consent_requested_at: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  marketing_consent_text: string | null;
  marketing_consent_answered_at: string | null;
  marketing_consent_withdrawn_at: string | null;
  is_test: boolean;
  email_purge_after: string;
}

export const PLACEMENT_COLUMNS =
  "id, created_at, updated_at, job_id, application_id, tracked_id, employer_account_id, candidate_email_hash, candidate_id, candidate_account_id, candidate_email, job_title, company, job_location, field, soc_code, source, confirmed_by, employer_confirmed_at, candidate_confirmed_at, admin_confirmed_at, started_on, admin_note, cancelled_at, consent_token, consent_requested_at, marketing_consent, marketing_consent_at, marketing_consent_text, marketing_consent_answered_at, marketing_consent_withdrawn_at, is_test, email_purge_after";

const CONFIRM_COLUMN: Record<PlacementSource, "employer_confirmed_at" | "candidate_confirmed_at" | "admin_confirmed_at"> = {
  employer: "employer_confirmed_at",
  candidate: "candidate_confirmed_at",
  admin: "admin_confirmed_at",
};

function confirmedBy(p: Pick<PlacementRow, "employer_confirmed_at" | "candidate_confirmed_at" | "admin_confirmed_at">): string {
  const who = [p.candidate_confirmed_at && "candidate", p.employer_confirmed_at && "employer", p.admin_confirmed_at && "admin"].filter(Boolean);
  return who.join(", ");
}

export interface PlacementInput {
  source: PlacementSource;
  applicationId?: string | null;
  trackedId?: string | null;
  jobId?: string | null;
  employerAccountId?: string | null;
  email?: string | null;
  candidateId?: string | null;
  candidateAccountId?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  location?: string | null;
  field?: string | null;
  socCode?: string | null;
  startedOn?: string | null;
  adminNote?: string | null;
  channel?: "mms" | "external" | null;
}

async function findPlacement(where: { applicationId?: string | null; trackedId?: string | null }): Promise<PlacementRow | null | "off"> {
  const client = db();
  for (const [col, value] of [
    ["application_id", where.applicationId],
    ["tracked_id", where.trackedId],
  ] as const) {
    if (!value) continue;
    const { data, error } = await client.from("mms_placements").select(PLACEMENT_COLUMNS).eq(col, value).maybeSingle();
    if (error) {
      if (isTrackingSchemaMissing(error)) return "off";
      throw new Error(`mms_placements read failed: ${error.message}`);
    }
    if (data) return data as PlacementRow;
  }
  return null;
}

function eventContext(p: PlacementRow, channel?: "mms" | "external" | null): EventContext {
  return {
    applicationId: p.application_id,
    trackedId: p.tracked_id,
    placementId: p.id,
    jobId: p.job_id,
    accountId: p.employer_account_id,
    emailHash: p.candidate_email_hash,
    candidateId: p.candidate_id,
    candidateAccountId: p.candidate_account_id,
    field: p.field,
    channel: channel ?? (p.application_id ? "mms" : p.tracked_id ? "external" : null),
    isTest: p.is_test,
  };
}

/**
 * Records a placement, or adds this confirmation to the existing one for the
 * same application or tracked job (and un-cancels it). Returns "off" before
 * migration 010.
 */
export async function recordPlacement(input: PlacementInput, attempt = 0): Promise<{ placement: PlacementRow; created: boolean } | "off"> {
  const existing = await findPlacement({ applicationId: input.applicationId, trackedId: input.trackedId });
  if (existing === "off") return "off";
  const now = new Date().toISOString();
  const client = db();
  const col = CONFIRM_COLUMN[input.source];

  if (existing) {
    const next = { ...existing, [col]: existing[col] ?? now };
    const patch: Record<string, unknown> = {
      [col]: next[col],
      confirmed_by: confirmedBy(next),
      cancelled_at: null,
      updated_at: now,
    };
    if (!existing.application_id && input.applicationId) patch.application_id = input.applicationId;
    if (!existing.tracked_id && input.trackedId) patch.tracked_id = input.trackedId;
    if (!existing.job_id && input.jobId) patch.job_id = input.jobId;
    if (!existing.employer_account_id && input.employerAccountId) patch.employer_account_id = input.employerAccountId;
    if (!existing.candidate_email && input.email) {
      patch.candidate_email = input.email.trim().toLowerCase();
      patch.candidate_email_hash = existing.candidate_email_hash ?? emailHash(input.email);
    }
    if (!existing.candidate_account_id && input.candidateAccountId) patch.candidate_account_id = input.candidateAccountId;
    if (input.startedOn) patch.started_on = input.startedOn;
    if (input.adminNote) patch.admin_note = input.adminNote;
    const { data, error } = await client.from("mms_placements").update(patch).eq("id", existing.id).select(PLACEMENT_COLUMNS).single();
    if (error || !data) throw new Error(`mms_placements update failed: ${error?.message ?? "no row"}`);
    const placement = data as PlacementRow;
    await logEvent("placement", input.source, existing.cancelled_at ? "restored" : "confirmed", eventContext(placement, input.channel), { confirmed_by: placement.confirmed_by });
    await reachStage(stageKey({ applicationId: placement.application_id, trackedId: placement.tracked_id, placementId: placement.id }), "placed", input.source, eventContext(placement, input.channel));
    return { placement, created: false };
  }

  const email = input.email?.trim().toLowerCase() || null;
  const row = {
    job_id: input.jobId ?? null,
    application_id: input.applicationId ?? null,
    tracked_id: input.trackedId ?? null,
    employer_account_id: input.employerAccountId ?? null,
    candidate_email_hash: email ? emailHash(email) : null,
    candidate_id: input.candidateId ?? null,
    candidate_account_id: input.candidateAccountId ?? null,
    candidate_email: email,
    job_title: input.jobTitle?.slice(0, 200) ?? null,
    company: input.company?.slice(0, 200) ?? null,
    job_location: input.location?.slice(0, 200) ?? null,
    field: input.field ?? null,
    soc_code: input.socCode ?? null,
    source: input.source,
    confirmed_by: input.source,
    [col]: now,
    started_on: input.startedOn ?? null,
    admin_note: input.adminNote ?? null,
    consent_token: newTrackerToken(),
    is_test: isTestEmail(email),
  };
  const { data, error } = await client.from("mms_placements").insert(row).select(PLACEMENT_COLUMNS).single();
  if (error?.code === "23505" && attempt < 2) {
    // Recorded at the same moment by the other side: add this confirmation to it instead.
    return recordPlacement(input, attempt + 1);
  }
  if (error || !data) {
    if (isTrackingSchemaMissing(error)) return "off";
    throw new Error(`mms_placements insert failed: ${error?.message ?? "no row"}`);
  }
  const placement = data as PlacementRow;
  await logEvent("placement", input.source, "recorded", eventContext(placement, input.channel));
  await reachStage(stageKey({ applicationId: placement.application_id, trackedId: placement.tracked_id, placementId: placement.id }), "placed", input.source, eventContext(placement, input.channel));
  return { placement, created: true };
}

/**
 * One side takes back its confirmation (an employer moves "hired" to another
 * status, or the job seeker changes "Placed"). When nobody else confirmed it,
 * the placement is cancelled.
 */
export async function retractPlacement(where: { applicationId?: string | null; trackedId?: string | null }, by: PlacementSource): Promise<void> {
  const existing = await findPlacement(where).catch((err) => {
    console.error("[placements] retract lookup failed:", err instanceof Error ? err.message : err);
    return null;
  });
  if (!existing || existing === "off" || existing.cancelled_at) return;
  const col = CONFIRM_COLUMN[by];
  if (!existing[col]) return;
  const next = { ...existing, [col]: null };
  const remaining = confirmedBy(next);
  const now = new Date().toISOString();
  const { error } = await db()
    .from("mms_placements")
    .update({ [col]: null, confirmed_by: remaining || existing.confirmed_by, cancelled_at: remaining ? null : now, updated_at: now })
    .eq("id", existing.id);
  if (error) {
    console.error("[placements] retract failed:", error.message);
    return;
  }
  await logEvent(remaining ? "placement" : "placement_cancelled", by, remaining ? "unconfirmed" : "cancelled", eventContext(existing), { by, remaining });
}

/** Admin cancels or restores a placement by id. */
export async function setPlacementCancelled(id: string, cancelled: boolean): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("mms_placements")
    .update({ cancelled_at: cancelled ? now : null, updated_at: now })
    .eq("id", id)
    .select(PLACEMENT_COLUMNS)
    .maybeSingle();
  if (error || !data) return false;
  const p = data as PlacementRow;
  await logEvent(cancelled ? "placement_cancelled" : "placement", "admin", cancelled ? "cancelled" : "restored", eventContext(p));
  return true;
}

export async function getPlacementByConsentToken(token: string): Promise<PlacementRow | null | "off"> {
  if (!TRACKER_TOKEN_RE.test(token)) return null;
  const { data, error } = await db().from("mms_placements").select(PLACEMENT_COLUMNS).eq("consent_token", token).maybeSingle();
  if (error) {
    if (isTrackingSchemaMissing(error)) return "off";
    console.error("[placements] consent lookup failed:", error.message);
    return null;
  }
  return (data as PlacementRow | null) ?? null;
}

/** Records the job seeker's case-study answer, with the time and the exact wording. */
export async function setMarketingConsent(p: PlacementRow, yes: boolean): Promise<boolean> {
  const now = new Date().toISOString();
  const patch = yes
    ? { marketing_consent: true, marketing_consent_at: now, marketing_consent_text: MARKETING_CONSENT_TEXT, marketing_consent_answered_at: now, marketing_consent_withdrawn_at: null, updated_at: now }
    : {
        marketing_consent: false,
        marketing_consent_answered_at: now,
        marketing_consent_withdrawn_at: p.marketing_consent ? now : p.marketing_consent_withdrawn_at,
        updated_at: now,
      };
  const { error } = await db().from("mms_placements").update(patch).eq("id", p.id);
  if (error) {
    console.error("[placements] consent save failed:", error.message);
    return false;
  }
  await logEvent("marketing_consent", "candidate", yes ? "yes" : p.marketing_consent ? "withdrawn" : "no", eventContext(p), yes ? { text: MARKETING_CONSENT_TEXT } : undefined);
  return true;
}
