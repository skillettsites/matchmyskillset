// Employer plans: prices, limits and what each plan includes. No server
// imports, so client components (the pricing cards) can use it too.
//
// Prices come from the business plan (docs/revenue-research.md); Lite (£49,
// one live job, applicants only) and partner rates were set by the owner on
// 29 Sep 2026. Only list a feature here once it is built: the pricing page
// prints these lines.

export type PlanId = "lite" | "starter" | "growth" | "enterprise";
export type PlanStatus = "inactive" | "active" | "past_due" | "cancelled" | "comped";

export const PLAN_IDS: PlanId[] = ["lite", "starter", "growth", "enterprise"];
export const PLAN_STATUSES: PlanStatus[] = ["inactive", "active", "past_due", "cancelled", "comped"];

/** Plans a card can pay for online. */
export type SelfServePlan = "lite" | "starter" | "growth";
export const SELF_SERVE_PLANS: SelfServePlan[] = ["lite", "starter", "growth"];

export function isSelfServePlan(value: unknown): value is SelfServePlan {
  return typeof value === "string" && (SELF_SERVE_PLANS as string[]).includes(value);
}

/** Stripe metadata tag for employer subscriptions (the report uses "career_change_report"). */
export const EMPLOYER_PRODUCT = "employer_subscription";

/** Employer mail is sent from and answered at this address. */
export const JOBS_EMAIL = "jobs@matchmyskillset.com";

/** How long an approved listing stays live before it needs renewing. */
export const LISTING_DAYS = 30;

/** Shown wherever a card payment cannot be started (the Stripe key is missing or expired). */
export const PAYMENTS_UNAVAILABLE = `Card payments open shortly. Email ${JOBS_EMAIL} and we'll set you up today.`;

export interface PlanLimits {
  /** Live listings at once; null = unlimited. */
  liveJobs: number | null;
  /** Matched candidates shown per role (and per search); null = unlimited, 0 = none (Lite). */
  matchedPerRole: number | null;
  /** Matched candidates, candidate search and contact requests (every plan but Lite). */
  candidateSearch: boolean;
  skillsGap: boolean;
  companyPage: boolean;
  prioritySupport: boolean;
  /** A top-candidate shortlist for each live job, picked by our recruiters (/recruiter). */
  recruiterShortlist: boolean;
}

// "Unlimited" is Enterprise only: it is the one plan with null limits.
// Lite is one live job and its applicants: no matched candidates, candidate
// search, recruiter shortlist, skills-gap report or company page.
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  lite: { liveJobs: 1, matchedPerRole: 0, candidateSearch: false, skillsGap: false, companyPage: false, prioritySupport: false, recruiterShortlist: false },
  starter: { liveJobs: 3, matchedPerRole: 10, candidateSearch: true, skillsGap: false, companyPage: false, prioritySupport: false, recruiterShortlist: false },
  growth: { liveJobs: 10, matchedPerRole: 30, candidateSearch: true, skillsGap: true, companyPage: true, prioritySupport: true, recruiterShortlist: true },
  enterprise: { liveJobs: null, matchedPerRole: null, candidateSearch: true, skillsGap: true, companyPage: true, prioritySupport: true, recruiterShortlist: true },
};

/** True when this plan includes recruiter shortlists (Growth and Enterprise). */
export function hasRecruiterShortlist(plan: PlanId | null): boolean {
  return Boolean(plan && PLAN_LIMITS[plan].recruiterShortlist);
}

/** True when this plan shows matched candidates and lets the employer search and contact opted-in people (not Lite). */
export function hasCandidateSearch(plan: PlanId | null): boolean {
  return Boolean(plan && PLAN_LIMITS[plan].candidateSearch);
}

/** Shown where a Lite account meets a candidate-search feature. */
export const CANDIDATE_SEARCH_UPGRADE =
  "Matched candidates and candidate search come with Starter, Growth and Enterprise. Lite includes the people who apply to your job.";

/** The pricing line for the shortlist, shared by the cards, checkout and dashboard. */
export const SHORTLIST_FEATURE = "Top-candidate shortlist for every role, hand-picked by experienced recruiters";

/**
 * Shown when a plan caps matched candidates and there are more: what the
 * bigger plans show instead. Only Enterprise is unlimited.
 */
export function moreMatchesHint(plan: PlanId | null): string {
  if (plan === "starter") return `Growth shows up to ${PLAN_LIMITS.growth.matchedPerRole} per role and Enterprise shows every match.`;
  return "Enterprise shows every match.";
}

/** Plans a card can pay for online, monthly, in pence (standard prices; a partner rate can replace one per account). */
export const SELF_SERVE_PRICES: Record<SelfServePlan, number> = {
  lite: 4900,
  starter: 19900,
  growth: 49900,
};

export const PLAN_NAMES: Record<PlanId, string> = {
  lite: "Lite",
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

export const STATUS_LABELS: Record<PlanStatus, string> = {
  inactive: "No plan yet",
  active: "Active",
  past_due: "Payment overdue",
  cancelled: "Cancelled",
  comped: "Active (arranged with us)",
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as string[]).includes(value);
}

export function isPlanStatus(value: unknown): value is PlanStatus {
  return typeof value === "string" && (PLAN_STATUSES as string[]).includes(value);
}

/** The plan an account can use right now, or null when it has none (or it has lapsed). */
export function effectivePlan(account: { plan: string | null; plan_status: string | null }): PlanId | null {
  if (!isPlanId(account.plan)) return null;
  // Stripe keeps retrying a failed payment for a while, so an overdue account keeps working meanwhile.
  return account.plan_status === "active" || account.plan_status === "comped" || account.plan_status === "past_due"
    ? account.plan
    : null;
}

export function limitsFor(plan: PlanId | null): PlanLimits | null {
  return plan ? PLAN_LIMITS[plan] : null;
}

export interface PricingTier {
  id: PlanId | "pay-per-hire";
  name: string;
  price: string;
  per: string;
  blurb: string;
  features: string[];
  /** Shown muted under the features, so it is clear what a plan leaves out. */
  notIncluded?: string[];
  /** "checkout" = pay by card online; "contact" = the enquiry form. */
  action: "checkout" | "contact";
  /** A factual label that also draws the card in the dark style. Never a sales claim such as "most popular". */
  highlight?: string;
}

/** Search opted-in candidates and ask to contact them: every plan but Lite. */
const SEARCH_FEATURE = "Search people who asked to be found and ask to talk to them";

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "lite",
    name: "Lite",
    price: "£49",
    per: "a month",
    blurb: "For one job at a time.",
    features: ["1 live job listing", "Your applicants, with a skills match for each", "Views and applications for your job"],
    notIncluded: ["No matched candidates or candidate search", "No recruiter shortlist, skills-gap report or company page"],
    action: "checkout",
  },
  {
    id: "starter",
    name: "Starter",
    price: "£199",
    per: "a month",
    blurb: "For a small team hiring now and then.",
    features: ["3 live job listings", "Up to 10 matched candidates shown per role", SEARCH_FEATURE, "Basic analytics: views and applications"],
    notIncluded: ["No recruiter shortlist (on Growth and Enterprise)"],
    action: "checkout",
  },
  {
    id: "growth",
    name: "Growth",
    price: "£499",
    per: "a month",
    blurb: "For teams hiring every month.",
    features: [
      "10 live job listings",
      "Up to 30 matched candidates shown per role",
      SEARCH_FEATURE,
      SHORTLIST_FEATURE,
      "Skills-gap report for every role",
      "Your own company page",
      "Priority email support",
    ],
    action: "checkout",
    highlight: "Recruiter shortlists included",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "£999+",
    per: "a month",
    blurb: "For larger hiring programmes.",
    features: ["Unlimited listings", "Unlimited matched candidates", SEARCH_FEATURE, SHORTLIST_FEATURE, "Bulk posting, handled for you", "A named account manager"],
    action: "contact",
  },
  {
    id: "pay-per-hire",
    name: "Pay per hire",
    price: "£500 to £1,500",
    per: "per hire",
    blurb: "For employers who hire occasionally. You pay when someone starts.",
    features: ["No monthly fee", "Fee agreed with you before we start", "Talk to us to set it up"],
    action: "contact",
  },
];

/** Included on every paid plan (all of it is built). Candidate search is not on Lite, so it is listed per plan. */
export const EVERY_PLAN = [
  "Every job checked by a person before it goes live",
  "Applicants in your dashboard and your inbox",
  "Move each applicant from new to interview, offer and hired",
  "Listings run for 30 days and can be renewed",
];

/** The line on the pricing pages for Flintstone Associates clients. There is no public partner price. */
export const PARTNER_LINE = "Flintstone Associates clients: ask about partner rates.";

/** What the enquiry form offers under "Interested in" (the server accepts only these). */
export const ENQUIRY_INTERESTS = ["Enterprise", "Pay per hire", "Lite", "Starter", "Growth", "Partner rates", "Something else"];

/** "£49" or "£149.50" from pence. */
export function formatPence(pence: number): string {
  const pounds = pence / 100;
  return Number.isInteger(pounds)
    ? `£${pounds.toLocaleString("en-GB")}`
    : `£${pounds.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** A partner rate set by admin (migration 010): a monthly price, in pence, for one self-serve plan. */
export interface PartnerRate {
  plan: SelfServePlan;
  pence: number;
}

type PartnerFields = { partner_plan?: string | null; partner_price_pence?: number | null };

/** The account's partner rate, if admin has set one (the columns are absent before migration 010). */
export function partnerRate(account: PartnerFields): PartnerRate | null {
  const pence = account.partner_price_pence;
  if (!isSelfServePlan(account.partner_plan) || typeof pence !== "number" || !Number.isInteger(pence) || pence < 100) return null;
  return { plan: account.partner_plan, pence };
}

/** The monthly price this account pays by card for a plan: its partner rate for that plan, or the standard price. */
export function monthlyPriceFor(account: PartnerFields, plan: SelfServePlan): { pence: number; partner: boolean } {
  const rate = partnerRate(account);
  if (rate && rate.plan === plan) return { pence: rate.pence, partner: true };
  return { pence: SELF_SERVE_PRICES[plan], partner: false };
}
