// Employer sign-in by emailed magic link, and 30-day sessions. Server code only.
//
// - A sign-in link carries a random token; only its SHA-256 hash is stored
//   (mms_login_tokens). It works once, within 20 minutes.
// - Opening the link shows a "Sign in" button; the token is spent by that POST,
//   not by the GET, so email scanners that open links cannot use it up.
// - A session is another random token in an httpOnly, SameSite=Lax cookie
//   (Secure in production), stored hashed in mms_employer_sessions.

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomToken, sha256, TOKEN_RE } from "./server";
import type { EmployerAccount } from "./types";

export const SESSION_COOKIE = "mms_employer";
export const SESSION_DAYS = 30;
export const LOGIN_TOKEN_MINUTES = 20;

/** The signed-in employer account for this request, or null. */
export const getEmployer = cache(async (): Promise<EmployerAccount | null> => {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value || !TOKEN_RE.test(value)) return null;
  const { data, error } = await createAdminClient()
    .from("mms_employer_sessions")
    .select("expires_at, account:mms_employer_accounts(*)")
    .eq("token_hash", sha256(value))
    .maybeSingle();
  if (error) {
    console.error("[employer-session] lookup failed:", error.message);
    return null;
  }
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null;
  const account = data.account as unknown as EmployerAccount | EmployerAccount[] | null;
  return Array.isArray(account) ? (account[0] ?? null) : account;
});

/** True once the first-sign-in details (company, contact, terms) are in. */
export function isSetUp(account: EmployerAccount): boolean {
  return Boolean(account.company_name && account.contact_name && account.terms_accepted_at);
}

/**
 * The signed-in employer, or a redirect to sign in. Unless `allowIncomplete`,
 * an account that has not finished setup is sent to the setup form first.
 */
export async function requireEmployer(opts: { allowIncomplete?: boolean } = {}): Promise<EmployerAccount> {
  const account = await getEmployer();
  if (!account) redirect("/employers/sign-in");
  if (!opts.allowIncomplete && !isSetUp(account)) redirect("/employers/dashboard/setup");
  return account;
}

export async function createSession(accountId: string): Promise<void> {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const { error } = await createAdminClient()
    .from("mms_employer_sessions")
    .insert({ token_hash: sha256(token), account_id: accountId, expires_at: expires.toISOString() });
  if (error) throw new Error(`session insert failed: ${error.message}`);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (value && TOKEN_RE.test(value)) {
    await createAdminClient().from("mms_employer_sessions").delete().eq("token_hash", sha256(value));
  }
  store.delete(SESSION_COOKIE);
}

/** Stores a new single-use sign-in token for `email` and returns the raw token. */
export async function issueLoginToken(email: string): Promise<string> {
  const token = randomToken();
  const expires = new Date(Date.now() + LOGIN_TOKEN_MINUTES * 60_000);
  const admin = createAdminClient();
  const { error } = await admin
    .from("mms_login_tokens")
    .insert({ token_hash: sha256(token), email, expires_at: expires.toISOString() });
  if (error) throw new Error(`login token insert failed: ${error.message}`);
  // Tidy up spent and expired tokens and sessions now and then.
  if (Math.random() < 0.1) {
    after(async () => {
      const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
      await admin.from("mms_login_tokens").delete().lt("expires_at", dayAgo);
      await admin.from("mms_employer_sessions").delete().lt("expires_at", new Date().toISOString());
    });
  }
  return token;
}

/** Spends a sign-in token. Returns the email it was issued to, or null if it is wrong, used or expired. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  if (!TOKEN_RE.test(token)) return null;
  const now = new Date().toISOString();
  // One conditional UPDATE: only the first caller can flip used_at, so the link works once.
  const { data, error } = await createAdminClient()
    .from("mms_login_tokens")
    .update({ used_at: now })
    .eq("token_hash", sha256(token))
    .is("used_at", null)
    .gt("expires_at", now)
    .select("email")
    .maybeSingle();
  if (error) {
    console.error("[employer-session] token update failed:", error.message);
    return null;
  }
  return data?.email ?? null;
}

/** Finds the account for a verified email, creating it on first sign-in. */
export async function findOrCreateAccount(email: string): Promise<{ account: EmployerAccount; created: boolean }> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const existing = await admin.from("mms_employer_accounts").select("*").eq("email", email).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) {
    const account = existing.data as EmployerAccount;
    if (!account.verified_at) {
      await admin.from("mms_employer_accounts").update({ verified_at: now, updated_at: now }).eq("id", account.id);
    }
    return { account, created: false };
  }
  const inserted = await admin.from("mms_employer_accounts").insert({ email, verified_at: now }).select("*").single();
  if (inserted.error) {
    // Two tabs racing on first sign-in: the other one created it.
    if (inserted.error.code === "23505") {
      const again = await admin.from("mms_employer_accounts").select("*").eq("email", email).single();
      if (again.error) throw new Error(again.error.message);
      return { account: again.data as EmployerAccount, created: false };
    }
    throw new Error(inserted.error.message);
  }
  return { account: inserted.data as EmployerAccount, created: true };
}
