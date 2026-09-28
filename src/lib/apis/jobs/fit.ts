// Scores one job advert against a person's skills profile. Deterministic and
// free: no model call, no randomness, so the same profile and the same advert
// always give the same score. Server-side only (it reads the careers data for
// skill rarity).
//
// The score has two parts:
//   title fit (40%)  how close the job title is to the person's own job or to
//                    one of their career matches (fuzzy title matching)
//   skills fit (60%) the share of the skills found in the advert text that the
//                    profile shows, weighted by how rare each skill is across
//                    our 141 careers (skills shown only in part count 60%,
//                    closely related skills half). Board adverts often come as
//                    a short snippet naming few skills, so below four skills
//                    part of this comes from how well the profile fits that
//                    kind of job overall (the career match score, or for the
//                    person's own job the share of its usual skills they show),
//                    scaled by the title fit.
// An advert that names fewer than four skills cannot be checked properly, so
// its match is capped: 80% with none, then 85%, 90% and 95%.

import { skillsInText } from "@/lib/skills/text-skills";
import { areRelated, skillName } from "@/lib/skills/taxonomy";
import { rarityWeight } from "@/lib/skills/scoring";
import { titleScore } from "@/lib/skills/fuzzy";
import type { ProfileSkill } from "@/lib/skills/profile";
import { titleInSentence } from "@/lib/text";

export const JOB_FIT_METHOD = "job-fit-v1";

export const JOB_FIT_SUMMARY =
  "Match is 40% title fit (how close the job title is to your own job or one of your career matches) and 60% skills fit (how many of the skills named in the advert your CV shows, with rarer skills counting for more). When an advert names fewer than four skills we recognise, part of the skills fit comes from how well your skills suit that kind of job overall (scaled by how close the title is), and the match is capped (80% when the advert names none) because we cannot check it. The same CV and advert always get the same score.";

const TITLE_WEIGHT = 0.4;
const SKILLS_WEIGHT = 0.6;
/** Adverts naming this many skills are scored on their own skills alone. */
const FULL_EVIDENCE_SKILLS = 4;
const STRENGTH = { strong: 1, some: 0.6 } as const;
const RELATED_CREDIT = 0.5;
const IN_TITLE_WEIGHT = 1.5;
/** Cap on the match when the advert names k < FULL_EVIDENCE_SKILLS skills: CAP_BASE + CAP_STEP * k. */
const CAP_BASE = 80;
const CAP_STEP = 5;

export type Track = "field" | "new";

/** Something a job title can be compared with: the person's own job or a career match. */
export interface FitAnchor {
  /** "field" for the person's own job, "new" for a career match. */
  track: Track;
  /** Title as shown, e.g. "Data analyst". */
  title: string;
  /** Title plus other names for the same job. */
  names: string[];
  /** 0 to 1: how well the profile fits this kind of job overall. */
  prior: number;
  occupationId?: string;
}

export interface FitInput {
  title: string;
  /** Advert text (title, snippet or full description). */
  text: string;
  /** Skill ids the employer tagged the job with (jobs posted on this site). */
  tagged?: string[];
}

export interface JobFit {
  /** 0 to 100. */
  match: number;
  track: Track;
  /** Title of the anchor the job was compared with. */
  anchor: string;
  occupationId?: string;
  /** 0 to 1. */
  titleFit: number;
  /** Advert skills the profile shows, rarest first (ids). */
  matched: string[];
  /** Advert skills the profile does not show, not even a related one, rarest first (ids). */
  missing: string[];
  /** How many skills we found in the advert. */
  advertSkills: number;
  /** One line on why it fits, e.g. "Uses your stakeholder management and budgeting". */
  reason: string;
  /** One line on how the number was made. */
  explain: string;
}

// A few taxonomy aliases are ordinary words in adverts: "reporting" (for
// Journalism) and "Word" (for Microsoft Office). For advert text those skills
// only count when a less ambiguous phrase is there too. (The taxonomy itself is
// shared; this guard keeps the job scores honest until it changes.)
const STRICTER: Record<string, RegExp> = {
  s313: /\b(journalis\w*|news writing|editorial|reporter)\b/i,
  s100: /\b(ms office|microsoft|excel|powerpoint|outlook|office 365|ms word)\b/i,
};

/** Skills named in advert text, minus the ambiguous-alias false alarms above. */
function advertSkills(job: FitInput): Map<string, number> {
  const found = new Map<string, number>();
  const text = `${job.title} ${job.text}`;
  for (const hit of skillsInText(job.text, job.title)) {
    const strict = STRICTER[hit.id];
    if (strict && !strict.test(text)) continue;
    found.set(hit.id, hit.inTitle ? IN_TITLE_WEIGHT : 1);
  }
  for (const id of job.tagged ?? []) if (!found.has(id)) found.set(id, 1);
  return found;
}

/** Names in the skills list that keep their capitals mid-sentence. */
const PROPER = ["Microsoft Office", "Excel", "Python", "Tableau", "Power BI", "Salesforce", "Google Workspace", "Google Analytics"];

function lowerName(id: string): string {
  let out = titleInSentence(skillName(id));
  for (const p of PROPER) {
    const i = out.toLowerCase().indexOf(p.toLowerCase());
    if (i >= 0) out = out.slice(0, i) + p + out.slice(i + p.length);
  }
  return out.replace(/^r programming$/, "R programming");
}

function listTwo(names: string[]): string {
  if (names.length <= 1) return names.join("");
  // "scheduling and coordination, and budget management" reads better than a double "and".
  return names.some((n) => / and /.test(n)) ? `${names[0]}, and ${names[1]}` : `${names[0]} and ${names[1]}`;
}

function pct(x: number): number {
  return Math.round(Math.max(0, Math.min(1, x)) * 100);
}

/**
 * The job title itself, without what boards add after it: "Retail Manager -
 * Sheffield, Meadowhall" and "Retail Manager (Maternity Cover) | Leeds" both
 * become "Retail Manager". Falls back to the whole title if little is left.
 */
export function coreTitle(title: string): string {
  const first = title
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .split(/\s+[-\u2013\u2014|:]\s+|\s+\/\s+|,/)[0]
    .replace(/\s+/g, " ")
    .trim();
  return first.length >= 3 ? first : title;
}

/** Best title match among the anchors; the person's own job wins a tie. */
export function bestAnchor(jobTitle: string, anchors: FitAnchor[]): { anchor: FitAnchor; titleFit: number } | null {
  let best: { anchor: FitAnchor; titleFit: number } | null = null;
  const core = coreTitle(jobTitle);
  for (const anchor of anchors) {
    let t = 0;
    for (const name of anchor.names) t = Math.max(t, titleScore(name, core));
    if (!best || t > best.titleFit + 1e-9 || (Math.abs(t - best.titleFit) <= 1e-9 && anchor.track === "field" && best.anchor.track !== "field")) {
      best = { anchor, titleFit: t };
    }
  }
  return best;
}

/**
 * Scores a job against the profile, comparing its title with the closest
 * anchor (the person's own job or a career match) by title.
 */
export function scoreJobFit(job: FitInput, skills: ProfileSkill[], anchors: FitAnchor[]): JobFit | null {
  const picked = bestAnchor(job.title, anchors);
  if (!picked) return null;
  const { anchor, titleFit } = picked;

  const have = new Map(skills.map((s) => [s.id, s]));
  const found = advertSkills(job);

  let total = 0;
  let credit = 0;
  const matched: { id: string; w: number }[] = [];
  const missing: { id: string; w: number }[] = [];
  for (const [id, boost] of found) {
    const w = rarityWeight(id) * boost;
    total += w;
    const direct = have.get(id);
    if (direct) {
      credit += w * STRENGTH[direct.strength];
      matched.push({ id, w });
      continue;
    }
    let best = 0;
    for (const s of skills) if (areRelated(s.id, id)) best = Math.max(best, STRENGTH[s.strength]);
    if (best > 0) credit += w * RELATED_CREDIT * best;
    else missing.push({ id, w });
  }
  const byWeight = (a: { id: string; w: number }, b: { id: string; w: number }) => b.w - a.w || a.id.localeCompare(b.id);
  matched.sort(byWeight);
  missing.sort(byWeight);

  const k = found.size;
  const advertFit = total > 0 ? credit / total : 0;
  const evidence = Math.min(1, k / FULL_EVIDENCE_SKILLS);
  // "Your fit with this kind of job" only holds as far as this is that kind of job.
  const priorPart = anchor.prior * titleFit;
  const skillsFit = evidence * advertFit + (1 - evidence) * priorPart;
  const raw = Math.round(100 * (TITLE_WEIGHT * titleFit + SKILLS_WEIGHT * skillsFit));
  const cap = k < FULL_EVIDENCE_SKILLS ? CAP_BASE + CAP_STEP * k : 100;
  const match = Math.min(raw, cap);

  const anchorPhrase = anchor.track === "field" ? `your own job (${titleInSentence(anchor.title)})` : titleInSentence(anchor.title);
  let reason: string;
  if (matched.length > 0) {
    reason = `Uses your ${listTwo(matched.slice(0, 2).map((m) => lowerName(m.id)))}`;
  } else if (titleFit >= 0.6) {
    reason =
      anchor.track === "field"
        ? `The same kind of job as yours (${titleInSentence(anchor.title)})`
        : `A ${titleInSentence(anchor.title)} job, one of your career matches`;
  } else {
    reason = `Close to ${anchorPhrase}`;
  }

  const titlePart = `Title ${pct(titleFit)}% like ${anchorPhrase}.`;
  const skillsPart =
    k === 0
      ? ` The advert names no skills we recognise, so the skills part is your fit with this kind of job (${pct(anchor.prior)}%) scaled by the title match${raw > cap ? `, capped at ${cap}%` : ""}.`
      : ` You show ${matched.length} of the ${k} skill${k === 1 ? "" : "s"} we found in the advert${k < FULL_EVIDENCE_SKILLS ? `, topped up by your fit with this kind of job (${pct(anchor.prior)}%)${raw > cap ? `, capped at ${cap}%` : ""}` : ""}.`;

  return {
    match: Math.max(0, Math.min(100, match)),
    track: anchor.track,
    anchor: anchor.title,
    ...(anchor.occupationId ? { occupationId: anchor.occupationId } : {}),
    titleFit: Math.round(titleFit * 1000) / 1000,
    matched: matched.map((m) => m.id).slice(0, 8),
    missing: missing.map((m) => m.id).slice(0, 6),
    advertSkills: k,
    reason,
    explain: `${titlePart}${skillsPart}`,
  };
}

/**
 * How well a profile fits a job's usual skills (0 to 1), with the same
 * weights as the career matching: importance times rarity, skills shown in
 * part 60%, related skills half. Used as the prior for the person's own job.
 */
export function profileFitForSkills(required: { id: string; importance: number }[], skills: ProfileSkill[]): number {
  if (required.length === 0) return 0;
  const have = new Map(skills.map((s) => [s.id, s]));
  let total = 0;
  let credit = 0;
  for (const r of required) {
    const w = r.importance * rarityWeight(r.id);
    total += w;
    const d = have.get(r.id);
    if (d) {
      credit += w * STRENGTH[d.strength];
      continue;
    }
    let best = 0;
    for (const s of skills) if (areRelated(s.id, r.id)) best = Math.max(best, STRENGTH[s.strength]);
    credit += w * RELATED_CREDIT * best;
  }
  return total > 0 ? credit / total : 0;
}

/**
 * Skills-only fit, for an application made without a results link: the share
 * of the skills named in the advert (or tagged by the employer) that the CV
 * shows, weighted by rarity, with related skills at half credit. 0 to 100.
 */
export function skillsOnlyFit(job: FitInput, skills: ProfileSkill[]): { match: number; matched: string[]; missing: string[]; advertSkills: number } {
  const have = new Map(skills.map((s) => [s.id, s]));
  const found = advertSkills(job);
  let total = 0;
  let credit = 0;
  const matched: { id: string; w: number }[] = [];
  const missing: { id: string; w: number }[] = [];
  for (const [id, boost] of found) {
    const w = rarityWeight(id) * boost;
    total += w;
    const direct = have.get(id);
    if (direct) {
      credit += w * STRENGTH[direct.strength];
      matched.push({ id, w });
      continue;
    }
    let best = 0;
    for (const s of skills) if (areRelated(s.id, id)) best = Math.max(best, STRENGTH[s.strength]);
    if (best > 0) credit += w * RELATED_CREDIT * best;
    else missing.push({ id, w });
  }
  const byWeight = (a: { id: string; w: number }, b: { id: string; w: number }) => b.w - a.w || a.id.localeCompare(b.id);
  return {
    match: total > 0 ? Math.round((credit / total) * 100) : 0,
    matched: matched.sort(byWeight).map((m) => m.id),
    missing: missing.sort(byWeight).map((m) => m.id),
    advertSkills: found.size,
  };
}

/** Skills found in a CV's text, for when there is no results profile: two or more mentions count as shown clearly. */
export function skillsFromCvText(text: string): ProfileSkill[] {
  return skillsInText(text).map((h) => ({ id: h.id, strength: h.hits >= 2 ? "strong" : "some" }));
}
