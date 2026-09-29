import Link from "next/link";
import { EVERY_PLAN, formatPence, isSelfServePlan, JOBS_EMAIL, PARTNER_LINE, PRICING_TIERS, type PartnerRate, type PlanId } from "@/lib/employer/plans";
import { CheckoutButton } from "./CheckoutButton";
import { Check, Minus } from "./icons";

// The employer tiers. On public pages the Lite, Starter and Growth buttons go
// to sign-in and then billing; inside the dashboard they start checkout. While
// card payments cannot be taken (isStripeReady), those three say so and offer
// an email instead of a button that would fail. An account with a partner rate
// (Flintstone Associates clients, set in admin) sees its own price on that
// plan's card; nobody else sees a partner price.

export function PricingCards({
  mode,
  currentPlan = null,
  paymentsOpen = true,
  partner = null,
  billedPence = null,
}: {
  mode: "public" | "dashboard";
  currentPlan?: PlanId | null;
  paymentsOpen?: boolean;
  /** Dashboard only: this account's partner rate, if admin has set one. */
  partner?: PartnerRate | null;
  /** Dashboard only: the monthly price of the card subscription in force, if known. */
  billedPence?: number | null;
}) {
  return (
    <div>
      <div className="mx-auto grid max-w-[1320px] gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PRICING_TIERS.map((tier) => {
          // A highlight is a factual label (never "most popular"); it also draws the card dark.
          const dark = Boolean(tier.highlight);
          const isCurrent = currentPlan !== null && tier.id === currentPlan;
          const partnerHere = mode === "dashboard" && partner && partner.plan === tier.id ? partner : null;
          // Already paying for this plan, but not yet at the partner rate: offer the switch.
          const canMoveToPartner = Boolean(isCurrent && partnerHere && billedPence !== partnerHere.pence);
          return (
            <div key={tier.id} className={`relative flex flex-col rounded-[28px] p-6 ${dark ? "bg-ink text-white" : "bg-cloud text-ink"}`}>
              {tier.highlight && (
                <p className="absolute -top-3 left-6 rounded-full bg-blue px-3 py-1 text-[12px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(0,113,227,0.6)]">
                  {tier.highlight}
                </p>
              )}
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">{tier.name}</h3>
              <p className={`mt-1 min-h-[44px] text-[15px] leading-snug ${dark ? "text-white/70" : "text-mute"}`}>{tier.blurb}</p>
              {partnerHere ? (
                <div className="mt-5">
                  <p className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-[44px] font-bold tracking-[-0.04em]">{formatPence(partnerHere.pence)}</span>
                    <span className={`text-[15px] ${dark ? "text-white/70" : "text-mute"}`}>{tier.per}</span>
                  </p>
                  <p className={`mt-1 text-[13px] font-semibold ${dark ? "text-[#64d2ff]" : "text-link"}`}>
                    Your partner rate <span className={`font-normal line-through ${dark ? "text-white/50" : "text-mute"}`}>{tier.price}</span>
                  </p>
                </div>
              ) : (
                <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                  <span className={`font-bold tracking-[-0.04em] ${tier.price.length > 6 ? "text-[30px]" : "text-[44px]"}`}>{tier.price}</span>
                  <span className={`text-[15px] ${dark ? "text-white/70" : "text-mute"}`}>{tier.per}</span>
                </p>
              )}
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px] leading-snug">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-[#30d158]" : "text-green"}`} />
                    {f}
                  </li>
                ))}
                {tier.notIncluded?.map((f) => (
                  <li key={f} className={`flex gap-2.5 text-[15px] leading-snug ${dark ? "text-white/60" : "text-mute"}`}>
                    <Minus className="mt-0.5 h-4 w-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {isCurrent && !canMoveToPartner ? (
                  <p className={`rounded-full py-3 text-center text-[15px] font-semibold ${dark ? "bg-white/15" : "bg-white"}`}>Your current plan</p>
                ) : tier.action === "contact" ? (
                  <a href="#enquiry" className={`btn w-full ${dark ? "btn-primary" : "btn-dark"}`}>
                    Talk to us
                  </a>
                ) : !paymentsOpen ? (
                  <div>
                    <p className={`mb-3 text-center text-[14px] leading-snug ${dark ? "text-white/80" : "text-ink-2"}`}>Card payments open shortly. Email us and we will set you up today.</p>
                    <a
                      href={`mailto:${JOBS_EMAIL}?subject=${encodeURIComponent(`${tier.name} plan`)}`}
                      className={`btn w-full ${dark ? "btn-primary" : "btn-dark"}`}
                    >
                      Email us to start
                    </a>
                  </div>
                ) : mode === "dashboard" && isSelfServePlan(tier.id) ? (
                  <CheckoutButton
                    plan={tier.id}
                    label={canMoveToPartner ? "Move to your partner rate" : `Choose ${tier.name}`}
                    className={`btn w-full ${dark ? "btn-primary" : "btn-dark"}`}
                  />
                ) : (
                  <Link
                    href={`/employers/sign-in?next=${encodeURIComponent(`/employers/dashboard/billing?plan=${tier.id}`)}`}
                    className={`btn w-full ${dark ? "btn-primary" : "btn-dark"}`}
                  >
                    Choose {tier.name}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mx-auto mt-8 max-w-[980px]">
        <p className="text-center text-[15px] font-semibold text-ink">On every plan</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] text-mute">
          {EVERY_PLAN.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green" />
              {f}
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-5 max-w-[720px] text-center text-[14px] leading-relaxed text-mute">
          Lite, Starter and Growth are paid monthly by card through Stripe{paymentsOpen ? "" : " once card payments open"}. Cancel any time: your plan runs to the end of the month you have paid for.
          Job seekers never pay to apply.
        </p>
        <p className="mt-3 text-center text-[15px] font-medium text-ink">
          {PARTNER_LINE}{" "}
          <a href={`#enquiry`} className="text-link hover:underline">
            Get in touch
          </a>
        </p>
      </div>
    </div>
  );
}
