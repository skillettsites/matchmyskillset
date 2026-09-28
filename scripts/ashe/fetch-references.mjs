#!/usr/bin/env node
// Snapshot the non-ASHE sources that back src/data/careers/occupations.ts.
//
//   node scripts/ashe/fetch-references.mjs
//
// Writes, under src/data/careers/sources/:
//   apprenticeship-standards.json  Skills England standards referenced by the curated list
//   ncs-job-profile-slugs.json      every job profile slug in the NCS sitemap
//   ncs-profiles.json               route facts extracted from each referenced NCS profile
//   soc2020-index-evidence.json     SOC 2020 Volume 2 coding index rows for each socIndexTitle
//   licence-checks.json             status and phrase checks for each licence body page
//
// Large downloads (the 78 MB standards API response and the 3.7 MB coding index)
// are cached in scripts/ashe/.cache, which is git-ignored.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { openWorkbook, toRows } from "./xlsx.mjs";
import { fetchNcsProfile, NCS_BASE } from "./ncs.mjs";
import { LICENCE } from "./config.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const CACHE = path.join(HERE, ".cache");
const OUT = path.join(ROOT, "src", "data", "careers", "sources");
const UA_BOT = "Mozilla/5.0 (compatible; MatchMySkillset data build; +https://matchmyskillset.com)";
// Some licence bodies block unknown agents, so page checks use a browser-style agent.
const UA_BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

const STANDARDS_API = "https://skillsengland.education.gov.uk/api/apprenticeshipstandards";
const NCS_SITEMAP = "https://nationalcareers.service.gov.uk/explore-careers/sitemap.xml";
const SOC_VOL2_PAGE =
  "https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020/soc2020volume2codingrulesandconventions";

const now = () => new Date().toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function load() {
  const occ = await import(pathToFileURL(path.join(ROOT, "src", "data", "careers", "occupations.ts")).href);
  const lic = await import(pathToFileURL(path.join(ROOT, "src", "data", "careers", "licences.ts")).href);
  return { occupations: occ.CAREER_OCCUPATIONS, licences: lic.LICENCES };
}

async function cached(name, url, { maxAgeHours = 24, userAgent = UA_BOT } = {}) {
  await mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, name);
  if (existsSync(file)) {
    const meta = JSON.parse((await readFile(file + ".meta.json", "utf8").catch(() => "{}")) || "{}");
    if (meta.retrievedAt && Date.now() - Date.parse(meta.retrievedAt) < maxAgeHours * 3600e3) {
      return { buf: await readFile(file), retrievedAt: meta.retrievedAt, url: meta.url };
    }
  }
  console.log(`Downloading ${url}`);
  const res = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const retrievedAt = now();
  await writeFile(file, buf);
  await writeFile(file + ".meta.json", JSON.stringify({ url: res.url, retrievedAt }));
  return { buf, retrievedAt, url: res.url };
}

// ---------------------------------------------------------------- Skills England
async function apprenticeshipStandards(occupations) {
  const refs = [...new Set(occupations.flatMap((o) => o.apprenticeships))].sort();
  const { buf, retrievedAt } = await cached("apprenticeshipstandards.json", STANDARDS_API);
  const all = JSON.parse(buf.toString("utf8"));
  const counts = {};
  for (const s of all) counts[s.status] = (counts[s.status] ?? 0) + 1;
  const standards = {};
  const missing = [];
  for (const ref of refs) {
    const versions = all.filter((s) => s.referenceNumber === ref);
    const current = versions.find((s) => s.status === "Approved for delivery") ?? versions[0];
    if (!current) {
      missing.push(ref);
      continue;
    }
    standards[ref] = {
      referenceNumber: current.referenceNumber,
      title: current.title,
      level: Number(current.level),
      typicalDurationMonths: Number(current.typicalDuration),
      status: current.status,
      version: current.version,
      route: current.route,
      larsCode: current.larsCode,
      maxFunding: current.maxFunding ? Number(current.maxFunding) : null,
      approvedForDelivery: current.approvedForDelivery || null,
      typicalJobTitles: current.typicalJobTitles ?? [],
      url: current.standardPageUrl,
    };
  }
  const out = {
    source: {
      publisher: "Skills England (Department for Education)",
      api: STANDARDS_API,
      retrievedAt,
      licence: LICENCE,
      note: "Snapshot of the standards referenced in occupations.ts, taken from the public apprenticeship standards API. typicalDurationMonths is the API's typicalDuration field; maxFunding is the funding band maximum in pounds.",
      statusCountsAtRetrieval: counts,
    },
    standards,
  };
  await writeFile(path.join(OUT, "apprenticeship-standards.json"), JSON.stringify(out, null, 1) + "\n");
  console.log(`Standards: ${Object.keys(standards).length} referenced, ${missing.length} not found ${missing.join(" ")}`);
}

// ---------------------------------------------------------------- National Careers Service
async function ncs(occupations) {
  // The NCS sitemap is not stable: three requests on 28 September 2026 returned 734,
  // 736 and 737 job profiles. Take the union of several requests, and treat a profile
  // page that resolves (not the sitemap) as the real check.
  const union = new Set();
  const counts = [];
  for (let i = 0; i < 3; i++) {
    const res = await fetch(NCS_SITEMAP, { headers: { "User-Agent": UA_BOT } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for NCS sitemap`);
    const found = [...(await res.text()).matchAll(/<loc>[^<]*\/job-profiles\/([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    counts.push(found.length);
    for (const s of found) union.add(s);
    await sleep(500);
  }
  const slugs = [...union].sort();
  await writeFile(
    path.join(OUT, "ncs-job-profile-slugs.json"),
    JSON.stringify(
      {
        source: {
          sitemap: NCS_SITEMAP,
          retrievedAt: now(),
          countsPerRequest: counts,
          count: slugs.length,
          note: "Union of several sitemap requests; the NCS sitemap returns a slightly different list on each request.",
        },
        slugs,
      },
      null,
      1,
    ) + "\n",
  );
  const wanted = [...new Set(occupations.map((o) => o.ncsProfile).filter(Boolean))].sort();
  const profiles = {};
  for (const slug of wanted) {
    const r = await fetchNcsProfile(slug, UA_BOT);
    profiles[slug] = r.ok ? { ok: true, retrievedAt: now(), ...r.profile } : { ok: false, status: r.status, finalUrl: r.finalUrl, retrievedAt: now() };
    await sleep(250);
  }
  const out = {
    source: {
      publisher: "National Careers Service (Department for Education)",
      base: NCS_BASE,
      licence: LICENCE,
      attribution: "Contains public sector information from the National Careers Service licensed under the Open Government Licence v3.0.",
      note: "The service is renamed 'Get careers information and advice' on 1 October 2026. URLs are recorded as they resolved when retrieved; re-run this script after the change to confirm or update them. NCS salary bands are deliberately not stored.",
    },
    profiles,
  };
  await writeFile(path.join(OUT, "ncs-profiles.json"), JSON.stringify(out, null, 1) + "\n");
  const bad = Object.entries(profiles).filter(([, p]) => !p.ok).map(([s]) => s);
  console.log(`NCS: ${slugs.length} slugs in sitemap, ${wanted.length} profiles fetched, ${bad.length} failed ${bad.join(" ")}`);
}

// ---------------------------------------------------------------- SOC 2020 Volume 2 coding index
async function socIndexEvidence(occupations) {
  const page = await (await fetch(SOC_VOL2_PAGE, { headers: { "User-Agent": UA_BOT } })).text();
  // ONS reissued this file as "...20260827v2.xlsx" on 28 September 2026, so allow a version suffix.
  const href = [...page.matchAll(/href="([^"]+codingindexexcel\d{8}(?:v\d+)?\.xlsx)"/g)].map((m) => m[1])[0];
  if (!href) throw new Error("SOC 2020 Volume 2 Excel link not found");
  const fileUrl = new URL(href.replace(/&amp;/g, "&"), "https://www.ons.gov.uk").toString();
  const { buf, retrievedAt } = await cached("soc2020volume2.xlsx", fileUrl, { maxAgeHours: 24 * 30 });
  const wb = await openWorkbook(buf);

  const info = toRows(await wb.readSheet("INFO"));
  const versionLine = info.flat().find((v) => typeof v === "string" && /Version \d+ Of The Standard Occupational Classification 2020 Index/i.test(v)) ?? null;

  const rows = toRows(await wb.readSheet("SOC2020 coding index"));
  const header = rows[1].map((h) => String(h ?? "").trim());
  const col = (name) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`Coding index column ${name} not found`);
    return i;
  };
  const c = {
    recno: col("RECNO"),
    soc: col("SOC_2020"),
    ext: col("SOC_2020_ext"),
    add: col("ADD"),
    ind: col("IND"),
    sug: col("SOC2020_ext_SUG_title"),
    natural: col("INDEXOCC_-_natural_word_order"),
  };
  const wantedTitles = new Set(occupations.flatMap((o) => o.socIndexTitles).map((t) => t.toLowerCase()));
  const entries = {};
  let total = 0;
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    total++;
    const natural = String(row[c.natural] ?? "").trim();
    const key = natural.toLowerCase();
    if (!wantedTitles.has(key)) continue;
    (entries[key] ??= []).push({
      recno: row[c.recno],
      title: natural,
      soc: String(row[c.soc]),
      ext: String(row[c.ext]),
      add: row[c.add] ?? null,
      ind: row[c.ind] ?? null,
      subUnitGroup: row[c.sug] ?? null,
    });
  }
  const out = {
    source: {
      title: "SOC 2020 Volume 2: the coding index",
      publisher: "Office for National Statistics",
      page: SOC_VOL2_PAGE,
      fileUrl,
      version: versionLine,
      recordsInIndex: total,
      retrievedAt,
      licence: LICENCE,
      note: "Only the index rows whose job title matches a socIndexTitles entry in occupations.ts are kept.",
    },
    entries,
  };
  await writeFile(path.join(OUT, "soc2020-index-evidence.json"), JSON.stringify(out, null, 1) + "\n");
  console.log(`SOC Volume 2 (${versionLine}): ${total} index rows, ${Object.keys(entries).length} of ${wantedTitles.size} titles found`);
}

// ---------------------------------------------------------------- Licence pages
async function licenceChecks(licences) {
  const out = { source: { retrievedAt: now(), userAgent: UA_BROWSER }, licences: {} };
  for (const lic of Object.values(licences)) {
    const pages = [];
    for (const src of lic.sources) {
      const phrases = [...src.phrases, ...Object.values(lic.appliesVia ?? {})];
      try {
        const res = await fetch(src.url, { headers: { "User-Agent": UA_BROWSER, Accept: "text/html" } });
        const text = (await res.text()).replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
        const lower = text.toLowerCase();
        const phrasesFound = [...new Set(phrases)].filter((p) => lower.includes(p.toLowerCase()));
        const required = src.phrases.every((p) => lower.includes(p.toLowerCase()));
        pages.push({ url: src.url, finalUrl: res.url, status: res.status, ok: res.ok && required, phrasesFound });
      } catch (err) {
        pages.push({ url: src.url, status: null, ok: false, error: String(err.message ?? err), phrasesFound: [] });
      }
      await sleep(250);
    }
    out.licences[lic.id] = { ok: pages.every((p) => p.ok), pages };
  }
  await writeFile(path.join(OUT, "licence-checks.json"), JSON.stringify(out, null, 1) + "\n");
  const bad = Object.entries(out.licences).filter(([, v]) => !v.ok).map(([k]) => k);
  console.log(`Licences: ${Object.keys(out.licences).length} checked, ${bad.length} failed ${bad.join(" ")}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const { occupations, licences } = await load();
  await apprenticeshipStandards(occupations);
  await ncs(occupations);
  await socIndexEvidence(occupations);
  await licenceChecks(licences);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
