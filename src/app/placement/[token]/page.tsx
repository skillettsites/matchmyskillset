import type { Metadata } from "next";
import Link from "next/link";
import { getPlacementByConsentToken } from "@/lib/tracking/placements";
import { MARKETING_CONSENT_TEXT } from "@/lib/tracking/constants";
import { NotOn, TrackingShell } from "@/components/tracking/Shell";
import { formatDate } from "@/lib/employer/jobs";
import { saveCaseStudyAnswer } from "../actions";

// "Can we mention your move, anonymised, in our case studies?" The link is in
// one email we send after a placement. Separate from everything else, with an
// unticked box; the answer is saved with the time and this exact wording and
// can be changed here at any time.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Can we mention your move?",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const DONE: Record<string, { text: string; ok: boolean }> = {
  yes: { text: "Thank you. We may mention your move in our case studies, without your name or anything that identifies you. You can change this here at any time.", ok: true },
  no: { text: "Saved. We will not mention your move.", ok: true },
  busy: { text: "Too many attempts from here in the last hour. Please try again later.", ok: false },
  error: { text: "We could not save that just now. Please try again.", ok: false },
};

export default async function PlacementConsentPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> }) {
  const { token } = await params;
  const { done } = await searchParams;
  const p = await getPlacementByConsentToken(token);
  if (p === "off") return <NotOn what="Case studies" />;
  if (!p || p.cancelled_at) {
    return (
      <TrackingShell>
        <p className="eyebrow text-blue">Case studies</p>
        <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">This link does not work</h1>
        <p className="lede mt-4 !text-[19px]">It may be incomplete, or there is nothing to ask about any more. We will not mention anything without your say-so.</p>
      </TrackingShell>
    );
  }

  const notice = done ? DONE[done] : undefined;
  const role = p.job_title ? (p.company ? `${p.job_title} at ${p.company}` : p.job_title) : "your new job";
  const current = p.marketing_consent
    ? `Your answer: yes, since ${formatDate(p.marketing_consent_at)}.`
    : p.marketing_consent_withdrawn_at
      ? `Your answer: no (you withdrew it on ${formatDate(p.marketing_consent_withdrawn_at)}).`
      : p.marketing_consent_answered_at
        ? "Your answer: no."
        : "You have not answered yet, so we will not mention it.";

  return (
    <TrackingShell>
      <p className="eyebrow text-blue">Case studies</p>
      <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">
        Can we mention your <span className="gradient-text">move?</span>
      </h1>
      <p className="lede mt-4 !text-[19px]">Congratulations on {role}.</p>

      {notice && (
        <p role="status" className={`mt-6 rounded-2xl px-4 py-3 text-[15px] ${notice.ok ? "bg-[#e8f6ec] text-[#1d7f37]" : "bg-[#fdecea] text-[#8c1d18]"}`}>
          {notice.text}
        </p>
      )}

      <div className="card-white mt-8 p-6">
        <p className="text-[17px] leading-relaxed text-ink">
          We would like to mention moves like yours in our case studies and marketing, to show what kinds of jobs people find through MatchMySkillset. We would describe
          the kind of job and field, and how you found it. We would never use your name, photo, contact details or anything else that identifies you.
        </p>
        <p className="mt-3 text-[15px] text-mute">It is entirely up to you, and it makes no difference to anything else. If you do nothing, we will not mention it.</p>
        <form action={saveCaseStudyAnswer} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-hair p-4 text-[15px] leading-snug text-ink has-[:checked]:border-blue has-[:checked]:bg-[#f5f9ff]">
            {/* Unticked unless they have already said yes themselves. */}
            <input type="checkbox" name="consent" value="yes" defaultChecked={p.marketing_consent} className="mt-0.5 h-5 w-5 shrink-0 accent-[#0071e3]" />
            <span>{MARKETING_CONSENT_TEXT}</span>
          </label>
          <p className="mt-3 text-[14px] text-mute">{current}</p>
          <button type="submit" className="btn btn-primary mt-4">
            Save my answer
          </button>
        </form>
      </div>
      <p className="mt-6 text-[13px] leading-relaxed text-mute">
        Saving with the box unticked records a no (and withdraws an earlier yes).{" "}
        <Link href="/privacy#placements" className="text-link hover:underline">
          How we use placement details
        </Link>
      </p>
    </TrackingShell>
  );
}
