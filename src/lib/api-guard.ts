// Lightweight, zero-dependency protection for the AI API routes.
// Guards against spammy direct-to-endpoint abuse that would burn Anthropic credits:
//   1. Origin check  - rejects requests not coming from the site (blocks casual curl/bots)
//   2. Rate limiting  - per-IP request cap in a sliding window (in-memory)
//   3. Input caps     - callers enforce max payload sizes before hitting the model
//
// Why this matters more here than elsewhere: /api/assess calls Sonnet at
// max_tokens 4096 and ships the whole skills taxonomy plus every occupation summary
// in the system prompt, so a single request is the priciest model call in the
// portfolio. The route's existing limit is keyed on the email address in the request
// body, which the caller chooses, so randomising it removes the limit entirely.
//
// Note: the rate limiter is in-memory, so on Vercel it is per-instance and resets on
// cold start. That is fine as a cheap first line of defence for a low-traffic site; it
// meaningfully slows a single abusive client. For hard guarantees, set a monthly spend
// cap on the Anthropic key and/or move this to Upstash Redis.

import { NextRequest } from "next/server";

const ALLOWED_HOSTS = ["matchmyskillset.com", "www.matchmyskillset.com"];

/** Returns true if the request appears to originate from our own site (or local dev). */
export function isAllowedOrigin(req: NextRequest): boolean {
  // Always allow non-production (local dev, preview testing).
  if (process.env.NODE_ENV !== "production") return true;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const source = origin || referer;

  // A browser fetch to a same-origin API always sends an Origin header on POST.
  // A raw curl / script typically sends neither, so reject when absent.
  if (!source) return false;

  try {
    const host = new URL(source).hostname;
    // Vercel preview deployments are ours too.
    if (host.endsWith(".vercel.app")) return true;
    return ALLOWED_HOSTS.includes(host);
  } catch {
    return false;
  }
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Sliding-window per-IP rate limit.
 * @returns { allowed, retryAfter } - retryAfter in seconds when blocked.
 */
export function rateLimit(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const key = `${name}:${clientIp(req)}`;

  // Opportunistic cleanup so the Map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}
