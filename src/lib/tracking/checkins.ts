// The daily tracking run (/api/cron/tracker-checkins). Server code only.
//
// 1. "Did you hear back?" emails, 7 and 21 days after applying. Each row is
//    claimed before sending with a conditional update (checkins_sent must
//    still be the number we read and the row still due), so two overlapping
//    runs never send the same email twice. A failed send is put back so the
//    next run tries again. If the 7-day email goes out late, the 21-day one is
//    held back at least 3 days so nobody gets two in a row.
// 2. The case-study question, about a day after a placement is recorded (so an
//    employer's mistaken "hired" can be undone first). Claimed the same way.
// 3. Retention: tracked applications past delete_after (12 months) are
//    deleted, placement email addresses past email_purge_after (12 months) are
//    cleared, events older than 24 months and placements older than 6 years
//    are deleted. /privacy (TrackingPrivacy.tsx) states these periods.

import { db, isTrackingSchemaMissing, logEvent } from "./db";
import { CHECKIN_DAYS } from "./constants";
import { TRACKED_COLUMNS, type TrackedRow } from "./tracker";
import { PLACEMENT_COLUMNS, type PlacementRow } from "./placements";
import { sendCheckin, sendPlacementConsent } from "./emails";
import { checkinUrl, consentUrl, trackerUrl, unsubscribeUrl, whereApplied } from "./links";
import { newTrackerToken, trackerKeyReady } from "./sign";

const DAY = 86_400_000;
/** Stop starting new sends after this long, to stay inside the function's time limit. */
const TIME_BUDGET_MS = 240_000;
/** Events are pseudonymous (no names or addresses); keep them this long for trends. */
const EVENT_RETENTION_DAYS = 730;
/** Placements can be the basis of a pay-per-hire fee, kept for tax: 6 years. */
const PLACEMENT_RETENTION_DAYS = 6 * 365 + 2;
/** The case-study question waits this long after a placement is recorded. */
const CONSENT_DELAY_MS = DAY;

export interface CheckinSummary {
  off?: boolean;
  due: number;
  sent: number;
  failed: number;
  skipped: number;
  consentDue: number;
  consentSent: number;
  consentFailed: number;
  purged?: { tracked: number; emailsCleared: number; events: number; placements: number };
  dryRun: boolean;
  sample?: { id: string; n: number; job: string }[];
}

function dateText(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Europe/London" });
}

export async function runTrackingJobs(opts: { base: string; limit: number; dryRun: boolean; purge: boolean }): Promise<CheckinSummary> {
  const started = Date.now();
  const summary: CheckinSummary = { due: 0, sent: 0, failed: 0, skipped: 0, consentDue: 0, consentSent: 0, consentFailed: 0, dryRun: opts.dryRun };
  if (!trackerKeyReady()) throw new Error("No TRACKER_SECRET or SUPABASE_SERVICE_ROLE_KEY: check-in links cannot be signed");
  const client = db();
  const nowIso = new Date().toISOString();

  // 1. Check-ins
  const due = await client
    .from("mms_tracked_applications")
    .select(TRACKED_COLUMNS)
    .lte("next_checkin_at", nowIso)
    .is("checkins_stopped_at", null)
    .lt("checkins_sent", CHECKIN_DAYS.length)
    .not("status", "in", "(placed,withdrawn)")
    .order("next_checkin_at", { ascending: true })
    .limit(opts.limit);
  if (due.error) {
    if (isTrackingSchemaMissing(due.error)) return { ...summary, off: true };
    throw new Error(`due check-ins read failed: ${due.error.message}`);
  }
  const rows = (due.data ?? []) as TrackedRow[];
  summary.due = rows.length;
  if (opts.dryRun) summary.sample = rows.slice(0, 20).map((r) => ({ id: r.id, n: r.checkins_sent + 1, job: r.job_title }));

  for (const row of opts.dryRun ? [] : rows) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    const n = (row.checkins_sent + 1) as 1 | 2;
    const now = Date.now();
    // After the 7-day email, the 21-day one; after that, none.
    const next = n === 1 ? new Date(Math.max(Date.parse(row.applied_at) + CHECKIN_DAYS[1] * DAY, now + 3 * DAY)).toISOString() : null;
    const claim = await client
      .from("mms_tracked_applications")
      .update({ checkins_sent: n, last_checkin_at: new Date(now).toISOString(), next_checkin_at: next, updated_at: new Date(now).toISOString() })
      .eq("id", row.id)
      .eq("checkins_sent", row.checkins_sent)
      .is("checkins_stopped_at", null)
      .lte("next_checkin_at", nowIso)
      .select("id");
    if (claim.error || (claim.data ?? []).length === 0) {
      summary.skipped += 1;
      continue;
    }
    const answers = {
      no_response: checkinUrl(opts.base, row.id, "no_response"),
      interview: checkinUrl(opts.base, row.id, "interview"),
      offer: checkinUrl(opts.base, row.id, "offer"),
      placed: checkinUrl(opts.base, row.id, "placed"),
      stop: checkinUrl(opts.base, row.id, "stop"),
    };
    const sent = await sendCheckin(row.email, {
      base: opts.base,
      n,
      job: { title: row.job_title, company: row.company },
      appliedOn: dateText(row.applied_at),
      where: whereApplied(row.source, row.job_source),
      answers,
      trackerUrl: trackerUrl(opts.base, row.manage_token),
      stopAllUrl: checkinUrl(opts.base, row.id, "stopall"),
      unsubscribeUrl: unsubscribeUrl(opts.base, row.id),
    });
    if (!sent.ok) {
      summary.failed += 1;
      // Put it back so the next run tries again.
      await client
        .from("mms_tracked_applications")
        .update({ checkins_sent: row.checkins_sent, last_checkin_at: row.last_checkin_at, next_checkin_at: row.next_checkin_at })
        .eq("id", row.id)
        .eq("checkins_sent", n);
      continue;
    }
    summary.sent += 1;
    await logEvent(
      "checkin_sent",
      "system",
      String(n),
      {
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
      },
      { email_id: sent.id, skipped: sent.skipped ?? false }
    );
  }

  // 2. Case-study questions after placements
  const consentCutoff = new Date(Date.now() - CONSENT_DELAY_MS).toISOString();
  const consentDue = await client
    .from("mms_placements")
    .select(PLACEMENT_COLUMNS)
    .is("consent_requested_at", null)
    .is("cancelled_at", null)
    .not("candidate_email", "is", null)
    .lte("created_at", consentCutoff)
    .order("created_at", { ascending: true })
    .limit(Math.min(opts.limit, 50));
  if (consentDue.error) {
    if (!isTrackingSchemaMissing(consentDue.error)) console.error("[tracking] consent read failed:", consentDue.error.message);
  } else {
    const placements = (consentDue.data ?? []) as PlacementRow[];
    summary.consentDue = placements.length;
    for (const p of opts.dryRun ? [] : placements) {
      if (Date.now() - started > TIME_BUDGET_MS) break;
      const token = p.consent_token ?? newTrackerToken();
      const claim = await client
        .from("mms_placements")
        .update({ consent_requested_at: new Date().toISOString(), consent_token: token, updated_at: new Date().toISOString() })
        .eq("id", p.id)
        .is("consent_requested_at", null)
        .select("id");
      if (claim.error || (claim.data ?? []).length === 0) continue;
      const sent = await sendPlacementConsent(p.candidate_email as string, {
        base: opts.base,
        job: { title: p.job_title, company: p.company },
        consentUrl: consentUrl(opts.base, token),
      });
      if (!sent.ok) {
        summary.consentFailed += 1;
        await client.from("mms_placements").update({ consent_requested_at: null }).eq("id", p.id);
        continue;
      }
      summary.consentSent += 1;
      await logEvent(
        "marketing_consent",
        "system",
        "asked",
        { placementId: p.id, applicationId: p.application_id, trackedId: p.tracked_id, jobId: p.job_id, accountId: p.employer_account_id, emailHash: p.candidate_email_hash, field: p.field, isTest: p.is_test },
        { email_id: sent.id }
      );
    }
  }

  // 3. Retention
  if (opts.purge && !opts.dryRun) {
    const now = new Date().toISOString();
    const tracked = await client.from("mms_tracked_applications").delete().lt("delete_after", now).select("id");
    const cleared = await client.from("mms_placements").update({ candidate_email: null }).lt("email_purge_after", now).not("candidate_email", "is", null).select("id");
    const events = await client
      .from("mms_journey_events")
      .delete()
      .lt("created_at", new Date(Date.now() - EVENT_RETENTION_DAYS * DAY).toISOString())
      .select("id");
    const oldPlacements = await client
      .from("mms_placements")
      .delete()
      .lt("created_at", new Date(Date.now() - PLACEMENT_RETENTION_DAYS * DAY).toISOString())
      .select("id");
    for (const r of [tracked, cleared, events, oldPlacements]) if (r.error) console.error("[tracking] purge failed:", r.error.message);
    summary.purged = {
      tracked: tracked.data?.length ?? 0,
      emailsCleared: cleared.data?.length ?? 0,
      events: events.data?.length ?? 0,
      placements: oldPlacements.data?.length ?? 0,
    };
  }

  return summary;
}
