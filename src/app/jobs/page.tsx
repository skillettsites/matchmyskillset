import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsSearch } from "./JobsSearch";

export const metadata: Metadata = {
  title: "Search live UK jobs, matched to your CV",
  description:
    "Live UK job adverts from Reed, Adzuna, GOV.UK Teaching Vacancies and more in one list, plus remote roles open to UK applicants and jobs posted here. Upload your CV to see your match.",
  alternates: { canonical: "/jobs" },
};

export default function JobsPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-40%] !opacity-[0.14]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1000px] px-4 pb-20 pt-12 sm:px-6 md:pt-16">
        <p className="eyebrow rise text-blue">Live vacancies</p>
        <h1 className="headline rise rise-1 mt-2">
          Search live <span className="gradient-text">UK jobs</span>
        </h1>
        <p className="lede rise rise-2 mt-4 max-w-[720px]">
          Adverts from several UK job boards in one list, with jobs posted on MatchMySkillset first. Each board advert opens on the site that listed it, where you apply.
        </p>
        <Suspense fallback={<p className="mt-8 text-mute">Loading search…</p>}>
          <JobsSearch />
        </Suspense>
      </div>
    </div>
  );
}
