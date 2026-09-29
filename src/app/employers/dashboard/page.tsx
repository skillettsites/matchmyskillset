import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEmployer } from "@/lib/employer/session";
import { applicationCounts, applicationRate, displayStatus, formatDate, isExpired, listAccountJobs } from "@/lib/employer/jobs";
import { effectivePlan, limitsFor, PLAN_NAMES, STATUS_LABELS, type PlanStatus } from "@/lib/employer/plans";
import { contactDisplayStatus } from "@/lib/employer/candidates";
import { accountShortlists, EMPLOYER_SHORTLIST_STATUS } from "@/lib/employer/shortlists";
import { Badge, EmptyState, Notice, PageHead, Stat } from "@/components/employer/ui";
import { Plus } from "@/components/employer/icons";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  deleted: "The draft was deleted.",
  missing: "That job was not found.",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ notice?: string; welcome?: string }> }) {
  const account = await requireEmployer();
  const { notice, welcome } = await searchParams;
  const plan = effectivePlan(account);
  const limits = limitsFor(plan);
  const jobs = await listAccountJobs(account.id);
  const [counts, shortlists] = await Promise.all([applicationCounts(jobs.map((j) => j.id)), accountShortlists(account.id)]);
  const requests = await createAdminClient().from("mms_contact_requests").select("status, created_at").eq("account_id", account.id).limit(1000);

  const liveNow = jobs.filter((j) => j.status === "live" && !isExpired(j)).length;
  const pending = jobs.filter((j) => j.status === "pending").length;
  const totalApps = [...counts.values()].reduce((n, c) => n + c.total, 0);
  const newApps = [...counts.values()].reduce((n, c) => n + c.fresh, 0);
  const openRequests = (requests.data ?? []).filter((r) => contactDisplayStatus(r) === "pending").length;
  const accepted = (requests.data ?? []).filter((r) => r.status === "accepted").length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <PageHead title={welcome ? `Welcome, ${account.contact_name?.split(" ")[0] ?? ""}.` : "Your jobs"}>
          {welcome ? "Your account is ready. Post your first job below; you can save it as a draft while you choose a plan." : null}
        </PageHead>
        <Link href="/employers/dashboard/jobs/new" className="btn btn-primary mb-8">
          <Plus /> Post a job
        </Link>
      </div>

      {notice && NOTICES[notice] && (
        <div className="mb-6">
          <Notice>{NOTICES[notice]}</Notice>
        </div>
      )}

      {!plan && (
        <div className="mb-6">
          <Notice tone="amber">
            <strong>Choose a plan to put jobs live.</strong> You can write and save jobs as drafts now.{" "}
            {account.plan_status === "cancelled" ? "Your previous plan has ended. " : ""}
            <Link href="/employers/dashboard/billing" className="font-semibold underline">
              See plans
            </Link>
          </Notice>
        </div>
      )}
      {account.plan_status === "past_due" && (
        <div className="mb-6">
          <Notice tone="amber">
            <strong>Your last payment did not go through.</strong> Your jobs stay live while Stripe tries again. Please update your card on the{" "}
            <Link href="/employers/dashboard/billing" className="font-semibold underline">
              billing page
            </Link>
            .
          </Notice>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Live jobs"
          value={limits?.liveJobs ? `${liveNow} of ${limits.liveJobs}` : liveNow}
          hint={pending ? `${pending} waiting for approval` : plan ? `${PLAN_NAMES[plan]} plan` : STATUS_LABELS[(account.plan_status as PlanStatus) ?? "inactive"]}
        />
        <Stat label="Applications" value={totalApps} hint={newApps ? `${newApps} new` : "All seen"} />
        <Stat label="Contact requests waiting" value={openRequests} hint={`${accepted} accepted so far`} />
        <Stat label="Matched candidates shown" value={limits ? (limits.matchedPerRole === null ? "Unlimited" : `Up to ${limits.matchedPerRole}`) : "None"} hint="per role" />
      </div>

      <h2 className="mt-12 text-[22px] font-bold tracking-[-0.02em] text-ink">All jobs</h2>
      <div className="mt-4">
        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs yet."
            action={
              <Link href="/employers/dashboard/jobs/new" className="btn btn-primary">
                Post your first job
              </Link>
            }
          >
            Write the advert once. We tag the skills it asks for, check it, and match it to job seekers whose CVs fit.
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {jobs.map((job) => {
              const s = displayStatus(job);
              const c = counts.get(job.id) ?? { total: 0, fresh: 0 };
              const sl = shortlists.get(job.id);
              const slStatus = sl && sl.status !== "cancelled" ? EMPLOYER_SHORTLIST_STATUS[sl.status] : null;
              return (
                <li key={job.id}>
                  <Link href={`/employers/dashboard/jobs/${job.id}`} className="block rounded-[18px] bg-white p-5 transition-shadow hover:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.18)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[17px] font-semibold text-ink">{job.title}</p>
                        <p className="mt-1 text-[14px] text-mute">
                          {job.remote === "remote" ? "Remote" : job.location}
                          {job.remote === "hybrid" ? " (hybrid)" : ""}
                          {job.status === "live" && job.expires_at ? ` · ${isExpired(job) ? "Expired" : "Live until"} ${formatDate(job.expires_at)}` : ""}
                          {job.status !== "live" ? ` · Updated ${formatDate(job.updated_at)}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {slStatus && <Badge tone={slStatus.tone}>Recruiter shortlist: {slStatus.label.toLowerCase()}</Badge>}
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-3 text-[14px] sm:max-w-[460px]">
                      <div>
                        <dt className="text-mute">Views</dt>
                        <dd className="font-semibold text-ink">{job.views}</dd>
                      </div>
                      <div>
                        <dt className="text-mute">Applications</dt>
                        <dd className="font-semibold text-ink">
                          {c.total}
                          {c.fresh ? <span className="ml-1.5 text-[12px] font-semibold text-blue">{c.fresh} new</span> : null}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-mute">Application rate</dt>
                        <dd className="font-semibold text-ink">{applicationRate(c.total, job.views)}</dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
