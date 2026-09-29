// Live jobs for one person's results: gathers adverts for their own job and
// their top career matches, near where they said they are, from every active
// board plus the jobs posted on MatchMySkillset, scores each against their
// skills (fit.ts), drops adverts that are not their kind of work, and keeps
// the list with their results so a reload is instant and costs no API calls.
// Server-side only.
//
// Board quotas are protected three ways: a fixed number of calls per pass per
// board (below), Adzuna's shared daily budget (sources.ts), and the snapshot:
// one pass is stored in mms_reports.matches.jobs and reused for 12 hours.
// Reed's search only gives the start of each advert, so the best Reed matches
// are read in full (at most READ_IN_FULL per results link, cached for a day
// per advert) before the list is stored.

import { getCareerOccupation } from "@/data/careers";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { regionByName, type UkRegion } from "@/lib/apis/regions";
import { getCurrentJob, getJobIndex, type CurrentJob } from "@/lib/skills/job-lookup";
import type { MatchEntry, ProfileSkill, SkillsDoc } from "@/lib/skills/profile";
import { familyOfJobKey, familyOfOccupation } from "@/lib/skills/role-families";
import { wantsEasierWork } from "@/lib/skills/scoring";
import { skillName } from "@/lib/skills/taxonomy";
import { titleScore } from "@/lib/skills/fuzzy";
import { runSource, type SourceRun } from "./index";
import { isLiveRow, listLiveMmsJobs } from "./mms";
import { regionsForLocations } from "./place-region";
import { reedDetails } from "./sources";
import {
  JOB_FIT_METHOD,
  assessJob,
  buildFitContext,
  coreTitle,
  profileFitForSkills,
  type Evidence,
  type FitAnchor,
  type FitContext,
  type FitInput,
  type JobFit,
  type LevelFit,
  type PersonFit,
  type Track,
} from "./fit";
import { classifyTitle, currentMedianPay, personLevel } from "./role";
import type { JobListing, JobQuery, SourceId, Workplace } from "./types";
import { dedupeKey, titleIsRelevant } from "./util";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Scope = "near" | "region" | "uk" | "remote";
export type ContractKind = "permanent" | "contract" | "temporary" | "apprenticeship";

export interface MatchedJob {
  key: string;
  id: string;
  source: SourceId;
  sourceLabel: string;
  title: string;
  company: string;
  location: string;
  region?: UkRegion;
  /** How the advert was found: near the person, in their region, anywhere in the UK, or remote. */
  scope: Scope;
  /** From the advert text or the board; null when the advert does not say. */
  workplace: Workplace | null;
  salary?: string;
  /** Annual pounds, only when the advert gives an annual figure. */
  salaryMin?: number;
  salaryMax?: number;
  contract?: ContractKind;
  partTime?: boolean;
  contractText?: string;
  postedAt?: string;
  url: string;
  snippet: string;
  track: Track;
  anchor: string;
  occupationId?: string;
  match: number;
  /** Skill ids found in the advert that the person shows. */
  matched: string[];
  /** Skill ids found in the advert that the person does not show. */
  missing: string[];
  /** Skill ids usual for this kind of job (our data, not the advert) that the person shows. */
  typical?: string[];
  advertSkills: number;
  /** What the skills part rests on (job-fit-v2 on). */
  evidence?: Evidence;
  /** Seniority compared with the person's. */
  level?: LevelFit;
  /** The kind of job the title names, from our careers data. */
  role?: string;
  /** True when the whole advert was read, not just a summary. */
  fullText?: boolean;
  reason: string;
  explain: string;
}

export interface SnapshotPlace {
  label: string;
  query: string;
  town: string | null;
  region: UkRegion | null;
  /** "region" when the person gave a region rather than a town or postcode. */
  kind?: "postcode" | "outcode" | "place" | "region";
}

export interface JobsSnapshot {
  v: 1;
  method: string;
  fetchedAt: string;
  place: SnapshotPlace | null;
  anchors: { title: string; track: Track; occupationId?: string; prior: number; names?: string[]; key?: string; family?: string | null; asked?: boolean }[];
  /** Search passes run so far (1 to MAX_PASSES). */
  passes: number;
  searched: { term: string; where: string; sources: SourceId[] }[];
  jobs: MatchedJob[];
  sources: { id: SourceId; label: string; found: number; error?: string }[];
  /** Skill names for every id used in `jobs`. */
  skillNames: Record<string, string>;
  /** Reed adverts read in full for this results link so far. */
  readInFull?: number;
  /** Adverts left out, by reason, in the latest pass (for the logs and QA). */
  dropped?: { offTarget: number; usOnly: number; lowMatch: number };
  /** Only with MMS_JOBS_DEBUG=1. */
  droppedTitles?: string[];
}

export const MAX_PASSES = 3;
/** A snapshot this recent is reused as it is. */
export const SNAPSHOT_FRESH_MS = 12 * 3600 * 1000;
export const MAX_JOBS = 150;
/** Jobs below this match are not shown at all. */
export const MIN_MATCH = 40;
/** Jobs posted on MatchMySkillset are shown (first) from this match. */
const MMS_MIN_MATCH = 35;
/** Reed adverts read in full per results link, across all passes. */
export const READ_IN_FULL = 25;
/** How long a pass waits for those whole adverts before storing what it has. */
const READ_IN_FULL_DEADLINE_MS = 4000;
/** Set MMS_JOBS_DEBUG=1 to keep the titles of left-out adverts in the snapshot (local QA only). */
const DEBUG = process.env.MMS_JOBS_DEBUG === "1";

// Calls per pass, per board. Reed and Adzuna return up to 50 adverts a call.
interface PassPlan {
  reed: number;
  adzuna: number;
  himalayas: number;
  nearTerms: number;
  ukTerms: number;
}
const PASS_PLAN: Record<number, PassPlan> = {
  1: { reed: 3, adzuna: 2, himalayas: 2, nearTerms: 3, ukTerms: 0 },
  2: { reed: 2, adzuna: 1, himalayas: 1, nearTerms: 2, ukTerms: 1 },
  3: { reed: 2, adzuna: 1, himalayas: 1, nearTerms: 1, ukTerms: 2 },
};
/** Job alerts run for many people at once, so each costs fewer board calls. */
const ALERT_PLAN: PassPlan = { reed: 2, adzuna: 1, himalayas: 1, nearTerms: 2, ukTerms: 0 };
const PER_CALL = 50;

// ---------------------------------------------------------------------------
// Anchors, the person, and search terms
// ---------------------------------------------------------------------------

const SENIORITY = /^(senior|snr|junior|jnr|principal|lead|trainee|graduate|interim|acting|deputy|assistant to the)\s+/i;

/** "Senior Operations Manager (Northern Region) - ACME" becomes "Operations Manager". */
export function searchableRole(role: string | null | undefined): string {
  if (!role) return "";
  let r = role.replace(/\([^)]*\)/g, " ");
  r = r.split(/\s+[-\u2013\u2014|/]\s+|,|;|\s+at\s+/i)[0] ?? r;
  r = r.replace(/\s+/g, " ").trim();
  for (let i = 0; i < 2; i++) r = r.replace(SENIORITY, "");
  const words = r.split(" ").filter(Boolean);
  return words.slice(0, 5).join(" ");
}

function occupationAnchor(entry: MatchEntry): FitAnchor | null {
  const o = getCareerOccupation(entry.occupationId);
  if (!o) return null;
  const names = [...new Set([o.title, ...o.aliases, ...o.socIndexTitles])];
  return {
    track: "new",
    title: o.title,
    names,
    prior: entry.score / 100,
    occupationId: o.id,
    key: `occ:${o.id}`,
    family: familyOfOccupation(o.id),
    ...(entry.flags?.includes("asked") ? { asked: true } : {}),
  };
}

/** Every name we hold for a job in the index: its title, aliases and ONS titles. */
function jobNames(key: string): string[] {
  const entry = getJobIndex().find((e) => e.key === key);
  return entry ? [entry.title, ...entry.aliases] : [];
}

/** The person's own job, if we know it, then their career matches in rank order. */
export function buildAnchors(doc: SkillsDoc, items: MatchEntry[]): FitAnchor[] {
  const anchors: FitAnchor[] = [];
  const current: CurrentJob | undefined = doc.currentJobKey ? getCurrentJob(doc.currentJobKey) : undefined;
  const role = searchableRole(doc.currentRole) || current?.title || "";
  if (role) {
    // The job we matched their title to only stands in for it when their title
    // is one of its names (or very close to one): "Accounts assistant" is a
    // name of Bookkeeper, so it is the same job.
    const names = current ? jobNames(current.key) : [];
    const same = current ? names.some((n) => titleScore(role, n) >= 0.75) : false;
    const all = new Set<string>([role]);
    if (current && same) for (const n of names.slice(0, 12)) all.add(n);
    // How much of the usual skill set for their job the profile shows; 60% when we do not recognise the job.
    const prior = current && same ? profileFitForSkills(current.skills, doc.skills) : 0.6;
    const family = (same ? familyOfJobKey(current?.key) : null) ?? classifyTitle(role).family;
    anchors.push({
      track: "field",
      title: role,
      names: [...all],
      prior: Math.round(prior * 1000) / 1000,
      ...(same && current ? { key: current.key } : {}),
      ...(same && current?.occupationId ? { occupationId: current.occupationId } : {}),
      family,
    });
  }
  // Careers the person asked for by name ("I want to move into automation") are
  // searched first after their own job, then the rest in rank order: the first
  // search pass only covers the first three anchors.
  const ordered = [...items.filter((e) => e.flags?.includes("asked")), ...items.filter((e) => !e.flags?.includes("asked"))];
  for (const entry of ordered) {
    const a = occupationAnchor(entry);
    if (a && !anchors.some((x) => x.title.toLowerCase() === a.title.toLowerCase() || (x.key && x.key === a.key))) anchors.push(a);
  }
  return anchors;
}

/** Anchors stored before families were added (job alerts): fills in the family and key. */
export function withFamilies(anchors: FitAnchor[]): FitAnchor[] {
  return anchors.map((a) => {
    if (a.family !== undefined) return a;
    if (a.occupationId) return { ...a, key: a.key ?? `occ:${a.occupationId}`, family: familyOfOccupation(a.occupationId) };
    return { ...a, family: classifyTitle(a.title).family };
  });
}

const LESS_RESPONSIBILITY = /\b(less responsibility|fewer responsibilities|step down|step back|less senior|not (a )?manag\w*|no longer manag\w*|less pressure)\b/i;

/** The person's level and pay, for comparing with each advert's. */
export function personFromDoc(doc: SkillsDoc): PersonFit {
  return {
    level: personLevel(doc.seniority, doc.currentRole, doc.yearsExperience),
    median: currentMedianPay(doc.currentJobKey),
    easier: wantsEasierWork(doc.preferences) || LESS_RESPONSIBILITY.test(doc.preferences.note ?? ""),
  };
}

/** Everything needed to score adverts for one results link. */
export function fitContextFromDoc(doc: SkillsDoc, items: MatchEntry[]): FitContext {
  return buildFitContext(buildAnchors(doc, items), doc.skills, personFromDoc(doc));
}

// ---------------------------------------------------------------------------
// Advert details worked out from the text
// ---------------------------------------------------------------------------

const REMOTE_TEXT = /\b(fully remote|remote[- ]first|remote working|remote role|remote position|work(?:ing)? from home|home[- ]based|100% remote)\b/i;

export function workplaceOfListing(job: JobListing): Workplace | null {
  if (job.mms) return job.mms.workplace;
  if (job.remote === "yes") return "remote";
  const text = `${job.title} ${job.snippet}`;
  if (/\bhybrid\b/i.test(text)) return "hybrid";
  if (/\bremote\b/i.test(job.title) || REMOTE_TEXT.test(text)) return "remote";
  return null;
}

export function contractOfListing(job: JobListing): { contract?: ContractKind; partTime?: boolean } {
  if (job.mms) {
    const c = job.mms.contract;
    return {
      contract: c === "permanent" || c === "contract" || c === "temporary" || c === "apprenticeship" ? c : undefined,
      partTime: job.mms.hours === "part_time" ? true : job.mms.hours === "full_time" ? false : undefined,
    };
  }
  const ct = (job.contractType ?? "").toLowerCase();
  const title = job.title.toLowerCase();
  let contract: ContractKind | undefined;
  if (/\bapprentice(ship)?\b/.test(title) || /apprentice/.test(ct)) contract = "apprenticeship";
  else if (/\b(temp|temporary|fixed[- ]term|maternity cover|locum)\b/.test(title) || /\b(temporary|fixed term)\b/.test(ct)) contract = "temporary";
  else if (/\bcontract\b/.test(ct)) contract = "contract";
  else if (/\bpermanent\b/.test(ct)) contract = "permanent";
  const partTime = /\bpart[ _-]?time\b/.test(ct) || /\bpart[ -]?time\b/.test(title) ? true : /\bfull[ _-]?time\b/.test(ct) ? false : undefined;
  return { contract, partTime };
}

function annualGbp(job: JobListing): { min?: number; max?: number } {
  if ((job.salaryCurrency ?? "GBP") !== "GBP") return {};
  const min = job.salaryMin && job.salaryMin >= 1000 ? Math.round(job.salaryMin) : undefined;
  const max = job.salaryMax && job.salaryMax >= 1000 ? Math.round(job.salaryMax) : undefined;
  return { min, max };
}

/** What the scorer reads from a listing. */
export function fitInputFor(job: JobListing, scope?: Scope): FitInput {
  const pay = annualGbp(job);
  const text = job.mms ? job.mms.description : (job.text ?? job.snippet);
  return {
    title: job.title,
    text: `${job.title}. ${text}`,
    fullText: Boolean(job.mms) || Boolean(job.fullText),
    ...(job.skillHits ? { hits: job.skillHits } : {}),
    ...(job.mms?.skillIds.length ? { tagged: job.mms.skillIds } : {}),
    ...(pay.min ? { salaryMin: pay.min } : {}),
    ...(pay.max ? { salaryMax: pay.max } : {}),
    remote: job.remote === "yes" || scope === "remote" || (job.mms?.workplace ?? null) === "remote",
    posted: job.source === "mms",
    ...(job.usOnly ? { usFlag: true } : {}),
  };
}

// ---------------------------------------------------------------------------
// Gathering
// ---------------------------------------------------------------------------

interface Found {
  job: JobListing;
  term: string;
  scope: Scope;
}

const SCOPE_ORDER: Record<Scope, number> = { near: 0, region: 1, uk: 2, remote: 3 };

interface Call {
  source: SourceId;
  q: JobQuery;
  term: string;
  scope: Scope;
}

function queryFor(term: string, place: SnapshotPlace | null, scope: Scope, perPage: number, page = 1): JobQuery {
  const base: JobQuery = { query: term, remote: scope === "remote", page, perPage };
  if (scope === "near" && place) return { ...base, location: place.query };
  if (scope === "region" && place?.region) return { ...base, location: place.region, region: place.region === "London" ? undefined : place.region };
  return base;
}

function planCalls(pass: number, anchors: FitAnchor[], place: SnapshotPlace | null, wantRemote: boolean, override?: PassPlan): Call[] {
  const plan = override ?? PASS_PLAN[pass] ?? PASS_PLAN[MAX_PASSES];
  const calls: Call[] = [];
  const terms = anchors.map((a) => a.title);
  // Which anchors this pass covers: pass 1 the first three, pass 2 the next two, pass 3 the rest.
  const start = pass === 1 ? 0 : pass === 2 ? 3 : 5;
  const nearTerms = terms.slice(start, start + plan.nearTerms);
  let reed = plan.reed;
  let adzuna = plan.adzuna;
  let himalayas = plan.himalayas;
  const localScope: Scope = !place ? "uk" : place.kind === "region" ? "region" : "near";

  for (const term of nearTerms) {
    if (reed-- > 0) calls.push({ source: "reed", q: queryFor(term, place, localScope, PER_CALL), term, scope: localScope });
    if (adzuna-- > 0) calls.push({ source: "adzuna", q: queryFor(term, place, localScope, PER_CALL), term, scope: localScope });
    // Teaching Vacancies is a cached feed: free to ask for every term.
    const tvScope: Scope = place?.region ? "region" : place ? "near" : "uk";
    calls.push({ source: "teaching-vacancies", q: queryFor(term, place, tvScope, PER_CALL), term, scope: tvScope });
  }
  // Wider searches on later passes: the region (or the whole UK) for the strongest terms.
  if (plan.ukTerms > 0) {
    for (const term of terms.slice(0, plan.ukTerms)) {
      const scope: Scope = place?.region && pass === 2 ? "region" : "uk";
      if (reed-- > 0) calls.push({ source: "reed", q: queryFor(term, place, scope, PER_CALL), term, scope });
      if (adzuna-- > 0) calls.push({ source: "adzuna", q: queryFor(term, place, scope, PER_CALL), term, scope });
    }
  }
  // Remote boards: keyless; Remotive is a cached feed.
  const remoteTerms = wantRemote || pass > 1 ? terms.slice(start, start + 2) : terms.slice(0, pass === 1 ? 2 : 0);
  for (const term of remoteTerms) {
    if (himalayas-- > 0) calls.push({ source: "himalayas", q: queryFor(term, place, "remote", 20), term, scope: "remote" });
    calls.push({ source: "remotive", q: queryFor(term, place, "remote", PER_CALL), term, scope: "remote" });
  }
  return calls;
}

function relevant(term: string, runs: { run: SourceRun; call: Call }[]): Found[] {
  const all = runs.flatMap(({ run, call }) => run.jobs.map((job) => ({ job, term, scope: call.scope })));
  const strict = all.filter((f) => titleIsRelevant(term, coreTitle(f.job.title), "strict"));
  if (strict.length >= 8) return strict;
  return all.filter((f) => titleIsRelevant(term, coreTitle(f.job.title), "loose"));
}

export interface GatherInput {
  doc: SkillsDoc;
  items: MatchEntry[];
  place: SnapshotPlace | null;
  previous?: JobsSnapshot | null;
  /** Run the next pass and merge with `previous`. */
  more?: boolean;
}

export async function gatherJobs({ doc, items, place, previous, more }: GatherInput): Promise<JobsSnapshot> {
  return gatherForAnchors({
    anchors: buildAnchors(doc, items),
    skills: doc.skills,
    person: personFromDoc(doc),
    wantRemote: doc.preferences.wantRemote,
    place,
    previous,
    more,
  });
}

export interface AnchorGatherInput {
  anchors: FitAnchor[];
  skills: ProfileSkill[];
  person?: PersonFit;
  wantRemote: boolean;
  place: SnapshotPlace | null;
  previous?: JobsSnapshot | null;
  more?: boolean;
  /** Use the lighter plan for job alerts (and read no adverts in full). */
  forAlert?: boolean;
}

interface Scored {
  job: JobListing;
  scope: Scope;
  fit: JobFit;
  region?: UkRegion;
}

function toMatched(s: Scored, place: SnapshotPlace | null): MatchedJob {
  const { job, fit } = s;
  const pay = annualGbp(job);
  const { contract, partTime } = contractOfListing(job);
  const region = s.region;
  return {
    key: dedupeKey(job.title, job.company, job.location),
    id: job.id,
    source: job.source,
    sourceLabel: job.sourceLabel,
    title: job.title,
    company: job.company,
    location: job.location,
    ...(region ? { region } : {}),
    scope: job.source === "mms" ? (job.mms?.workplace === "remote" ? "remote" : place?.region && region === place.region ? "region" : "uk") : s.scope,
    workplace: workplaceOfListing(job),
    ...(job.salary ? { salary: job.salary } : {}),
    ...(pay.min ? { salaryMin: pay.min } : {}),
    ...(pay.max ? { salaryMax: pay.max } : {}),
    ...(contract ? { contract } : {}),
    ...(partTime !== undefined ? { partTime } : {}),
    ...(job.contractType ? { contractText: job.contractType } : {}),
    ...(job.postedAt ? { postedAt: job.postedAt } : {}),
    url: job.url,
    snippet: job.snippet.slice(0, 240),
    track: fit.track,
    anchor: fit.anchor,
    ...(fit.occupationId ? { occupationId: fit.occupationId } : {}),
    match: fit.match,
    matched: fit.matched,
    missing: fit.missing,
    ...(fit.typical.length ? { typical: fit.typical } : {}),
    advertSkills: fit.advertSkills,
    evidence: fit.evidence,
    ...(fit.level ? { level: fit.level } : {}),
    ...(fit.role ? { role: fit.role } : {}),
    ...(job.fullText || job.mms ? { fullText: true } : {}),
    reason: fit.reason,
    explain: fit.explain,
  };
}

function byMatch(a: MatchedJob, b: MatchedJob): number {
  return (
    Number(b.source === "mms") - Number(a.source === "mms") ||
    b.match - a.match ||
    (b.postedAt ? Date.parse(b.postedAt) : 0) - (a.postedAt ? Date.parse(a.postedAt) : 0) ||
    a.key.localeCompare(b.key)
  );
}

/**
 * One advert per title, employer and place. The same advert on two boards
 * often gives its place differently ("Leeds, West Yorkshire" and "LS12 6HU"):
 * one per title, employer and region across boards. Several branches on one
 * board are left alone.
 */
function dedupe(list: MatchedJob[]): MatchedJob[] {
  const byKey = new Map<string, MatchedJob>();
  for (const m of list) {
    const prev = byKey.get(m.key);
    if (!prev || m.source === "mms" || SCOPE_ORDER[m.scope] < SCOPE_ORDER[prev.scope] || (m.scope === prev.scope && m.match > prev.match)) byKey.set(m.key, m);
  }
  const kept = new Map<string, MatchedJob>();
  for (const j of byKey.values()) {
    const k2 = `${dedupeKey(j.title, j.company, "")}|${j.region ?? j.location}`;
    const prev = kept.get(k2);
    if (!prev) {
      kept.set(k2, j);
      continue;
    }
    if (prev.source === j.source) {
      kept.set(`${k2}|${j.key}`, j);
      continue;
    }
    if (j.source === "mms" || (prev.source !== "mms" && (SCOPE_ORDER[j.scope] < SCOPE_ORDER[prev.scope] || (j.scope === prev.scope && j.match > prev.match)))) {
      kept.set(k2, j);
    }
  }
  return [...kept.values()];
}

export async function gatherForAnchors({ anchors: rawAnchors, skills, person, wantRemote, place, previous: prevIn, more, forAlert }: AnchorGatherInput): Promise<JobsSnapshot> {
  const anchors = withFamilies(rawAnchors);
  const ctx = buildFitContext(anchors, skills, person);
  // A list scored the old way is started again rather than merged.
  const previous = prevIn && prevIn.method === JOB_FIT_METHOD ? prevIn : null;
  const pass = more && previous ? Math.min(MAX_PASSES, previous.passes + 1) : 1;
  const calls = anchors.length ? planCalls(pass, anchors, place, wantRemote, forAlert ? ALERT_PLAN : undefined) : [];

  const [results, mmsJobs] = await Promise.all([
    Promise.all(calls.map(async (call) => ({ call, run: await runSource(call.source, call.q) }))),
    listLiveMmsJobs(),
  ]);

  const byTerm = new Map<string, { run: SourceRun; call: Call }[]>();
  for (const r of results) {
    if (!r.run) continue;
    const list = byTerm.get(r.call.term) ?? [];
    list.push({ call: r.call, run: r.run });
    byTerm.set(r.call.term, list);
  }
  const found: Found[] = [];
  for (const [term, runs] of byTerm) found.push(...relevant(term, runs));
  // Every live job posted on the site is considered; the relevant ones lead the list.
  for (const job of mmsJobs) found.push({ job, term: "", scope: "uk" });

  // Regions for adverts that did not come with one (Reed gives a town only).
  const needRegion = [...new Set(found.filter((f) => !f.job.region).map((f) => f.job.location))];
  const regionOf = needRegion.length ? await regionsForLocations(needRegion).catch(() => new Map<string, UkRegion | null>()) : new Map<string, UkRegion | null>();

  const dropped = { offTarget: 0, usOnly: 0, lowMatch: 0 };
  const droppedTitles: string[] = [];
  const scoredById = new Map<string, Scored>();
  const assess = (job: JobListing, scope: Scope): Scored | null => {
    const input = fitInputFor(job, scope);
    const a = assessJob(input, ctx);
    if (!a.ok) {
      if (a.why === "us-only") dropped.usOnly++;
      else dropped.offTarget++;
      if (DEBUG) droppedTitles.push(`${a.why}: ${job.title} (${job.source})`);
      return null;
    }
    if (a.fit.match < (job.source === "mms" ? MMS_MIN_MATCH : MIN_MATCH)) {
      dropped.lowMatch++;
      if (DEBUG) droppedTitles.push(`low ${a.fit.match}: ${job.title} (${job.source})`);
      return null;
    }
    return { job, scope, fit: a.fit, region: job.region ?? regionOf.get(job.location) ?? undefined };
  };

  for (const f of found) {
    const s = assess(f.job, f.scope);
    if (!s) continue;
    // The best scope an advert was found in is the one kept.
    const prev = scoredById.get(f.job.id);
    if (!prev || SCOPE_ORDER[s.scope] < SCOPE_ORDER[prev.scope]) scoredById.set(f.job.id, s);
  }

  // Earlier passes are kept, except posted jobs that have since closed.
  const liveMms = new Set(mmsJobs.map((j) => j.id));
  const kept: MatchedJob[] = (more && previous ? previous.jobs : []).filter((old) => old.source !== "mms" || liveMms.has(old.id));
  let list = dedupe([...kept, ...[...scoredById.values()].map((s) => toMatched(s, place))]).sort(byMatch);

  // Read the best Reed matches in full and score them again.
  let readInFull = more && previous ? (previous.readInFull ?? 0) : 0;
  if (!forAlert && readInFull < READ_IN_FULL) {
    const wanted = list
      .slice(0, MAX_JOBS)
      .filter((j) => j.source === "reed" && !j.fullText && scoredById.has(j.id))
      .slice(0, READ_IN_FULL - readInFull)
      .map((j) => j.id);
    if (wanted.length) {
      const details = await reedDetails(wanted, READ_IN_FULL_DEADLINE_MS);
      readInFull += details.size;
      const rescored = new Map<string, MatchedJob | null>();
      for (const [id, d] of details) {
        const s = scoredById.get(id)!;
        const job: JobListing = { ...s.job, text: d.text, fullText: true, ...(d.contractType ? { contractType: d.contractType } : {}) };
        const again = assess(job, s.scope);
        rescored.set(id, again ? toMatched(again, place) : null);
      }
      list = list
        .map((j) => (rescored.has(j.id) ? rescored.get(j.id)! : j))
        .filter((j): j is MatchedJob => j !== null)
        .sort(byMatch);
    }
  }
  const jobs = list.slice(0, MAX_JOBS);

  const skillNames: Record<string, string> = {};
  for (const j of jobs) for (const id of [...j.matched, ...j.missing, ...(j.typical ?? [])]) skillNames[id] = skillName(id);

  // Adverts supplied per board, across every pass so far.
  const sourceStats = new Map<SourceId, { id: SourceId; label: string; found: number; error?: string }>();
  for (const s of more && previous ? previous.sources : []) sourceStats.set(s.id, { ...s });
  for (const r of results) {
    if (!r.run) continue;
    const s = sourceStats.get(r.run.id) ?? { id: r.run.id, label: r.run.label, found: 0 };
    s.found += r.run.jobs.length;
    if (r.run.error && !s.error) s.error = r.run.error;
    sourceStats.set(r.run.id, s);
  }
  if (mmsJobs.length) sourceStats.set("mms", { id: "mms", label: "Posted on MatchMySkillset", found: jobs.filter((j) => j.source === "mms").length });

  const searched = [
    ...(more && previous ? previous.searched : []),
    ...[...new Set(calls.map((c) => `${c.term}|${c.scope}`))].map((k) => {
      const [term, scope] = k.split("|") as [string, Scope];
      return {
        term,
        where: scope === "near" ? `near ${place?.label ?? ""}`.trim() : scope === "region" ? place?.region ?? "UK" : scope === "remote" ? "remote" : "UK",
        sources: [...new Set(calls.filter((c) => c.term === term && c.scope === scope).map((c) => c.source))],
      };
    }),
  ];

  return {
    v: 1,
    method: JOB_FIT_METHOD,
    fetchedAt: new Date().toISOString(),
    place,
    anchors: anchors.map((a) => ({
      title: a.title,
      track: a.track,
      prior: a.prior,
      names: a.names,
      ...(a.occupationId ? { occupationId: a.occupationId } : {}),
      ...(a.key ? { key: a.key } : {}),
      family: a.family ?? null,
      ...(a.asked ? { asked: true } : {}),
    })),
    passes: pass,
    searched,
    jobs,
    sources: [...sourceStats.values()],
    skillNames,
    readInFull,
    dropped,
    ...(DEBUG ? { droppedTitles } : {}),
  };
}

// ---------------------------------------------------------------------------
// Snapshot storage (mms_reports.matches.jobs)
// ---------------------------------------------------------------------------

export function isJobsSnapshot(value: unknown): value is JobsSnapshot {
  return Boolean(value && typeof value === "object" && (value as { v?: unknown }).v === 1 && Array.isArray((value as { jobs?: unknown }).jobs));
}

export function snapshotFrom(matches: unknown): JobsSnapshot | null {
  const s = matches && typeof matches === "object" ? (matches as { jobs?: unknown }).jobs : null;
  return isJobsSnapshot(s) ? s : null;
}

/** Recent enough to reuse, and scored with the current method. */
export function isFresh(s: JobsSnapshot, now = Date.now()): boolean {
  return s.method === JOB_FIT_METHOD && now - Date.parse(s.fetchedAt) < SNAPSHOT_FRESH_MS;
}

/**
 * The snapshot without jobs posted on MatchMySkillset that have closed or
 * expired since it was stored. Reads their status live (one small query), so
 * a closed job never shows, nor its "Apply with MatchMySkillset" button.
 */
export async function withoutClosedMmsJobs(s: JobsSnapshot): Promise<JobsSnapshot> {
  const ids = s.jobs.filter((j) => j.source === "mms").map((j) => j.id.replace(/^mms_/, ""));
  if (ids.length === 0 || !isSupabaseConfigured()) return s;
  try {
    const { data, error } = await createAdminClient().from("mms_jobs").select("id, status, expires_at").in("id", ids);
    if (error) throw new Error(error.message);
    const live = new Set((data ?? []).filter((r) => isLiveRow(r as { status: string; expires_at: string | null })).map((r) => `mms_${(r as { id: string }).id}`));
    const jobs = s.jobs.filter((j) => j.source !== "mms" || live.has(j.id));
    if (jobs.length === s.jobs.length) return s;
    return { ...s, jobs, sources: s.sources.map((x) => (x.id === "mms" ? { ...x, found: jobs.filter((j) => j.source === "mms").length } : x)) };
  } catch (err) {
    console.warn("[jobs] closed-job check failed:", err instanceof Error ? err.message : err);
    // If we cannot check, leave posted jobs out rather than risk showing a closed one.
    return { ...s, jobs: s.jobs.filter((j) => j.source !== "mms") };
  }
}

/** Stores the snapshot inside mms_reports.matches, keeping every other key (items, paid reports). */
export async function saveSnapshot(reportId: string, snapshot: JobsSnapshot): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = createAdminClient();
  const { data, error } = await client.from("mms_reports").select("matches").eq("id", reportId).single();
  if (error) throw new Error(`mms_reports read failed: ${error.message}`);
  const matches = (data?.matches && typeof data.matches === "object" ? data.matches : {}) as Record<string, unknown>;
  const { error: writeError } = await client.from("mms_reports").update({ matches: { ...matches, jobs: snapshot } }).eq("id", reportId);
  if (writeError) throw new Error(`mms_reports jobs save failed: ${writeError.message}`);
}

/** The place stored with a results profile (new reports), or the region alone (older ones). */
export function placeFromDoc(doc: SkillsDoc): SnapshotPlace | null {
  const loc = doc.location;
  if (loc && typeof loc === "object" && typeof loc.query === "string") {
    return { label: loc.label, query: loc.query, town: loc.town, region: regionByName(loc.region), ...(loc.kind ? { kind: loc.kind } : {}) };
  }
  const region = regionByName(doc.region);
  if (region) return { label: region, query: region, town: null, region, kind: "region" };
  return null;
}
