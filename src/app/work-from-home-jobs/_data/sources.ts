// Figures and rules from primary sources, checked on 28 September 2026, for the
// home working, freelance, side hustle and work-life balance guides:
//   /work-from-home-jobs, /jobs-you-can-do-from-home-with-no-experience,
//   /highest-paying-remote-jobs-uk, /freelance-careers-uk, /best-side-hustles-uk,
//   /best-jobs-for-work-life-balance
// Every value below was read from the linked page or file on that date. Change a
// value only after re-checking the source, and update CHECKED when you do.
// Pay figures do not live here: they come from the ONS ASHE dataset via
// src/components/guides/pay.tsx.

export const CHECKED = "2026-09-28";

export interface OpnRow {
  /** Share of working adults who worked from home and did not travel to work in the past 7 days. */
  homeOnly: number;
  /** Worked from home and also travelled to work (hybrid). */
  hybrid: number;
  /** Travelled to work and did not work from home. */
  travelOnly: number;
  /** Neither (for example on leave or sick). */
  neither: number;
}

/**
 * ONS Opinions and Lifestyle Survey, working arrangements by personal
 * characteristics, 1 April to 28 June 2026 (Table 2, "Location of work").
 * Great Britain, adults who said they were working. Percentages, rounded by ONS.
 */
export const OPN_2026 = {
  source: "ONS, Public opinions and social trends, Great Britain: working arrangements by personal characteristics, 1 April to 28 June 2026",
  href: "https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/healthandwellbeing/datasets/publicopinionsandsocialtrendsgreatbritainworkingarrangementsbypersonalcharacteristics",
  published: "2026-07-17",
  period: "April to June 2026",
  note: "Great Britain, adults who were working, asked about the previous seven days. Survey estimates with a margin of error; ONS notes that occupation is self-reported.",
  all: { homeOnly: 14, hybrid: 26, travelOnly: 42, neither: 18 } satisfies OpnRow,
  /** By SOC 2020 major group; `code` is the ONS major group code. */
  byOccupation: [
    { code: "1", label: "Managers, directors and senior officials", homeOnly: 19, hybrid: 41, travelOnly: 30, neither: 9 },
    { code: "2", label: "Professional occupations", homeOnly: 18, hybrid: 41, travelOnly: 30, neither: 11 },
    { code: "3", label: "Associate professional occupations", homeOnly: 21, hybrid: 35, travelOnly: 35, neither: 10 },
    { code: "4", label: "Administrative and secretarial occupations", homeOnly: 19, hybrid: 35, travelOnly: 39, neither: 8 },
    { code: "5", label: "Skilled trades occupations", homeOnly: 8, hybrid: 8, travelOnly: 72, neither: 12 },
    { code: "6", label: "Caring, leisure and other service occupations", homeOnly: 4, hybrid: 9, travelOnly: 62, neither: 24 },
    { code: "7", label: "Sales and customer service occupations", homeOnly: 8, hybrid: 7, travelOnly: 69, neither: 16 },
    { code: "8", label: "Process, plant and machine operatives", homeOnly: 2, hybrid: 3, travelOnly: 81, neither: 14 },
    { code: "9", label: "Elementary occupations", homeOnly: 2, hybrid: 1, travelOnly: 78, neither: 19 },
  ] as (OpnRow & { code: string; label: string })[],
  employed: { homeOnly: 12, hybrid: 28, travelOnly: 47, neither: 12 } satisfies OpnRow,
  selfEmployed: { homeOnly: 35, hybrid: 23, travelOnly: 31, neither: 11 } satisfies OpnRow,
  parents: { homeOnly: 17, hybrid: 29, travelOnly: 36, neither: 18 } satisfies OpnRow,
  nonParents: { homeOnly: 12, hybrid: 25, travelOnly: 44, neither: 19 } satisfies OpnRow,
  degree: { homeOnly: 16, hybrid: 40, travelOnly: 29, neither: 15 } satisfies OpnRow,
  noQualifications: { homeOnly: 9, hybrid: 5, travelOnly: 62, neither: 24 } satisfies OpnRow,
};

/** ONS article "Who has access to hybrid work in Great Britain?" (data 8 January to 30 March 2025). */
export const ONS_HYBRID_2025 = {
  source: "ONS, Who has access to hybrid work in Great Britain?",
  href: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/articles/whohasaccesstohybridworkingreatbritain/2025-06-11",
  published: "2025-06-11",
  period: "January to March 2025",
  /** Share of workers earning £50,000 or more who hybrid worked. */
  income50kPlus: 45,
  /** Share of workers earning under £20,000 who hybrid worked. */
  incomeUnder20k: 8,
};

/** ONS article "Who are the hybrid workers?" (data 10 April to 30 June 2024). */
export const ONS_HYBRID_2024 = {
  source: "ONS, Who are the hybrid workers?",
  href: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/articles/whoarethehybridworkers/2024-11-11",
  published: "2024-11-11",
  period: "April to June 2024",
  parents: 35,
  nonParents: 24,
  fathers: 41,
  mothers: 30,
  /** Average minutes saved on the day by not commuting (ONS Time Use Survey, March 2024). */
  commuteMinutesSaved: 56,
};

/** ONS Labour Force Survey, self-employed, UK, 16 and over, seasonally adjusted (series MGRQ). */
export const ONS_SELF_EMPLOYED = {
  source: "ONS, Labour Force Survey: self-employed, UK, seasonally adjusted (series MGRQ)",
  href: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/timeseries/mgrq/lms",
  published: "2026-09-15",
  period: "May to July 2026",
  thousands: 4531,
};

/** HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025. */
export const HSE_STRESS_2025 = {
  source: "HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025",
  href: "https://www.hse.gov.uk/Statistics/assets/docs/stress.pdf",
  published: "2025-11-20",
  workers2425: 964000,
  daysLost2425Millions: 22.1,
  /** Cases per 100,000 workers, average over 2022/23 to 2024/25. */
  allIndustriesRate: 2040,
  publicAdminRate: 3470,
  healthSocialWorkRate: 2830,
  educationRate: 2620,
  professionalRate: 2730,
  associateProfessionalRate: 3020,
};

/** GOV.UK pages used across the guides. */
export const GOV = {
  flexibleWorking: "https://www.gov.uk/flexible-working",
  flexibleWorkingApply: "https://www.gov.uk/flexible-working/applying-for-flexible-working",
  flexibleWorkingAfter: "https://www.gov.uk/flexible-working/after-the-application",
  tradingAllowance: "https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income",
  registerSelfAssessment: "https://www.gov.uk/register-for-self-assessment",
  checkAdditionalIncome: "https://www.gov.uk/check-additional-income-tax",
  workingForYourself: "https://www.gov.uk/working-for-yourself",
  soleTrader: "https://www.gov.uk/become-sole-trader",
  platformSellers: "https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform",
  platformOperators: "https://www.gov.uk/guidance/check-if-you-need-to-register-as-a-digital-platform-operator",
  offPayroll: "https://www.gov.uk/guidance/understanding-off-payroll-working-ir35",
  cest: "https://www.gov.uk/guidance/check-employment-status-for-tax",
  selfEmployedNi: "https://www.gov.uk/self-employed-national-insurance-rates",
  incomeTaxRates: "https://www.gov.uk/income-tax-rates",
  paymentsOnAccount: "https://www.gov.uk/understand-self-assessment-bill/payments-on-account",
  makingTaxDigital: "https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax",
  rentARoom: "https://www.gov.uk/rent-room-in-your-home/the-rent-a-room-scheme",
  wfhTaxRelief: "https://www.gov.uk/tax-relief-for-employees/working-at-home",
  minimumWage: "https://www.gov.uk/national-minimum-wage-rates",
  agencyFees: "https://www.gov.uk/agency-workers-your-rights/fees",
  reportScams: "https://www.gov.uk/report-suspicious-emails-websites-phishing",
  jobScamSigns: "https://www.gov.uk/government/news/new-year-jobseekers-urged-to-watch-out-for-7-signs-of-job-scams",
  findAJob: "https://www.gov.uk/find-a-job",
  companiesHouse: "https://find-and-update.company-information.service.gov.uk/",
  maxHours: "https://www.gov.uk/maximum-weekly-working-hours",
  holiday: "https://www.gov.uk/holiday-entitlement-rights",
  parentalLeave: "https://www.gov.uk/parental-leave",
  parentalLeaveEntitlement: "https://www.gov.uk/parental-leave/entitlement",
  dependants: "https://www.gov.uk/time-off-for-dependants",
  carersLeave: "https://www.gov.uk/carers-leave",
  taxFreeChildcare: "https://www.gov.uk/tax-free-childcare",
};

/** National Crime Agency page on money mules. */
export const NCA_MONEY_MULES = "https://www.nationalcrimeagency.gov.uk/moneymuling";

/** HSE guidance for employers of home and hybrid workers. */
export const HSE_HOME_WORKERS = "https://www.hse.gov.uk/home-working/employer/index.htm";
