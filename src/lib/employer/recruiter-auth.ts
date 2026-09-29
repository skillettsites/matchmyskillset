// Password sign-in for /recruiter (our recruiters, who put shortlists
// together). Same pattern as admin-auth.ts, with its own secret and cookie:
// the password is RECRUITER_SECRET, compared in constant time on the server;
// a successful sign-in sets an httpOnly cookie, scoped to /recruiter, holding
// an expiry time and an HMAC of it keyed with the secret. It stops working
// after 12 hours or as soon as the secret changes. The admin password is never
// needed here, and this cookie gives no access to /admin. Server code only.

import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { safeEqual } from "./server";

export const RECRUITER_COOKIE = "mms_recruiter";
const COOKIE_PATH = "/recruiter";
const SESSION_HOURS = 12;
// Fail closed if the secret is unset or too short (same floor as ADMIN_SECRET).
const MIN_SECRET_LENGTH = 16;

function secret(): string {
  return env("RECRUITER_SECRET");
}

/** Set, long enough, and not the admin password (which would open /admin too). */
export function recruiterConfigured(): boolean {
  const s = secret();
  if (s.length < MIN_SECRET_LENGTH) return false;
  const admin = env("ADMIN_SECRET");
  return !(admin && safeEqual(s, admin));
}

export function checkRecruiterPassword(password: string): boolean {
  if (!recruiterConfigured() || !password) return false;
  return safeEqual(password, secret());
}

function sign(expires: number): string {
  return createHmac("sha256", secret()).update(`mms-recruiter-v1:${expires}`).digest("base64url");
}

export async function startRecruiterSession(): Promise<void> {
  const expires = Date.now() + SESSION_HOURS * 3_600_000;
  (await cookies()).set(RECRUITER_COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endRecruiterSession(): Promise<void> {
  (await cookies()).delete({ name: RECRUITER_COOKIE, path: COOKIE_PATH });
}

export async function isRecruiter(): Promise<boolean> {
  if (!recruiterConfigured()) return false;
  const value = (await cookies()).get(RECRUITER_COOKIE)?.value ?? "";
  const dot = value.indexOf(".");
  if (dot < 1) return false;
  const expires = Number(value.slice(0, dot));
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(value.slice(dot + 1), sign(expires));
}
