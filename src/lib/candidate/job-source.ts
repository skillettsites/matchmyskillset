// Where a job pack's advert comes from, and the deterministic skills check
// that goes with it. Server code only.
//
// - A job on someone's results page: read from the stored job list. Reed
//   adverts are read in full through Reed's job details endpoint; jobs posted
//   on MatchMySkillset have their whole description; other boards only give a
//   summary, so the person is asked to paste the whole advert.
// - A job posted on MatchMySkillset (/jobs/mms/[id]).
// - An advert the person pastes.
//
// The skills check and the match score use the same free, deterministic code
// as the results page (skillsInText and fit.ts). No model call here.

import { getReportByToken, TOKEN_PATTERN } from "@/lib/apis/reports-db";
import { snapshotFrom, fitContextFromDoc } from "@/lib/apis/jobs/match";
import { getMmsJobRow, isLiveRow, mmsLocationText, mmsSalaryText } from "@/lib/apis/jobs/mms";
import { reedDetails } from "@/lib/apis/jobs/sources";
import { scoreJobFit } from "@/lib/apis/jobs/fit";
import { skillsInText } from "@/lib/skills/text-skills";
import { areRelated, skillName } from "@/lib/skills/taxonomy";
import { isMatchesDoc, isSkillsDoc, type MatchEntry, type SkillsDoc } from "@/lib/skills/profile";
import { MAX_ADVERT_CHARS } from "./plans";
import type { PackFit, PackJob } from "./pack-types";

export interface ResultsProfile {
  token: string;
  reportId: string;
  doc: SkillsDoc;
  items: MatchEntry[];
}

/** The skills profile behind a results link, or null. Never throws. */
export async function resultsProfile(token: string | null | undefined): Promise<ResultsProfile | null> {
  if (!token || !TOKEN_PATTERN.test(token)) return null;
  try {
    const report = await getReportByToken(token);
    if (!report || !isSkillsDoc(report.skills)) return null;
    return { token, reportId: report.id, doc: report.skills, items: isMatchesDoc(report.matches) ? report.matches.items : [] };
  } catch (err) {
    console.error("[job-source] results read failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

function clip(text: string): string {
  return text.replace(/\r\n?/g, "\n").trim().slice(0, MAX_ADVERT_CHARS);
}

/** A job from a results page's stored list, with the fullest advert text we can get. */
export async function jobFromResults(token: string, jobId: string): Promise<PackJob | null> {
  if (!TOKEN_PATTERN.test(token) || !/^[a-z-]+_[A-Za-z0-9_.:-]{1,120}$/.test(jobId)) return null;
  let report;
  try {
    report = await getReportByToken(token);
  } catch {
    return null;
  }
  const snapshot = report ? snapshotFrom(report.matches) : null;
  const j = snapshot?.jobs.find((x) => x.id === jobId);
  if (!j) return null;
  const base: PackJob = {
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    source: j.source,
    sourceLabel: j.sourceLabel,
    jobId: j.id,
    description: j.snippet,
    fullText: false,
    ...(j.salary ? { salary: j.salary } : {}),
  };
  if (j.source === "reed") {
    const details = await reedDetails([j.id], 5000, 1);
    const d = details.get(j.id);
    if (d?.text) return { ...base, description: clip(d.text), fullText: true };
    return base;
  }
  if (j.source === "mms") {
    const posted = await jobFromMms(j.id.replace(/^mms_/, ""));
    return posted ?? null;
  }
  return base;
}

/** A job posted on MatchMySkillset, while it is live. */
export async function jobFromMms(id: string): Promise<PackJob | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    const row = await getMmsJobRow(id);
    if (!row || !isLiveRow(row)) return null;
    const salary = mmsSalaryText(row);
    return {
      title: row.title,
      company: row.company_name,
      location: mmsLocationText(row),
      url: `/jobs/mms/${row.id}`,
      source: "mms",
      sourceLabel: "Posted on MatchMySkillset",
      jobId: `mms_${row.id}`,
      description: clip(row.description),
      fullText: true,
      ...(salary ? { salary } : {}),
    };
  } catch (err) {
    console.error("[job-source] mms job read failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export interface SkillCheck {
  /** Skill names in the advert that the CV shows. */
  shown: string[];
  /** Skill names in the advert that the CV does not show, not even a related skill. */
  notShown: string[];
  /** Every taxonomy skill the CV shows. */
  cvSkillIds: Set<string>;
}

/** Which of the advert's skills the CV shows, from our skills list. Deterministic. */
export function skillCheck(job: Pick<PackJob, "title" | "description">, cvText: string, profile: ResultsProfile | null): SkillCheck {
  const cvSkillIds = new Set<string>([...skillsInText(cvText).map((h) => h.id), ...(profile?.doc.skills ?? []).map((s) => s.id)]);
  const shown: string[] = [];
  const notShown: string[] = [];
  for (const hit of skillsInText(job.description, job.title)) {
    if (cvSkillIds.has(hit.id)) shown.push(skillName(hit.id));
    else if (![...cvSkillIds].some((id) => areRelated(id, hit.id))) notShown.push(skillName(hit.id));
  }
  return { shown: shown.slice(0, 20), notShown: notShown.slice(0, 20), cvSkillIds };
}

/** Taxonomy ids named in a short phrase (for the key skills check). */
export function skillIdsOf(phrase: string): string[] {
  return skillsInText(phrase).map((h) => h.id);
}

/**
 * The match for this advert on the person's results profile (fit.ts), the
 * same number the results page shows. Null match without a results profile.
 */
export function packFit(job: Pick<PackJob, "title" | "description" | "fullText">, profile: ResultsProfile | null, check: SkillCheck): PackFit {
  if (!profile) return { match: null, explain: null, matched: check.shown, missing: check.notShown };
  const fit = scoreJobFit({ title: job.title, text: `${job.title}. ${job.description}`, fullText: job.fullText }, fitContextFromDoc(profile.doc, profile.items));
  return {
    match: fit.match,
    explain: fit.explain,
    matched: fit.matched.map(skillName),
    missing: fit.missing.map(skillName),
  };
}
