import type { Metadata } from "next";
import { verifyCheckin } from "@/lib/tracking/sign";
import { getTracked } from "@/lib/tracking/tracker";
import { CHECKIN_ANSWER_LABELS, TRACKED_STATUS_LABELS } from "@/lib/tracking/constants";
import { NotOn, TrackingShell } from "@/components/tracking/Shell";
import { confirmCheckin } from "./actions";

// The page a check-in email's buttons open. Opening it changes nothing (mail
// scanners open links); the answer is recorded only when the person presses
// Confirm, which posts to confirmCheckin().

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How did your application go?",
  robots: { index: false, follow: false },
};

const HEADINGS: Record<string, string> = {
  no_response: "No response yet?",
  interview: "You have an interview?",
  offer: "You have an offer?",
  placed: "You got the job?",
  stop: "Stop asking about this job?",
  stopall: "Stop all check-in emails?",
};

const EXPLAIN: Record<string, string> = {
  no_response: "We'll note that you have not heard back yet.",
  interview: "We'll note that you have an interview. Good luck.",
  offer: "We'll note that you have an offer. Congratulations.",
  placed: "We'll note that you got the job. Congratulations. We may send you one separate email asking whether we can mention your move, anonymised, in our case studies. It is entirely up to you.",
  stop: "We won't email you about this job again. It stays in your tracker.",
  stopall: "We won't send any more check-in emails to this address. Your tracker stays as it is.",
};

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ c?: string; err?: string }> }) {
  const { c = "", err } = await searchParams;
  const signed = verifyCheckin(c);
  const row = signed ? await getTracked(signed.trackedId).catch(() => null) : null;
  if (row === "off") return <NotOn what="Your application" />;

  if (!signed || !row) {
    return (
      <TrackingShell>
        <p className="eyebrow text-blue">Your application</p>
        <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">This link does not work</h1>
        <p className="lede mt-4 !text-[19px]">
          It may be incomplete, or the application was deleted from your tracker. Nothing has changed. Try the link again from the email, or open your tracker from any of our emails.
        </p>
      </TrackingShell>
    );
  }

  const job = row.company ? `${row.job_title} at ${row.company}` : row.job_title;
  const same = signed.answer !== "stop" && signed.answer !== "stopall" && row.status === signed.answer;

  return (
    <TrackingShell>
      <p className="eyebrow text-blue">Your application</p>
      <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">{HEADINGS[signed.answer]}</h1>
      <p className="lede mt-4 !text-[19px]">{job}</p>

      <div className="card-white mt-8 p-6">
        <p className="text-[17px] leading-relaxed text-ink">{EXPLAIN[signed.answer]}</p>
        {same && <p className="mt-2 text-[15px] text-mute">Your tracker already says {TRACKED_STATUS_LABELS[row.status].toLowerCase()}.</p>}
        {err === "save" && (
          <p role="alert" className="mt-4 rounded-xl bg-[#fff2f2] px-3 py-2 text-[14px] text-[#b3261e]">
            We could not save that just now. Please try again.
          </p>
        )}
        {err === "busy" && (
          <p role="alert" className="mt-4 rounded-xl bg-[#fff2f2] px-3 py-2 text-[14px] text-[#b3261e]">
            Too many answers from here in the last hour. Please try again later.
          </p>
        )}
        <form action={confirmCheckin} className="mt-6 flex flex-wrap items-center gap-3">
          <input type="hidden" name="c" value={c} />
          <button type="submit" className="btn btn-primary">
            Confirm: {CHECKIN_ANSWER_LABELS[signed.answer].replace(/^Placed: /, "")}
          </button>
          <a href={`/tracker/${encodeURIComponent(row.manage_token)}`} className="btn btn-secondary">
            Open my tracker instead
          </a>
        </form>
      </div>
      <p className="mt-6 text-[13px] leading-relaxed text-mute">
        Your answer helps us see which jobs lead to interviews and hires. We record it against this application only.{" "}
        <a href="/privacy#tracking" className="text-link hover:underline">
          How we use it
        </a>
      </p>
    </TrackingShell>
  );
}
