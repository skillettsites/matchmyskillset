import { createClient } from "@supabase/supabase-js";

// Some env values in this stack arrive with a trailing literal "\n" (two
// chars). That silently breaks the service-role key, so strip it before use.
function clean(value: string | undefined | null): string {
  return (value || "").replace(/\\n$/, "").trim();
}

// Service role client for API routes. Bypasses RLS.
// NEVER expose this on the client side.
export function createAdminClient() {
  return createClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}
