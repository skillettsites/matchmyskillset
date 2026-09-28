import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { deleteAlertByToken, getAlertByToken, updateAlert } from "@/lib/candidates/db";

// The manage page for a job alert (/alerts/<token>): change how often,
// pause, resume, or delete it. The private token in the email link is the
// only key.

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { allowed } = await checkRateLimit(`alerts-manage:${clientIp(request)}`, 30, 600);
  if (!allowed) return NextResponse.json({ error: "Too many changes. Please wait a few minutes." }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse((await request.text()).slice(0, 1000)) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const action = typeof body.action === "string" ? body.action : "";
  try {
    if (action === "delete") {
      await deleteAlertByToken(token);
      return NextResponse.json({ ok: true, deleted: true });
    }
    const alert = await getAlertByToken(token);
    if (!alert) return NextResponse.json({ error: "This alert no longer exists." }, { status: 404 });
    if (action === "frequency") {
      const frequency = body.frequency === "daily" ? "daily" : "weekly";
      await updateAlert(alert.id, { frequency });
      return NextResponse.json({ ok: true, frequency });
    }
    if (action === "pause" || action === "resume") {
      await updateAlert(alert.id, { active: action === "resume" });
      return NextResponse.json({ ok: true, active: action === "resume" });
    }
    if (action === "salary") {
      const n = Number(body.salaryMin);
      const salaryMin = Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 500_000) : null;
      if (alert.query) await updateAlert(alert.id, { query: { ...alert.query, salaryMin } });
      return NextResponse.json({ ok: true, salaryMin });
    }
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  } catch (err) {
    console.error("[alerts/manage] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
