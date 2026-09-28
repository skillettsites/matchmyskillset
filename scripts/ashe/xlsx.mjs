// Minimal, dependency-light .xlsx reader built on jszip (already a project dependency).
// It reads cell values exactly as stored in the workbook XML, so figures are not
// reformatted, rounded or coerced beyond Number() for numeric cells.

import JSZip from "jszip";

const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function decodeXml(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (_, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITY[e];
  });
}

function textOf(xmlFragment) {
  // Concatenate every <t> run, ignoring phonetic runs (<rPh>).
  const noPhonetic = xmlFragment.replace(/<rPh\b[\s\S]*?<\/rPh>/g, "");
  let out = "";
  for (const m of noPhonetic.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g)) {
    out += m[1] ? decodeXml(m[1]) : "";
  }
  return out;
}

function attr(attrs, name) {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

/** Column letters (A, B, ..., AA) to a zero-based index. */
export function colIndex(letters) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function colLetters(index) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * Open a workbook. Returns { sheetNames, readSheet(name) } where readSheet
 * gives a Map of "A1"-style references to raw values: numbers for numeric
 * cells, strings for text cells.
 */
export async function openWorkbook(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const read = async (p) => {
    const f = zip.file(p);
    return f ? f.async("string") : null;
  };

  const workbookXml = await read("xl/workbook.xml");
  const relsXml = await read("xl/_rels/workbook.xml.rels");
  if (!workbookXml || !relsXml) throw new Error("Not a valid xlsx workbook");

  const rels = new Map();
  for (const m of relsXml.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = attr(m[1], "Id");
    const target = attr(m[1], "Target");
    if (id && target) rels.set(id, target);
  }

  const sheets = [];
  for (const m of workbookXml.matchAll(/<sheet\b([^>]*)\/?>/g)) {
    const name = decodeXml(attr(m[1], "name") ?? "");
    const rid = attr(m[1], "r:id");
    let target = rels.get(rid) ?? "";
    target = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
    sheets.push({ name, path: target });
  }

  const sharedXml = await read("xl/sharedStrings.xml");
  const shared = [];
  if (sharedXml) {
    for (const m of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>|<si\/>/g)) shared.push(m[1] ? textOf(m[1]) : "");
  }

  async function readSheet(name) {
    const sheet = sheets.find((s) => s.name === name);
    if (!sheet) throw new Error(`Sheet not found: ${name}`);
    const xml = await read(sheet.path);
    if (!xml) throw new Error(`Sheet part missing: ${sheet.path}`);
    const cells = new Map();
    for (const m of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = m[1];
      const body = m[2] ?? "";
      const ref = attr(attrs, "r");
      if (!ref) continue;
      const type = attr(attrs, "t");
      const vMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      let value;
      if (type === "s") {
        value = vMatch ? shared[Number(vMatch[1])] : undefined;
      } else if (type === "inlineStr") {
        value = textOf(body);
      } else if (type === "str" || type === "e") {
        value = vMatch ? decodeXml(vMatch[1]) : undefined;
      } else if (type === "b") {
        value = vMatch ? vMatch[1] === "1" : undefined;
      } else {
        value = vMatch ? Number(vMatch[1]) : undefined;
      }
      if (value !== undefined) cells.set(ref, value);
    }
    return cells;
  }

  return { sheetNames: sheets.map((s) => s.name), readSheet };
}

/** Turn a cell map into an array of rows (arrays), 1-based row numbers preserved via index. */
export function toRows(cells) {
  const rows = [];
  for (const [ref, value] of cells) {
    const m = ref.match(/^([A-Z]+)(\d+)$/);
    if (!m) continue;
    const r = Number(m[2]);
    const c = colIndex(m[1]);
    (rows[r] ??= [])[c] = value;
  }
  return rows; // rows[rowNumber][columnIndex]
}
