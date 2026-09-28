import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyPage, initials } from "@/lib/employer/company";
import { formatDate, formatSalary, publicJobPath } from "@/lib/employer/jobs";
import { ChevronRight } from "@/components/employer/icons";

// Public company page for Growth and Enterprise employers: their description,
// website and live jobs. Rendered per request (it is small), so a job shows
// here as soon as it is approved and disappears when it closes or expires.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCompanyPage(slug);
  if (!page) return { title: "Company not found", robots: { index: false, follow: false } };
  const name = page.account.company_name ?? "Company";
  const count = page.jobs.length;
  return {
    title: `${name} jobs`.slice(0, 50),
    description: `${name} is hiring on MatchMySkillset${count ? `: ${count} live ${count === 1 ? "job" : "jobs"}` : ""}. See the roles and how your skills match.`,
    alternates: { canonical: `/companies/${slug}` },
    // A page with no live jobs has nothing for search engines.
    robots: count ? { index: true, follow: true } : { index: false, follow: true },
  };
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function CompanyPublicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getCompanyPage(slug);
  if (!page) notFound();
  const { account, jobs } = page;
  const name = account.company_name ?? "";

  return (
    <>
      <section className="relative overflow-hidden px-5 pb-14 pt-14 sm:pt-20">
        <div className="hero-glow top-[-40%] !opacity-[0.12]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[880px]">
          <div className="rise grid h-20 w-20 place-items-center rounded-[22px] bg-gradient-to-br from-[#1d1d1f] to-[#424245] text-[28px] font-bold text-white" aria-hidden="true">
            {initials(name)}
          </div>
          <h1 className="display rise rise-1 mt-6">{name}</h1>
          {account.website && (
            <p className="rise rise-2 mt-4">
              <a href={account.website} target="_blank" rel="sponsored noopener" className="link-more">
                {host(account.website)}
                <ChevronRight />
              </a>
            </p>
          )}
          {account.company_description && (
            <div className="rise rise-2 mt-8 max-w-[720px] space-y-4 text-[19px] leading-relaxed text-ink-2">
              {account.company_description.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-cloud px-5 py-16 md:py-20" aria-labelledby="jobs">
        <div className="mx-auto max-w-[880px]">
          <h2 id="jobs" className="headline">
            {jobs.length ? `Open roles (${jobs.length}).` : "No open roles right now."}
          </h2>
          {jobs.length === 0 ? (
            <p className="mt-4 text-[17px] text-mute">Check back soon, or see other live jobs that match your skills.</p>
          ) : (
            <ul className="mt-8 space-y-3">
              {jobs.map((job) => {
                const pay = formatSalary(job);
                return (
                  <li key={job.id}>
                    <Link href={publicJobPath(job.id)} className="card-white block p-6 transition-transform duration-300 hover:scale-[1.005]">
                      <p className="text-[21px] font-bold tracking-[-0.02em] text-ink">{job.title}</p>
                      <p className="mt-2 text-[15px] text-mute">
                        {[
                          job.remote === "remote" ? "Remote" : job.location,
                          job.remote === "hybrid" ? "Hybrid" : null,
                          pay,
                          job.approved_at ? `Posted ${formatDate(job.approved_at)}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="mt-4 text-[15px] font-medium text-link">See the job and your match</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-10 rounded-[28px] bg-white p-7 text-center">
            <p className="title">See how your skills match.</p>
            <p className="mx-auto mt-2 max-w-md text-[17px] text-mute">Add your CV and we score live jobs against it, including these.</p>
            <Link href="/discover" className="btn btn-primary mt-6">
              Match my CV
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
