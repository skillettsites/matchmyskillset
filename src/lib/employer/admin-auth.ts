// Password sign-in for /admin (Dave only). The password is ADMIN_SECRET,
// compared in constant time on the server. A successful sign-in sets an
// httpOnly cookie holding an expiry time and an HMAC of it keyed with the
// secret, so the cookie cannot be forged and stops working after 12 hours or
// as soon as the secret changes. Server code only.

import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { safeEqual } from "./server";

export const ADMIN_COOKIE = "mms_admin";
const SESSION_HOURS = 12;
// Same floor as /api/admin: fail closed if the secret is unset or too short.
const MIN_SECRET_LENGTH = 16;

function secret(): string {
  return env("ADMIN_SECRET");
}

export function adminConfigured(): boolean {
  return secret().length >= MIN_SECRET_LENGTH;
}

export function checkAdminPassword(password: string): boolean {
  if (!adminConfigured() || !password) return false;
  return safeEqual(password, secret());
}

function sign(expires: number): string {
  return createHmac("sha256", secret()).update(`mms-admin-v1:${expires}`).digest("base64url");
}

export async function startAdminSession(): Promise<void> {
  const expires = Date.now() + SESSION_HOURS * 3_600_000;
  (await cookies()).set(ADMIN_COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  const dot = value.indexOf(".");
  if (dot < 1) return false;
  const expires = Number(value.slice(0, dot));
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(value.slice(dot + 1), sign(expires));
}
