import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsSearch } from "./JobsSearch";

export const metadata: Metadata = {
  title: "Search live UK jobs from Reed, Adzuna and more",
  description:
    "Search live UK job adverts from Reed, Adzuna and GOV.UK Teaching Vacancies in one place, plus remote roles open to UK applicants. Every result links to the original advert.",
};

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-reading">
        <p className="kicker text-accent">Live vacancies</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">Search live UK jobs</h1>
        <p className="mt-3 text-lede text-ink-2">
          Adverts from several UK job boards in one list, newest first. Each result opens the original advert on the board
          that listed it, where you apply.
        </p>
      </div>
      <Suspense fallback={<p className="mt-8 text-muted">Loading search…</p>}>
        <JobsSearch />
      </Suspense>
    </div>
  );
}
