// Job seeker sign-in by emailed magic link, and 30-day sessions. Server code
// only. The same model as the employer side (src/lib/employer/session.ts):
//
// - A sign-in link carries a random token; only its SHA-256 hash is stored
//   (mms_candidate_login_tokens). It works once, within 20 minutes.
// - Opening the link shows a "Sign in" button; the token is spent by that
//   POST, not by the GET, so email scanners that open links cannot use it up.
// - A session is another random token in an httpOnly, SameSite=Lax cookie
//   (Secure in production) called mms_candidate, stored hashed in
//   mms_candidate_sessions.
//
// Before migration 009 is applied every read returns null (signed out) and
// every write throws NotSwitchedOnError, which the pages turn into "not
// switched on yet".

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { unstable_cache } from "next/cache";
import { randomToken, sha256, TOKEN_RE } from "@/lib/employer/server";
import { SIGN_IN_MINUTES } from "./plans";
import { ACCOUNT_COLUMNS, db, isMissingObject, NotSwitchedOnError, raise, type CandidateAccount } from "./db";

export const CANDIDATE_COOKIE = "mms_candidate";
export const SESSION_DAYS = 30;

/** Paths a sign-in may return to. */
const NEXT_RE = /^\/(account|tools|packs|plus)(\/[A-Za-z0-9/_?=&.%-]*)?(\?[A-Za-z0-9_=&.%-]*)?$/;

export function safeNext(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 400) return null;
  return NEXT_RE.test(value) && !value.includes("//") ? value : null;
}

/** The signed-in job seeker for this request, or null. Never throws. */
export const getCandidate = cache(async (): Promise<CandidateAccount | null> => {
  let value: string | undefined;
  try {
    value = (await cookies()).get(CANDIDATE_COOKIE)?.value;
  } catch {
    return null;
  }
  if (!value || !TOKEN_RE.test(value)) return null;
  try {
    const { data, error } = await db()
      .from("mms_candidate_sessions")
      .select(`expires_at, account:mms_candidate_accounts(${ACCOUNT_COLUMNS})`)
      .eq("token_hash", sha256(value))
      .maybeSingle();
    if (error) {
      if (!isMissingObject(error)) console.error("[candidate-session] lookup failed:", error.message);
      return null;
    }
    if (!data || new Date(data.expires_at).getTime() < Date.now()) return null;
    const account = data.account as unknown as CandidateAccount | CandidateAccount[] | null;
    return Array.isArray(account) ? (account[0] ?? null) : account;
  } catch (err) {
    if (!(err instanceof NotSwitchedOnError)) console.error("[candidate-session]", err instanceof Error ? err.message : err);
    return null;
  }
});

/** The signed-in job seeker, or a redirect to sign in that comes back to `next`. */
export async function requireCandidate(next: string): Promise<CandidateAccount> {
  const account = await getCandidate();
  if (!account) {
    const back = safeNext(next);
    redirect(back ? `/account/sign-in?next=${encodeURIComponent(back)}` : "/account/sign-in");
  }
  return account;
}

export async function createSession(accountId: string): Promise<void> {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const { error } = await db()
    .from("mms_candidate_sessions")
    .insert({ token_hash: sha256(token), account_id: accountId, expires_at: expires.toISOString() });
  if (error) raise(error, "session insert failed");
  (await cookies()).set(CANDIDATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const value = store.get(CANDIDATE_COOKIE)?.value;
  if (value && TOKEN_RE.test(value)) {
    try {
      await db().from("mms_candidate_sessions").delete().eq("token_hash", sha256(value));
    } catch {
      // not switched on: nothing to delete
    }
  }
  store.delete(CANDIDATE_COOKIE);
}

/** Stores a new single-use sign-in token for `email` and returns the raw token. */
export async function issueLoginToken(email: string): Promise<string> {
  const token = randomToken();
  const expires = new Date(Date.now() + SIGN_IN_MINUTES * 60_000);
  const admin = db();
  const { error } = await admin.from("mms_candidate_login_tokens").insert({ token_hash: sha256(token), email, expires_at: expires.toISOString() });
  if (error) raise(error, "login token insert failed");
  // Tidy up spent and expired tokens and sessions now and then.
  if (Math.random() < 0.1) {
    after(async () => {
      const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
      await admin.from("mms_candidate_login_tokens").delete().lt("expires_at", dayAgo);
      await admin.from("mms_candidate_sessions").delete().lt("expires_at", new Date().toISOString());
    });
  }
  return token;
}

/** Spends a sign-in token. Returns the email it was issued to, or null if it is wrong, used or expired. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  if (!TOKEN_RE.test(token)) return null;
  const now = new Date().toISOString();
  // One conditional UPDATE: only the first caller can flip used_at, so the link works once.
  const { data, error } = await db()
    .from("mms_candidate_login_tokens")
    .update({ used_at: now })
    .eq("token_hash", sha256(token))
    .is("used_at", null)
    .gt("expires_at", now)
    .select("email")
    .maybeSingle();
  if (error) {
    if (isMissingObject(error)) throw new NotSwitchedOnError();
    console.error("[candidate-session] token update failed:", error.message);
    return null;
  }
  return data?.email ?? null;
}

/** Finds the account for a verified email, creating it on first sign-in. */
export async function findOrCreateAccount(email: string): Promise<{ account: CandidateAccount; created: boolean }> {
  const admin = db();
  const now = new Date().toISOString();
  const existing = await admin.from("mms_candidate_accounts").select(ACCOUNT_COLUMNS).eq("email", email).maybeSingle();
  if (existing.error) raise(existing.error, "account read failed");
  if (existing.data) {
    const account = existing.data as unknown as CandidateAccount;
    await admin
      .from("mms_candidate_accounts")
      .update({ last_sign_in_at: now, updated_at: now, ...(account.verified_at ? {} : { verified_at: now }) })
      .eq("id", account.id);
    return { account, created: false };
  }
  const inserted = await admin
    .from("mms_candidate_accounts")
    .insert({ email, verified_at: now, last_sign_in_at: now })
    .select(ACCOUNT_COLUMNS)
    .single();
  if (inserted.error) {
    // Two tabs racing on first sign-in: the other one created it.
    if (inserted.error.code === "23505") {
      const again = await admin.from("mms_candidate_accounts").select(ACCOUNT_COLUMNS).eq("email", email).single();
      if (again.error) raise(again.error, "account read failed");
      return { account: again.data as unknown as CandidateAccount, created: false };
    }
    raise(inserted.error, "account insert failed");
  }
  return { account: inserted.data as unknown as CandidateAccount, created: true };
}

/** Re-reads an account (after a change), bypassing the per-request cache. */
export async function loadAccount(id: string): Promise<CandidateAccount | null> {
  const { data, error } = await db().from("mms_candidate_accounts").select(ACCOUNT_COLUMNS).eq("id", id).maybeSingle();
  if (error) raise(error, "account read failed");
  return (data as unknown as CandidateAccount) ?? null;
}

/** True when the tables from migration 009 are there (one cheap query, remembered for a minute). */
export const candidateTablesReady = unstable_cache(
  async (): Promise<boolean> => {
    try {
      // A plain read: a HEAD request for a missing table comes back as 204 with no error.
      const { error } = await db().from("mms_job_packs").select("id").limit(1);
      return !error;
    } catch {
      return false;
    }
  },
  ["mms-candidate-tables-v2"],
  { revalidate: 60 }
);
