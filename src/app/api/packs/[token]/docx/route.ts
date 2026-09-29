import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { getPack, toView } from "@/lib/candidate/packs";
import { cvDocx, fileName, letterDocx, prepDocx } from "@/lib/candidate/docx";

// Word downloads for an approved job pack: ?doc=cv (the tailored CV),
// ?doc=letter (the cover letter) or ?doc=prep (the interview prep).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function text(status: number, message: string) {
  return new NextResponse(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function GET(request: NextRequest, { params }: Ctx) {
  const { allowed } = await checkRateLimit(`pack-docx:${clientIp(request)}`, 60, 600);
  if (!allowed) return text(429, "Too many downloads. Please wait a minute.");
  const { token } = await params;
  const doc = request.nextUrl.searchParams.get("doc") ?? "cv";
  try {
    const row = await getPack(token);
    if (!row) return text(404, "This pack has expired or the link is wrong.");
    const view = toView(row);
    if (!view.approvedAt) return text(409, "Approve your pack first: open it, check every section, then press Approve.");
    const name = view.tailoredCv?.contact.name ?? null;
    let buf: Buffer;
    let file: string;
    if (doc === "cv" && view.tailoredCv) {
      buf = await cvDocx(view.tailoredCv, view.job.title);
      file = fileName(name, "CV", view.job.title);
    } else if (doc === "letter" && view.coverLetter) {
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
      buf = await letterDocx(view.tailoredCv, view.coverLetter, view.job.title, view.job.company, date);
      file = fileName(name, "cover letter", view.job.title);
    } else if (doc === "prep" && view.interviewPrep) {
      buf = await prepDocx(view.interviewPrep, view.job.title, view.job.company);
      file = fileName("Interview prep", view.job.title);
    } else {
      return text(404, "That part of the pack is not there.");
    }
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": DOCX,
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return text(503, "Job packs are not switched on yet.");
    console.error("[packs] docx failed:", err instanceof Error ? err.message : err);
    return text(500, "We could not make that file. Please try again.");
  }
}
