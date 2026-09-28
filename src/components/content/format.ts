/**
 * Formatting helpers shared by the content components. UK conventions:
 * pounds sterling, en-GB grouping, dates as "23 October 2025".
 */

/** Pay periods a salary can be quoted in. */
export type PayPeriod = "year" | "month" | "week" | "hour";

const PERIOD_TEXT: Record<PayPeriod, string> = {
  year: "a year",
  month: "a month",
  week: "a week",
  hour: "an hour",
};

/** Human text for a pay period, e.g. "a year". */
export function periodText(period: PayPeriod): string {
  return PERIOD_TEXT[period];
}

/** True when `value` is a usable finite number. */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Format pounds, e.g. 34500 -> "£34,500". Hourly figures keep pence
 * (12.21 -> "£12.21"); everything else is rounded to whole pounds.
 */
export function formatGBP(value: number, period: PayPeriod = "year"): string {
  const pence = period === "hour";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pence ? 2 : 0,
    maximumFractionDigits: pence ? 2 : 0,
  }).format(value);
}

/**
 * Format a pay difference with an explicit sign, e.g. 3200 -> "+£3,200",
 * -1500 -> "−£1,500" (true minus sign). Zero returns "£0".
 */
export function formatGBPChange(delta: number, period: PayPeriod = "year"): string {
  const abs = formatGBP(Math.abs(delta), period);
  if (delta > 0) return `+${abs}`;
  if (delta < 0) return `−${abs}`;
  return abs;
}

/** Plain number with en-GB grouping, e.g. 12400 -> "12,400". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

/**
 * Format an ISO date ("2025-10-23") as "23 October 2025". Anything that is
 * not a parseable date is returned unchanged, so "October 2025" also works.
 */
export function formatDate(value: string): string {
  if (!/^\d{4}-\d{2}(-\d{2})?/.test(value)) return value;
  const d = new Date(value.length === 7 ? `${value}-01` : value);
  if (Number.isNaN(d.getTime())) return value;
  const opts: Intl.DateTimeFormatOptions =
    value.length === 7
      ? { month: "long", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
  return new Intl.DateTimeFormat("en-GB", opts).format(d);
}

/** A machine-readable value for `<time dateTime>`, or undefined. */
export function isoDate(value: string): string | undefined {
  return /^\d{4}-\d{2}(-\d{2})?/.test(value) ? value.slice(0, 10) : undefined;
}

/** "6 months", "6 to 12 months", "1 month". */
export function formatMonths(value: number | readonly [number, number]): string {
  if (typeof value === "number") return `${value} ${value === 1 ? "month" : "months"}`;
  const [min, max] = value;
  if (min === max) return formatMonths(min);
  return `${min} to ${max} months`;
}
