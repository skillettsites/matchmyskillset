// The list of jobs a person can start from on /discover: the 141 curated
// occupations in @/data/careers plus the common starting jobs in
// starting-jobs.ts. Server-side only (it pulls in the careers dataset).

import { CAREER_OCCUPATIONS, getCareerOccupation } from "@/data/careers";
import { rankTitles, type TitleCandidate } from "./fuzzy";
import { STARTING_JOBS, getStartingJob } from "./starting-jobs";

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
    const [top] = rankTitles(piece, getJobIndex(), 1, 0.75);
    if (top && (!best || top.score > best.score)) best = { key: top.entry.key, score: top.score };
  }
  return best ? getCurrentJob(best.key) : undefined;
}
