import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText, cleanHttpUrl } from "@/lib/input";
import type { UnifiedJob } from "@/lib/types";

// Records which job listings people click through to. Nothing personal is
// stored: source, the board's job id, title and link only.

const SOURCES: ReadonlySet<UnifiedJob["source"]> = new Set(["adzuna", "reed", "jooble", "himalayas"]);
const MAX_BODY_BYTES = 4096;
const RATE_LIMIT = 60;
const RATE_WINDOW_SECONDS = 10 * 60;

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const source = typeof body.source === "string" ? (body.source as UnifiedJob["source"]) : null;
  const jobUrl = cleanHttpUrl(body.jobUrl, 1000);
  if (!source || !SOURCES.has(source) || !jobUrl) {
    return NextResponse.json({ error: "Invalid click" }, { status: 400 });
  }
  const jobId = cleanText(body.jobId, 200) || null;
  const jobTitle = cleanText(body.jobTitle, 200) || null;

  const { allowed, retryAfter } = await checkRateLimit(
    `track-click:${clientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_SECONDS
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  if (isSupabaseConfigured()) {
    // after() keeps the function alive until the insert finishes, unlike the
    // old un-awaited promise, which could be dropped when the response ended.
    after(async () => {
      const { error } = await createAdminClient().from("mms_job_clicks").insert({
        source,
        job_external_id: jobId,
        job_title: jobTitle,
        job_url: jobUrl,
      });
      if (error) console.error("[track-click] insert failed:", error.message);
    });
  }

  return NextResponse.json({ ok: true });
}
