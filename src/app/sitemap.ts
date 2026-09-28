import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { JOB_HUBS, SITE_URL } from "@/components/site";

/**
 * Every live, indexable page, with the date its content last changed.
 * Keep this list in step with the app: add a page when it goes live, remove
 * it when it is deleted, redirected or set to noindex. Dates are real edit
 * dates, not build dates, so Google only re-crawls what changed.
 *
 * Anything listed as a redirect source in src/data/redirects/*.json is
 * dropped automatically, so a redirected URL can never appear here.
 */
const REVAMP = "2026-09-28";

type Route = { path: string; lastModified: string; priority?: number };

const ROUTES: Route[] = [
  // Home and tools
  { path: "/", lastModified: REVAMP, priority: 1 },
  { path: "/discover", lastModified: REVAMP, priority: 0.9 },
  { path: "/careers-for", lastModified: REVAMP, priority: 0.9 },
  ...JOB_HUBS.filter((hub) => hub.href !== "/careers-for").map((hub) => ({ path: hub.href, lastModified: REVAMP, priority: 0.9 })),
  { path: "/jobs", lastModified: REVAMP, priority: 0.6 },
  { path: "/quiz", lastModified: REVAMP, priority: 0.7 },
  { path: "/pricing", lastModified: REVAMP, priority: 0.5 },
  { path: "/employers", lastModified: REVAMP, priority: 0.6 },
  { path: "/employers/pricing", lastModified: REVAMP, priority: 0.5 },
  { path: "/transferable-skills", lastModified: REVAMP, priority: 0.8 },

  // Pay pages (ONS ASHE 2025)
  { path: "/jobs-without-a-degree", lastModified: REVAMP, priority: 0.8 },
  { path: "/highest-paying-careers-uk", lastModified: REVAMP, priority: 0.8 },
  { path: "/what-jobs", lastModified: REVAMP, priority: 0.6 },
  { path: "/what-jobs/jobs-that-pay-30k", lastModified: REVAMP, priority: 0.7 },
  { path: "/what-jobs/jobs-that-pay-40k", lastModified: REVAMP, priority: 0.8 },
  { path: "/what-jobs/jobs-that-pay-50k", lastModified: REVAMP, priority: 0.7 },

  // Fit
  { path: "/low-stress-jobs-uk", lastModified: REVAMP, priority: 0.7 },
  { path: "/jobs-for-people-with-adhd", lastModified: REVAMP, priority: 0.7 },
  { path: "/jobs-for-introverts", lastModified: REVAMP, priority: 0.7 },
  { path: "/what-job-is-right-for-me", lastModified: REVAMP, priority: 0.6 },
  { path: "/best-jobs-for-work-life-balance", lastModified: REVAMP, priority: 0.6 },
  { path: "/jobs-for-people-who-hate-their-job", lastModified: REVAMP, priority: 0.6 },

  // Career change guides
  { path: "/career-change", lastModified: REVAMP, priority: 0.7 },
  { path: "/career-change/how-to-change-careers", lastModified: REVAMP, priority: 0.7 },
  { path: "/career-change/skills-based-hiring", lastModified: REVAMP, priority: 0.5 },
  { path: "/career-change-at-30", lastModified: REVAMP, priority: 0.7 },
  { path: "/career-change-at-50", lastModified: REVAMP, priority: 0.7 },
  { path: "/career-change-no-experience", lastModified: REVAMP, priority: 0.6 },
  { path: "/career-change-with-no-money", lastModified: REVAMP, priority: 0.7 },
  { path: "/how-to-write-a-cv-for-career-change", lastModified: REVAMP, priority: 0.7 },
  { path: "/apprenticeships-for-adults-uk", lastModified: REVAMP, priority: 0.6 },
  { path: "/best-jobs-for-women-returning-to-work", lastModified: REVAMP, priority: 0.6 },
  { path: "/best-careers-for-the-future-uk", lastModified: REVAMP, priority: 0.7 },
  { path: "/skills-employers-want-2026", lastModified: REVAMP, priority: 0.6 },

  // Home working and side income
  { path: "/jobs-you-can-do-from-home-with-no-experience", lastModified: REVAMP, priority: 0.7 },
  { path: "/work-from-home-jobs", lastModified: REVAMP, priority: 0.6 },
  { path: "/highest-paying-remote-jobs-uk", lastModified: REVAMP, priority: 0.6 },
  { path: "/freelance-careers-uk", lastModified: REVAMP, priority: 0.5 },
  { path: "/best-side-hustles-uk", lastModified: REVAMP, priority: 0.5 },

  // Company
  { path: "/about", lastModified: REVAMP, priority: 0.4 },
  { path: "/privacy", lastModified: REVAMP, priority: 0.2 },
  { path: "/terms", lastModified: REVAMP, priority: 0.2 },
];

/** Sources of every redirect in src/data/redirects/*.json. */
function redirectedPaths(): Set<string> {
  const dir = path.join(process.cwd(), "src", "data", "redirects");
  const out = new Set<string>();
  if (!fs.existsSync(dir)) return out;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const entries = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as { source: string }[];
    for (const e of entries) out.add(e.source);
  }
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const redirected = redirectedPaths();
  const seen = new Set<string>();
  return ROUTES.filter((r) => {
    if (redirected.has(r.path) || seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  }).map((r) => ({
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    lastModified: r.lastModified,
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
