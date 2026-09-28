"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { JobsSnapshot, MatchedJob } from "@/lib/apis/jobs/match";
import { MatchJobCard, type CardJob } from "@/components/jobs/MatchJobCard";
import { rememberResults } from "@/components/cv/storage";
import { aOrAn, titleInSentence } from "@/lib/text";

type Tab = "jobs" | "careers" | "skills";
type Where = "all" | "near" | "region" | "remote";
type Field = "all" | "field" | "new";
type Pattern = "any" | "remote" | "hybrid";
type Contract = "any" | "permanent" | "temp" | "parttime" | "apprenticeship";
type Sort = "match" | "newest" | "salary";

const PER_PAGE = 12;
/** The list keeps this many jobs (MAX_JOBS in match.ts). */
const MAX_LIST = 150;
const SALARY_FLOORS = [0, 25000, 35000, 45000, 60000];

export const SHOW_JOBS_EVENT = "mms:show-jobs";

interface Props {
  token: string;
  initial: JobsSnapshot | null;
  fresh: boolean;
  source: "cv" | "job";
  fromTitle: string | null;
  topSkills: string[];
  careersCount: number;
  skillsCount: number;
  careers: ReactNode;
  skills: ReactNode;
  side: ReactNode;
}

const BOARD_ORDER = ["mms", "reed", "adzuna", "teaching-vacancies", "himalayas", "remotive", "careerjet", "jooble"];

/** Where the adverts in the list come from: every board with at least one advert in it, across all searches so far. */
function sourcesLine(s: JobsSnapshot | null): string {
  const count = new Map<string, { label: string; n: number }>();
  for (const j of s?.jobs ?? []) {
    const c = count.get(j.source) ?? { label: j.sourceLabel, n: 0 };
    c.n++;
    count.set(j.source, c);
  }
  const names = [...count.entries()].sort((a, b) => BOARD_ORDER.indexOf(a[0]) - BOARD_ORDER.indexOf(b[0])).map(([, c]) => c.label);
  const list = names.length
    ? names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
    : "Reed, Adzuna, GOV.UK Teaching Vacancies, Himalayas and Remotive";
  return `Adverts come from ${list}. We do not write or check them: each links to the board that listed it, where you apply. Adverts dated more than 60 days ago are left out. Teaching Vacancies listings contain public sector information licensed under the Open Government Licence v3.0.`;
}

function toCard(j: MatchedJob, names: Record<string, string>): CardJob {
  return {
    id: j.id,
    source: j.source,
    sourceLabel: j.sourceLabel,
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    salary: j.salary,
    contractText: j.contractText,
    postedAt: j.postedAt,
    workplace: j.workplace,
    snippet: j.snippet,
    match: j.match,
    reason: j.reason,
    explain: j.explain,
    matchedNames: j.matched.map((id) => names[id] ?? id),
    missingNames: j.missing.map((id) => names[id] ?? id),
    typicalNames: (j.typical ?? []).map((id) => names[id] ?? id),
    ...(j.evidence ? { evidence: j.evidence } : {}),
    ...(j.level ? { level: j.level } : {}),
  };
}

function Select<T extends string | number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="block">
      <span className="field-label !mb-1.5 !text-[13px]">{label}</span>
      <span className="relative block">
        <select
          className="field !py-2.5 !pr-9 !text-[15px]"
          value={String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            const match = options.find((o) => String(o.value) === raw);
            if (match) onChange(match.value);
          }}
        >
          {options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}

export function ResultsShell(props: Props) {
  const { token, initial, fresh, source, fromTitle, topSkills, careersCount, skillsCount, careers, skills, side } = props;
  const [tab, setTab] = useState<Tab>("jobs");
  const [snap, setSnap] = useState<JobsSnapshot | null>(initial);
  const [loading, setLoading] = useState<"" | "load" | "more">("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const [where, setWhere] = useState<Where>("all");
  const [field, setField] = useState<Field>("all");
  const [salary, setSalary] = useState(0);
  const [pattern, setPattern] = useState<Pattern>("any");
  const [contract, setContract] = useState<Contract>("any");
  const [sort, setSort] = useState<Sort>("match");
  const [career, setCareer] = useState<{ id: string; title: string } | null>(null);
  const [page, setPage] = useState(1);
  const listTop = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const call = useCallback(
    async (action: "load" | "more") => {
      setLoading(action);
      setError("");
      setNote("");
      try {
        const res = await fetch("/api/results/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action }),
        });
        const data = (await res.json().catch(() => ({}))) as { snapshot?: JobsSnapshot; error?: string; limited?: boolean; exhausted?: boolean };
        if (!res.ok || !data.snapshot) {
          setError(data.error || "We could not reach the job boards just now. Please try again in a minute.");
          return;
        }
        if (action === "more") {
          // Jobs that were not in the list before (the list keeps the best 150, so a count difference is not enough).
          const seen = new Set((snap?.jobs ?? []).map((j) => j.key));
          const added = data.snapshot.jobs.filter((j) => !seen.has(j.key)).length;
          const full = data.snapshot.jobs.length >= MAX_LIST;
          setNote(
            data.exhausted
              ? "That is every search we run for your results. Try the job search page for other titles."
              : data.limited
                ? "You have searched a lot today. Please try again later."
                : added > 0
                  ? `Found ${added} more matching job${added === 1 ? "" : "s"}.${full ? ` Your list keeps the best ${MAX_LIST}, so weaker matches made way for them.` : ""}`
                  : "No new matches in the wider search."
          );
        }
        setSnap(data.snapshot);
      } catch {
        setError("We could not reach the server. Please check your connection and try again.");
      } finally {
        setLoading("");
      }
    },
    [token, snap]
  );

  useEffect(() => {
    rememberResults(token);
    if (started.current) return;
    started.current = true;
    if (!initial || !fresh) void call("load");
    const h = window.location.hash.replace("#", "");
    if (h === "careers" || h === "skills") setTab(h);
  }, [token, initial, fresh, call]);

  useEffect(() => {
    function onShow(e: Event) {
      const detail = (e as CustomEvent<{ id: string; title: string }>).detail;
      if (!detail) return;
      setCareer(detail);
      setField("all");
      setWhere("all");
      setPage(1);
      setTab("jobs");
      window.history.replaceState(null, "", "#jobs");
      setTimeout(() => listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
    window.addEventListener(SHOW_JOBS_EVENT, onShow);
    return () => window.removeEventListener(SHOW_JOBS_EVENT, onShow);
  }, []);

  function choose(t: Tab) {
    setTab(t);
    window.history.replaceState(null, "", `#${t}`);
  }

  const jobs = useMemo(() => snap?.jobs ?? [], [snap]);
  const place = snap?.place ?? null;
  const counts = useMemo(() => {
    const near = jobs.filter((j) => j.scope === "near").length;
    const region = place?.region ? jobs.filter((j) => j.region === place.region || j.scope === "near").length : 0;
    const remote = jobs.filter((j) => j.workplace === "remote" || j.scope === "remote").length;
    const fieldN = jobs.filter((j) => j.track === "field").length;
    return { near, region, remote, field: fieldN, new: jobs.length - fieldN };
  }, [jobs, place]);

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => {
      if (career && j.occupationId !== career.id) return false;
      if (where === "near" && j.scope !== "near") return false;
      if (where === "region" && !(j.region === place?.region || j.scope === "near")) return false;
      if (where === "remote" && !(j.workplace === "remote" || j.scope === "remote")) return false;
      if (field !== "all" && j.track !== field) return false;
      if (salary > 0 && !((j.salaryMax ?? j.salaryMin ?? 0) >= salary)) return false;
      if (pattern !== "any" && j.workplace !== pattern) return false;
      if (contract === "permanent" && j.contract !== "permanent") return false;
      if (contract === "temp" && j.contract !== "contract" && j.contract !== "temporary") return false;
      if (contract === "parttime" && !j.partTime) return false;
      if (contract === "apprenticeship" && j.contract !== "apprenticeship") return false;
      return true;
    });
    if (sort === "newest") list = [...list].sort((a, b) => (b.postedAt ? Date.parse(b.postedAt) : 0) - (a.postedAt ? Date.parse(a.postedAt) : 0));
    if (sort === "salary") list = [...list].sort((a, b) => (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0));
    return list;
  }, [jobs, career, where, field, salary, pattern, contract, sort, place]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const filtersOn = Boolean(career) || where !== "all" || field !== "all" || salary > 0 || pattern !== "any" || contract !== "any";

  function clearFilters() {
    setCareer(null);
    setWhere("all");
    setField("all");
    setSalary(0);
    setPattern("any");
    setContract("any");
    setPage(1);
  }

  function go(p: number) {
    setPage(p);
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const n = jobs.length;
  const whose = source === "cv" ? "your CV" : fromTitle ? `your experience as ${aOrAn(titleInSentence(fromTitle))} ${titleInSentence(fromTitle)}` : "your experience";
  const nearText = place ? (place.kind === "region" ? `in ${place.label}` : `near ${place.label}`) : "across the UK";
  const passesLeft = snap ? snap.passes < 3 : false;

  const whereOptions: { value: Where; label: string }[] = [
    { value: "all", label: `All places (${n})` },
    ...(place && place.kind !== "region" ? [{ value: "near" as Where, label: `Near ${place.town ?? place.label} (${counts.near})` }] : []),
    ...(place?.region ? [{ value: "region" as Where, label: `${place.region} (${counts.region})` }] : []),
    { value: "remote", label: `Remote (${counts.remote})` },
  ];

  return (
    <div>
      <header className="relative">
        <p className="eyebrow rise text-blue">Your results</p>
        <h1 className="headline rise rise-1 mt-2 max-w-[860px]">
          {snap ? (
            n > 0 ? (
              <>
                <span className="gradient-text">{n} live jobs</span> that match {whose}
              </>
            ) : (
              <>No close job matches {nearText} right now</>
            )
          ) : (
            <>Finding live jobs that match {whose}</>
          )}
        </h1>
        <p className="lede rise rise-2 mt-4 max-w-[760px] !text-[19px] sm:!text-[21px]">
          {snap
            ? n > 0
              ? `${place ? (place.kind === "region" ? `In ${place.label}` : `Near ${place.label}`) : "Across the UK"} and remote, scored against the skills in ${source === "cv" ? "your CV" : "your job"}.`
              : "Try a wider search below, or look at the careers your skills fit."
            : "Searching the job boards. This takes a few seconds."}
        </p>
        {topSkills.length > 0 && (
          <div className="rise rise-3 mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-medium text-mute">Your top skills:</span>
            {topSkills.map((s) => (
              <span key={s} className="pill bg-cloud text-ink">
                {s}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="mt-8 overflow-x-auto no-scrollbar">
        <div className="segmented" role="group" aria-label="Results">
          {(
            [
              ["jobs", `Jobs${snap ? ` (${n})` : ""}`],
              ["careers", `Careers that fit you (${careersCount})`],
              ["skills", `Your skills (${skillsCount})`],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              aria-controls={`panel-${t}`}
              onClick={() => choose(t)}
              className="whitespace-nowrap"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section id="panel-jobs" aria-label="Jobs" hidden={tab !== "jobs"} className="mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <div className="card-white p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="col-span-2 md:col-span-1">
                  <Select label="Where" value={where} onChange={(v) => (setWhere(v), setPage(1))} options={whereOptions} />
                </div>
                <Select
                  label="Salary"
                  value={salary}
                  onChange={(v) => (setSalary(v), setPage(1))}
                  options={SALARY_FLOORS.map((f) => ({ value: f, label: f ? `£${(f / 1000).toFixed(0)}k or more` : "Any salary" }))}
                />
                <Select
                  label="Working pattern"
                  value={pattern}
                  onChange={(v) => (setPattern(v), setPage(1))}
                  options={[
                    { value: "any", label: "Any" },
                    { value: "remote", label: "Remote" },
                    { value: "hybrid", label: "Hybrid" },
                  ]}
                />
                <Select
                  label="Contract"
                  value={contract}
                  onChange={(v) => (setContract(v), setPage(1))}
                  options={[
                    { value: "any", label: "Any" },
                    { value: "permanent", label: "Permanent" },
                    { value: "temp", label: "Contract or temporary" },
                    { value: "parttime", label: "Part-time" },
                    { value: "apprenticeship", label: "Apprenticeship" },
                  ]}
                />
                <Select
                  label="Sort"
                  value={sort}
                  onChange={(v) => (setSort(v), setPage(1))}
                  options={[
                    { value: "match", label: "Best match" },
                    { value: "newest", label: "Newest" },
                    { value: "salary", label: "Highest salary" },
                  ]}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="segmented" role="group" aria-label="Kind of job">
                  {(
                    [
                      ["all", "All"],
                      ["field", `Stay in my field (${counts.field})`],
                      ["new", `Try something new (${counts.new})`],
                    ] as [Field, string][]
                  ).map(([v, label]) => (
                    <button key={v} type="button" aria-pressed={field === v} onClick={() => (setField(v), setPage(1))}>
                      {label}
                    </button>
                  ))}
                </div>
                {career && (
                  <span className="pill bg-[#f0f6ff] text-blue">
                    Jobs for {titleInSentence(career.title)}
                    <button type="button" aria-label="Show all jobs" className="ml-1 text-[16px] leading-none" onClick={() => setCareer(null)}>
                      ×
                    </button>
                  </span>
                )}
              </div>
              {salary > 0 && <p className="field-hint">Adverts that do not give a yearly salary are hidden while a minimum is set.</p>}
            </div>

            <div ref={listTop} className="scroll-mt-24" />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[15px]">
              <p className="text-mute" aria-live="polite">
                {snap ? (
                  <>
                    <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? "job" : "jobs"}
                    {filtersOn ? " with these filters" : ""}
                    {pages > 1 ? `, page ${current} of ${pages}` : ""}
                  </>
                ) : (
                  "Searching…"
                )}
              </p>
              <div className="flex items-center gap-3">
                {loading === "load" && snap && (
                  <span className="inline-flex items-center gap-2 text-[14px] text-mute">
                    <span className="live-dot" aria-hidden="true" /> Updating
                  </span>
                )}
                {filtersOn && (
                  <button type="button" className="text-[14px] text-link hover:underline" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]" role="alert">
                {error}{" "}
                <button type="button" className="font-medium underline" onClick={() => void call(snap ? "more" : "load")}>
                  Try again
                </button>
              </div>
            )}

            {!snap && loading && (
              <ul className="mt-4 space-y-4" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="card-white h-[170px] animate-pulse p-6">
                    <div className="h-3 w-24 rounded bg-cloud" />
                    <div className="mt-4 h-5 w-2/3 rounded bg-cloud" />
                    <div className="mt-3 h-4 w-1/2 rounded bg-cloud" />
                  </li>
                ))}
              </ul>
            )}

            {snap && shown.length === 0 && (
              <div className="tile mt-4 p-6 text-[15px] text-ink-2">
                {jobs.length === 0 ? (
                  <p>
                    We did not find live adverts close enough to your skills {nearText} today. Search wider below, or look at the careers your skills fit and search
                    those.
                  </p>
                ) : (
                  <p>
                    No jobs match all of these filters.{" "}
                    <button type="button" className="text-link hover:underline" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </p>
                )}
              </div>
            )}

            <ol className="mt-4 space-y-4">
              {shown.map((j, i) => (
                <li key={j.key}>
                  <MatchJobCard job={toCard(j, snap?.skillNames ?? {})} position={(current - 1) * PER_PAGE + i + 1} />
                </li>
              ))}
            </ol>

            {pages > 1 && (
              <nav aria-label="Job pages" className="mt-6 flex items-center justify-between gap-3">
                <button type="button" className="btn btn-secondary btn-sm" disabled={current <= 1} onClick={() => go(current - 1)}>
                  Previous
                </button>
                <span className="text-[14px] text-mute">
                  Page {current} of {pages}
                </span>
                <button type="button" className="btn btn-secondary btn-sm" disabled={current >= pages} onClick={() => go(current + 1)}>
                  Next
                </button>
              </nav>
            )}

            {snap && (
              <div className="tile mt-8 p-5 sm:p-6">
                <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Want more?</p>
                <p className="mt-1 text-[15px] text-mute">
                  {passesLeft
                    ? "We can search more of your career matches and further afield. Each search checks the boards again."
                    : "You have seen every search we run for your results. Use the job search for other titles."}
                </p>
                {note && (
                  <p className="mt-2 text-[15px] text-ink" role="status">
                    {note}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  {passesLeft && (
                    <button type="button" className="btn btn-primary btn-sm" disabled={Boolean(loading)} onClick={() => void call("more")}>
                      {loading === "more" ? "Searching…" : "Search more"}
                    </button>
                  )}
                  <a href="/jobs" className="btn btn-secondary btn-sm">
                    Search any job title
                  </a>
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-mute">{sourcesLine(snap)}</p>
              </div>
            )}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24">{side}</aside>
        </div>
      </section>

      <section id="panel-careers" aria-label="Careers that fit you" hidden={tab !== "careers"} className="mt-8">
        {careers}
      </section>

      <section id="panel-skills" aria-label="Your skills" hidden={tab !== "skills"} className="mt-8">
        {skills}
      </section>
    </div>
  );
}

/** Button on a career card that switches to the Jobs tab, filtered to that career. */
export function ShowJobsButton({ id, title, count }: { id: string; title: string; count: number | null }) {
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => window.dispatchEvent(new CustomEvent(SHOW_JOBS_EVENT, { detail: { id, title } }))}
    >
      {count === null ? "See live jobs" : count > 0 ? `See ${count} live job${count === 1 ? "" : "s"}` : "See live jobs"}
    </button>
  );
}
