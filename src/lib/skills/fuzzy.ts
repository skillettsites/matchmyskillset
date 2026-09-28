// Fuzzy matching of job titles. No data imports, so it runs in the browser
// (live suggestions on /discover) and on the server (mapping the job title
// found in a CV to the job index).

const STOPWORDS = new Set(["and", "of", "the", "in", "for", "a", "an", "to", "or", "with", "at", "on"]);

/** Lower case, "&" to "and", punctuation to spaces, single spaces. */
export function normaliseTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Crude stem so "teacher" meets "teaching" and "nurse" meets "nursing". */
function stem(token: string): string {
  if (token.length <= 4) return token;
  for (const suffix of ["ings", "ing", "ers", "er", "ies", "es", "s", "e"]) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 4) {
      return token.slice(0, -suffix.length);
    }
  }
  return token;
}

export function titleTokens(value: string): string[] {
  return normaliseTitle(value)
    .split(" ")
    .filter((t) => t && !STOPWORDS.has(t))
    .map(stem);
}

function tokenMatch(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return 0.8;
  return 0;
}

/**
 * How well a typed title matches a candidate title, from 0 to 1. Weighted
 * towards covering what the person typed, with a smaller weight for how much
 * of the candidate is explained, so "primary teacher" prefers
 * "Primary school teacher" over "Secondary school teacher".
 */
export function titleScore(query: string, candidate: string): number {
  const nq = normaliseTitle(query);
  const nc = normaliseTitle(candidate);
  if (!nq || !nc) return 0;
  if (nq === nc) return 1;
  const q = titleTokens(query);
  const c = titleTokens(candidate);
  if (q.length === 0 || c.length === 0) return 0;

  let qCovered = 0;
  for (const qt of q) {
    let best = 0;
    for (const ct of c) best = Math.max(best, tokenMatch(qt, ct));
    qCovered += best;
  }
  let cCovered = 0;
  for (const ct of c) {
    let best = 0;
    for (const qt of q) best = Math.max(best, tokenMatch(qt, ct));
    cCovered += best;
  }
  const score = (qCovered / q.length) * 0.7 + (cCovered / c.length) * 0.3;
  return Math.min(0.99, Math.round(score * 1000) / 1000);
}

export interface TitleCandidate {
  key: string;
  title: string;
  aliases: string[];
}

export interface RankedCandidate<T extends TitleCandidate> {
  entry: T;
  score: number;
  /** The title or alias that matched best. */
  matchedOn: string;
}

/** Ranks candidates by their best-matching title or alias. */
export function rankTitles<T extends TitleCandidate>(query: string, candidates: T[], limit = 6, minScore = 0.34): RankedCandidate<T>[] {
  const out: RankedCandidate<T>[] = [];
  for (const entry of candidates) {
    let best = 0;
    let matchedOn = entry.title;
    for (const name of [entry.title, ...entry.aliases]) {
      const s = titleScore(query, name);
      if (s > best) {
        best = s;
        matchedOn = name;
      }
    }
    if (best >= minScore) out.push({ entry, score: best, matchedOn });
  }
  out.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return out.slice(0, limit);
}
