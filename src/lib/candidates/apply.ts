// Scores a job posted on MatchMySkillset against a job seeker. Server-side only.
//
// Two numbers, each from one function:
// - fitForJob: the job seeker's own view on the apply page, the same job match
//   as on their results page (with a results link) or, with only a CV, the
//   employer's skills match below.
// - employerMatch: what the employer sees in the applicant email, the
//   applicants list and the matched-candidates page. It is always
//   matchSkills() from src/lib/employer/matching.ts, so the same person and
//   job get the same number everywhere an employer looks.

import { getReportByToken, TOKEN_PATTERN } from "@/lib/apis/reports-db";
import { isMatchesDoc, isSkillsDoc, type ProfileSkill } from "@/lib/skills/profile";
import { skillName } from "@/lib/skills/taxonomy";
import { fitContextFromDoc, fitInputFor } from "@/lib/apis/jobs/match";
import { scoreJobFit, skillsFromCvText } from "@/lib/apis/jobs/fit";
import { mmsListing, type MmsJobRow } from "@/lib/apis/jobs/mms";
import { jobSkillSet, matchSkills } from "@/lib/employer/matching";

export interface ApplyFit {
  kind: "full" | "skills";
  match: number;
  matched: { id: string; name: string }[];
  missing: { id: string; name: string }[];
  reason: string | null;
  explain: string;
}

function named(ids: string[]) {
  return ids.map((id) => ({ id, name: skillName(id) }));
}

async function skillsFor(opts: { token?: string | null; cvText?: string | null }): Promise<{ skills: ProfileSkill[]; fromResults: boolean; doc?: ReturnType<typeof readDoc> } | null> {
  if (opts.token && TOKEN_PATTERN.test(opts.token)) {
    const report = await getReportByToken(opts.token).catch(() => null);
    const doc = readDoc(report);
    if (doc) return { skills: doc.doc.skills, fromResults: true, doc };
  }
  if (opts.cvText && opts.cvText.trim().length >= 80) return { skills: skillsFromCvText(opts.cvText), fromResults: false };
  return null;
}

function readDoc(report: Awaited<ReturnType<typeof getReportByToken>> | null) {
  const doc = report && isSkillsDoc(report.skills) ? report.skills : null;
  if (!report || !doc) return null;
  return { doc, items: isMatchesDoc(report.matches) ? report.matches.items : [] };
}

/** The employer's number: the share of the advert's skills in the applicant's profile (matchSkills). */
export async function employerMatch(job: MmsJobRow, opts: { token?: string | null; cvText?: string | null }): Promise<{ match: number; matched: { id: string; name: string }[]; missing: { id: string; name: string }[] } | null> {
  const found = await skillsFor(opts);
  if (!found) return null;
  const set = jobSkillSet(job.title, job.skills);
  if (set.ids.length === 0) return null;
  const r = matchSkills(set, found.skills.map((s) => ({ id: s.id, strength: s.strength })));
  return { match: r.score, matched: named(r.matched), missing: named(r.missing) };
}

export async function fitForJob(job: MmsJobRow, opts: { token?: string | null; cvText?: string | null }): Promise<ApplyFit | null> {
  const found = await skillsFor(opts);
  if (!found) return null;
  if (found.doc) {
    const fit = scoreJobFit(fitInputFor(mmsListing(job)), fitContextFromDoc(found.doc.doc, found.doc.items));
    return { kind: "full", match: fit.match, matched: named(fit.matched), missing: named(fit.missing), reason: fit.reason, explain: fit.explain };
  }
  const em = await employerMatch(job, opts);
  if (!em) return null;
  return {
    kind: "skills",
    match: em.match,
    matched: em.matched,
    missing: em.missing,
    reason: null,
    explain: `Your CV shows ${em.matched.length} of the ${em.matched.length + em.missing.length} skills in the advert. Skills in the job title count double, and a skill your CV shows only in part counts half. This is the number the employer sees.`,
  };
}
