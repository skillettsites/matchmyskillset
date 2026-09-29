import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isStripeReady } from "@/lib/apis/stripe";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { getPack, toView } from "@/lib/candidate/packs";
import { confirmPackPayment } from "@/lib/candidate/billing-webhook";
import { getCandidate } from "@/lib/candidate/session";
import { entitlementFor } from "@/lib/candidate/entitlements";
import { NOT_SWITCHED_ON } from "@/lib/candidate/plans";
import { PackEditor } from "./PackEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your job pack",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<Record<string, string | undefined>>;

export default async function PackPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { token } = await params;
  const sp = await searchParams;
  let row;
  try {
    row = await getPack(token);
  } catch (err) {
    if (!(err instanceof NotSwitchedOnError)) throw err;
    return (
      <div className="mx-auto max-w-[640px] px-4 py-24 text-center sm:px-6">
        <h1 className="headline">Not switched on yet.</h1>
        <p className="lede mt-4">{NOT_SWITCHED_ON}</p>
      </div>
    );
  }
  if (!row) notFound();

  // Back from Stripe before the webhook: confirm the payment with Stripe directly
  // (a new pack, or a free tailored CV being made a full pack).
  const sessionId = sp.session_id ?? "";
  const upgradePending = row.scope === "cv" && sessionId && sessionId !== row.stripe_session_id && !row.upgrade_session_id;
  if (sessionId && (row.status === "awaiting_payment" || upgradePending)) row = await confirmPackPayment(row, sessionId);

  const [account, paymentsOpen] = await Promise.all([getCandidate(), isStripeReady().catch(() => false)]);
  const ent = await entitlementFor(account);
  const owner = Boolean(account && row.account_id === account.id);

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-40%] !opacity-[0.10]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1180px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="text-[14px] text-mute">
          {owner ? (
            <Link href="/account" className="text-link hover:underline">
              Your account
            </Link>
          ) : row.results_token ? (
            <Link href={`/results/${row.results_token}#jobs`} className="text-link hover:underline">
              Your results
            </Link>
          ) : (
            <Link href="/tools" className="text-link hover:underline">
              CV tools
            </Link>
          )}{" "}
          <span aria-hidden="true">›</span> Job pack
        </nav>
        {sp.checkout === "cancelled" && (
          <p role="status" className="mt-6 max-w-[760px] rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink">
            Payment cancelled. You have not been charged, and your tailored CV is still here.
          </p>
        )}
        <PackEditor
          initial={toView(row)}
          sessionId={sessionId}
          paymentsOpen={paymentsOpen}
          owner={owner}
          signedIn={Boolean(account)}
          plusLeft={ent.plus && owner ? (ent.plusUsage?.left ?? null) : null}
          plus={ent.plus && owner}
        />
      </div>
    </div>
  );
}
