import type { Metadata } from "next";
import Link from "next/link";
import { SKILLS } from "@/data/skills-taxonomy";
import { UK_REGIONS } from "@/lib/apis/regions";
import { isSkillId } from "@/lib/skills/taxonomy";
import { applicationsForCandidate, contactsForCandidate, effectiveStatus, getCandidateByToken, getEmployer } from "@/lib/candidates/db";
import { ProfileManager, type ProfileView } from "./ProfileManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your MatchMySkillset profile",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const STATUS_TEXT: Record<string, string> = { pending: "Waiting for your answer", accepted: "You accepted", declined: "You declined", expired: "Expired" };

function day(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function MePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { token } = await params;
  const sp = await searchParams;
  const c = await getCandidateByToken(token).catch(() => null);

  if (!c) {
    return (
      <div className="mx-auto max-w-[720px] px-4 pb-20 pt-16 sm:px-6">
        <p className="eyebrow text-blue">Your profile</p>
        <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">This profile no longer exists</h1>
        <p className="lede mt-4 !text-[19px]">It may have been deleted, it may have expired after 12 months, or the link is not complete.</p>
        <Link href="/discover" className="btn btn-primary mt-8">
          Check my CV
        </Link>
      </div>
    );
  }

  const [contacts, applications] = await Promise.all([contactsForCandidate(c.id).catch(() => []), applicationsForCandidate(c).catch(() => [])]);
  const employers = new Map<string, string>();
  await Promise.all(
    [...new Set(contacts.map((r) => r.account_id))].map(async (id) => {
      const e = await getEmployer(id).catch(() => null);
      employers.set(id, e?.company_name || "An employer");
    })
  );

  const skills = Array.isArray(c.skills) ? (c.skills as unknown[]).filter(isSkillId) : [];
  const view: ProfileView = {
    firstName: c.first_name,
    email: c.email,
    headline: c.headline ?? "",
    currentRole: c.current_role ?? "",
    location: c.location ?? "",
    region: c.region ?? "",
    years: c.years_experience === null ? "" : String(c.years_experience),
    skills,
    hasCv: Boolean(c.cv_text),
    cvPreview: (c.cv_text ?? "").slice(0, 300),
    discoverable: c.discoverable,
    confirmed: Boolean(c.discoverable_consent_at),
    expires: c.expires_at ? day(c.expires_at) : null,
  };

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-50%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[760px] px-4 pb-20 pt-12 sm:px-6 md:pt-16">
        <p className="eyebrow text-blue">Your profile</p>
        <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">{c.first_name ? `Hi ${c.first_name}` : "Your profile"}</h1>
        <p className="lede mt-4 !text-[19px]">This private page is only reachable from the link we emailed to {c.email}. Keep the email safe.</p>

        <div className="mt-8">
          <ProfileManager
            token={token}
            initial={view}
            askConfirm={sp.confirm === "1"}
            regions={[...UK_REGIONS]}
            allSkills={SKILLS.map((s) => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name))}
          />
        </div>

        <section aria-labelledby="requests-title" className="card-white mt-5 p-6">
          <h2 id="requests-title" className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
            Contact requests
          </h2>
          {contacts.length === 0 ? (
            <p className="mt-2 text-[15px] text-mute">None yet. When an employer asks to contact you, we email you and it shows here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hair">
              {contacts.map((r) => {
                const status = effectiveStatus(r);
                return (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-[15px] font-medium text-ink">{employers.get(r.account_id)}</p>
                      <p className="text-[13px] text-mute">
                        {day(r.created_at)} · {STATUS_TEXT[status]}
                      </p>
                    </div>
                    {status === "pending" && (
                      <Link href={`/contact/${r.response_token}`} className="btn btn-primary btn-sm">
                        Answer
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="apps-title" className="card-white mt-5 p-6">
          <h2 id="apps-title" className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
            Your applications
          </h2>
          {applications.length === 0 ? (
            <p className="mt-2 text-[15px] text-mute">Applications you send with MatchMySkillset from {c.email} show here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hair">
              {applications.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="text-[15px] font-medium text-ink">
                    <Link href={`/jobs/mms/${a.job_id}`} className="hover:text-blue">
                      {a.job_title ?? "A job"}
                    </Link>
                    {a.company_name ? <span className="font-normal text-mute"> at {a.company_name}</span> : null}
                  </p>
                  <p className="text-[13px] text-mute">
                    Sent {day(a.created_at)}
                    {a.match_score !== null ? ` · ${a.match_score}% match` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
