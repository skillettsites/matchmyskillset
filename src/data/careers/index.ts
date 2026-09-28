// Entry point for the careers dataset. Joins a curated occupation with its ONS pay,
// ONS SOC 2020 entry text, Skills England apprenticeship details and licence details.
// Server-side use only (it pulls in the ASHE and SOC JSON). See README.md.

import standardsRaw from "./sources/apprenticeship-standards.json";
import { getCareerOccupation, type CareerOccupation } from "./occupations";
import { getAsheUnitGroup, SOURCE, sourceLine, type AsheFigures } from "./ashe";
import { getSocUnitGroup, SOC_SOURCE } from "./soc2020";
import { LICENCES, type Licence } from "./licences";

export * from "./occupations";
export * from "./ashe";
export * from "./soc2020";
export * from "./licences";

export interface ApprenticeshipStandard {
  referenceNumber: string;
  title: string;
  level: number;
  /** The API's typicalDuration field, in months. */
  typicalDurationMonths: number;
  status: string;
  version: string;
  route: string;
  larsCode: number | string;
  /** Funding band maximum in pounds. */
  maxFunding: number | null;
  approvedForDelivery: string | null;
  typicalJobTitles: string[];
  url: string;
}

interface StandardsSnapshot {
  source: {
    publisher: string;
    api: string;
    retrievedAt: string;
    licence: { name: string; url: string };
    note: string;
  };
  standards: Record<string, ApprenticeshipStandard>;
}

const STANDARDS = standardsRaw as unknown as StandardsSnapshot;

export const APPRENTICESHIP_SOURCE = STANDARDS.source;

export function getApprenticeshipStandard(ref: string): ApprenticeshipStandard | undefined {
  return STANDARDS.standards[ref];
}

export const NCS_PROFILE_BASE = "https://nationalcareers.service.gov.uk/job-profiles/";

/** URL as it resolved on 28 September 2026 (the service is renamed on 1 October 2026). */
export function ncsProfileUrl(slug: string): string {
  return NCS_PROFILE_BASE + slug;
}

export interface CareerProfile {
  occupation: CareerOccupation;
  unitGroup: {
    code: string;
    title: string;
    /** ONS SOC 2020 Volume 1 text; show SOC_SOURCE.attribution when quoting it. */
    onsEntryRoutes: string;
  };
  pay: { ft: AsheFigures; all: AsheFigures };
  /** Sentence to print near any pay figure. */
  payScope: string;
  payNote?: string;
  sourceLine: string;
  apprenticeships: ApprenticeshipStandard[];
  licences: Licence[];
  ncsUrl: string | null;
}

export function getCareerProfile(id: string): CareerProfile | undefined {
  const occupation = getCareerOccupation(id);
  if (!occupation) return undefined;
  const ashe = getAsheUnitGroup(occupation.soc);
  const soc = getSocUnitGroup(occupation.soc);
  if (!ashe || !soc) return undefined;
  return {
    occupation,
    unitGroup: { code: occupation.soc, title: soc.title, onsEntryRoutes: soc.entryRoutes },
    pay: { ft: ashe.ft, all: ashe.all },
    payScope: `Pay is for the ONS SOC 2020 unit group ${occupation.soc} "${soc.title}", which covers every job ONS codes to it, not only ${occupation.title.toLowerCase()} roles.`,
    payNote: occupation.payNote,
    sourceLine: sourceLine(),
    apprenticeships: occupation.apprenticeships
      .map((ref) => getApprenticeshipStandard(ref))
      .filter((s): s is ApprenticeshipStandard => Boolean(s)),
    licences: occupation.licences.map((l) => LICENCES[l]),
    ncsUrl: occupation.ncsProfile ? ncsProfileUrl(occupation.ncsProfile) : null,
  };
}

/** Every source behind the dataset, for a page footer or a "sources" page. */
export const CAREER_DATA_SOURCES = {
  ashe: SOURCE,
  soc2020: SOC_SOURCE,
  apprenticeships: APPRENTICESHIP_SOURCE,
};
