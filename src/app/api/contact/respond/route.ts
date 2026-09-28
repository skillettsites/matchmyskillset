import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { answerContact, effectiveStatus, getCandidateById, getContactByToken, getEmployer } from "@/lib/candidates/db";
import { notifyEmployerOfContactResponse } from "@/lib/employer/notify";

// A job seeker answers an employer's contact request from the link we emailed
// them (/contact/<token>). Accept: the employer can then see their first name,
// email and CV in the MatchMySkillset dashboard, and is emailed to say so.
// Decline: the employer is told, with no details. The answer is recorded once;
// a second click changes nothing. The employer email is sent by the employer
// side (notifyEmployerOfContactResponse).

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { allowed } = await checkRateLimit(`contact-respond:${clientIp(request)}`, 20, 600);
  if (!allowed) return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse((await request.text()).slice(0, 1000)) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const decision = body.decision === "accept" ? "accepted" : body.decision === "decline" ? "declined" : null;
  if (!decision) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const req = await getContactByToken(token);
    if (!req) return NextResponse.json({ error: "This request no longer exists." }, { status: 404 });
    const status = effectiveStatus(req);
    if (status !== "pending") return NextResponse.json({ error: status === "expired" ? "This request has expired." : "You have already answered this request.", status }, { status: 409 });

    const [candidate, employer] = await Promise.all([getCandidateById(req.candidate_id), getEmployer(req.account_id)]);
    if (!candidate || candidate.withdrawn_at) return NextResponse.json({ error: "This profile no longer exists." }, { status: 404 });
    if (!employer) return NextResponse.json({ error: "This employer is no longer on MatchMySkillset." }, { status: 404 });

    const changed = await answerContact(req.id, decision);
    if (!changed) return NextResponse.json({ error: "You have already answered this request." }, { status: 409 });

    const n = await notifyEmployerOfContactResponse(req.id);
    if (!n.ok) console.error(`[contact/respond] employer notify failed (${decision}): ${n.reason ?? "unknown"}`);
    return NextResponse.json({ ok: true, status: decision, emailed: n.ok });
  } catch (err) {
    console.error("[contact/respond] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
