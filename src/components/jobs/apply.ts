// Browser helpers shared by job cards and job pages. Call from event handlers only.

import { track } from "@/lib/analytics";
import { noteApplyClick } from "@/components/tracking/TrackApplied";

export interface ClickedJob {
  id: string;
  source: string;
  title: string;
  url: string;
  match?: number;
}

/** An "Apply" click: analytics, the click log and the "Did you apply?" prompt. */
export function recordApplyClick(job: ClickedJob, position?: number, where: "card" | "job_page" = "card"): void {
  track("job_click", { source: job.source, position: position ?? null, match: job.match ?? null, where });
  if (job.source === "mms") return;
  // Application tracker: ask "Did you apply?" when they come back from the advert.
  noteApplyClick(job);
  fetch("/api/track-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: job.source, jobId: job.id, jobTitle: job.title, jobUrl: job.url }),
    keepalive: true,
  }).catch(() => {});
}

const OPENED_KEY = "mms-job-opened";

/** A job page opened from a list: its Back link can then return to the same place in that list. */
export function noteJobOpened(id: string): void {
  try {
    sessionStorage.setItem(OPENED_KEY, id);
  } catch {
    // storage blocked: Back goes to the list's address instead
  }
}

export function wasOpenedFromList(id: string): boolean {
  try {
    return sessionStorage.getItem(OPENED_KEY) === id;
  } catch {
    return false;
  }
}
