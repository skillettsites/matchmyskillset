// Types shared by the job board adapters, the /api/jobs/search route and the
// JobCard component. Type-only: safe to import from client components.

export type SourceId = "reed" | "adzuna" | "teaching-vacancies" | "careerjet" | "jooble" | "himalayas" | "remotive";

export const SOURCE_IDS: readonly SourceId[] = ["reed", "adzuna", "teaching-vacancies", "careerjet", "jooble", "himalayas", "remotive"];

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
  /** The original listing. Apply links always go here. */
  url: string;
  /** ISO 8601 date the ad was posted, when the board gives one. */
  postedAt?: string;
  contractType?: string;
}

export interface JobQuery {
  query: string;
  /** UK place name. Ignored for remote searches. */
  location?: string;
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
}
