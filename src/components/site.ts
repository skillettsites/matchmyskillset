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
  "Upload your CV and see live UK jobs scored against your skills, plus the careers that fit you and what they pay.";

export interface NavItem {
  /** Visible link text. */
  label: string;
  /** Internal path, starting with "/". */
  href: string;
}

/** Where every "Upload your CV" button goes. */
export const CV_HREF = "/discover";

/** Primary navigation (v3). The header adds an "Upload your CV" button after these. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Find jobs", href: "/jobs" },
  { label: "Match my CV", href: "/discover" },
  { label: "Careers", href: "/careers-for" },
  { label: "CV tools", href: "/tools" },
  { label: "For employers", href: "/employers" },
];

/** Footer: the job seeker side. */
export const JOBSEEKER_LINKS: NavItem[] = [
  { label: "Upload your CV", href: "/discover" },
  { label: "Find jobs", href: "/jobs" },
  { label: "Careers by profession", href: "/careers-for" },
  { label: "Career quiz", href: "/quiz" },
  { label: "Transferable skills", href: "/transferable-skills" },
  { label: "Career Change Report", href: "/pricing" },
  { label: "Tailor my CV", href: "/tools/tailor" },
  { label: "Plus", href: "/plus" },
  { label: "Your account", href: "/account" },
];

/** Footer: the employer side. */
export const EMPLOYER_LINKS: NavItem[] = [
  { label: "For employers", href: "/employers" },
  { label: "Employer pricing", href: "/employers/pricing" },
  { label: "Employer sign in", href: "/employers/sign-in" },
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
  { label: "Upload your CV", href: "/discover" },
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
