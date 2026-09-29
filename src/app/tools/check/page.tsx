import type { Metadata } from "next";
import Link from "next/link";
import { getCandidate } from "@/lib/candidate/session";
import { isPlusAccount } from "@/lib/candidate/entitlements";
import { JOB_FIT_SUMMARY } from "@/lib/apis/jobs/fit";
import { PLUS_PRICE_LABEL } from "@/lib/candidate/plans";
import { CheckJob } from "./CheckJob";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check any job",
  description: "Paste any job advert and see how well your CV matches it, and the skills it asks for that your CV does not show. Part of MatchMySkillset Plus.",
  alternates: { canonical: "/tools/check" },
};

export default async function CheckPage() {
  const account = await getCandidate();
  const plus = isPlusAccount(account);
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-30%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1080px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="text-[14px] text-mute">
          <Link href="/tools" className="text-link hover:underline">
            CV tools
          </Link>{" "}
          <span aria-hidden="true">›</span> Check any job
        </nav>
        <p className="eyebrow rise mt-6 text-blue">Plus</p>
        <h1 className="headline rise rise-1 mt-2 max-w-[820px]">
          Check <span className="gradient-text">any job.</span>
        </h1>
        <p className="lede rise rise-2 mt-4 max-w-[760px] !text-[19px]">
          Paste an advert from anywhere and see your match and the skills it asks for that your CV does not show, scored against the skills from your results.
        </p>
        {plus ? (
          <CheckJob />
        ) : (
          <div className="card-white mt-10 max-w-[680px] p-6 sm:p-8">
            <p className="text-[21px] font-semibold tracking-[-0.02em] text-ink">Check any job comes with Plus</p>
            <p className="mt-2 text-[15px] text-ink-2">
              Plus is {PLUS_PRICE_LABEL} a month and also includes job packs for the jobs you apply for. The jobs on your free results page already show your match.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/plus" className="btn btn-primary btn-sm">
                See Plus
              </Link>
              {!account && (
                <Link href="/account/sign-in?next=/tools/check" className="btn btn-secondary btn-sm">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
        <p className="mt-10 max-w-[760px] text-[13px] leading-relaxed text-mute">
          <strong className="text-ink-2">How we score:</strong> {JOB_FIT_SUMMARY}
        </p>
      </div>
    </div>
  );
}
