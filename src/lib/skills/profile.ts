// Shapes stored in mms_reports.skills and mms_reports.matches (both jsonb).
// Version 2 is the September 2026 rebuild. Raw CV text is never part of either.

export type Strength = "strong" | "some";

export type Seniority = "entry" | "experienced" | "senior" | "manager" | "director" | "unknown";

export interface ProfileSkill {
  /** Taxonomy id, e.g. "s041". */
  id: string;
  strength: Strength;
  /** A short paraphrase of where the skill shows in the CV (no names or employers). */
  evidence?: string;
}

/** What the person said matters to them. Only some flags change the ranking (see scoring.ts). */
export interface Preferences {
  noDegree: boolean;
  earnMore: boolean;
  avoidWeekends: boolean;
  wantRemote: boolean;
  avoidShifts: boolean;
  partTime: boolean;
  /** Short paraphrase of anything else they said, from the model. */
  note?: string;
}

export const NO_PREFERENCES: Preferences = {
  noDegree: false,
  earnMore: false,
  avoidWeekends: false,
  wantRemote: false,
  avoidShifts: false,
  partTime: false,
};

export type ProfileSource = "job" | "cv";

export interface SkillsDoc {
  v: 2;
  source: ProfileSource;
  skills: ProfileSkill[];
  /** 4 to 8 paraphrased achievement bullets (CV route only). */
  achievements: string[];
  /** Job title as the person gave it or as it appears in the CV. */
  currentRole: string | null;
  /** Job index key (see job-lookup.ts) when the current job was recognised. */
  currentJobKey: string | null;
  seniority: Seniority;
  yearsExperience: number | null;
  preferences: Preferences;
  /** UK region the person chose, used for live vacancy counts. */
  region: string | null;
}

export interface MatchSkillRef {
  id: string;
  /** Importance of the skill to the destination job, 1 (useful) to 5 (essential). */
  importance: number;
  /** For partial matches: the person's skill that is related to this one. */
  via?: string;
}

export interface MatchEntry {
  occupationId: string;
  /** Skill match, 0 to 100. See METHOD_SUMMARY in scoring.ts. */
  score: number;
  matched: MatchSkillRef[];
  related: MatchSkillRef[];
  gaps: MatchSkillRef[];
  /** Why a preference moved this job down the list, if it did. */
  flags: string[];
}

export interface MatchesDoc {
  v: 2;
  method: string;
  items: MatchEntry[];
}

export function isSkillsDoc(value: unknown): value is SkillsDoc {
  return Boolean(value && typeof value === "object" && (value as { v?: unknown }).v === 2 && Array.isArray((value as { skills?: unknown }).skills));
}

export function isMatchesDoc(value: unknown): value is MatchesDoc {
  return Boolean(value && typeof value === "object" && (value as { v?: unknown }).v === 2 && Array.isArray((value as { items?: unknown }).items));
}
