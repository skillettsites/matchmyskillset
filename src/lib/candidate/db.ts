// Database helpers for candidate accounts and job packs (migration 009).
// Server code only: service-role client.
//
// Every path fails soft until 009 is applied: a missing table or column is
// reported as NotSwitchedOnError, and pages show "not switched on yet".

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export class NotSwitchedOnError extends Error {
  constructor(message = "candidate tables are not there yet (migration 009)") {
    super(message);
    this.name = "NotSwitchedOnError";
  }
}

type PgError = { code?: string; message?: string } | null | undefined;

/** Postgres / PostgREST codes for a table, column or function that does not exist yet. */
export function isMissingObject(error: PgError): boolean {
  return Boolean(error && ["42P01", "42703", "42883", "PGRST202", "PGRST204", "PGRST205"].includes(error.code || ""));
}

/** Throws NotSwitchedOnError for a missing object, otherwise an Error with the context. */
export function raise(error: NonNullable<PgError>, context: string): never {
  if (isMissingObject(error)) throw new NotSwitchedOnError(`${context}: ${error.message ?? error.code}`);
  throw new Error(`${context}: ${error.message ?? error.code ?? "unknown error"}`);
}

export function db() {
  if (!isSupabaseConfigured()) throw new NotSwitchedOnError("Supabase is not configured");
  return createAdminClient();
}

export type CandidatePlan = "none" | "plus";
export type CandidatePlanStatus = "inactive" | "active" | "past_due" | "cancelled" | "comped";

export interface CandidateAccount {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  verified_at: string | null;
  last_sign_in_at: string | null;
  plan: CandidatePlan;
  plan_status: CandidatePlanStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  free_pack_used_at: string | null;
  marketing_consent_at: string | null;
  tracking_consent_at: string | null;
  saved_cv_at: string | null;
  saved_cv_name: string | null;
}

/** Account columns read on every request. The saved CV text itself is read only when it is used. */
export const ACCOUNT_COLUMNS =
  "id, created_at, updated_at, email, verified_at, last_sign_in_at, plan, plan_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, free_pack_used_at, marketing_consent_at, tracking_consent_at, saved_cv_at, saved_cv_name";

export interface PackRow {
  id: string;
  created_at: string;
  updated_at: string;
  token: string;
  account_id: string | null;
  email: string | null;
  results_token: string | null;
  job: unknown;
  source_cv_text: string | null;
  scope: "cv" | "full";
  status: "awaiting_payment" | "queued" | "generating" | "ready" | "failed";
  paid_via: "free" | "one_off" | "plus" | null;
  upgrade_paid_via: "one_off" | "plus" | null;
  stripe_session_id: string | null;
  upgrade_session_id: string | null;
  amount_pence: number | null;
  consent_at: string | null;
  consent_text: string | null;
  claimed_at: string | null;
  attempts: number;
  error: string | null;
  fit: unknown;
  tailored_cv: unknown;
  cover_letter: string | null;
  interview_prep: unknown;
  gaps: unknown;
  checks: unknown;
  model: string | null;
  usage: unknown;
  generated_at: string | null;
  approved_at: string | null;
  emailed_at: string | null;
  expires_at: string | null;
}

export const PACK_COLUMNS =
  "id, created_at, updated_at, token, account_id, email, results_token, job, source_cv_text, scope, status, paid_via, upgrade_paid_via, stripe_session_id, upgrade_session_id, amount_pence, consent_at, consent_text, claimed_at, attempts, error, fit, tailored_cv, cover_letter, interview_prep, gaps, checks, model, usage, generated_at, approved_at, emailed_at, expires_at";

/** Pack tokens: base64url, 32 characters for 24 bytes. */
export const PACK_TOKEN_RE = /^[A-Za-z0-9_-]{24,64}$/;
