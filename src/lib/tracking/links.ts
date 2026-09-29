// Links in tracking emails and pages. Server code only (signing needs the key).

import { signCheckin } from "./sign";
import type { CheckinAnswer } from "./constants";

export function trackerUrl(base: string, token: string): string {
  return `${base}/tracker/${encodeURIComponent(token)}`;
}

/** Opens the confirm page for one answer; nothing is recorded until the person presses the button. */
export function checkinUrl(base: string, trackedId: string, answer: CheckinAnswer): string {
  return `${base}/checkin?c=${encodeURIComponent(signCheckin(trackedId, answer))}`;
}

/** One-click List-Unsubscribe target: a POST stops every check-in to the address; a GET shows the confirm page. */
export function unsubscribeUrl(base: string, trackedId: string): string {
  return `${base}/api/tracker/unsubscribe?c=${encodeURIComponent(signCheckin(trackedId, "stopall"))}`;
}

export function consentUrl(base: string, token: string): string {
  return `${base}/placement/${encodeURIComponent(token)}`;
}

/** "on Reed", "through MatchMySkillset", for check-in emails. */
export function whereApplied(source: "mms" | "external", jobSource: string | null): string {
  if (source === "mms") return "through MatchMySkillset";
  const names: Record<string, string> = {
    reed: "Reed",
    adzuna: "Adzuna",
    "teaching-vacancies": "Teaching Vacancies",
    careerjet: "Careerjet",
    jooble: "Jooble",
    himalayas: "Himalayas",
    remotive: "Remotive",
  };
  const name = jobSource ? names[jobSource] : undefined;
  return name ? `on ${name}` : "on another job site";
}
