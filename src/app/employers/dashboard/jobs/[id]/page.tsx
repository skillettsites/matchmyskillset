import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSocUnitGroup } from "@/data/careers";
import { requireEmployer } from "@/lib/employer/session";
import {
  applicationRate,
  CONTRACT_OPTIONS,
  displayStatus,
  formatDate,
  formatSalary,
  getAccountJob,
  HOURS_OPTIONS,
  isExpired,
  publicJobPath,
  REMOTE_OPTIONS,
} from "@/lib/employer/jobs";
import { jobSkillSet, parseSkillIds, skillName } from "@/lib/employer/matching";
import { loadDiscoverable, rankCandidates } from "@/lib/employer/candidates";
import { isUuid } from "@/lib/employer/server";
import { effectivePlan, hasRecruiterShortlist, JOBS_EMAIL, LISTING_DAYS } from "@/lib/employer/plans";
import { getJobShortlist, shortlistItems } from "@/lib/employer/shortlists";
import { ShortlistSection } from "@/components/employer/ShortlistSection";
import { JobTabs } from "@/components/employer/JobTabs";
import { Badge, Notice, PageHead, SkillChip, Stat } from "@/components/employer/ui";
import { jobCommand } from "../../actions";

export const metadata: Metadata = { title: "Job details", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NOTICES: Record<string, { tone: "blue" | "amber" | "green"; text: string }> = {
  submitted: { tone: "green", text: "Thanks. Your job is with us for a quick check. We will email you as soon as it is live." },
  draft: { tone: "blue", text: "Draft saved. Submit it for approval whenever you are ready." },
  blocked: { tone: "amber", text: "Saved as a draft: your plan has no free live listings right now (or no plan yet). Close a job or choose a plan, then submit it." },
  closed: { tone: "blue", text: "Job closed. It is no longer on the site." },
  renewed: { tone: "green", text: `Renewed for another ${LISTING_DAYS} days.` },
  limit: { tone: "amber", text: "Your plan has no free live listings right now. Close another job or move to a bigger plan first." },
  unchanged: { tone: "blue", text: "Nothing changed." },
  "shortlist-requested": { tone: "green", text: "Thanks. Your recruiter shortlist is in the queue. We will email you when it is ready." },
  "shortlist-queued": { tone: "green", text: "Thanks. Our recruiters will start your shortlist as soon as the job is approved and live." },
  "shortlist-exists": { tone: "blue", text: "You have already asked for a shortlist for this job. Its progress is shown below." },
  "shortlist-closed": { tone: "amber", text: "This job is not live. Renew or reopen it to ask for a recruiter shortlist." },
  "shortlist-plan": { tone: "amber", text: "Recruiter shortlists come with the Growth and Enterprise plans." },
  "shortlist-off": { tone: "amber", text: `Recruiter shortlists are not switched on yet, so we could not record your request. Please try again later, or email ${JOBS_EMAIL}.` },
  "shortlist-error": { tone: "amber", text: "We could not ask for the shortlist just now. Please try again." },
};

function Command({ id, op, label, variant = "btn-secondary" }: { id: string; op: string; label: string; variant?: string }) {
  return (
    <form action={jobCommand}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button type="submit" className={`btn btn-sm ${variant}`}>
        {label}
      </button>
    </form>
  );
}

export default async function JobPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string; shortlist?: string }> }) {
  const account = await requireEmployer();
  const { id } = await params;
  const { notice, shortlist: shortlistNotice } = await searchParams;
  const job = isUuid(id) ? await getAccountJob(account.id, id) : null;
  if (!job) notFound();

  const admin = createAdminClient();
  const statusCount = async (status?: string) => {
    let q = admin.from("mms_applications").select("id", { count: "exact", head: true }).eq("job_id", job.id);
    if (status) q = q.eq("status", status);
    return (await q).count ?? 0;
  };
  const [total, fresh, shortlisted, rejected] = await Promise.all([statusCount(), statusCount("new"), statusCount("shortlisted"), statusCount("rejected")]);
  const skillSet = jobSkillSet(job.title, job.skills);
  const matched = rankCandidates(skillSet, await loadDiscoverable()).length;
  const s = displayStatus(job);
  const expired = isExpired(job);
  const soc = job.soc_code ? getSocUnitGroup(job.soc_code) : undefined;
  const skills = parseSkillIds(job.skills);
  const reviewNote = job.review_note;
  const { ready: shortlistsOn, shortlist } = await getJobShortlist(job.id);
  const picks = shortlist?.status === "sent" ? (await shortlistItems(shortlist.id)).length : 0;
  const jobState = job.status === "live" && !expired ? "live" : job.status === "closed" || expired ? "ended" : "waiting";

  return (
    <div>
      <PageHead title={job.title} back={{ href: "/employers/dashboard", label: "All jobs" }}>
        {job.company_name} · {job.remote === "remote" ? "Remote" : job.location}
      </PageHead>
      <JobTabs jobId={job.id} active="overview" applicants={total} shortlistReady={shortlist?.status === "sent"} />

      {notice && NOTICES[notice] && (
        <div className="mb-6">
          <Notice tone={NOTICES[notice].tone}>{NOTICES[notice].text}</Notice>
        </div>
      )}
      {shortlistNotice === "off" && (
        <div className="mb-6">
          <Notice tone="amber">{NOTICES["shortlist-off"].text}</Notice>
        </div>
      )}

      <div className="rounded-[22px] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={s.tone}>{s.label}</Badge>
            <p className="text-[15px] text-mute">
              {job.status === "draft" && "Only you can see this job."}
              {job.status === "pending" && "We are checking this job. We will email you when it is live."}
              {job.status === "live" && !expired && `Live until ${formatDate(job.expires_at)}.`}
              {expired && `Expired on ${formatDate(job.expires_at)}. Renew it to put it back on the site.`}
              {job.status === "closed" && "Closed. It is no longer on the site."}
              {job.status === "rejected" && "We could not approve this job yet. Edit it and submit it again."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.status === "draft" && <Command id={job.id} op="submit" label="Submit for approval" variant="btn-primary" />}
            {job.status === "live" && <Command id={job.id} op="renew" label={`Renew for ${LISTING_DAYS} days`} variant={expired ? "btn-primary" : "btn-secondary"} />}
            {(job.status === "live" || job.status === "pending") && <Command id={job.id} op="close" label="Close job" />}
            {job.status === "closed" && <Command id={job.id} op="submit" label="Reopen (needs approval)" />}
            {(job.status === "draft" || job.status === "rejected") && <Command id={job.id} op="delete" label="Delete" />}
            {job.status === "live" && !expired && (
              <Link href={publicJobPath(job.id)} target="_blank" className="btn btn-sm btn-secondary">
                See it on the site
              </Link>
            )}
            <Link href={`/employers/dashboard/jobs/${job.id}/edit`} className={`btn btn-sm ${job.status === "rejected" ? "btn-primary" : "btn-secondary"}`}>
              Edit
            </Link>
          </div>
        </div>
        {job.status === "rejected" && (
          <div className="mt-5 rounded-2xl bg-[#fdecea] p-4 text-[15px] leading-snug text-[#8c1d18]">
            <strong>What needs changing: </strong>
            {reviewNote || "we emailed you the reason. Reply to that email if you have any questions."}
          </div>
        )}
      </div>

      <div className="mt-6">
        <ShortlistSection
          jobId={job.id}
          included={hasRecruiterShortlist(effectivePlan(account))}
          ready={shortlistsOn}
          shortlist={shortlist}
          wanted={Boolean(job.shortlist_wanted)}
          jobState={jobState}
          picks={picks}
          sentOn={formatDate(shortlist?.sent_at)}
          requestedOn={formatDate(shortlist?.requested_at)}
        />
      </div>

      <h2 className="mt-10 text-[20px] font-bold tracking-[-0.02em] text-ink">How it is doing</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Views" value={job.views} hint="Times the job was opened" />
        <Stat label="Applications" value={total} hint={fresh ? `${fresh} new` : undefined} />
        <Stat label="Application rate" value={applicationRate(total, job.views)} hint="Applications per view" />
        <Stat label="Matched candidates" value={matched} hint="People who opted in with these skills" />
      </div>
      {total > 0 && (
        <p className="mt-3 text-[14px] text-mute">
          {shortlisted} shortlisted · {rejected} not taken forward · {total - shortlisted - rejected - fresh} viewed · {fresh} new
        </p>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[22px] bg-white p-6">
          <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">The job</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-[15px] sm:grid-cols-2">
            <div>
              <dt className="text-mute">Where</dt>
              <dd className="text-ink">
                {REMOTE_OPTIONS.find((o) => o.value === job.remote)?.label}
                {job.location ? `, ${job.location}` : ""}
                {job.region ? ` (${job.region})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-mute">Pay</dt>
              <dd className="text-ink">{formatSalary(job) ?? "Not shown"}</dd>
            </div>
            <div>
              <dt className="text-mute">Contract</dt>
              <dd className="text-ink">
                {CONTRACT_OPTIONS.find((o) => o.value === job.contract_type)?.label ?? "Not set"}, {HOURS_OPTIONS.find((o) => o.value === job.hours)?.label.toLowerCase() ?? ""}
              </dd>
            </div>
            <div>
              <dt className="text-mute">Applications</dt>
              <dd className="break-words text-ink">
                {job.apply_method === "mms" ? "Through MatchMySkillset" : job.apply_method === "url" ? job.apply_url : job.apply_email}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-mute">Occupation (ONS SOC 2020)</dt>
              <dd className="text-ink">{soc ? `${job.soc_code} ${soc.title}` : "Not matched to an occupation code from the title"}</dd>
            </div>
          </dl>
          <details className="mt-5">
            <summary className="cursor-pointer text-[15px] font-medium text-link">Show the description</summary>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{job.description}</p>
          </details>
        </div>
        <div className="rounded-[22px] bg-white p-6">
          <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Skills we match on</h2>
          <p className="mt-1 text-[14px] text-mute">Found in your title and description. Edit the advert to change them.</p>
          {skills.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.map((id) => (
                <SkillChip key={id} name={skillName(id)} match={skillSet.titleIds.has(id)} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[15px] text-[#8a5300]">We did not find any skills in this advert. Name the skills you need so we can match it.</p>
          )}
          {skillSet.titleIds.size > 0 && <p className="mt-3 text-[12px] text-mute">Blue skills are in the job title and count double.</p>}
        </div>
      </div>
    </div>
  );
}
