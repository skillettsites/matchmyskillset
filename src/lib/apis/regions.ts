// UK regions and nations offered on /discover. The choice pre-fills the
// location on job searches; vacancy counts on results pages are UK-wide
// because the job boards do not treat these names consistently (checked on
// Reed on 28 September 2026: "East of England" returned Portsmouth jobs).
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
