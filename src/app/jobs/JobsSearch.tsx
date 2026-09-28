"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobCard } from "@/components/ui/JobCard";
import type { JobListing, JobSearchResponse } from "@/lib/apis/jobs/types";

type Sort = "newest" | "salary";

const SUGGESTIONS = ["Data analyst", "Project manager", "Learning and development adviser", "Teaching assistant", "Customer service manager", "HR officer"];

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

/** "the South West", but "Wales" and "Yorkshire and the Humber". */
function regionPhrase(region: string): string {
  return /^(Wales|Scotland|Northern Ireland|London|Yorkshire and the Humber)$/.test(region) ? region : `the ${region}`;
}

export function JobsSearch() {
  const params = useSearchParams();
  const initial = useMemo(() => fromParams(new URLSearchParams(params.toString())), [params]);

  const [form, setForm] = useState<SearchState>(initial);
  const [result, setResult] = useState<JobSearchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<Sort>("newest");
  const listTop = useRef<HTMLDivElement>(null);

  const run = useCallback(async (s: SearchState, scroll = false) => {
    if (s.q.trim().length < 2) return;
    setLoading(true);
    setError("");
    try {
      const qs = toQuery(s);
      window.history.replaceState(null, "", `/jobs?${qs}`);
      const res = await fetch(`/api/jobs/search?${qs}`);
      const data = await res.json();
      if (!res.ok) {
        setResult(null);
        setError(data.error || "We could not search the job boards just now.");
        return;
      }
      setResult(data as JobSearchResponse);
      if (scroll) listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setResult(null);
      setError("We could not reach the job search. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initial.q) void run(initial);
  }, [initial, run]);

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

  const jobs: JobListing[] = useMemo(() => {
    const list = [...(result?.jobs ?? [])];
    if (sort === "salary") {
      list.sort((a, b) => (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0));
    }
    return list;
  }, [result, sort]);

  const boardTotals = (result?.sources ?? []).filter((s) => s.total !== null && s.total > 0);

  return (
    <div className="mt-8">
      <form onSubmit={submit} className="rounded-lg border border-rule bg-surface p-4 shadow-card sm:p-5" role="search">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="jobs-q" className="block text-sm font-semibold text-ink">
              Job title or skill
            </label>
            <input
              id="jobs-q"
              type="text"
              value={form.q}
              onChange={(e) => setForm({ ...form, q: e.target.value })}
              placeholder="For example, data analyst"
              className="mt-1 min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base text-ink placeholder:text-muted focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="jobs-loc" className="block text-sm font-semibold text-ink">
              Town, city, postcode or region
            </label>
            <input
              id="jobs-loc"
              type="text"
              value={form.remote ? "" : form.location}
              disabled={form.remote}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={form.remote ? "Not needed for remote jobs" : "Anywhere in the UK"}
              className="mt-1 min-h-12 w-full rounded-md border border-rule-strong bg-white px-3 text-base text-ink placeholder:text-muted focus:border-accent disabled:bg-paper-2"
            />
          </div>
          <button type="submit" disabled={loading || form.q.trim().length < 2} className="btn btn-primary min-h-12">
            {loading ? "Searching…" : "Search jobs"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-ink">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={(e) => setForm({ ...form, remote: e.target.checked })}
              className="h-5 w-5 accent-[var(--color-accent)]"
            />
            Remote jobs only
          </label>
          <label className="flex items-center gap-2 text-ink">
            <span>Salary</span>
            <select
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
              className="min-h-11 rounded-md border border-rule-strong bg-white px-2 text-sm"
            >
              {SALARY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      <div ref={listTop} className="scroll-mt-24" />

      {error && <p className="mt-6 rounded-md border border-negative/30 bg-negative-soft px-4 py-3 text-negative">{error}</p>}

      {loading && (
        <p className="mt-8 text-muted" role="status">
          Searching the job boards…
        </p>
      )}

      {!loading && result && (
        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-ink">
                <span className="font-semibold">{jobs.length}</span> {jobs.length === 1 ? "advert" : "adverts"} on this page
                {result.page > 1 ? ` (page ${result.page})` : ""}.
              </p>
              {boardTotals.length > 0 && (
                <p className="mt-1 text-sm text-muted">
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
                <p className="mt-1 text-sm text-muted">
                  {`Showing adverts in ${regionPhrase(result.region)} only, checked against each advert's location.`}
                  {result.skippedForRegion && result.skippedForRegion.length > 0 && (
                    <>
                      {" "}
                      {result.skippedForRegion.join(" and ")} cannot be narrowed to a region, so{" "}
                      {result.skippedForRegion.length === 1 ? "it is" : "they are"} left out of this search.
                    </>
                  )}
                </p>
              )}
              {result.relaxed && jobs.length > 0 && (
                <p className="mt-1 text-sm text-muted">Few adverts matched that job title closely, so these include looser matches.</p>
              )}
            </div>
            {jobs.length > 1 && (
              <label className="flex items-center gap-2 text-sm text-ink">
                Sort
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-h-11 rounded-md border border-rule-strong bg-white px-2">
                  <option value="newest">Newest first</option>
                  <option value="salary">Highest advertised salary</option>
                </select>
              </label>
            )}
          </div>

          {jobs.length === 0 ? (
            <p className="mt-6 text-ink-2">
              No adverts matched{form.q ? ` "${form.q}"` : ""}
              {form.location && !form.remote ? ` near ${form.location}` : ""}. Try a shorter job title, another place, or remote
              jobs only.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {jobs.map((job, i) => (
                <li key={job.id}>
                  <JobCard job={job} position={(result.page - 1) * 25 + i + 1} />
                </li>
              ))}
            </ul>
          )}

          {(result.page > 1 || result.hasMore) && (
            <nav aria-label="Result pages" className="mt-6 flex items-center justify-between gap-3">
              <button type="button" className="btn btn-secondary" disabled={result.page <= 1 || loading} onClick={() => goToPage(result.page - 1)}>
                Previous page
              </button>
              <span className="text-sm text-muted">Page {result.page}</span>
              <button type="button" className="btn btn-secondary" disabled={!result.hasMore || loading} onClick={() => goToPage(result.page + 1)}>
                Next page
              </button>
            </nav>
          )}

          <p className="mt-8 text-xs leading-relaxed text-muted">
            Adverts come from{" "}
            {result.sources.map((s, i) => (
              <span key={s.id}>
                {i > 0 && (i === result.sources.length - 1 ? " and " : ", ")}
                {s.label}
              </span>
            ))}
            . We do not write or check them; the board that listed a job is shown on each advert, and applying happens on its
            site. Adverts a board dates more than {result.maxAgeDays} days ago are left out. Teaching Vacancies listings
            contain public sector information licensed under the Open Government Licence v3.0.
          </p>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="mt-8">
          <p className="text-ink-2">Try one of these:</p>
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
                className="min-h-11 rounded-full border border-rule bg-surface px-4 text-sm text-ink-2 hover:border-accent hover:text-accent"
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
