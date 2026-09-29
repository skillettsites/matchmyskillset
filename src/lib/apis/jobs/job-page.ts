// Job pages (/jobs/<id>): one advert from another board, with everything the
// board gives us about it. Server code only.
//
// Where the advert comes from:
//   * Reed and GOV.UK Teaching Vacancies: read live by id (the whole advert,
//     pay, contract and dates), cached for six hours.
//   * Everything else: mms_job_listings, written when a job search or a
//     results page shows the advert (migration 011). Himalayas sends the whole
//     advert with its search results and has no way to ask for one job later,
//     so it is kept then. Adzuna only ever sends the first 500 or so
//     characters, and Remotive none, so their pages say where the full advert is.
//   * A results page's snapshot, when the job is in it and nothing else answers.
//
// Adverts are turned into plain blocks (headings, paragraphs, list items):
// no HTML from another site is ever rendered.

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { JobListing, SourceId } from "./types";
import type { MatchedJob } from "./match";
import { SourceHttpError, fetchJson, formatSalary, isoOrUndefined, parseUkDate, stripHtml, tidyLocation } from "./util";

export interface AdvertBlock {
  k: "h" | "p" | "li";
  t: string;
}

export interface JobView {
  id: string;
  source: SourceId;
  sourceLabel: string;
  title: string;
  company: string;
  location: string;
  /** The original advert. Apply links always go here. */
  url: string;
  salary?: string;
  /** "Permanent, full time", as the board gives it. */
  contract?: string;
  postedAt?: string;
  closesAt?: string;
  remote?: boolean;
  advert: AdvertBlock[];
  /** True when `advert` is the whole advert, false when it is the summary the board shares. */
  full: boolean;
}

const MAX_ADVERT_CHARS = 15_000;
const MAX_BLOCKS = 300;

// ---------------------------------------------------------------------------
// Advert text
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201d",
  ldquo: "\u201c",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  pound: "£",
  euro: "€",
  bull: "\u2022",
  middot: "\u00b7",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, e: string) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? Number.parseInt(e.slice(2), 16) : Number.parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 31 && n < 0x110000 ? String.fromCodePoint(n) : " ";
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? whole;
  });
}

const BULLET = /^[\u2022\u00b7\u25cf\u25aa\u2013*-]\s+/;

// Some feeds reach the boards as one flat run of text ("...too.Key job
// responsibilities- Proactive maintenance - Carry out repairs - ..."): a full
// stop running into a capital starts a new paragraph, and three or more
// " - Capital" items make a list. Words run together ("sitesA day") are left
// as they are: splitting them would also split JavaScript or SharePoint.
const GLUED_SENTENCE = /(?<=[a-z)][.!?])(?=[A-Z][a-z])/;
const DASH_ITEM = /\s?-\s+(?=[A-Z])/g;

function unflatten(b: AdvertBlock): AdvertBlock[] {
  if (b.k !== "p") return [b];
  const out: AdvertBlock[] = [];
  for (const para of b.t.split(GLUED_SENTENCE)) {
    const t = para.trim();
    if (!t) continue;
    if ((t.match(DASH_ITEM)?.length ?? 0) >= 3) {
      const [lead, ...items] = t.split(DASH_ITEM).map((x) => x.trim());
      if (lead) out.push({ k: "p", t: lead });
      for (const item of items) if (item) out.push({ k: "li", t: item });
    } else out.push({ k: "p", t });
  }
  return out;
}

/** Paragraphs that are really lists ("\u2022 one \u2022 two") become list items; "Skills:" lines become headings. */
function tidyBlocks(input: AdvertBlock[]): AdvertBlock[] {
  const raw = input.flatMap(unflatten);
  const out: AdvertBlock[] = [];
  let total = 0;
  outer: for (const b of raw) {
    const parts =
      b.k === "p" && (b.t.match(/\u2022/g)?.length ?? 0) >= 2
        ? b.t
            .split(/\s*\u2022\s*/)
            .map((x) => x.trim())
            .filter(Boolean)
            .map((t, i): AdvertBlock => ({ k: i === 0 && !b.t.trim().startsWith("\u2022") ? "p" : "li", t }))
        : [b];
    for (const p of parts) {
      let block = p;
      if (block.k === "p" && BULLET.test(block.t)) block = { k: "li", t: block.t.replace(BULLET, "") };
      if (block.k === "p" && block.t.length <= 60 && /:$/.test(block.t)) block = { k: "h", t: block.t.replace(/:$/, "") };
      if (!block.t) continue;
      if (total + block.t.length > MAX_ADVERT_CHARS || out.length >= MAX_BLOCKS) break outer;
      total += block.t.length;
      out.push(block);
    }
  }
  // A short line with no full stop just before a list is that list's heading ("Key job responsibilities").
  return out.map((b, i) => (b.k === "p" && b.t.length <= 60 && !/[.!?]$/.test(b.t) && out[i + 1]?.k === "li" ? { k: "h", t: b.t } : b));
}

/** Plain text (no tags) into blocks: blank lines split paragraphs, bullet lines become list items. */
export function textToBlocks(text: string): AdvertBlock[] {
  const raw: AdvertBlock[] = [];
  for (const para of decodeEntities(text).split(/\n\s*\n/)) {
    const lines = para
      .split("\n")
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    let buf: string[] = [];
    const flush = () => {
      if (buf.length) raw.push({ k: "p", t: buf.join(" ") });
      buf = [];
    };
    for (const line of lines) {
      if (BULLET.test(line)) {
        flush();
        raw.push({ k: "li", t: line.replace(BULLET, "") });
      } else buf.push(line);
    }
    flush();
  }
  return tidyBlocks(raw);
}

const BREAK_TAGS = new Set(["p", "div", "ul", "ol", "tr", "table", "section", "article", "blockquote", "dd", "dt", "hr", "header", "footer"]);

/** An advert's HTML into blocks. Only the text is kept; every tag, link and style is dropped. */
export function htmlToBlocks(html: string | null | undefined): AdvertBlock[] {
  if (!html) return [];
  if (!/<[a-z!/]/i.test(html)) return textToBlocks(html);
  const src = html.replace(/<(script|style|head|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  const raw: AdvertBlock[] = [];
  let kind: AdvertBlock["k"] = "p";
  let buf = "";
  let bold = 0;
  let boldChars = 0;
  const flush = () => {
    const t = buf.replace(/\s+/g, " ").trim();
    if (t) {
      // A short paragraph that is all bold reads as a heading ("Responsibilities").
      const allBold = kind === "p" && t.length <= 80 && boldChars >= t.replace(/\s/g, "").length * 0.9;
      raw.push({ k: allBold ? "h" : kind, t });
    }
    buf = "";
    boldChars = 0;
    kind = "p";
  };
  const re = /<\/?([a-z][a-z0-9]*)\b[^>]*>|([^<]+)|</gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[2] !== undefined) {
      const text = decodeEntities(m[2]);
      buf += text;
      if (bold > 0) boldChars += text.replace(/\s/g, "").length;
      continue;
    }
    if (!m[1]) {
      buf += "<";
      continue;
    }
    const tag = m[1].toLowerCase();
    const closing = m[0][1] === "/";
    if (tag === "b" || tag === "strong") {
      bold = Math.max(0, bold + (closing ? -1 : 1));
    } else if (tag === "br") {
      if (kind === "li") buf += " ";
      else flush();
    } else if (tag === "li") {
      flush();
      if (!closing) kind = "li";
    } else if (/^h[1-6]$/.test(tag)) {
      flush();
      if (!closing) kind = "h";
    } else if (BREAK_TAGS.has(tag)) {
      flush();
    }
  }
  flush();
  return tidyBlocks(raw);
}

// ---------------------------------------------------------------------------
// Views from what we already hold
// ---------------------------------------------------------------------------

/** What a job page shows for an advert from a search or a results page. Null for our own posted jobs (they have /jobs/mms/<id>). */
export function listingToView(j: JobListing): JobView | null {
  if (j.source === "mms") return null;
  const whole = j.advertHtml ? htmlToBlocks(j.advertHtml) : [];
  return {
    id: j.id,
    source: j.source,
    sourceLabel: j.sourceLabel,
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    ...(j.salary ? { salary: j.salary } : {}),
    ...(j.contractType ? { contract: j.contractType } : {}),
    ...(j.postedAt ? { postedAt: j.postedAt } : {}),
    ...(j.remote === "yes" ? { remote: true } : {}),
    advert: whole.length ? whole : textToBlocks(j.text || j.snippet || ""),
    full: whole.length > 0,
  };
}

/** The same from a results page's stored match (the summary only). */
export function matchedToView(m: MatchedJob): JobView {
  return {
    id: m.id,
    source: m.source,
    sourceLabel: m.sourceLabel,
    title: m.title,
    company: m.company,
    location: m.location,
    url: m.url,
    ...(m.salary ? { salary: m.salary } : {}),
    ...(m.contractText ? { contract: m.contractText } : {}),
    ...(m.postedAt ? { postedAt: m.postedAt } : {}),
    ...(m.workplace === "remote" ? { remote: true } : {}),
    advert: textToBlocks(m.snippet || ""),
    full: false,
  };
}

function isListingsMissing(error: { code?: string; message?: string }): boolean {
  return error.code === "42P01" || error.code === "PGRST205" || /mms_job_listings/.test(error.message ?? "");
}

/** Keeps the adverts just shown, so their job pages open later. Never throws. */
export async function rememberListings(jobs: JobListing[]): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const now = new Date().toISOString();
  const seen = new Set<string>();
  const rows: { id: string; source: string; listing: JobView; last_seen_at: string }[] = [];
  for (const j of jobs) {
    if (seen.has(j.id)) continue;
    const view = listingToView(j);
    if (!view) continue;
    seen.add(j.id);
    rows.push({ id: j.id, source: j.source, listing: view, last_seen_at: now });
    if (rows.length >= 200) break;
  }
  if (!rows.length) return;
  try {
    const { error } = await createAdminClient().from("mms_job_listings").upsert(rows, { onConflict: "id" });
    if (error && !isListingsMissing(error)) console.error("[job-page] remember failed:", error.message);
  } catch (err) {
    console.error("[job-page] remember failed:", err instanceof Error ? err.message : err);
  }
}

/** Deletes adverts nobody has been shown for 14 days (daily cron). */
export async function forgetOldListings(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const cutoff = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const { data, error } = await createAdminClient().from("mms_job_listings").delete().lt("last_seen_at", cutoff).select("id");
  if (error) {
    if (!isListingsMissing(error)) console.error("[job-page] cleanup failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

async function storedView(id: string): Promise<JobView | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await createAdminClient().from("mms_job_listings").select("listing").eq("id", id).maybeSingle();
  if (error) {
    if (!isListingsMissing(error)) console.error("[job-page] read failed:", error.message);
    return null;
  }
  return (data?.listing as JobView | undefined) ?? null;
}

// ---------------------------------------------------------------------------
// Boards we can ask for one advert
// ---------------------------------------------------------------------------

// Reed's job details endpoint (GET /api/1.0/jobs/{jobId}, checked 29 September
// 2026): employerName, jobTitle, locationName, minimumSalary, maximumSalary,
// currency, salaryType ("per annum"...), datePosted and expirationDate
// (dd/mm/yyyy), contractType, partTime, fullTime, jobUrl and the whole
// jobDescription as HTML. Salary fields are null when the employer hides pay.
interface ReedFull {
  employerName?: string | null;
  jobTitle?: string | null;
  locationName?: string | null;
  minimumSalary?: number | null;
  maximumSalary?: number | null;
  currency?: string | null;
  salaryType?: string | null;
  datePosted?: string | null;
  expirationDate?: string | null;
  jobUrl?: string | null;
  partTime?: boolean | null;
  fullTime?: boolean | null;
  contractType?: string | null;
  jobDescription?: string | null;
}

const REED_PERIOD: Record<string, string> = {
  "per annum": "a year",
  "per month": "a month",
  "per week": "a week",
  "per day": "a day",
  "per hour": "an hour",
};

const reedJobView = unstable_cache(
  async (jobId: string): Promise<JobView | null> => {
    const key = env("REED_API_KEY");
    if (!key || !/^[0-9]{1,12}$/.test(jobId)) return null;
    const auth = Buffer.from(`${key}:`).toString("base64");
    let d: ReedFull;
    try {
      d = await fetchJson<ReedFull>(`https://www.reed.co.uk/api/1.0/jobs/${jobId}`, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" }, 5000);
    } catch (err) {
      if (err instanceof SourceHttpError && err.status === 404) return null;
      throw err;
    }
    if (!d.jobTitle || !d.jobUrl) return null;
    const hours = d.partTime ? "part time" : d.fullTime ? "full time" : "";
    const contract = [d.contractType, hours].filter(Boolean).join(", ");
    const salary = formatSalary(d.minimumSalary ?? undefined, d.maximumSalary ?? undefined, d.currency || "GBP", REED_PERIOD[(d.salaryType ?? "").toLowerCase()]);
    const posted = parseUkDate(d.datePosted);
    const closes = parseUkDate(d.expirationDate);
    return {
      id: `reed_${jobId}`,
      source: "reed",
      sourceLabel: "Reed",
      title: stripHtml(d.jobTitle, 200),
      company: d.employerName || "Employer not named",
      location: tidyLocation(d.locationName) || "UK",
      url: d.jobUrl,
      ...(salary ? { salary } : {}),
      ...(contract ? { contract } : {}),
      ...(posted ? { postedAt: posted } : {}),
      ...(closes ? { closesAt: closes } : {}),
      advert: htmlToBlocks(d.jobDescription),
      full: true,
    };
  },
  ["mms-reed-job-page-v1"],
  { revalidate: 21_600 }
);

// GOV.UK Teaching Vacancies: GET /api/v1/jobs/<slug>.json (checked 29
// September 2026) answers with the same schema.org JobPosting as the list.
interface TvFull {
  title?: string;
  datePosted?: string;
  description?: string;
  employmentType?: string[];
  url?: string;
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string } } | { address?: { addressLocality?: string; addressRegion?: string } }[];
  baseSalary?: { value?: { value?: string | number } };
  hiringOrganization?: { name?: string };
  validThrough?: string;
}

const tvJobView = unstable_cache(
  async (slug: string): Promise<JobView | null> => {
    if (!/^[a-z0-9-]{3,200}$/.test(slug)) return null;
    let d: TvFull;
    try {
      d = await fetchJson<TvFull>(`https://teaching-vacancies.service.gov.uk/api/v1/jobs/${slug}.json`, { cache: "no-store" }, 8000);
    } catch (err) {
      if (err instanceof SourceHttpError && err.status === 404) return null;
      throw err;
    }
    if (!d.title || !d.url) return null;
    const loc = Array.isArray(d.jobLocation) ? d.jobLocation[0] : d.jobLocation;
    const a = loc?.address ?? {};
    const pay = d.baseSalary?.value?.value;
    const salary = typeof pay === "number" ? `£${pay.toLocaleString("en-GB")}` : typeof pay === "string" ? stripHtml(pay, 160) : "";
    const contract = (d.employmentType ?? []).join(", ").replace(/_/g, " ").toLowerCase();
    const posted = isoOrUndefined(d.datePosted);
    const closes = isoOrUndefined(d.validThrough);
    return {
      id: `teaching-vacancies_${slug}`,
      source: "teaching-vacancies",
      sourceLabel: "GOV.UK Teaching Vacancies",
      title: d.title,
      company: d.hiringOrganization?.name || "School",
      location: [a.addressLocality, a.addressRegion].filter(Boolean).join(", ") || "England",
      url: d.url,
      ...(salary ? { salary } : {}),
      ...(contract ? { contract } : {}),
      ...(posted ? { postedAt: posted } : {}),
      ...(closes ? { closesAt: closes } : {}),
      advert: htmlToBlocks(d.description),
      full: true,
    };
  },
  ["mms-tv-job-page-v1"],
  { revalidate: 21_600 }
);

// ---------------------------------------------------------------------------
// Loading a job page
// ---------------------------------------------------------------------------

const LISTING_ID = /^(reed|adzuna|teaching-vacancies|himalayas|remotive|careerjet|jooble)_([A-Za-z0-9._-]{1,200})$/;

/** The board and its own id for a listing id ("reed_57381080"), or null if it is not one. */
export function parseListingId(id: string): { source: SourceId; boardId: string } | null {
  const m = LISTING_ID.exec(id);
  return m ? { source: m[1] as SourceId, boardId: m[2] } : null;
}

async function liveView(source: SourceId, boardId: string): Promise<JobView | null> {
  if (source === "reed") return reedJobView(boardId);
  if (source === "teaching-vacancies") return tvJobView(boardId);
  return null;
}

/** Everything we can show for one advert: read live where the board allows, else what we kept. */
export const loadJobView = cache(async (id: string): Promise<JobView | null> => {
  const parsed = parseListingId(id);
  if (!parsed) return null;
  const [live, stored] = await Promise.all([
    liveView(parsed.source, parsed.boardId).catch((err) => {
      console.warn(`[job-page] live read ${id} failed:`, err instanceof Error ? err.message : err);
      return null;
    }),
    storedView(id).catch(() => null),
  ]);
  return live ?? stored;
});
