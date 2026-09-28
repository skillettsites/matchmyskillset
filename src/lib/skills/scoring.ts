// Deterministic matching of a skills profile against the curated occupations.
// The same profile always gives the same scores and the same order: there is
// no model call and no randomness here.

import { CAREER_OCCUPATIONS, getAsheUnitGroup, type CareerOccupation } from "@/data/careers";
import { areRelated } from "./taxonomy";
import { normaliseTitle, titleScore } from "./fuzzy";
import type { MatchEntry, MatchSkillRef, Preferences, ProfileSkill } from "./profile";

export const SCORING_METHOD = "skills-overlap-v1";

/** One line for the results page. Keep it in step with scoreOccupation(). */
export const METHOD_SUMMARY =
  "Skill match is the share of a job's key skills, weighted by how essential each is, that we found in your profile (skills shown only in part count 60%, closely related ones half), so the same profile always gets the same score.";

const STRENGTH_WEIGHT = { strong: 1, some: 0.6 } as const;
const RELATED_CREDIT = 0.5;
/** Jobs below this skill match are not shown at all. */
const MIN_SCORE = 20;
/** Ranking multipliers for stated preferences that the occupation data can check. */
const DEGREE_PENALTY = 0.7;
const PAY_PENALTY = 0.8;
/**
 * Same ONS minor group as the current job (e.g. another teaching job for a
 * teacher): more a change of job than of career. With a near-identical skill
 * set it counts as a near-duplicate and is left out; otherwise it moves down.
 */
const SIMILAR_PENALTY = 0.75;
const NEAR_DUPLICATE_SCORE = 90;

export interface CurrentContext {
  occupationId?: string;
  soc?: string;
  /** Job title as given, used to catch near-duplicates of the person's own job. */
  title?: string | null;
}

export interface ScoreOptions {
  skills: ProfileSkill[];
  preferences: Preferences;
  current?: CurrentContext;
  limit?: number;
}

interface Scored extends MatchEntry {
  rank: number;
  pay: number | null;
}

function median(soc: string): { ft: number | null; all: number | null } {
  const ug = getAsheUnitGroup(soc);
  return { ft: ug?.ft.median ?? null, all: ug?.all.median ?? null };
}

/** Destination pay is lower than the current job's, comparing like with like. */
function paysLess(destSoc: string, currentSoc: string): boolean {
  const d = median(destSoc);
  const c = median(currentSoc);
  if (d.ft !== null && c.ft !== null) return d.ft < c.ft;
  if (d.all !== null && c.all !== null) return d.all < c.all;
  return false;
}

export function scoreOccupation(occupation: CareerOccupation, skills: ProfileSkill[]): Omit<MatchEntry, "flags"> {
  const have = new Map(skills.map((s) => [s.id, s]));
  let total = 0;
  let credit = 0;
  const matched: MatchSkillRef[] = [];
  const related: MatchSkillRef[] = [];
  const gaps: MatchSkillRef[] = [];

  for (const req of occupation.skills) {
    total += req.importance;
    const direct = have.get(req.skillId);
    if (direct) {
      credit += req.importance * STRENGTH_WEIGHT[direct.strength];
      matched.push({ id: req.skillId, importance: req.importance });
      continue;
    }
    // Best related skill the person has, strongest first, then by id for a stable result.
    let best: ProfileSkill | undefined;
    for (const s of skills) {
      if (!areRelated(s.id, req.skillId)) continue;
      if (
        !best ||
        STRENGTH_WEIGHT[s.strength] > STRENGTH_WEIGHT[best.strength] ||
        (STRENGTH_WEIGHT[s.strength] === STRENGTH_WEIGHT[best.strength] && s.id < best.id)
      ) {
        best = s;
      }
    }
    if (best) {
      credit += req.importance * RELATED_CREDIT * STRENGTH_WEIGHT[best.strength];
      related.push({ id: req.skillId, importance: req.importance, via: best.id });
    } else {
      gaps.push({ id: req.skillId, importance: req.importance });
    }
  }

  const byImportance = (a: MatchSkillRef, b: MatchSkillRef) => b.importance - a.importance || a.id.localeCompare(b.id);
  matched.sort(byImportance);
  related.sort(byImportance);
  gaps.sort(byImportance);

  return {
    occupationId: occupation.id,
    score: total > 0 ? Math.round((credit / total) * 100) : 0,
    matched,
    related,
    gaps,
  };
}

function isOwnJob(occupation: CareerOccupation, current: CurrentContext | undefined): boolean {
  if (!current) return false;
  if (current.occupationId && occupation.id === current.occupationId) return true;
  // Same ONS unit group: the same job in all but name, with the same pay.
  if (current.soc && occupation.soc === current.soc) return true;
  if (current.title) {
    const t = normaliseTitle(current.title);
    if (t && (normaliseTitle(occupation.title) === t || titleScore(current.title, occupation.title) >= 0.9)) return true;
  }
  return false;
}

/**
 * Top matches for a profile. Excludes the person's own job and anything in the
 * same ONS unit group, keeps one job per unit group (they share pay figures),
 * and moves jobs down the list, never off it, when they are in the same ONS
 * minor group as the current job (a similar job rather than a career change)
 * and for preferences the data can check: "no degree" against the degree
 * flag, "earn more" against ONS pay. The displayed score never changes.
 */
export function scoreProfile({ skills, preferences, current, limit = 8 }: ScoreOptions): MatchEntry[] {
  if (skills.length === 0) return [];
  const scored: Scored[] = [];

  for (const occupation of CAREER_OCCUPATIONS) {
    if (isOwnJob(occupation, current)) continue;
    const base = scoreOccupation(occupation, skills);
    if (base.score < MIN_SCORE || base.matched.length === 0) continue;

    const flags: string[] = [];
    let rank = base.score;
    if (current?.soc && occupation.soc.slice(0, 3) === current.soc.slice(0, 3)) {
      if (base.score >= NEAR_DUPLICATE_SCORE) continue;
      rank *= SIMILAR_PENALTY;
      flags.push("similar");
    }
    if (preferences.noDegree && occupation.degreeUsuallyRequired) {
      rank *= DEGREE_PENALTY;
      flags.push("degree");
    }
    if (preferences.earnMore && current?.soc && paysLess(occupation.soc, current.soc)) {
      rank *= PAY_PENALTY;
      flags.push("pay");
    }
    const pay = median(occupation.soc);
    scored.push({ ...base, flags, rank, pay: pay.ft ?? pay.all });
  }

  scored.sort(
    (a, b) =>
      b.rank - a.rank ||
      b.score - a.score ||
      (b.pay ?? -1) - (a.pay ?? -1) ||
      a.occupationId.localeCompare(b.occupationId)
  );

  const seenSoc = new Set<string>();
  const out: MatchEntry[] = [];
  for (const s of scored) {
    const soc = CAREER_OCCUPATIONS.find((o) => o.id === s.occupationId)?.soc ?? s.occupationId;
    if (seenSoc.has(soc)) continue;
    seenSoc.add(soc);
    const { rank: _rank, pay: _pay, ...entry } = s;
    void _rank;
    void _pay;
    out.push(entry);
    if (out.length >= limit) break;
  }
  return out;
}
