import { createAdminClient } from "@/lib/supabase/admin";

// Tier / Stripe ids are stored in Supabase Auth app_metadata so the product
// needs no schema migration on the shared database. The Auth admin API is the
// source of truth for a user's plan. Never import this into client components.

export interface AppUser {
  id: string;
  email: string;
  tier: "free" | "pro";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

function toAppUser(u: {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown> | null;
}): AppUser {
  const meta = u.app_metadata || {};
  return {
    id: u.id,
    email: u.email || "",
    tier: meta.tier === "pro" || meta.tier === "premium" ? "pro" : "free",
    stripeCustomerId: (meta.stripe_customer_id as string) || undefined,
    stripeSubscriptionId: (meta.stripe_subscription_id as string) || undefined,
  };
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const { data, error } = await createAdminClient().auth.admin.getUserById(id);
  if (error || !data?.user) return null;
  return toAppUser(data.user);
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const target = email.trim().toLowerCase();
  const admin = createAdminClient();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`findUserByEmail: ${error.message}`);
    const batch = data?.users || [];
    const hit = batch.find((u) => (u.email || "").toLowerCase() === target);
    if (hit) return toAppUser(hit);
    if (batch.length < 1000) return null;
    page += 1;
  }
}

export async function setUserMeta(
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(id);
  const existing = data?.user?.app_metadata || {};
  const { error } = await admin.auth.admin.updateUserById(id, {
    app_metadata: { ...existing, ...patch },
  });
  if (error) throw new Error(`setUserMeta: ${error.message}`);
}
