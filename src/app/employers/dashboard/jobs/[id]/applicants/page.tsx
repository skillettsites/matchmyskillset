import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEmployer } from "@/lib/employer/session";
import { formatDate, getAccountJob } from "@/lib/employer/jobs";
import { jobSkillSet, parseSkillIds, skillName } from "@/lib/employer/matching";
import { isUuid } from "@/lib/employer/server";
import type { ApplicationRow } from "@/lib/employer/types";
import { ApplicantCard } from "@/components/employer/ApplicantCard";
import { JobTabs } from "@/components/employer/JobTabs";
import { Badge, EmptyState, MatchBar, PageHead, SkillChip, type Tone } from "@/components/employer/ui";
import { setApplicationStatus } from "../../../actions";

export const metadata: Metadata = { title: "Applicants for your job", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "blue" },
  viewed: { label: "Viewed", tone: "grey" },
  shortlisted: { label: "Shortlisted", tone: "green" },
  rejected: { label: "Not taken forward", tone: "red" },
};

const FILTERS = [
  ["all", "All"],
  ["new", "New"],
  ["shortlisted", "Shortlisted"],
  ["viewed", "Viewed"],
  ["rejected", "Not taken forward"],
] as const;

export default async function ApplicantsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ status?: string; sort?: string }> }) {
  const account = await requireEmployer();
  const { id } = await params;
  const { status = "all", sort = "newest" } = await searchParams;
  const job = isUuid(id) ? await getAccountJob(account.id, id) : null;
  if (!job) notFound();

  let q = createAdminClient()
    .from("mms_applications")
    .select("id, created_at, job_id, candidate_id, name, email, phone, cv_text, cover_note, match_score, matched_skills, consent_at, consent_text, status, employer_notified_at")
    .eq("job_id", job.id)
    .order(sort === "match" ? "match_score" : "created_at", { ascending: false, nullsFirst: false })
    .limit(500);
  if (status !== "all" && STATUS[status]) q = q.eq("status", status);
  const { data } = await q;
  const apps = (data as ApplicationRow[]) ?? [];
  const totalQ = await createAdminClient().from("mms_applications").select("id", { count: "exact", head: true }).eq("job_id", job.id);
  const total = totalQ.count ?? 0;
  const jobSkills = jobSkillSet(job.title, job.skills);
  const base = `/employers/dashboard/jobs/${job.id}/applicants`;
  const qs = (next: Partial<{ status: string; sort: string }>) => {
    const p = new URLSearchParams({ status, sort, ...next });
    if (p.get("status") === "all") p.delete("status");
    if (p.get("sort") === "newest") p.delete("sort");
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div>
      <PageHead title={job.title} eyebrow="Applicants" back={{ href: "/employers/dashboard", label: "All jobs" }} />
      <JobTabs jobId={job.id} active="applicants" applicants={total} />

      {job.apply_method !== "mms" && (
        <p className="mb-6 rounded-[18px] bg-white px-5 py-4 text-[15px] text-mute">
          This job sends applicants to {job.apply_method === "url" ? "your website" : "your email address"}, so their applications go there, not here.
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-5 max-w-[calc(100%+40px)] overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div className="segmented whitespace-nowrap">
          {FILTERS.map(([value, label]) => (
            <Link key={value} href={qs({ status: value })} aria-current={status === value ? "page" : undefined}>
              {label}
            </Link>
          ))}
          </div>
        </div>
        <div className="segmented whitespace-nowrap">
          <Link href={qs({ sort: "newest" })} aria-current={sort !== "match" ? "page" : undefined}>
            Newest
          </Link>
          <Link href={qs({ sort: "match" })} aria-current={sort === "match" ? "page" : undefined}>
            Best match
          </Link>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState title={total === 0 ? "No applicants yet." : "Nobody in this list."}>
          {total === 0
            ? job.status === "live"
              ? "Your job is live and being matched to job seekers. We email you the moment someone applies."
              : "Once the job is live, applications arrive here and in your inbox."
            : "Try another filter."}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => {
            const st = STATUS[a.status] ?? STATUS.new;
            const matched = parseSkillIds(a.matched_skills);
            const missing = jobSkills.ids.filter((sid) => !matched.includes(sid));
            return (
              <li key={a.id}>
                <ApplicantCard
                  id={a.id}
                  isNew={a.status === "new"}
                  summary={
                    <div className="grid gap-3 sm:grid-cols-[1fr_280px] sm:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[17px] font-semibold text-ink">{a.name}</p>
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </div>
                        <p className="mt-1 text-[14px] text-mute">Applied {formatDate(a.created_at)}</p>
                      </div>
                      {typeof a.match_score === "number" ? <MatchBar score={a.match_score} /> : <p className="text-[14px] text-mute">No match score</p>}
                    </div>
                  }
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                    <div className="space-y-5">
                      <dl className="space-y-2 text-[15px]">
                        <div>
                          <dt className="text-mute">Email</dt>
                          <dd>
                            <a href={`mailto:${a.email}`} className="break-all text-link hover:underline">
                              {a.email}
                            </a>
                          </dd>
                        </div>
                        {a.phone && (
                          <div>
                            <dt className="text-mute">Phone</dt>
                            <dd className="text-ink">{a.phone}</dd>
                          </div>
                        )}
                      </dl>
                      {matched.length > 0 && (
                        <div>
                          <p className="text-[13px] font-semibold text-ink">Skills from your advert in their CV</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {matched.map((sid) => (
                              <SkillChip key={sid} name={skillName(sid)} match />
                            ))}
                          </div>
                        </div>
                      )}
                      {missing.length > 0 && (
                        <div>
                          <p className="text-[13px] font-semibold text-ink">Not found in their CV</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {missing.slice(0, 12).map((sid) => (
                              <SkillChip key={sid} name={skillName(sid)} />
                            ))}
                          </div>
                        </div>
                      )}
                      {a.cover_note && (
                        <div>
                          <p className="text-[13px] font-semibold text-ink">Their note</p>
                          <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-cloud p-4 text-[15px] leading-relaxed text-ink-2">{a.cover_note}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {(["shortlisted", "viewed", "rejected"] as const)
                          .filter((sname) => sname !== a.status)
                          .map((sname) => (
                            <form key={sname} action={setApplicationStatus}>
                              <input type="hidden" name="id" value={a.id} />
                              <input type="hidden" name="status" value={sname} />
                              <button type="submit" className={`btn btn-sm ${sname === "shortlisted" ? "btn-primary" : "btn-secondary"}`}>
                                {sname === "shortlisted" ? "Shortlist" : sname === "viewed" ? "Move back to viewed" : "Not taken forward"}
                              </button>
                            </form>
                          ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-ink">CV</p>
                        {a.cv_text && (
                          <a href={`/api/employers/applications/${a.id}/cv`} className="text-[14px] text-link hover:underline" download>
                            Download CV (.txt)
                          </a>
                        )}
                      </div>
                      {a.cv_text ? (
                        <pre className="mt-2 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-cloud p-4 font-sans text-[14px] leading-relaxed text-ink-2">
                          {a.cv_text}
                        </pre>
                      ) : (
                        <p className="mt-2 text-[14px] text-mute">No CV text was included.</p>
                      )}
                      <p className="mt-3 text-[12px] leading-snug text-mute">
                        Shared with {job.company_name} for this role only, with the applicant&apos;s consent on {formatDate(a.consent_at)}.
                      </p>
                    </div>
                  </div>
                </ApplicantCard>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
