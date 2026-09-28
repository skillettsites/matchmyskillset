import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEmployer } from "@/lib/employer/session";
import { getAccountJob } from "@/lib/employer/jobs";
import { jobSkillSet, parseCandidateSkills, parseSkillIds, skillName } from "@/lib/employer/matching";
import { loadDiscoverable, rankCandidates } from "@/lib/employer/candidates";
import { effectivePlan, limitsFor } from "@/lib/employer/plans";
import { isUuid } from "@/lib/employer/server";
import { JobTabs } from "@/components/employer/JobTabs";
import { EmptyState, Notice, PageHead, SkillChip } from "@/components/employer/ui";

export const metadata: Metadata = { title: "Skills-gap report", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Two categorical slots, validated together on a light surface (dataviz validator: all checks pass).
const APPLICANTS_COLOUR = "#2a78d6";
const MATCHED_COLOUR = "#eb6834";

function pct(n: number, of: number): number {
  return of ? Math.round((n / of) * 100) : 0;
}

function Bar({ value, total, colour, label }: { value: number; total: number; colour: string; label: string }) {
  const p = pct(value, total);
  return (
    <div className="flex items-center gap-3" title={`${label}: ${value} of ${total} (${p}%)`}>
      <div className="h-3 flex-1" aria-hidden="true">
        {total > 0 && <div className="h-3 rounded-r-[4px]" style={{ width: `${Math.max(p, p > 0 ? 2 : 0)}%`, background: colour }} />}
      </div>
      <span className="w-[92px] shrink-0 text-right text-[13px] tabular-nums text-ink">{total ? `${p}% (${value})` : "n/a"}</span>
    </div>
  );
}

export default async function SkillsGapPage({ params }: { params: Promise<{ id: string }> }) {
  const account = await requireEmployer();
  const { id } = await params;
  const job = isUuid(id) ? await getAccountJob(account.id, id) : null;
  if (!job) notFound();

  const limits = limitsFor(effectivePlan(account));
  const header = (
    <>
      <PageHead title={job.title} eyebrow="Skills-gap report" back={{ href: "/employers/dashboard", label: "All jobs" }}>
        How often each skill in your advert shows up among the people who applied and the people who match. A skill few people have is where a candidate may need
        training, or where the advert may be asking for too much.
      </PageHead>
      <JobTabs jobId={job.id} active="gap" />
    </>
  );

  if (!limits?.skillsGap) {
    return (
      <div>
        {header}
        <Notice tone="amber">
          <strong>The skills-gap report comes with Growth and Enterprise.</strong> It compares every skill in your advert with your applicants and matched candidates.{" "}
          <Link href="/employers/dashboard/billing" className="font-semibold underline">
            Compare plans
          </Link>
        </Notice>
      </div>
    );
  }

  const skillSet = jobSkillSet(job.title, job.skills);
  if (skillSet.ids.length === 0) {
    return (
      <div>
        {header}
        <EmptyState title="No skills to report on.">We did not find any skills in this advert. Edit it and name the skills you need.</EmptyState>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: apps } = await admin.from("mms_applications").select("candidate_id, matched_skills").eq("job_id", job.id).limit(1000);
  const applicantRows = apps ?? [];
  const linkedIds = [...new Set(applicantRows.map((a) => a.candidate_id).filter((x): x is string => Boolean(x)))];
  const linked = linkedIds.length ? await admin.from("mms_candidates").select("id, skills").in("id", linkedIds) : { data: [] as { id: string; skills: unknown }[] };
  const linkedSkills = new Map((linked.data ?? []).map((c) => [c.id as string, new Set(parseCandidateSkills(c.skills).map((s) => s.id))]));

  // Each applicant's skills: what their application matched, plus their saved profile if they have one.
  const applicantSkills = applicantRows.map((a) => {
    const set = new Set(parseSkillIds(a.matched_skills));
    for (const s of (a.candidate_id && linkedSkills.get(a.candidate_id)) || []) set.add(s);
    return set;
  });
  const matched = rankCandidates(skillSet, await loadDiscoverable());
  const matchedSkills = matched.map((m) => new Set(m.skills.map((s) => s.id)));

  const rows = skillSet.ids.map((sid) => ({
    id: sid,
    inTitle: skillSet.titleIds.has(sid),
    applicants: applicantSkills.filter((s) => s.has(sid)).length,
    matched: matchedSkills.filter((s) => s.has(sid)).length,
  }));
  const nA = applicantSkills.length;
  const nM = matchedSkills.length;
  const rare = rows.filter((r) => (nA ? pct(r.applicants, nA) < 25 : true) && (nM ? pct(r.matched, nM) < 25 : true) && (nA || nM));

  // Skills applicants and matched people bring that the advert does not mention,
  // counting each person once (an applicant can also be a matched candidate).
  const people = new Map<string, Set<string>>();
  applicantRows.forEach((a, i) => people.set(a.candidate_id ? `c:${a.candidate_id}` : `a:${i}`, new Set(applicantSkills[i])));
  matched.forEach((m, i) => {
    const key = `c:${m.candidate.id}`;
    const set = people.get(key) ?? new Set<string>();
    for (const sid of matchedSkills[i]) set.add(sid);
    people.set(key, set);
  });
  const extra = new Map<string, number>();
  for (const set of people.values()) {
    for (const sid of set) if (!skillSet.ids.includes(sid)) extra.set(sid, (extra.get(sid) ?? 0) + 1);
  }
  const extraTop = [...extra.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div>
      {header}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] bg-white p-5">
          <p className="text-[13px] text-mute">Skills in your advert</p>
          <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-ink">{rows.length}</p>
        </div>
        <div className="rounded-[22px] bg-white p-5">
          <p className="text-[13px] text-mute">Applicants</p>
          <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-ink">{nA}</p>
        </div>
        <div className="rounded-[22px] bg-white p-5">
          <p className="text-[13px] text-mute">Matched candidates</p>
          <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-ink">{nM}</p>
        </div>
      </div>

      {nA === 0 && nM === 0 ? (
        <div className="mt-6">
          <EmptyState title="Nothing to compare yet.">The report fills in as people apply and as job seekers with these skills ask to be found.</EmptyState>
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Share of people with each skill</h2>
            <div className="flex flex-wrap gap-4 text-[13px] text-ink-2" aria-hidden="true">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-[3px]" style={{ background: APPLICANTS_COLOUR }} />
                Applicants ({nA})
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-[3px]" style={{ background: MATCHED_COLOUR }} />
                Matched candidates ({nM})
              </span>
            </div>
          </div>
          <table className="mt-5 w-full border-collapse text-left">
            <caption className="sr-only">For each skill in the advert, the share of applicants and of matched candidates who have it</caption>
            <thead>
              <tr className="border-b border-black/[0.08] text-[12px] font-semibold text-mute">
                <th scope="col" className="w-[34%] py-2 pr-3">
                  Skill
                </th>
                <th scope="col" className="py-2">
                  Applicants and matched candidates with it
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-black/[0.05] align-middle last:border-0">
                  <th scope="row" className="py-3 pr-3 text-[14px] font-medium text-ink">
                    {skillName(r.id)}
                    {r.inTitle && <span className="ml-1.5 text-[11px] font-semibold text-mute">(in title)</span>}
                  </th>
                  <td className="py-3">
                    <div className="space-y-[2px]">
                      <Bar value={r.applicants} total={nA} colour={APPLICANTS_COLOUR} label="Applicants" />
                      <Bar value={r.matched} total={nM} colour={MATCHED_COLOUR} label="Matched candidates" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[12px] leading-snug text-mute">
            Applicants count as having a skill when their application matched it or their saved profile lists it. Matched candidates are people who opted in to be
            found and share at least one skill with this job.
          </p>
        </div>
      )}

      {(rare.length > 0 || extraTop.length > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {rare.length > 0 && (
            <div className="rounded-[22px] bg-white p-6">
              <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Hard to find</h2>
              <p className="mt-1 text-[14px] text-mute">Fewer than 1 in 4 applicants and matched candidates have these.</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {rare.map((r) => (
                  <SkillChip key={r.id} name={skillName(r.id)} />
                ))}
              </div>
            </div>
          )}
          {extraTop.length > 0 && (
            <div className="rounded-[22px] bg-white p-6">
              <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Skills people bring that your advert does not mention</h2>
              <p className="mt-1 text-[14px] text-mute">Number of people in brackets, most common first. Worth a look if you are flexible on the role.</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {extraTop.map(([sid, n]) => (
                  <SkillChip key={sid} name={`${skillName(sid)} (${n})`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
