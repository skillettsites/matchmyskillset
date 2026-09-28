// The list of jobs a person can start from on /discover: the 141 curated
// occupations in @/data/careers plus the common starting jobs in
// starting-jobs.ts. Server-side only (it pulls in the careers dataset).

import { CAREER_OCCUPATIONS, getCareerOccupation } from "@/data/careers";
import { STARTING_JOBS as CARRY_OVER_JOBS } from "@/app/transferable-skills/starting-jobs";
import { normaliseTitle, rankTitles, type TitleCandidate } from "./fuzzy";
import { STARTING_JOBS, getStartingJob } from "./starting-jobs";
import type { ProfileSkill } from "./profile";

export interface JobIndexEntry extends TitleCandidate {
  /** "occ:<occupation id>" for curated occupations, "job:<key>" for starting jobs. */
  key: string;
  title: string;
  aliases: string[];
}

export interface CurrentJob {
  key: string;
  title: string;
  soc: string;
  /** Set when the job is one of the curated occupations. */
  occupationId?: string;
  skills: { id: string; importance: number }[];
}

let INDEX: JobIndexEntry[] | null = null;

/** Compact list for the job picker: title plus the names people might type. */
export function getJobIndex(): JobIndexEntry[] {
  if (INDEX) return INDEX;
  const entries: JobIndexEntry[] = [];
  for (const o of CAREER_OCCUPATIONS) {
    const aliases = new Set<string>([...o.aliases, ...o.socIndexTitles]);
    aliases.delete(o.title);
    entries.push({ key: `occ:${o.id}`, title: o.title, aliases: [...aliases] });
  }
  for (const j of STARTING_JOBS) {
    const aliases = new Set<string>([...j.aliases, ...j.socTitles]);
    aliases.delete(j.title);
    entries.push({ key: `job:${j.key}`, title: j.title, aliases: [...aliases] });
  }
  entries.sort((a, b) => a.title.localeCompare(b.title));
  INDEX = entries;
  return entries;
}

export function getCurrentJob(key: string): CurrentJob | undefined {
  if (key.startsWith("occ:")) {
    const o = getCareerOccupation(key.slice(4));
    if (!o) return undefined;
    return {
      key,
      title: o.title,
      soc: o.soc,
      occupationId: o.id,
      skills: o.skills.map((s) => ({ id: s.skillId, importance: s.importance })),
    };
  }
  if (key.startsWith("job:")) {
    const j = getStartingJob(key.slice(4));
    if (!j) return undefined;
    return {
      key,
      title: j.title,
      soc: j.soc,
      skills: j.skills.map(([id, importance]) => ({ id, importance })),
    };
  }
  return undefined;
}

/**
 * Job index keys that have a "skills that usually carry over" list in the
 * /transferable-skills tool (src/app/transferable-skills/starting-jobs.ts),
 * mapped to that list's key.
 */
const CARRY_OVER_KEY: Record<string, string> = {
  "occ:secondary-school-teacher": "secondary-teacher",
  "job:primary-school-teacher": "primary-teacher",
  "occ:teaching-assistant": "teaching-assistant",
  "occ:nurse": "nurse",
  "occ:healthcare-assistant": "healthcare-assistant",
  "job:care-worker": "care-worker",
  "occ:social-worker": "social-worker",
  "occ:police-officer": "police-officer",
  "job:armed-forces-other-ranks": "armed-forces",
  "job:sales-assistant": "retail-assistant",
  "job:retail-manager": "retail-manager",
  "job:customer-service-adviser": "customer-service-adviser",
  "job:chef": "chef",
  "job:restaurant-manager": "hospitality-manager",
  "job:hotel-manager": "hospitality-manager",
  "job:administrator": "administrator",
  "occ:bookkeeper": "bookkeeper",
  "job:warehouse-operative": "warehouse-operative",
  "occ:hgv-driver": "hgv-driver",
};

/**
 * The skills profile used when someone starts from a job title rather than a
 * CV: the skills the job involves plus, where the /transferable-skills tool
 * lists them, the skills that usually carry over from it (for example the
 * investigation and risk work in policing). Both lists are editorial. A skill
 * in both keeps its higher importance; importance 3 or more counts as a clear
 * skill, below that as a partial one.
 */
export function jobModeSkills(current: CurrentJob): ProfileSkill[] {
  const importance = new Map<string, number>();
  for (const s of current.skills) importance.set(s.id, Math.max(importance.get(s.id) ?? 0, s.importance));
  const carryKey = CARRY_OVER_KEY[current.key];
  const carry = carryKey ? CARRY_OVER_JOBS.find((j) => j.key === carryKey) : undefined;
  for (const s of carry?.skills ?? []) importance.set(s.id, Math.max(importance.get(s.id) ?? 0, s.importance));
  return [...importance.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, imp]) => ({ id, strength: imp >= 3 ? "strong" : "some" }));
}

/** Best guesses for what a typed job title means. */
export function suggestJobs(query: string, limit = 6) {
  return rankTitles(query, getJobIndex(), limit);
}

/**
 * Maps a job title found in a CV to the job index, only when the match is
 * close. Tries the whole title and its parts, so "Head of Geography
 * (secondary school teacher)" finds "Secondary school teacher". Used for pay
 * comparison and to leave the person's own job out of their matches.
 */
export function findJobByTitle(title: string | null | undefined): CurrentJob | undefined {
  if (!title) return undefined;
  const pieces = new Set<string>([title, title.replace(/\([^)]*\)/g, " ")]);
  for (const m of title.matchAll(/\(([^)]+)\)/g)) pieces.add(m[1]);
  for (const part of title.split(/\s+[-/|]\s+|,|;|\s+at\s+/)) pieces.add(part);
  let best: { key: string; score: number } | null = null;
  for (const piece of pieces) {
    if (piece.trim().length < 3) continue;
    // The fuzzy score lets "operations" meet "operational", so a close score
    // also needs every word that says what the job is to be in the title:
    // "Operations Manager" is not "Operational risk manager".
    const top = rankTitles(piece, getJobIndex(), 5, 0.75).find((c) => contentWordsIn(c.matchedOn, piece));
    if (top && (!best || top.score > best.score)) best = { key: top.entry.key, score: top.score };
  }
  return best ? getCurrentJob(best.key) : undefined;
}

/** Words that say how a job is pitched, not what it is. */
const PITCH_WORDS = new Set(
  "manager officer assistant adviser advisor executive analyst engineer technician consultant coordinator administrator specialist operative worker lead leader supervisor director associate head senior junior trainee deputy chief principal".split(" ")
);

function wordSet(value: string): Set<string> {
  return new Set(
    normaliseTitle(value)
      .split(" ")
      .filter(Boolean)
      .map((w) => (w.length > 3 && w.endsWith("s") && !/(ss|us|is)$/.test(w) ? w.slice(0, -1) : w))
  );
}

/** True when every word of `name` that says what the work is (brackets aside) is a whole word of `title`. */
function contentWordsIn(name: string, title: string): boolean {
  const have = wordSet(title);
  for (const w of wordSet(name.replace(/\([^)]*\)/g, " "))) {
    if (PITCH_WORDS.has(w) || w === "and" || w === "of" || w === "the") continue;
    if (!have.has(w)) return false;
  }
  return true;
}
