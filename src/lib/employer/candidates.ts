// Discoverable candidates for employer search and per-job matching. Only
// people who opted in ("Let employers find me"), have not withdrawn and are
// inside the 12-month retention window. Only the anonymous columns are ever
// selected here: no name, email, phone, CV or manage link.

import { createAdminClient } from "@/lib/supabase/admin";
import { matchSkills, parseCandidateSkills, type CandidateSkill, type JobSkillSet, type MatchResult } from "./matching";
import type { AnonymousCandidate, ContactStatus } from "./types";

const ANON_COLUMNS = 'id, headline, "current_role", region, years_experience, skills, created_at';
const MAX_POOL = 1000;
/** A request nobody answers within this many days is shown as expired. */
export const CONTACT_EXPIRY_DAYS = 30;

export async function loadDiscoverable(opts: { region?: string | null } = {}): Promise<AnonymousCandidate[]> {
  let q = createAdminClient()
    .from("mms_candidates")
    .select(ANON_COLUMNS)
    .eq("discoverable", true)
    .is("withdrawn_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(MAX_POOL);
  if (opts.region) q = q.eq("region", opts.region);
  // Test profiles (example.com) never reach real employers.
  if (process.env.NODE_ENV === "production") q = q.not("email", "ilike", "%@example.com");
  const { data, error } = await q;
  if (error) {
    console.error("[employer-candidates] load failed:", error.message);
    return [];
  }
  return (data as unknown as AnonymousCandidate[]) ?? [];
}

export interface RankedCandidate {
  candidate: AnonymousCandidate;
  skills: CandidateSkill[];
  match: MatchResult;
}

/** Candidates with at least one of the job's skills, best match first. */
export function rankCandidates(job: JobSkillSet, pool: AnonymousCandidate[], filter?: { minYears?: number; keyword?: string }): RankedCandidate[] {
  const keyword = filter?.keyword?.trim().toLowerCase() ?? "";
  const out: RankedCandidate[] = [];
  for (const candidate of pool) {
    if (filter?.minYears && (candidate.years_experience ?? 0) < filter.minYears) continue;
    if (keyword && !`${candidate.headline ?? ""} ${candidate.current_role ?? ""}`.toLowerCase().includes(keyword)) continue;
    const skills = parseCandidateSkills(candidate.skills);
    const match = matchSkills(job, skills);
    if (job.ids.length > 0 && match.matched.length === 0) continue;
    out.push({ candidate, skills, match });
  }
  return out.sort(
    (a, b) => b.match.score - a.match.score || (b.candidate.years_experience ?? 0) - (a.candidate.years_experience ?? 0) || a.candidate.id.localeCompare(b.candidate.id)
  );
}

export function contactDisplayStatus(row: { status: string; created_at: string }): ContactStatus {
  if (row.status === "pending" && Date.now() - new Date(row.created_at).getTime() > CONTACT_EXPIRY_DAYS * 86_400_000) return "expired";
  return (["pending", "accepted", "declined", "expired"].includes(row.status) ? row.status : "pending") as ContactStatus;
}

/** The latest request this account made to each of these candidates. */
export async function contactStatusMap(accountId: string, candidateIds: string[]): Promise<Map<string, ContactStatus>> {
  const out = new Map<string, ContactStatus>();
  if (candidateIds.length === 0) return out;
  const { data } = await createAdminClient()
    .from("mms_contact_requests")
    .select("candidate_id, status, created_at")
    .eq("account_id", accountId)
    .in("candidate_id", candidateIds.slice(0, 500))
    .order("created_at", { ascending: true });
  for (const row of data ?? []) out.set(row.candidate_id, contactDisplayStatus(row));
  return out;
}
