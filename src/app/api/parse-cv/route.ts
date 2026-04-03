import { NextRequest, NextResponse } from "next/server";
import * as pdfParse from "pdf-parse";

// Extract text from a DOCX file (basic XML parsing, no heavy dependency)
async function extractDocxText(buffer: Buffer): Promise<string> {
  // DOCX is a zip containing XML. The main content is in word/document.xml
  // We'll use a simple approach: find XML text nodes
  const JSZip = await import("jszip").then((m) => m.default).catch(() => null);

  if (!JSZip) {
    // Fallback: try to extract readable text from raw buffer
    const raw = buffer.toString("utf-8");
    // Strip XML tags
    return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file("word/document.xml")?.async("string");

  if (!docXml) {
    throw new Error("Could not read document content");
  }

  // Extract text between XML tags, preserve paragraph breaks
  const text = docXml
    .replace(/<w:p[^>]*>/g, "\n") // paragraph breaks
    .replace(/<w:tab\/>/g, "\t") // tabs
    .replace(/<[^>]+>/g, "") // strip all XML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n") // collapse multiple newlines
    .trim();

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (fileName.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = (pdfParse as any).default || pdfParse;
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (fileName.endsWith(".docx")) {
      text = await extractDocxText(buffer);
    } else if (fileName.endsWith(".doc")) {
      // .doc (old format) - try raw text extraction
      text = buffer
        .toString("utf-8")
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    } else if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported file format. Please upload a PDF, DOCX, or TXT file.",
        },
        { status: 400 }
      );
    }

    // Clean up extracted text
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, " ")
      .replace(/ {2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this file. Please try pasting your CV text directly.",
        },
        { status: 400 }
      );
    }

    // Cap at 10,000 characters
    if (text.length > 10000) {
      text = text.slice(0, 10000);
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[parse-cv] Error:", error);
    return NextResponse.json(
      {
        error:
          "Could not read this file. Please try a different format or paste your CV text directly.",
      },
      { status: 500 }
    );
  }
}
