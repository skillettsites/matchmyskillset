import type { MetadataRoute } from "next";
import { JOB_HUBS, SITE_URL } from "@/components/site";
import hubRedirects from "@/data/redirects/hubs.json";
import pageRedirects from "@/data/redirects/pages.json";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isLiveRow } from "@/lib/apis/jobs/mms";
import { hasCompanyPage } from "@/lib/employer/company";

/**
 * Every live, indexable page, with the date its content last changed.
 * Keep this list in step with the app: add a page when it goes live, remove
 * it when it is deleted, redirected or set to noindex. Dates are real edit
 * dates, not build dates, so Google only re-crawls what changed.
 *
 * Anything listed as a redirect source in src/data/redirects/*.json is
 * dropped automatically, so a redirected URL can never appear here.
 *
 * Jobs posted on MatchMySkillset (/jobs/mms/[id]) are listed while they are
 * live, and company pages (/companies/[slug]) while the account's plan
 * includes one and it has a live job (the page is noindex otherwise). The
 * sitemap is rebuilt hourly for them.
 */
export const revalidate = 3600;

const REVAMP = "2026-09-28";
/** Engineering, manufacturing and Industry 4.0 focus (29 September 2026). */
const NICHE = "2026-09-29";

type Route = { path: string; lastModified: string; priority?: number };

const ROUTES: Route[] = [
  // Home and tools
  { path: "/", lastModified: NICHE, priority: 1 },
  { path: "/discover", lastModified: REVAMP, priority: 0.9 },

  // Engineering, manufacturing and Industry 4.0
  { path: "/engineering-and-manufacturing-jobs", lastModified: NICHE, priority: 0.9 },
  { path: "/robotics-and-automation-jobs", lastModified: NICHE, priority: 0.9 },
  { path: "/3d-printing-jobs", lastModified: NICHE, priority: 0.8 },
  { path: "/graduate-engineering-jobs", lastModified: NICHE, priority: 0.8 },

  // Profession hubs (the ex-military hub was reframed for engineering on 29 September 2026)
  { path: "/careers-for", lastModified: NICHE, priority: 0.8 },
  ...JOB_HUBS.filter((hub) => hub.href !== "/careers-for").map((hub) => ({
    path: hub.href,
    lastModified: hub.href === "/jobs-for-ex-military" ? NICHE : REVAMP,
    priority: hub.href === "/jobs-for-ex-military" ? 0.9 : 0.7,
  })),
  { path: "/jobs", lastModified: NICHE, priority: 0.6 },
  { path: "/quiz", lastModified: REVAMP, priority: 0.7 },
  { path: "/pricing", lastModified: REVAMP, priority: 0.5 },
  { path: "/employers", lastModified: NICHE, priority: 0.6 },
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
  { path: "/about", lastModified: NICHE, priority: 0.4 },
  { path: "/privacy", lastModified: NICHE, priority: 0.2 },
  { path: "/terms", lastModified: NICHE, priority: 0.2 },
];

/** Sources of every redirect in src/data/redirects/*.json (imported, so they are there when the sitemap is rebuilt on the server). */
function redirectedPaths(): Set<string> {
  const out = new Set<string>();
  for (const list of [hubRedirects, pageRedirects] as { source: string }[][]) for (const e of list) out.add(e.source);
  return out;
}

/** Live posted jobs, and company pages that have at least one of them. */
async function jobBoardRoutes(): Promise<Route[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const admin = createAdminClient();
    const { data: jobs, error } = await admin.from("mms_jobs").select("id, status, expires_at, updated_at, account_id").eq("status", "live").limit(1000);
    if (error) throw new Error(error.message);
    const now = Date.now();
    const live = (jobs ?? []).filter((j) => isLiveRow(j as { status: string; expires_at: string | null }, now)) as {
      id: string;
      updated_at: string;
      account_id: string | null;
      expires_at: string | null;
    }[];
    const routes: Route[] = live.map((j) => ({ path: `/jobs/mms/${j.id}`, lastModified: j.updated_at.slice(0, 10), priority: 0.5 }));
    // The company page lists jobs that have an expiry date still to come.
    const withPage = new Map<string, string>();
    for (const j of live) {
      if (!j.account_id || !j.expires_at) continue;
      const prev = withPage.get(j.account_id);
      if (!prev || j.updated_at > prev) withPage.set(j.account_id, j.updated_at);
    }
    if (withPage.size) {
      const { data: accounts, error: accError } = await admin.from("mms_employer_accounts").select("id, slug, plan, plan_status, company_name").in("id", [...withPage.keys()]);
      if (accError) throw new Error(accError.message);
      for (const a of (accounts ?? []) as { id: string; slug: string | null; plan: string; plan_status: string; company_name: string | null }[]) {
        if (!a.slug || !a.company_name || !hasCompanyPage(a)) continue;
        routes.push({ path: `/companies/${a.slug}`, lastModified: (withPage.get(a.id) ?? "").slice(0, 10) || REVAMP, priority: 0.4 });
      }
    }
    return routes;
  } catch (err) {
    console.warn("[sitemap] job board pages left out:", err instanceof Error ? err.message : err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const redirected = redirectedPaths();
  const seen = new Set<string>();
  const routes = [...ROUTES, ...(await jobBoardRoutes())];
  return routes
    .filter((r) => {
      if (redirected.has(r.path) || seen.has(r.path)) return false;
      seen.add(r.path);
      return true;
    })
    .map((r) => ({
      url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
      lastModified: r.lastModified,
      changeFrequency: r.path.startsWith("/jobs/mms/") || r.path.startsWith("/companies/") ? "daily" : "monthly",
      priority: r.priority,
    }));
}
