import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { UK_REGIONS } from "@/lib/apis/regions";
import { isSkillId } from "@/lib/skills/taxonomy";
import { deleteCandidateEverything, getCandidateByToken, updateCandidate } from "@/lib/candidates/db";
import { cleanHeadline, headlineProblem } from "@/lib/candidates/profile";

// The private manage page for a job seeker profile (/me/<token>): switch it
// on (confirm) or off, edit what employers see, replace or remove the CV, or
// delete everything. The token from the email is the only key.

export const runtime = "nodejs";

const MAX_CV = 12_000;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json(403, { error: "Forbidden" });
  const { allowed } = await checkRateLimit(`candidates-manage:${clientIp(request)}`, 40, 600);
  if (!allowed) return json(429, { error: "Too many changes. Please wait a few minutes." });
  const raw = await request.text();
  if (raw.length > 60_000) return json(413, { error: "That is too long." });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request." });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const action = typeof body.action === "string" ? body.action : "";

  try {
    const c = await getCandidateByToken(token);
    if (!c) return json(404, { error: "This profile no longer exists." });
    const now = new Date().toISOString();

    switch (action) {
      case "confirm":
      case "on":
        await updateCandidate(c.id, { discoverable: true, discoverable_consent_at: now });
        return json(200, { ok: true, discoverable: true });
      case "off":
        await updateCandidate(c.id, { discoverable: false });
        return json(200, { ok: true, discoverable: false });
      case "update": {
        const headline = cleanHeadline(body.headline);
        const problem = headlineProblem(headline);
        if (problem) return json(400, { error: problem });
        const role = cleanText(body.currentRole, 120) || null;
        if (role && headlineProblem(role)?.includes("contact")) return json(400, { error: "Please leave contact details out of your job title." });
        const region = typeof body.region === "string" && (UK_REGIONS as readonly string[]).includes(body.region) ? body.region : null;
        const location = cleanText(body.location, 80) || null;
        const yearsRaw = Number(body.yearsExperience);
        const years = body.yearsExperience === null || body.yearsExperience === "" ? null : Number.isFinite(yearsRaw) ? Math.max(0, Math.min(60, Math.round(yearsRaw))) : null;
        const skills = Array.isArray(body.skills) ? [...new Set(body.skills.filter(isSkillId))].slice(0, 30) : undefined;
        if (skills && skills.length === 0) return json(400, { error: "Please keep at least one skill." });
        await updateCandidate(c.id, { headline, current_role: role, region, location, years_experience: years, ...(skills ? { skills } : {}) });
        return json(200, { ok: true });
      }
      case "cv": {
        const cv = typeof body.cvText === "string" ? body.cvText.replace(/\r\n/g, "\n").trim().slice(0, MAX_CV) : "";
        if (cv.length < 80) return json(400, { error: "That CV looks too short." });
        await updateCandidate(c.id, { cv_text: cv });
        return json(200, { ok: true });
      }
      case "remove-cv":
        await updateCandidate(c.id, { cv_text: null });
        return json(200, { ok: true });
      case "delete":
        await deleteCandidateEverything(c);
        return json(200, { ok: true, deleted: true });
      default:
        return json(400, { error: "Invalid request." });
    }
  } catch (err) {
    console.error("[candidates/manage] failed:", err instanceof Error ? err.message : err);
    return json(500, { error: "Something went wrong. Please try again." });
  }
}
