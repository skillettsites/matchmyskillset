import { createHmac } from "crypto";
import { after } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

// Persistent fixed-window rate limiting, shared by every serverless instance,
// backed by public.mms_rate_limits and the atomic public.mms_rate_limit_hit()
// function (supabase/migrations/004_revamp_tables.sql).
//
// FAILS OPEN: until 004 is applied, or if Supabase is slow or down, requests
// are allowed and a warning is logged. This limiter protects third-party
// quotas and spend; it must never take the site down.
//
// Keys are stored as a keyed hash, never as a raw IP address, and rows older
// than a day are purged in the background. The privacy policy relies on both.

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the current window resets (0 when allowed). */
  retryAfter: number;
}

const TIMEOUT_MS = 1500;
const PURGE_AFTER_HOURS = 24;
const PURGE_PROBABILITY = 0.02;

let warnedMissing = false;

function hashKey(key: string): string {
  const secret = env("RATE_LIMIT_SECRET") || env("SUPABASE_SERVICE_ROLE_KEY") || "mms-rate-limit";
  const digest = createHmac("sha256", secret).update(key).digest("hex").slice(0, 40);
  // Keep the readable route prefix ("jobs-search:...") for debugging.
  const prefix = key.includes(":") ? key.slice(0, key.indexOf(":")).slice(0, 40) : "rl";
  return `${prefix}:${digest}`;
}

function isMissingObjectError(error: { code?: string; message?: string }): boolean {
  // 42P01 undefined_table, 42883 undefined_function, PGRST202 function not in
  // schema cache, PGRST205 table not in schema cache.
  return ["42P01", "42883", "PGRST202", "PGRST205"].includes(error.code || "");
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Counts one request against `key` and says whether it is within `limit`
 * requests per `windowSeconds` (fixed window). Call it from route handlers.
 *
 * @example
 *   const { allowed, retryAfter } = await checkRateLimit(`jobs-search:${clientIp(req)}`, 30, 300);
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const windowMs = Math.max(1, Math.floor(windowSeconds)) * 1000;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const retryAfter = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));

  if (!isSupabaseConfigured()) {
    if (!warnedMissing) {
      console.warn("[rate-limit] Supabase is not configured; allowing all requests");
      warnedMissing = true;
    }
    return { allowed: true, retryAfter: 0 };
  }

  const supabase = createAdminClient();

  try {
    const { data, error } = await withTimeout(
      supabase.rpc("mms_rate_limit_hit", {
        p_key: hashKey(key),
        p_window_start: new Date(windowStart).toISOString(),
      }),
      TIMEOUT_MS
    );

    if (error) {
      if (isMissingObjectError(error)) {
        if (!warnedMissing) {
          console.warn(
            "[rate-limit] mms_rate_limits / mms_rate_limit_hit() not found (migration 004 not applied yet); allowing all requests"
          );
          warnedMissing = true;
        }
      } else {
        console.warn("[rate-limit] check failed, allowing request:", error.message);
      }
      return { allowed: true, retryAfter: 0 };
    }

    // Occasionally clear out old windows once the response has been sent.
    if (Math.random() < PURGE_PROBABILITY) {
      after(async () => {
        const cutoff = new Date(now - PURGE_AFTER_HOURS * 3600 * 1000).toISOString();
        const { error: purgeError } = await supabase
          .from("mms_rate_limits")
          .delete()
          .lt("window_start", cutoff);
        if (purgeError) console.warn("[rate-limit] purge failed:", purgeError.message);
      });
    }

    const count = typeof data === "number" ? data : Number(data);
    if (!Number.isFinite(count)) return { allowed: true, retryAfter: 0 };
    return count > limit ? { allowed: false, retryAfter } : { allowed: true, retryAfter: 0 };
  } catch (err) {
    console.warn("[rate-limit] check failed, allowing request:", err instanceof Error ? err.message : err);
    return { allowed: true, retryAfter: 0 };
  }
}

/** Best-effort client IP. On Vercel the first x-forwarded-for entry is set by the platform. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
