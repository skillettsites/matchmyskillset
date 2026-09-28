// Helpers shared by the job board adapters. Server-side only.

import { normaliseTitle, titleTokens } from "@/lib/skills/fuzzy";

export class SourceHttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

/** fetch() with a hard timeout. Throws SourceHttpError for non-2xx responses. */
export async function fetchJson<T>(url: string, init: RequestInit & { next?: { revalidate?: number } }, timeoutMs: number): Promise<T> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new SourceHttpError(res.status, `HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Reed sends "17/09/2026". new Date() would read that month-first. */
export function parseUkDate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!m) return undefined;
  const [, d, mo, y] = m.map(Number) as unknown as [number, number, number, number];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCDate() !== d || date.getUTCMonth() !== mo - 1) return undefined;
  return date.toISOString();
}

export function isoOrUndefined(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const date = typeof value === "number" ? new Date(value < 1e12 ? value * 1000 : value) : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function stripHtml(value: string | undefined | null, max = 240): string {
  if (!value) return "";
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const UK_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;

/** "WC2N5HS" becomes "WC2N 5HS"; anything else is returned trimmed. */
export function tidyLocation(value: string | undefined | null): string {
  const v = (value ?? "").trim();
  const m = UK_POSTCODE.exec(v);
  return m ? `${m[1].toUpperCase()} ${m[2].toUpperCase()}` : v;
}

const CURRENCY_SYMBOL: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };

/**
 * A salary range as text. Amounts under 1,000 are almost always day or hour
 * rates; the boards do not say which, so the text says to check the advert.
 */
export function formatSalary(min: number | undefined, max: number | undefined, currency = "GBP", period?: string): string | undefined {
  const lo = min && min > 0 ? Math.round(min) : undefined;
  const hi = max && max > 0 ? Math.round(max) : undefined;
  if (!lo && !hi) return undefined;
  const sym = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  const fmt = (n: number) => `${sym}${n.toLocaleString("en-GB")}`;
  const range = lo && hi && lo !== hi ? `${fmt(lo)} to ${fmt(hi)}` : fmt((lo ?? hi)!);
  const suffix = currency !== "GBP" ? ` (${currency})` : "";
  if (period) return `${range} ${period}${suffix}`;
  // Boards rarely say so, but amounts this small are day or hour rates.
  if ((hi ?? lo ?? 0) < 1000) return `${range}${suffix} (day or hour rate, see advert)`;
  return `${range}${suffix}`;
}

/** Key for spotting the same ad on two boards (or twice on one). */
export function dedupeKey(title: string, company: string, location: string): string {
  const company2 = normaliseTitle(company).replace(/\b(ltd|limited|plc|llp|inc|uk|group)\b/g, "").trim();
  const place = normaliseTitle(location).split(" ")[0] ?? "";
  return `${normaliseTitle(title)}|${company2}|${place}`;
}

const GENERIC = new Set(["senior", "junior", "lead", "head", "trainee", "graduate", "job", "jobs", "role", "remote", "uk", "part", "time", "full", "home", "based", "entry", "level", "assistant"].map((t) => titleTokens(t)[0] ?? t));

/**
 * Is this ad about the role that was searched for? Strict mode needs the
 * last word of the search (usually the job noun, e.g. "analyst") plus at
 * least one other search word, or every search word. Loose mode needs any
 * one meaningful search word.
 */
export function titleIsRelevant(query: string, title: string, mode: "strict" | "loose"): boolean {
  const q = titleTokens(query);
  if (q.length === 0) return true;
  const t = new Set(titleTokens(title));
  const has = (tok: string) => t.has(tok) || [...t].some((x) => x.length >= 4 && tok.length >= 4 && (x.startsWith(tok) || tok.startsWith(x)));
  const found = q.filter(has);
  if (mode === "loose") {
    const meaningful = q.filter((tok) => !GENERIC.has(tok));
    return (meaningful.length ? meaningful : q).some(has);
  }
  if (q.length === 1) return found.length === 1;
  const head = q[q.length - 1];
  return found.length === q.length || (has(head) && found.length >= 2);
}

/** Remote boards: keep only roles open to someone living in the UK. */
export function ukEligible(locations: string[]): boolean {
  if (locations.length === 0) return true;
  return locations.some((l) => /\b(uk|united kingdom|great britain|england|scotland|wales|europe|emea|worldwide|anywhere|global)\b/i.test(l));
}

/** Short location label for remote roles: the UK if listed, else the region. */
export function remoteLocationLabel(locations: string[]): string {
  if (locations.length === 0) return "Remote (worldwide)";
  if (locations.some((l) => /\b(uk|united kingdom)\b/i.test(l))) return "Remote (UK eligible)";
  const first = locations.find((l) => /\b(europe|emea|worldwide|anywhere|global)\b/i.test(l));
  return first ? `Remote (${first})` : "Remote";
}
