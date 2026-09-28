/**
 * Server-side helpers that turn a hub's editorial route list into data the
 * hub components can render. Every figure comes from `@/data/careers`
 * (ONS ASHE 2025, Skills England standards, licence bodies, NCS profiles).
 * Nothing here estimates or fills a missing figure: a suppressed ONS median
 * stays `null` and the page says so.
 */
import {
  ASHE_NATIONAL,
  getAsheUnitGroup,
  getCareerProfile,
  SOURCE,
  type ApprenticeshipStandard,
  type Licence,
} from "@/data/careers";
import ncsRaw from "@/data/careers/sources/ncs-profiles.json";

interface NcsProfileLite {
  ok: boolean;
  restrictions?: string[];
}
const NCS = (ncsRaw as unknown as { profiles: Record<string, NcsProfileLite> }).profiles;

/** One destination as a hub editor writes it. */
export interface RouteSpec {
  /** Curated occupation id in `src/data/careers/occupations.ts`. */
  id: string;
  /** Why this profession's skills carry over. Specific, in plain words. */
  why: string;
  /** Extra, profession-specific note on the way in (sourced where it states a fact). */
  note?: string;
  /** Slug on AICareerSwap's "will AI replace" pages. Only set when the URL was checked. */
  aiSlug?: string;
  /** Search term for /jobs. Defaults to the occupation title. */
  jobsQuery?: string;
  /** Anchor id for the card. Defaults to `route-<id>`. */
  anchor?: string;
}

/** Which ONS figure a route shows. */
export type PayBasis = "ft" | "all" | null;

export interface ResolvedRoute {
  spec: RouteSpec;
  id: string;
  anchor: string;
  title: string;
  soc: string;
  socTitle: string;
  /** Median shown on the page, in pounds, or null when ONS published none. */
  median: number | null;
  /** `ft` full-time median, `all` all-employee median (full-time suppressed), or null. */
  basis: PayBasis;
  /** Full-time median only (used for like-for-like pay change). */
  ftMedian: number | null;
  payScope: string;
  payNote?: string;
  degreeUsuallyRequired: boolean;
  apprenticeships: ApprenticeshipStandard[];
  licences: Licence[];
  qualifications: string[];
  ncsUrl: string | null;
  /** Checks and restrictions listed on the National Careers Service profile, as worded there. */
  checks: string[];
  jobsHref: string;
  aiHref: string | null;
}

export const AICAREERSWAP_BASE = "https://aicareerswap.com/will-ai-replace/";

export function resolveRoute(spec: RouteSpec): ResolvedRoute {
  const p = getCareerProfile(spec.id);
  if (!p) throw new Error(`Unknown career occupation id: ${spec.id}`);
  const ft = p.pay.ft.median;
  const all = p.pay.all.median;
  const basis: PayBasis = ft !== null ? "ft" : all !== null ? "all" : null;
  const median = basis === "ft" ? ft : basis === "all" ? all : null;
  const title = p.occupation.title;
  return {
    spec,
    id: spec.id,
    anchor: spec.anchor ?? `route-${spec.id}`,
    title,
    soc: p.unitGroup.code,
    socTitle: p.unitGroup.title,
    median,
    basis,
    ftMedian: ft,
    payScope: p.payScope,
    payNote: p.payNote,
    degreeUsuallyRequired: p.occupation.degreeUsuallyRequired,
    apprenticeships: p.apprenticeships,
    licences: p.licences,
    qualifications: p.occupation.qualifications,
    ncsUrl: p.ncsUrl,
    checks: p.occupation.ncsProfile ? (NCS[p.occupation.ncsProfile]?.restrictions ?? []) : [],
    jobsHref: `/jobs?q=${encodeURIComponent(spec.jobsQuery ?? title)}`,
    aiHref: spec.aiSlug ? `${AICAREERSWAP_BASE}${spec.aiSlug}` : null,
  };
}

export function resolveRoutes(specs: RouteSpec[]): ResolvedRoute[] {
  return specs.map(resolveRoute);
}

/** ONS full-time median for any SOC 2020 unit group, or null if suppressed. */
export function ftMedian(soc: string): number | null {
  return getAsheUnitGroup(soc)?.ft.median ?? null;
}

/** ONS all-employee median for any SOC 2020 unit group, or null if suppressed. */
export function allMedian(soc: string): number | null {
  return getAsheUnitGroup(soc)?.all.median ?? null;
}

/** Official SOC 2020 title for a unit group. */
export function socTitle(soc: string): string {
  const u = getAsheUnitGroup(soc);
  if (!u) throw new Error(`Unknown SOC code: ${soc}`);
  return u.title;
}

/** The UK full-time median for all employee jobs in ASHE 2025. */
export function ukFullTimeMedian(): number {
  const v = ASHE_NATIONAL.ft.median;
  if (v === null) throw new Error("ONS national full-time median missing");
  return v;
}

/** Details used by every hub's citation lines. */
export const ASHE = {
  name: `ONS, Annual Survey of Hours and Earnings ${SOURCE.year} (${SOURCE.edition}), Table ${SOURCE.table}`,
  short: `ONS ASHE ${SOURCE.year}, Table ${SOURCE.table}`,
  href: SOURCE.datasetUrl,
  published: SOURCE.releaseDate,
  year: SOURCE.year,
  period: SOURCE.annualReferencePeriod,
  correction: SOURCE.correction,
};

/** Plain-text summary of an apprenticeship standard, e.g. "Data analyst, level 4, typically 24 months". */
export function standardText(s: ApprenticeshipStandard): string {
  return `${s.title}, level ${s.level}, typically ${s.typicalDurationMonths} months`;
}

/** Shortest-duration standard in a route, used for the summary table. */
export function quickestStandard(r: ResolvedRoute): ApprenticeshipStandard | undefined {
  return [...r.apprenticeships].sort((a, b) => a.level - b.level || a.typicalDurationMonths - b.typicalDurationMonths)[0];
}
