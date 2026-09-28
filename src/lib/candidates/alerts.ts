// Job alerts: sets one up from a results link, and runs the due ones (the
// cron job). Server-side only.
//
// A run is safe to repeat: each alert is claimed by setting last_sent_at only
// if it has not run since the cutoff, so an overlapping or duplicate run skips
// it; a failed email hands the claim back so the next run tries again. Only
// jobs whose keys are not in sent_job_keys are sent, so nobody gets the same
// job twice.

import type { ReportRow } from "@/lib/apis/reports-db";
import { isMatchesDoc, isSkillsDoc, type ProfileSkill } from "@/lib/skills/profile";
import { isSkillId } from "@/lib/skills/taxonomy";
import { buildAnchors, gatherForAnchors, placeFromDoc, snapshotFrom, type MatchedJob } from "@/lib/apis/jobs/match";
import type { FitAnchor } from "@/lib/apis/jobs/fit";
import { claimAlert, dueAlerts, releaseAlert, updateAlert, type AlertQuery, type AlertRow } from "./db";
import { sendAlertDigest, type AlertJob } from "./emails";

/** Anchors kept on an alert: the person's own job and the top three career matches. */
const ALERT_ANCHORS = 4;
/** Only good matches are emailed. */
export const ALERT_MIN_MATCH = 50;
const ALERT_MAX_JOBS = 10;
const SENT_KEYS_KEPT = 500;

export function alertQueryFromReport(report: ReportRow): { query: AlertQuery; skills: ProfileSkill[]; seenKeys: string[] } | null {
  const doc = isSkillsDoc(report.skills) ? report.skills : null;
  if (!doc) return null;
  const items = isMatchesDoc(report.matches) ? report.matches.items : [];
  const anchors: FitAnchor[] = buildAnchors(doc, items).slice(0, ALERT_ANCHORS);
  const snapshot = snapshotFrom(report.matches);
  return {
    query: { anchors, place: placeFromDoc(doc), remote: doc.preferences.wantRemote, salaryMin: null },
    // Skill ids and strengths only: the notes on where each skill shows in the CV stay with the results.
    skills: doc.skills.map((s) => ({ id: s.id, strength: s.strength })),
    seenKeys: (snapshot?.jobs ?? []).map((j) => j.key),
  };
}

export function whereText(q: AlertQuery): string {
  const p = q.place;
  if (!p) return "across the UK and remote";
  return p.kind === "region" ? `in ${p.label} and remote` : `near ${p.label} and remote`;
}

function readSkills(value: unknown): ProfileSkill[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is ProfileSkill => Boolean(s && typeof s === "object" && isSkillId((s as ProfileSkill).id)))
    .map((s) => ({ id: s.id, strength: s.strength === "strong" ? "strong" : "some" }));
}

function toAlertJob(j: MatchedJob): AlertJob {
  return { title: j.title, company: j.company, location: j.location, salary: j.salary, match: j.match, reason: j.reason, url: j.url, sourceLabel: j.sourceLabel };
}

/** New jobs for one alert, best first, without anything sent before. */
export async function newJobsForAlert(alert: AlertRow): Promise<MatchedJob[]> {
  const q = alert.query;
  if (!q || !Array.isArray(q.anchors) || q.anchors.length === 0) return [];
  const snapshot = await gatherForAnchors({
    anchors: q.anchors,
    skills: readSkills(alert.skills),
    wantRemote: Boolean(q.remote),
    place: q.place ?? null,
    forAlert: true,
  });
  const sent = new Set(alert.sent_job_keys ?? []);
  return snapshot.jobs
    .filter((j) => !sent.has(j.key) && j.match >= ALERT_MIN_MATCH)
    .filter((j) => !q.salaryMin || (j.salaryMax ?? j.salaryMin ?? 0) >= q.salaryMin)
    .sort((a, b) => Number(b.source === "mms") - Number(a.source === "mms") || b.match - a.match)
    .slice(0, ALERT_MAX_JOBS);
}

export interface RunSummary {
  frequency: "daily" | "weekly";
  dryRun: boolean;
  due: number;
  claimed: number;
  sent: number;
  nothingNew: number;
  failed: number;
  skipped: number;
  details: { id: string; email: string; jobs: { title: string; company: string; match: number }[]; result: string }[];
}

function maskEmail(e: string): string {
  const [user, domain] = e.split("@");
  return `${(user ?? "").slice(0, 2)}***@${domain ?? ""}`;
}

/**
 * Runs the alerts of one frequency that are due. Daily alerts are due when
 * they have not run for 20 hours, weekly ones after 6 days (so a run a few
 * minutes late, or a missed run, still sends).
 */
export async function runDueAlerts({ frequency, dryRun, limit }: { frequency: "daily" | "weekly"; dryRun: boolean; limit: number }): Promise<RunSummary> {
  const hours = frequency === "daily" ? 20 : 6 * 24;
  const cutoffIso = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const due = await dueAlerts(frequency, cutoffIso, limit);
  const summary: RunSummary = { frequency, dryRun, due: due.length, claimed: 0, sent: 0, nothingNew: 0, failed: 0, skipped: 0, details: [] };

  for (const alert of due) {
    const nowIso = new Date().toISOString();
    if (!dryRun) {
      const claimed = await claimAlert(alert.id, cutoffIso, nowIso);
      if (!claimed) {
        summary.skipped++;
        continue;
      }
      summary.claimed++;
    }
    let jobs: MatchedJob[] = [];
    try {
      jobs = await newJobsForAlert(alert);
    } catch (err) {
      console.error("[alerts] search failed:", err instanceof Error ? err.message : err);
      if (!dryRun) await releaseAlert(alert.id, alert.last_sent_at);
      summary.failed++;
      summary.details.push({ id: alert.id, email: maskEmail(alert.email), jobs: [], result: "search failed" });
      continue;
    }
    const brief = jobs.map((j) => ({ title: j.title, company: j.company, match: j.match }));
    if (jobs.length === 0) {
      summary.nothingNew++;
      summary.details.push({ id: alert.id, email: maskEmail(alert.email), jobs: [], result: "nothing new" });
      continue;
    }
    if (dryRun) {
      summary.details.push({ id: alert.id, email: maskEmail(alert.email), jobs: brief, result: "would send" });
      continue;
    }
    const mail = await sendAlertDigest(alert.email, { manageToken: alert.manage_token, jobs: jobs.map(toAlertJob), where: whereText(alert.query!) });
    if (!mail.ok) {
      await releaseAlert(alert.id, alert.last_sent_at);
      summary.failed++;
      summary.details.push({ id: alert.id, email: maskEmail(alert.email), jobs: brief, result: `email failed: ${mail.error ?? "unknown"}` });
      continue;
    }
    const keys = [...jobs.map((j) => j.key), ...(alert.sent_job_keys ?? [])].slice(0, SENT_KEYS_KEPT);
    await updateAlert(alert.id, { sent_job_keys: keys });
    summary.sent++;
    summary.details.push({ id: alert.id, email: maskEmail(alert.email), jobs: brief, result: `sent ${mail.id ?? ""}`.trim() });
  }
  return summary;
}
