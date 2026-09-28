// Scores a job posted on MatchMySkillset against a job seeker, for the apply
// page and the application record. With a results link we use the full job
// match (title and skills, the same as on the results page); with only a CV
// we use the skills part alone, and say so. Server-side only.

import { getReportByToken, TOKEN_PATTERN } from "@/lib/apis/reports-db";
import { isMatchesDoc, isSkillsDoc } from "@/lib/skills/profile";
import { skillName } from "@/lib/skills/taxonomy";
import { buildAnchors } from "@/lib/apis/jobs/match";
import { scoreJobFit, skillsFromCvText, skillsOnlyFit } from "@/lib/apis/jobs/fit";
import { mmsSkillIds, type MmsJobRow } from "@/lib/apis/jobs/mms";

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

export async function fitForJob(job: MmsJobRow, opts: { token?: string | null; cvText?: string | null }): Promise<ApplyFit | null> {
  const input = { title: job.title, text: `${job.title}. ${job.description}`, tagged: mmsSkillIds(job.skills) };
  if (opts.token && TOKEN_PATTERN.test(opts.token)) {
    const report = await getReportByToken(opts.token).catch(() => null);
    const doc = report && isSkillsDoc(report.skills) ? report.skills : null;
    if (report && doc) {
      const items = isMatchesDoc(report.matches) ? report.matches.items : [];
      const fit = scoreJobFit(input, doc.skills, buildAnchors(doc, items));
      if (fit) return { kind: "full", match: fit.match, matched: named(fit.matched), missing: named(fit.missing), reason: fit.reason, explain: fit.explain };
    }
  }
  if (opts.cvText && opts.cvText.trim().length >= 80) {
    const skills = skillsFromCvText(opts.cvText);
    const fit = skillsOnlyFit(input, skills);
    if (fit.advertSkills === 0) return null;
    return {
      kind: "skills",
      match: fit.match,
      matched: named(fit.matched),
      missing: named(fit.missing),
      reason: null,
      explain: `Your CV shows ${fit.matched.length} of the ${fit.advertSkills} skills we found in the advert (rarer skills count for more).`,
    };
  }
  return null;
}
