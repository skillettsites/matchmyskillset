// TEMPORARY COMPATIBILITY SHIM. Delete this file once nothing imports it.
//
// This used to store MMS subscription tiers in Supabase Auth app_metadata on
// the SHARED auth.users table. That collided with other sites (BriefMyNews
// keeps its own "tier" in the same field, so an MMS cancellation could have
// downgraded a BriefMyNews subscriber). Accounts are gone in the September
// 2026 revamp; the paid product becomes a one-off report recorded in
// mms_purchases.
//
// src/app/api/stripe/webhook/route.ts (owned by the product workstream) still
// imports these functions. They now never find a user and never write to
// auth.users, so the old webhook cannot touch other sites' users while it is
// being replaced.

export interface AppUser {
  id: string;
  email: string;
  tier: "free" | "pro";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  void id;
  return null;
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  void email;
  return null;
}

export async function setUserMeta(id: string, patch: Record<string, unknown>): Promise<void> {
  void patch;
  console.warn(`[admin] setUserMeta ignored for ${id}: MMS no longer writes Supabase Auth metadata`);
}
