// What kind of job an advert is: which curated occupation or starting job its
// title names (so we know the skills that job usually needs), which family of
// work it belongs to, and how senior it is. Deterministic, no model calls.
// Server-side only (it reads the careers data).
//
// Titles are compared on whole words (plural "s" dropped), never on word
// prefixes, so "Account Manager" is not "Accountant" and "Nursery Nurse" is not
// "Nurse". Words like "manager", "assistant" or "technician" only say how a
// job is pitched, not what it is, so a match needs at least one word that says
// what the work is ("IT Support Technician" is not an "Accounting technician").

import { getAsheUnitGroup } from "@/data/careers";
import { getJobIndex, getCurrentJob } from "@/lib/skills/job-lookup";
import { falseFriendFamily, familyOfJobKey, keywordFamily, type RoleFamily } from "@/lib/skills/role-families";
import type { Seniority } from "@/lib/skills/profile";

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(["and", "of", "the", "in", "for", "a", "an", "to", "or", "with", "at", "on", "our", "your", "we", "you", "are", "is", "be"]);

/** Words that say nothing about the kind of work: level, contract, hours, place. */
const NEUTRAL = new Set(
  (
    "senior junior trainee graduate apprentice apprenticeship principal interim experienced qualified part registered newly " +
    "temporary temp permanent perm contract fixed term ftc month months maternity cover remote hybrid home based full time " +
    "day days night nights weekend weekends band level uk bank locum agency urgent immediate immediately start hour hours " +
    "flexible new required needed wanted opportunity job jobs role roles vacancy vacancies hiring x ii iii iv"
  ).split(" ")
);

/** Words that say how a job is pitched but not what the work is. */
const GENERIC = new Set(
  (
    "manager officer assistant adviser executive analyst engineer technician consultant coordinator admin specialist operative " +
    "worker lead leader supervisor director associate team head partner representative rep agent practitioner professional " +
    "staff clerk controller deputy chief general member"
  ).split(" ")
);

const SYNONYMS: [RegExp, string][] = [
  [/\bhuman resources?\b/g, "hr"],
  [/\bco-?ordinat/g, "coordinat"],
  [/\badvisor/g, "adviser"],
  [/\borganizer/g, "organiser"],
  [/\bcenter\b/g, "centre"],
  [/\bmgr\b/g, "manager"],
  [/\bexec\b/g, "executive"],
  [/\basst\b/g, "assistant"],
  [/\bsnr\b/g, "senior"],
  [/\bjnr\b/g, "junior"],
  [/\b(administrative|administration|administrators?|admin)\b/g, "admin"],
  [/\bbook-?keeper/g, "bookkeeper"],
  [/\bhealth ?care\b/g, "healthcare"],
];

function singular(w: string): string {
  if (w.length > 4 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.length > 3 && w.endsWith("s") && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
  return w;
}

/** Whole-word tokens of a title: lower case, singular, without neutral words and numbers. */
export function roleWords(value: string): string[] {
  let s = value.toLowerCase().replace(/&/g, " and ").replace(/[’']/g, "");
  for (const [re, to] of SYNONYMS) s = s.replace(re, to);
  return s
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w) && !NEUTRAL.has(w) && !/^\d+[a-z]{0,2}$/.test(w))
    .map(singular);
}

/**
 * The job title itself, without what boards add after it: "Retail Manager -
 * Sheffield, Meadowhall" and "Retail Manager (Maternity Cover) | Leeds" both
 * become "Retail Manager". Falls back to the whole title if little is left.
 */
export function coreTitle(title: string): string {
  const first = title
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .split(/\s+[-–—|:]\s+|\s+\/\s+|,/)[0]
    .replace(/\s+/g, " ")
    .trim();
  return first.length >= 3 ? first : title;
}

/**
 * How well a job name (an alias, or the person's own title) fits an advert
 * title, 0 to 1, on whole words. Needs at least one shared word that says
 * what the work is. 70% for how much of the name the advert covers, 30% for
 * how much of the advert the name explains.
 */
export function nameFit(name: string | string[], advertTitle: string | string[]): number {
  const n = new Set(Array.isArray(name) ? name : roleWords(name));
  const a = new Set(Array.isArray(advertTitle) ? advertTitle : roleWords(advertTitle));
  if (n.size === 0 || a.size === 0) return 0;
  let covered = 0;
  let fieldCovered = 0;
  let fieldWords = 0;
  for (const w of n) {
    const generic = GENERIC.has(w);
    if (!generic) fieldWords++;
    if (a.has(w)) {
      covered++;
      if (!generic) fieldCovered++;
    }
  }
  // A name made only of generic words ("Administrator") needs one of them.
  if (fieldWords > 0 ? fieldCovered === 0 : covered === 0) return 0;
  return Math.round((0.7 * (covered / n.size) + 0.3 * (covered / a.size)) * 1000) / 1000;
}

// ---------------------------------------------------------------------------
// Which job an advert is
// ---------------------------------------------------------------------------

export interface InferredRole {
  /** Job index key: "occ:<occupation id>" or "job:<starting job key>". */
  key: string;
  title: string;
  occupationId?: string;
  family: RoleFamily | null;
  /** The job's usual skills, from our editorial career data. */
  skills: { id: string; importance: number }[];
  /** 0 to 1. */
  score: number;
  /** Matched on a name of two or more words ("Accounts assistant"), not a single word ("Nurse"). */
  strong: boolean;
}

interface IndexName {
  key: string;
  words: string[];
}

let NAMES: IndexName[] | null = null;

function indexNames(): IndexName[] {
  if (NAMES) return NAMES;
  const out: IndexName[] = [];
  for (const entry of getJobIndex()) {
    for (const name of new Set([entry.title, ...entry.aliases])) {
      const words = [...new Set(roleWords(name))];
      if (words.length > 0) out.push({ key: entry.key, words });
    }
  }
  NAMES = out;
  return out;
}

const ROLE_CACHE = new Map<string, InferredRole | null>();

function roleFromKey(key: string, score: number, strong: boolean): InferredRole | null {
  const job = getCurrentJob(key);
  if (!job) return null;
  return { key, title: job.title, ...(job.occupationId ? { occupationId: job.occupationId } : {}), family: familyOfJobKey(key), skills: job.skills, score, strong };
}

/**
 * The curated occupation or starting job an advert title names, if one fits
 * closely: every word of one of its names must be in the title, and a name of
 * two or more words must explain at least a third of the title. A one-word
 * name ("Nurse", "Buyer") must be the last word of the title, so "Nurse
 * Manager" is not a nurse job; one-word matches are weak and only count when
 * the title's keywords agree (see classifyTitle).
 */
export function inferRole(title: string): InferredRole | null {
  const core = coreTitle(title);
  if (ROLE_CACHE.has(core)) return ROLE_CACHE.get(core)!;
  const words = roleWords(core);
  const set = new Set(words);
  let best: { key: string; score: number; strong: boolean; len: number } | null = null;
  if (words.length > 0) {
    for (const n of indexNames()) {
      if (!n.words.every((w) => set.has(w))) continue;
      if (n.words.length === 1 && words[words.length - 1] !== n.words[0]) continue;
      const cover = n.words.length / set.size;
      // A one-word name that is the title's last word names the job however long the title is
      // ("Neonatal Intensive Care Nurse"); a longer name must explain a third of the title.
      if (n.words.length > 1 && cover < 1 / 3) continue;
      const score = 0.7 + 0.3 * Math.min(1, cover);
      const strong = n.words.length >= 2;
      if (
        !best ||
        score > best.score + 1e-9 ||
        (Math.abs(score - best.score) <= 1e-9 && (n.words.length > best.len || (n.words.length === best.len && n.key.startsWith("occ:") && !best.key.startsWith("occ:"))))
      ) {
        best = { key: n.key, score, strong, len: n.words.length };
      }
    }
  }
  const role = best ? roleFromKey(best.key, Math.round(best.score * 1000) / 1000, best.strong) : null;
  if (ROLE_CACHE.size > 5000) ROLE_CACHE.clear();
  ROLE_CACHE.set(core, role);
  return role;
}

export interface AdvertKind {
  /** The family of work, when we can tell. */
  family: RoleFamily | null;
  /** The job the title names, when it names one of ours closely and agrees with the family. */
  role: InferredRole | null;
  /** How the family was found. */
  via: "false-friend" | "role" | "keywords" | null;
}

/**
 * The family of work an advert title is in: a known false friend first
 * ("Nursery Nurse"), then a close match to one of our jobs on a name of two or
 * more words, then title keywords ("Payroll", "Credit Controller"), then a
 * close match on a one-word name.
 */
export function classifyTitle(title: string): AdvertKind {
  const core = coreTitle(title);
  const role = inferRole(core);
  const ff = falseFriendFamily(core) ?? falseFriendFamily(title);
  if (ff) return { family: ff, role: role && role.family === ff ? role : null, via: "false-friend" };
  if (role?.strong) return { family: role.family, role, via: "role" };
  const kw = keywordFamily(core) ?? keywordFamily(title);
  if (kw) return { family: kw, role: role && role.family === kw ? role : null, via: "keywords" };
  if (role) return { family: role.family, role, via: "role" };
  return { family: null, role: null, via: null };
}

// ---------------------------------------------------------------------------
// Adverts only open to people in the United States
// ---------------------------------------------------------------------------

const US_STATE_NAMES =
  "Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming";
const US_STATE_CODES = "AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY";

/** Requirements that only someone licensed, registered or allowed to work in the US can meet. */
const US_ONLY_TEXT: RegExp[] = [
  /\bNCLEX\b/,
  /\b(active|current|valid|unrestricted|unencumbered)\s+(RN|LPN|LVN|APRN|NP|nursing|nurse)\s+licen[cs]e/i,
  /\b(RN|LPN|LVN|APRN|NP)\s+licen[cs](e|ure)\b/,
  new RegExp(`\\blicen[cs](ed|e|ure)\\s+(to practi[cs]e\\s+)?in\\s+(the\\s+)?(state\\s+of\\s+)?(${US_STATE_NAMES})\\b`, "i"),
  /\b(multi-?state|compact|50[- ]state|all 50 states)\s+(nursing\s+)?licen[cs]/i,
  /\bstate (board|licen[cs]e|licensure)\b/i,
  /\bU\.?S\.? citizens?(hip)?\s+(only|required|is required)\b/i,
  /\bmust be (a )?(U\.?S\.?|United States) (citizen|resident|person)/i,
  /\b(authori[sz]ed|eligible|legally able) to work in the (US|U\.S\.|USA|United States)\b/i,
  /\bmust (reside|live|be located|be based) in the (US|U\.S\.|USA|United States|continental US)\b/i,
  /\b(board[- ]certified|DEA registration|DEA licen[cs]e)\b/i,
  /\bW-?2 (employee|position)\b/i,
];

/** Titles that name a US-only licence or a US place. */
const US_ONLY_TITLE: RegExp[] = [
  /\b(PMHNP|FNP|APRN|CRNA|LPN|LVN|CNA|DNP)(-BC)?\b/,
  /\b(CPA|certified public accountant)\b/i,
  /\b(state|region|regions) licen[cs]ed\b/i,
  /\b(midwest|northeast|southeast|southwest|pacific northwest|new england)\b/i,
  new RegExp(`,\\s*(${US_STATE_CODES})\\b\\s*(\\)|$)`),
  new RegExp(`\\b(${US_STATE_NAMES})\\b`),
];

/**
 * True when an advert can only be filled by someone in the US: a US nursing
 * or accountancy licence, a US state registration, US citizenship or US work
 * authorisation. Place names in the title are only read for remote adverts
 * ("Washington" is also a town in Tyne and Wear).
 */
export function usOnly(title: string, text: string, remote: boolean): boolean {
  if (US_ONLY_TEXT.some((re) => re.test(text) || re.test(title))) return true;
  const titleRules = remote ? US_ONLY_TITLE : US_ONLY_TITLE.slice(0, 2);
  if (titleRules.some((re) => re.test(title))) return true;
  // A remote clinical role asking for a professional "license" or "licensure" (US
  // spelling; UK adverts ask for NMC, HCPC or GMC registration) needs a US licence.
  return remote && CLINICAL.test(`${title} ${text}`) && /\blicens(e|ed|ure)\b/i.test(text) && !/\b(NMC|HCPC|GMC|GPhC|GDC)\b/.test(text);
}

const CLINICAL = /\b(nurse|nurses|nursing|RN|clinical|clinician|patient care|pharmacist|therapist|physician|medical provider)\b/i;

// ---------------------------------------------------------------------------
// Seniority
// ---------------------------------------------------------------------------

/** 0 trainee or junior, 1 experienced, 2 senior or supervisor, 3 manager, 4 head or director. */
export type Level = 0 | 1 | 2 | 3 | 4;

export const LEVEL_NAMES = ["entry level", "experienced", "senior", "manager", "head or director"] as const;

/** How senior a job title is, from its wording alone. `explicit` is false when nothing in it says. */
export function titleLevel(title: string): { level: Level; explicit: boolean } {
  const t = ` ${title.toLowerCase().replace(/[^a-z0-9&]+/g, " ")} `;
  if (/ (chief|director|directors|vp|vice president|head of|head|ceo|cfo|coo|cto|cio) /.test(t) && !/ head (chef|teacher|of year|of department) /.test(t)) {
    return { level: 4, explicit: true };
  }
  if (/ (assistant|deputy|trainee|junior|jnr|associate) ([a-z]+ ){0,2}manager /.test(t) || / manager designate /.test(t)) return { level: 2, explicit: true };
  if (/ credit controller /.test(t)) return { level: 1, explicit: true };
  if (/ (manager|managers|controller|principal) /.test(t)) return { level: 3, explicit: true };
  if (/ (senior|snr|lead|supervisor|team leader|semi senior|head chef) /.test(t)) return { level: 2, explicit: true };
  if (/ (trainee|apprentice|apprenticeship|graduate|junior|jnr|entry level|school leaver|intern|internship|no experience) /.test(t)) return { level: 0, explicit: true };
  return { level: 1, explicit: false };
}

const SENIORITY_LEVEL: Record<Seniority, Level | null> = { entry: 0, experienced: 1, senior: 2, manager: 3, director: 4, unknown: null };

/** The person's level: what the CV reader said, or failing that the wording of their job title. */
export function personLevel(seniority: Seniority | null | undefined, currentRole: string | null | undefined, years: number | null | undefined): Level | null {
  const said = seniority ? SENIORITY_LEVEL[seniority] : null;
  if (said !== null && said !== undefined) return said;
  if (!currentRole) return null;
  const t = titleLevel(currentRole);
  if (typeof years === "number" && years < 1 && t.level > 0) return 0;
  return t.level;
}

/** ONS median full-time pay for the person's own job, when we recognise it. */
export function currentMedianPay(currentJobKey: string | null | undefined): number | null {
  if (!currentJobKey) return null;
  const job = getCurrentJob(currentJobKey);
  return job ? medianForSoc(job.soc) : null;
}

function medianForSoc(soc: string): number | null {
  const ug = getAsheUnitGroup(soc);
  return ug?.ft.median ?? ug?.all.median ?? null;
}

/**
 * How senior an advert is for this person: its title wording, pushed up when
 * its advertised pay is well above the ONS median for their own job (half as
 * much again is one level, more than double is two). Pay never pushes a level
 * down, because part-time and regional pay vary so much.
 */
export function advertLevel(title: string, pay: { min?: number; max?: number }, person: Level | null, median: number | null): Level {
  const t = titleLevel(title);
  let level: number = t.level;
  const annual = pay.min && pay.max ? (pay.min + pay.max) / 2 : (pay.min ?? (pay.max ? pay.max * 0.9 : undefined));
  if (person !== null && median && annual && annual >= 10_000) {
    const ratio = annual / median;
    const steps = ratio >= 2.2 ? 2 : ratio >= 1.5 ? 1 : 0;
    if (steps > 0) level = Math.max(level, Math.min(4, person + steps));
  }
  return Math.max(0, Math.min(4, level)) as Level;
}

