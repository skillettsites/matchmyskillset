"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { JobCard } from "@/components/ui/JobCard";
import type { UnifiedJob } from "@/lib/types";

type SortOption = "relevance" | "newest" | "salary-high" | "salary-low";
type ContractFilter = "all" | "permanent" | "contract" | "part_time";
type SalaryFilter = "all" | "20k+" | "30k+" | "40k+" | "50k+" | "70k+";
type WorkTypeFilter = "all" | "remote" | "hybrid" | "office";

const SALARY_THRESHOLDS: Record<SalaryFilter, number> = {
  all: 0,
  "20k+": 20000,
  "30k+": 30000,
  "40k+": 40000,
  "50k+": 50000,
  "70k+": 70000,
};

export default function JobsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLocation = searchParams.get("location") || "";

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [allJobs, setAllJobs] = useState<UnifiedJob[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters and sorting (client-side on fetched results)
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [contractFilter, setContractFilter] = useState<ContractFilter>("all");
  const [salaryFilter, setSalaryFilter] = useState<SalaryFilter>("all");
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkTypeFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const doSearch = useCallback(async (q: string, loc: string) => {
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    setVisibleCount(20);

    try {
      const params = new URLSearchParams({ q: q.trim() });
      if (loc.trim()) params.set("location", loc.trim());

      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setAllJobs(data.jobs || []);
        setTotalResults(data.totalResults || 0);
      } else {
        setAllJobs([]);
        setTotalResults(0);
      }
    } catch {
      setAllJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, initialLocation);
    }
  }, [initialQuery, initialLocation, doSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query, location);

    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    if (location) url.searchParams.set("location", location);
    else url.searchParams.delete("location");
    window.history.replaceState({}, "", url.toString());
  }

  // Count jobs per source for filter badges
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allJobs.forEach((j) => {
      counts[j.source] = (counts[j.source] || 0) + 1;
    });
    return counts;
  }, [allJobs]);

  // Apply filters and sorting client-side
  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // Source filter
    if (sourceFilter !== "all") {
      result = result.filter((j) => j.source === sourceFilter);
    }

    // Contract type filter
    if (contractFilter !== "all") {
      result = result.filter((j) => {
        const ct = (j.contractType || "").toLowerCase();
        if (contractFilter === "permanent") return ct.includes("permanent") || ct.includes("full_time") || ct.includes("full-time") || ct === "";
        if (contractFilter === "contract") return ct.includes("contract") || ct.includes("temporary") || ct.includes("temp");
        if (contractFilter === "part_time") return ct.includes("part") || ct.includes("part_time") || ct.includes("part-time");
        return true;
      });
    }

    // Salary filter
    if (salaryFilter !== "all") {
      const threshold = SALARY_THRESHOLDS[salaryFilter];
      result = result.filter((j) => {
        const salary = j.salaryMax || j.salaryMin || 0;
        return salary >= threshold;
      });
    }

    // Work type filter
    if (workTypeFilter !== "all") {
      result = result.filter((j) => {
        const title = (j.title || "").toLowerCase();
        const desc = (j.description || "").toLowerCase();
        const loc = (j.location || "").toLowerCase();
        const wt = j.workType || "";
        const text = `${title} ${desc} ${loc} ${wt}`;

        if (workTypeFilter === "remote") {
          return text.includes("remote") || text.includes("work from home") || text.includes("wfh") || wt === "remote";
        }
        if (workTypeFilter === "hybrid") {
          return text.includes("hybrid") || wt === "hybrid";
        }
        if (workTypeFilter === "office") {
          return (text.includes("office") || text.includes("on-site") || text.includes("onsite"))
            && !text.includes("remote") && !text.includes("hybrid");
        }
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      // Featured always first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      switch (sortBy) {
        case "newest": {
          const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          return dateB - dateA;
        }
        case "salary-high": {
          const salA = a.salaryMax || a.salaryMin || 0;
          const salB = b.salaryMax || b.salaryMin || 0;
          return salB - salA;
        }
        case "salary-low": {
          const salA = a.salaryMin || a.salaryMax || 999999;
          const salB = b.salaryMin || b.salaryMax || 999999;
          return salA - salB;
        }
        default:
          return 0; // relevance = API order
      }
    });

    return result;
  }, [allJobs, sortBy, contractFilter, salaryFilter, sourceFilter, workTypeFilter]);

  // Slice for display
  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  const activeFilterCount = [
    contractFilter !== "all",
    salaryFilter !== "all",
    sourceFilter !== "all",
    workTypeFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setSortBy("relevance");
    setContractFilter("all");
    setSalaryFilter("all");
    setSourceFilter("all");
    setWorkTypeFilter("all");
    setVisibleCount(20);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Browse Jobs
      </h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, skill, or keyword..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="sm:w-48">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Sort + Filter bar */}
      {searched && !loading && allJobs.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Top bar: results count + sort + filter toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">{visibleJobs.length}</span>
              {" "}of{" "}
              <span className="font-medium text-gray-700">{filteredJobs.length}</span>
              {filteredJobs.length !== allJobs.length && (
                <> (filtered from {allJobs.length})</>
              )}{" "}
              results
              {totalResults > allJobs.length && (
                <> ({totalResults.toLocaleString()} total across all boards)</>
              )}
              {query && (
                <> for <span className="font-medium text-gray-700">{query}</span></>
              )}
              {location && (
                <> in <span className="font-medium text-gray-700">{location}</span></>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="newest">Sort: Newest first</option>
                <option value="salary-high">Sort: Salary (high to low)</option>
                <option value="salary-low">Sort: Salary (low to high)</option>
              </select>

              {/* Filter toggle button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 text-sm border rounded-lg px-3 py-2 transition-colors ${
                  showFilters || activeFilterCount > 0
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Filter results</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Source filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Source</label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterPill active={sourceFilter === "all"} onClick={() => setSourceFilter("all")}>
                      All
                    </FilterPill>
                    {Object.entries(sourceCounts).map(([source, count]) => (
                      <FilterPill
                        key={source}
                        active={sourceFilter === source}
                        onClick={() => setSourceFilter(sourceFilter === source ? "all" : source)}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)} ({count})
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Contract type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Contract Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["all", "permanent", "contract", "part_time"] as ContractFilter[]).map((ct) => (
                      <FilterPill
                        key={ct}
                        active={contractFilter === ct}
                        onClick={() => setContractFilter(ct)}
                      >
                        {ct === "all" ? "All" : ct === "part_time" ? "Part Time" : ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Salary filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Minimum Salary</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["all", "20k+", "30k+", "40k+", "50k+", "70k+"] as SalaryFilter[]).map((sf) => (
                      <FilterPill
                        key={sf}
                        active={salaryFilter === sf}
                        onClick={() => setSalaryFilter(sf)}
                      >
                        {sf === "all" ? "Any" : `£${sf}`}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Work type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Work Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["all", "remote", "hybrid", "office"] as WorkTypeFilter[]).map((wt) => (
                      <FilterPill
                        key={wt}
                        active={workTypeFilter === wt}
                        onClick={() => setWorkTypeFilter(wt)}
                      >
                        {wt === "all" ? "All" : wt === "remote" ? "Remote / WFH" : wt === "hybrid" ? "Hybrid" : "Office"}
                      </FilterPill>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">
            Searching across multiple job boards...
          </p>
        </div>
      )}

      {/* Job list */}
      {!loading && visibleJobs.length > 0 && (
        <div className="space-y-3">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="bg-white border border-gray-200 text-gray-700 font-medium px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Show More ({filteredJobs.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* No results after filtering */}
      {!loading && searched && allJobs.length > 0 && visibleJobs.length === 0 && filteredJobs.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 mb-3">No jobs match your current filters.</p>
          <button
            onClick={clearFilters}
            className="text-indigo-600 font-medium hover:text-indigo-700 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* No results at all */}
      {!loading && searched && allJobs.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No jobs found{query && <> for &quot;{query}&quot;</>}. Try broadening your search or removing the location filter.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div className="py-16 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Search thousands of UK jobs
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            We search across multiple job boards to find the best matches. Try
            searching for a job title, skill, or industry.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "Data Analyst",
              "Product Manager",
              "UX Designer",
              "Project Manager",
              "Marketing Manager",
              "Software Developer",
              "Operations Manager",
              "Business Analyst",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  doSearch(suggestion, location);
                }}
                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      {children}
    </button>
  );
}
