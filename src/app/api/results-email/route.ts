import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { getCareerOccupation } from "@/data/careers";
import { isMatchesDoc } from "@/lib/skills/profile";
import { TOKEN_PATTERN, getReportByToken, setReportEmail } from "@/lib/apis/reports-db";
import { isValidEmail, sendResultsLink } from "@/lib/email/results-email";

// "Email me this link" on a results page. Sends one email with the results
// link, built only from stored data (titles from our dataset, never from the
// request), and keeps the address with the results for 12 months as the
// privacy policy says.

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ip = clientIp(request);
  const { allowed, retryAfter } = await checkRateLimit(`results-email:${ip}`, 5, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Too many emails from here. Please try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  let token = "";
  let email = "";
  try {
    const body = JSON.parse((await request.text()).slice(0, 2000)) as Record<string, unknown>;
    token = typeof body.token === "string" ? body.token : "";
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!TOKEN_PATTERN.test(token)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const perLink = await checkRateLimit(`results-email-token:${token}`, 3, 86_400);
  if (!perLink.allowed) return NextResponse.json({ error: "This link has already been emailed a few times today." }, { status: 429 });

  try {
    const report = await getReportByToken(token);
    if (!report) return NextResponse.json({ error: "These results have expired or the link is wrong." }, { status: 404 });
    const topTitles = isMatchesDoc(report.matches)
      ? report.matches.items.slice(0, 3).map((m) => getCareerOccupation(m.occupationId)?.title).filter((t): t is string => Boolean(t))
      : [];
    const sent = await sendResultsLink(email, { token, currentRole: report.current_role, topTitles });
    if (!sent.ok) {
      return NextResponse.json({ error: "We could not send the email just now. Please copy the link from your address bar instead." }, { status: 502 });
    }
    await setReportEmail(report.id, email.toLowerCase());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[results-email] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
