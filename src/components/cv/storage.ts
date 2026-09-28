// Browser-only helpers. Every read and write is wrapped in try/catch: storage
// can throw in private windows or when site data is blocked, and the site must
// work without it.
//
// - The CV text is kept in sessionStorage (this tab only, gone when the tab
//   closes) so the person can apply for a job or save a profile without
//   uploading it again. It never leaves the browser unless they send it.
// - The latest results link is kept in localStorage so /jobs can show match
//   scores. Only the random token and a date are kept.

const CV_KEY = "mms_cv_session";
const RESULTS_KEY = "mms_last_results";
const RESULTS_MAX_AGE_MS = 30 * 86_400_000;

export interface SessionCv {
  token: string;
  text: string;
  fileName?: string;
}

export function saveSessionCv(cv: SessionCv): void {
  try {
    window.sessionStorage.setItem(CV_KEY, JSON.stringify(cv));
  } catch {
    // storage unavailable
  }
}

export function readSessionCv(): SessionCv | null {
  try {
    const raw = window.sessionStorage.getItem(CV_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as SessionCv;
    return typeof v.text === "string" && typeof v.token === "string" ? v : null;
  } catch {
    return null;
  }
}

export function clearSessionCv(): void {
  try {
    window.sessionStorage.removeItem(CV_KEY);
  } catch {
    // storage unavailable
  }
}

export function rememberResults(token: string): void {
  try {
    window.localStorage.setItem(RESULTS_KEY, JSON.stringify({ token, at: Date.now() }));
  } catch {
    // storage unavailable
  }
}

export function lastResultsToken(): string | null {
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { token?: string; at?: number };
    if (typeof v.token !== "string" || typeof v.at !== "number" || Date.now() - v.at > RESULTS_MAX_AGE_MS) return null;
    return v.token;
  } catch {
    return null;
  }
}

export function forgetResults(): void {
  try {
    window.localStorage.removeItem(RESULTS_KEY);
  } catch {
    // storage unavailable
  }
}
