// Single place to change when ONS publishes a new ASHE edition.
//
// To move to ASHE 2026 (ONS release scheduled for 22 October 2026, 9:30am):
//   1. set ASHE_YEAR = 2026 and ASHE_EDITION = "provisional"
//   2. add a 2026-provisional entry to EDITIONS below with the release date
//      printed on the ONS dataset page (check it, do not assume it)
//   3. run: node scripts/ashe/build.mjs && node scripts/ashe/validate.mjs
// The same release also carries 2025 revised figures; to use those instead,
// set ASHE_YEAR = 2025 and ASHE_EDITION = "revised".

export const ASHE_YEAR = 2025;
export const ASHE_EDITION = "provisional"; // "provisional" | "revised"

// ONS dataset landing page for ASHE Table 14 (occupation by four-digit SOC).
// The URL still says "soc2010" for historical reasons; editions from 2021
// onwards are coded to SOC 2020 (the files are titled "Occupation SOC20 (4)").
export const DATASET_PAGE =
  "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14";

// Fallback file URL pattern. The build script first looks for the link on the
// landing page and only uses this if the page cannot be parsed.
export function editionZipUrl(year, edition) {
  return `https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14/${year}${edition}/ashetable14${year}${edition}.zip`;
}

// Hand-checked facts about each edition, recorded from the ONS page.
export const EDITIONS = {
  "2025-provisional": {
    releaseDate: "2025-10-23",
    correction: {
      date: "2025-12-19",
      note:
        "ONS correction notice of 19 December 2025: annual earnings estimates for occupation 3312 (Police officers, sergeant and below), and the groups 331 and 33 that contain it, were suppressed for London, the South East, East and the UK because of an error in returns received. ONS says they will be reviewed for the revised 2025 dataset. The files in the zip are the corrected versions (file timestamps 19 December 2025).",
    },
  },
};

// SOC 2020 Volume 1 (structure and descriptions of unit groups), ONS.
// Used for official unit group titles, ONS entry-route text and related job titles.
export const SOC_VOLUME1_PAGE =
  "https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020/soc2020volume1structureanddescriptionsofunitgroups";
// ONS sometimes reissues a file with a "v2" suffix on the same date, so allow one.
export const SOC_VOLUME1_FILE_PATTERN = /soc2020volume1structureanddescriptionofunitgroupsexcel(\d{8})(?:v\d+)?\.xlsx/;

export const LICENCE = {
  name: "Open Government Licence v3.0",
  url: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
};

// Tables taken from the Table 14 zip.
export const TABLES = {
  estimates: { id: "14.7a", pattern: /Table 14\.7a\s+Annual pay - Gross/i },
  cv: { id: "14.7b", pattern: /Table 14\.7b\s+Annual pay - Gross.*CV/i },
};

// Worksheets used from each table ("All" = all employee jobs).
export const SHEETS = { ft: "Full-Time", all: "All" };

// Column layout of Table 14.7a / 14.7b (header row 5 of each data sheet).
// Checked by the build script against the header text before parsing.
export const COLUMNS = [
  { key: "description", col: "A", header: "Description" },
  { key: "code", col: "B", header: "Code" },
  { key: "jobsThousands", col: "C", header: "(thousand)" },
  { key: "median", col: "D", header: "Median" },
  { key: "medianChangePct", col: "E", header: "change" },
  { key: "mean", col: "F", header: "Mean" },
  { key: "meanChangePct", col: "G", header: "change" },
  { key: "p10", col: "H", header: 10 },
  { key: "p20", col: "I", header: 20 },
  { key: "p25", col: "J", header: 25 },
  { key: "p30", col: "K", header: 30 },
  { key: "p40", col: "L", header: 40 },
  { key: "p60", col: "M", header: 60 },
  { key: "p70", col: "N", header: 70 },
  { key: "p75", col: "O", header: 75 },
  { key: "p80", col: "P", header: 80 },
  { key: "p90", col: "Q", header: 90 },
];
export const HEADER_ROW = 5;
