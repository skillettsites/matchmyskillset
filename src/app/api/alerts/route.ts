import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { TOKEN_PATTERN, getReportByToken } from "@/lib/apis/reports-db";
import { isValidEmail } from "@/lib/email/results-email";
import { alertQueryFromReport, whereText } from "@/lib/candidates/alerts";
import { createAlert, findAlert, newToken, updateAlert } from "@/lib/candidates/db";
import { sendAlertWelcome } from "@/lib/candidates/emails";

// "Email me new matching jobs" on a results page. Needs the results link, an
// email address, how often, and the consent tick. The alert keeps the skill
// ids and job titles from the results (not the CV) and the place searched.

export const runtime = "nodejs";

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json(403, { error: "Forbidden" });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse((await request.text()).slice(0, 2000)) as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request." });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const frequency = body.frequency === "daily" ? "daily" : "weekly";
  if (!TOKEN_PATTERN.test(token)) return json(400, { error: "Invalid request." });
  if (!isValidEmail(email)) return json(400, { error: "Please enter a valid email address." });
  if (body.consent !== true) return json(400, { error: "Please tick the box to agree to the emails." });

  const ip = await checkRateLimit(`alerts-create:${clientIp(request)}`, 6, 3600);
  const perLink = await checkRateLimit(`alerts-create-token:${token}`, 3, 86_400);
  if (!ip.allowed || !perLink.allowed) return json(429, { error: "Too many sign-ups from here. Please try again later." });

  try {
    const report = await getReportByToken(token);
    if (!report) return json(404, { error: "These results have expired or the link is wrong." });
    const built = alertQueryFromReport(report);
    if (!built || built.query.anchors.length === 0) return json(422, { error: "We could not set up an alert from these results. Please run a new check." });

    const existing = await findAlert(email, report.id);
    let manageToken: string;
    if (existing) {
      await updateAlert(existing.id, { frequency, active: true, query: built.query, skills: built.skills, consent_at: new Date().toISOString() });
      manageToken = existing.manage_token;
    } else {
      const row = await createAlert({
        email,
        manageToken: newToken(),
        reportId: report.id,
        skills: built.skills,
        query: built.query,
        frequency,
        sentJobKeys: built.seenKeys,
      });
      manageToken = row.manage_token;
    }
    const mail = await sendAlertWelcome(email, {
      manageToken,
      frequency,
      titles: built.query.anchors.map((a) => a.title),
      where: whereText(built.query),
    });
    return json(200, { ok: true, emailed: mail.ok, updated: Boolean(existing) });
  } catch (err) {
    console.error("[alerts] create failed:", err instanceof Error ? err.message : err);
    return json(500, { error: "We could not set up the alert just now. Please try again." });
  }
}
