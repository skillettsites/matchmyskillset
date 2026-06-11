import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Some env values in this stack arrive with a trailing literal "\n" (two chars).
// Strip it so comparisons and API keys work.
function clean(value: string | undefined | null): string {
  return (value || "").replace(/\\n$/, "").trim();
}

function getBearer(request: NextRequest): string | null {
  const header = request.headers.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

/**
 * Returns true if the caller is authorised to access admin data.
 * Two accepted paths:
 *  1. A bearer token matching ADMIN_SECRET (shared admin key).
 *  2. A Supabase access token belonging to a user whose mms_profiles.role = 'admin'.
 * If ADMIN_SECRET is not configured, the shared-key path is disabled (fail closed).
 */
export async function isAuthorisedAdmin(request: NextRequest): Promise<boolean> {
  const token = getBearer(request);
  if (!token) return false;

  const adminSecret = clean(process.env.ADMIN_SECRET);
  if (adminSecret && token === adminSecret) {
    return true;
  }

  // Fall back to a real Supabase session with an admin role.
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return false;

    const { data: profile } = await supabase
      .from("mms_profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}
