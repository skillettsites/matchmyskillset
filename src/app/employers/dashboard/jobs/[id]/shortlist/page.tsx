import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEmployer } from "@/lib/employer/session";
import { formatDate, getAccountJob, isExpired, listAccountJobs } from "@/lib/employer/jobs";
import { jobSkillSet, matchSkills, parseCandidateSkills, parseSkillIds, skillName } from "@/lib/employer/matching";
import { contactStatusMap } from "@/lib/employer/candidates";
import { effectivePlan, hasRecruiterShortlist } from "@/lib/employer/plans";
import { getJobShortlist, shortlistItems, SHORTLISTS_OFF } from "@/lib/employer/shortlists";
import { isUuid } from "@/lib/employer/server";
import type { AnonymousCandidate, ApplicationRow } from "@/lib/employer/types";
import { CandidateCard } from "@/components/employer/CandidateCard";
import { JobTabs } from "@/components/employer/JobTabs";
import { ShortlistSection } from "@/components/employer/ShortlistSection";
import { Badge, EmptyState, MatchBar, Notice, PageHead, RankDot, RecruiterNote, SkillChip } from "@/components/employer/ui";

export const metadata: Metadata = { title: "Recruiter shortlist", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The recruiter's picks for one job, in order. Applicants are shown in full
// (they applied to this employer). People who have not applied are shown only
// as the anonymous profile, with the usual "Request contact": their name,
// email and CV appear under Contact requests only if they accept.

type Applicant = Pick<ApplicationRow, "id" | "created_at" | "name" | "email" | "phone" | "cv_text" | "cover_note" | "match_score" | "matched_skills" | "consent_at">;
type Anon = AnonymousCandidate & { discoverable: boolean; withdrawn_at: string | null; expires_at: string | null };

export default async function ShortlistPage({ params }: { params: Promise<{ id: string }> }) {
  const account = await requireEmployer();
  const { id } = await params;
  const job = isUuid(id) ? await getAccountJob(account.id, id) : null;
  if (!job) notFound();

  const plan = effectivePlan(account);
  const { ready, shortlist } = await getJobShortlist(job.id);
  const expired = isExpired(job);
  const head = (
    <>
      <PageHead title={job.title} eyebrow="Recruiter shortlist" back={{ href: "/employers/dashboard", label: "All jobs" }} />
      <JobTabs jobId={job.id} active="shortlist" shortlistReady={shortlist?.status === "sent"} />
    </>
  );

  if (!ready) {
    return (
      <div>
        {head}
        <Notice tone="amber">{SHORTLISTS_OFF}</Notice>
      </div>
    );
  }

  if (!shortlist || shortlist.status !== "sent") {
    return (
      <div>
        {head}
        <ShortlistSection
          jobId={job.id}
          included={hasRecruiterShortlist(plan)}
          ready={ready}
          shortlist={shortlist}
          wanted={Boolean(job.shortlist_wanted)}
          jobState={job.status === "live" && !expired ? "live" : job.status === "closed" || expired ? "ended" : "waiting"}
          picks={0}
          sentOn=""
          requestedOn={formatDate(shortlist?.requested_at)}
        />
      </div>
    );
  }

  const items = await shortlistItems(shortlist.id);
  const appIds = items.map((i) => i.application_id).filter((x): x is string => Boolean(x));
  const candIds = items.map((i) => i.candidate_id).filter((x): x is string => Boolean(x));
  const admin = createAdminClient();
  const [appsRes, candsRes, contacts, allJobs] = await Promise.all([
    appIds.length
      ? admin
          .from("mms_applications")
          .select("id, created_at, name, email, phone, cv_text, cover_note, match_score, matched_skills, consent_at")
          .in("id", appIds)
          .eq("job_id", job.id)
      : Promise.resolve({ data: [] }),
    // Anonymous columns only: never name, email, phone or CV for people who have not applied.
    candIds.length
      ? admin.from("mms_candidates").select('id, headline, "current_role", region, years_experience, skills, created_at, discoverable, withdrawn_at, expires_at').in("id", candIds)
      : Promise.resolve({ data: [] }),
    contactStatusMap(account.id, candIds),
    listAccountJobs(account.id),
  ]);
  const apps = new Map(((appsRes.data ?? []) as Applicant[]).map((a) => [a.id, a]));
  const cands = new Map(((candsRes.data ?? []) as unknown as Anon[]).map((c) => [c.id, c]));
  const jobs = allJobs.filter((j) => j.status !== "draft").map((j) => ({ id: j.id, title: j.title }));
  const skillSet = jobSkillSet(job.title, job.skills);

  return (
    <div>
      {head}

      <div className="rounded-[22px] bg-white p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="green">Ready</Badge>
          <p className="text-[15px] text-mute">
            {items.length} {items.length === 1 ? "person" : "people"}, picked by {shortlist.recruiter_name || "our recruitment team"} and sent {formatDate(shortlist.sent_at)}.
          </p>
        </div>
        {shortlist.summary && <p className="mt-4 whitespace-pre-wrap text-[16px] leading-relaxed text-ink-2">{shortlist.summary}</p>}
        <p className="mt-4 text-[13px] leading-snug text-mute">
          In the recruiter&apos;s order, best fit first. People who applied are shown in full. People who asked employers to find them stay anonymous until they accept
          your request to contact them. A shortlist is a recruiter&apos;s view to help you decide who to talk to first; the hiring decision is yours.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Nobody is on this shortlist any more.">The people on it have since withdrawn their application or profile.</EmptyState>
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {items.map((item, index) => {
            const rank = index + 1;
            if (item.application_id) {
              const a = apps.get(item.application_id);
              if (!a) return <Unavailable key={item.id} rank={rank} text="This application has since been withdrawn." />;
              const matched = parseSkillIds(a.matched_skills);
              return (
                <li key={item.id} className="rounded-[22px] bg-white p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-[1fr_280px] sm:items-start">
                    <div className="flex min-w-0 gap-3">
                      <RankDot rank={rank} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[17px] font-semibold leading-snug text-ink">{a.name}</p>
                          <Badge tone="blue">Applied {formatDate(a.created_at)}</Badge>
                        </div>
                        <p className="mt-1 break-all text-[14px] text-mute">
                          <a href={`mailto:${a.email}`} className="text-link hover:underline">
                            {a.email}
                          </a>
                          {a.phone ? ` · ${a.phone}` : ""}
                        </p>
                      </div>
                    </div>
                    {typeof a.match_score === "number" ? <MatchBar score={a.match_score} /> : <p className="text-[14px] text-mute">No match score</p>}
                  </div>
                  {matched.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {matched.slice(0, 12).map((sid) => (
                        <SkillChip key={sid} name={skillName(sid)} match />
                      ))}
                    </div>
                  )}
                  {item.recruiter_note && <RecruiterNote note={item.recruiter_note} />}
                  {a.cover_note && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-[15px] font-medium text-link">Their note to you</summary>
                      <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-cloud p-4 text-[15px] leading-relaxed text-ink-2">{a.cover_note}</p>
                    </details>
                  )}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
                    {a.cv_text && (
                      <a href={`/api/employers/applications/${a.id}/cv`} className="font-medium text-link hover:underline" download>
                        Download CV (.txt)
                      </a>
                    )}
                    <Link href={`/employers/dashboard/jobs/${job.id}/applicants`} className="font-medium text-link hover:underline">
                      Open in Applicants
                    </Link>
                  </div>
                  {a.cv_text && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-[15px] font-medium text-link">Read the CV here</summary>
                      <pre className="mt-2 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-cloud p-4 font-sans text-[14px] leading-relaxed text-ink-2">
                        {a.cv_text}
                      </pre>
                    </details>
                  )}
                  <p className="mt-3 text-[12px] leading-snug text-mute">
                    Shared with {job.company_name} for this role only, with the applicant&apos;s consent on {formatDate(a.consent_at)}.
                  </p>
                </li>
              );
            }
            const c = item.candidate_id ? cands.get(item.candidate_id) : undefined;
            // Someone who switched their profile off since: show nothing about them, not even the note.
            if (!c || !stillFindable(c)) return <Unavailable key={item.id} rank={rank} text="This person has since switched off their profile, so it is no longer shown." />;
            const skills = parseCandidateSkills(c.skills);
            return (
              <li key={item.id}>
                <CandidateCard
                  ranked={{ candidate: c, skills, match: matchSkills(skillSet, skills) }}
                  showScore={skillSet.ids.length > 0}
                  contact={contacts.get(c.id)}
                  jobs={jobs}
                  defaultJobId={job.id}
                  canContact={Boolean(plan)}
                  note={item.recruiter_note}
                  rank={rank}
                />
              </li>
            );
          })}
        </ol>
      )}
      {candIds.length > 0 && (
        <p className="mt-6 text-[13px] leading-snug text-mute">
          Anonymous profiles show a headline, current role, region, years of experience and skills. When someone accepts your request, their name, email address and
          CV appear under{" "}
          <Link href="/employers/dashboard/requests" className="text-link underline">
            Contact requests
          </Link>
          .
        </p>
      )}
    </div>
  );
}

/** Still opted in, not withdrawn, inside the 12 months. */
function stillFindable(c: Anon): boolean {
  return c.discoverable && !c.withdrawn_at && (!c.expires_at || new Date(c.expires_at).getTime() > Date.now());
}

function Unavailable({ rank, text }: { rank: number; text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-[22px] bg-white p-5 sm:p-6">
      <RankDot rank={rank} />
      <p className="text-[15px] text-mute">{text}</p>
    </li>
  );
}
