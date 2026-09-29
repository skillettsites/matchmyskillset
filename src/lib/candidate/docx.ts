// Word (.docx) files for a job pack: the tailored CV, the cover letter and the
// interview prep. Server code only.
//
// Built directly as Office Open XML with JSZip (already a dependency, used by
// /api/parse-cv) rather than the `docx` package: its current releases pull in
// a newer @types/node than this project uses. The files are deliberately
// plain (one font, real headings, real bulleted lists, A4, 2 cm margins) so
// they open cleanly in Word, Google Docs, Pages and LibreOffice, and applicant
// tracking systems can read them.

import JSZip from "jszip";
import type { InterviewPrep, TailoredCv } from "./pack-types";

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function xml(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface RunOpts {
  bold?: boolean;
  italic?: boolean;
  size?: number; // half-points
  color?: string;
}

function run(text: string, o: RunOpts = {}): string {
  const props = [o.bold ? "<w:b/>" : "", o.italic ? "<w:i/>" : "", o.color ? `<w:color w:val="${o.color}"/>` : "", o.size ? `<w:sz w:val="${o.size}"/><w:szCs w:val="${o.size}"/>` : ""].join("");
  // Line breaks inside one paragraph become <w:br/>.
  const parts = text.split("\n").map((t, i) => `${i > 0 ? "<w:br/>" : ""}<w:t xml:space="preserve">${xml(t)}</w:t>`);
  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ""}${parts.join("")}</w:r>`;
}

interface ParaOpts {
  style?: "Title" | "Heading1" | "Heading2" | "ListParagraph";
  bullet?: boolean;
  after?: number; // twips
  before?: number;
  keepNext?: boolean;
}

function para(runs: string | string[], o: ParaOpts = {}): string {
  const body = Array.isArray(runs) ? runs.join("") : runs;
  const props = [
    o.style ? `<w:pStyle w:val="${o.style}"/>` : "",
    o.keepNext ? "<w:keepNext/>" : "",
    o.bullet ? `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>` : "",
    o.after !== undefined || o.before !== undefined ? `<w:spacing w:before="${o.before ?? 0}" w:after="${o.after ?? 0}"/>` : "",
  ].join("");
  return `<w:p>${props ? `<w:pPr>${props}</w:pPr>` : ""}${body}</w:p>`;
}

const bullet = (text: string) => para(run(text), { style: "ListParagraph", bullet: true });
const heading = (text: string) => para(run(text), { style: "Heading1", keepNext: true });

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="en-GB" w:eastAsia="en-GB" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:color w:val="1D1D1F"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="40"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="2" w:color="D2D2D7"/></w:pBdr><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:caps/><w:color w:val="0071E3"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="40"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="40"/><w:ind w:left="360" w:hanging="360"/></w:pPr></w:style>
</w:styles>`;

const NUMBERING = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="${W}">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="singleLevel"/>
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="360"/></w:pPr></w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`;

const APP = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>MatchMySkillset</Application></Properties>`;

function core(title: string, author: string): string {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${xml(title)}</dc:title>
  <dc:creator>${xml(author)}</dc:creator>
  <dc:language>en-GB</dc:language>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

async function pack(body: string, title: string, author: string): Promise<Buffer> {
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body>
</w:document>`;
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", ROOT_RELS);
  zip.file("docProps/core.xml", core(title, author));
  zip.file("docProps/app.xml", APP);
  zip.file("word/document.xml", document);
  zip.file("word/styles.xml", STYLES);
  zip.file("word/numbering.xml", NUMBERING);
  zip.file("word/_rels/document.xml.rels", DOC_RELS);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

function contactLine(cv: TailoredCv): string {
  const c = cv.contact;
  return [c.location, c.phone, c.email, ...c.links].filter(Boolean).join("  |  ");
}

function header(cv: TailoredCv): string {
  const out: string[] = [];
  if (cv.contact.name) out.push(para(run(cv.contact.name), { style: "Title" }));
  const contact = contactLine(cv);
  if (contact) out.push(para(run(contact, { color: "6E6E73", size: 19 }), { after: 120 }));
  return out.join("");
}

export function cvDocxBody(cv: TailoredCv): string {
  const out: string[] = [header(cv)];
  if (cv.summary) out.push(heading("Profile"), para(run(cv.summary)));
  if (cv.keySkills.length) out.push(heading("Key skills"), ...cv.keySkills.map(bullet));
  if (cv.experience.length) {
    out.push(heading("Experience"));
    for (const r of cv.experience) {
      const titleRuns = [run(r.title || r.employer, { bold: true })];
      if (r.title && r.employer) titleRuns.push(run(`, ${r.employer}`));
      out.push(para(titleRuns, { before: 120, after: 0, keepNext: true }));
      const meta = [r.dates, r.location].filter(Boolean).join("  |  ");
      if (meta) out.push(para(run(meta, { italic: true, color: "6E6E73", size: 19 }), { after: 60, keepNext: r.bullets.length > 0 }));
      out.push(...r.bullets.map(bullet));
    }
  }
  if (cv.education.length) {
    out.push(heading("Education"));
    for (const e of cv.education) {
      const runs = [run(e.qualification || e.institution, { bold: true })];
      if (e.qualification && e.institution) runs.push(run(`, ${e.institution}`));
      if (e.dates) runs.push(run(`  |  ${e.dates}`, { color: "6E6E73" }));
      out.push(para(runs, { after: 60 }));
    }
  }
  if (cv.certifications.length) out.push(heading("Certifications"), ...cv.certifications.map(bullet));
  for (const s of cv.otherSections) out.push(heading(s.heading), ...s.items.map(bullet));
  return out.join("");
}

export function cvDocx(cv: TailoredCv, jobTitle: string): Promise<Buffer> {
  return pack(cvDocxBody(cv), `CV for ${jobTitle}`, cv.contact.name ?? "MatchMySkillset");
}

export function letterDocx(cv: TailoredCv | null, letter: string, jobTitle: string, company: string, date: string): Promise<Buffer> {
  const out: string[] = [];
  if (cv) out.push(header(cv));
  out.push(para(run(date), { before: 240, after: 240 }));
  out.push(para(run(`Application for ${jobTitle}${company ? `, ${company}` : ""}`, { bold: true }), { after: 240 }));
  for (const block of letter.split(/\n\s*\n/)) {
    if (block.trim()) out.push(para(run(block.trim()), { after: 200 }));
  }
  return pack(out.join(""), `Cover letter for ${jobTitle}`, cv?.contact.name ?? "MatchMySkillset");
}

export function prepDocx(prep: InterviewPrep, jobTitle: string, company: string): Promise<Buffer> {
  const out: string[] = [para(run(`Interview prep: ${jobTitle}`), { style: "Title" })];
  if (company) out.push(para(run(company, { color: "6E6E73" }), { after: 120 }));
  out.push(heading("Questions they may ask"));
  prep.questions.forEach((q, i) => {
    out.push(para(run(`${i + 1}. ${q.question}`), { style: "Heading2" }));
    if (q.whyTheyAsk) out.push(para(run(q.whyTheyAsk, { italic: true, color: "6E6E73" })));
    out.push(...q.answerPoints.map(bullet));
  });
  if (prep.questionsToAsk.length) out.push(heading("Questions to ask them"), ...prep.questionsToAsk.map(bullet));
  return pack(out.join(""), `Interview prep for ${jobTitle}`, "MatchMySkillset");
}

/** A safe, readable file name: letters, digits and hyphens. */
export function fileName(...parts: (string | null | undefined)[]): string {
  const name = parts
    .filter(Boolean)
    .join(" ")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
  return `${name || "job-pack"}.docx`;
}
