// Small server-side helpers shared by the employer and admin code: random
// tokens, hashing, and facts about the current request. Server code only.

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import { SITE_URL } from "@/components/site";

/** A URL-safe random token (32 bytes = 256 bits). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Tokens and session ids are stored only as this hash. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Constant-time string comparison (hashes both sides so lengths never leak). */
export function safeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const db = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, db);
}

/** Tokens we issue: base64url, 43 characters for 32 bytes. */
export const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/** Best-effort client IP inside a Server Action or Server Component. */
export async function requestIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "unknown";
  return h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Origin for links in emails. Local testing keeps people on localhost;
 * everywhere else uses the canonical site, never a Host header value.
 */
export async function linkBase(): Promise<string> {
  const h = await headers();
  const host = (h.get("host") || "").toLowerCase();
  if (process.env.NODE_ENV !== "production" && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  return SITE_URL;
}

export function localBase(requestUrl: URL): string {
  const host = requestUrl.hostname;
  return host === "localhost" || host === "127.0.0.1" ? requestUrl.origin : SITE_URL;
}

/** Postgres / PostgREST codes for "that column or function does not exist" (migration 007 not applied). */
export function isMissingColumn(error: { code?: string } | null | undefined): boolean {
  return Boolean(error && ["42703", "PGRST204", "42883", "PGRST202"].includes(error.code || ""));
}

/** An ISO timestamp `days` days ago (or now for 0). */
export function isoDaysAgo(days = 0): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
