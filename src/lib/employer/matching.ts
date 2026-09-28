// Deterministic job-to-candidate matching for the employer side. No model
// calls: it compares taxonomy skill ids (src/data/skills-taxonomy.ts).
//
// Match % = the share of the job's skills that appear in the candidate's
// profile. Skills named in the job title count double; a skill the candidate
// shows strongly counts in full and one they show "some" of counts half.

import { SKILLS } from "@/data/skills-taxonomy";
import { getSkill, skillName } from "@/lib/skills/taxonomy";
import { skillsInText } from "@/lib/skills/text-skills";

export const MATCH_METHOD_SUMMARY =
  "Match % is the share of the skills in your advert (or your search) that appear in the candidate's profile. Skills in a job title count double, and a skill the candidate shows only some of counts half.";

export interface CandidateSkill {
  id: string;
  strength: "strong" | "some";
}

const BY_NAME = new Map(SKILLS.map((s) => [s.name.toLowerCase(), s.id]));

function toSkillId(value: unknown): string | null {
  if (typeof value === "string") {
    const text: string = value;
    return getSkill(text) ? text : (BY_NAME.get(text.trim().toLowerCase()) ?? null);
  }
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return toSkillId(o.id ?? o.skillId ?? o.skill_id ?? o.name);
  }
  return null;
}

/** Skill ids from a jsonb value: an array of ids, names, or objects with an id or name. */
export function parseSkillIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const id = toSkillId(item);
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

/** A candidate's skills with strength (anything without a strength counts as strong). */
export function parseCandidateSkills(value: unknown): CandidateSkill[] {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { skills?: unknown }).skills)
      ? (value as { skills: unknown[] }).skills
      : [];
  const out = new Map<string, CandidateSkill>();
  for (const item of list) {
    const id = toSkillId(item);
    if (!id) continue;
    const raw = item && typeof item === "object" ? (item as { strength?: unknown }).strength : undefined;
    const strength: CandidateSkill["strength"] = raw === "some" ? "some" : "strong";
    const prev = out.get(id);
    if (!prev || (prev.strength === "some" && strength === "strong")) out.set(id, { id, strength });
  }
  return [...out.values()];
}

/** Skills to tag a posted job with, strongest first (title skills first). */
export function tagJobSkills(title: string, description: string, max = 25): string[] {
  return skillsInText(description, title)
    .slice(0, max)
    .map((h) => h.id);
}

export interface JobSkillSet {
  ids: string[];
  titleIds: Set<string>;
}

export function jobSkillSet(title: string, skills: unknown): JobSkillSet {
  const ids = parseSkillIds(skills);
  const titleIds = new Set(skillsInText(title, title).map((h) => h.id));
  return { ids, titleIds };
}

export interface MatchResult {
  score: number;
  matched: string[];
  missing: string[];
}

export function matchSkills(job: JobSkillSet, candidate: CandidateSkill[]): MatchResult {
  if (job.ids.length === 0) return { score: 0, matched: [], missing: [] };
  const have = new Map(candidate.map((s) => [s.id, s.strength]));
  let total = 0;
  let got = 0;
  const matched: string[] = [];
  const missing: string[] = [];
  for (const id of job.ids) {
    const weight = job.titleIds.has(id) ? 2 : 1;
    total += weight;
    const strength = have.get(id);
    if (strength) {
      got += weight * (strength === "strong" ? 1 : 0.5);
      matched.push(id);
    } else {
      missing.push(id);
    }
  }
  return { score: Math.round((got / total) * 100), matched, missing };
}

/** A candidate's skills for a card: the ones that match first, then strong ones, as names. */
export function topSkillNames(candidate: CandidateSkill[], highlight: string[] = [], max = 8): { name: string; match: boolean }[] {
  const hi = new Set(highlight);
  return [...candidate]
    .sort((a, b) => Number(hi.has(b.id)) - Number(hi.has(a.id)) || Number(b.strength === "strong") - Number(a.strength === "strong"))
    .slice(0, max)
    .map((s) => ({ name: skillName(s.id), match: hi.has(s.id) }));
}

export { skillName };
