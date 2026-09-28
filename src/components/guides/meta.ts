import type { Metadata } from "next";
import { SITE_NAME } from "@/components/site";

/** Date the guides rebuilt in the September 2026 revamp were last checked. */
export const REVAMP_DATE = "2026-09-28";

/**
 * The site-wide share image from src/app/opengraph-image.tsx. A page that sets
 * its own `openGraph` replaces the inherited one, so pass this explicitly.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "MatchMySkillset: see where people like you go after leaving a job, and what it pays in the UK",
};

/** The em dash character, built from its code point so this file contains none. */
const EM_DASH = String.fromCharCode(0x2014);

/** Longest `<title>` we allow. Google truncates at roughly 60 characters. */
export const MAX_TITLE = 60;
/** Longest meta description we allow. */
export const MAX_DESCRIPTION = 160;

export interface GuideMetaInput {
  /** Site path, e.g. "/jobs-without-a-degree". Used for the canonical and og:url. */
  path: string;
  /** Full `<title>`, 60 characters or fewer. It is used as is (no site suffix). */
  title: string;
  /** Meta description, 160 characters or fewer. */
  description: string;
  /** Keep the page out of search results (it stays crawlable). */
  noindex?: boolean;
  /** Open Graph type. Defaults to "article". */
  ogType?: "article" | "website";
}

/**
 * Build a page's metadata and fail the build if the title or description
 * breaks the house rules (length, em dashes), so a bad title can never ship.
 */
export function guideMetadata({ path, title, description, noindex = false, ogType = "article" }: GuideMetaInput): Metadata {
  const problems: string[] = [];
  if (title.length > MAX_TITLE) problems.push(`title is ${title.length} characters (max ${MAX_TITLE})`);
  if (description.length > MAX_DESCRIPTION) problems.push(`description is ${description.length} characters (max ${MAX_DESCRIPTION})`);
  if (title.includes(EM_DASH) || description.includes(EM_DASH)) problems.push("contains an em dash");
  if (!path.startsWith("/")) problems.push("path must start with /");
  if (problems.length) throw new Error(`guideMetadata(${path}): ${problems.join("; ")}`);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: ogType,
      locale: "en_GB",
      siteName: SITE_NAME,
      url: path,
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
