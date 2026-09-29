import type { Metadata } from "next";
import Link from "next/link";
import { isStripeReady } from "@/lib/apis/stripe";
import { candidateTablesReady, getCandidate } from "@/lib/candidate/session";
import { entitlementFor } from "@/lib/candidate/entitlements";
import { jobFromMms, jobFromResults, packFit, resultsProfile, skillCheck } from "@/lib/candidate/job-source";
import type { PackFit, PackJob } from "@/lib/candidate/pack-types";
import { TailorFlow } from "./TailorFlow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tailor your CV for a job",
  description: "Rewrite your own CV for one job advert, with a cover letter and interview prep. Built only from what your CV says.",
  robots: { index: false, follow: true },
};

type Search = Promise<Record<string, string | undefined>>;

export default async function TailorPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const from = sp.from ?? null;
  const jobId = sp.job ?? null;
  const mmsId = sp.mms ?? null;

  const [ready, account, paymentsOpen] = await Promise.all([candidateTablesReady(), getCandidate(), isStripeReady().catch(() => false)]);
  const ent = await entitlementFor(account);

  let job: PackJob | null = null;
  let source: "results" | "mms" | "pasted" = "pasted";
  let missing = false;
  if (from && jobId) {
    job = await jobFromResults(from, jobId);
    source = "results";
    missing = !job;
  } else if (mmsId) {
    job = await jobFromMms(mmsId);
    source = "mms";
    missing = !job;
  }

  // The match on the person's results (the same number as the job card); the CV check is added when they write the pack.
  let fit: PackFit | null = null;
  const profile = source === "results" ? await resultsProfile(from) : null;
  if (job && profile) fit = packFit(job, profile, skillCheck(job, "", profile));

  const here = `/tools/tailor${from && jobId ? `?from=${encodeURIComponent(from)}&job=${encodeURIComponent(jobId)}` : mmsId ? `?mms=${encodeURIComponent(mmsId)}` : ""}`;

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-30%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="text-[14px] text-mute">
          {from ? (
            <Link href={`/results/${encodeURIComponent(from)}#jobs`} className="text-link hover:underline">
              Your results
            </Link>
          ) : (
            <Link href="/tools" className="text-link hover:underline">
              CV tools
            </Link>
          )}{" "}
          <span aria-hidden="true">›</span> Tailor my CV
        </nav>
        <p className="eyebrow rise mt-6 text-blue">Job pack</p>
        <h1 className="headline rise rise-1 mt-2 max-w-[820px]">
          {job ? (
            <>
              Tailor your CV for <span className="gradient-text">{job.title}</span>
            </>
          ) : (
            <>
              Tailor your CV for <span className="gradient-text">any job</span>
            </>
          )}
        </h1>
        <p className="lede rise rise-2 mt-4 max-w-[760px] !text-[19px]">
          We rewrite your own CV so the experience this employer wants comes first. We never add jobs, qualifications, dates, skills or figures that are not in your CV:
          anything the advert asks for that your CV does not show is listed as a gap instead.
        </p>

        {sp.checkout === "cancelled" && (
          <p role="status" className="mt-6 max-w-[760px] rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink">
            Payment cancelled. You have not been charged.
          </p>
        )}
        {missing && (
          <p role="alert" className="mt-6 max-w-[760px] rounded-2xl bg-[#fdecea] px-4 py-3 text-[15px] text-[#8c1d18]">
            We could not find that job any more. It may have closed, or your results may have a newer job list. You can still paste the advert below.
          </p>
        )}

        <TailorFlow
          ready={ready}
          source={job ? source : "pasted"}
          from={from}
          jobId={source === "results" && job ? jobId : null}
          mmsId={source === "mms" && job ? mmsId : null}
          job={job}
          fit={fit}
          here={here}
          paymentsOpen={paymentsOpen}
          initial={{
            signedIn: ent.signedIn,
            email: account?.email ?? null,
            plus: ent.plus,
            plusLeft: ent.plusUsage?.left ?? null,
            freeAvailable: ent.freeAvailable,
            saved: account?.saved_cv_at ? { name: account.saved_cv_name, at: account.saved_cv_at } : null,
          }}
        />
      </div>
    </div>
  );
}
