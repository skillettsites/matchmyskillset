// Reads and writes for mms_reports and mms_purchases (service role only).
//
// Columns added by supabase/migrations/005_product_reports.sql may not exist
// yet. Every write that uses them retries without them, and the generated
// paid report falls back to being stored inside mms_reports.matches under
// "paid", so the product works before and after 005 is applied.

import { randomBytes } from "crypto";
import type Stripe from "stripe";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { ReportProse, CallUsage } from "./claude";

export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;

export function newToken(): string {
  // 144 bits of randomness, URL safe.
  return randomBytes(18).toString("base64url");
}

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database is not configured") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

function db() {
  if (!isSupabaseConfigured()) throw new DatabaseUnavailableError();
  return createAdminClient();
}

type PgError = { code?: string; message?: string } | null;

/** Unknown column in an insert/update (PostgREST) or a select (Postgres). */
function isMissingColumn(error: PgError): boolean {
  return Boolean(error && (error.code === "PGRST204" || error.code === "42703"));
}

// ---------------------------------------------------------------------------
// mms_reports
// ---------------------------------------------------------------------------

export interface ReportRow {
  id: string;
  created_at: string;
  token: string;
  skills: unknown;
  matches: unknown;
  current_role: string | null;
  email: string | null;
  source: string | null;
  expires_at: string | null;
}

const REPORT_COLUMNS = "id, created_at, token, skills, matches, current_role, email, source, expires_at";

export async function insertReport(row: {
  token: string;
  skills: unknown;
  matches: unknown;
  currentRole: string | null;
  source: string;
}): Promise<{ id: string; token: string }> {
  const { data, error } = await db()
    .from("mms_reports")
    .insert({ token: row.token, skills: row.skills, matches: row.matches, current_role: row.currentRole, source: row.source })
    .select("id, token")
    .single();
  if (error || !data) throw new Error(`mms_reports insert failed: ${error?.message ?? "no row"}`);
  return data as { id: string; token: string };
}

/** The report behind a results link, or null if the token is unknown or expired. */
export async function getReportByToken(token: string): Promise<ReportRow | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const { data, error } = await db().from("mms_reports").select(REPORT_COLUMNS).eq("token", token).maybeSingle();
  if (error) throw new Error(`mms_reports read failed: ${error.message}`);
  if (!data) return null;
  const row = data as ReportRow;
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

export async function setReportEmail(id: string, email: string): Promise<void> {
  const { error } = await db().from("mms_reports").update({ email }).eq("id", id);
  if (error) throw new Error(`mms_reports email update failed: ${error.message}`);
}

/** A bought report stays available for 12 months from purchase (see /terms). */
export async function extendReportExpiry(id: string): Promise<void> {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 12);
  const { error } = await db().from("mms_reports").update({ expires_at: expires.toISOString() }).eq("id", id);
  if (error) console.error("[reports-db] expiry update failed:", error.message);
}

// ---------------------------------------------------------------------------
// mms_purchases
// ---------------------------------------------------------------------------

export interface PurchaseRow {
  id: string;
  created_at: string;
  stripe_session_id: string;
  report_id: string | null;
  target_soc: string | null;
  email: string | null;
  amount_pence: number | null;
  currency: string | null;
  status: string | null;
  fulfilled_at: string | null;
  delivery_email_id: string | null;
  // 005 columns (undefined until the migration is applied)
  occupation_id?: string | null;
  report_status?: string | null;
  report_content?: StoredReport | null;
}

export interface StoredReport {
  v: 1;
  occupationId: string;
  generatedAt: string;
  model: string;
  prose: ReportProse;
  usage?: CallUsage;
}

const PURCHASE_BASE = "id, created_at, stripe_session_id, report_id, target_soc, email, amount_pence, currency, status, fulfilled_at, delivery_email_id";
const PURCHASE_FULL = `${PURCHASE_BASE}, occupation_id, report_status, report_content`;

export async function getPurchaseBySession(sessionId: string): Promise<PurchaseRow | null> {
  const client = db();
  let res = await client.from("mms_purchases").select(PURCHASE_FULL).eq("stripe_session_id", sessionId).maybeSingle();
  if (isMissingColumn(res.error)) {
    res = await client.from("mms_purchases").select(PURCHASE_BASE).eq("stripe_session_id", sessionId).maybeSingle();
  }
  if (res.error) throw new Error(`mms_purchases read failed: ${res.error.message}`);
  return (res.data as PurchaseRow | null) ?? null;
}

export interface SessionPurchase {
  sessionId: string;
  reportId: string;
  targetSoc: string | null;
  occupationId: string | null;
  email: string | null;
  amountPence: number | null;
  currency: string | null;
  status: string;
  consentAt: string | null;
  consentText: string | null;
}

export function purchaseFromSession(session: Stripe.Checkout.Session, reportId: string): SessionPurchase {
  const md = session.metadata ?? {};
  return {
    sessionId: session.id,
    reportId,
    targetSoc: md.target_soc || null,
    occupationId: md.occupation_id || null,
    email: session.customer_details?.email || session.customer_email || null,
    amountPence: typeof session.amount_total === "number" ? session.amount_total : null,
    currency: session.currency || null,
    status: session.payment_status || "unknown",
    consentAt: md.consent_at || null,
    consentText: md.consent_text || null,
  };
}

/**
 * Records a paid session. Idempotent on stripe_session_id: the webhook and the
 * report page can both call it and there is still one row.
 */
export async function upsertPurchase(p: SessionPurchase): Promise<PurchaseRow> {
  const client = db();
  const base = {
    stripe_session_id: p.sessionId,
    report_id: p.reportId,
    target_soc: p.targetSoc,
    email: p.email,
    amount_pence: p.amountPence,
    currency: p.currency,
    status: p.status,
  };
  const full = {
    ...base,
    occupation_id: p.occupationId,
    digital_content_consent_at: p.consentAt,
    digital_content_consent_text: p.consentText,
  };
  let res = await client.from("mms_purchases").upsert(full, { onConflict: "stripe_session_id" }).select(PURCHASE_BASE).single();
  if (isMissingColumn(res.error)) {
    res = await client.from("mms_purchases").upsert(base, { onConflict: "stripe_session_id" }).select(PURCHASE_BASE).single();
  }
  if (res.error || !res.data) throw new Error(`mms_purchases upsert failed: ${res.error?.message ?? "no row"}`);
  return res.data as PurchaseRow;
}

export async function markFulfilled(purchaseId: string, deliveryEmailId: string | null): Promise<void> {
  const { error } = await db()
    .from("mms_purchases")
    .update({ fulfilled_at: new Date().toISOString(), delivery_email_id: deliveryEmailId })
    .eq("id", purchaseId);
  if (error) console.error("[reports-db] fulfilled update failed:", error.message);
}

// ---------------------------------------------------------------------------
// Generated report content
// ---------------------------------------------------------------------------

const CLAIM_STALE_MS = 4 * 60 * 1000;

/**
 * Claims the right to generate a purchase's report so the webhook and the
 * report page do not both pay for it. "claimed": go ahead. "busy": someone
 * else started less than 4 minutes ago. "untracked": 005 is not applied, so
 * there is no claim column; the caller generates anyway.
 */
export async function claimReportGeneration(purchaseId: string): Promise<"claimed" | "busy" | "untracked"> {
  const staleIso = new Date(Date.now() - CLAIM_STALE_MS).toISOString();
  const { data, error } = await db()
    .from("mms_purchases")
    .update({ report_status: "generating", report_claimed_at: new Date().toISOString() })
    .eq("id", purchaseId)
    .or(`report_status.is.null,report_status.eq.failed,and(report_status.eq.generating,report_claimed_at.lt.${staleIso})`)
    .select("id");
  if (isMissingColumn(error)) return "untracked";
  if (error) throw new Error(`report claim failed: ${error.message}`);
  return data && data.length > 0 ? "claimed" : "busy";
}

export async function releaseReportClaim(purchaseId: string): Promise<void> {
  const { error } = await db().from("mms_purchases").update({ report_status: "failed" }).eq("id", purchaseId);
  if (error && !isMissingColumn(error)) console.error("[reports-db] claim release failed:", error.message);
}

function paidStash(report: ReportRow): Record<string, StoredReport> {
  const m = report.matches as { paid?: Record<string, StoredReport> } | null;
  return m && typeof m === "object" && m.paid && typeof m.paid === "object" ? m.paid : {};
}

export function loadStoredReport(purchase: PurchaseRow, report: ReportRow): StoredReport | null {
  if (purchase.report_content && purchase.report_content.v === 1) return purchase.report_content;
  const stashed = paidStash(report)[purchase.stripe_session_id];
  return stashed && stashed.v === 1 ? stashed : null;
}

export async function saveStoredReport(purchase: PurchaseRow, report: ReportRow, content: StoredReport): Promise<void> {
  const client = db();
  const { error } = await client
    .from("mms_purchases")
    .update({
      report_content: content,
      report_status: "ready",
      report_generated_at: content.generatedAt,
      report_model: content.model,
      report_usage: content.usage ?? null,
    })
    .eq("id", purchase.id);
  if (!error) return;
  if (!isMissingColumn(error)) throw new Error(`report save failed: ${error.message}`);

  // 005 not applied: keep the report with the results record instead.
  const { data, error: readError } = await client.from("mms_reports").select("matches").eq("id", report.id).single();
  if (readError) throw new Error(`report fallback read failed: ${readError.message}`);
  const matches = (data?.matches ?? {}) as Record<string, unknown>;
  const paid = { ...((matches.paid as Record<string, StoredReport>) ?? {}), [purchase.stripe_session_id]: content };
  const { error: writeError } = await client.from("mms_reports").update({ matches: { ...matches, paid } }).eq("id", report.id);
  if (writeError) throw new Error(`report fallback save failed: ${writeError.message}`);
}

/** Re-reads a purchase's stored report (after another request finished generating it). */
export async function refreshStoredReport(sessionId: string, token: string): Promise<StoredReport | null> {
  const [purchase, report] = await Promise.all([getPurchaseBySession(sessionId), getReportByToken(token)]);
  if (!purchase || !report) return null;
  return loadStoredReport(purchase, report);
}
