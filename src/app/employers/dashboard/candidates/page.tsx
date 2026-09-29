import Link from "next/link";
import type { Metadata } from "next";
import { UK_REGIONS } from "@/lib/apis/regions";
import { skillsInText } from "@/lib/skills/text-skills";
import { requireEmployer } from "@/lib/employer/session";
import { listAccountJobs } from "@/lib/employer/jobs";
import { jobSkillSet, MATCH_METHOD_SUMMARY, skillName, type JobSkillSet } from "@/lib/employer/matching";
import { contactStatusMap, loadDiscoverable, rankCandidates } from "@/lib/employer/candidates";
import { effectivePlan, limitsFor, moreMatchesHint } from "@/lib/employer/plans";
import { CandidateCard } from "@/components/employer/CandidateCard";
import { EmptyState, Notice, PageHead, SkillChip } from "@/components/employer/ui";

export const metadata: Metadata = { title: "Find candidates", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Search = { skills?: string; job?: string; region?: string; years?: string; q?: string };

export default async function CandidateSearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const account = await requireEmployer();
  const sp = await searchParams;
  const plan = effectivePlan(account);
  const limits = limitsFor(plan);
  const allJobs = await listAccountJobs(account.id);
  const jobs = allJobs.filter((j) => j.status !== "draft").map((j) => ({ id: j.id, title: j.title }));

  const skillsText = (sp.skills ?? "").slice(0, 300);
  const keyword = (sp.q ?? "").slice(0, 80);
  const region = UK_REGIONS.find((r) => r === sp.region) ?? null;
  const minYears = Math.max(0, Math.min(40, Number.parseInt(sp.years ?? "0", 10) || 0));
  const job = allJobs.find((j) => j.id === sp.job) ?? null;

  let skillSet: JobSkillSet = { ids: [], titleIds: new Set() };
  if (job) skillSet = jobSkillSet(job.title, job.skills);
  else if (skillsText.trim()) skillSet = { ids: skillsInText(skillsText).map((h) => h.id), titleIds: new Set() };
  const searched = Boolean(job || skillsText.trim() || keyword || region || minYears);
  const unrecognised = !job && skillsText.trim() !== "" && skillSet.ids.length === 0;

  const ranked = limits && !unrecognised ? rankCandidates(skillSet, await loadDiscoverable({ region }), { minYears, keyword }) : [];
  const cap = limits?.matchedPerRole ?? null;
  const visible = cap === null ? ranked : ranked.slice(0, cap);
  const contacts = await contactStatusMap(account.id, visible.map((r) => r.candidate.id));
  const scoring = skillSet.ids.length > 0;

  return (
    <div>
      <PageHead title="Find candidates">
        Search people who ticked &ldquo;Let employers find me&rdquo;. You see their skills, current role, region and experience. Ask to contact them and they decide
        whether to share their name, email and CV.
      </PageHead>

      <form method="get" className="card-white grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_140px]">
        <div className="md:col-span-2 lg:col-span-1">
          <label htmlFor="skills" className="field-label">
            Skills
          </label>
          <input id="skills" name="skills" defaultValue={skillsText} className="field" placeholder="For example: customer service, Excel, team leadership" maxLength={300} />
        </div>
        <div>
          <label htmlFor="job" className="field-label">
            Or match to one of your jobs
          </label>
          <select id="job" name="job" defaultValue={job?.id ?? ""} className="field">
            <option value="">None</option>
            {allJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="region" className="field-label">
            Region
          </label>
          <select id="region" name="region" defaultValue={region ?? ""} className="field">
            <option value="">Anywhere in the UK</option>
            {UK_REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="years" className="field-label">
            Min. years
          </label>
          <input id="years" name="years" type="number" min={0} max={40} defaultValue={minYears || ""} className="field" placeholder="0" />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label htmlFor="q" className="field-label">
            Current role contains <span className="font-normal text-mute">(optional)</span>
          </label>
          <input id="q" name="q" defaultValue={keyword} className="field" placeholder="For example: supervisor" maxLength={80} />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full">
            Search
          </button>
        </div>
      </form>

      {scoring && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-mute">{job ? `Matching to ${job.title}:` : "We read your search as:"}</span>
          {skillSet.ids.map((id) => (
            <SkillChip key={id} name={skillName(id)} match />
          ))}
        </div>
      )}

      <div className="mt-8">
        {!limits ? (
          <Notice tone="amber">
            Choose a plan to search candidates.{" "}
            <Link href="/employers/dashboard/billing" className="font-semibold underline">
              See plans
            </Link>
          </Notice>
        ) : unrecognised ? (
          <EmptyState title="We did not recognise those skills.">Try the everyday name of a skill, for example &ldquo;bookkeeping&rdquo; or &ldquo;project management&rdquo;.</EmptyState>
        ) : ranked.length === 0 ? (
          <EmptyState title={searched ? "Nobody matches that search yet." : "Nobody has opted in yet."}>
            {searched ? "Try fewer skills, another region or a lower number of years." : "When job seekers ask employers to find them, they appear here."}
          </EmptyState>
        ) : (
          <>
            <p className="mb-4 text-[15px] text-mute">
              {ranked.length} {ranked.length === 1 ? "person" : "people"}
              {cap !== null && ranked.length > cap ? `, showing your top ${cap}. ${moreMatchesHint(plan)}` : "."}
            </p>
            <ul className="space-y-3">
              {visible.map((r) => (
                <li key={r.candidate.id}>
                  <CandidateCard ranked={r} showScore={scoring} contact={contacts.get(r.candidate.id)} jobs={jobs} defaultJobId={job?.id} canContact />
                </li>
              ))}
            </ul>
            {scoring && <p className="mt-6 text-[13px] leading-snug text-mute">{MATCH_METHOD_SUMMARY}</p>}
          </>
        )}
      </div>
    </div>
  );
}
