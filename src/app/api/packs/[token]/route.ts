import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin, isSameSiteRequest } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { deletePack, getPack, saveEdits, toView } from "@/lib/candidate/packs";
import { readCv, readLetter, readPrep } from "@/lib/candidate/sanitize";
import { NOT_SWITCHED_ON } from "@/lib/candidate/plans";

// One job pack, by its private link: read it (never the CV text it was
// written from), save the person's edits and approval, or delete it.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function GET(request: NextRequest, { params }: Ctx) {
  if (!isSameSiteRequest(request)) return fail(403, "Forbidden");
  const { allowed } = await checkRateLimit(`pack-read:${clientIp(request)}`, 240, 600);
  if (!allowed) return fail(429, "Too many requests. Please wait a minute.");
  const { token } = await params;
  try {
    const row = await getPack(token);
    if (!row) return fail(404, "This pack has expired or the link is wrong.");
    return NextResponse.json({ pack: toView(row) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return fail(503, NOT_SWITCHED_ON);
    console.error("[packs] read failed:", err instanceof Error ? err.message : err);
    return fail(500, "We could not load your pack. Please refresh in a minute.");
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!isAllowedOrigin(request)) return fail(403, "Forbidden");
  const { allowed } = await checkRateLimit(`pack-save:${clientIp(request)}`, 120, 600);
  if (!allowed) return fail(429, "Too many saves. Please wait a minute.");
  const { token } = await params;
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse((await request.text()).slice(0, 120_000));
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return fail(400, "Invalid request.");
  }
  try {
    const row = await getPack(token);
    if (!row) return fail(404, "This pack has expired or the link is wrong.");
    if (row.status !== "ready" && !(row.status === "queued" && row.tailored_cv)) return fail(409, "Your pack is still being written. Save again once it is ready.");
    const saved = await saveEdits(row, {
      tailoredCv: "tailoredCv" in body ? readCv(body.tailoredCv) : undefined,
      coverLetter: "coverLetter" in body ? readLetter(body.coverLetter) : undefined,
      interviewPrep: "interviewPrep" in body ? readPrep(body.interviewPrep) : undefined,
      approve: body.approve === true,
    });
    return NextResponse.json({ pack: toView(saved) });
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return fail(503, NOT_SWITCHED_ON);
    console.error("[packs] save failed:", err instanceof Error ? err.message : err);
    return fail(500, "We could not save your changes. Please try again.");
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  if (!isAllowedOrigin(request)) return fail(403, "Forbidden");
  const { allowed } = await checkRateLimit(`pack-delete:${clientIp(request)}`, 30, 600);
  if (!allowed) return fail(429, "Too many requests. Please wait a minute.");
  const { token } = await params;
  try {
    const row = await getPack(token);
    if (!row) return fail(404, "This pack has already gone.");
    if (row.status === "generating") return fail(409, "Your pack is being written right now. Delete it once it is ready.");
    await deletePack(row.id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return fail(503, NOT_SWITCHED_ON);
    console.error("[packs] delete failed:", err instanceof Error ? err.message : err);
    return fail(500, "We could not delete the pack. Please try again.");
  }
}
