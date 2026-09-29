// Types shared by the job board adapters, the /api/jobs/search route and the
// JobCard component. Type-only: safe to import from client components.

import type { UkRegion } from "@/lib/apis/regions";
import type { TextSkillHit } from "@/lib/skills/text-skills";

export type SourceId = "mms" | "reed" | "adzuna" | "teaching-vacancies" | "careerjet" | "jooble" | "himalayas" | "remotive";

export const SOURCE_IDS: readonly SourceId[] = ["mms", "reed", "adzuna", "teaching-vacancies", "careerjet", "jooble", "himalayas", "remotive"];

/** Where the job is done, as the advert (or the employer's form) says. */
export type Workplace = "onsite" | "hybrid" | "remote";

export interface JobListing {
  /** "<source>_<id on that board>" */
  id: string;
  source: SourceId;
  /** Name to show on the card, e.g. "GOV.UK Teaching Vacancies". */
  sourceLabel: string;
  title: string;
  company: string;
  location: string;
  /** "yes" for remote-only boards, "maybe" when a UK board ad came back for a remote search. */
  remote: "yes" | "maybe" | "no";
  /** Ready to print, currency and period included when the board gives them. */
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  /** ISO 4217 code, e.g. "GBP", "USD". */
  salaryCurrency?: string;
  snippet: string;
  /**
   * Longer advert text for scoring against a CV (the board's full summary, or
   * the whole advert when `fullText` is set). Server-side only: never sent to
   * the browser.
   */
  text?: string;
  /** True when `text` or `skillHits` come from the whole advert, not a summary. */
  fullText?: boolean;
  /**
   * The whole advert as the board sent it (HTML), for boards we cannot ask
   * for one job later (Himalayas). Kept for the job page; server-side only.
   */
  advertHtml?: string;
  /** Skills already found in the whole advert, for boards whose full text is not kept. */
  skillHits?: TextSkillHit[];
  /** The advert asks for a US licence, US registration or the right to work in the US. */
  usOnly?: boolean;
  /** The original listing. Apply links always go here. */
  url: string;
  /** ISO 8601 date the ad was posted, when the board gives one. */
  postedAt?: string;
  contractType?: string;
  /** UK region, when the board gives one or it could be worked out from the location. */
  region?: UkRegion;
  /** Jobs posted on MatchMySkillset only. */
  mms?: MmsJobExtra;
}

/** Extra fields for jobs posted on MatchMySkillset (source "mms"). */
export interface MmsJobExtra {
  id: string;
  workplace: Workplace;
  /** Full advert text, for scoring against a CV. Never sent to the browser in bulk. */
  description: string;
  /** Skill ids the employer's advert was tagged with. */
  skillIds: string[];
  hours?: string | null;
  contract?: string | null;
  closesAt?: string | null;
}

export interface JobQuery {
  query: string;
  /** UK place name. Ignored for remote searches. */
  location?: string;
  /**
   * Set when `location` is a UK region or nation other than London (e.g.
   * "South West"). Boards are asked for the region where they support it, and
   * results are checked against it.
   */
  region?: UkRegion;
  /** Work-type filter, not a place. */
  remote: boolean;
  page: number;
  perPage: number;
  salaryMin?: number;
  /** The visitor's IP and user agent (Careerjet requires both on every call). */
  userIp?: string;
  userAgent?: string;
}

export interface SourceResult {
  jobs: JobListing[];
  /** Total matches the board reports for this query, when it gives one. */
  total: number | null;
  /** Set when the board failed or was skipped for a reason worth logging. */
  error?: string;
}

export interface SourceSummary {
  id: SourceId;
  label: string;
  /** Total the board reports for the query (null when it does not say). */
  total: number | null;
  /** Listings from this board on the current page after filtering. */
  shown: number;
  error?: string;
}

export interface JobSearchResponse {
  jobs: JobListing[];
  page: number;
  hasMore: boolean;
  /** True when too few ads matched the job title closely, so looser matches are included. */
  relaxed: boolean;
  sources: SourceSummary[];
  /** The region searched, when the location was a region. */
  region?: UkRegion;
  /** Boards left out of a region search because they cannot be narrowed to a region. */
  skippedForRegion?: string[];
  /** Adverts dropped because the board dated them more than this many days ago. */
  maxAgeDays: number;
}
