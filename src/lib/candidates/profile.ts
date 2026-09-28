// Helpers for the anonymous job seeker profile ("Let employers find me").
// Safe on the server and in the browser (no data imports).

/** A first headline for the profile; the person can change it. */
export function suggestHeadline(role: string | null | undefined, years: number | null | undefined): string {
  const r = (role ?? "").replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim().slice(0, 70);
  const nice = r ? r.charAt(0).toUpperCase() + r.slice(1) : "Experienced professional";
  if (typeof years === "number" && years > 0) return `${nice} with ${years} year${years === 1 ? "" : "s"}' experience`;
  return nice;
}

const EMAIL_LIKE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const URL_LIKE = /\b(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|co\.uk|uk|org|net|io)\b/i;
const PHONE_LIKE = /(\+?\d[\d\s().-]{8,}\d)/;

/**
 * Why a headline cannot be shown to employers, or null if it is fine. The
 * profile is anonymous, so contact details and links are refused.
 */
export function headlineProblem(value: string): string | null {
  const v = value.trim();
  if (v.length < 3) return "Please add a short headline, for example your job and years of experience.";
  if (v.length > 120) return "Please keep the headline under 120 characters.";
  if (EMAIL_LIKE.test(v) || URL_LIKE.test(v) || PHONE_LIKE.test(v)) {
    return "Please leave contact details and links out of your headline: employers only get those if you accept their request.";
  }
  return null;
}

export function cleanHeadline(value: unknown): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) : "";
}
