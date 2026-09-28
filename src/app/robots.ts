import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "@/components/site";

/**
 * Crawl rules. Private or per-person pages stay out of crawlers' way: the API,
 * personal results and paid reports (each has its own token URL), the
 * employer dashboard and sign-in, and the admin page. The employer landing and
 * pricing pages are public. Removed pages such as /login or /dashboard are not
 * listed: they now 301, and crawlers need to be able to see that.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/results/", "/report/", "/employers/dashboard", "/employers/sign-in", "/admin"];
  // The older client-side results page, while it still exists.
  if (fs.existsSync(path.join(process.cwd(), "src", "app", "discover", "results"))) disallow.push("/discover/results");

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
