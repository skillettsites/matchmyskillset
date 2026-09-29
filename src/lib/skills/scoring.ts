// Deterministic matching of a skills profile against the curated occupations.
// The same profile always gives the same scores and the same order: there is
// no model call and no randomness here.

import { CAREER_OCCUPATIONS, getAsheUnitGroup, type CareerOccupation } from "@/data/careers";
import { areRelated } from "./taxonomy";
import { normaliseTitle, titleScore } from "./fuzzy";
import { FAMILIES, familyForSoc } from "./families";
import type { MatchEntry, MatchSkillRef, Preferences, ProfileSkill } from "./profile";

export const SCORING_METHOD = "skills-overlap-v3";

/**
 * One line for the results page, per scoring version, so an older results
 * link still describes the method that produced it. Keep the current one in
 * step with scoreOccupation() and scoreProfile().
 */
export const METHOD_SUMMARIES: Record<string, string> = {
  "skills-overlap-v1":
    "Skill match is the share of a job's key skills, weighted by how essential each is, that we found in your profile (skills shown only in part count 60%, closely related ones half), so the same profile always gets the same score.",
  "skills-overlap-v2":
    "Skill match is the share of a job's key skills that we found in your profile, weighted by how essential each skill is to the job and by how few of our 141 careers need it, so everyday skills such as communication count for less (skills shown only in part count 60%, closely related ones half). We then order the list: routes our guides suggest for your line of work and jobs you asked for move up; jobs close to your own, jobs paying over a fifth less than yours, jobs where you do not yet show the most essential skill, routes meant for other professions and jobs that clash with what you told us move down. The same profile always gets the same result.",
  // v3 (29 September 2026): the engineering and manufacturing careers were added, and a
  // job the person names in what matters to them stays on the list from a lower match.
  "skills-overlap-v3": `Skill match is the share of a job's key skills that we found in your profile, weighted by how essential each skill is to the job and by how few of our ${CAREER_OCCUPATIONS.length} careers need it, so everyday skills such as communication count for less (skills shown only in part count 60%, closely related ones half). We then order the list: routes our guides suggest for your line of work and jobs you asked for move up; jobs close to your own, jobs paying over a fifth less than yours, jobs where you do not yet show the most essential skill, routes meant for other professions and jobs that clash with what you told us move down. A job you name in what you are looking for stays on the list even when your skills match it less well, so you can see the gap. The same profile always gets the same result.`,
};

export const METHOD_SUMMARY = METHOD_SUMMARIES[SCORING_METHOD];

/** The summary for the method a stored result was scored with. */
export function methodSummary(method: string | null | undefined): string {
  return (method && METHOD_SUMMARIES[method]) || METHOD_SUMMARY;
}

const STRENGTH_WEIGHT = { strong: 1, some: 0.6 } as const;
const RELATED_CREDIT = 0.5;
/** Jobs below this skill match are not shown at all. */
const MIN_SCORE = 20;
/**
 * A job the person named in what they are looking for ("I want to move into
 * automation") is kept from this lower match, and the best one always makes
 * the list, so someone planning a move can see what it would take.
 */
const ASKED_MIN_SCORE = 10;
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
/**
 * ONS median more than a fifth below the current job's, like for like. Moves
 * down by default; not when the person said they want less stress or fewer hours.
 */
const BIG_PAY_DROP_RATIO = 0.8;
const BIG_PAY_DROP_PENALTY = 0.6;
/** A route on the hub page for the person's line of work (see families.ts). */
const HUB_ROUTE_BOOST = 1.5;
/** Our career data marks the destination as suiting the person's line of work. */
const AUDIENCE_BOOST = 1.1;
/** The job's title or other names match something the person said they want (CV route). */
const ASKED_BOOST = 1.75;
/** None of the job's most essential skills (importance 5, or its highest) is in the profile itself. */
const CORE_GAP_PENALTY = 0.8;
/**
 * Our career data lists the job only for particular professions (no "general"
 * audience), and the person is not from one of them: for example nurse
 * educator for a teacher.
 */
const OTHER_GROUP_PENALTY = 0.8;

// ---------------------------------------------------------------------------
// Skill rarity
// ---------------------------------------------------------------------------

/**
 * How distinctive a skill is across the curated careers: ln(careers / careers
 * that need it). Attention to detail (needed by 60 of 159) weighs about 1;
 * a skill needed by one career weighs about 5.
 */
const RARITY: ReadonlyMap<string, number> = (() => {
  const counts = new Map<string, number>();
  for (const o of CAREER_OCCUPATIONS) {
    for (const id of new Set(o.skills.map((s) => s.skillId))) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const n = CAREER_OCCUPATIONS.length;
  const weights = new Map<string, number>();
  for (const [id, count] of counts) weights.set(id, Math.log(n / count));
  return weights;
})();

export function rarityWeight(skillId: string): number {
  return RARITY.get(skillId) ?? Math.log(CAREER_OCCUPATIONS.length);
}

// ---------------------------------------------------------------------------
// What the person said they want (CV route)
// ---------------------------------------------------------------------------

/** Role nouns and filler that say nothing about the kind of work. */
const IGNORED_WORDS = new Set(
  (
    "a an and or of the to in into on at by for from with as is be are was were am it its this that these those my me i " +
    "want wants wanted wanting would like likes looking look interested interest interests keen prefer prefers preferred ideally " +
    "move moving change changing switch step get getting find finding do doing use using more most better new good great something " +
    "somewhere anything role roles job jobs work working career careers field fields area areas sector sectors industry kind type " +
    "skills skill experience day days week weeks hours hour pay paid salary money earn earning earnings home online remote " +
    "people person team teams business support service services staff professional general " +
    "manager managers officer officers adviser advisers advisor advisors assistant assistants worker workers executive executives " +
    "practitioner practitioners specialist specialists coordinator coordinators lead leads leader leaders senior junior head " +
    // Words about working patterns, or that only modify a role ("operational risk analyst" is a risk job).
    "operational life balance stress shift shifts weekend weekends flexible flexibility part full time"
  ).split(" ")
);

/** Role acronyms a person may type in lower case ("hr roles"). "it" is left out: it is also a pronoun. */
const LOWER_CASE_ACRONYMS = new Set(["hr", "ux", "ui", "hgv", "lgv", "gp", "qa", "cbt", "csi", "pr", "ot", "pcso"]);

/** Words that turn the rest of their sentence into something the person does not want. */
const NEGATIONS = /^(no|not|never|without|avoid|avoiding|away|less|fewer|stop|leave|leaving|quit|hate|dislike|dislikes|don't|dont|rather|except|instead)$/;

function words(text: string): string[] {
  return text.match(/[A-Za-z][A-Za-z']*/g) ?? [];
}

/** Lower case, with a plural "s" dropped from longer words. Acronyms stay in capitals. */
function normWord(w: string): string {
  if (w.length <= 3 && w === w.toUpperCase()) return w;
  const lower = w.toLowerCase();
  if (LOWER_CASE_ACRONYMS.has(lower)) return lower.length <= 3 ? lower.toUpperCase() : lower;
  return lower.length > 4 && lower.endsWith("s") && !lower.endsWith("ss") ? lower.slice(0, -1) : lower;
}

/** HR, IT, UX, HGV: kept in capitals by normWord. */
function isAcronym(w: string): boolean {
  return w.length <= 4 && /^[A-Z&]+$/.test(w);
}

function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  // "investigations" and "investigator": long words sharing their first 8 letters
  // (7 would also pair "operations" with "operative").
  return a.length >= 8 && b.length >= 8 && a.slice(0, 8) === b.slice(0, 8);
}

/** Words the person asked for, from the short note the CV reader writes. Negated words are left out. */
export function askedTerms(note: string | undefined): string[] {
  if (!note) return [];
  const out = new Set<string>();
  for (const sentence of note.split(/[.;!?]|\bbut\b|\bhowever\b/i)) {
    for (const raw of words(sentence)) {
      if (NEGATIONS.test(raw.toLowerCase())) break;
      // Two and three letter words count only as acronyms (HR, IT, UX, or "hr"), never "it" or "and".
      if (raw.length <= 3 && raw !== raw.toUpperCase() && !LOWER_CASE_ACRONYMS.has(raw.toLowerCase())) continue;
      const w = normWord(raw);
      if (w.length < 2 || (!isAcronym(w) && IGNORED_WORDS.has(w))) continue;
      out.add(w);
    }
  }
  return [...out];
}

const TITLE_WORDS = new Map<string, string[]>(
  CAREER_OCCUPATIONS.map((o) => {
    const set = new Set<string>();
    for (const name of [o.title, ...o.aliases]) {
      for (const raw of words(name)) {
        if (raw.length <= 3 && raw !== raw.toUpperCase()) continue;
        const w = normWord(raw);
        if (w.length >= 2 && (isAcronym(w) || !IGNORED_WORDS.has(w))) set.add(w);
      }
    }
    return [o.id, [...set]];
  })
);

function matchesAsked(occupation: CareerOccupation, terms: string[]): boolean {
  if (terms.length === 0) return false;
  const titleWords = TITLE_WORDS.get(occupation.id) ?? [];
  return terms.some((t) => titleWords.some((w) => sameWord(t, w)));
}

const EASIER = /\b(stress|stressful|pressure|burn ?out|burnt out|calmer|slower pace|fewer hours|shorter hours|less hours|reduced hours|part[- ]time|work[- ]life balance)\b/i;

/** The person said they want less stress or fewer hours, so lower pay is not held against a job. */
export function wantsEasierWork(preferences: Preferences): boolean {
  return preferences.partTime || EASIER.test(preferences.note ?? "");
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

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

/** Destination median over current median, comparing like with like, or null. */
function payRatio(destSoc: string, currentSoc: string): number | null {
  const d = median(destSoc);
  const c = median(currentSoc);
  if (d.ft !== null && c.ft !== null && c.ft > 0) return d.ft / c.ft;
  if (d.all !== null && c.all !== null && c.all > 0) return d.all / c.all;
  return null;
}

export function scoreOccupation(occupation: CareerOccupation, skills: ProfileSkill[]): Omit<MatchEntry, "flags"> {
  const have = new Map(skills.map((s) => [s.id, s]));
  let total = 0;
  let credit = 0;
  const matched: MatchSkillRef[] = [];
  const related: MatchSkillRef[] = [];
  const gaps: MatchSkillRef[] = [];

  for (const req of occupation.skills) {
    const weight = req.importance * rarityWeight(req.skillId);
    total += weight;
    const direct = have.get(req.skillId);
    if (direct) {
      credit += weight * STRENGTH_WEIGHT[direct.strength];
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
      credit += weight * RELATED_CREDIT * STRENGTH_WEIGHT[best.strength];
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
 * same ONS unit group, and keeps one job per unit group (they share pay
 * figures) unless the person asked for the second one by name.
 *
 * The order starts from the skill match and then moves jobs up or down, never
 * off the list: up for routes on the hub page for the person's line of work
 * (and, less, for destinations our data marks as suiting it) and for jobs they
 * named in what matters to them; down for jobs in the same ONS minor group as
 * the current job (a similar job rather than a career change), for routes our
 * data lists only for other professions, for jobs whose most essential skill
 * the profile lacks, for ONS pay more than a fifth below the current job's
 * unless they want less stress or fewer hours, and for preferences the data
 * can check: "no degree" against the degree flag, "earn more" against ONS pay.
 * The displayed score never changes, and each move is recorded in `flags` for
 * the results page.
 */
export function scoreProfile({ skills, preferences, current, limit = 8 }: ScoreOptions): MatchEntry[] {
  if (skills.length === 0) return [];
  const scored: Scored[] = [];
  const family = familyForSoc(current?.soc);
  const familySpec = family ? FAMILIES[family] : null;
  const asked = askedTerms(preferences.note);
  const easier = wantsEasierWork(preferences);

  for (const occupation of CAREER_OCCUPATIONS) {
    if (isOwnJob(occupation, current)) continue;
    const base = scoreOccupation(occupation, skills);
    const wanted = matchesAsked(occupation, asked);
    if (base.score < (wanted ? ASKED_MIN_SCORE : MIN_SCORE) || base.matched.length === 0) continue;

    const flags: string[] = [];
    let rank = base.score;
    const hubRoute = Boolean(familySpec?.routes.includes(occupation.id));
    const forYourGroup = Boolean(familySpec?.audience && occupation.audiences.includes(familySpec.audience));

    if (hubRoute) {
      rank *= HUB_ROUTE_BOOST;
      flags.push("route");
    } else if (forYourGroup) {
      rank *= AUDIENCE_BOOST;
      flags.push("audience");
    } else if (!occupation.audiences.includes("general")) {
      rank *= OTHER_GROUP_PENALTY;
      flags.push("other");
    }
    if (wanted) {
      rank *= ASKED_BOOST;
      flags.push("asked");
    }
    const top = Math.max(...occupation.skills.map((r) => r.importance));
    if (!occupation.skills.some((r) => r.importance === top && base.matched.some((m) => m.id === r.skillId))) {
      rank *= CORE_GAP_PENALTY;
      flags.push("core");
    }
    // A hub route is a career change the hub page recommends, even when ONS
    // puts it in the same minor group (police officer to fraud investigator).
    if (!hubRoute && current?.soc && occupation.soc.slice(0, 3) === current.soc.slice(0, 3)) {
      if (base.score >= NEAR_DUPLICATE_SCORE) continue;
      rank *= SIMILAR_PENALTY;
      flags.push("similar");
    }
    if (preferences.noDegree && occupation.degreeUsuallyRequired) {
      rank *= DEGREE_PENALTY;
      flags.push("degree");
    }
    const ratio = current?.soc ? payRatio(occupation.soc, current.soc) : null;
    if (ratio !== null && ratio < BIG_PAY_DROP_RATIO && !easier) {
      rank *= BIG_PAY_DROP_PENALTY;
      if (preferences.earnMore) rank *= PAY_PENALTY;
      flags.push("paydrop");
    } else if (ratio !== null && ratio < 1 && preferences.earnMore) {
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
    // One job per unit group (they share a pay figure), except a job the person asked for by name.
    if (seenSoc.has(soc) && !s.flags.includes("asked")) continue;
    seenSoc.add(soc);
    const { rank: _rank, pay: _pay, ...entry } = s;
    void _rank;
    void _pay;
    out.push(entry);
    if (out.length >= limit) break;
  }
  // The best job the person asked for by name always makes the list, in the last place if need be.
  const bestAsked = scored.find((s) => s.flags.includes("asked"));
  if (bestAsked && !out.some((e) => e.flags.includes("asked"))) {
    const { rank: _rank, pay: _pay, ...entry } = bestAsked;
    void _rank;
    void _pay;
    if (out.length >= limit) out.pop();
    out.push(entry);
  }
  return out;
}
