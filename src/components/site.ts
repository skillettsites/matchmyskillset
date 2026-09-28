/**
 * Site-wide constants shared by the shell (Header, Footer), the homepage,
 * the 404 page and the JSON-LD helpers. Keep URLs here so every entry point
 * links to the same hub paths.
 */

/** Canonical brand name. Always "MatchMySkillset", never "MatchMySkills". */
export const SITE_NAME = "MatchMySkillset";

/**
 * Absolute site origin without a trailing slash. Env values in this stack can
 * carry a trailing literal "\n", so it is stripped before use.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://matchmyskillset.com")
  .replace(/\\n$/, "")
  .trim()
  .replace(/\/+$/, "");

/** One-line positioning used in metadata and the footer. */
export const SITE_TAGLINE =
  "Leaving your job? See where people like you actually go, what it pays in the UK, and how to get there.";

export interface NavItem {
  /** Visible link text. */
  label: string;
  /** Internal path, starting with "/". */
  href: string;
}

/** Primary navigation, in the order agreed for the relaunch. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Leaving your job", href: "/careers-for" },
  { label: "Analyse my CV", href: "/discover#cv" },
  { label: "Find jobs", href: "/jobs" },
  { label: "Career quiz", href: "/quiz" },
];

/** Profession-exit hubs: "start from the job you do now". */
export const JOB_HUBS: (NavItem & { short: string })[] = [
  { label: "Leaving teaching", short: "Teacher", href: "/career-change-from-teaching" },
  { label: "Non-clinical jobs for nurses", short: "Nurse", href: "/non-clinical-jobs-for-nurses" },
  { label: "Jobs for ex-police officers", short: "Police officer", href: "/jobs-for-ex-police-officers" },
  { label: "Jobs for ex-military", short: "Armed forces", href: "/jobs-for-ex-military" },
  { label: "Leaving retail", short: "Retail", href: "/career-change-from-retail" },
  { label: "Any other job", short: "Any other job", href: "/careers-for" },
];

/** Guides that are not tied to one profession. */
export const GUIDE_LINKS: NavItem[] = [
  { label: "Jobs without a degree", href: "/jobs-without-a-degree" },
  { label: "Highest paying careers in the UK", href: "/highest-paying-careers-uk" },
  { label: "Transferable skills", href: "/transferable-skills" },
  { label: "Career change at 30", href: "/career-change-at-30" },
  { label: "Career change at 50", href: "/career-change-at-50" },
];

/** Guides about fit: personality, neurodivergence, stress. */
export const FIT_LINKS: NavItem[] = [
  { label: "Jobs for people with ADHD", href: "/jobs-for-people-with-adhd" },
  { label: "Jobs for introverts", href: "/jobs-for-introverts" },
  { label: "Low-stress jobs in the UK", href: "/low-stress-jobs-uk" },
];

/** Interactive tools. */
export const TOOL_LINKS: NavItem[] = [
  { label: "Analyse my CV", href: "/discover#cv" },
  { label: "Career quiz", href: "/quiz" },
  { label: "Find jobs", href: "/jobs" },
];

/** Company and legal pages. */
export const COMPANY_LINKS: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** Turn a site path into an absolute URL for JSON-LD and metadata. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
