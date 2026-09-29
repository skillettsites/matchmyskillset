// Journey tracking storage (supabase/migrations/010_tracking.sql): the event
// log and funnel stages. Server code only, service role only.
//
// Everything here fails soft until 010 is applied: writes are skipped with a
// log line, and readers get `ready: false` so pages can say the feature is not
// switched on yet. Tracking must never break applying, the employer dashboard
// or the check-in emails themselves.

import { cache } from "react";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Stage } from "./constants";

export const TRACKING_OFF = "Application tracking is not switched on yet. Please try again later.";

/** Postgres / PostgREST codes for a missing table, column or function: migration 010 is not applied yet. */
export function isTrackingSchemaMissing(error: { code?: string } | null | undefined): boolean {
  return Boolean(error && ["42P01", "PGRST205", "42703", "PGRST204", "42883", "PGRST202"].includes(error.code || ""));
}

export function db() {
  return createAdminClient();
}

/** True once migration 010 is applied (checked once per request). */
export const trackingReady = cache(async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  // Not a HEAD request: PostgREST answers HEAD on a missing table with 204 and no error.
  const { error } = await db().from("mms_tracked_applications").select("id").limit(1);
  if (error && !isTrackingSchemaMissing(error)) console.error("[tracking] check failed:", error.message);
  return !error;
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type EventSource = "employer" | "candidate" | "admin" | "system";

export type EventKind =
  | "status"
  | "stage"
  | "tracked"
  | "checkin_sent"
  | "checkin_answer"
  | "tracker_update"
  | "checkins_stopped"
  | "placement"
  | "placement_cancelled"
  | "marketing_consent";

/** Who and what an event is about. Never a name or an email address: only the keyed hash. */
export interface EventContext {
  applicationId?: string | null;
  trackedId?: string | null;
  placementId?: string | null;
  jobId?: string | null;
  /** The employer account. */
  accountId?: string | null;
  emailHash?: string | null;
  candidateId?: string | null;
  candidateAccountId?: string | null;
  field?: string | null;
  channel?: "mms" | "external" | null;
  isTest?: boolean;
}

function contextColumns(c: EventContext) {
  return {
    application_id: c.applicationId ?? null,
    tracked_id: c.trackedId ?? null,
    placement_id: c.placementId ?? null,
    job_id: c.jobId ?? null,
    account_id: c.accountId ?? null,
    candidate_email_hash: c.emailHash ?? null,
    candidate_id: c.candidateId ?? null,
    candidate_account_id: c.candidateAccountId ?? null,
    field: c.field ?? null,
    channel: c.channel ?? null,
    is_test: Boolean(c.isTest),
  };
}

/** Appends one event. Never throws. */
export async function logEvent(kind: EventKind, source: EventSource, status: string | null, ctx: EventContext, detail?: Record<string, unknown>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await db()
      .from("mms_journey_events")
      .insert({ kind, source, status, ...contextColumns(ctx), detail: detail ?? null });
    if (error) {
      if (isTrackingSchemaMissing(error)) console.info(`[tracking] event ${kind} not saved: migration 010 not applied`);
      else console.error(`[tracking] event ${kind} failed:`, error.message);
    }
  } catch (err) {
    console.error(`[tracking] event ${kind} failed:`, err instanceof Error ? err.message : err);
  }
}

const STAGE_ORDER: Stage[] = ["applied", "interview", "offer", "placed"];

/**
 * Records that an application reached a funnel stage, once per application
 * (the unique stage_key + status drops repeats). Reaching an offer or a
 * placement also counts the stages before it, back to interview, so the
 * funnel never shows more offers than interviews. "applied" is never implied.
 * `key` is app:<application id> for applications made through us,
 * trk:<tracked id> for outside jobs and plc:<placement id> for placements
 * admin recorded with neither. Never throws.
 */
export async function reachStage(key: string, stage: Stage, source: EventSource, ctx: EventContext): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const stages = stage === "applied" ? (["applied"] as Stage[]) : STAGE_ORDER.slice(1, STAGE_ORDER.indexOf(stage) + 1);
  const rows = stages.map((s) => ({
    kind: "stage",
    source,
    status: s,
    stage_key: key,
    ...contextColumns(ctx),
    detail: s === stage ? null : { implied_by: stage },
  }));
  try {
    const { error } = await db().from("mms_journey_events").upsert(rows, { onConflict: "stage_key,status", ignoreDuplicates: true });
    if (error) {
      if (isTrackingSchemaMissing(error)) console.info(`[tracking] stage ${stage} not saved: migration 010 not applied`);
      else console.error(`[tracking] stage ${stage} failed:`, error.message);
    }
  } catch (err) {
    console.error(`[tracking] stage ${stage} failed:`, err instanceof Error ? err.message : err);
  }
}

/** The stage key for an application made through us, or an outside job. */
export function stageKey(opts: { applicationId?: string | null; trackedId?: string | null; placementId?: string | null }): string {
  if (opts.applicationId) return `app:${opts.applicationId}`;
  if (opts.trackedId) return `trk:${opts.trackedId}`;
  return `plc:${opts.placementId}`;
}
