// Live counts for the employer landing page. Counted in Postgres (never by
// tallying rows), and test rows (example.com addresses) are left out.

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export interface PublicStats {
  /** People who ticked "Let employers find me", have not withdrawn and are within 12 months. */
  discoverable: number;
  /** Jobs posted on MatchMySkillset that are live now. */
  liveJobs: number;
}

/** Below these the numbers are too small to be worth showing. */
export const SHOW_POOL_FROM = 25;
export const SHOW_JOBS_FROM = 5;

export async function publicEmployerStats(): Promise<PublicStats> {
  if (!isSupabaseConfigured()) return { discoverable: 0, liveJobs: 0 };
  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    const [candidates, jobs] = await Promise.all([
      admin
        .from("mms_candidates")
        .select("id", { count: "exact", head: true })
        .eq("discoverable", true)
        .is("withdrawn_at", null)
        .gt("expires_at", now)
        .not("email", "ilike", "%@example.com"),
      admin.from("mms_jobs").select("id", { count: "exact", head: true }).eq("status", "live").gt("expires_at", now),
    ]);
    return { discoverable: candidates.count ?? 0, liveJobs: jobs.count ?? 0 };
  } catch {
    return { discoverable: 0, liveJobs: 0 };
  }
}
