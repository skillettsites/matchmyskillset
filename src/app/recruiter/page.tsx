import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRecruiter, recruiterConfigured } from "@/lib/employer/recruiter-auth";
import { applicationCounts, CONTRACT_OPTIONS, formatDate, formatSalary, isExpired } from "@/lib/employer/jobs";
import { isShortlistSchemaMissing } from "@/lib/employer/shortlists";
import type { JobRow, ShortlistRow } from "@/lib/employer/types";
import { RecruiterLogin } from "@/components/recruiter/RecruiterLogin";
import { Badge, EmptyState, Notice } from "@/components/employer/ui";
import { recruiterSignOut } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recruiter", robots: { index: false, follow: false } };

// The recruiter queue: shortlist requests waiting, oldest first. Only jobs
// that went live after approval ever get a request.

const COLS = "id, created_at, updated_at, job_id, account_id, status, requested_at, started_at, sent_at, recruiter_name, summary";
type QueueJob = Pick<
  JobRow,
  "id" | "title" | "company_name" | "location" | "region" | "remote" | "salary_min" | "salary_max" | "salary_period" | "contract_type" | "status" | "expires_at"
>;

function daysWaiting(since: string): string {
  const days = Math.floor((Date.now() - new Date(since).getTime()) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
}

export default async function RecruiterPage({ searchParams }: { searchParams: Promise<{ sent?: string; mail?: string; cancelled?: string }> }) {
  if (!(await isRecruiter())) {
    return (
      <div className="bg-cloud px-5 py-24">
        <RecruiterLogin configured={recruiterConfigured()} />
      </div>
    );
  }
  const { sent, mail, cancelled } = await searchParams;
  const admin = createAdminClient();
  const [openRes, doneRes] = await Promise.all([
    admin.from("mms_shortlists").select(COLS).in("status", ["requested", "in_progress"]).order("requested_at", { ascending: true }).limit(200),
    admin.from("mms_shortlists").select(COLS).in("status", ["sent", "cancelled"]).order("updated_at", { ascending: false }).limit(20),
  ]);
  const off = isShortlistSchemaMissing(openRes.error);
  if (openRes.error && !off) console.error("[recruiter] queue failed:", openRes.error.message);
  const open = (openRes.data as ShortlistRow[]) ?? [];
  const done = (doneRes.data as ShortlistRow[]) ?? [];
  const jobIds = [...new Set([...open, ...done].map((s) => s.job_id))];
  const jobs = new Map<string, QueueJob>();
  if (jobIds.length) {
    const { data } = await admin
      .from("mms_jobs")
      .select("id, title, company_name, location, region, remote, salary_min, salary_max, salary_period, contract_type, status, expires_at")
      .in("id", jobIds);
    for (const j of (data as QueueJob[]) ?? []) jobs.set(j.id, j);
  }
  const counts = await applicationCounts(open.map((s) => s.job_id));

  return (
    <div className="bg-cloud px-5 pb-24 pt-10">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-blue">Recruiter workspace</p>
            <h1 className="headline mt-1">Shortlist requests</h1>
          </div>
          <form action={recruiterSignOut}>
            <button className="btn btn-secondary btn-sm">Sign out</button>
          </form>
        </div>
        <p className="mt-4 max-w-[720px] text-[16px] leading-snug text-mute">
          Growth and Enterprise employers get a shortlist for each live job. Oldest request first. Open one to review the applicants and the people who asked to be
          found, pick the best fits in order, add a note on each, and send it.
        </p>

        {sent && (
          <div className="mt-6">
            <Notice tone={mail === "failed" ? "amber" : "green"}>
              Sent the shortlist for {sent}.{mail === "failed" ? " The email to the employer failed, but it is in their dashboard. Dave has been told." : " The employer has been emailed."}
            </Notice>
          </div>
        )}
        {cancelled && (
          <div className="mt-6">
            <Notice>Request cancelled.</Notice>
          </div>
        )}
        {off && (
          <div className="mt-6">
            <Notice tone="amber">Shortlists are not switched on yet. Requests will appear here once they are.</Notice>
          </div>
        )}

        <h2 className="title mt-10">Waiting ({open.length})</h2>
        <div className="mt-4 space-y-3">
          {open.length === 0 ? (
            <EmptyState title="No shortlist requests waiting.">New requests appear here, oldest first, when a Growth or Enterprise employer&apos;s job goes live.</EmptyState>
          ) : (
            open.map((s) => {
              const job = jobs.get(s.job_id);
              const c = counts.get(s.job_id) ?? { total: 0, fresh: 0 };
              const ended = job ? job.status !== "live" || isExpired(job) : true;
              return (
                <Link
                  key={s.id}
                  href={`/recruiter/${s.id}`}
                  className="block rounded-[22px] bg-white p-5 transition-shadow hover:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.18)] sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[18px] font-bold tracking-[-0.02em] text-ink">{job?.title ?? "Job removed"}</p>
                      {job && (
                        <p className="mt-1 text-[14px] text-mute">
                          {job.company_name} · {job.remote === "remote" ? "Remote" : `${job.location ?? ""}${job.remote === "hybrid" ? " (hybrid)" : ""}`}
                          {job.region ? ` · ${job.region}` : ""} · {formatSalary(job) ?? "No pay shown"} · {CONTRACT_OPTIONS.find((o) => o.value === job.contract_type)?.label ?? ""}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ended && <Badge tone="red">Job no longer live</Badge>}
                      <Badge tone={s.status === "in_progress" ? "amber" : "blue"}>{s.status === "in_progress" ? "In progress" : "New"}</Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-[14px] text-mute">
                    Asked for {daysWaiting(s.requested_at)} ({formatDate(s.requested_at)}) · {c.total} {c.total === 1 ? "applicant" : "applicants"}
                    {s.recruiter_name ? ` · started by ${s.recruiter_name}` : ""}
                  </p>
                </Link>
              );
            })
          )}
        </div>

        {done.length > 0 && (
          <>
            <h2 className="title mt-14">Recently sent or cancelled</h2>
            <div className="mt-4 overflow-x-auto rounded-[18px] bg-white">
              <table className="w-full min-w-[560px] text-left text-[14px]">
                <thead className="text-[12px] text-mute">
                  <tr className="border-b border-black/[0.06]">
                    <th className="px-4 py-3 font-semibold">Job</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">By</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody>
                  {done.map((s) => {
                    const job = jobs.get(s.job_id);
                    return (
                      <tr key={s.id} className="border-b border-black/[0.04] last:border-0">
                        <td className="px-4 py-3">
                          <Link href={`/recruiter/${s.id}`} className="text-link hover:underline">
                            {job ? `${job.title}, ${job.company_name}` : "Job removed"}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{s.status === "sent" ? "Sent" : "Cancelled"}</td>
                        <td className="px-4 py-3">{s.recruiter_name ?? ""}</td>
                        <td className="px-4 py-3 text-mute">{formatDate(s.sent_at ?? s.updated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
