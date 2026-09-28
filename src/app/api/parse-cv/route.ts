import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Turns an uploaded CV (PDF, DOCX or TXT) into plain text for the CV box.
// Nothing is stored: the file lives in memory for this request only.
//
// PDF text comes from unpdf (a serverless build of PDF.js that needs no
// canvas or DOMMatrix), loaded only when a PDF arrives. The old pdf-parse 2.x
// import crashed the whole route at load time on Vercel.

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
// Multipart overhead on top of the file itself.
const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024;
const MAX_PDF_PAGES = 20;
const MAX_TEXT_CHARS = 12_000;
// DOCX zip-bomb guards: total uncompressed size and number of entries.
const MAX_DOCX_UNCOMPRESSED = 25 * 1024 * 1024;
const MAX_DOCX_ENTRIES = 2000;

class UserFacingError extends Error {}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function startsWith(buf: Buffer, bytes: number[]): boolean {
  return bytes.every((b, i) => buf[i] === b);
}

async function pdfText(buf: Buffer): Promise<string> {
  if (!startsWith(buf, [0x25, 0x50, 0x44, 0x46])) throw new UserFacingError("That file does not look like a PDF.");
  const { getDocumentProxy, extractText } = await import("unpdf");
  let pdf;
  try {
    pdf = await getDocumentProxy(new Uint8Array(buf));
  } catch {
    throw new UserFacingError("We could not open that PDF. If it is password protected, remove the password or paste the text instead.");
  }
  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new UserFacingError(`That PDF has ${pdf.numPages} pages. Please upload your CV only (up to ${MAX_PDF_PAGES} pages).`);
  }
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

async function docxText(buf: Buffer): Promise<string> {
  if (!startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) throw new UserFacingError("That file does not look like a Word .docx file.");
  const JSZip = (await import("jszip")).default;
  let zip;
  try {
    zip = await JSZip.loadAsync(buf);
  } catch {
    throw new UserFacingError("We could not open that Word file. Try saving it again as .docx, or paste the text instead.");
  }
  const entries = Object.values(zip.files);
  if (entries.length > MAX_DOCX_ENTRIES) throw new UserFacingError("That Word file is unusually large. Please paste the text instead.");
  let total = 0;
  for (const entry of entries) {
    // JSZip records each entry's declared uncompressed size when it reads the
    // central directory, before anything is inflated.
    const size = (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;
    total += size;
  }
  if (total > MAX_DOCX_UNCOMPRESSED) throw new UserFacingError("That Word file is unusually large. Please paste the text instead.");

  const doc = zip.file("word/document.xml");
  if (!doc) throw new UserFacingError("We could not find any text in that Word file.");
  const xml = await doc.async("string");
  if (xml.length > MAX_DOCX_UNCOMPRESSED) throw new UserFacingError("That Word file is unusually large. Please paste the text instead.");
  return decodeXml(
    xml
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<w:br\/>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, "")
  );
}

function tidyText(text: string): string {
  return text
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\t/g, " ")
    .replace(/[  ]{2,}/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return fail(403, "Forbidden");

  // Refuse oversized uploads from the declared length, before reading the body.
  const declared = Number(request.headers.get("content-length") || 0);
  if (!declared) return fail(411, "Please choose a file to upload.");
  if (declared > MAX_BODY_BYTES) return fail(413, "That file is too big. The limit is 5 MB.");

  const { allowed, retryAfter } = await checkRateLimit(`parse-cv:${clientIp(request)}`, 20, 600);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
  } catch {
    return fail(400, "We could not read that upload. Please try again.");
  }
  if (!file) return fail(400, "Please choose a file to upload.");
  if (file.size > MAX_FILE_BYTES) return fail(413, "That file is too big. The limit is 5 MB.");
  if (file.size === 0) return fail(400, "That file is empty.");

  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    let raw: string;
    if (name.endsWith(".pdf")) raw = await pdfText(buf);
    else if (name.endsWith(".docx")) raw = await docxText(buf);
    else if (name.endsWith(".txt")) raw = buf.toString("utf8");
    else if (name.endsWith(".doc")) {
      return fail(415, "Old .doc files cannot be read. Please save it as .docx or PDF, or paste the text.");
    } else {
      return fail(415, "Please upload a PDF, Word (.docx) or text (.txt) file.");
    }

    let text = tidyText(raw);
    if (text.length < 40) {
      return fail(
        422,
        name.endsWith(".pdf")
          ? "We could not find text in that PDF. It may be a scanned image. Please paste your CV text instead."
          : "We could not find enough text in that file. Please paste your CV text instead."
      );
    }
    const truncated = text.length > MAX_TEXT_CHARS;
    if (truncated) text = text.slice(0, MAX_TEXT_CHARS);
    return NextResponse.json({ text, truncated });
  } catch (err) {
    if (err instanceof UserFacingError) return fail(422, err.message);
    console.error("[parse-cv] extraction failed:", err instanceof Error ? err.message : err);
    return fail(500, "We could not read that file. Please paste your CV text instead.");
  }
}
