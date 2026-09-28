import { formatGBP, formatGBPChange } from "@/components/content";
import { ftMedian } from "./routes";

/** "£47,632" for a SOC unit group's ONS full-time median. Throws if ONS suppressed it, so copy never prints a gap. */
export function gbpFt(soc: string): string {
  const v = ftMedian(soc);
  if (v === null) throw new Error(`ONS full-time median suppressed for ${soc}; do not quote it`);
  return formatGBP(v);
}

/** Signed difference between two ONS full-time medians, e.g. "+£12,202". */
export function gbpDiff(toSoc: string, fromSoc: string): string {
  const a = ftMedian(toSoc);
  const b = ftMedian(fromSoc);
  if (a === null || b === null) throw new Error(`Cannot compare ${toSoc} with ${fromSoc}: a median is suppressed`);
  return formatGBPChange(a - b);
}

const WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** Small counts as words for the start of a sentence: 3 becomes "Three". Larger numbers stay as digits. */
export function countWord(n: number, capitalise = true): string {
  const w = n >= 0 && n <= 10 ? WORDS[n] : String(n);
  return capitalise ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}
