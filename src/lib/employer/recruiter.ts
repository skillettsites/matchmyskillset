// Data for the recruiter workspace (/recruiter): everything a recruiter needs
// to put a shortlist together for one job. Server code only.
//
// - Applicants to the job, in full: they applied to this employer.
// - Opted-in candidates, found and ranked exactly as the employer's
//   "Matched candidates" page does (loadDiscoverable + rankCandidates), less
//   anyone who already applied. For these the recruiter sees the anonymous
//   profile and the CV if they added one to it, never their name or email.

import { createAdminClient } from "@/lib/supabase/admin";
import { loadDiscoverable, rankCandidates, type RankedCandidate } from "./candidates";
import { jobSkillSet, parseSkillIds, type JobSkillSet } from "./matching";
import type { ApplicationRow, JobRow } from "./types";

/** How many of the best-matched opted-in candidates a recruiter is shown. */
export const RECRUITER_POOL_SIZE = 60;

/** Test profiles (example.com) never reach real employers; same rule as loadDiscoverable. */
export function isTestEmail(email: string | null | undefined): boolean {
  return process.env.NODE_ENV === "production" && /@example\.com$/i.test((email ?? "").trim());
}

export type PoolApplicant = Pick<
  ApplicationRow,
  "id" | "created_at" | "candidate_id" | "name" | "email" | "phone" | "cv_text" | "cover_note" | "match_score" | "status"
> & { matched: string[] };

export interface PoolCandidate {
  ranked: RankedCandidate;
  cv: string | null;
}

export interface RecruiterPool {
  skillSet: JobSkillSet;
  applicants: PoolApplicant[];
  candidates: PoolCandidate[];
  /** All opted-in people who match, before the pool is cut to RECRUITER_POOL_SIZE. */
  totalMatches: number;
}

/** `keep`: candidates already on the shortlist, kept in the pool even if they are no longer in the top RECRUITER_POOL_SIZE. */
export async function recruiterPool(job: Pick<JobRow, "id" | "title" | "skills">, keep: string[] = []): Promise<RecruiterPool> {
  const admin = createAdminClient();
  const skillSet = jobSkillSet(job.title, job.skills);
  const [appsRes, discoverable] = await Promise.all([
    admin
      .from("mms_applications")
      .select("id, created_at, candidate_id, name, email, phone, cv_text, cover_note, match_score, matched_skills, status")
      .eq("job_id", job.id)
      .order("match_score", { ascending: false, nullsFirst: false })
      .limit(500),
    loadDiscoverable(),
  ]);
  if (appsRes.error) console.error("[recruiter] applicants failed:", appsRes.error.message);
  const applicants: PoolApplicant[] = ((appsRes.data ?? []) as (ApplicationRow & { matched_skills: unknown })[]).map((a) => ({
    id: a.id,
    created_at: a.created_at,
    candidate_id: a.candidate_id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    cv_text: a.cv_text,
    cover_note: a.cover_note,
    match_score: a.match_score,
    status: a.status,
    matched: parseSkillIds(a.matched_skills),
  }));

  const applied = new Set(applicants.map((a) => a.candidate_id).filter(Boolean));
  const ranked = rankCandidates(skillSet, discoverable).filter((r) => !applied.has(r.candidate.id));
  const top = ranked.slice(0, RECRUITER_POOL_SIZE);
  const inTop = new Set(top.map((r) => r.candidate.id));
  const kept = new Set(keep);
  for (const r of ranked.slice(RECRUITER_POOL_SIZE)) if (kept.has(r.candidate.id) && !inTop.has(r.candidate.id)) top.push(r);
  const cvs = new Map<string, string | null>();
  if (top.length) {
    const { data, error } = await admin
      .from("mms_candidates")
      .select("id, cv_text")
      .in(
        "id",
        top.map((r) => r.candidate.id)
      );
    if (error) console.error("[recruiter] candidate CVs failed:", error.message);
    for (const row of (data ?? []) as { id: string; cv_text: string | null }[]) cvs.set(row.id, row.cv_text);
  }
  return {
    skillSet,
    applicants,
    candidates: top.map((r) => ({ ranked: r, cv: cvs.get(r.candidate.id) ?? null })),
    totalMatches: ranked.length,
  };
}
