#!/usr/bin/env node
// Build the ASHE Table 14 occupation pay dataset and the SOC 2020 unit group list.
//
//   node scripts/ashe/build.mjs            download from ons.gov.uk, parse, write JSON
//   node scripts/ashe/build.mjs --offline  re-parse the committed raw files only
//
// Outputs:
//   scripts/ashe/raw/<year>-<edition>/table-14.7a-*.xlsx and table-14.7b-*.xlsx (raw ONS files)
//   scripts/ashe/raw/<year>-<edition>/manifest.json (URLs, hashes, retrieval time)
//   scripts/ashe/raw/soc2020-volume1/soc2020-volume1.xlsx and manifest.json
//   src/data/careers/ashe-data.json   (every SOC 2020 unit group with ASHE figures)
//   src/data/careers/soc2020.json     (official titles, ONS entry-route text, related job titles)

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { openWorkbook, toRows, colIndex } from "./xlsx.mjs";
import {
  ASHE_YEAR,
  ASHE_EDITION,
  DATASET_PAGE,
  editionZipUrl,
  EDITIONS,
  SOC_VOLUME1_PAGE,
  SOC_VOLUME1_FILE_PATTERN,
  LICENCE,
  TABLES,
  SHEETS,
  COLUMNS,
  HEADER_ROW,
} from "./config.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const CACHE = path.join(HERE, ".cache");
const RAW = path.join(HERE, "raw");
const OUT_DIR = path.join(ROOT, "src", "data", "careers");
const UA = "Mozilla/5.0 (compatible; MatchMySkillset data build; +https://matchmyskillset.com)";

const args = new Set(process.argv.slice(2));
const OFFLINE = args.has("--offline");
const yearArg = process.argv.find((a) => a.startsWith("--year="));
const editionArg = process.argv.find((a) => a.startsWith("--edition="));
const YEAR = yearArg ? Number(yearArg.split("=")[1]) : ASHE_YEAR;
const EDITION = editionArg ? editionArg.split("=")[1] : ASHE_EDITION;
const EDITION_KEY = `${YEAR}-${EDITION}`;
const EDITION_DIR = path.join(RAW, EDITION_KEY);
const SOC_DIR = path.join(RAW, "soc2020-volume1");

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchText(url) {
  return (await fetchBuffer(url)).toString("utf8");
}

function absolute(href) {
  return new URL(href.replace(/&amp;/g, "&"), "https://www.ons.gov.uk").toString();
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

// ---------------------------------------------------------------------------
// 1. Get the raw files (download, or reuse committed copies when --offline)
// ---------------------------------------------------------------------------

async function getAsheFiles() {
  await mkdir(EDITION_DIR, { recursive: true });
  const manifestPath = path.join(EDITION_DIR, "manifest.json");

  if (OFFLINE) {
    if (!existsSync(manifestPath)) throw new Error(`No committed raw files for ${EDITION_KEY}; run without --offline`);
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const est = await readFile(path.join(EDITION_DIR, manifest.files.estimates.savedAs));
    const cv = await readFile(path.join(EDITION_DIR, manifest.files.cv.savedAs));
    for (const [k, buf] of [["estimates", est], ["cv", cv]]) {
      if (sha256(buf) !== manifest.files[k].sha256) throw new Error(`Hash mismatch for committed ${k} file`);
    }
    return { manifest, est, cv };
  }

  console.log(`Fetching dataset page ${DATASET_PAGE}`);
  const page = await fetchText(DATASET_PAGE);
  const links = [...page.matchAll(/href="([^"]+\.zip)"/g)].map((m) => m[1]);
  const wanted = links.find((h) => h.includes(`/${YEAR}${EDITION}/`));
  const zipUrl = wanted ? absolute(wanted) : editionZipUrl(YEAR, EDITION);
  if (!wanted) console.warn(`  Link for ${YEAR} ${EDITION} not found on page; trying ${zipUrl}`);

  const text = stripTags(page);
  const releaseOnPage = text.match(/Release date:\s*(\d{1,2} \w+ \d{4})/)?.[1] ?? null;
  const latestEditionOnPage = text.match(/Edition in this dataset\s*(\d{4} \w+)/)?.[1] ?? null;

  console.log(`Downloading ${zipUrl}`);
  const zipBuf = await fetchBuffer(zipUrl);
  await mkdir(CACHE, { recursive: true });
  const zipName = decodeURIComponent(zipUrl.split("/").pop());
  await writeFile(path.join(CACHE, zipName), zipBuf);

  const zip = await JSZip.loadAsync(zipBuf);
  const entries = Object.keys(zip.files).filter((n) => n.toLowerCase().endsWith(".xlsx"));
  const find = (pattern, notPattern) => {
    const hit = entries.filter((n) => pattern.test(n) && !(notPattern && notPattern.test(n)));
    if (hit.length !== 1) throw new Error(`Expected one file matching ${pattern}, found ${hit.length}`);
    return hit[0];
  };
  const estName = find(TABLES.estimates.pattern, /CV/i);
  const cvName = find(TABLES.cv.pattern);
  const est = await zip.file(estName).async("nodebuffer");
  const cv = await zip.file(cvName).async("nodebuffer");
  const estDate = zip.file(estName).date;

  const files = {
    estimates: {
      table: TABLES.estimates.id,
      originalName: path.basename(estName),
      savedAs: "table-14.7a-annual-pay-gross.xlsx",
      sha256: sha256(est),
      bytes: est.length,
      zipEntryDate: estDate?.toISOString?.() ?? null,
    },
    cv: {
      table: TABLES.cv.id,
      originalName: path.basename(cvName),
      savedAs: "table-14.7b-annual-pay-gross-cv.xlsx",
      sha256: sha256(cv),
      bytes: cv.length,
      zipEntryDate: zip.file(cvName).date?.toISOString?.() ?? null,
    },
  };
  await writeFile(path.join(EDITION_DIR, files.estimates.savedAs), est);
  await writeFile(path.join(EDITION_DIR, files.cv.savedAs), cv);

  const manifest = {
    dataset: "Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14",
    publisher: "Office for National Statistics",
    year: YEAR,
    edition: EDITION,
    datasetPage: DATASET_PAGE,
    zipUrl,
    zipSha256: sha256(zipBuf),
    zipBytes: zipBuf.length,
    retrievedAt: new Date().toISOString(),
    releaseDateOnPageAtRetrieval: releaseOnPage,
    latestEditionOnPageAtRetrieval: latestEditionOnPage,
    licence: LICENCE,
    files,
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return { manifest, est, cv };
}

async function getSocVolume1() {
  await mkdir(SOC_DIR, { recursive: true });
  const manifestPath = path.join(SOC_DIR, "manifest.json");
  const savedAs = "soc2020-volume1.xlsx";
  if (OFFLINE) {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const buf = await readFile(path.join(SOC_DIR, savedAs));
    if (sha256(buf) !== manifest.sha256) throw new Error("Hash mismatch for committed SOC Volume 1 file");
    return { manifest, buf };
  }
  console.log(`Fetching SOC 2020 Volume 1 page ${SOC_VOLUME1_PAGE}`);
  const page = await fetchText(SOC_VOLUME1_PAGE);
  const href = [...page.matchAll(/href="([^"]+\.xlsx)"/g)].map((m) => m[1]).find((h) => SOC_VOLUME1_FILE_PATTERN.test(h));
  if (!href) throw new Error("SOC 2020 Volume 1 Excel link not found");
  const url = absolute(href);
  const fileVersion = href.match(SOC_VOLUME1_FILE_PATTERN)[1];
  console.log(`Downloading ${url}`);
  const buf = await fetchBuffer(url);
  await writeFile(path.join(SOC_DIR, savedAs), buf);
  const manifest = {
    title: "SOC 2020 Volume 1: structure and descriptions of unit groups",
    publisher: "Office for National Statistics",
    page: SOC_VOLUME1_PAGE,
    fileUrl: url,
    originalName: decodeURIComponent(url.split("/").pop()),
    fileVersionInName: `${fileVersion.slice(0, 4)}-${fileVersion.slice(4, 6)}-${fileVersion.slice(6, 8)}`,
    savedAs,
    sha256: sha256(buf),
    bytes: buf.length,
    retrievedAt: new Date().toISOString(),
    licence: LICENCE,
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return { manifest, buf };
}

// ---------------------------------------------------------------------------
// 2. Parse
// ---------------------------------------------------------------------------

const MARKERS = new Set(["x", "..", ":", "-", "."]);

function readValue(raw) {
  if (typeof raw === "number") return { value: raw, flag: null };
  if (raw === undefined || raw === null) return { value: null, flag: "blank" };
  const s = String(raw).trim();
  if (s === "") return { value: null, flag: "blank" };
  if (MARKERS.has(s)) return { value: null, flag: s };
  const n = Number(s);
  if (Number.isFinite(n)) return { value: n, flag: null };
  throw new Error(`Unexpected cell value "${s}"`);
}

function checkHeaders(rows, label) {
  const header = rows[HEADER_ROW] ?? [];
  const row3 = rows[3] ?? [];
  const row4 = rows[4] ?? [];
  for (const c of COLUMNS) {
    const i = colIndex(c.col);
    const candidates = [header[i], row4[i], row3[i]].map((v) => (typeof v === "string" ? v.trim() : v));
    if (!candidates.some((v) => v === c.header)) {
      throw new Error(`${label}: column ${c.col} expected header "${c.header}", found ${JSON.stringify(candidates)}`);
    }
  }
}

async function parseTable(buffer, sheetName, label) {
  const wb = await openWorkbook(buffer);
  const cells = await wb.readSheet(sheetName);
  const rows = toRows(cells);
  checkHeaders(rows, `${label} ${sheetName}`);
  const title = String(rows[1]?.[0] ?? "").trim();
  const out = new Map();
  let national = null;
  const footnotes = [];
  for (let r = HEADER_ROW + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const desc = typeof row[0] === "string" ? row[0] : "";
    const code = row[1] === undefined ? "" : String(row[1]).trim();
    if (/^[a-z]\s{2}/.test(desc) || desc.startsWith("KEY") || desc.startsWith("Source:") || desc.startsWith("The quality")) {
      footnotes.push(desc.trim());
      continue;
    }
    if (!desc && !code) continue;
    const record = { row: r, description: desc.replace(/\s+/g, " ").trim(), code, values: {}, flags: {} };
    for (const c of COLUMNS.slice(2)) {
      const { value, flag } = readValue(row[colIndex(c.col)]);
      record.values[c.key] = value;
      if (flag) record.flags[c.key] = flag;
    }
    if (code === "" && record.description === "All employees") national = record;
    else if (/^\d{1,4}$/.test(code)) {
      if (out.has(code)) throw new Error(`${label} ${sheetName}: duplicate code ${code}`);
      out.set(code, record);
    }
  }
  return { title, rows: out, national, footnotes };
}

// Coverage statements quoted from the "Notes" sheet of Table 14.7a, so pages can
// explain what the figures cover without paraphrasing from memory.
async function readCoverageNotes(buffer) {
  const wb = await openWorkbook(buffer);
  const rows = toRows(await wb.readSheet("Notes"));
  const lines = rows.filter(Boolean).map((r) => String(r[0] ?? "").trim()).filter(Boolean);
  const pick = (re) => lines.find((l) => re.test(l)) ?? null;
  return {
    coverage: pick(/^ASHE covers employee jobs/),
    annualPeriod: pick(/^Annual estimates are provided for the tax year/),
    sample: pick(/^ASHE is based on a 1% sample/),
    suppression: pick(/^Estimates with a CV greater than 20% are suppressed/),
    jobCounts: pick(/^Indicative counts for the number of jobs/),
  };
}

async function parseSocVolume1(buffer) {
  const wb = await openWorkbook(buffer);
  const rows = toRows(await wb.readSheet("SOC2020 descriptions"));
  const header = (rows[1] ?? []).map((v) => String(v ?? "").replace(/\s+/g, " ").trim());
  const idx = (name) => {
    const i = header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    if (i < 0) throw new Error(`SOC Volume 1: column "${name}" not found in ${JSON.stringify(header)}`);
    return i;
  };
  const cMajor = idx("SOC2020 Major Group");
  const cSubMajor = idx("SOC2020 Sub-Major Group");
  const cMinor = idx("SOC2020 Minor Group");
  const cUnit = idx("SOC2020 Unit Group");
  const cTitle = idx("SOC2020 Group Title");
  const cDesc = idx("Group Description");
  const cEntry = idx("Typical Entry Routes And Associated Qualifications");
  const cRelated = idx("Related Job Titles");
  const clean = (v) => {
    const s = String(v ?? "").trim();
    return s === "<blank>" ? "" : s;
  };
  const groups = {};
  const unitGroups = {};
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const codes = [cMajor, cSubMajor, cMinor, cUnit].map((c) => clean(row[c]));
    const code = codes.find((c) => c) ?? "";
    if (!code) continue;
    const title = clean(row[cTitle]).replace(/\s+/g, " ");
    if (codes[3]) {
      unitGroups[code] = {
        title,
        description: clean(row[cDesc]).replace(/\s+/g, " "),
        entryRoutes: clean(row[cEntry]).replace(/\s+/g, " "),
        relatedJobTitles: clean(row[cRelated])
          .split(/\n/)
          .map((t) => t.replace(/^~\s*/, "").trim())
          .filter(Boolean),
      };
    } else {
      const level = codes[0] ? "major" : codes[1] ? "subMajor" : "minor";
      groups[code] = { title, level };
    }
  }
  return { groups, unitGroups };
}

// ---------------------------------------------------------------------------
// 3. Assemble
// ---------------------------------------------------------------------------

function figures(estRecord, cvRecord) {
  const f = { ...estRecord.values };
  const cv = {};
  for (const c of COLUMNS.slice(2)) {
    if (c.key.endsWith("ChangePct")) continue; // ONS gives no CV for the change columns
    cv[c.key] = cvRecord.values[c.key];
  }
  const out = { ...f, cv };
  if (Object.keys(estRecord.flags).length) out.flags = estRecord.flags;
  return out;
}

function normaliseTitle(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function main() {
  const meta = EDITIONS[EDITION_KEY];
  if (!meta) throw new Error(`Add an EDITIONS["${EDITION_KEY}"] entry to scripts/ashe/config.mjs first`);

  const { manifest, est, cv } = await getAsheFiles();
  const soc = await getSocVolume1();

  const tables = {};
  for (const [basis, sheet] of Object.entries(SHEETS)) {
    const e = await parseTable(est, sheet, "14.7a");
    const c = await parseTable(cv, sheet, "14.7b");
    if (e.rows.size !== c.rows.size) throw new Error(`${sheet}: estimate and CV tables have different row counts`);
    for (const [code, rec] of e.rows) {
      const cr = c.rows.get(code);
      if (!cr) throw new Error(`${sheet}: code ${code} missing from CV table`);
      if (cr.row !== rec.row) throw new Error(`${sheet}: code ${code} on row ${rec.row} in 14.7a but ${cr.row} in 14.7b`);
    }
    tables[basis] = { est: e, cv: c };
  }

  const socParsed = await parseSocVolume1(soc.buf);
  const onsNotes = await readCoverageNotes(est);
  for (const [k, v] of Object.entries(onsNotes)) if (!v) throw new Error(`Notes sheet: could not find the "${k}" statement`);

  const unitCodes = [...tables.ft.est.rows.keys()].filter((c) => c.length === 4);
  const allUnitCodes = [...tables.all.est.rows.keys()].filter((c) => c.length === 4);
  if (unitCodes.join() !== allUnitCodes.join()) throw new Error("Full-time and All sheets list different unit groups");
  const socCodes = Object.keys(socParsed.unitGroups);
  const missingInSoc = unitCodes.filter((c) => !socParsed.unitGroups[c]);
  const missingInAshe = socCodes.filter((c) => !unitCodes.includes(c));
  if (missingInSoc.length || missingInAshe.length) {
    throw new Error(`SOC/ASHE code mismatch. Not in SOC Vol 1: ${missingInSoc}. Not in ASHE: ${missingInAshe}`);
  }

  const unitGroups = {};
  const titleDifferences = [];
  for (const code of unitCodes) {
    const ftE = tables.ft.est.rows.get(code);
    const title = socParsed.unitGroups[code].title;
    const entry = {
      title,
      ft: figures(ftE, tables.ft.cv.rows.get(code)),
      all: figures(tables.all.est.rows.get(code), tables.all.cv.rows.get(code)),
    };
    if (normaliseTitle(ftE.description) !== normaliseTitle(title)) {
      entry.asheLabel = ftE.description;
      titleDifferences.push({ code, soc: title, ashe: ftE.description });
    }
    unitGroups[code] = entry;
  }

  const groups = {};
  for (const [code, rec] of tables.ft.est.rows) {
    if (code.length === 4) continue;
    const socGroup = socParsed.groups[code];
    groups[code] = {
      title: socGroup?.title ?? rec.description,
      level: code.length === 1 ? "major" : code.length === 2 ? "subMajor" : "minor",
      ft: figures(rec, tables.ft.cv.rows.get(code)),
      all: figures(tables.all.est.rows.get(code), tables.all.cv.rows.get(code)),
    };
  }

  const source = {
    publisher: "Office for National Statistics",
    survey: "Annual Survey of Hours and Earnings (ASHE)",
    dataset: manifest.dataset,
    table: TABLES.estimates.id,
    cvTable: TABLES.cv.id,
    measure: "Annual pay - Gross (£)",
    year: YEAR,
    edition: EDITION,
    releaseDate: meta.releaseDate,
    correction: meta.correction ?? null,
    classification: "SOC 2020",
    geography: "United Kingdom",
    annualReferencePeriod: `tax year ending 5 April ${YEAR}`,
    tableFootnoteA: tables.ft.est.footnotes.find((f) => f.startsWith("a"))?.replace(/^a\s+/, "") ?? null,
    tableFootnoteB: tables.ft.est.footnotes.find((f) => f.startsWith("b"))?.replace(/^b\s+/, "") ?? null,
    onsNotes,
    tableTitles: { ft: tables.ft.est.title, all: tables.all.est.title },
    datasetUrl: DATASET_PAGE,
    fileUrl: manifest.zipUrl,
    zipSha256: manifest.zipSha256,
    retrievedAt: manifest.retrievedAt,
    licence: LICENCE,
    attribution: "Source: Office for National Statistics licensed under the Open Government Licence v3.0.",
    // Wording of the key printed on each ONS data sheet ("blank" is our label for an empty cell).
    markers: {
      x: "CV > 20%: estimates are considered unreliable for practical purposes (suppressed by ONS)",
      "..": "disclosive (suppressed by ONS)",
      ":": "not applicable",
      "-": "nil or negligible",
      ".": "unavailable",
      blank: "cell left empty in the ONS table",
    },
    qualityKey: [
      { maxCv: 5, label: "precise" },
      { maxCv: 10, label: "reasonably precise" },
      { maxCv: 20, label: "acceptable" },
    ],
  };

  const socSource = {
    title: soc.manifest.title,
    publisher: soc.manifest.publisher,
    pageUrl: soc.manifest.page,
    fileUrl: soc.manifest.fileUrl,
    fileVersion: soc.manifest.fileVersionInName,
    sha256: soc.manifest.sha256,
    retrievedAt: soc.manifest.retrievedAt,
    licence: LICENCE,
    attribution:
      "Contains public sector information from ONS SOC 2020 Volume 1 licensed under the Open Government Licence v3.0.",
  };

  const asheOut = {
    source,
    national: {
      ft: figures(tables.ft.est.national, tables.ft.cv.national),
      all: figures(tables.all.est.national, tables.all.cv.national),
    },
    groups,
    unitGroups,
  };

  const socOut = { source: socSource, groups: socParsed.groups, unitGroups: socParsed.unitGroups };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "ashe-data.json"), JSON.stringify(asheOut) + "\n");
  await writeFile(path.join(OUT_DIR, "soc2020.json"), JSON.stringify(socOut) + "\n");

  const sizes = await Promise.all(["ashe-data.json", "soc2020.json"].map((f) => stat(path.join(OUT_DIR, f))));
  const ftMedians = unitCodes.filter((c) => unitGroups[c].ft.median !== null).length;
  const allMedians = unitCodes.filter((c) => unitGroups[c].all.median !== null).length;
  console.log(`\nASHE ${YEAR} ${EDITION}: ${unitCodes.length} unit groups, ${Object.keys(groups).length} higher-level groups`);
  console.log(`  full-time median published for ${ftMedians}, all-employee median for ${allMedians}`);
  console.log(`  SOC Volume 1 file version ${soc.manifest.fileVersionInName}; ${titleDifferences.length} titles worded differently in ASHE`);
  console.log(`  wrote ashe-data.json (${(sizes[0].size / 1024).toFixed(0)} KB) and soc2020.json (${(sizes[1].size / 1024).toFixed(0)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
