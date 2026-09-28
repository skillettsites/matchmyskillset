import { NextRequest, NextResponse, after } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { RECRUITER_SHARING_ENABLED } from "@/lib/site";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { ClaudeCallError, ClaudeUnavailableError, extractProfile } from "@/lib/apis/claude";
import { DatabaseUnavailableError, insertReport, newToken } from "@/lib/apis/reports-db";
import { findJobByTitle, getCurrentJob, jobModeSkills, type CurrentJob } from "@/lib/skills/job-lookup";
import { SCORING_METHOD, scoreProfile } from "@/lib/skills/scoring";
import { NO_PREFERENCES, type MatchesDoc, type Preferences, type ProfileSkill, type SkillsDoc } from "@/lib/skills/profile";
import { skillName } from "@/lib/skills/taxonomy";
import { isValidEmail } from "@/lib/email/results-email";
import { recruiterConsentText } from "@/app/discover/consent";
import { UK_REGIONS } from "@/lib/apis/regions";
import { resolveLocation } from "@/lib/apis/jobs/location";
import { getCareerOccupation } from "@/data/careers";

// Two ways in:
//   { mode: "job", jobKey }            instant, no model call
//   { mode: "cv", text, whatMatters }  one Claude extraction call, then the
//                                      same deterministic scoring
// Either can carry { location, locationRegion }: a town, postcode or region
// typed by the person (and the region of the suggestion they picked), which
// is resolved with postcodes.io and used to search for live jobs near them.
// Results are saved to mms_reports behind a random token and the response is
// just that token. Raw CV text is never stored, except for people who tick
// the optional recruiter box while that feature is switched on.

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY_BYTES = 80_000;
const MIN_CV_CHARS = 80;
const MAX_CV_CHARS = 12_000;
const MAX_WHAT_MATTERS = 400;

// Per IP: CV checks cost money, job checks do not.
const CV_PER_IP = { limit: 6, windowSeconds: 3600 };
const JOB_PER_IP = { limit: 40, windowSeconds: 3600 };
// Across the whole site, a ceiling on model calls per UTC day.
const CV_GLOBAL_PER_DAY = 400;

function json(status: number, body: Record<string, unknown>, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers });
}

function bool(value: unknown): boolean {
  return value === true;
}

function readPreferences(value: unknown): Pick<Preferences, "noDegree" | "earnMore"> {
  const v = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return { noDegree: bool(v.noDegree), earnMore: bool(v.earnMore) };
}

function readRegion(value: unknown): string | null {
  return typeof value === "string" && (UK_REGIONS as readonly string[]).includes(value) ? value : null;
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  if (!isAllowedOrigin(request)) return json(403, { error: "Forbidden" });

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) return json(413, { error: "That is too long. Please keep your CV under 12,000 characters." });

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { error: "That is too long. Please keep your CV under 12,000 characters." });
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const mode = body.mode === "cv" ? "cv" : body.mode === "job" ? "job" : null;
  if (!mode) return json(400, { error: "Invalid request." });

  const ip = clientIp(request);
  const perIp = mode === "cv" ? CV_PER_IP : JOB_PER_IP;
  const ipCheck = await checkRateLimit(`assess-${mode}:${ip}`, perIp.limit, perIp.windowSeconds);
  if (!ipCheck.allowed) {
    return json(
      429,
      { error: "You have run a lot of checks in the last hour. Please try again a little later." },
      { "Retry-After": String(ipCheck.retryAfter) }
    );
  }

  // Resolved alongside the model call, so it adds no time to a CV check.
  const locationPromise = resolveLocation(body.location, body.locationRegion).catch(() => null);
  const ticked = readPreferences(body.preferences);
  const source = process.env.MMS_QA_TAG === "1" ? "qa-test" : mode;

  let doc: SkillsDoc;
  let current: CurrentJob | undefined;
  let cvText = "";
  let timing = "";

  if (mode === "job") {
    const jobKey = typeof body.jobKey === "string" ? body.jobKey.slice(0, 120) : "";
    current = getCurrentJob(jobKey);
    if (!current) return json(400, { error: "Please pick your job from the list." });
    const skills: ProfileSkill[] = jobModeSkills(current);
    doc = {
      v: 2,
      source: "job",
      skills,
      achievements: [],
      currentRole: current.title,
      currentJobKey: current.key,
      seniority: "unknown",
      yearsExperience: null,
      preferences: { ...NO_PREFERENCES, ...ticked },
      region: null,
    };
  } else {
    // Keep line breaks: the model reads the CV's structure.
    cvText = typeof body.text === "string" ? body.text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : "";
    if (cvText.length < MIN_CV_CHARS) {
      return json(400, { error: "Please paste a little more about your experience (at least a few lines)." });
    }
    if (cvText.length > MAX_CV_CHARS) {
      return json(400, { error: "Please keep your CV under 12,000 characters. The first two pages are plenty." });
    }
    const whatMatters = cleanText(body.whatMatters, MAX_WHAT_MATTERS);

    const global = await checkRateLimit("assess-global:day", CV_GLOBAL_PER_DAY, 86_400);
    if (!global.allowed) {
      return json(503, {
        error: "We have reached today's limit for CV checks. You can still start from your job title, or try the CV check again tomorrow.",
      });
    }

    try {
      const result = await extractProfile(cvText, whatMatters);
      const p = result.profile;
      timing = `claude ${result.ms}ms (${result.attempts} call${result.attempts > 1 ? "s" : ""}), ${result.usage.inputTokens} in + ${result.usage.cacheReadTokens} cached + ${result.usage.cacheWriteTokens} cache-write, ${result.usage.outputTokens} out, about $${result.usage.costUsd}`;
      if (!p.looksLikeExperience || p.skills.length < 3) {
        return json(422, {
          error: "We could not find enough work or life experience in that text. Please paste your CV or describe what you have done.",
        });
      }
      current = findJobByTitle(p.currentRole);
      doc = {
        v: 2,
        source: "cv",
        skills: p.skills,
        achievements: p.achievements,
        currentRole: p.currentRole,
        currentJobKey: current?.key ?? null,
        seniority: p.seniority,
        yearsExperience: p.yearsExperience,
        preferences: {
          ...p.preferences,
          noDegree: p.preferences.noDegree || ticked.noDegree,
          earnMore: p.preferences.earnMore || ticked.earnMore,
        },
        region: null,
      };
    } catch (err) {
      if (err instanceof ClaudeUnavailableError) {
        console.error("[assess] ANTHROPIC_API_KEY is missing");
        return json(503, { error: "The CV check is not available right now. You can still start from your job title." });
      }
      if (err instanceof ClaudeCallError) {
        return json(502, { error: "We could not analyse your CV just now. Please try again in a minute, or start from your job title." });
      }
      console.error("[assess] extraction error:", err instanceof Error ? err.message : err);
      return json(500, { error: "Something went wrong. Please try again." });
    }
  }

  const place = await locationPromise;
  doc.location = place;
  doc.region = place?.region ?? readRegion(body.region);

  const items = scoreProfile({
    skills: doc.skills,
    preferences: doc.preferences,
    current: { occupationId: current?.occupationId, soc: current?.soc, title: doc.currentRole },
  });
  const matches: MatchesDoc = { v: 2, method: SCORING_METHOD, items };

  let token: string;
  try {
    const saved = await insertReport({ token: newToken(), skills: doc, matches, currentRole: doc.currentRole, source });
    token = saved.token;
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      console.error("[assess] Supabase is not configured");
    } else {
      console.error("[assess] save failed:", err instanceof Error ? err.message : err);
    }
    return json(503, { error: "We could not save your results just now. Please try again." });
  }

  // Opt-in recruiter sharing: only when the feature is on, the box was ticked
  // and an email was given. This is the only place raw CV text is kept.
  const wantsRecruiter = RECRUITER_SHARING_ENABLED && mode === "cv" && body.recruiterConsent === true && isValidEmail(body.email);
  if (wantsRecruiter && isSupabaseConfigured()) {
    const email = String(body.email).trim().toLowerCase();
    const firstName = cleanText(body.firstName, 60) || null;
    const consentText = recruiterConsentText();
    const titleOf = (id: string) => getCareerOccupation(id)?.title ?? id;
    const topNames = items.slice(0, 5).map((m) => ({ title: titleOf(m.occupationId), match: m.score }));
    after(async () => {
      const { error } = await createAdminClient()
        .from("mms_email_leads")
        .upsert(
          {
            email,
            cv_text: cvText,
            skills_summary: doc.skills.slice(0, 15).map((s) => skillName(s.id)).join(", "),
            skills_count: doc.skills.length,
            top_match: items[0] ? titleOf(items[0].occupationId) : null,
            match_percentage: items[0]?.score ?? null,
            top_5_matches: topNames,
            source: source === "qa-test" ? "qa-test" : "discover",
            recruiter_consent: true,
            consent_at: new Date().toISOString(),
            consent_text: consentText,
            consent_withdrawn_at: null,
            first_name: firstName,
            current_role: doc.currentRole,
          },
          { onConflict: "email" }
        );
      if (error) console.error("[assess] recruiter lead save failed:", error.message);
    });
  }

  after(() => {
    console.log(`[assess] ${mode}: ${items.length} matches, total ${Date.now() - started}ms${timing ? `; ${timing}` : ""}`);
  });

  return json(200, {
    token,
    matches: items.length,
    skills: doc.skills.length,
    role: doc.currentRole,
    place: place?.label ?? doc.region ?? null,
  });
}
