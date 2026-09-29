// What a job seeker can use: the one free tailored CV, Plus, and the Plus
// fair-use count. Server code only.
//
// For other parts of the site (the application tracker reads this):
//   hasPlus(candidateId)      candidateId is mms_candidate_accounts.id
//   hasPlusForEmail(email)    the same, looked up by the account's email
// Both return false (never throw) when there is no such account, when the
// account has no active Plus plan, or before migration 009 is applied.
//
// Plus counts as on while the plan is "plus" and its status is active,
// past_due (Stripe is retrying a failed renewal) or comped (set by hand).
// Cancelling in the billing portal keeps it on until the period ends, when
// Stripe's subscription.deleted event marks it cancelled.

import { PLUS_PACKS_PER_MONTH } from "./plans";
import { db, isMissingObject, NotSwitchedOnError, raise, type CandidateAccount } from "./db";

const PLUS_STATUSES = new Set(["active", "past_due", "comped"]);

export function isPlusAccount(account: Pick<CandidateAccount, "plan" | "plan_status"> | null | undefined): boolean {
  return Boolean(account && account.plan === "plus" && PLUS_STATUSES.has(account.plan_status));
}

/** True when this candidate account (mms_candidate_accounts.id) has Plus now. Never throws. */
export async function hasPlus(candidateId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(candidateId)) return false;
  try {
    const { data, error } = await db().from("mms_candidate_accounts").select("plan, plan_status").eq("id", candidateId).maybeSingle();
    if (error) return false;
    return isPlusAccount(data as Pick<CandidateAccount, "plan" | "plan_status"> | null);
  } catch {
    return false;
  }
}

/** True when the account with this email has Plus now. Never throws. */
export async function hasPlusForEmail(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  if (!e || e.length > 254) return false;
  try {
    const { data, error } = await db().from("mms_candidate_accounts").select("plan, plan_status").eq("email", e).maybeSingle();
    if (error) return false;
    return isPlusAccount(data as Pick<CandidateAccount, "plan" | "plan_status"> | null);
  } catch {
    return false;
  }
}

/** Start of the current Plus billing month, and when it resets (null when unknown). */
export function billingPeriod(account: Pick<CandidateAccount, "current_period_start" | "current_period_end">, now = Date.now()): { since: string; resetsAt: string | null } {
  const end = account.current_period_end ? Date.parse(account.current_period_end) : NaN;
  const start = account.current_period_start ? Date.parse(account.current_period_start) : NaN;
  if (Number.isFinite(start) && start <= now && (!Number.isFinite(end) || end > now)) {
    return { since: new Date(start).toISOString(), resetsAt: Number.isFinite(end) ? new Date(end).toISOString() : null };
  }
  if (Number.isFinite(end) && end > now) {
    const s = new Date(end);
    s.setUTCMonth(s.getUTCMonth() - 1);
    return { since: s.toISOString(), resetsAt: new Date(end).toISOString() };
  }
  // No period on record (a comped plan, or before the first renewal event): a rolling 30 days.
  return { since: new Date(now - 30 * 86_400_000).toISOString(), resetsAt: null };
}

export interface PlusUsage {
  used: number;
  limit: number;
  left: number;
  resetsAt: string | null;
}

export async function plusUsage(account: CandidateAccount): Promise<PlusUsage> {
  const { since, resetsAt } = billingPeriod(account);
  const { count, error } = await db()
    .from("mms_candidate_usage")
    .select("id", { head: true, count: "exact" })
    .eq("account_id", account.id)
    .eq("kind", "pack")
    .gte("created_at", since);
  if (error) raise(error, "usage count failed");
  const used = count ?? 0;
  return { used, limit: PLUS_PACKS_PER_MONTH, left: Math.max(0, PLUS_PACKS_PER_MONTH - used), resetsAt };
}

/**
 * Takes one of this month's Plus packs for `packId`, atomically. False when
 * the month's packs are used up.
 */
export async function claimPlusPack(account: CandidateAccount, packId: string): Promise<boolean> {
  const { since } = billingPeriod(account);
  const { data, error } = await db().rpc("mms_candidate_claim_usage", {
    p_account: account.id,
    p_kind: "pack",
    p_since: since,
    p_limit: PLUS_PACKS_PER_MONTH,
    p_pack: packId,
  });
  if (error) raise(error, "usage claim failed");
  return data === true;
}

/** Gives a Plus pack back (the pack could not be written). */
export async function releasePlusPack(accountId: string, packId: string): Promise<void> {
  try {
    await db().from("mms_candidate_usage").delete().eq("account_id", accountId).eq("kind", "pack").eq("pack_id", packId);
  } catch (err) {
    console.error("[entitlements] release failed:", err instanceof Error ? err.message : err);
  }
}

/** Takes the account's one free tailored CV, atomically. False when it has been used. */
export async function claimFreePack(accountId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("mms_candidate_accounts")
    .update({ free_pack_used_at: now, updated_at: now })
    .eq("id", accountId)
    .is("free_pack_used_at", null)
    .select("id")
    .maybeSingle();
  if (error) raise(error, "free pack claim failed");
  return Boolean(data);
}

/** Gives the free tailored CV back (it could not be written). */
export async function releaseFreePack(accountId: string): Promise<void> {
  try {
    await db().from("mms_candidate_accounts").update({ free_pack_used_at: null }).eq("id", accountId);
  } catch (err) {
    console.error("[entitlements] free release failed:", err instanceof Error ? err.message : err);
  }
}

/** Records one "Check any job" use (for the numbers; checks have a rate limit, not a monthly cap). */
export async function recordCheck(accountId: string): Promise<void> {
  try {
    const { error } = await db().from("mms_candidate_usage").insert({ account_id: accountId, kind: "check" });
    if (error && !isMissingObject(error)) console.warn("[entitlements] check record failed:", error.message);
  } catch {
    // not switched on
  }
}

export interface Entitlement {
  signedIn: boolean;
  plus: boolean;
  plusUsage: PlusUsage | null;
  freeAvailable: boolean;
}

/** What this person can use right now. Signed out means: pay per pack, or sign in for the free one. */
export async function entitlementFor(account: CandidateAccount | null): Promise<Entitlement> {
  if (!account) return { signedIn: false, plus: false, plusUsage: null, freeAvailable: false };
  const plus = isPlusAccount(account);
  let usage: PlusUsage | null = null;
  if (plus) {
    try {
      usage = await plusUsage(account);
    } catch (err) {
      if (!(err instanceof NotSwitchedOnError)) console.error("[entitlements] usage failed:", err instanceof Error ? err.message : err);
    }
  }
  return { signedIn: true, plus, plusUsage: usage, freeAvailable: !account.free_pack_used_at };
}
