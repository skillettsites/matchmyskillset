import type { Metadata } from "next";
import Link from "next/link";
import { trackerRows } from "@/lib/tracking/tracker";
import { CHECKIN_NOTICE, TRACKED_STATUSES, TRACKED_STATUS_LABELS } from "@/lib/tracking/constants";
import { TRACKER_TOKEN_RE } from "@/lib/tracking/sign";
import { NotOn, TrackingShell } from "@/components/tracking/Shell";
import { TrackerList } from "@/components/tracking/TrackerList";
import { RememberTracker } from "@/components/tracking/RememberTracker";
import { removeTrackedRow, removeWholeTracker, stopEveryCheckin, stopTrackedCheckins, updateTrackedStatus } from "../actions";

// A job seeker's private application tracker. The link is the key: it is in
// every tracking email and is only given to the browser that created it.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your application tracker",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const DONE: Record<string, { text: string; ok: boolean }> = {
  no_response: { text: "Thanks. We have noted that you have not heard back yet.", ok: true },
  interview: { text: "Thanks, and good luck with the interview.", ok: true },
  offer: { text: "Congratulations on the offer.", ok: true },
  placed: { text: "Congratulations on the new job. We may send one separate email asking whether we can mention your move, anonymised, in our case studies. It is up to you.", ok: true },
  stop: { text: "Done. We will not email you about that job again.", ok: true },
  stopall: { text: "Done. We will not send any more check-in emails to this address.", ok: true },
  saved: { text: "Saved.", ok: true },
  unchanged: { text: "That is already what your tracker says.", ok: true },
  deleted: { text: "Deleted from your tracker.", ok: true },
  confirm: { text: "Tick the box to confirm you want to delete your whole tracker.", ok: false },
  busy: { text: "Too many changes from here in the last hour. Please try again later.", ok: false },
  error: { text: "We could not save that just now. Please try again.", ok: false },
};

export default async function TrackerPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> }) {
  const { token } = await params;
  const { done } = await searchParams;

  if (token === "deleted") {
    return (
      <TrackingShell>
        <p className="eyebrow text-blue">Application tracker</p>
        <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">Your tracker is deleted</h1>
        <p className="lede mt-4 !text-[19px]">We have deleted every application in it and will not send any check-in emails about them.</p>
        <Link href="/jobs" className="btn btn-primary mt-8">
          Find jobs
        </Link>
      </TrackingShell>
    );
  }

  const rows = TRACKER_TOKEN_RE.test(token) ? await trackerRows(token).catch(() => []) : [];
  if (rows === "off") return <NotOn what="Application tracker" />;
  if (rows.length === 0) {
    return (
      <TrackingShell>
        <p className="eyebrow text-blue">Application tracker</p>
        <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">Nothing to show</h1>
        <p className="lede mt-4 !text-[19px]">This tracker link does not work, or everything in it has been deleted. Applications are kept for 12 months.</p>
        <Link href="/jobs" className="btn btn-primary mt-8">
          Find jobs
        </Link>
      </TrackingShell>
    );
  }

  const notice = done ? DONE[done] : undefined;
  const counts = TRACKED_STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length] as const).filter(([, n]) => n > 0);
  const anyCheckins = rows.some((r) => !r.checkins_stopped_at && r.next_checkin_at);

  return (
    <TrackingShell wide>
      <RememberTracker token={token} email={rows[0].email} />
      <p className="eyebrow text-blue">Application tracker</p>
      <h1 className="headline mt-2 !text-[36px] sm:!text-[52px]">
        Your <span className="gradient-text">applications</span>
      </h1>
      <p className="lede mt-4 !text-[19px]">
        {rows.length} {rows.length === 1 ? "job" : "jobs"} for {rows[0].email}. Update each one as you hear back. {CHECKIN_NOTICE}
      </p>
      {counts.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-2 text-[14px]">
          {counts.map(([s, n]) => (
            <span key={s} className="pill !px-3 !py-1 bg-cloud text-ink-2">
              {TRACKED_STATUS_LABELS[s]}: {n}
            </span>
          ))}
        </p>
      )}

      {notice && (
        <p role="status" className={`mt-6 rounded-2xl px-4 py-3 text-[15px] ${notice.ok ? "bg-[#e8f6ec] text-[#1d7f37]" : "bg-[#fdecea] text-[#8c1d18]"}`}>
          {notice.text}
        </p>
      )}

      <div className="mt-8">
        <TrackerList
          rows={rows}
          controls={(row) => (
            <div className="flex flex-wrap items-end gap-3">
              <form action={updateTrackedStatus} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="id" value={row.id} />
                <label className="block">
                  <span className="field-label !mb-1 !text-[13px]">How it stands</span>
                  <select name="status" defaultValue={row.status} className="field !w-auto !py-2 !text-[15px]">
                    {TRACKED_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {TRACKED_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="btn btn-primary btn-sm mb-0.5">
                  Update
                </button>
              </form>
              {!row.checkins_stopped_at && row.next_checkin_at && (
                <form action={stopTrackedCheckins}>
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit" className="btn btn-secondary btn-sm mb-0.5">
                    Stop check-ins for this job
                  </button>
                </form>
              )}
              <form action={removeTrackedRow} className="ml-auto">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="id" value={row.id} />
                <button type="submit" className="mb-0.5 text-[14px] text-mute underline-offset-2 hover:text-ink hover:underline">
                  Delete
                </button>
              </form>
            </div>
          )}
        />
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-2" aria-label="Manage your tracker">
        <div className="tile p-6">
          <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Check-in emails</h2>
          <p className="mt-1 text-[15px] leading-snug text-mute">
            We email 7 and 21 days after you apply to ask how it went. {anyCheckins ? "Stop them all here, or from any of our emails." : "None are waiting to go out."}
          </p>
          {anyCheckins && (
            <form action={stopEveryCheckin} className="mt-4">
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn btn-secondary btn-sm">
                Stop all check-in emails
              </button>
            </form>
          )}
        </div>
        <div className="tile p-6">
          <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Delete your tracker</h2>
          <p className="mt-1 text-[15px] leading-snug text-mute">Deletes every job on this page and stops every check-in. It cannot be undone.</p>
          <form action={removeWholeTracker} className="mt-4 space-y-3">
            <input type="hidden" name="token" value={token} />
            <label className="flex cursor-pointer items-start gap-3 text-[14px] text-ink-2">
              <input type="checkbox" name="confirm" value="yes" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0071e3]" />
              <span>Yes, delete everything in my tracker</span>
            </label>
            <button type="submit" className="btn btn-dark btn-sm">
              Delete my tracker
            </button>
          </form>
        </div>
      </section>

      <p className="mt-8 text-[13px] leading-relaxed text-mute">
        This page is private: anyone with the link can see and change it, so do not share it. We keep each application for 12 months after you add it.{" "}
        <Link href="/privacy#tracking" className="text-link hover:underline">
          How we use your answers
        </Link>
      </p>
    </TrackingShell>
  );
}
