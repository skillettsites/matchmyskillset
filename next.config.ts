import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

interface RedirectEntry {
  source: string;
  destination: string;
  permanent: boolean;
}

// Redirects that live in the config itself.
const BASE_REDIRECTS: (RedirectEntry & { has?: { type: "host"; value: string }[] })[] = [
  {
    source: "/:path*",
    has: [{ type: "host", value: "www.matchmyskillset.com" }],
    destination: "https://matchmyskillset.com/:path*",
    permanent: true,
  },
  // Accounts and subscriptions were removed in the September 2026 revamp.
  { source: "/login", destination: "/", permanent: true },
  { source: "/signup", destination: "/", permanent: true },
  { source: "/dashboard", destination: "/", permanent: true },
  { source: "/career-gps", destination: "/discover", permanent: true },
  // Featured job pages (/jobs/featured_...) were removed; any old link lands on the job search.
  // Job pages for adverts from other boards (/jobs/reed_57381080...) are left alone.
  {
    source: "/jobs/:id((?!(?:reed|adzuna|teaching-vacancies|himalayas|remotive|careerjet|jooble)_)[^/]+)",
    destination: "/jobs",
    permanent: true,
  },
  // Browsers and crawlers still ask for /favicon.ico; the site icon is public/icon.svg.
  { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
];

/** Sent with every response. HSTS is already added by Vercel. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites only ever see our origin, never a /results/<token> or /report/<token> path.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/**
 * Page consolidation redirects from the September 2026 revamp, one JSON file
 * per workstream (an array of { source, destination, permanent }):
 *   src/data/redirects/pages.json  guides, pay pages, /what-jobs
 *   src/data/redirects/hubs.json   profession hubs
 * A missing file is skipped. A malformed entry or a source defined twice
 * (across files or against BASE_REDIRECTS) stops the build.
 */
const REDIRECT_FILES = ["pages.json", "hubs.json"];

function loadRedirectFile(file: string): RedirectEntry[] {
  const full = path.join(process.cwd(), "src", "data", "redirects", file);
  if (!fs.existsSync(full)) return [];
  const parsed: unknown = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!Array.isArray(parsed)) throw new Error(`[redirects] ${file} must be a JSON array`);
  return parsed.map((entry, i) => {
    const e = entry as Partial<RedirectEntry>;
    if (typeof e.source !== "string" || !e.source.startsWith("/")) {
      throw new Error(`[redirects] ${file}[${i}]: "source" must be a path starting with "/"`);
    }
    if (typeof e.destination !== "string" || !(e.destination.startsWith("/") || /^https:\/\//.test(e.destination))) {
      throw new Error(`[redirects] ${file}[${i}] (${e.source}): "destination" must be a path or an https URL`);
    }
    if (typeof e.permanent !== "boolean") {
      throw new Error(`[redirects] ${file}[${i}] (${e.source}): "permanent" must be true or false`);
    }
    if (e.source === e.destination) throw new Error(`[redirects] ${file}[${i}]: ${e.source} redirects to itself`);
    return { source: e.source, destination: e.destination, permanent: e.permanent };
  });
}

function buildRedirects() {
  const owner = new Map<string, string>();
  const duplicates: string[] = [];
  const claim = (source: string, where: string, hostScoped: boolean) => {
    // The www rule is scoped to another host, so it cannot clash with a path rule.
    if (hostScoped) return;
    const prev = owner.get(source);
    if (prev) duplicates.push(`${source} (in ${prev} and ${where})`);
    else owner.set(source, where);
  };

  for (const r of BASE_REDIRECTS) claim(r.source, "next.config.ts", Boolean(r.has));
  const fromFiles: RedirectEntry[] = [];
  for (const file of REDIRECT_FILES) {
    for (const r of loadRedirectFile(file)) {
      claim(r.source, file, false);
      fromFiles.push(r);
    }
  }
  if (duplicates.length) {
    throw new Error(`[redirects] Duplicate redirect sources:\n  ${duplicates.join("\n  ")}`);
  }

  // A redirect that lands on another redirect costs an extra hop. Say so loudly.
  const sources = new Set(fromFiles.map((r) => r.source));
  for (const r of fromFiles) {
    if (sources.has(r.destination)) {
      console.warn(`[redirects] Chain: ${r.source} -> ${r.destination}, which is itself redirected. Point it at the final URL.`);
    }
  }
  return [...BASE_REDIRECTS, ...fromFiles];
}

const REDIRECTS = buildRedirects();

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECTS;
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
