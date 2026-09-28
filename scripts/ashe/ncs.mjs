// Extract structured facts from a National Careers Service job profile page.
// NCS content is Crown copyright, available under the Open Government Licence v3.0.
// Only route facts are kept (routes, entry requirements, named apprenticeships,
// registration and restrictions). NCS salary bands are deliberately NOT stored:
// they carry no source or date, and ONS ASHE is the pay source for this dataset.

import { decodeXml } from "./xlsx.mjs";

export const NCS_BASE = "https://nationalcareers.service.gov.uk/job-profiles/";

function clean(html) {
  return decodeXml(
    html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&ndash;/g, "-")
      .replace(/&mdash;/g, "-"),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function listItems(html) {
  return [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => clean(m[1])).filter(Boolean);
}

function section(html, id) {
  const start = html.search(new RegExp(`<section[^>]*\\bid="${id}"`, "i"));
  if (start < 0) return null;
  // Sections are not nested at this level, so the next </section> closes it.
  const end = html.indexOf("</section>", start);
  return html.slice(start, end < 0 ? undefined : end);
}

function entryRequirements(sectionHtml) {
  if (!sectionHtml) return [];
  const i = sectionHtml.search(/<h4[^>]*>\s*Entry requirements/i);
  if (i < 0) return [];
  const rest = sectionHtml.slice(i);
  const ul = rest.match(/<ul class="list-reqs">([\s\S]*?)<\/ul>/);
  return ul ? listItems(ul[1]) : [];
}

function firstList(sectionHtml) {
  if (!sectionHtml) return [];
  const ul = sectionHtml.match(/<ul>([\s\S]*?)<\/ul>/);
  return ul ? listItems(ul[1]) : [];
}

const ROUTE_WORDS = [
  ["university", /university course|degree/i],
  ["college", /college course/i],
  ["apprenticeship", /apprenticeship/i],
  ["work", /working towards|start as|work your way|moving into/i],
  ["volunteering", /volunteer/i],
  ["direct", /applying directly|apply directly/i],
  ["specialist", /specialist courses|training scheme|private training|graduate training/i],
];

export function parseNcsProfile(html, slug) {
  const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  const altMatch = html.match(/Alternative titles for this job include <\/span>([\s\S]*?)<\/h2>/);
  const alternativeTitles = altMatch ? clean(altMatch[1]).split(/,\s*/).filter(Boolean) : [];

  const how = section(html, "HowToBecome") ?? "";
  const intro = how.match(/You can get into this job through:\s*<\/p>\s*<ul>([\s\S]*?)<\/ul>/);
  const routeLines = intro ? listItems(intro[1]) : [];
  const routes = [];
  for (const line of routeLines) {
    const hit = ROUTE_WORDS.find(([, re]) => re.test(line));
    routes.push({ text: line, type: hit ? hit[0] : "other" });
  }

  const uni = section(html, "University");
  const college = section(html, "College");
  const app = section(html, "Apprenticeship");
  const work = section(html, "work");
  const vol = section(html, "volunteering");
  const direct = section(html, "directapplication");
  const other = section(html, "otherroutes");
  const more = section(html, "moreinfo");
  const restrictions = section(html, "restrictions");

  let registration = [];
  if (more) {
    const reg = more.match(/<h4[^>]*>\s*Registration\s*<\/h4>\s*<ul>([\s\S]*?)<\/ul>/i);
    if (reg) registration = listItems(reg[1]);
  }

  const apprenticeshipsNamed = firstList(app).filter((t) => /apprenticeship/i.test(t));
  // Some profiles state the level once and list the names underneath, for example
  // "You can apply to do a Level 3 Advanced Apprenticeship ... Apprenticeships include:"
  // followed by a list. Each listed name is recorded as "<name> Level N Apprenticeship".
  if (app) {
    for (const m of app.matchAll(/<p>([\s\S]*?)<\/p>\s*<ul>([\s\S]*?)<\/ul>/g)) {
      const lead = clean(m[1]);
      const level = lead.match(/Level (\d)\b[^.]*Apprenticeship/i)?.[1];
      if (!level || !/:\s*$/.test(lead)) continue;
      for (const item of listItems(m[2])) {
        if (!/Level \d/i.test(item) && item.split(" ").length <= 8) apprenticeshipsNamed.push(`${item} Level ${level} Apprenticeship`);
      }
    }
  }
  const extraApprenticeships = app
    ? [...clean(app).matchAll(/([A-Z][A-Za-z,()'\- ]+?Level \d+ (?:Foundation|Intermediate|Advanced|Higher|Degree) Apprenticeship)/g)].map((m) => m[1].trim())
    : [];
  const named = [...new Set([...apprenticeshipsNamed, ...extraApprenticeships])];

  return {
    slug,
    url: NCS_BASE + slug,
    title,
    alternativeTitles,
    routes,
    entryRequirements: {
      university: entryRequirements(uni),
      college: entryRequirements(college),
      apprenticeship: entryRequirements(app),
    },
    apprenticeshipsNamed: named,
    hasSections: {
      university: Boolean(uni),
      college: Boolean(college),
      apprenticeship: Boolean(app),
      work: Boolean(work),
      volunteering: Boolean(vol),
      directApplication: Boolean(direct),
      otherRoutes: Boolean(other),
    },
    registration,
    restrictions: restrictions ? listItems(restrictions) : [],
    // Plain text of the "How to become" and "More information" parts, kept so the
    // validator can confirm any qualification named in occupations.ts appears on the page.
    howToBecomeText: clean(how).slice(0, 6000),
    moreInformationText: more ? clean(more).slice(0, 3000) : "",
  };
}

/** Fetch a profile. Returns null when NCS answers with its soft-404 redirect. */
export async function fetchNcsProfile(slug, userAgent) {
  const res = await fetch(NCS_BASE + slug, { headers: { "User-Agent": userAgent }, redirect: "follow" });
  const finalUrl = res.url;
  if (!res.ok || /\/alerts\/404/.test(finalUrl)) return { ok: false, status: res.status, finalUrl };
  const html = await res.text();
  return { ok: true, status: res.status, finalUrl, profile: parseNcsProfile(html, slug) };
}
