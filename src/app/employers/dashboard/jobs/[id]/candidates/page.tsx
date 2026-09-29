import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UK_REGIONS } from "@/lib/apis/regions";
import { requireEmployer } from "@/lib/employer/session";
import { getAccountJob, listAccountJobs } from "@/lib/employer/jobs";
import { jobSkillSet, MATCH_METHOD_SUMMARY } from "@/lib/employer/matching";
import { contactStatusMap, loadDiscoverable, rankCandidates } from "@/lib/employer/candidates";
import { effectivePlan, limitsFor, moreMatchesHint } from "@/lib/employer/plans";
import { isUuid } from "@/lib/employer/server";
import { CandidateCard } from "@/components/employer/CandidateCard";
import { JobTabs } from "@/components/employer/JobTabs";
import { EmptyState, Notice, PageHead } from "@/components/employer/ui";

export const metadata: Metadata = { title: "Matched candidates", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MatchedCandidatesPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ region?: string }> }) {
  const account = await requireEmployer();
  const { id } = await params;
  const { region: regionParam } = await searchParams;
  const job = isUuid(id) ? await getAccountJob(account.id, id) : null;
  if (!job) notFound();

  const region = UK_REGIONS.find((r) => r === regionParam) ?? null;
  const plan = effectivePlan(account);
  const limits = limitsFor(plan);
  const skillSet = jobSkillSet(job.title, job.skills);
  const ranked = rankCandidates(skillSet, await loadDiscoverable({ region }));
  const cap = limits?.matchedPerRole ?? null;
  const visible = limits ? (cap === null ? ranked : ranked.slice(0, cap)) : [];
  const contacts = await contactStatusMap(account.id, visible.map((r) => r.candidate.id));
  const jobs = (await listAccountJobs(account.id)).filter((j) => j.status !== "draft").map((j) => ({ id: j.id, title: j.title }));

  return (
    <div>
      <PageHead title={job.title} eyebrow="Matched candidates" back={{ href: "/employers/dashboard", label: "All jobs" }}>
        People who asked employers to find them and whose skills match this job. You see an anonymous profile until they accept your request.
      </PageHead>
      <JobTabs jobId={job.id} active="candidates" />

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label htmlFor="region" className="field-label !text-[13px]">
            Region
          </label>
          <select id="region" name="region" defaultValue={region ?? ""} className="field !w-auto !py-2.5 !text-[15px]">
            <option value="">Anywhere in the UK</option>
            {UK_REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary btn-sm mb-1">
          Show
        </button>
      </form>

      {skillSet.ids.length === 0 ? (
        <EmptyState title="No skills to match on yet.">We did not find any skills in this advert. Edit it and name the skills you need.</EmptyState>
      ) : !limits ? (
        <Notice tone="amber">
          <strong>
            {ranked.length} {ranked.length === 1 ? "person matches" : "people match"} this job.
          </strong>{" "}
          Choose a plan to see their profiles and ask to contact them.{" "}
          <Link href="/employers/dashboard/billing" className="font-semibold underline">
            See plans
          </Link>
        </Notice>
      ) : ranked.length === 0 ? (
        <EmptyState title="No matches yet.">
          Nobody who has opted in {region ? `in ${region} ` : ""}has these skills yet. Check back later, or widen the region.
        </EmptyState>
      ) : (
        <>
          {cap !== null && ranked.length > cap && (
            <div className="mb-5">
              <Notice>
                Showing your top {cap} of {ranked.length} matches. {moreMatchesHint(plan)}{" "}
                <Link href="/employers/dashboard/billing" className="font-semibold underline">
                  Compare plans
                </Link>
              </Notice>
            </div>
          )}
          <ul className="space-y-3">
            {visible.map((r) => (
              <li key={r.candidate.id}>
                <CandidateCard ranked={r} showScore contact={contacts.get(r.candidate.id)} jobs={jobs} defaultJobId={job.id} canContact />
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] leading-snug text-mute">{MATCH_METHOD_SUMMARY}</p>
        </>
      )}
    </div>
  );
}
