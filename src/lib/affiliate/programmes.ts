import { env } from "@/lib/env";

// Affiliate and partner programmes. Server-side (reads env vars).
//
// No programme is approved yet (28 September 2026): the owner's Awin publisher
// account (2990367) is waiting on merchant approvals, and Coursera and
// Resume.io will come through Impact. Until a tracking template is set in the
// named env var, links go straight to the destination with no tracking at all.
// Never add a made-up tracking ID.
//
// A template is the network's deep-link format with {url} where the
// URL-encoded destination goes, for example for Awin:
//   https://www.awin1.com/cread.php?awinmid=<merchant id>&awinaffid=2990367&ued={url}
//
// Every link built from here must be rendered with rel="sponsored nofollow
// noopener" and a <Disclosure /> on the page (use <AffiliateLink />).

export type ProgrammeId = "reed-courses" | "coursera" | "linkedin-learning" | "tefl-org" | "resume-io";

export interface Programme {
  id: ProgrammeId;
  name: string;
  /** Env var holding the tracking template, once the programme is approved. */
  templateEnv: string;
  network: "awin" | "impact" | "direct";
}

export const PROGRAMMES: Record<ProgrammeId, Programme> = {
  "reed-courses": { id: "reed-courses", name: "Reed Courses", templateEnv: "AFFILIATE_REED_COURSES_TEMPLATE", network: "awin" },
  coursera: { id: "coursera", name: "Coursera", templateEnv: "AFFILIATE_COURSERA_TEMPLATE", network: "impact" },
  "linkedin-learning": { id: "linkedin-learning", name: "LinkedIn Learning", templateEnv: "AFFILIATE_LINKEDIN_LEARNING_TEMPLATE", network: "impact" },
  "tefl-org": { id: "tefl-org", name: "The TEFL Org", templateEnv: "AFFILIATE_TEFL_ORG_TEMPLATE", network: "awin" },
  "resume-io": { id: "resume-io", name: "Resume.io", templateEnv: "AFFILIATE_RESUME_IO_TEMPLATE", network: "impact" },
};

/** Wraps a destination in the programme's tracking template, or returns it untouched. */
export function affiliateUrl(programme: ProgrammeId, destination: string): string {
  const template = env(PROGRAMMES[programme].templateEnv);
  if (!template || !template.includes("{url}")) return destination;
  return template.replace("{url}", encodeURIComponent(destination));
}

/** True once the programme has a tracking template configured. */
export function isTracked(programme: ProgrammeId): boolean {
  return env(PROGRAMMES[programme].templateEnv).includes("{url}");
}

const enc = encodeURIComponent;

/** Search pages checked on 28 September 2026 (all returned 200). */
export const SEARCH_URL: Record<Exclude<ProgrammeId, "tefl-org" | "resume-io">, (q: string) => string> = {
  "reed-courses": (q) => `https://www.reed.co.uk/courses/?keywords=${enc(q)}`,
  coursera: (q) => `https://www.coursera.org/search?query=${enc(q)}`,
  // The old helper used new URL("/search", ".../learning"), which dropped
  // "/learning" and sent people to LinkedIn's sign-in wall.
  "linkedin-learning": (q) => `https://www.linkedin.com/learning/search?keywords=${enc(q)}`,
};
