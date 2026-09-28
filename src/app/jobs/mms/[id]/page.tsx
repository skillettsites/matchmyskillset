import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/components/site";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordJobView } from "@/lib/employer/jobs";
import { skillName } from "@/lib/skills/taxonomy";
import { getMmsJobRow, isLiveRow, mmsContractText, mmsLocationText, mmsSalaryText, mmsSkillIds, workplaceOf, type MmsJobRow } from "@/lib/apis/jobs/mms";
import { postedLabel } from "@/components/jobs/format";
import { getEmployer } from "@/lib/candidates/db";
import { ApplyForm, YourMatch } from "./ApplyForm";

// A job an employer posted on MatchMySkillset. Live jobs are indexable and
// carry JobPosting structured data built only from what the employer entered
// (directApply: people apply on this page). Closed or expired jobs say so and
// are not indexed; drafts, jobs awaiting approval and rejected jobs are 404s.

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

async function load(id: string): Promise<MmsJobRow | null> {
  try {
    const row = await getMmsJobRow(id);
    if (!row || !["live", "closed"].includes(row.status)) return null;
    return row;
  } catch (err) {
    console.error("[jobs/mms] read failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

function summary(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const job = await load(id);
  if (!job) return { title: "Job not found", robots: { index: false, follow: false } };
  const live = isLiveRow(job);
  // Titles stay within 60 characters: with the site name when it fits, without it otherwise.
  const base = `${job.title} at ${job.company_name}`;
  const withSite = `${base} | ${SITE_NAME}`;
  return {
    title: { absolute: withSite.length <= 60 ? withSite : base.length > 60 ? `${base.slice(0, 59).trimEnd()}…` : base },
    description: summary(`${job.title}, ${mmsLocationText(job)}. ${job.description}`),
    alternates: { canonical: `/jobs/mms/${job.id}` },
    robots: live ? { index: true, follow: true } : { index: false, follow: true },
  };
}

const EMPLOYMENT_TYPE: Record<string, string> = { full_time: "FULL_TIME", part_time: "PART_TIME", contract: "CONTRACTOR", temporary: "TEMPORARY" };
const UNIT: Record<string, string> = { year: "YEAR", hour: "HOUR", day: "DAY" };

/** JobPosting from the fields the employer entered, or null if a required one is missing. */
function jobPostingLd(job: MmsJobRow, website: string | null): Record<string, unknown> | null {
  const posted = job.approved_at ?? job.created_at;
  const w = workplaceOf(job.remote);
  if (!job.title || !job.description || !posted) return null;
  if (w !== "remote" && !job.location) return null;
  const types = [job.hours ? EMPLOYMENT_TYPE[job.hours] : null, job.contract_type ? EMPLOYMENT_TYPE[job.contract_type] : null].filter(Boolean);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`)
      .join(""),
    datePosted: posted.slice(0, 10),
    hiringOrganization: { "@type": "Organization", name: job.company_name, ...(website ? { sameAs: website } : {}) },
    identifier: { "@type": "PropertyValue", name: SITE_NAME, value: job.id },
    directApply: job.apply_method !== "url",
    url: absoluteUrl(`/jobs/mms/${job.id}`),
  };
  if (job.expires_at) ld.validThrough = job.expires_at;
  if (types.length) ld.employmentType = types.length === 1 ? types[0] : types;
  if (w === "remote") {
    ld.jobLocationType = "TELECOMMUTE";
    ld.applicantLocationRequirements = { "@type": "Country", name: "United Kingdom" };
  }
  if (job.location && w !== "remote") {
    ld.jobLocation = {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, ...(job.region ? { addressRegion: job.region } : {}), addressCountry: "GB" },
    };
  }
  if (job.salary_min || job.salary_max) {
    ld.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: {
        "@type": "QuantitativeValue",
        ...(job.salary_min ? { minValue: job.salary_min } : {}),
        ...(job.salary_max ? { maxValue: job.salary_max } : {}),
        unitText: UNIT[job.salary_period ?? "year"] ?? "YEAR",
      },
    };
  }
  return ld;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mute">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-medium text-ink">{value}</dd>
    </div>
  );
}

export default async function MmsJobPage({ params }: { params: Params }) {
  const { id } = await params;
  const job = await load(id);
  if (!job) notFound();
  const live = isLiveRow(job);
  const employer = await getEmployer(job.account_id).catch(() => null);
  const ld = live ? jobPostingLd(job, employer?.website ?? null) : null;
  const skills = mmsSkillIds(job.skills);
  const salary = mmsSalaryText(job);
  const contract = mmsContractText(job);
  const posted = postedLabel(job.approved_at ?? job.created_at);
  const closes = job.expires_at ? new Date(job.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

  if (live) {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    after(async () => {
      // One view per visitor per job every six hours, counted by the employer side.
      const { allowed } = await checkRateLimit(`job-view:${job.id}:${ip}`, 1, 6 * 3600);
      if (allowed) await recordJobView(job.id);
    });
  }

  return (
    <div className="relative overflow-hidden">
      {ld && <JsonLd data={ld} />}
      <div className="hero-glow top-[-45%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px] px-4 pb-20 pt-10 sm:px-6 md:pt-14">
        <nav aria-label="Breadcrumb" className="text-[14px] text-mute">
          <Link href="/jobs" className="text-link hover:underline">
            Jobs
          </Link>{" "}
          <span aria-hidden="true">›</span> Posted on MatchMySkillset
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <article>
            <span className="pill bg-blue !py-1 text-[13px] text-white">Posted on MatchMySkillset</span>
            <h1 className="headline mt-4 !text-[34px] sm:!text-[46px]">{job.title}</h1>
            <p className="mt-2 text-[21px] font-medium tracking-[-0.02em] text-ink-2">{job.company_name}</p>

            {!live && (
              <p role="status" className="mt-6 rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink">
                This job has closed and is no longer taking applications.{" "}
                <Link href="/jobs" className="text-link hover:underline">
                  Search live jobs
                </Link>
              </p>
            )}

            <dl className="card-white mt-8 grid grid-cols-2 gap-5 p-5 sm:grid-cols-3 sm:p-6">
              <Fact label="Where" value={mmsLocationText(job)} />
              {salary && <Fact label="Salary" value={salary} />}
              {contract && <Fact label="Contract" value={contract} />}
              {posted && <Fact label="Posted" value={posted.replace(/^Posted /, "")} />}
              {closes && live && <Fact label="Closes" value={closes} />}
            </dl>

            <section aria-labelledby="about-title" className="mt-10">
              <h2 id="about-title" className="title">
                About the job
              </h2>
              <div className="mt-4 whitespace-pre-line text-[17px] leading-relaxed text-ink-2">{job.description}</div>
            </section>

            {skills.length > 0 && (
              <section aria-labelledby="skills-title" className="mt-10">
                <h2 id="skills-title" className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
                  Skills the employer is looking for
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <li key={s} className="pill bg-cloud text-ink">
                      {skillName(s)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="mt-10 text-[13px] text-mute">
              {job.company_name} posted this job on MatchMySkillset and it was checked by us before going live. If something looks wrong, email{" "}
              <a href="mailto:hello@matchmyskillset.com" className="text-link hover:underline">
                hello@matchmyskillset.com
              </a>
              .
            </p>
          </article>

          {live && (
            <aside className="space-y-5 lg:sticky lg:top-24">
              <YourMatch jobId={job.id} />
              {job.apply_method === "url" && job.apply_url ? (
                <div className="card-white p-6">
                  <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Apply on {job.company_name}&apos;s site</p>
                  <p className="mt-1 text-[14px] text-mute">This employer takes applications on its own website.</p>
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 w-full">
                    Apply now
                  </a>
                </div>
              ) : (
                <ApplyForm jobId={job.id} company={job.company_name} title={job.title} />
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
