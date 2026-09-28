#!/usr/bin/env node
// Validate the careers dataset against its sources.
//
//   node scripts/ashe/validate.mjs              spot-check against the committed ONS files
//   node scripts/ashe/validate.mjs --download   also re-download the ONS zip and confirm the
//                                               committed files are byte-identical to it
//   node scripts/ashe/validate.mjs --seed=123   repeat a previous random sample
//   node scripts/ashe/validate.mjs --samples=60 change the number of random spot checks
//
// Exits with code 1 if any check fails.

import { createHash, randomInt } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import JSZip from "jszip";
import { openWorkbook } from "./xlsx.mjs";
import { ASHE_YEAR, ASHE_EDITION, COLUMNS, SHEETS, TABLES, HEADER_ROW } from "./config.mjs";
import { apprenticeshipEvidence, licenceEvidence, qualificationEvidence } from "./evidence.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const CAREERS = path.join(ROOT, "src", "data", "careers");
const RAW_DIR = path.join(HERE, "raw", `${ASHE_YEAR}-${ASHE_EDITION}`);

const argv = process.argv.slice(2);
const arg = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const DOWNLOAD = argv.includes("--download");
const SEED = Number(arg("seed") ?? randomInt(1, 2 ** 31 - 1));
const SAMPLES = Math.max(15, Number(arg("samples") ?? 40));

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`  FAIL ${msg}`);
};
const ok = (msg) => console.log(`  ok   ${msg}`);
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const readJson = async (p) => JSON.parse(await readFile(p, "utf8"));

// Small seeded PRNG (mulberry32) so a sample can be repeated with --seed.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- 1. raw files
async function checkRawFiles() {
  console.log(`\n1. Raw ONS files (ASHE ${ASHE_YEAR} ${ASHE_EDITION})`);
  const manifest = await readJson(path.join(RAW_DIR, "manifest.json"));
  const est = await readFile(path.join(RAW_DIR, manifest.files.estimates.savedAs));
  const cv = await readFile(path.join(RAW_DIR, manifest.files.cv.savedAs));
  for (const [k, buf] of [["estimates", est], ["cv", cv]]) {
    if (sha256(buf) === manifest.files[k].sha256) ok(`${manifest.files[k].originalName} matches recorded SHA-256`);
    else fail(`${manifest.files[k].savedAs} does not match the SHA-256 in manifest.json`);
  }
  if (DOWNLOAD) {
    console.log(`  downloading ${manifest.zipUrl}`);
    const res = await fetch(manifest.zipUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MatchMySkillset validation)" } });
    const zipBuf = Buffer.from(await res.arrayBuffer());
    if (sha256(zipBuf) === manifest.zipSha256) ok("ONS zip on ons.gov.uk today is byte-identical to the one parsed");
    else console.log("  note ONS zip hash differs from the one recorded (ONS may have reissued it); comparing the two tables inside");
    const zip = await JSZip.loadAsync(zipBuf);
    for (const [k, local] of [["estimates", est], ["cv", cv]]) {
      const entry = Object.keys(zip.files).find((n) => n.endsWith(manifest.files[k].originalName));
      if (!entry) {
        fail(`${manifest.files[k].originalName} not found in the downloaded zip`);
        continue;
      }
      const remote = await zip.file(entry).async("nodebuffer");
      if (sha256(remote) === sha256(local)) ok(`${manifest.files[k].originalName} in the live ONS zip is identical to the committed copy`);
      else fail(`${manifest.files[k].originalName} in the live ONS zip differs from the committed copy`);
    }
  }
  return { manifest, est, cv };
}

// ---------------------------------------------------------------- 2. random spot checks
async function spotChecks(est, cv, ashe) {
  console.log(`\n2. Spot checks against the ONS workbooks (seed ${SEED}, ${SAMPLES} random cells plus fixed checks)`);
  // Independent lookup path: find the row by scanning column B for the code, then
  // read the cell by its A1 reference. This does not reuse the build's row parser.
  const books = { est: await openWorkbook(est), cv: await openWorkbook(cv) };
  const sheets = {};
  for (const [kind, wb] of Object.entries(books)) {
    for (const [basis, name] of Object.entries(SHEETS)) {
      const cells = await wb.readSheet(name);
      const rowOf = new Map();
      for (const [ref, v] of cells) {
        const m = ref.match(/^B(\d+)$/);
        if (m && Number(m[1]) > HEADER_ROW && typeof v === "string" && /^\d{4}$/.test(v.trim())) rowOf.set(v.trim(), Number(m[1]));
      }
      sheets[`${kind}:${basis}`] = { cells, rowOf, name };
    }
  }
  const levelCols = COLUMNS.filter((c) => !["description", "code"].includes(c.key));
  const cvCols = levelCols.filter((c) => !c.key.endsWith("ChangePct"));
  const codes = Object.keys(ashe.unitGroups);
  const rand = prng(SEED);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const checks = [
    { code: "2134", basis: "ft", kind: "est", col: levelCols.find((c) => c.key === "median") },
    { code: "3544", basis: "ft", kind: "est", col: levelCols.find((c) => c.key === "p25") },
    { code: "3312", basis: "ft", kind: "est", col: levelCols.find((c) => c.key === "median") },
    { code: "1161", basis: "all", kind: "est", col: levelCols.find((c) => c.key === "median") },
  ];
  for (let i = 0; i < SAMPLES; i++) {
    const kind = rand() < 0.75 ? "est" : "cv";
    checks.push({ code: pick(codes), basis: rand() < 0.6 ? "ft" : "all", kind, col: pick(kind === "est" ? levelCols : cvCols) });
  }

  const rows = [];
  let passed = 0;
  for (const c of checks) {
    const sheet = sheets[`${c.kind}:${c.basis}`];
    const r = sheet.rowOf.get(c.code);
    const ref = `${c.col.col}${r}`;
    const onsRaw = sheet.cells.get(ref);
    const onsValue = typeof onsRaw === "number" ? onsRaw : null;
    const onsShown = onsRaw === undefined ? "(empty)" : String(onsRaw);
    const fig = ashe.unitGroups[c.code][c.basis];
    const ours = c.kind === "est" ? fig[c.col.key] : fig.cv[c.col.key];
    let match = ours === onsValue;
    if (match && c.kind === "est" && onsValue === null) {
      const expectedFlag = onsRaw === undefined || String(onsRaw).trim() === "" ? "blank" : String(onsRaw).trim();
      match = fig.flags?.[c.col.key] === expectedFlag;
    }
    if (match) passed++;
    const table = c.kind === "est" ? TABLES.estimates.id : TABLES.cv.id;
    rows.push(
      `  ${match ? "ok  " : "FAIL"} ${c.code} ${c.basis.padEnd(3)} ${(c.kind === "cv" ? "cv." : "") + c.col.key}`.padEnd(40) +
        `Table ${table} '${sheet.name}'!${ref}`.padEnd(38) +
        `ONS ${onsShown}`.padEnd(14) +
        `dataset ${ours === null ? "null" + (fig.flags?.[c.col.key] ? ` [${fig.flags[c.col.key]}]` : "") : ours}`,
    );
    if (!match) failures++;
  }
  console.log(rows.join("\n"));
  console.log(`  ${passed}/${checks.length} cells match the ONS workbook`);
}

// ---------------------------------------------------------------- 3. dataset structure
async function checkStructure(ashe, soc) {
  console.log("\n3. Dataset structure");
  const codes = Object.keys(ashe.unitGroups);
  if (codes.length === 412) ok("412 SOC 2020 unit groups in ashe-data.json");
  else fail(`expected 412 unit groups, found ${codes.length}`);
  const socCodes = Object.keys(soc.unitGroups);
  const same = codes.length === socCodes.length && codes.every((c) => soc.unitGroups[c]);
  if (same) ok("ASHE unit groups and SOC 2020 Volume 1 unit groups are the same 412 codes");
  else fail("ASHE and SOC 2020 Volume 1 code lists differ");
  const bad = codes.filter((c) => !/^\d{4}$/.test(c));
  if (!bad.length) ok("every code is 4 digits");
  else fail(`non 4-digit codes: ${bad.join(", ")}`);
  const ftPublished = codes.filter((c) => ashe.unitGroups[c].ft.median !== null).length;
  const allPublished = codes.filter((c) => ashe.unitGroups[c].all.median !== null).length;
  ok(`full-time median published for ${ftPublished} of 412; all-employee median for ${allPublished} of 412 (the rest are null with an ONS marker)`);
  const unflaggedNulls = [];
  for (const c of codes) {
    for (const basis of ["ft", "all"]) {
      const f = ashe.unitGroups[c][basis];
      for (const col of COLUMNS.slice(2)) if (f[col.key] === null && !f.flags?.[col.key]) unflaggedNulls.push(`${c}.${basis}.${col.key}`);
    }
  }
  if (!unflaggedNulls.length) ok("every null figure carries the ONS marker that explains it");
  else fail(`nulls without a marker: ${unflaggedNulls.slice(0, 10).join(", ")}`);
}

// ---------------------------------------------------------------- 4. curated occupations
const EM_DASH = String.fromCharCode(0x2014);

async function checkCurated(ashe, soc) {
  console.log("\n4. Curated occupations (src/data/careers/occupations.ts)");
  const { CAREER_OCCUPATIONS: occupations } = await import(pathToFileURL(path.join(CAREERS, "occupations.ts")).href);
  const { LICENCES } = await import(pathToFileURL(path.join(CAREERS, "licences.ts")).href);
  const { SKILLS } = await import(pathToFileURL(path.join(ROOT, "src", "data", "skills-taxonomy.ts")).href);
  const src = path.join(CAREERS, "sources");
  const standards = (await readJson(path.join(src, "apprenticeship-standards.json"))).standards;
  const ncsProfiles = (await readJson(path.join(src, "ncs-profiles.json"))).profiles;
  const ncsSlugs = new Set((await readJson(path.join(src, "ncs-job-profile-slugs.json"))).slugs);
  const indexEvidence = (await readJson(path.join(src, "soc2020-index-evidence.json"))).entries;
  const licenceChecks = (await readJson(path.join(src, "licence-checks.json"))).licences;

  const skillIds = new Set(SKILLS.map((s) => s.id));
  const problems = [];
  const p = (occ, msg) => problems.push(`${occ.id}: ${msg}`);
  const notSitemap = [];
  const evidenceCounts = {};
  const count = (k) => (evidenceCounts[k] = (evidenceCounts[k] ?? 0) + 1);
  const ids = new Set();

  for (const occ of occupations) {
    if (ids.has(occ.id)) p(occ, "duplicate id");
    ids.add(occ.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(occ.id)) p(occ, "id is not a lower-case slug");

    // SOC code exists in both ONS sources
    if (!ashe.unitGroups[occ.soc]) p(occ, `SOC ${occ.soc} not in ASHE Table 14`);
    if (!soc.unitGroups[occ.soc]) p(occ, `SOC ${occ.soc} not in SOC 2020 Volume 1`);

    // SOC mapping evidence from the Volume 2 coding index
    if (!occ.socIndexTitles.length) p(occ, "no socIndexTitles");
    for (const t of occ.socIndexTitles) {
      const rows = (indexEvidence[t.toLowerCase()] ?? []).filter((r) => r.soc === occ.soc);
      if (!rows.length) p(occ, `"${t}" is not coded to ${occ.soc} in the SOC 2020 coding index`);
    }
    const firstRows = (indexEvidence[(occ.socIndexTitles[0] ?? "").toLowerCase()] ?? []).filter((r) => r.soc === occ.soc);
    if (firstRows.length && !firstRows.some((r) => r.ext === occ.socExt)) {
      p(occ, `socExt ${occ.socExt} does not match the index (${[...new Set(firstRows.map((r) => r.ext))].join(", ")})`);
    }

    // Skills
    if (occ.skills.length < 4) p(occ, "fewer than 4 skills");
    const seen = new Set();
    for (const s of occ.skills) {
      if (!skillIds.has(s.skillId)) p(occ, `unknown skill id ${s.skillId}`);
      if (seen.has(s.skillId)) p(occ, `skill ${s.skillId} listed twice`);
      seen.add(s.skillId);
      if (!Number.isInteger(s.importance) || s.importance < 1 || s.importance > 5) p(occ, `importance ${s.importance} out of range for ${s.skillId}`);
    }

    // NCS profile
    const profile = occ.ncsProfile ? ncsProfiles[occ.ncsProfile] : null;
    if (occ.ncsProfile) {
      // The sitemap varies between requests, so a missing slug is only a note; the
      // hard check is that the profile page itself resolved without the soft-404 redirect.
      if (!ncsSlugs.has(occ.ncsProfile)) notSitemap.push(occ.ncsProfile);
      if (!profile?.ok) p(occ, `NCS profile ${occ.ncsProfile} did not resolve`);
    }

    // Apprenticeships
    for (const ref of occ.apprenticeships) {
      const std = standards[ref];
      if (!std) {
        p(occ, `apprenticeship ${ref} not in the Skills England snapshot`);
        continue;
      }
      if (std.status !== "Approved for delivery") p(occ, `apprenticeship ${ref} status is "${std.status}"`);
      const ev = apprenticeshipEvidence(occ, std, profile);
      if (!ev) p(occ, `no evidence links ${ref} "${std.title}" to this occupation`);
      else count(`apprenticeship: ${ev}`);
    }

    // Licences
    for (const id of occ.licences) {
      const lic = LICENCES[id];
      if (!lic) {
        p(occ, `unknown licence ${id}`);
        continue;
      }
      if (!licenceChecks[id]?.ok) p(occ, `licence page check failed for ${id}`);
      const ev = licenceEvidence(occ, lic, profile, soc.unitGroups[occ.soc]?.entryRoutes, licenceChecks[id]);
      if (!ev) p(occ, `no evidence that ${id} applies`);
      else count(`licence: ${ev.split(" mentions")[0].split(" lists")[0]}`);
    }

    // Named qualifications
    for (const q of occ.qualifications) {
      if (!qualificationEvidence(q, profile)) p(occ, `qualification "${q}" is not named on the NCS profile`);
      else count("qualification: named on NCS profile");
    }

    // Pay notes that say ONS suppressed the median must match the data
    if (occ.payNote && /suppressed the 2025 full-time median/.test(occ.payNote) && ashe.unitGroups[occ.soc]?.ft.median !== null) {
      p(occ, "payNote says the full-time median is suppressed but ASHE has a figure");
    }
    if (occ.soc === "3312" && ashe.unitGroups["3312"].ft.median !== null) p(occ, "expected the 3312 full-time median to be suppressed");

    // No em dashes in any text
    const text = JSON.stringify(occ);
    if (text.includes(EM_DASH)) p(occ, "contains an em dash");
  }

  // Licence registry pages
  for (const [id, chk] of Object.entries(licenceChecks)) {
    if (!chk.ok) problems.push(`licence ${id}: page check failed (${chk.pages.map((pg) => `${pg.status} ${pg.url}`).join("; ")})`);
  }

  if (problems.length) for (const m of problems) fail(m);
  const socs = new Set(occupations.map((o) => o.soc));
  ok(`${occupations.length} curated occupations across ${socs.size} SOC 2020 unit groups; ${problems.length} problems`);
  ok(`every curated SOC code exists in ASHE Table 14 and SOC 2020 Volume 1: ${occupations.every((o) => ashe.unitGroups[o.soc] && soc.unitGroups[o.soc])}`);
  ok(`every skill id exists in skills-taxonomy.ts: ${occupations.every((o) => o.skills.every((s) => skillIds.has(s.skillId)))}`);
  const audiences = {};
  for (const o of occupations) for (const a of o.audiences) audiences[a] = (audiences[a] ?? 0) + 1;
  ok(`audiences: ${Object.entries(audiences).map(([k, v]) => `${k} ${v}`).join(", ")}; no degree usually needed: ${occupations.filter((o) => !o.degreeUsuallyRequired).length}`);
  ok(
    `with NCS profile ${occupations.filter((o) => o.ncsProfile).length}, with apprenticeships ${occupations.filter((o) => o.apprenticeships.length).length} (${new Set(occupations.flatMap((o) => o.apprenticeships)).size} standards), with licences ${occupations.filter((o) => o.licences.length).length}`,
  );
  for (const [k, v] of Object.entries(evidenceCounts).sort()) console.log(`       evidence ${k}: ${v}`);
  if (notSitemap.length) console.log(`       note: resolved NCS profiles missing from the sitemap snapshot: ${notSitemap.join(", ")}`);
  const shared = [...socs].map((s) => [s, occupations.filter((o) => o.soc === s).map((o) => o.id)]).filter(([, l]) => l.length > 1);
  console.log(`       ${shared.length} unit groups are shared by more than one curated occupation (pages must say pay covers the whole unit group)`);

  // Taxonomy defects fixed in this change
  const names = SKILLS.map((s) => s.name);
  const dupNames = names.filter((n, i) => names.indexOf(n) !== i);
  if (!dupNames.length) ok("skills taxonomy: no duplicate skill names");
  else fail(`skills taxonomy: duplicate names ${dupNames.join(", ")}`);
  const broken = SKILLS.flatMap((s) => s.relatedSkillIds.filter((r) => !skillIds.has(r)).map((r) => `${s.id}->${r}`));
  if (!broken.length) ok("skills taxonomy: every relatedSkillIds reference exists");
  else fail(`skills taxonomy: broken adjacency ${broken.join(", ")}`);
}

// ---------------------------------------------------------------- 5. em dashes in added files
async function checkEmDashes() {
  console.log("\n5. No em dashes in the added or edited files");
  const files = [];
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (![".cache", "raw", "node_modules"].includes(e.name)) await walk(p);
      } else if (/\.(ts|mjs|json|md)$/.test(e.name)) files.push(p);
    }
  };
  await walk(CAREERS);
  await walk(HERE);
  files.push(path.join(ROOT, "src", "data", "skills-taxonomy.ts"));
  const hits = [];
  for (const f of files) if ((await readFile(f, "utf8")).includes(EM_DASH)) hits.push(path.relative(ROOT, f));
  if (!hits.length) ok(`${files.length} files checked, none contains an em dash`);
  else for (const h of hits) fail(`em dash found in ${h}`);
}

async function main() {
  const { est, cv } = await checkRawFiles();
  const ashe = await readJson(path.join(CAREERS, "ashe-data.json"));
  const soc = await readJson(path.join(CAREERS, "soc2020.json"));
  await spotChecks(est, cv, ashe);
  await checkStructure(ashe, soc);
  await checkCurated(ashe, soc);
  await checkEmDashes();
  console.log(`\n${failures === 0 ? "PASS" : "FAIL"}: ${failures} failure(s). Rerun this sample with --seed=${SEED}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
