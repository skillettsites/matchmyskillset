"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MatchJobCard, type CardJob } from "@/components/jobs/MatchJobCard";
import { forgetResults, lastResultsToken } from "@/components/cv/storage";
import type { JobListing, JobSearchResponse } from "@/lib/apis/jobs/types";

type Sort = "relevance" | "match" | "salary";

interface Fit {
  match: number;
  reason: string;
  explain: string;
  matched: string[];
  missing: string[];
  typical?: string[];
  evidence?: "advert" | "typical" | "title";
  level?: "up" | "similar" | "down";
}
type ScoredListing = JobListing & { fit?: Fit };
type Response = Omit<JobSearchResponse, "jobs"> & { jobs: ScoredListing[]; scored?: boolean };

const SUGGESTIONS = ["Maintenance engineer", "Robotics technician", "Automation engineer", "Additive manufacturing engineer", "CNC machinist", "Field service engineer"];

const SALARY_OPTIONS = [
  { value: "", label: "Any salary" },
  { value: "25000", label: "£25,000 or more" },
  { value: "35000", label: "£35,000 or more" },
  { value: "45000", label: "£45,000 or more" },
  { value: "60000", label: "£60,000 or more" },
];

interface SearchState {
  q: string;
  location: string;
  remote: boolean;
  salaryMin: string;
  page: number;
}

function fromParams(p: URLSearchParams): SearchState {
  const page = Number.parseInt(p.get("page") || "1", 10);
  return {
    q: p.get("q") || "",
    location: p.get("location") || "",
    remote: p.get("remote") === "1",
    salaryMin: p.get("salaryMin") || "",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10) : 1,
  };
}

function toQuery(s: SearchState): string {
  const p = new URLSearchParams({ q: s.q.trim() });
  if (s.location.trim() && !s.remote) p.set("location", s.location.trim());
  if (s.remote) p.set("remote", "1");
  if (s.salaryMin) p.set("salaryMin", s.salaryMin);
  if (s.page > 1) p.set("page", String(s.page));
  return p.toString();
}

function regionPhrase(region: string): string {
  return /^(Wales|Scotland|Northern Ireland|London|Yorkshire and the Humber)$/.test(region) ? region : `the ${region}`;
}

function toCard(j: ScoredListing): CardJob {
  return {
    id: j.id,
    source: j.source,
    sourceLabel: j.sourceLabel,
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    salary: j.salary,
    contractText: j.contractType,
    postedAt: j.postedAt,
    workplace: j.mms ? j.mms.workplace : j.remote === "yes" ? "remote" : null,
    snippet: j.snippet,
    ...(j.fit
      ? {
          match: j.fit.match,
          reason: j.fit.reason,
          explain: j.fit.explain,
          matchedNames: j.fit.matched,
          missingNames: j.fit.missing,
          typicalNames: j.fit.typical ?? [],
          ...(j.fit.evidence ? { evidence: j.fit.evidence } : {}),
          ...(j.fit.level ? { level: j.fit.level } : {}),
        }
      : {}),
  };
}

export function JobsSearch() {
  const params = useSearchParams();
  const initial = useMemo(() => fromParams(new URLSearchParams(params.toString())), [params]);

  const [form, setForm] = useState<SearchState>(initial);
  const [result, setResult] = useState<Response | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<Sort>("relevance");
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const listTop = useRef<HTMLDivElement>(null);
  // The last search run. replaceState below updates useSearchParams, which
  // changes `initial`; without this the effect ran the same search again in an
  // endless loop (over 100 requests in 10 seconds).
  const lastRun = useRef<string | null>(null);

  useEffect(() => {
    setToken(lastResultsToken());
    setTokenChecked(true);
  }, []);

  const run = useCallback(
    async (s: SearchState, scroll = false) => {
      if (s.q.trim().length < 2) return;
      const qs = toQuery(s);
      lastRun.current = qs;
      setLoading(true);
      setError("");
      try {
        window.history.replaceState(null, "", `/jobs?${qs}`);
        const res = await fetch(`/api/jobs/search?${qs}${token ? `&token=${encodeURIComponent(token)}` : ""}`);
        const data = await res.json();
        if (!res.ok) {
          setResult(null);
          setError(data.error || "We could not search the job boards just now.");
          return;
        }
        setResult(data as Response);
        if ((data as Response).scored) setSort("match");
        if (scroll) listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        setResult(null);
        setError("We could not reach the job search. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (tokenChecked && initial.q && toQuery(initial) !== lastRun.current) void run(initial);
  }, [initial, run, tokenChecked]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = { ...form, page: 1 };
    setForm(next);
    void run(next);
  }

  function goToPage(page: number) {
    const next = { ...form, page };
    setForm(next);
    void run(next, true);
  }

  const jobs = useMemo(() => {
    const list = [...(result?.jobs ?? [])];
    const mmsFirst = (a: ScoredListing, b: ScoredListing) => Number(b.source === "mms") - Number(a.source === "mms");
    if (sort === "salary") list.sort((a, b) => mmsFirst(a, b) || (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0));
    if (sort === "match") list.sort((a, b) => mmsFirst(a, b) || (b.fit?.match ?? -1) - (a.fit?.match ?? -1));
    return list;
  }, [result, sort]);

  const boardTotals = (result?.sources ?? []).filter((s) => s.total !== null && s.total > 0 && s.id !== "mms");

  return (
    <div className="mt-10">
      <form onSubmit={submit} className="card-white p-4 sm:p-6" role="search">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
          <div>
            <label htmlFor="jobs-q" className="field-label">
              Job title or skill
            </label>
            <input id="jobs-q" type="text" className="field" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="For example, data analyst" />
          </div>
          <div>
            <label htmlFor="jobs-loc" className="field-label">
              Town, postcode or region
            </label>
            <input
              id="jobs-loc"
              type="text"
              className="field"
              value={form.remote ? "" : form.location}
              disabled={form.remote}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={form.remote ? "Not needed for remote jobs" : "Anywhere in the UK"}
            />
          </div>
          <button type="submit" disabled={loading || form.q.trim().length < 2} className="btn btn-primary">
            {loading ? "Searching…" : "Search jobs"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
          <label className="flex cursor-pointer items-center gap-2 text-ink">
            <input type="checkbox" checked={form.remote} onChange={(e) => setForm({ ...form, remote: e.target.checked })} className="h-5 w-5 accent-[#0071e3]" />
            Remote jobs only
          </label>
          <label className="flex items-center gap-2 text-ink">
            <span>Salary</span>
            <select value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="rounded-xl border border-line bg-white px-3 py-2 text-[15px]">
              {SALARY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {tokenChecked &&
        (token ? (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-mute">
            <span className="inline-flex items-center gap-2">
              <span className="live-dot" aria-hidden="true" /> Match scores use your latest results.
            </span>
            <Link href={`/results/${token}`} className="text-link hover:underline">
              Open my results
            </Link>
            <button
              type="button"
              className="text-link hover:underline"
              onClick={() => {
                forgetResults();
                setToken(null);
              }}
            >
              Stop using them
            </button>
          </p>
        ) : (
          <div className="tile mt-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">See how well each job fits you</p>
              <p className="text-[15px] text-mute">Upload your CV and every job gets a match score, with the skills you have that it asks for.</p>
            </div>
            <Link href="/discover#cv" className="btn btn-primary btn-sm shrink-0">
              Upload my CV
            </Link>
          </div>
        ))}

      <div ref={listTop} className="scroll-mt-24" />

      {error && (
        <p className="mt-6 rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-8 text-mute" role="status">
          Searching the job boards…
        </p>
      )}

      {!loading && result && (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-[15px]">
              <p className="text-ink">
                <span className="font-semibold">{jobs.length}</span> {jobs.length === 1 ? "advert" : "adverts"} on this page
                {result.page > 1 ? ` (page ${result.page})` : ""}.
              </p>
              {boardTotals.length > 0 && (
                <p className="mt-1 text-[14px] text-mute">
                  Boards report{" "}
                  {boardTotals.map((s, i) => (
                    <span key={s.id}>
                      {i > 0 && (i === boardTotals.length - 1 ? " and " : ", ")}
                      {s.total!.toLocaleString("en-GB")} on {s.label}
                    </span>
                  ))}{" "}
                  for these words. We show the adverts whose job title matches your search.
                </p>
              )}
              {result.region && (
                <p className="mt-1 text-[14px] text-mute">
                  {`Showing adverts in ${regionPhrase(result.region)} only, checked against each advert's location.`}
                  {result.skippedForRegion && result.skippedForRegion.length > 0 && (
                    <>
                      {" "}
                      {result.skippedForRegion.join(" and ")} cannot be narrowed to a region, so {result.skippedForRegion.length === 1 ? "it is" : "they are"} left out of this
                      search.
                    </>
                  )}
                </p>
              )}
              {result.relaxed && jobs.length > 0 && <p className="mt-1 text-[14px] text-mute">Few adverts matched that job title closely, so these include looser matches.</p>}
            </div>
            {jobs.length > 1 && (
              <label className="flex items-center gap-2 text-[14px] text-ink">
                Sort
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-xl border border-line bg-white px-3 py-2">
                  <option value="relevance">Newest first</option>
                  {result.scored && <option value="match">Best match for me</option>}
                  <option value="salary">Highest advertised salary</option>
                </select>
              </label>
            )}
          </div>

          {jobs.length === 0 ? (
            <p className="tile mt-6 p-5 text-[15px] text-ink-2">
              No adverts matched{form.q ? ` "${form.q}"` : ""}
              {form.location && !form.remote ? ` near ${form.location}` : ""}. Try a shorter job title, another place, or remote jobs only.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {jobs.map((job, i) => (
                <li key={job.id}>
                  <MatchJobCard job={toCard(job)} position={(result.page - 1) * 25 + i + 1} />
                </li>
              ))}
            </ul>
          )}

          {(result.page > 1 || result.hasMore) && (
            <nav aria-label="Result pages" className="mt-6 flex items-center justify-between gap-3">
              <button type="button" className="btn btn-secondary btn-sm" disabled={result.page <= 1 || loading} onClick={() => goToPage(result.page - 1)}>
                Previous page
              </button>
              <span className="text-[14px] text-mute">Page {result.page}</span>
              <button type="button" className="btn btn-secondary btn-sm" disabled={!result.hasMore || loading} onClick={() => goToPage(result.page + 1)}>
                Next page
              </button>
            </nav>
          )}

          <p className="mt-8 text-[12px] leading-relaxed text-mute">
            Adverts come from{" "}
            {result.sources.map((s, i) => (
              <span key={s.id}>
                {i > 0 && (i === result.sources.length - 1 ? " and " : ", ")}
                {s.id === "mms" ? "employers posting on MatchMySkillset" : s.label}
              </span>
            ))}
            . We do not write or check board adverts; the board that listed a job is shown on each one, and applying happens on its site. Adverts a board dates more
            than {result.maxAgeDays} days ago are left out. Teaching Vacancies listings contain public sector information licensed under the Open Government Licence v3.0.
          </p>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="mt-8">
          <p className="text-[15px] text-ink-2">Try one of these:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const next = { ...form, q: s, page: 1 };
                  setForm(next);
                  void run(next);
                }}
                className="pill bg-cloud text-ink hover:bg-hair"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
