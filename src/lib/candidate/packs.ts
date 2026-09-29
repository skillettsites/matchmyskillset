// Job packs: create, read, write with Claude, check, save edits, delete.
// Server code only.
//
// Life of a pack (mms_job_packs.status):
//   awaiting_payment  a £2.99 pack waiting for Stripe (deleted after a day if unpaid)
//   queued            paid for, or covered by the free CV or Plus: ready to write
//   generating        claimed by one writer (a claim older than 5 minutes can be taken over)
//   ready             written and checked
//   failed            the writer gave up; tried again up to 3 times in all
//
// Writing is idempotent: the pack page and the Stripe webhook may both ask
// for it, and only the caller that wins the claim (one conditional UPDATE)
// calls Claude. A free tailored CV ("cv" scope) can later become a full pack
// (cover letter and interview prep): only the missing parts are written.

import { after } from "next/server";
import { randomToken } from "@/lib/employer/server";
import { notifyOwner } from "@/lib/employer/telegram";
import { SITE_URL } from "@/components/site";
import type { CallUsage } from "@/lib/apis/claude";
import { CLAUDE_MODEL, NotACvError, addUsage, writeExtras, writeTailoredCv } from "./pack-ai";
import { groundCv, groundExtras } from "./grounding";
import { packFit, resultsProfile, skillCheck, skillIdsOf } from "./job-source";
import { readChecks, readCv, readFit, readGaps, readJob, readLetter, readPrep } from "./sanitize";
import { releaseFreePack, releasePlusPack } from "./entitlements";
import { sendPackReady } from "./email";
import { PACK_PRODUCT } from "./plans";
import { db, isMissingObject, PACK_COLUMNS, PACK_TOKEN_RE, raise, type PackRow } from "./db";
import type { Gap, PackChecks, PackJob, PackView, TailoredCv, InterviewPrep, PackFit } from "./pack-types";

export const MAX_ATTEMPTS = 3;
const NOT_A_CV = "not_a_cv";
const STALE_CLAIM_MS = 5 * 60_000;
export const GUEST_PACK_DAYS = 365;
export const UNPAID_PACK_HOURS = 24;

export function newPackToken(): string {
  return randomToken(24);
}

export function guestExpiry(): string {
  return new Date(Date.now() + GUEST_PACK_DAYS * 86_400_000).toISOString();
}

export function unpaidExpiry(): string {
  return new Date(Date.now() + UNPAID_PACK_HOURS * 3_600_000).toISOString();
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

function live(row: PackRow | null): PackRow | null {
  if (!row) return null;
  if (row.expires_at && Date.parse(row.expires_at) < Date.now()) return null;
  return row;
}

/** The pack behind a private link, or null. Throws NotSwitchedOnError before migration 009. */
export async function getPack(token: string): Promise<PackRow | null> {
  if (!PACK_TOKEN_RE.test(token)) return null;
  const { data, error } = await db().from("mms_job_packs").select(PACK_COLUMNS).eq("token", token).maybeSingle();
  if (error) raise(error, "pack read failed");
  return live(data as unknown as PackRow | null);
}

export async function getPackById(id: string): Promise<PackRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("mms_job_packs").select(PACK_COLUMNS).eq("id", id).maybeSingle();
  if (error) raise(error, "pack read failed");
  return data as unknown as PackRow | null;
}

export async function insertPack(fields: Record<string, unknown>): Promise<PackRow> {
  const { data, error } = await db().from("mms_job_packs").insert(fields).select(PACK_COLUMNS).single();
  if (error) raise(error, "pack insert failed");
  scheduleCleanup();
  return data as unknown as PackRow;
}

export async function updatePack(id: string, fields: Record<string, unknown>): Promise<PackRow> {
  const { data, error } = await db()
    .from("mms_job_packs")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PACK_COLUMNS)
    .single();
  if (error) raise(error, "pack update failed");
  return data as unknown as PackRow;
}

export async function deletePack(id: string): Promise<void> {
  const { error } = await db().from("mms_job_packs").delete().eq("id", id);
  if (error) raise(error, "pack delete failed");
}

export interface PackSummary {
  token: string;
  createdAt: string;
  title: string;
  company: string;
  status: PackRow["status"];
  scope: PackRow["scope"];
  approved: boolean;
}

function summary(row: Pick<PackRow, "token" | "created_at" | "job" | "status" | "scope" | "approved_at">): PackSummary {
  const job = readJob(row.job);
  return { token: row.token, createdAt: row.created_at, title: job.title, company: job.company, status: row.status, scope: row.scope, approved: Boolean(row.approved_at) };
}

const SUMMARY_COLUMNS = "token, created_at, job, status, scope, approved_at, expires_at";

/** Packs in an account, newest first (unpaid drafts left out). */
export async function listAccountPacks(accountId: string): Promise<PackSummary[]> {
  const { data, error } = await db()
    .from("mms_job_packs")
    .select(SUMMARY_COLUMNS)
    .eq("account_id", accountId)
    .neq("status", "awaiting_payment")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) raise(error, "pack list failed");
  return (data ?? []).map((r) => summary(r as unknown as PackRow));
}

/** Packs made from a results page (guests find theirs there). Never throws. */
export async function listResultsPacks(resultsToken: string): Promise<PackSummary[]> {
  try {
    const { data, error } = await db()
      .from("mms_job_packs")
      .select(SUMMARY_COLUMNS)
      .eq("results_token", resultsToken)
      .neq("status", "awaiting_payment")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return [];
    return (data ?? []).filter((r) => live(r as unknown as PackRow)).map((r) => summary(r as unknown as PackRow));
  } catch {
    return [];
  }
}

/** What the pack page shows. Never includes the CV text the pack was written from. */
export function toView(row: PackRow): PackView {
  return {
    token: row.token,
    status: row.status,
    scope: row.scope,
    paidVia: row.paid_via,
    upgradePaidVia: row.upgrade_paid_via,
    job: readJob(row.job),
    fit: readFit(row.fit),
    tailoredCv: readCv(row.tailored_cv),
    coverLetter: readLetter(row.cover_letter),
    interviewPrep: readPrep(row.interview_prep),
    gaps: readGaps(row.gaps),
    checks: readChecks(row.checks),
    error: row.error,
    createdAt: row.created_at,
    generatedAt: row.generated_at,
    approvedAt: row.approved_at,
    expiresAt: row.expires_at,
    hasAccount: Boolean(row.account_id),
    extrasPending: row.scope === "full" && Boolean(row.tailored_cv) && !row.cover_letter,
    canRetry: row.status === "failed" && row.attempts < MAX_ATTEMPTS && row.error !== NOT_A_CV,
  };
}

// ---------------------------------------------------------------------------
// Writing a pack
// ---------------------------------------------------------------------------

/** True when there is something to write and it is not being written right now. */
export function needsWork(row: PackRow, now = Date.now()): boolean {
  const missing = !row.tailored_cv || (row.scope === "full" && !row.cover_letter);
  if (!missing) return false;
  if (row.status === "queued") return true;
  if (row.status === "generating") return !row.claimed_at || now - Date.parse(row.claimed_at) > STALE_CLAIM_MS;
  if (row.status === "failed") return row.attempts < MAX_ATTEMPTS && row.error !== NOT_A_CV;
  return false;
}

/** One conditional UPDATE: only one caller gets the pack. */
async function claim(row: PackRow): Promise<PackRow | null> {
  const now = new Date();
  const stale = new Date(now.getTime() - STALE_CLAIM_MS).toISOString();
  const { data, error } = await db()
    .from("mms_job_packs")
    .update({ status: "generating", claimed_at: now.toISOString(), attempts: row.attempts + 1, error: null, updated_at: now.toISOString() })
    .eq("id", row.id)
    .eq("attempts", row.attempts)
    .or(`status.eq.queued,and(status.eq.generating,claimed_at.lt."${stale}"),and(status.eq.failed,attempts.lt.${MAX_ATTEMPTS})`)
    .select(PACK_COLUMNS)
    .maybeSingle();
  if (error) raise(error, "pack claim failed");
  return data as unknown as PackRow | null;
}

export const PACK_ERRORS: Record<string, string> = {
  [NOT_A_CV]: "The text we were given does not look like a CV, so we could not tailor it.",
  failed: "We could not finish writing your pack just now.",
};

interface UsageRun {
  at: string;
  parts: string[];
  wallMs: number;
  cvMs?: number;
  extrasMs?: number;
  usage: CallUsage | null;
}

function usageRuns(v: unknown): UsageRun[] {
  const runs = v && typeof v === "object" ? (v as { runs?: unknown }).runs : null;
  return Array.isArray(runs) ? (runs as UsageRun[]).slice(-10) : [];
}

function mergeGaps(...lists: Gap[][]): Gap[] {
  const seen = new Set<string>();
  const out: Gap[] = [];
  for (const g of lists.flat()) {
    const k = g.requirement.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(g);
  }
  return out.slice(0, 12);
}

/**
 * Writes whatever the pack is missing, if it needs it and this caller wins
 * the claim. Returns the pack as it stands afterwards.
 */
export async function runGeneration(token: string): Promise<PackRow | null> {
  const row = await getPack(token);
  if (!row || !needsWork(row)) return row;
  const claimed = await claim(row);
  if (!claimed) return getPack(token);
  return writeClaimed(claimed);
}

async function writeClaimed(row: PackRow): Promise<PackRow> {
  const job: PackJob = readJob(row.job);
  const cvText = row.source_cv_text ?? "";
  const needCv = !row.tailored_cv;
  const needExtras = row.scope === "full" && !row.cover_letter;
  const profile = await resultsProfile(row.results_token);
  const check = skillCheck(job, cvText, profile);
  const aiInput = { cvText, job };
  const advertText = [job.title, job.company, job.location ?? "", job.salary ?? "", job.description].join("\n");
  const started = Date.now();

  const [cvRes, exRes] = await Promise.allSettled([needCv ? writeTailoredCv(aiInput) : Promise.resolve(null), needExtras ? writeExtras(aiInput) : Promise.resolve(null)]);

  const fields: Record<string, unknown> = {};
  const prior: PackChecks = readChecks(row.checks) ?? { changes: [], removed: [], review: [] };
  let checks: PackChecks = prior;
  let usage: CallUsage | null = null;
  const run: UsageRun = { at: new Date().toISOString(), parts: [], wallMs: 0, usage: null };
  let failure: unknown = null;

  if (cvRes.status === "fulfilled" && cvRes.value) {
    const r = cvRes.value;
    const g = groundCv(r.cv, { cvText, advertText, cvSkillIds: check.cvSkillIds, skillIdsOf });
    fields.tailored_cv = g.cv;
    fields.gaps = mergeGaps(r.gaps, g.newGaps);
    checks = {
      changes: r.changes,
      removed: [...prior.removed.filter((x) => x.where === "Cover letter" || x.where === "Interview prep"), ...g.removed],
      review: [...prior.review.filter((x) => x.startsWith("Cover letter:")), ...g.review],
    };
    usage = addUsage(usage, r.usage);
    run.parts.push("cv");
    run.cvMs = r.ms;
  } else if (cvRes.status === "rejected") {
    failure = cvRes.reason;
  }

  if (exRes.status === "fulfilled" && exRes.value) {
    const r = exRes.value;
    const g = groundExtras(r.coverLetter, r.prep, { cvText, advertText, jobTitle: job.title, company: job.company });
    fields.cover_letter = g.coverLetter;
    fields.interview_prep = g.prep;
    checks = {
      ...checks,
      removed: [...checks.removed.filter((x) => x.where !== "Cover letter" && x.where !== "Interview prep"), ...g.removed],
      review: [...checks.review.filter((x) => !x.startsWith("Cover letter:")), ...g.review],
    };
    usage = addUsage(usage, r.usage);
    run.parts.push("extras");
    run.extrasMs = r.ms;
  } else if (exRes.status === "rejected") {
    failure = failure ?? exRes.reason;
  }

  run.wallMs = Date.now() - started;
  run.usage = usage;
  fields.checks = checks;
  fields.model = CLAUDE_MODEL;
  fields.usage = { runs: [...usageRuns(row.usage), run] };
  if (!row.fit) fields.fit = packFit(job, profile, check);
  console.info(
    `[packs] ${row.id} wrote ${run.parts.join("+") || "nothing"} in ${run.wallMs} ms` +
      (usage ? `, ${usage.inputTokens} in / ${usage.outputTokens} out / ${usage.cacheReadTokens} cache read / ${usage.cacheWriteTokens} cache write tokens, $${usage.costUsd}` : "")
  );

  if (!failure) {
    const done = await updatePack(row.id, { ...fields, status: "ready", error: null, generated_at: new Date().toISOString() });
    after(() => emailIfNeeded(done));
    return done;
  }

  const notCv = failure instanceof NotACvError;
  const message = notCv ? NOT_A_CV : failure instanceof Error ? failure.message.slice(0, 200) : "failed";
  console.error(`[packs] ${row.id} attempt ${row.attempts} failed: ${message}`);
  const failed = await updatePack(row.id, { ...fields, status: "failed", error: notCv ? NOT_A_CV : "failed" });
  if (notCv || failed.attempts >= MAX_ATTEMPTS) await giveUp(failed, message);
  return failed;
}

/** The pack cannot be written: give back what it used, and tell Dave about any payment. */
async function giveUp(row: PackRow, reason: string): Promise<void> {
  const cvMissing = !row.tailored_cv;
  if (row.account_id && cvMissing && row.paid_via === "free") await releaseFreePack(row.account_id);
  if (row.account_id && cvMissing && row.paid_via === "plus") await releasePlusPack(row.account_id, row.id);
  if (row.account_id && !cvMissing && row.upgrade_paid_via === "plus") await releasePlusPack(row.account_id, row.id);
  const paid = (cvMissing && row.paid_via === "one_off") || (!cvMissing && row.upgrade_paid_via === "one_off");
  if (paid) {
    await notifyOwner(
      ["MatchMySkillset: a paid job pack could not be written", `Pack ${row.id}`, `Reason: ${reason}`, "Check it and decide on a refund (nothing has been refunded)."],
      [{ text: "Open the pack", url: `${SITE_URL}/packs/${row.token}` }]
    );
  }
}

/** Emails the link for a paid £2.99 pack once it is ready (people often leave the page while it is written). */
async function emailIfNeeded(row: PackRow): Promise<void> {
  const paidOnce = row.paid_via === "one_off" || row.upgrade_paid_via === "one_off";
  if (!paidOnce || row.emailed_at || !row.email || row.status !== "ready") return;
  const job = readJob(row.job);
  const sent = await sendPackReady(row.email, {
    url: `${SITE_URL}/packs/${row.token}`,
    title: job.title,
    company: job.company,
    full: row.scope === "full",
    guest: !row.account_id,
  });
  if (sent.ok) {
    try {
      await db().from("mms_job_packs").update({ emailed_at: new Date().toISOString() }).eq("id", row.id);
    } catch {
      // the email went; the flag is only there to avoid a second one
    }
  }
}

// ---------------------------------------------------------------------------
// Edits
// ---------------------------------------------------------------------------

export interface PackEdits {
  tailoredCv?: TailoredCv | null;
  coverLetter?: string | null;
  interviewPrep?: InterviewPrep | null;
  approve?: boolean;
}

export async function saveEdits(row: PackRow, edits: PackEdits): Promise<PackRow> {
  const fields: Record<string, unknown> = {};
  if (edits.tailoredCv && row.tailored_cv) fields.tailored_cv = edits.tailoredCv;
  if (edits.coverLetter !== undefined && edits.coverLetter !== null && row.cover_letter !== null) fields.cover_letter = edits.coverLetter;
  if (edits.interviewPrep && row.interview_prep) fields.interview_prep = edits.interviewPrep;
  if (edits.approve) fields.approved_at = new Date().toISOString();
  return updatePack(row.id, fields);
}

// ---------------------------------------------------------------------------
// Purchases (the 6-year record in mms_purchases) and housekeeping
// ---------------------------------------------------------------------------

/** Records a paid pack in mms_purchases, once per Stripe session. Never throws. */
export async function recordPackPurchase(opts: { sessionId: string; email: string | null; amountPence: number | null; currency: string | null; consentAt: string | null; consentText: string | null }): Promise<void> {
  const row: Record<string, unknown> = {
    stripe_session_id: opts.sessionId,
    email: opts.email,
    amount_pence: opts.amountPence,
    currency: opts.currency,
    status: "paid",
    product: PACK_PRODUCT,
    digital_content_consent_at: opts.consentAt,
    digital_content_consent_text: opts.consentText,
  };
  try {
    let { error } = await db().from("mms_purchases").upsert(row, { onConflict: "stripe_session_id" });
    if (error && isMissingObject(error)) {
      // Before 009 (product) or 005 (consent columns): keep the record without them.
      const { product: _p, digital_content_consent_at: _a, digital_content_consent_text: _t, ...rest } = row;
      void _p;
      void _a;
      void _t;
      ({ error } = await db().from("mms_purchases").upsert(rest, { onConflict: "stripe_session_id" }));
    }
    if (error) console.error("[packs] purchase record failed:", error.message);
  } catch (err) {
    console.error("[packs] purchase record failed:", err instanceof Error ? err.message : err);
  }
}

/** Now and then, delete expired guest packs and unpaid drafts (retention: see /privacy). */
export function scheduleCleanup(probability = 0.1): void {
  if (Math.random() >= probability) return;
  after(async () => {
    try {
      const { error } = await db().from("mms_job_packs").delete().lt("expires_at", new Date().toISOString());
      if (error && !isMissingObject(error)) console.warn("[packs] cleanup failed:", error.message);
    } catch {
      // not switched on
    }
  });
}

export type { PackFit };
