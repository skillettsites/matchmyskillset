// Scores one job advert against a person's skills profile. Deterministic and
// free: no model call, no randomness, so the same profile and the same advert
// always give the same score. Server-side only (it reads the careers data).
//
// The score is led by skills:
//   skills (60%)  the skills named in the advert that the profile shows,
//                 weighted by how rare each is across our 141 careers (skills
//                 shown only in part count 60%, closely related skills half),
//                 plus, at half weight, the skills our careers data says the
//                 advert's kind of job usually needs ("typical for this role").
//   role (25%)    how close the job is to the person's own job or one of their
//                 career matches: the same job, the same family of work, or
//                 shared words in the title.
//   level (15%)   how the job's seniority compares with theirs.
// Evidence caps keep thin evidence honest: 55% when there are no skills to
// check at all ("Title match only"), 70% when only the usual skills for the
// kind of job are known, 80% when the advert names one or two skills. A big
// step up (two levels or more) is capped at 60%, a big step down at 65%
// unless the person asked for less.

import { skillsInText, type TextSkillHit } from "@/lib/skills/text-skills";
import { areRelated, skillName } from "@/lib/skills/taxonomy";
import { rarityWeight } from "@/lib/skills/scoring";
import type { ProfileSkill } from "@/lib/skills/profile";
import type { RoleFamily } from "@/lib/skills/role-families";
import { capitalise, titleInSentence, withArticle } from "@/lib/text";
import { LEVEL_NAMES, advertLevel, classifyTitle, coreTitle, nameFit, roleWords, usOnly, type Level } from "./role";

export { coreTitle };

export const JOB_FIT_METHOD = "job-fit-v2";

export const JOB_FIT_SUMMARY =
  "Match is 60% skills (the skills named in the advert that your CV shows, rarer skills counting for more, plus at half weight the skills that kind of job usually needs, from our careers data), 25% how close the job is to your own job or one of your career matches, and 15% level (a big step up or down counts against it). With no skills to check, a match is capped at 55% and marked “Title match only”. The same CV and advert always get the same score.";

const SKILLS_WEIGHT = 0.6;
const ROLE_WEIGHT = 0.25;
const LEVEL_WEIGHT = 0.15;
const STRENGTH = { strong: 1, some: 0.6 } as const;
const RELATED_CREDIT = 0.5;
const IN_TITLE_WEIGHT = 1.5;
/** Usual skills for the kind of job count this much of a skill named in the advert. */
const TYPICAL_WEIGHT = 0.5;
/** A skill the advert mentions that is unrelated to its kind of job (and not one the person has) counts this much. */
const OFF_ROLE_WEIGHT = 0.3;
/** Caps for thin evidence. */
const CAP_TITLE_ONLY = 55;
const CAP_TYPICAL_ONLY = 70;
const CAP_FEW_ADVERT_SKILLS = 80;
const FULL_EVIDENCE_SKILLS = 3;
const CAP_BIG_STEP_UP = 60;
const CAP_BIG_STEP_DOWN = 65;
/** Below this title fit, an advert of unknown kind is not treated as close to any of the person's jobs. */
export const MIN_TITLE_FIT = 0.4;

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
  /** Job index key ("occ:<id>" or "job:<key>"), when the job is one of ours. */
  key?: string;
  /** Family of work (role-families.ts), when known. */
  family?: RoleFamily | null;
  /** A career the person asked for in their own words (the career matching flags it "asked"). */
  asked?: boolean;
}

/** The person, as far as level goes. */
export interface PersonFit {
  /** 0 to 4 (see role.ts), or null when we cannot tell. */
  level: Level | null;
  /** ONS median full-time pay for their own job, when we recognise it. */
  median: number | null;
  /** They asked for less stress, fewer hours or less responsibility: a step down is not held against a job. */
  easier: boolean;
}

export const UNKNOWN_PERSON: PersonFit = { level: null, median: null, easier: false };

export interface FitContext {
  skills: ProfileSkill[];
  have: Map<string, ProfileSkill>;
  anchors: FitAnchor[];
  anchorWords: string[][][];
  /** The family of the person's own job. */
  currentFamily: RoleFamily | null;
  /** Families of work the person is matched to: their own and their career matches'. */
  allowed: Set<RoleFamily>;
  person: PersonFit;
}

export function buildFitContext(anchors: FitAnchor[], skills: ProfileSkill[], person: PersonFit = UNKNOWN_PERSON): FitContext {
  const currentFamily = anchors.find((a) => a.track === "field")?.family ?? null;
  const allowed = new Set<RoleFamily>();
  for (const a of anchors) if (a.family) allowed.add(a.family);
  return {
    skills,
    have: new Map(skills.map((s) => [s.id, s])),
    anchors,
    anchorWords: anchors.map((a) => a.names.map((n) => roleWords(n))),
    currentFamily,
    allowed,
    person,
  };
}

export interface FitInput {
  title: string;
  /** Advert text: the full description when we have it, otherwise the board's summary. */
  text: string;
  /** True when `text` (or `hits`) comes from the full advert. */
  fullText?: boolean;
  /** Skills already found in the full advert (boards whose full text we do not keep). */
  hits?: TextSkillHit[];
  /** Skill ids the employer tagged the job with (jobs posted on this site). */
  tagged?: string[];
  /** Annual pay in pounds, when the advert gives it. */
  salaryMin?: number;
  salaryMax?: number;
  /** Remote-only boards and remote adverts: US place names in the title count. */
  remote?: boolean;
  /** Jobs posted on this site: shown when they name three or more of the person's skills, even when the title is new to us. */
  posted?: boolean;
  /** The board's feed already found a US-only requirement in the whole advert. */
  usFlag?: boolean;
}

export type Evidence = "advert" | "typical" | "title";
export type LevelFit = "up" | "similar" | "down";

export interface JobFit {
  /** 0 to 100. */
  match: number;
  track: Track;
  /** Title of the anchor the job was compared with. */
  anchor: string;
  occupationId?: string;
  /** 0 to 1: how close the job is to the person's own job or a career match. */
  titleFit: number;
  /** Advert skills the profile shows, rarest first (ids). */
  matched: string[];
  /** Advert skills the profile does not show, not even a related one, rarest first (ids). */
  missing: string[];
  /** Skills usual for this kind of job (our data, not the advert) that the profile shows (ids). */
  typical: string[];
  /** How many skills we found in the advert. */
  advertSkills: number;
  /** What the skills part rests on. */
  evidence: Evidence;
  /** Seniority compared with the person's, when we can tell. */
  level?: LevelFit;
  /** The kind of job the title names, from our careers data (e.g. "Accountant"). */
  role?: string;
  family?: RoleFamily | null;
  /** One line on why it fits, e.g. "Uses your stakeholder management and budgeting". */
  reason: string;
  /** How the number was made. */
  explain: string;
}

export type Assessment = { ok: true; fit: JobFit } | { ok: false; why: "off-target" | "us-only" };

/** Names in the skills list that keep their capitals mid-sentence. */
const PROPER = ["Microsoft Office", "Excel", "Python", "Tableau", "Power BI", "Salesforce", "Google Workspace", "Google Analytics", "VAT", "ITIL", "ERP", "IT", "CRM", "SQL", "SharePoint"];

function lowerName(id: string): string {
  let out = titleInSentence(skillName(id));
  for (const p of PROPER) {
    const re = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    out = out.replace(re, p);
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

/** Skills named in the advert, with a weight boost for those in the title. */
function advertSkillMap(job: FitInput): Map<string, number> {
  const found = new Map<string, number>();
  const hits = job.hits ?? skillsInText(job.text, job.title);
  for (const hit of hits) found.set(hit.id, hit.inTitle ? IN_TITLE_WEIGHT : 1);
  for (const id of job.tagged ?? []) if (!found.has(id)) found.set(id, 1);
  return found;
}

function creditFor(id: string, ctx: FitContext): { credit: number; direct: boolean } {
  const direct = ctx.have.get(id);
  if (direct) return { credit: STRENGTH[direct.strength], direct: true };
  let best = 0;
  for (const s of ctx.skills) if (areRelated(s.id, id)) best = Math.max(best, STRENGTH[s.strength]);
  return { credit: RELATED_CREDIT * best, direct: false };
}

/**
 * Level part of the score. A step down is normal when moving into a career
 * the person asked for (a store manager who wants HR starting as an HR
 * officer), so for those only a drop of three levels or more counts fully
 * against it.
 */
function levelFit(diff: number | null, easier: boolean, change: boolean): { score: number; fit?: LevelFit } {
  if (diff === null) return { score: 0.8 };
  if (diff === 0) return { score: 1, fit: "similar" };
  if (diff === 1) return { score: 0.7, fit: "up" };
  if (diff >= 2) return { score: 0.2, fit: "up" };
  if (diff === -1) return { score: easier || change ? 1 : 0.75, fit: "down" };
  if (diff === -2 && change) return { score: easier ? 1 : 0.6, fit: "down" };
  return { score: easier ? 0.9 : 0.35, fit: "down" };
}

/** A drop this big (in levels) is capped: two levels, or three for a career the person asked for. */
function bigStepDown(diff: number | null, change: boolean): boolean {
  return diff !== null && diff <= (change ? -3 : -2);
}

/**
 * Scores a job against the person and decides whether it belongs in their
 * list at all. With `filter` on (the results page and alerts), a job is left
 * out when it is in a family of work unrelated to both their own job and
 * their career matches, when its title is not close to any of them and we
 * cannot tell its family, or when only someone in the US could take it.
 */
export function assessJob(job: FitInput, ctx: FitContext, filter = true): Assessment {
  const core = coreTitle(job.title);
  const words = roleWords(core);
  const kind = classifyTitle(job.title);

  if (filter && (job.usFlag || usOnly(job.title, job.text, Boolean(job.remote)))) return { ok: false, why: "us-only" };

  // Closest anchor by title (or the same job, by key).
  let bestIdx = -1;
  let bestFit = 0;
  ctx.anchors.forEach((a, i) => {
    let f = 0;
    if (kind.role && a.key && a.key === kind.role.key) f = 1;
    else for (const n of ctx.anchorWords[i]) f = Math.max(f, nameFit(n, words));
    if (bestIdx < 0 || f > bestFit + 1e-9 || (Math.abs(f - bestFit) <= 1e-9 && a.track === "field" && ctx.anchors[bestIdx].track !== "field")) {
      bestIdx = i;
      bestFit = f;
    }
  });

  // Skills. When we know the kind of job, a skill the advert mentions that is
  // neither usual for that job (nor related to one that is) nor one the
  // person has is probably from the employer's blurb, not the job: it counts
  // for less and is not listed as something the advert asks for.
  const advert = advertSkillMap(job);
  const typicalAll = kind.role?.skills ?? [];
  const typicalIds = typicalAll.map((r) => r.id);
  const onRole = (id: string) => !kind.role || ctx.have.has(id) || typicalIds.includes(id) || typicalIds.some((t) => areRelated(t, id));
  let total = 0;
  let credit = 0;
  let k = 0;
  const matched: { id: string; w: number }[] = [];
  const missing: { id: string; w: number }[] = [];
  for (const [id, boost] of advert) {
    const relevant = boost > 1 || onRole(id);
    if (relevant) k++;
    const w = rarityWeight(id) * boost * (relevant ? 1 : OFF_ROLE_WEIGHT);
    total += w;
    const c = creditFor(id, ctx);
    credit += w * c.credit;
    if (c.direct) matched.push({ id, w });
    else if (c.credit === 0 && relevant) missing.push({ id, w });
  }
  const typical: { id: string; w: number }[] = [];
  for (const r of typicalAll) {
    if (advert.has(r.id)) continue;
    const w = rarityWeight(r.id) * (r.importance / 5) * TYPICAL_WEIGHT;
    total += w;
    const c = creditFor(r.id, ctx);
    credit += w * c.credit;
    if (c.direct) typical.push({ id: r.id, w });
  }
  const byWeight = (a: { id: string; w: number }, b: { id: string; w: number }) => b.w - a.w || a.id.localeCompare(b.id);
  matched.sort(byWeight);
  missing.sort(byWeight);
  typical.sort(byWeight);
  let skillsFit = total > 0 ? credit / total : 0;
  const evidence: Evidence = k > 0 ? "advert" : typicalAll.length > 0 ? "typical" : "title";

  if (filter) {
    const onTarget = kind.family ? ctx.allowed.has(kind.family) : bestFit >= MIN_TITLE_FIT || (Boolean(job.posted) && matched.length >= 3);
    if (!onTarget) return { ok: false, why: "off-target" };
  }

  // Role: the same job, the same family, or shared title words.
  let roleFit = bestFit;
  let anchorIdx = bestIdx;
  if (kind.family && kind.family === ctx.currentFamily) {
    roleFit = Math.max(roleFit, 0.75);
    if (bestFit < 0.5) anchorIdx = ctx.anchors.findIndex((a) => a.track === "field");
  } else if (kind.family) {
    const same = ctx.anchors.findIndex((a) => a.track === "new" && a.family === kind.family);
    if (same >= 0) {
      roleFit = Math.max(roleFit, 0.6);
      if (bestFit < 0.5) anchorIdx = same;
    }
  }
  const anchor = anchorIdx >= 0 ? ctx.anchors[anchorIdx] : undefined;
  // With no skills to check, the skills part is how well the person's skills
  // suit the job it is closest to (their own job, or a career match), scaled by
  // how close it is; the evidence cap below keeps the result low.
  if (evidence === "title") skillsFit = (anchor?.prior ?? 0) * roleFit;
  const track: Track = kind.family && ctx.currentFamily ? (kind.family === ctx.currentFamily ? "field" : "new") : anchor && bestFit >= 0.5 ? anchor.track : "new";

  // Level.
  const person = ctx.person;
  const adLevel = advertLevel(job.title, { min: job.salaryMin, max: job.salaryMax }, person.level, person.median);
  const diff = person.level === null ? null : adLevel - person.level;
  const change = track === "new" && Boolean(anchor?.asked);
  const lv = levelFit(diff, person.easier, change);

  // Score and caps.
  const raw = Math.round(100 * (SKILLS_WEIGHT * skillsFit + ROLE_WEIGHT * roleFit + LEVEL_WEIGHT * lv.score));
  const caps: { cap: number; why: string }[] = [];
  if (evidence === "title") caps.push({ cap: CAP_TITLE_ONLY, why: "we found no skills to check, so this is a title match only" });
  else if (evidence === "typical") caps.push({ cap: CAP_TYPICAL_ONLY, why: "the advert names no skills we recognise, so we used the usual skills for this kind of job" });
  else if (k < FULL_EVIDENCE_SKILLS) caps.push({ cap: CAP_FEW_ADVERT_SKILLS, why: `the advert names only ${k} skill${k === 1 ? "" : "s"} we recognise` });
  if (diff !== null && diff >= 2) caps.push({ cap: CAP_BIG_STEP_UP, why: "it is a big step up from your level" });
  if (bigStepDown(diff, change) && !person.easier) caps.push({ cap: CAP_BIG_STEP_DOWN, why: "it is a big step down from your level" });
  const binding = caps.filter((c) => raw > c.cap).sort((a, b) => a.cap - b.cap)[0];
  const match = Math.max(0, Math.min(100, binding ? binding.cap : raw));

  // Words for the card.
  const roleTitle = kind.role?.title;
  const anchorTitle = anchor?.title ?? roleTitle ?? coreTitle(job.title);
  const anchorPhrase = anchor?.track === "field" ? `your own job (${titleInSentence(anchorTitle)})` : titleInSentence(anchorTitle);
  let reason: string;
  if (matched.length > 0) {
    reason = `Uses your ${listTwo(matched.slice(0, 2).map((m) => lowerName(m.id)))}`;
  } else if (typical.length > 0 && roleTitle) {
    reason = `${capitalise(withArticle(titleInSentence(roleTitle)))} job usually needs your ${listTwo(typical.slice(0, 2).map((m) => lowerName(m.id)))}`;
  } else if (track === "field" && anchor) {
    reason = `The same line of work as your own job (${titleInSentence(anchor.title)})`;
  } else if (anchor && anchor.track === "new" && roleFit >= 0.6) {
    reason = `${capitalise(withArticle(titleInSentence(anchor.title)))} job, one of your career matches`;
  } else {
    reason = `Close to ${anchorPhrase}`;
  }

  const where = job.fullText ? "the full advert" : "the advert summary";
  const skillsPart =
    k > 0
      ? `Skills: you show ${matched.length} of the ${k} skill${k === 1 ? "" : "s"} we found in ${where}`
      : typicalAll.length > 0
        ? `Skills: we found no skills we recognise in ${where}`
        : `Skills: we found no skills we recognise in ${where}, so this uses how well your skills suit ${anchorPhrase} (${pct(anchor?.prior ?? 0)}%), scaled by how close the job is`;
  const typicalPart =
    typicalAll.length > 0 && roleTitle
      ? `, and ${typical.length} of the ${typicalAll.filter((r) => !advert.has(r.id)).length} usual for ${withArticle(titleInSentence(roleTitle))} job (our careers data, half weight)`
      : "";
  const rolePart =
    kind.role && anchor?.key === kind.role.key
      ? anchor.track === "field"
        ? "the same job as yours"
        : `the same job as your career match ${titleInSentence(anchor.title)}`
      : kind.family && kind.family === ctx.currentFamily
        ? "the same line of work as your own job"
        : roleFit >= 0.6 && anchor
          ? `close to ${anchorPhrase}`
          : `title ${pct(bestFit)}% like ${anchorPhrase}`;
  const levelPart =
    lv.fit === "similar" ? "similar to yours" : lv.fit === "up" ? (diff! >= 2 ? "a big step up" : "a step up") : lv.fit === "down" ? (bigStepDown(diff, change) ? "a big step down" : "a step down") : "not known";
  const explain = `${skillsPart}${typicalPart} (${pct(skillsFit)}%, counts 60%). Role: ${rolePart} (${pct(roleFit)}%, counts 25%). Level: ${levelPart}${lv.fit ? ` (the advert reads as ${LEVEL_NAMES[adLevel]})` : ""}, counts 15%.${binding ? ` Capped at ${binding.cap}% because ${binding.why}.` : ""}`;

  const occupationId = anchor?.track === "new" ? anchor.occupationId : undefined;
  return {
    ok: true,
    fit: {
      match,
      track,
      anchor: anchorTitle,
      ...(occupationId ? { occupationId } : {}),
      titleFit: Math.round(roleFit * 1000) / 1000,
      matched: matched.map((m) => m.id).slice(0, 8),
      missing: missing.map((m) => m.id).slice(0, 6),
      typical: typical.map((m) => m.id).slice(0, 6),
      advertSkills: k,
      evidence,
      ...(lv.fit ? { level: lv.fit } : {}),
      ...(roleTitle ? { role: roleTitle } : {}),
      family: kind.family,
      reason,
      explain,
    },
  };
}

/** Scores a job without deciding whether to show it (a search the person typed, or an application). */
export function scoreJobFit(job: FitInput, ctx: FitContext): JobFit {
  const a = assessJob(job, ctx, false);
  if (!a.ok) throw new Error("unreachable");
  return a.fit;
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

/** Skills found in a CV's text, for when there is no results profile: two or more mentions count as shown clearly. */
export function skillsFromCvText(text: string): ProfileSkill[] {
  return skillsInText(text).map((h) => ({ id: h.id, strength: h.hits >= 2 ? "strong" : "some" }));
}
