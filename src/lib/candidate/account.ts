// A job seeker's account: saved CV, linked results pages, their opt-in
// employer profile (found by email), consents, data export and deletion.
// Server code only.

import { findCandidateByEmail } from "@/lib/candidates/db";
import { isMatchesDoc, isSkillsDoc } from "@/lib/skills/profile";
import { db, isMissingObject, PACK_COLUMNS, raise, type CandidateAccount, type PackRow } from "./db";
import type { ResultsProfile } from "./job-source";

// ---------------------------------------------------------------------------
// Saved CV (only with the "keep my CV on my account" tick)
// ---------------------------------------------------------------------------

export async function loadSavedCv(accountId: string): Promise<string | null> {
  const { data, error } = await db().from("mms_candidate_accounts").select("saved_cv_text").eq("id", accountId).maybeSingle();
  if (error) raise(error, "saved CV read failed");
  return (data?.saved_cv_text as string | null) ?? null;
}

export async function saveCvToAccount(accountId: string, text: string, name: string | null): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await db()
    .from("mms_candidate_accounts")
    .update({ saved_cv_text: text, saved_cv_name: name, saved_cv_at: now, updated_at: now })
    .eq("id", accountId);
  if (error) raise(error, "saved CV write failed");
}

export async function deleteSavedCv(accountId: string): Promise<void> {
  const { error } = await db()
    .from("mms_candidate_accounts")
    .update({ saved_cv_text: null, saved_cv_name: null, saved_cv_at: null, updated_at: new Date().toISOString() })
    .eq("id", accountId);
  if (error) raise(error, "saved CV delete failed");
}

// ---------------------------------------------------------------------------
// Results pages linked to the account
// ---------------------------------------------------------------------------

/** Links a results page to the account (no-op when it is already linked). */
export async function linkResults(accountId: string, reportId: string): Promise<void> {
  const { error } = await db()
    .from("mms_candidate_reports")
    .upsert({ account_id: accountId, report_id: reportId }, { onConflict: "account_id,report_id", ignoreDuplicates: true });
  if (error) raise(error, "results link failed");
}

export interface LinkedResults {
  token: string;
  createdAt: string;
  role: string | null;
  expiresAt: string | null;
}

export async function linkedResults(accountId: string): Promise<LinkedResults[]> {
  const { data, error } = await db()
    .from("mms_candidate_reports")
    .select("created_at, report:mms_reports(id, token, created_at, current_role, expires_at)")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) raise(error, "linked results read failed");
  const out: LinkedResults[] = [];
  for (const row of data ?? []) {
    const r = (Array.isArray(row.report) ? row.report[0] : row.report) as { token: string; created_at: string; current_role: string | null; expires_at: string | null } | null;
    if (!r || (r.expires_at && Date.parse(r.expires_at) < Date.now())) continue;
    out.push({ token: r.token, createdAt: r.created_at, role: r.current_role, expiresAt: r.expires_at });
  }
  return out;
}

/** The skills profile from the newest linked results page (for Check any job). */
export async function latestLinkedProfile(accountId: string): Promise<ResultsProfile | null> {
  try {
    const { data, error } = await db()
      .from("mms_candidate_reports")
      .select("created_at, report:mms_reports(id, token, skills, matches, expires_at)")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) return null;
    for (const row of data ?? []) {
      const r = (Array.isArray(row.report) ? row.report[0] : row.report) as { id: string; token: string; skills: unknown; matches: unknown; expires_at: string | null } | null;
      if (!r || (r.expires_at && Date.parse(r.expires_at) < Date.now()) || !isSkillsDoc(r.skills)) continue;
      return { token: r.token, reportId: r.id, doc: r.skills, items: isMatchesDoc(r.matches) ? r.matches.items : [] };
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// The opt-in employer profile (mms_candidates), found by the verified email
// ---------------------------------------------------------------------------

export interface LinkedProfile {
  manageToken: string;
  discoverable: boolean;
  createdAt: string;
}

export async function profileForAccount(account: CandidateAccount): Promise<LinkedProfile | null> {
  try {
    const row = await findCandidateByEmail(account.email);
    // ilike treats "_" as a wildcard, so check the address really is the same.
    if (!row || row.email.trim().toLowerCase() !== account.email) return null;
    if (row.expires_at && Date.parse(row.expires_at) < Date.now()) return null;
    return { manageToken: row.manage_token, discoverable: row.discoverable, createdAt: row.created_at };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Consents
// ---------------------------------------------------------------------------

export async function setConsents(accountId: string, opts: { marketing: boolean; tracking: boolean }, current: CandidateAccount): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await db()
    .from("mms_candidate_accounts")
    .update({
      marketing_consent_at: opts.marketing ? (current.marketing_consent_at ?? now) : null,
      tracking_consent_at: opts.tracking ? (current.tracking_consent_at ?? now) : null,
      updated_at: now,
    })
    .eq("id", accountId);
  if (error) raise(error, "consent update failed");
}

// ---------------------------------------------------------------------------
// Export and delete
// ---------------------------------------------------------------------------

/** Everything we hold for the account, as one JSON document (the right of access). */
export async function exportAccount(account: CandidateAccount): Promise<Record<string, unknown>> {
  const client = db();
  const [acc, packs, usage, links] = await Promise.all([
    client.from("mms_candidate_accounts").select("*").eq("id", account.id).maybeSingle(),
    client.from("mms_job_packs").select(PACK_COLUMNS).eq("account_id", account.id).order("created_at", { ascending: false }),
    client.from("mms_candidate_usage").select("created_at, kind").eq("account_id", account.id).order("created_at", { ascending: false }),
    client.from("mms_candidate_reports").select("created_at, report:mms_reports(token, created_at, current_role, skills, expires_at)").eq("account_id", account.id),
  ]);
  for (const r of [acc, packs, usage, links]) if (r.error) raise(r.error, "export read failed");
  const profile = await profileForAccount(account);
  return {
    exported_at: new Date().toISOString(),
    about: "Everything MatchMySkillset holds for your account. Payments are processed by Stripe, which keeps its own records.",
    account: acc.data,
    job_packs: (packs.data ?? []).map((p) => {
      const row = p as unknown as PackRow;
      return { ...row, id: undefined, claimed_at: undefined, attempts: undefined, usage: undefined };
    }),
    usage: usage.data,
    linked_results: links.data,
    employer_profile: profile ? { manage_link_token: profile.manageToken, discoverable: profile.discoverable, created_at: profile.createdAt } : null,
  };
}

/**
 * Deletes the account and everything that belongs to it: sessions, job packs
 * (with the CV text inside them), usage counts and links (cascades), and,
 * when asked, the linked results pages too. The employer profile has its own
 * delete button on its manage page; purchase records stay for 6 years (tax).
 */
export async function deleteAccount(accountId: string, alsoResults: boolean): Promise<void> {
  const client = db();
  if (alsoResults) {
    const { data, error } = await client.from("mms_candidate_reports").select("report_id").eq("account_id", accountId);
    if (error && !isMissingObject(error)) raise(error, "results read failed");
    const ids = (data ?? []).map((r) => r.report_id as string);
    if (ids.length) {
      const del = await client.from("mms_reports").delete().in("id", ids);
      if (del.error) raise(del.error, "results delete failed");
    }
  }
  const packs = await client.from("mms_job_packs").delete().eq("account_id", accountId);
  if (packs.error) raise(packs.error, "packs delete failed");
  const acc = await client.from("mms_candidate_accounts").delete().eq("id", accountId);
  if (acc.error) raise(acc.error, "account delete failed");
}
