import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSocUnitGroup } from "@/data/careers";
import { isRecruiter } from "@/lib/employer/recruiter-auth";
import { CONTRACT_OPTIONS, formatDate, formatSalary, HOURS_OPTIONS, isExpired, REMOTE_OPTIONS } from "@/lib/employer/jobs";
import { skillName, topSkillNames } from "@/lib/employer/matching";
import { getShortlist, MAX_NOTE_LENGTH, MAX_SHORTLIST_ITEMS, MAX_SUMMARY_LENGTH, shortlistItems, SHORTLISTS_OFF } from "@/lib/employer/shortlists";
import { recruiterPool, RECRUITER_POOL_SIZE, type PoolApplicant, type PoolCandidate } from "@/lib/employer/recruiter";
import { isUuid } from "@/lib/employer/server";
import type { JobRow } from "@/lib/employer/types";
import { PickButton, ShortlistPanel, ShortlistProvider, type PickMeta } from "@/components/recruiter/ShortlistBuilder";
import { Badge, EmptyState, MatchBar, Notice, SkillChip } from "@/components/employer/ui";
import { cancelShortlist } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shortlist", robots: { index: false, follow: false } };

function applicantMeta(a: PoolApplicant): PickMeta {
  return {
    kind: "application",
    id: a.id,
    label: a.name,
    sub: `Applied${typeof a.match_score === "number" ? ` · ${a.match_score}% match` : ""} · shown in full to the employer`,
  };
}

function candidateMeta(c: PoolCandidate): PickMeta {
  const p = c.ranked.candidate;
  return {
    kind: "candidate",
    id: p.id,
    label: p.headline || p.current_role || "Candidate",
    sub: `Opted in · ${c.ranked.match.score}% match · anonymous to the employer`,
  };
}

export default async function RecruiterShortlistPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isRecruiter())) redirect("/recruiter");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { ready, shortlist } = await getShortlist(id);
  if (!ready) {
    return (
      <div className="bg-cloud px-5 py-16">
        <div className="mx-auto max-w-[720px]">
          <Notice tone="amber">{SHORTLISTS_OFF}</Notice>
        </div>
      </div>
    );
  }
  if (!shortlist) notFound();

  const { data: jobData } = await createAdminClient().from("mms_jobs").select("*").eq("id", shortlist.job_id).maybeSingle();
  const job = jobData as JobRow | null;
  if (!job) notFound();

  const items = await shortlistItems(shortlist.id);
  const pool = await recruiterPool(
    job,
    items.map((i) => i.candidate_id).filter((x): x is string => Boolean(x))
  );
  const appById = new Map(pool.applicants.map((a) => [a.id, a]));
  const candById = new Map(pool.candidates.map((c) => [c.ranked.candidate.id, c]));
  const initial = items.flatMap((item) => {
    const meta = item.application_id
      ? appById.has(item.application_id)
        ? applicantMeta(appById.get(item.application_id) as PoolApplicant)
        : null
      : item.candidate_id && candById.has(item.candidate_id)
        ? candidateMeta(candById.get(item.candidate_id) as PoolCandidate)
        : null;
    return meta ? [{ ...meta, note: item.recruiter_note ?? "" }] : [];
  });
  const lost = items.length - initial.length;
  const locked = shortlist.status === "sent" || shortlist.status === "cancelled";
  const expired = isExpired(job);
  const soc = job.soc_code ? getSocUnitGroup(job.soc_code) : undefined;
  const jobSkills = pool.skillSet.ids;

  return (
    <div className="bg-cloud px-5 pb-24 pt-8">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/recruiter" className="text-[14px] text-link hover:underline">
          ‹ All requests
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-mute">Shortlist for</p>
            <h1 className="title mt-1 !text-[30px] sm:!text-[36px]">{job.title}</h1>
            <p className="mt-2 text-[16px] text-mute">
              {job.company_name} · {REMOTE_OPTIONS.find((o) => o.value === job.remote)?.label}
              {job.location ? `, ${job.location}` : ""}
              {job.region ? ` (${job.region})` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(job.status !== "live" || expired) && <Badge tone="red">Job no longer live</Badge>}
            <Badge tone={shortlist.status === "sent" ? "green" : shortlist.status === "cancelled" ? "grey" : shortlist.status === "in_progress" ? "amber" : "blue"}>
              {shortlist.status === "sent" ? `Sent ${formatDate(shortlist.sent_at)}` : shortlist.status === "cancelled" ? "Cancelled" : shortlist.status === "in_progress" ? "In progress" : "New"}
            </Badge>
            {!locked && (
              <form action={cancelShortlist}>
                <input type="hidden" name="shortlist_id" value={shortlist.id} />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Cancel request
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[22px] bg-white p-6">
            <dl className="grid gap-x-6 gap-y-3 text-[15px] sm:grid-cols-2">
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
                <dt className="text-mute">Asked for</dt>
                <dd className="text-ink">{formatDate(shortlist.requested_at)}</dd>
              </div>
              <div>
                <dt className="text-mute">Live until</dt>
                <dd className="text-ink">{job.expires_at ? formatDate(job.expires_at) : "Not live"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-mute">Occupation (ONS SOC 2020)</dt>
                <dd className="text-ink">{soc ? `${job.soc_code} ${soc.title}` : "Not matched from the title"}</dd>
              </div>
            </dl>
            <details className="mt-5">
              <summary className="cursor-pointer text-[15px] font-medium text-link">Read the advert</summary>
              <p className="mt-3 max-h-[480px] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-cloud p-4 text-[15px] leading-relaxed text-ink-2">{job.description}</p>
            </details>
          </div>
          <div className="rounded-[22px] bg-white p-6">
            <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">Skills in the advert</h2>
            <p className="mt-1 text-[13px] text-mute">Match scores use these. Blue skills are in the job title and count double.</p>
            {jobSkills.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {jobSkills.map((sid) => (
                  <SkillChip key={sid} name={skillName(sid)} match={pool.skillSet.titleIds.has(sid)} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[14px] text-[#8a5300]">No skills were found in this advert, so everyone scores 0%. Judge from the CVs.</p>
            )}
          </div>
        </div>

        {locked ? (
          <SentView shortlist={shortlist} initial={initial} lost={lost} />
        ) : (
          <ShortlistProvider initial={initial} max={MAX_SHORTLIST_ITEMS}>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
              <div className="space-y-10">
                {lost > 0 && (
                  <Notice tone="amber">
                    {lost} {lost === 1 ? "person you picked before is" : "people you picked before are"} no longer available (they withdrew or switched off their profile)
                    and {lost === 1 ? "has" : "have"} been left out.
                  </Notice>
                )}
                <section aria-labelledby="applicants">
                  <h2 id="applicants" className="text-[22px] font-bold tracking-[-0.02em] text-ink">
                    Applicants ({pool.applicants.length})
                  </h2>
                  <p className="mt-1 text-[14px] leading-snug text-mute">
                    People who applied to this job. The employer already has their details, so they are shown in full on the shortlist.
                  </p>
                  <div className="mt-4 space-y-3">
                    {pool.applicants.length === 0 ? (
                      <EmptyState title="No applicants yet.">
                        {job.apply_method === "mms" ? "Applications through MatchMySkillset appear here." : "This job takes applications on the employer's own site or by email, so none arrive here."}
                      </EmptyState>
                    ) : (
                      pool.applicants.map((a) => <ApplicantItem key={a.id} a={a} jobSkills={jobSkills} />)
                    )}
                  </div>
                </section>
                <section aria-labelledby="matched">
                  <h2 id="matched" className="text-[22px] font-bold tracking-[-0.02em] text-ink">
                    People who asked to be found ({pool.totalMatches})
                  </h2>
                  <p className="mt-1 text-[14px] leading-snug text-mute">
                    Opted-in profiles that share skills with this job, best match first
                    {pool.totalMatches > RECRUITER_POOL_SIZE ? `, top ${RECRUITER_POOL_SIZE} shown` : ""}. The employer sees them anonymously (headline, role, region,
                    years, skills and your note) until the person accepts a contact request. People who applied are listed above instead.
                  </p>
                  <div className="mt-4 space-y-3">
                    {pool.candidates.length === 0 ? (
                      <EmptyState title="Nobody who opted in matches yet." />
                    ) : (
                      pool.candidates.map((c) => <CandidateItem key={c.ranked.candidate.id} c={c} />)
                    )}
                  </div>
                </section>
              </div>
              <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <ShortlistPanel
                  shortlistId={shortlist.id}
                  recruiterName={shortlist.recruiter_name ?? ""}
                  summary={shortlist.summary ?? ""}
                  noteMax={MAX_NOTE_LENGTH}
                  summaryMax={MAX_SUMMARY_LENGTH}
                />
              </aside>
            </div>
          </ShortlistProvider>
        )}
      </div>
    </div>
  );
}

function ApplicantItem({ a, jobSkills }: { a: PoolApplicant; jobSkills: string[] }) {
  const missing = jobSkills.filter((s) => !a.matched.includes(s));
  return (
    <div className="rounded-[22px] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-ink">{a.name}</p>
          <p className="mt-1 break-all text-[14px] text-mute">
            {a.email}
            {a.phone ? ` · ${a.phone}` : ""} · applied {formatDate(a.created_at)}
          </p>
        </div>
        <PickButton meta={applicantMeta(a)} />
      </div>
      <div className="mt-3 max-w-[360px]">{typeof a.match_score === "number" ? <MatchBar score={a.match_score} /> : <p className="text-[14px] text-mute">No match score</p>}</div>
      {a.matched.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.matched.slice(0, 14).map((s) => (
            <SkillChip key={s} name={skillName(s)} match />
          ))}
        </div>
      )}
      {missing.length > 0 && <p className="mt-2 text-[13px] leading-snug text-mute">Not found in their CV: {missing.slice(0, 10).map(skillName).join(", ")}</p>}
      {a.cover_note && (
        <div className="mt-3">
          <p className="text-[13px] font-semibold text-ink">Their note</p>
          <p className="mt-1 whitespace-pre-wrap rounded-2xl bg-cloud p-3 text-[14px] leading-relaxed text-ink-2">{a.cover_note}</p>
        </div>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer text-[15px] font-medium text-link">{a.cv_text ? "Read the CV" : "No CV text was included"}</summary>
        {a.cv_text && (
          <pre className="mt-2 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-cloud p-4 font-sans text-[14px] leading-relaxed text-ink-2">{a.cv_text}</pre>
        )}
      </details>
    </div>
  );
}

function CandidateItem({ c }: { c: PoolCandidate }) {
  const p = c.ranked.candidate;
  const facts = [p.current_role, p.region, typeof p.years_experience === "number" ? `${p.years_experience} ${p.years_experience === 1 ? "year" : "years"} of experience` : null].filter(Boolean);
  const skills = topSkillNames(c.ranked.skills, c.ranked.match.matched, 12);
  return (
    <div className="rounded-[22px] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-ink">{p.headline || p.current_role || "Candidate"}</p>
          {facts.length > 0 && <p className="mt-1 text-[14px] text-mute">{facts.join(" · ")}</p>}
        </div>
        <PickButton meta={candidateMeta(c)} />
      </div>
      <div className="mt-3 max-w-[360px]">
        <MatchBar score={c.ranked.match.score} />
      </div>
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <SkillChip key={s.name} name={s.name} match={s.match} />
          ))}
        </div>
      )}
      {c.cv && (
        <details className="mt-3">
          <summary className="cursor-pointer text-[15px] font-medium text-link">Read the CV they added to their profile</summary>
          <p className="mt-2 text-[12px] leading-snug text-[#8a5300]">
            For your review only. Never copy names, employers, contact details or links from it into your note: the employer sees your note before this person agrees to
            share who they are.
          </p>
          <pre className="mt-2 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-cloud p-4 font-sans text-[14px] leading-relaxed text-ink-2">{c.cv}</pre>
        </details>
      )}
    </div>
  );
}

function SentView({
  shortlist,
  initial,
  lost,
}: {
  shortlist: { status: string; summary: string | null; recruiter_name: string | null };
  initial: (PickMeta & { note: string })[];
  lost: number;
}) {
  return (
    <div className="mt-8 rounded-[22px] bg-white p-6">
      <h2 className="text-[20px] font-bold tracking-[-0.02em] text-ink">{shortlist.status === "sent" ? "What was sent" : "This request was cancelled"}</h2>
      {shortlist.recruiter_name && <p className="mt-1 text-[14px] text-mute">By {shortlist.recruiter_name}</p>}
      {shortlist.summary && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{shortlist.summary}</p>}
      {initial.length > 0 && (
        <ol className="mt-5 space-y-3">
          {initial.map((p, i) => (
            <li key={`${p.kind}:${p.id}`} className="rounded-2xl bg-cloud p-4">
              <p className="text-[15px] font-semibold text-ink">
                {i + 1}. {p.label}
              </p>
              <p className="text-[12px] text-mute">{p.sub}</p>
              {p.note && <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-2">{p.note}</p>}
            </li>
          ))}
        </ol>
      )}
      {lost > 0 && <p className="mt-4 text-[13px] text-mute">{lost} more no longer shown here: they have since withdrawn or dropped out of the matches.</p>}
    </div>
  );
}
