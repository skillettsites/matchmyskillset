// The admin funnel (/admin/funnel and its CSV exports). Server code only.
//
// Counts come from Postgres (mms_funnel_counts() in migration 010), never
// from tallying rows here. Application-level stages count each application
// once, the first time it reached the stage. Before 010 is applied the page
// shows the counts that need no new tables (results links, opt-in profiles,
// applications) and says the rest is not switched on yet.
//
// Candidate accounts and CV tool use come from the candidate accounts work
// (branch revamp/tools). Their tables are probed by name (OPTIONAL_SOURCES);
// until they exist those tiles say so.

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isTrackingSchemaMissing } from "./db";
import { isFieldId } from "./field";
import { PLACEMENT_COLUMNS, type PlacementRow } from "./placements";

export type Bucket = "day" | "week" | "month";

export type Metric = "results" | "optins" | "accounts" | "cv_tools" | "applied_mms" | "applied_external" | "interview" | "offer" | "placed";

export interface MetricInfo {
  id: Metric;
  label: string;
  hint: string;
  /** Follows the field and client filters (application-level stages only). */
  filterable: boolean;
}

export const METRICS: MetricInfo[] = [
  { id: "results", label: "Results created", hint: "CV or job title checks that made a results link", filterable: false },
  { id: "optins", label: "Opt-in profiles", hint: "Profiles switched on for employers to find", filterable: false },
  { id: "accounts", label: "Candidate accounts", hint: "Job seeker accounts created", filterable: false },
  { id: "cv_tools", label: "CV tool uses", hint: "CV tools run by job seekers", filterable: false },
  { id: "applied_mms", label: "Applications via MatchMySkillset", hint: "Apply with MatchMySkillset", filterable: true },
  { id: "applied_external", label: "Outside applications tracked", hint: "Jobs on other sites people told us they applied for", filterable: true },
  { id: "interview", label: "Interviews", hint: "Employer status or the job seeker's own answer", filterable: true },
  { id: "offer", label: "Offers", hint: "Employer status or the job seeker's own answer", filterable: true },
  { id: "placed", label: "Placements", hint: "Hired, placed, or recorded by admin", filterable: true },
];

/**
 * Tables from the candidate accounts work, counted by created_at when they
 * exist. INTEGRATION NOTE: after merging revamp/tools, set these to that
 * branch's table names (and a test-row filter if it has one).
 */
export const OPTIONAL_SOURCES: Record<"accounts" | "cv_tools", { table: string; dateColumn: string }> = {
  accounts: { table: "mms_candidate_accounts", dateColumn: "created_at" },
  cv_tools: { table: "mms_cv_tool_runs", dateColumn: "created_at" },
};

export interface FunnelFilters {
  /** First day, YYYY-MM-DD (UK time). */
  from: string;
  /** Last day, YYYY-MM-DD (UK time), included. */
  to: string;
  field: string | null;
  client: string | null;
  includeTest: boolean;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Today's date in the UK, YYYY-MM-DD. */
export function londonToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The instant UK midnight starts on a date (handles GMT and BST). */
function londonMidnight(date: string): Date {
  const guess = new Date(`${date}T00:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }).formatToParts(guess);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  // At 00:00 UTC London shows 00:00 (GMT) or 01:00 (BST): step back by that many hours.
  return new Date(guess.getTime() - hour * 3_600_000);
}

export function readFilters(sp: Record<string, string | string[] | undefined>): FunnelFilters {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const today = londonToday();
  let to = DATE_RE.test(one("to")) ? one("to") : today;
  let from = DATE_RE.test(one("from")) ? one("from") : addDays(to, -89);
  if (from > to) [from, to] = [to, from];
  // At most about three years in one view.
  if (addDays(from, 1100) < to) from = addDays(to, -1100);
  const field = isFieldId(one("field")) ? one("field") : null;
  const client = UUID_RE.test(one("client")) ? one("client") : null;
  return { from, to, field, client, includeTest: one("test") === "1" };
}

/** The filters as a query string, for links and exports. */
export function filterQuery(f: FunnelFilters, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams({ from: f.from, to: f.to, ...extra });
  if (f.field) p.set("field", f.field);
  if (f.client) p.set("client", f.client);
  if (f.includeTest) p.set("test", "1");
  return p.toString();
}

export function rangeOf(f: FunnelFilters): { fromIso: string; toIso: string } {
  return { fromIso: londonMidnight(f.from).toISOString(), toIso: londonMidnight(addDays(f.to, 1)).toISOString() };
}

export function bucketFor(f: FunnelFilters): Bucket {
  const days = Math.round((Date.parse(`${f.to}T12:00:00Z`) - Date.parse(`${f.from}T12:00:00Z`)) / 86_400_000) + 1;
  return days <= 31 ? "day" : days <= 190 ? "week" : "month";
}

/** Every bucket start (UK dates) from `from` to `to`, so empty periods show as 0. */
export function bucketStarts(f: FunnelFilters, bucket: Bucket): string[] {
  const starts: string[] = [];
  let d = f.from;
  if (bucket === "week") {
    const dow = (new Date(`${d}T12:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
    d = addDays(d, -dow);
  } else if (bucket === "month") {
    d = `${d.slice(0, 7)}-01`;
  }
  while (d <= f.to && starts.length < 400) {
    starts.push(d);
    if (bucket === "day") d = addDays(d, 1);
    else if (bucket === "week") d = addDays(d, 7);
    else {
      const [y, m] = d.split("-").map(Number);
      d = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    }
  }
  return starts;
}

export interface FunnelData {
  /** Migration 010 is applied (the funnel function exists). */
  ready: boolean;
  bucket: Bucket;
  /** null = cannot be counted with these filters, or the source does not exist yet. */
  totals: Record<Metric, number | null>;
  /** Why a total is null, for the tiles. */
  notes: Partial<Record<Metric, string>>;
  trend: { start: string; values: Partial<Record<Metric, number>> }[];
}

function emptyTotals(): Record<Metric, number | null> {
  return { results: null, optins: null, accounts: null, cv_tools: null, applied_mms: null, applied_external: null, interview: null, offer: null, placed: null };
}

async function countOptional(which: "accounts" | "cv_tools", fromIso: string, toIso: string): Promise<number | null> {
  const src = OPTIONAL_SOURCES[which];
  // Not a HEAD request: PostgREST answers HEAD on a missing table with 204 and no error.
  const { count, error } = await createAdminClient()
    .from(src.table)
    .select(src.dateColumn, { count: "exact" })
    .gte(src.dateColumn, fromIso)
    .lt(src.dateColumn, toIso)
    .limit(1);
  if (error) return null;
  return count ?? 0;
}

export async function loadFunnel(f: FunnelFilters): Promise<FunnelData> {
  const bucket = bucketFor(f);
  const totals = emptyTotals();
  const notes: Partial<Record<Metric, string>> = {};
  const starts = bucketStarts(f, bucket);
  const trend = starts.map((start) => ({ start, values: {} as Partial<Record<Metric, number>> }));
  if (!isSupabaseConfigured()) return { ready: false, bucket, totals, notes, trend };

  const admin = createAdminClient();
  const { fromIso, toIso } = rangeOf(f);
  const filtered = Boolean(f.field || f.client);

  const { data, error } = await admin.rpc("mms_funnel_counts", {
    p_from: fromIso,
    p_to: toIso,
    p_bucket: bucket,
    p_field: f.field,
    p_employer: f.client,
    p_include_test: f.includeTest,
  });
  const ready = !error;
  if (error && !isTrackingSchemaMissing(error)) console.error("[funnel] counts failed:", error.message);

  if (ready) {
    for (const m of ["results", "optins", "applied_mms", "applied_external", "interview", "offer", "placed"] as Metric[]) totals[m] = 0;
    const index = new Map(trend.map((t, i) => [t.start, i]));
    const toDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" });
    for (const row of (data ?? []) as { bucket: string; metric: string; n: number | string }[]) {
      const metric = row.metric as Metric;
      if (!(metric in totals)) continue;
      const n = Number(row.n) || 0;
      totals[metric] = (totals[metric] ?? 0) + n;
      const i = index.get(toDay.format(new Date(row.bucket)));
      if (i !== undefined) trend[i].values[metric] = (trend[i].values[metric] ?? 0) + n;
    }
  } else if (!filtered) {
    // Before migration 010: what can be counted from the existing tables.
    const [results, optins, apps] = await Promise.all([
      admin.from("mms_reports").select("id", { count: "exact", head: true }).gte("created_at", fromIso).lt("created_at", toIso).neq("source", "qa-test"),
      admin.from("mms_candidates").select("id", { count: "exact", head: true }).gte("discoverable_consent_at", fromIso).lt("discoverable_consent_at", toIso),
      admin.from("mms_applications").select("id", { count: "exact", head: true }).gte("created_at", fromIso).lt("created_at", toIso),
    ]);
    totals.results = results.count ?? null;
    totals.optins = optins.count ?? null;
    totals.applied_mms = apps.count ?? null;
    for (const m of ["applied_external", "interview", "offer", "placed"] as Metric[]) notes[m] = "Not switched on yet";
  } else {
    for (const m of ["applied_mms", "applied_external", "interview", "offer", "placed"] as Metric[]) notes[m] = "Not switched on yet";
  }

  if (filtered) {
    for (const m of METRICS.filter((x) => !x.filterable)) {
      totals[m.id] = null;
      notes[m.id] = "Not linked to a job, so not filtered";
    }
  } else {
    const [accounts, tools] = await Promise.all([countOptional("accounts", fromIso, toIso), countOptional("cv_tools", fromIso, toIso)]);
    totals.accounts = accounts;
    totals.cv_tools = tools;
    if (accounts === null) notes.accounts = "Not switched on yet";
    if (tools === null) notes.cv_tools = "Not switched on yet";
  }
  return { ready, bucket, totals, notes, trend };
}

export interface Conversion {
  label: string;
  from: number | null;
  to: number | null;
  rate: number | null;
}

/** Stage-to-stage rates. Applications = through us + outside ones tracked. */
export function conversions(t: Record<Metric, number | null>): Conversion[] {
  const apps = t.applied_mms === null && t.applied_external === null ? null : (t.applied_mms ?? 0) + (t.applied_external ?? 0);
  const rate = (a: number | null, b: number | null) => (a && b !== null ? b / a : null);
  return [
    { label: "Opt-in profiles per results link", from: t.results, to: t.optins, rate: rate(t.results, t.optins) },
    { label: "Interviews per application", from: apps, to: t.interview, rate: rate(apps, t.interview) },
    { label: "Offers per interview", from: t.interview, to: t.offer, rate: rate(t.interview, t.offer) },
    { label: "Placements per offer", from: t.offer, to: t.placed, rate: rate(t.offer, t.placed) },
    { label: "Placements per application", from: apps, to: t.placed, rate: rate(apps, t.placed) },
  ];
}

export function percent(rate: number | null): string {
  if (rate === null) return "n/a";
  const p = rate * 100;
  return `${p < 10 && p > 0 ? p.toFixed(1) : Math.round(p)}%`;
}

// ---------------------------------------------------------------------------
// Placements list and recent events
// ---------------------------------------------------------------------------

export async function loadPlacements(f: FunnelFilters): Promise<PlacementRow[] | "off"> {
  if (!isSupabaseConfigured()) return "off";
  const { fromIso, toIso } = rangeOf(f);
  let q = createAdminClient().from("mms_placements").select(PLACEMENT_COLUMNS).gte("created_at", fromIso).lt("created_at", toIso).order("created_at", { ascending: false }).limit(500);
  if (f.field) q = q.eq("field", f.field);
  if (f.client) q = q.eq("employer_account_id", f.client);
  if (!f.includeTest) q = q.eq("is_test", false);
  const { data, error } = await q;
  if (error) {
    if (isTrackingSchemaMissing(error)) return "off";
    console.error("[funnel] placements failed:", error.message);
    return [];
  }
  return (data ?? []) as PlacementRow[];
}

export interface EventRow {
  id: string;
  created_at: string;
  kind: string;
  source: string;
  status: string | null;
  channel: string | null;
  application_id: string | null;
  tracked_id: string | null;
  placement_id: string | null;
  job_id: string | null;
  account_id: string | null;
  field: string | null;
  is_test: boolean;
  detail: unknown;
}

export async function loadEvents(f: FunnelFilters, limit = 200): Promise<EventRow[] | "off"> {
  if (!isSupabaseConfigured()) return "off";
  const { fromIso, toIso } = rangeOf(f);
  let q = createAdminClient()
    .from("mms_journey_events")
    .select("id, created_at, kind, source, status, channel, application_id, tracked_id, placement_id, job_id, account_id, field, is_test, detail")
    .gte("created_at", fromIso)
    .lt("created_at", toIso)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (f.field) q = q.eq("field", f.field);
  if (f.client) q = q.eq("account_id", f.client);
  if (!f.includeTest) q = q.eq("is_test", false);
  const { data, error } = await q;
  if (error) {
    if (isTrackingSchemaMissing(error)) return "off";
    console.error("[funnel] events failed:", error.message);
    return [];
  }
  return (data ?? []) as EventRow[];
}

/** Employer names for the client filter and the tables. */
export async function employerNames(): Promise<{ id: string; name: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await createAdminClient().from("mms_employer_accounts").select("id, company_name, email").order("company_name", { ascending: true }).limit(1000);
  return ((data ?? []) as { id: string; company_name: string | null; email: string }[]).map((a) => ({ id: a.id, name: a.company_name || a.email }));
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

function cell(value: unknown): string {
  let s = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  // Spreadsheet formula injection: never let a cell start with = + - @ (or a tab or return).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
