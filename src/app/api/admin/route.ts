import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { env } from "@/lib/env";

// Recruiter view of OPTED-IN leads only, used by /employers.
//
// Returns a row only when the person ticked the optional recruiter box
// (recruiter_consent = true), has not withdrawn, and consented within the last
// 12 months. Only the fields a recruiter needs are selected. Needs migration
// 004 (consent columns); until then the query fails and this returns 503.

export const dynamic = "force-dynamic";

const CONSENT_MONTHS = 12;
const MAX_ROWS = 200;
const AUTH_RATE_LIMIT = 20;
const AUTH_RATE_WINDOW_SECONDS = 15 * 60;

const LEAD_COLUMNS =
  'email, first_name, "current_role", skills_summary, top_5_matches, cv_text, consent_at';

const NO_STORE = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time comparison of the bearer token with ADMIN_SECRET. */
function isAuthorised(request: NextRequest): boolean {
  const secret = env("ADMIN_SECRET");
  // Fail closed if unset or too short. The old key was kept in the browser's
  // localStorage, so set a fresh one of at least 16 characters.
  if (secret.length < 16) return false;
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return false;
  const token = header.slice(7).trim();
  if (!token) return false;
  return timingSafeEqual(digest(token), digest(secret));
}

export async function GET(request: NextRequest) {
  const { allowed, retryAfter } = await checkRateLimit(
    `admin:${clientIp(request)}`,
    AUTH_RATE_LIMIT,
    AUTH_RATE_WINDOW_SECONDS
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(retryAfter) } }
    );
  }

  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: NO_STORE });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503, headers: NO_STORE });
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - CONSENT_MONTHS);

  const { data, error } = await createAdminClient()
    .from("mms_email_leads")
    .select(LEAD_COLUMNS)
    .eq("recruiter_consent", true)
    .is("consent_withdrawn_at", null)
    .not("consent_at", "is", null)
    .gte("consent_at", cutoff.toISOString())
    .order("consent_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    console.error("[admin] leads query failed:", error.message);
    return NextResponse.json(
      { error: "Could not load candidates. The consent columns may not exist yet (migration 004)." },
      { status: 503, headers: NO_STORE }
    );
  }

  return NextResponse.json({ leads: data ?? [] }, { headers: NO_STORE });
}
