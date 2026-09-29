import type { Metadata } from "next";
import { requireEmployer } from "@/lib/employer/session";
import { countActiveListings, formatDate } from "@/lib/employer/jobs";
import {
  effectivePlan,
  formatPence,
  isPlanId,
  JOBS_EMAIL,
  limitsFor,
  partnerRate,
  PLAN_NAMES,
  SELF_SERVE_PRICES,
  STATUS_LABELS,
  isSelfServePlan,
  type PlanStatus,
} from "@/lib/employer/plans";
import { EnquiryForm } from "@/components/employer/EnquiryForm";
import { PortalButton } from "@/components/employer/PortalButton";
import { PricingCards } from "@/components/employer/PricingCards";
import { isStripeReady } from "@/lib/apis/stripe";
import { Badge, Notice, PageHead } from "@/components/employer/ui";

export const metadata: Metadata = { title: "Plan and billing", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ checkout?: string; plan?: string }> }) {
  const account = await requireEmployer();
  const { checkout, plan: chosen } = await searchParams;
  const plan = effectivePlan(account);
  const limits = limitsFor(plan);
  const [{ live, pending }, paymentsOpen] = await Promise.all([countActiveListings(account.id), isStripeReady().catch(() => false)]);
  const status = (account.plan_status as PlanStatus) ?? "inactive";
  // Partner rate (Flintstone Associates clients, set in admin). Shown as what they pay only when the card subscription in force is at that price.
  const partner = partnerRate(account);
  const billed = account.billed_price_pence ?? null;
  const onPartnerRate = Boolean(partner && plan === partner.plan && (status === "active" || status === "past_due") && billed === partner.pence);
  const monthly = onPartnerRate && partner ? partner.pence : billed ?? (plan && isSelfServePlan(plan) && status !== "comped" ? SELF_SERVE_PRICES[plan] : null);

  return (
    <div>
      <PageHead title="Plan and billing" />

      {checkout === "success" && (
        <div className="mb-6">
          <Notice tone="green">Thank you. Your payment went through and your plan switches on within a minute. Refresh this page if it has not shown yet.</Notice>
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="mb-6">
          <Notice>Checkout was cancelled. Nothing has been charged.</Notice>
        </div>
      )}
      {!plan && chosen && isPlanId(chosen) && chosen !== "enterprise" && checkout !== "success" && (
        <div className="mb-6">
          <Notice>You picked {PLAN_NAMES[chosen]}. Press &ldquo;Choose {PLAN_NAMES[chosen]}&rdquo; below to pay securely by card.</Notice>
        </div>
      )}

      <div className="rounded-[22px] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-mute">Your plan</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-[26px] font-bold tracking-[-0.03em] text-ink">{isPlanId(account.plan) ? PLAN_NAMES[account.plan] : "No plan yet"}</p>
              <Badge tone={plan ? (status === "past_due" ? "amber" : "green") : "grey"}>{STATUS_LABELS[status] ?? status}</Badge>
              {onPartnerRate && <Badge tone="blue">Partner rate</Badge>}
            </div>
            {monthly !== null && (status === "active" || status === "past_due") && (
              <p className="mt-1 text-[15px] text-ink-2">
                {formatPence(monthly)} a month{onPartnerRate ? " (partner rate)" : ""}
              </p>
            )}
            {partner && !onPartnerRate && (
              <p className="mt-2 text-[15px] text-ink-2">
                Partner rate agreed: {formatPence(partner.pence)} a month for {PLAN_NAMES[partner.plan]}.{" "}
                {plan === partner.plan && status === "comped"
                  ? ""
                  : plan === partner.plan
                    ? "Choose it below to move your card payment onto it."
                    : `Choose ${PLAN_NAMES[partner.plan]} below to pay it.`}
              </p>
            )}
            <p className="mt-2 text-[15px] text-mute">
              {limits
                ? `${live} live${pending ? ` and ${pending} waiting` : ""} of ${limits.liveJobs === null ? "unlimited" : limits.liveJobs} listings.`
                : "Choose a plan below to put jobs live."}
              {account.current_period_end && status === "active" ? ` Renews on ${formatDate(account.current_period_end)}.` : ""}
              {account.current_period_end && status === "cancelled" ? ` Ended on ${formatDate(account.current_period_end)}.` : ""}
            </p>
            {status === "comped" && <p className="mt-2 text-[15px] text-mute">This plan was set up with us directly. Email {JOBS_EMAIL} for any change.</p>}
            {status === "past_due" && (
              <p className="mt-2 text-[15px] text-[#8a5300]">Your last payment did not go through. Update your card under Manage billing to keep your jobs live.</p>
            )}
          </div>
          {account.stripe_customer_id && <PortalButton />}
        </div>
      </div>

      <h2 className="mt-12 text-[22px] font-bold tracking-[-0.02em] text-ink">{plan ? "Change plan" : "Choose a plan"}</h2>
      <p className="mt-1 text-[15px] text-mute">Monthly, no minimum term. Moving to another plan by card replaces your current subscription.</p>
      <div className="mt-6">
        <PricingCards mode="dashboard" currentPlan={plan} paymentsOpen={paymentsOpen} partner={partner} billedPence={billed} />
      </div>

      <div id="enquiry" className="mt-14 scroll-mt-24">
        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">Enterprise, pay per hire, partner rates or a question</h2>
        <p className="mt-1 mb-6 text-[15px] text-mute">Tell us what you need and we will reply by email.</p>
        <EnquiryForm />
      </div>
    </div>
  );
}
