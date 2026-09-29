import { formatPence, partnerRate, PLAN_NAMES, SELF_SERVE_PLANS, SELF_SERVE_PRICES } from "@/lib/employer/plans";
import type { EmployerAccount } from "@/lib/employer/types";
import { setPartnerRate } from "@/app/admin/tracking-actions";

// Partner rate for one employer (Flintstone Associates clients), in /admin.
// A monthly price in pence for one self-serve plan; their checkout for that
// plan then charges it, and their billing page says "Partner rate". There is
// no public partner price.

export function PartnerRateForm({ account }: { account: EmployerAccount }) {
  const rate = partnerRate(account);
  const label = account.company_name || account.email;
  return (
    <details className="mt-3 rounded-2xl bg-cloud px-4 py-3" open={Boolean(rate)}>
      <summary className="cursor-pointer text-[14px] font-medium text-ink">
        Partner rate{" "}
        <span className="font-normal text-mute">
          {rate
            ? `: ${PLAN_NAMES[rate.plan]} at ${formatPence(rate.pence)} a month${account.billed_price_pence === rate.pence ? " (paying it now)" : " (from their next checkout)"}`
            : "(none)"}
        </span>
      </summary>
      <form action={setPartnerRate} className="mt-3 grid gap-2 sm:grid-cols-[160px_200px_auto_auto] sm:items-center">
        <input type="hidden" name="id" value={account.id} />
        <input type="hidden" name="label" value={label} />
        <select name="partner_plan" defaultValue={rate?.plan ?? "starter"} className="field !bg-white !py-2 !text-[14px]" aria-label="Plan the partner rate applies to">
          {SELF_SERVE_PLANS.map((p) => (
            <option key={p} value={p}>
              {PLAN_NAMES[p]} (standard {formatPence(SELF_SERVE_PRICES[p])})
            </option>
          ))}
        </select>
        <input
          name="partner_price_pence"
          type="number"
          min={100}
          max={SELF_SERVE_PRICES.growth}
          step={1}
          defaultValue={rate?.pence ?? ""}
          className="field !bg-white !py-2 !text-[14px]"
          placeholder="Monthly price in pence"
          aria-label="Partner monthly price in pence"
        />
        <button className="btn btn-dark btn-sm">Save partner rate</button>
        {rate && (
          <button name="clear" value="1" className="btn btn-secondary btn-sm">
            Remove
          </button>
        )}
      </form>
      <p className="mt-2 text-[12px] leading-snug text-mute">
        Pence, for example 12900 for £129. Applies at their next card checkout for that plan. If they already pay by card, they can move onto it from their billing page
        (the old subscription is ended and unused time credited), or change the price in Stripe.
      </p>
    </details>
  );
}
