import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { TOKEN_PATTERN, getReportByToken } from "@/lib/apis/reports-db";
import { isValidEmail } from "@/lib/email/results-email";
import { isSkillsDoc } from "@/lib/skills/profile";
import { placeFromDoc } from "@/lib/apis/jobs/match";
import { PROFILE_CONSENT_TEXT } from "@/lib/candidates/consent";
import { createCandidate, findCandidateByEmail, newToken } from "@/lib/candidates/db";
import { sendProfileConfirm } from "@/lib/candidates/emails";
import { cleanHeadline, headlineProblem } from "@/lib/candidates/profile";

// "Let employers find me": creates a hidden job seeker profile from a results
// link. It only becomes visible to employers after the person switches it on
// from the email we send (so we know the address is theirs). The CV text is
// stored only because they asked for this, so it can go to an employer whose
// contact request they accept.

export const runtime = "nodejs";

const MIN_CV = 80;
const MAX_CV = 12_000;
const MAX_SKILLS = 25;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json(403, { error: "Forbidden" });
  const raw = await request.text();
  if (raw.length > 60_000) return json(413, { error: "That is too long." });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const firstName = cleanText(body.firstName, 60);
  const headline = cleanHeadline(body.headline);
  const cvText = typeof body.cvText === "string" ? body.cvText.replace(/\r\n/g, "\n").trim().slice(0, MAX_CV) : "";
  if (!TOKEN_PATTERN.test(token)) return json(400, { error: "Invalid request." });
  if (!firstName) return json(400, { error: "Please add your first name. Employers only see it if you accept their request." });
  if (!isValidEmail(email)) return json(400, { error: "Please enter a valid email address." });
  const problem = headlineProblem(headline);
  if (problem) return json(400, { error: problem });
  if (cvText && cvText.length < MIN_CV) return json(400, { error: "That CV looks too short. Please add more, or leave it out." });
  if (body.consent !== true) return json(400, { error: "Please tick the box to agree, or leave this for now." });

  const ip = await checkRateLimit(`candidates-create:${clientIp(request)}`, 5, 3600);
  const perLink = await checkRateLimit(`candidates-create-token:${token}`, 3, 86_400);
  if (!ip.allowed || !perLink.allowed) return json(429, { error: "Too many attempts from here. Please try again later." });

  try {
    const report = await getReportByToken(token);
    if (!report) return json(404, { error: "These results have expired or the link is wrong." });
    const doc = isSkillsDoc(report.skills) ? report.skills : null;
    if (!doc) return json(422, { error: "Please run a new check first." });

    // One profile per address. If there is one already, we send its link again
    // rather than change it: whoever typed this address may not own it.
    const existing = await findCandidateByEmail(email);
    if (existing) {
      await sendProfileConfirm(email, { firstName: existing.first_name, manageToken: existing.manage_token });
      return json(200, { ok: true, existing: true });
    }

    const place = placeFromDoc(doc);
    const skills = [...doc.skills]
      .sort((a, b) => (a.strength === b.strength ? 0 : a.strength === "strong" ? -1 : 1))
      .map((s) => s.id)
      .slice(0, MAX_SKILLS);
    const row = await createCandidate({
      manageToken: newToken(),
      email,
      firstName,
      currentRole: doc.currentRole ? doc.currentRole.slice(0, 120) : null,
      location: place?.town ?? (place?.kind === "region" ? null : place?.label ?? null),
      region: place?.region ?? doc.region ?? null,
      yearsExperience: typeof doc.yearsExperience === "number" ? Math.max(0, Math.min(60, Math.round(doc.yearsExperience))) : null,
      skills,
      headline,
      cvText: cvText || null,
      reportId: report.id,
      consentText: PROFILE_CONSENT_TEXT,
    });
    const mail = await sendProfileConfirm(email, { firstName, manageToken: row.manage_token });
    return json(200, { ok: true, emailed: mail.ok });
  } catch (err) {
    console.error("[candidates] create failed:", err instanceof Error ? err.message : err);
    return json(500, { error: "We could not save your profile just now. Please try again." });
  }
}
