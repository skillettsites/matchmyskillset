import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminConfigured, isAdmin } from "@/lib/employer/admin-auth";
import { CONTRACT_OPTIONS, formatDate, formatSalary, isExpired, publicJobPath } from "@/lib/employer/jobs";
import { jobSkillSet, skillName } from "@/lib/employer/matching";
import { contactDisplayStatus } from "@/lib/employer/candidates";
import { PLAN_IDS, PLAN_NAMES, PLAN_STATUSES, STATUS_LABELS, effectivePlan, limitsFor, type PlanStatus } from "@/lib/employer/plans";
import type { EmployerAccount, JobRow } from "@/lib/employer/types";
import { isoDaysAgo } from "@/lib/employer/server";
import { AdminLogin } from "@/components/employer/AdminLogin";
import { Badge, SkillChip, Stat } from "@/components/employer/ui";
import { adminCloseJob, adminSignOut, approveJob, rejectJob, updateEmployer } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const when = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }) : "";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  if (!(await isAdmin())) {
    return (
      <div className="bg-cloud px-5 py-24">
        <AdminLogin configured={adminConfigured()} />
      </div>
    );
  }
  const { msg, err } = await searchParams;
  const admin = createAdminClient();
  const now = isoDaysAgo(0);
  const weekAgo = isoDaysAgo(7);
  const [pendingRes, liveRes, accountsRes, recentAppsRes, requestsRes, appsTotalRes, apps7Res, discoverableRes, reqTotalRes, reqAcceptedRes] = await Promise.all([
    admin.from("mms_jobs").select("*").eq("status", "pending").order("updated_at", { ascending: true }).limit(100),
    admin.from("mms_jobs").select("*").eq("status", "live").order("expires_at", { ascending: true }).limit(200),
    admin.from("mms_employer_accounts").select("*").order("created_at", { ascending: false }).limit(300),
    admin.from("mms_applications").select("id, created_at, job_id, name, match_score, status").order("created_at", { ascending: false }).limit(20),
    admin.from("mms_contact_requests").select("id, created_at, account_id, candidate_id, status, responded_at").order("created_at", { ascending: false }).limit(30),
    admin.from("mms_applications").select("id", { count: "exact", head: true }),
    admin.from("mms_applications").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    admin.from("mms_candidates").select("id", { count: "exact", head: true }).eq("discoverable", true).is("withdrawn_at", null).gt("expires_at", now),
    admin.from("mms_contact_requests").select("id", { count: "exact", head: true }),
    admin.from("mms_contact_requests").select("id", { count: "exact", head: true }).eq("status", "accepted"),
  ]);
  const appsTotal = appsTotalRes.count ?? 0;
  const apps7 = apps7Res.count ?? 0;
  const discoverable = discoverableRes.count ?? 0;
  const pending = (pendingRes.data as JobRow[]) ?? [];
  const live = (liveRes.data as JobRow[]) ?? [];
  const accounts = (accountsRes.data as EmployerAccount[]) ?? [];
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const liveByAccount = new Map<string, number>();
  for (const j of live) if (j.account_id && !isExpired(j)) liveByAccount.set(j.account_id, (liveByAccount.get(j.account_id) ?? 0) + 1);
  const recentApps = recentAppsRes.data ?? [];
  const requests = requestsRes.data ?? [];

  const jobTitles = new Map<string, string>();
  const appJobIds = [...new Set(recentApps.map((a) => a.job_id))];
  if (appJobIds.length) {
    const { data } = await admin.from("mms_jobs").select("id, title").in("id", appJobIds);
    for (const j of data ?? []) jobTitles.set(j.id, j.title);
  }
  const candIds = [...new Set(requests.map((r) => r.candidate_id))];
  const candHeadlines = new Map<string, string>();
  if (candIds.length) {
    const { data } = await admin.from("mms_candidates").select('id, headline, "current_role"').in("id", candIds);
    for (const c of (data ?? []) as unknown as { id: string; headline: string | null; current_role: string | null }[]) {
      candHeadlines.set(c.id, c.headline || c.current_role || "Candidate");
    }
  }

  return (
    <div className="bg-cloud px-5 pb-24 pt-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-center justify-between gap-4">
          <h1 className="headline">Admin</h1>
          <form action={adminSignOut}>
            <button className="btn btn-secondary btn-sm">Sign out</button>
          </form>
        </div>

        {msg && <p className="mt-6 rounded-2xl bg-[#e8f6ec] px-4 py-3 text-[15px] text-[#1d7f37]">{msg}</p>}
        {err && <p className="mt-6 rounded-2xl bg-[#fdecea] px-4 py-3 text-[15px] text-[#8c1d18]">{err}</p>}

        <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Waiting for approval" value={pending.length} />
          <Stat label="Live jobs" value={live.filter((j) => !isExpired(j)).length} />
          <Stat label="Employers" value={accounts.length} />
          <Stat label="Applications" value={appsTotal} hint={`${apps7} in the last 7 days`} />
          <Stat label="Contact requests" value={reqTotalRes.count ?? 0} hint={`${reqAcceptedRes.count ?? 0} accepted`} />
          <Stat label="Findable candidates" value={discoverable} />
        </div>

        {/* Pending jobs */}
        <h2 id="pending" className="title mt-14 scroll-mt-24">
          Jobs waiting for approval
        </h2>
        <div className="mt-4 space-y-3">
          {pending.length === 0 && <p className="text-mute">Nothing waiting.</p>}
          {pending.map((job) => {
            const acc = job.account_id ? accountById.get(job.account_id) : undefined;
            const plan = acc ? effectivePlan(acc) : null;
            const limits = limitsFor(plan);
            const skills = jobSkillSet(job.title, job.skills).ids;
            return (
              <div key={job.id} className="rounded-[22px] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[19px] font-bold tracking-[-0.02em] text-ink">{job.title}</p>
                    <p className="mt-1 text-[14px] text-mute">
                      {job.company_name} · {acc?.email ?? "no account"} · {plan ? `${PLAN_NAMES[plan]} (${acc?.plan_status})` : "NO ACTIVE PLAN"}
                      {limits?.liveJobs ? ` · ${liveByAccount.get(job.account_id ?? "") ?? 0} of ${limits.liveJobs} live` : ""}
                    </p>
                    <p className="mt-1 text-[14px] text-mute">
                      {job.remote === "remote" ? "Remote" : `${job.location}${job.remote === "hybrid" ? " (hybrid)" : ""}`}
                      {job.region ? ` · ${job.region}` : ""} · {formatSalary(job) ?? "No pay shown"} ·{" "}
                      {CONTRACT_OPTIONS.find((o) => o.value === job.contract_type)?.label ?? ""} · submitted {when(job.updated_at)}
                    </p>
                    <p className="mt-1 break-all text-[14px] text-mute">
                      Apply:{" "}
                      {job.apply_method === "mms" ? (
                        "through MatchMySkillset"
                      ) : job.apply_method === "url" && job.apply_url ? (
                        <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="text-link">
                          {job.apply_url}
                        </a>
                      ) : (
                        job.apply_email
                      )}
                    </p>
                  </div>
                  <Badge tone="amber">Pending</Badge>
                </div>
                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <SkillChip key={s} name={skillName(s)} />
                    ))}
                  </div>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer text-[15px] font-medium text-link">Read the description</summary>
                  <p className="mt-3 max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-cloud p-4 text-[15px] leading-relaxed text-ink-2">{job.description}</p>
                </details>
                <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr]">
                  <form action={approveJob}>
                    <input type="hidden" name="id" value={job.id} />
                    <button className="btn btn-primary btn-sm">Approve and put live</button>
                  </form>
                  <form action={rejectJob} className="flex flex-col gap-2 sm:flex-row">
                    <input type="hidden" name="id" value={job.id} />
                    <input name="reason" required minLength={5} className="field !py-2 !text-[14px]" placeholder="Reason for sending it back (emailed to the employer)" />
                    <button className="btn btn-secondary btn-sm shrink-0">Send back</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live jobs */}
        <h2 id="live" className="title mt-14 scroll-mt-24">
          Live jobs
        </h2>
        <div className="mt-4 space-y-2">
          {live.length === 0 && <p className="text-mute">None yet.</p>}
          {live.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white p-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">
                  <Link href={publicJobPath(job.id)} target="_blank" className="hover:underline">
                    {job.title}
                  </Link>{" "}
                  <span className="font-normal text-mute">
                    · {job.company_name} · {job.views} views · {isExpired(job) ? "expired" : "until"} {formatDate(job.expires_at)}
                  </span>
                </p>
              </div>
              <form action={adminCloseJob}>
                <input type="hidden" name="id" value={job.id} />
                <button className="btn btn-secondary btn-sm">Close</button>
              </form>
            </div>
          ))}
        </div>

        {/* Employers */}
        <h2 id="employers" className="title mt-14 scroll-mt-24">
          Employers
        </h2>
        <p className="mt-2 text-[14px] text-mute">
          Set a plan to <strong>comped</strong>{" "}for launch trials and partner clients: jobs can then go live without payment, with that plan&apos;s limits.
        </p>
        <div className="mt-4 space-y-3">
          {accounts.length === 0 && <p className="text-mute">No employers yet.</p>}
          {accounts.map((a) => (
            <div key={a.id} className="rounded-[22px] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-ink">
                    {a.company_name || "(setup not finished)"}{" "}
                    <span className="font-normal text-mute">
                      · {a.contact_name || "no name"} ·{" "}
                      <a href={`mailto:${a.email}`} className="text-link">
                        {a.email}
                      </a>
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] text-mute">
                    Joined {when(a.created_at)}
                    {a.website ? (
                      <>
                        {" "}
                        ·{" "}
                        <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-link">
                          {a.website}
                        </a>
                      </>
                    ) : null}{" "}
                    · {liveByAccount.get(a.id) ?? 0} live · {a.stripe_customer_id ? `Stripe ${a.stripe_customer_id}` : "no Stripe customer"}
                    {a.current_period_end ? ` · period ends ${formatDate(a.current_period_end)}` : ""}
                  </p>
                </div>
                <Badge tone={effectivePlan(a) ? "green" : "grey"}>
                  {a.plan === "none" ? "No plan" : PLAN_NAMES[a.plan as keyof typeof PLAN_NAMES] ?? a.plan} · {STATUS_LABELS[a.plan_status as PlanStatus] ?? a.plan_status}
                </Badge>
              </div>
              <form action={updateEmployer} className="mt-4 grid gap-2 md:grid-cols-[160px_220px_1fr_auto]">
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="label" value={a.company_name || a.email} />
                <select name="plan" defaultValue={a.plan} className="field !py-2 !text-[14px]" aria-label="Plan">
                  <option value="none">No plan</option>
                  {PLAN_IDS.map((p) => (
                    <option key={p} value={p}>
                      {PLAN_NAMES[p]}
                    </option>
                  ))}
                </select>
                <select name="plan_status" defaultValue={a.plan_status} className="field !py-2 !text-[14px]" aria-label="Status">
                  {PLAN_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input name="notes" defaultValue={a.notes ?? ""} className="field !py-2 !text-[14px]" placeholder="Notes (only you see these)" maxLength={2000} />
                <button className="btn btn-dark btn-sm">Save</button>
              </form>
            </div>
          ))}
        </div>

        {/* Applications */}
        <h2 id="applications" className="title mt-14 scroll-mt-24">
          Recent applications
        </h2>
        <p className="mt-2 text-[14px] text-mute">
          {appsTotal} in total, {apps7} in the last 7 days. CVs are only visible to the employer they were sent to.
        </p>
        <div className="mt-4 overflow-x-auto rounded-[18px] bg-white">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead className="text-[12px] text-mute">
              <tr className="border-b border-black/[0.06]">
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Job</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Match</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-mute">
                    None yet.
                  </td>
                </tr>
              )}
              {recentApps.map((a) => (
                <tr key={a.id} className="border-b border-black/[0.04] last:border-0">
                  <td className="px-4 py-3 text-mute">{when(a.created_at)}</td>
                  <td className="px-4 py-3">{jobTitles.get(a.job_id) ?? a.job_id}</td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{typeof a.match_score === "number" ? `${a.match_score}%` : ""}</td>
                  <td className="px-4 py-3">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contact requests */}
        <h2 id="requests" className="title mt-14 scroll-mt-24">
          Contact requests
        </h2>
        <div className="mt-4 overflow-x-auto rounded-[18px] bg-white">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead className="text-[12px] text-mute">
              <tr className="border-b border-black/[0.06]">
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Employer</th>
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-mute">
                    None yet.
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-black/[0.04] last:border-0">
                  <td className="px-4 py-3 text-mute">{when(r.created_at)}</td>
                  <td className="px-4 py-3">{accountById.get(r.account_id)?.company_name ?? r.account_id}</td>
                  <td className="px-4 py-3">{candHeadlines.get(r.candidate_id) ?? "Candidate"}</td>
                  <td className="px-4 py-3">
                    {contactDisplayStatus(r)}
                    {r.responded_at ? ` (${formatDate(r.responded_at)})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
