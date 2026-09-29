// Keys, hashes and signed links for journey tracking. Server code only.
//
// - emailHash(): a keyed hash of an address, so events and placements can be
//   joined up without storing the address itself. Not reversible without the key.
// - Check-in links carry "<tracked id>.<answer>.<signature>". The signature is
//   an HMAC of the id and the answer, so a link can only give the answer it was
//   made for, for the application it was made for. Opening a link never
//   records anything (mail scanners open links): the page asks the person to
//   confirm and the POST records it.
//
// The key is TRACKER_SECRET. Until that is set it is derived from the Supabase
// service-role key, which the server always has; set TRACKER_SECRET before
// launch so rotating the database key does not break old links or hashes.

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import { isCheckinAnswer, type CheckinAnswer } from "./constants";

function key(): string | null {
  const own = env("TRACKER_SECRET");
  if (own.length >= 16) return own;
  const fallback = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!fallback) return null;
  return createHmac("sha256", fallback).update("mms-tracker-key-v1").digest("hex");
}

/** True when links can be signed (a key is available). */
export function trackerKeyReady(): boolean {
  return key() !== null;
}

function hmac(purpose: string, value: string): string {
  const k = key();
  if (!k) throw new Error("No TRACKER_SECRET or SUPABASE_SERVICE_ROLE_KEY to sign with");
  return createHmac("sha256", k).update(`${purpose}:${value}`).digest("base64url");
}

/** Keyed hash of an email address (lower-cased, trimmed). Null when no key is available. */
export function emailHash(email: string): string | null {
  if (!key()) return null;
  return hmac("email-v1", email.trim().toLowerCase()).slice(0, 32);
}

/** Addresses used for testing: never real people. */
export function isTestEmail(email: string | null | undefined): boolean {
  return /@(example\.(com|org|net)|resend\.dev)$/i.test((email ?? "").trim());
}

/** A random, URL-safe token for tracker and consent links (24 bytes). */
export function newTrackerToken(): string {
  return randomBytes(24).toString("base64url");
}

export const TRACKER_TOKEN_RE = /^[A-Za-z0-9_-]{24,64}$/;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The signed value for one check-in answer on one tracked application. */
export function signCheckin(trackedId: string, answer: CheckinAnswer): string {
  return `${trackedId}.${answer}.${hmac("checkin-v1", `${trackedId}:${answer}`).slice(0, 32)}`;
}

/** Reads a signed check-in value; null if it is malformed or the signature is wrong. */
export function verifyCheckin(value: unknown): { trackedId: string; answer: CheckinAnswer } | null {
  if (typeof value !== "string" || value.length > 200) return null;
  const [id, answer, sig, extra] = value.split(".");
  if (extra !== undefined || !id || !UUID_RE.test(id) || !isCheckinAnswer(answer) || !sig) return null;
  if (!key()) return null;
  const want = Buffer.from(hmac("checkin-v1", `${id}:${answer}`).slice(0, 32));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  return { trackedId: id.toLowerCase(), answer };
}
