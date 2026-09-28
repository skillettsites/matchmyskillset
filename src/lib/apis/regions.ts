// UK regions and nations offered on /discover. The choice pre-fills the
// location on job searches. On /jobs a region is searched as a region: boards
// that can filter by it are asked for it, their results are checked against
// it, and boards that cannot be filtered reliably are left out (see
// src/lib/apis/jobs). Vacancy counts on results pages stay UK-wide.
export const UK_REGIONS = [
  "London",
  "South East",
  "East of England",
  "South West",
  "West Midlands",
  "East Midlands",
  "Yorkshire and the Humber",
  "North West",
  "North East",
  "Wales",
  "Scotland",
  "Northern Ireland",
] as const;

export type UkRegion = (typeof UK_REGIONS)[number];

/** The three nations outside England. GOV.UK Teaching Vacancies covers England only. */
export const UK_NATIONS: readonly UkRegion[] = ["Wales", "Scotland", "Northern Ireland"];

/**
 * Adzuna's name for each region: the second level (location1) of its UK
 * location tree. Each was checked on 28 September 2026 by searching with
 * location0=UK and location1=<name> and reading `location.area` on the results.
 */
export const ADZUNA_REGION: Record<UkRegion, string> = {
  London: "London",
  "South East": "South East England",
  "East of England": "Eastern England",
  "South West": "South West England",
  "West Midlands": "West Midlands",
  "East Midlands": "East Midlands",
  "Yorkshire and the Humber": "Yorkshire And The Humber",
  "North West": "North West England",
  "North East": "North East England",
  Wales: "Wales",
  Scotland: "Scotland",
  "Northern Ireland": "Northern Ireland",
};

function clean(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(region\)/g, " ")
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^the /, "");
}

const BY_NAME = new Map<string, UkRegion>();
for (const r of UK_REGIONS) {
  BY_NAME.set(clean(r), r);
  BY_NAME.set(clean(ADZUNA_REGION[r]), r);
  BY_NAME.set(`${clean(r)} region`, r);
}

/** A region named exactly, in any of the forms above ("South West", "south west england", "West Midlands (Region)"). */
export function regionByName(value: string | null | undefined): UkRegion | null {
  if (!value) return null;
  return BY_NAME.get(clean(value)) ?? null;
}

/**
 * The region a job search location stands for, or null when it is a place.
 * London is searched as a city (every board understands it), so it is not
 * treated as a region here.
 */
export function regionFromLocation(location: string | null | undefined): UkRegion | null {
  const region = regionByName(location);
  return region && region !== "London" ? region : null;
}
