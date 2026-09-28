import type { Metadata } from "next";
import Link from "next/link";
import { getAlertByToken } from "@/lib/candidates/db";
import { whereText } from "@/lib/candidates/alerts";
import { titleInSentence } from "@/lib/text";
import { AlertManager } from "./AlertManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage your job alert",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function AlertPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { token } = await params;
  const sp = await searchParams;
  const alert = await getAlertByToken(token).catch(() => null);

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-50%] !opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[720px] px-4 pb-20 pt-12 sm:px-6 md:pt-16">
        <p className="eyebrow text-blue">Job alert</p>
        {!alert ? (
          <>
            <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">This alert no longer exists</h1>
            <p className="lede mt-4 !text-[19px]">It may have been deleted, or the link is not complete. You will not get emails from it.</p>
            <Link href="/discover" className="btn btn-primary mt-8">
              Check my CV
            </Link>
          </>
        ) : (
          <>
            <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">Your job alert</h1>
            <p className="lede mt-4 !text-[19px]">
              {alert.active ? "On" : "Paused"}. Sent to {alert.email}
              {alert.last_sent_at ? `, last checked ${new Date(alert.last_sent_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}` : ""}.
            </p>
            <div className="tile mt-8 p-5 text-[15px] text-ink-2">
              <p>
                <strong className="text-ink">What we search for:</strong>{" "}
                {(alert.query?.anchors ?? []).map((a) => titleInSentence(a.title)).join(", ") || "the jobs in your results"}, {alert.query ? whereText(alert.query) : "across the UK"}.
              </p>
              <p className="mt-1">We score each job against the skills in your results and send only good matches you have not had from us.</p>
            </div>
            <div className="mt-6">
              <AlertManager
                token={token}
                askUnsubscribe={sp.unsubscribe === "1"}
                initial={{ frequency: alert.frequency, active: alert.active, salaryMin: alert.query?.salaryMin ?? null }}
              />
            </div>
            <p className="mt-8 text-[13px] text-mute">
              An alert stops and is deleted 12 months after you set it up, or sooner if you delete it. See our{" "}
              <Link href="/privacy#alerts" className="text-link hover:underline">
                privacy policy
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
