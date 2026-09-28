// HSE, "Self-reported work-related illness by occupation (LFSILLOCC)", Table 5:
// prevalence of self-reported work-related stress, depression or anxiety per
// 100,000 workers, Great Britain. Published 20 November 2025 (next update
// November 2026). Source: Labour Force Survey. Values copied exactly from
// https://www.hse.gov.uk/statistics/assets/docs/lfsillocc.xlsx (downloaded
// 28 September 2026). Groups HSE could not estimate reliably ([U1]) are left out.
// "vsAll" is the HSE significance test against the all-occupations rate.
// lowSample marks estimates HSE flags as based on 20 to 29 sample cases.

export interface HseRate {
  soc: string;
  title: string;
  rate: number;
  ciLow: number;
  ciHigh: number;
  vsAll: "higher" | "lower" | "no";
  lowSample?: boolean;
}

export const HSE_TABLE_URL = "https://www.hse.gov.uk/statistics/assets/docs/lfsillocc.xlsx";
export const HSE_REPORT_URL = "https://www.hse.gov.uk/Statistics/assets/docs/stress.pdf";
export const HSE_PUBLISHED = "2025-11-20";

/** Three-year average, 2022/23 to 2024/25. */
export const ALL_3YR = { rate: 2040, ciLow: 1900, ciHigh: 2180 };
/** Five-year average, 2020/21 to 2024/25. */
export const ALL_5YR = { rate: 2080, ciLow: 1980, ciHigh: 2180 };

/** SOC 2020 major groups, 2022/23 to 2024/25. */
export const MAJOR_3YR: HseRate[] = [
  { soc: "1", title: "Managers, directors and senior officials", rate: 1640, ciLow: 1330, ciHigh: 1960, vsAll: "lower" },
  { soc: "2", title: "Professional occupations", rate: 2730, ciLow: 2430, ciHigh: 3030, vsAll: "higher" },
  { soc: "3", title: "Associate professional occupations", rate: 3020, ciLow: 2560, ciHigh: 3490, vsAll: "higher" },
  { soc: "4", title: "Administrative and secretarial occupations", rate: 2220, ciLow: 1740, ciHigh: 2700, vsAll: "no" },
  { soc: "5", title: "Skilled trades occupations", rate: 800, ciLow: 500, ciHigh: 1100, vsAll: "lower" },
  { soc: "6", title: "Caring, leisure and other service occupations", rate: 1860, ciLow: 1410, ciHigh: 2320, vsAll: "no" },
  { soc: "7", title: "Sales and customer service occupations", rate: 1550, ciLow: 1130, ciHigh: 1980, vsAll: "lower" },
  { soc: "8", title: "Process, plant and machine operatives", rate: 820, ciLow: 520, ciHigh: 1120, vsAll: "lower" },
  { soc: "9", title: "Elementary occupations", rate: 1210, ciLow: 850, ciHigh: 1580, vsAll: "lower" },
];

/** SOC 2020 sub-major groups with an estimate, 2022/23 to 2024/25. */
export const SUB_MAJOR_3YR: HseRate[] = [
  { soc: "11", title: "Corporate managers and directors", rate: 1710, ciLow: 1310, ciHigh: 2100, vsAll: "no" },
  { soc: "12", title: "Other managers and proprietors", rate: 1500, ciLow: 970, ciHigh: 2030, vsAll: "lower" },
  { soc: "21", title: "Science, research, engineering and technology professionals", rate: 2430, ciLow: 1840, ciHigh: 3030, vsAll: "no" },
  { soc: "22", title: "Health professionals", rate: 3120, ciLow: 2400, ciHigh: 3840, vsAll: "higher" },
  { soc: "23", title: "Teaching and other educational professionals", rate: 3340, ciLow: 2650, ciHigh: 4030, vsAll: "higher" },
  { soc: "24", title: "Business, media and public service professionals", rate: 2430, ciLow: 1950, ciHigh: 2910, vsAll: "no" },
  { soc: "31", title: "Science, engineering and technology associate professionals", rate: 2390, ciLow: 1350, ciHigh: 3430, vsAll: "no", lowSample: true },
  { soc: "32", title: "Health and social care associate professionals", rate: 4290, ciLow: 2900, ciHigh: 5680, vsAll: "higher" },
  { soc: "33", title: "Protective service occupations", rate: 4490, ciLow: 2900, ciHigh: 6080, vsAll: "higher" },
  { soc: "34", title: "Culture, media and sports occupations", rate: 2550, ciLow: 1370, ciHigh: 3740, vsAll: "no", lowSample: true },
  { soc: "35", title: "Business and public service associate professionals", rate: 2700, ciLow: 2030, ciHigh: 3370, vsAll: "higher" },
  { soc: "41", title: "Administrative occupations", rate: 2370, ciLow: 1810, ciHigh: 2920, vsAll: "no" },
  { soc: "61", title: "Caring personal service occupations", rate: 2070, ciLow: 1540, ciHigh: 2610, vsAll: "no" },
  { soc: "71", title: "Sales occupations", rate: 1630, ciLow: 1130, ciHigh: 2140, vsAll: "no" },
  { soc: "82", title: "Transport and mobile machine drivers and operatives", rate: 780, ciLow: 410, ciHigh: 1150, vsAll: "lower", lowSample: true },
  { soc: "92", title: "Elementary administration and service occupations", rate: 1330, ciLow: 920, ciHigh: 1730, vsAll: "lower" },
];

/** SOC 2020 unit groups with an estimate, 2020/21 to 2024/25 (five-year average, pandemic years included). */
export const UNIT_5YR: HseRate[] = [
  { soc: "1121", title: "Production managers and directors in manufacturing", rate: 2200, ciLow: 1240, ciHigh: 3160, vsAll: "no", lowSample: true },
  { soc: "1132", title: "Marketing, sales and advertising directors", rate: 2380, ciLow: 1350, ciHigh: 3410, vsAll: "no", lowSample: true },
  { soc: "1136", title: "Human resource managers and directors", rate: 2770, ciLow: 1590, ciHigh: 3950, vsAll: "no", lowSample: true },
  { soc: "1251", title: "Property, housing and estate managers", rate: 2060, ciLow: 1040, ciHigh: 3080, vsAll: "no", lowSample: true },
  { soc: "2132", title: "IT managers", rate: 2390, ciLow: 1270, ciHigh: 3510, vsAll: "no", lowSample: true },
  { soc: "2134", title: "Programmers and software development professionals", rate: 2840, ciLow: 1800, ciHigh: 3880, vsAll: "no" },
  { soc: "2211", title: "Generalist medical practitioners", rate: 3170, ciLow: 1580, ciHigh: 4750, vsAll: "no", lowSample: true },
  { soc: "2232", title: "Community nurses", rate: 5000, ciLow: 2700, ciHigh: 7310, vsAll: "higher", lowSample: true },
  { soc: "2237", title: "Other nursing professionals", rate: 4830, ciLow: 3230, ciHigh: 6420, vsAll: "higher" },
  { soc: "2311", title: "Higher education teaching professionals", rate: 3530, ciLow: 2220, ciHigh: 4840, vsAll: "higher" },
  { soc: "2313", title: "Secondary education teaching professionals", rate: 4060, ciLow: 2980, ciHigh: 5140, vsAll: "higher" },
  { soc: "2314", title: "Primary education teaching professionals", rate: 3910, ciLow: 2880, ciHigh: 4930, vsAll: "higher" },
  { soc: "2412", title: "Solicitors and lawyers", rate: 3280, ciLow: 1780, ciHigh: 4780, vsAll: "no", lowSample: true },
  { soc: "2421", title: "Chartered and certified accountants", rate: 2930, ciLow: 1590, ciHigh: 4280, vsAll: "no", lowSample: true },
  { soc: "2440", title: "Business and financial project management professionals", rate: 2400, ciLow: 1400, ciHigh: 3410, vsAll: "no", lowSample: true },
  { soc: "2461", title: "Social workers", rate: 5750, ciLow: 3570, ciHigh: 7940, vsAll: "higher" },
  { soc: "3229", title: "Welfare and housing associate professionals n.e.c.", rate: 6670, ciLow: 3500, ciHigh: 9850, vsAll: "higher", lowSample: true },
  { soc: "3312", title: "Police officers (sergeant and below)", rate: 7450, ciLow: 5040, ciHigh: 9860, vsAll: "higher" },
  { soc: "3556", title: "Sales accounts and business development managers", rate: 1790, ciLow: 960, ciHigh: 2610, vsAll: "no", lowSample: true },
  { soc: "4111", title: "National government administrative occupations", rate: 2570, ciLow: 1360, ciHigh: 3790, vsAll: "no", lowSample: true },
  { soc: "4122", title: "Book-keepers, payroll managers and wages clerks", rate: 1300, ciLow: 760, ciHigh: 1850, vsAll: "lower", lowSample: true },
  { soc: "4129", title: "Financial administrative occupations n.e.c.", rate: 2700, ciLow: 1360, ciHigh: 4040, vsAll: "no", lowSample: true },
  { soc: "4159", title: "Other administrative occupations n.e.c.", rate: 3020, ciLow: 1890, ciHigh: 4140, vsAll: "no" },
  { soc: "6131", title: "Nursing auxiliaries and assistants", rate: 2200, ciLow: 1240, ciHigh: 3160, vsAll: "no", lowSample: true },
  { soc: "6135", title: "Care workers and home carers", rate: 2530, ciLow: 1850, ciHigh: 3210, vsAll: "no" },
  { soc: "7111", title: "Sales and retail assistants", rate: 1530, ciLow: 1040, ciHigh: 2010, vsAll: "lower" },
  { soc: "7219", title: "Customer service occupations n.e.c.", rate: 2610, ciLow: 1570, ciHigh: 3640, vsAll: "no", lowSample: true },
];
