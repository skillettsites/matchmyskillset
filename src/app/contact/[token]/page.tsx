import type { Metadata } from "next";
import Link from "next/link";
import { getMmsJobRow, isLiveRow, mmsLocationText } from "@/lib/apis/jobs/mms";
import { contactAcceptText } from "@/lib/candidates/consent";
import { effectiveStatus, getCandidateById, getContactByToken, getEmployer } from "@/lib/candidates/db";
import { ContactAnswer } from "./ContactAnswer";

// Where a job seeker answers an employer's request to contact them. The link
// (with its private token) is in the email we send when the employer asks.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "An employer would like to contact you",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-50%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[720px] px-4 pb-20 pt-12 sm:px-6 md:pt-16">{children}</div>
    </div>
  );
}

export default async function ContactPage({ params }: { params: Params }) {
  const { token } = await params;
  const req = await getContactByToken(token).catch(() => null);
  const candidate = req ? await getCandidateById(req.candidate_id).catch(() => null) : null;
  const employer = req ? await getEmployer(req.account_id).catch(() => null) : null;

  if (!req || !candidate || candidate.withdrawn_at || !employer) {
    return (
      <Shell>
        <p className="eyebrow text-blue">Contact request</p>
        <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">This request no longer exists</h1>
        <p className="lede mt-4 !text-[19px]">It may have been withdrawn, or your profile was deleted. Nothing has been shared.</p>
      </Shell>
    );
  }

  const job = req.job_id ? await getMmsJobRow(req.job_id).catch(() => null) : null;
  const company = employer.company_name || "An employer";
  const status = effectiveStatus(req);

  return (
    <Shell>
      <p className="eyebrow text-blue">Contact request</p>
      <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">
        <span className="gradient-text">{company}</span> would like to contact you
      </h1>
      <p className="lede mt-4 !text-[19px]">They found your anonymous profile on MatchMySkillset. They do not know who you are, and will not unless you accept.</p>

      <div className="card-white mt-8 p-6">
        {job && (
          <p className="text-[15px] text-ink-2">
            About:{" "}
            {isLiveRow(job) ? (
              <Link href={`/jobs/mms/${job.id}`} className="font-medium text-link hover:underline">
                {job.title}
              </Link>
            ) : (
              <span className="font-medium text-ink">{job.title}</span>
            )}{" "}
            <span className="text-mute">({mmsLocationText(job)})</span>
          </p>
        )}
        {req.message ? (
          <>
            <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">Their message</p>
            <p className="mt-1 whitespace-pre-line text-[17px] leading-relaxed text-ink">{req.message}</p>
          </>
        ) : (
          <p className="mt-2 text-[15px] text-mute">They did not add a message.</p>
        )}
        {employer.website && (
          <p className="mt-4 text-[14px] text-mute">
            Their website:{" "}
            <a href={employer.website} rel="noopener noreferrer nofollow" target="_blank" className="text-link hover:underline">
              {employer.website.replace(/^https?:\/\//, "")}
            </a>
          </p>
        )}
        <p className="mt-2 text-[13px] text-mute">Sent {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="mt-5">
        {status === "pending" ? (
          <ContactAnswer token={token} company={company} acceptText={`${contactAcceptText(company)}${candidate.cv_text ? "" : " (You have no CV saved, so they get your name and email only.)"}`} />
        ) : (
          <div className="tile p-6 text-[17px] text-ink-2">
            {status === "accepted" && `You accepted this request. ${company} can see your first name, email address${candidate.cv_text ? " and CV" : ""}.`}
            {status === "declined" && `You declined this request. ${company} did not get any of your details.`}
            {status === "expired" && "This request expired after 30 days without an answer. Nothing was shared."}
          </div>
        )}
      </div>

      <p className="mt-8 text-[14px] text-mute">
        Manage your profile, switch it off or delete it:{" "}
        <Link href={`/me/${candidate.manage_token}`} className="text-link hover:underline">
          your profile page
        </Link>
        .
      </p>
    </Shell>
  );
}
