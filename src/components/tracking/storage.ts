// Browser-only helpers for the application tracker. Every read and write is
// wrapped in try/catch: storage can throw in private windows or when site
// data is blocked, and tracking must work without it (the person is then
// asked for their email again and gets a separate tracker).
//
// Kept in localStorage: the private tracker token and the email it belongs to
// (so "I applied" does not ask again), and the keys of jobs already tracked
// (so their cards say so). Nothing here is sent anywhere unless the person
// tracks another job.

const TRACKER_KEY = "mms_tracker";
const TRACKED_JOBS_KEY = "mms_tracked_jobs";
const MAX_TRACKED = 300;

/** Fired in this tab whenever the stored tracker changes (other tabs get the "storage" event). */
const CHANGE_EVENT = "mms:tracker-change";

export interface StoredTracker {
  token: string;
  email: string;
}

function changed(): void {
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // no events: components pick the change up on their next render
  }
}

/** For useSyncExternalStore: calls back when the stored tracker changes in this tab or another. */
export function subscribeTracker(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function readTracker(): StoredTracker | null {
  try {
    const raw = window.localStorage.getItem(TRACKER_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<StoredTracker>;
    return typeof v.token === "string" && typeof v.email === "string" ? { token: v.token, email: v.email } : null;
  } catch {
    return null;
  }
}

export function rememberTracker(t: StoredTracker): void {
  try {
    window.localStorage.setItem(TRACKER_KEY, JSON.stringify({ token: t.token, email: t.email }));
  } catch {
    // storage unavailable
  }
  changed();
}

export function forgetTracker(): void {
  try {
    window.localStorage.removeItem(TRACKER_KEY);
    window.localStorage.removeItem(TRACKED_JOBS_KEY);
  } catch {
    // storage unavailable
  }
  changed();
}

function trackedKeys(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(TRACKED_JOBS_KEY) ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function isJobTracked(key: string): boolean {
  return trackedKeys().includes(key);
}

export function rememberTrackedJob(key: string): void {
  try {
    const keys = [key, ...trackedKeys().filter((k) => k !== key)].slice(0, MAX_TRACKED);
    window.localStorage.setItem(TRACKED_JOBS_KEY, JSON.stringify(keys));
  } catch {
    // storage unavailable
  }
  changed();
}

/** The same key the server uses (src/lib/tracking/tracker.ts jobKeyFor) for an outside job. */
export function clientJobKey(job: { source: string; id?: string | null; url?: string | null; title: string }): string {
  if (job.id) return `${job.source}:${job.id}`.slice(0, 300);
  const url = (job.url ?? "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
  return `url:${url || job.title.toLowerCase()}`.slice(0, 300);
}

/** Fired by a job card's Apply button, so the card can ask "Did you apply?" when the person comes back. */
export const APPLY_CLICK_EVENT = "mms:apply-click";
