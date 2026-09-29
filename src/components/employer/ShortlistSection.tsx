import Link from "next/link";
import { jobCommand } from "@/app/employers/dashboard/actions";
import { EMPLOYER_SHORTLIST_STATUS, EMPLOYER_SHORTLIST_TEXT } from "@/lib/employer/shortlists";
import type { ShortlistRow } from "@/lib/employer/types";
import { Badge } from "./ui";

// "Recruiter shortlist" on a job's overview page: where the shortlist is, or
// how to get one. Growth and Enterprise can ask once per job; Starter sees
// where it comes from.

export interface ShortlistSectionProps {
  jobId: string;
  /** The plan includes shortlists (Growth or Enterprise, paid or comped). */
  included: boolean;
  /** Migration 008 is applied. */
  ready: boolean;
  shortlist: ShortlistRow | null;
  /** The employer asked for one and the job is not live yet. */
  wanted: boolean;
  jobState: "live" | "waiting" | "ended";
  picks: number;
  sentOn: string;
  requestedOn: string;
}

function AskButton({ jobId, label }: { jobId: string; label: string }) {
  return (
    <form action={jobCommand}>
      <input type="hidden" name="id" value={jobId} />
      <input type="hidden" name="op" value="shortlist" />
      <button type="submit" className="btn btn-primary btn-sm">
        {label}
      </button>
    </form>
  );
}

export function ShortlistSection({ jobId, included, ready, shortlist, wanted, jobState, picks, sentOn, requestedOn }: ShortlistSectionProps) {
  const status = shortlist ? EMPLOYER_SHORTLIST_STATUS[shortlist.status] : null;
  let body: React.ReactNode;

  if (shortlist && shortlist.status === "sent") {
    body = (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[15px] leading-snug text-mute">
          {picks} {picks === 1 ? "person" : "people"} picked for this role{shortlist.recruiter_name ? ` by ${shortlist.recruiter_name}` : ""}, sent {sentOn}.
        </p>
        <Link href={`/employers/dashboard/jobs/${jobId}/shortlist`} className="btn btn-primary btn-sm">
          See the shortlist
        </Link>
      </div>
    );
  } else if (shortlist && shortlist.status !== "cancelled") {
    body = (
      <p className="text-[15px] leading-snug text-mute">
        {EMPLOYER_SHORTLIST_TEXT[shortlist.status]} Asked for on {requestedOn}.
      </p>
    );
  } else if (!included) {
    body = (
      <p className="text-[15px] leading-snug text-mute">
        On Growth and Enterprise, an experienced recruiter reviews your applicants and the people who asked to be found, and sends you the best fits for each role,
        in order, with a note on each.{" "}
        <Link href="/employers/dashboard/billing" className="font-semibold text-link hover:underline">
          See plans
        </Link>
      </p>
    );
  } else if (!ready) {
    body = <p className="text-[15px] leading-snug text-mute">Recruiter shortlists are not switched on yet. Please check back soon.</p>;
  } else if (jobState === "ended") {
    body = <p className="text-[15px] leading-snug text-mute">This job is not live. Renew or reopen it to ask for a recruiter shortlist.</p>;
  } else if (jobState === "waiting" && wanted) {
    body = <p className="text-[15px] leading-snug text-mute">You asked for a shortlist. Our recruiters start as soon as the job is approved and live, and we email you when it is ready.</p>;
  } else {
    body = (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-[640px] text-[15px] leading-snug text-mute">
          {shortlist?.status === "cancelled" ? `${EMPLOYER_SHORTLIST_TEXT.cancelled} ` : ""}
          An experienced recruiter reviews your applicants and the people who asked to be found, and sends you the best fits, in order, with a note on each. We
          email you when it is ready.
        </p>
        <AskButton jobId={jobId} label={jobState === "live" ? "Ask for a recruiter shortlist" : "Ask for one when the job goes live"} />
      </div>
    );
  }

  return (
    <div className="rounded-[22px] bg-white p-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Recruiter shortlist</h2>
        {status && shortlist?.status !== "cancelled" && <Badge tone={status.tone}>{status.label}</Badge>}
        {!included && !shortlist && <Badge>Growth and Enterprise</Badge>}
      </div>
      {body}
    </div>
  );
}
