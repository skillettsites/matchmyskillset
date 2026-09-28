// Joins stored matches with the careers dataset for display: ONS pay, entry
// routes, licences and the "why this fits" text. Server-side only.
//
// Pay is looked up at render time, not stored with the results, so a results
// link always shows the dataset the site currently carries and the source
// line printed next to it.

import ncsRaw from "@/data/careers/sources/ncs-profiles.json";
import {
  SOURCE,
  cvQuality,
  getAsheUnitGroup,
  getCareerProfile,
  sourceLine,
  type ApprenticeshipStandard,
  type AsheFigures,
} from "@/data/careers";
import { getCurrentJob, type CurrentJob } from "./job-lookup";
import { skillName } from "./taxonomy";
import type { MatchEntry, ProfileSkill, SkillsDoc } from "./profile";

interface NcsProfile {
  ok: boolean;
  slug: string;
  url: string;
  title: string;
  routes?: { text: string; type: string }[];
  entryRequirements?: Record<string, string[]>;
  registration?: string[];
  restrictions?: string[];
}

const NCS = ncsRaw as unknown as {
  source: { attribution: string; publisher: string };
  profiles: Record<string, NcsProfile>;
};

export const NCS_ATTRIBUTION = NCS.source.attribution;

export const PAY_SOURCE = {
  name: `ONS, Annual Survey of Hours and Earnings ${SOURCE.year} (${SOURCE.edition}), Table ${SOURCE.table}`,
  href: SOURCE.datasetUrl,
  published: SOURCE.releaseDate,
  line: sourceLine(),
};

export interface PayPicture {
  /** "ft" = full-time employees, "all" = all employee jobs; null when ONS published neither median. */
  basis: "ft" | "all" | null;
  median: number | null;
  /** Only set when ONS published both ends on the same basis. */
  p25: number | null;
  p75: number | null;
  p10: number | null;
  p90: number | null;
  jobsThousands: number | null;
  /** ONS quality band for the median, from its coefficient of variation. */
  quality: string | null;
  basisLabel: string;
}

function pickPay(ft: AsheFigures, all: AsheFigures): PayPicture {
  const basis = ft.median !== null ? "ft" : all.median !== null ? "all" : null;
  const f = basis === "ft" ? ft : basis === "all" ? all : null;
  const bothQuartiles = f && f.p25 !== null && f.p75 !== null;
  const bothDeciles = f && f.p10 !== null && f.p90 !== null;
  return {
    basis,
    median: f?.median ?? null,
    p25: bothQuartiles ? f!.p25 : null,
    p75: bothQuartiles ? f!.p75 : null,
    p10: bothDeciles ? f!.p10 : null,
    p90: bothDeciles ? f!.p90 : null,
    jobsThousands: f?.jobsThousands ?? null,
    quality: f ? cvQuality(f.cv.median) : null,
    basisLabel:
      basis === "ft"
        ? "full-time employees"
        : basis === "all"
          ? "all employees, including part-time (ONS did not publish a reliable full-time figure)"
          : "ONS did not publish a reliable figure",
  };
}

export function payForSoc(soc: string): PayPicture | null {
  const ug = getAsheUnitGroup(soc);
  return ug ? pickPay(ug.ft, ug.all) : null;
}

/** Destination minus current median, only when both are on the same basis. */
export function payChange(destSoc: string, currentSoc: string | undefined): { change: number; basis: "ft" | "all" } | null {
  if (!currentSoc) return null;
  const d = getAsheUnitGroup(destSoc);
  const c = getAsheUnitGroup(currentSoc);
  if (!d || !c) return null;
  if (d.ft.median !== null && c.ft.median !== null) return { change: d.ft.median - c.ft.median, basis: "ft" };
  if (d.all.median !== null && c.all.median !== null) return { change: d.all.median - c.all.median, basis: "all" };
  return null;
}

export interface NamedSkill {
  id: string;
  name: string;
  importance: number;
  evidence?: string;
  viaName?: string;
}

export interface PresentedMatch {
  occupationId: string;
  title: string;
  description: string;
  soc: string;
  socTitle: string;
  score: number;
  matched: NamedSkill[];
  related: NamedSkill[];
  gaps: NamedSkill[];
  pay: PayPicture;
  payChange: { change: number; basis: "ft" | "all" } | null;
  payScope: string;
  payNote?: string;
  degreeUsuallyRequired: boolean;
  apprenticeships: ApprenticeshipStandard[];
  licences: { name: string; body: string; summary: string; scope?: string; url: string }[];
  qualifications: string[];
  ncsUrl: string | null;
  /** Ways in listed on the National Careers Service profile, e.g. "an apprenticeship". */
  ncsRoutes: string[];
  ncsEntryRequirements: Record<string, string[]>;
  onsEntryRoutes: string;
  flags: string[];
  whyFits: string;
}

function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Deterministic "why this fits" text built only from the skills that matched. */
export function whyFits(entry: Pick<MatchEntry, "matched" | "related" | "gaps">, evidence: Map<string, string>): string {
  const parts: string[] = [];
  const top = entry.matched.slice(0, 3).map((m) => skillName(m.id));
  const total = entry.matched.length + entry.related.length + entry.gaps.length;
  if (top.length > 0) {
    parts.push(`You already show ${entry.matched.length} of the ${total} key skills for this job, including ${listNames(top)}.`);
    const ev = entry.matched.map((m) => evidence.get(m.id)).find(Boolean);
    if (ev) parts.push(`From your CV: “${ev.replace(/\.$/, "")}”.`);
  }
  if (entry.related.length > 0) {
    const r = entry.related[0];
    if (r.via) parts.push(`Your ${skillName(r.via)} is close to ${skillName(r.id)}, which the job also needs.`);
  }
  if (entry.gaps.length > 0) {
    const g = entry.gaps.slice(0, 2).map((x) => skillName(x.id));
    parts.push(`The main ${g.length > 1 ? "gaps are" : "gap is"} ${listNames(g)}.`);
  } else if (entry.related.length > 0) {
    parts.push("The other key skills are close to ones you have.");
  } else {
    parts.push("We did not find any key skill missing.");
  }
  return parts.join(" ");
}

export const FLAG_TEXT: Record<string, string> = {
  similar: "Close to the job you do now, so it is lower on your list: it is more a change of job than a change of career.",
  degree: "Usually needs a degree, so it is lower on your list because you said you do not have one.",
  pay: "ONS median pay is lower than for your current job, so it is lower on your list because you said you want to earn more.",
};

export function presentMatch(entry: MatchEntry, doc: SkillsDoc | null, current: CurrentJob | undefined): PresentedMatch | null {
  const profile = getCareerProfile(entry.occupationId);
  if (!profile) return null;
  const evidence = new Map<string, string>();
  for (const s of doc?.skills ?? []) if (s.evidence) evidence.set(s.id, s.evidence);

  const named = (refs: MatchEntry["matched"]): NamedSkill[] =>
    refs.map((r) => ({
      id: r.id,
      name: skillName(r.id),
      importance: r.importance,
      evidence: evidence.get(r.id),
      viaName: r.via ? skillName(r.via) : undefined,
    }));

  const o = profile.occupation;
  const ncs = o.ncsProfile ? NCS.profiles[o.ncsProfile] : undefined;

  return {
    occupationId: o.id,
    title: o.title,
    description: o.description,
    soc: o.soc,
    socTitle: profile.unitGroup.title,
    score: entry.score,
    matched: named(entry.matched),
    related: named(entry.related),
    gaps: named(entry.gaps),
    pay: pickPay(profile.pay.ft, profile.pay.all),
    payChange: payChange(o.soc, current?.soc),
    payScope: profile.payScope,
    payNote: profile.payNote,
    degreeUsuallyRequired: o.degreeUsuallyRequired,
    apprenticeships: profile.apprenticeships,
    licences: profile.licences.map((l) => ({
      name: l.name,
      body: l.body,
      summary: l.summary,
      scope: l.scope,
      url: l.sources[0]?.url ?? "",
    })),
    qualifications: o.qualifications,
    ncsUrl: profile.ncsUrl,
    ncsRoutes: ncs?.ok ? (ncs.routes ?? []).map((r) => r.text) : [],
    ncsEntryRequirements: ncs?.ok ? (ncs.entryRequirements ?? {}) : {},
    onsEntryRoutes: profile.unitGroup.onsEntryRoutes,
    flags: entry.flags,
    whyFits: whyFits(entry, evidence),
  };
}

export function resolveCurrentJob(doc: SkillsDoc | null): CurrentJob | undefined {
  return doc?.currentJobKey ? getCurrentJob(doc.currentJobKey) : undefined;
}

/** Skills grouped for the profile panel: strong first, then partial. */
export function profileSkillNames(skills: ProfileSkill[]): { strong: NamedSkill[]; some: NamedSkill[] } {
  const toNamed = (s: ProfileSkill): NamedSkill => ({ id: s.id, name: skillName(s.id), importance: 0, evidence: s.evidence });
  return {
    strong: skills.filter((s) => s.strength === "strong").map(toNamed),
    some: skills.filter((s) => s.strength === "some").map(toNamed),
  };
}

/** Plain summary of an apprenticeship standard, e.g. "Level 4, typically 24 months, funding band up to £18,000". */
export function describeApprenticeship(a: ApprenticeshipStandard): string {
  const bits = [`Level ${a.level}`];
  if (a.typicalDurationMonths) bits.push(`typically ${a.typicalDurationMonths} months`);
  if (a.maxFunding) bits.push(`government funding band up to £${a.maxFunding.toLocaleString("en-GB")}`);
  return bits.join(", ");
}
