import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client for server routes only. It bypasses RLS, which is the
// point: after migrations 003 and 004 the anon and authenticated roles have no
// access to any mms_ table. NEVER import this into a client component.
export function createAdminClient() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when both values the service-role client needs are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && env("SUPABASE_SERVICE_ROLE_KEY"));
}
