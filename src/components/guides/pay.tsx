// Server-only helpers for pages that quote ONS pay. They read the careers
// dataset (src/data/careers), which must never be imported into a client
// component: pass the small rows these helpers return instead.

import {
  ASHE_GROUPS,
  ASHE_NATIONAL,
  CAREER_OCCUPATIONS,
  SOURCE,
  cvQuality,
  getApprenticeshipStandard,
  getAsheUnitGroup,
  getSocUnitGroup,
  listSocCodes,
  LICENCES,
  ncsProfileUrl,
  type ApprenticeshipStandard,
  type CareerOccupation,
  type Licence,
} from "@/data/careers";
import type { ReactNode } from "react";
import { SourceNote } from "@/components/content";
import { titleInSentence } from "@/lib/text";

/** ONS ASHE 2025 bulletin ("Employee earnings in the UK: 2025"). */
export const ASHE_BULLETIN_URL =
  "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025";
/** ONS release calendar entry for ASHE 2026 (22 October 2026, 9:30am). */
export const ASHE_2026_RELEASE_URL = "https://www.ons.gov.uk/releases/employeeearningsintheuk2026";
export const ASHE_2026_RELEASE_DATE = "2026-10-22";
/** ASHE Table 14 dataset page. */
export const ASHE_TABLE_URL = SOURCE.datasetUrl;
export const ASHE_PUBLISHED = SOURCE.releaseDate;

/** UK median gross annual pay, full-time employee jobs, ASHE 2025 (£39,039). */
export const UK_FT_MEDIAN = ASHE_NATIONAL.ft.median as number;

/** Standard citation line for ASHE Table 14 figures. */
export function AsheSourceNote({ note, className }: { note?: ReactNode; className?: string }) {
  return (
    <SourceNote
      source="ONS, Annual Survey of Hours and Earnings 2025 (provisional), Table 14.7a"
      href={ASHE_TABLE_URL}
      published={ASHE_PUBLISHED}
      className={className}
      note={
        note ??
        "Median gross annual pay for full-time employee jobs in the UK, tax year ending 5 April 2025. Figures are for whole SOC 2020 occupation groups and exclude the self-employed."
      }
    />
  );
}

export interface OccupationPay {
  id: string;
  title: string;
  soc: string;
  socTitle: string;
  /** Full-time median, or null where ONS suppressed it. */
  median: number | null;
  p25: number | null;
  p75: number | null;
  /** Median across all employee jobs (full and part time). */
  allMedian: number | null;
  /** ONS quality band for the full-time median. */
  quality: ReturnType<typeof cvQuality>;
  degreeUsuallyRequired: boolean;
  payNote?: string;
  apprenticeships: ApprenticeshipStandard[];
  licences: Licence[];
  qualifications: string[];
  ncsUrl: string | null;
  description: string;
}

export function occupationPay(o: CareerOccupation): OccupationPay {
  const ashe = getAsheUnitGroup(o.soc);
  const soc = getSocUnitGroup(o.soc);
  if (!ashe || !soc) throw new Error(`No ASHE or SOC data for ${o.id} (${o.soc})`);
  return {
    id: o.id,
    title: o.title,
    soc: o.soc,
    socTitle: soc.title,
    median: ashe.ft.median,
    p25: ashe.ft.p25,
    p75: ashe.ft.p75,
    allMedian: ashe.all.median,
    quality: cvQuality(ashe.ft.cv.median),
    degreeUsuallyRequired: o.degreeUsuallyRequired,
    payNote: o.payNote,
    apprenticeships: o.apprenticeships
      .map((ref) => getApprenticeshipStandard(ref))
      .filter((s): s is ApprenticeshipStandard => Boolean(s)),
    licences: o.licences.map((l) => LICENCES[l]),
    qualifications: o.qualifications,
    ncsUrl: o.ncsProfile ? ncsProfileUrl(o.ncsProfile) : null,
    description: o.description,
  };
}

/** Every curated occupation with its pay, highest full-time median first (suppressed last). */
export function allOccupationPay(): OccupationPay[] {
  return CAREER_OCCUPATIONS.map(occupationPay).sort((a, b) => (b.median ?? -1) - (a.median ?? -1));
}

export function occupationPayById(id: string): OccupationPay {
  const o = CAREER_OCCUPATIONS.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown occupation id: ${id}`);
  return occupationPay(o);
}

/** Lowest-level apprenticeship (the most common way in without a degree), if any. */
export function entryApprenticeship(p: OccupationPay): ApprenticeshipStandard | undefined {
  return [...p.apprenticeships].sort((a, b) => a.level - b.level || a.typicalDurationMonths - b.typicalDurationMonths)[0];
}

/** "Level 3, typically 12 months" for an apprenticeship standard. */
export function apprenticeshipSummary(s: ApprenticeshipStandard): string {
  return `${s.title} (level ${s.level}, typically ${s.typicalDurationMonths} months)`;
}

export interface UnitGroupPay {
  soc: string;
  title: string;
  median: number | null;
  p25: number | null;
  p75: number | null;
  jobsThousands: number | null;
  quality: ReturnType<typeof cvQuality>;
}

/** All 412 SOC 2020 unit groups with their full-time pay. */
export function allUnitGroupPay(): UnitGroupPay[] {
  return listSocCodes().map((soc) => unitGroupPay(soc));
}

export function unitGroupPay(soc: string): UnitGroupPay {
  const ashe = getAsheUnitGroup(soc);
  const socData = getSocUnitGroup(soc);
  if (!ashe || !socData) throw new Error(`Unknown SOC unit group ${soc}`);
  return {
    soc,
    title: socData.title,
    median: ashe.ft.median,
    p25: ashe.ft.p25,
    p75: ashe.ft.p75,
    jobsThousands: ashe.ft.jobsThousands,
    quality: cvQuality(ashe.ft.cv.median),
  };
}

/** Full-time median for a SOC major, sub-major or minor group (1 to 3 digits). */
export function groupPay(code: string): { title: string; median: number | null } {
  const g = ASHE_GROUPS[code];
  if (!g) throw new Error(`Unknown SOC group ${code}`);
  return { title: g.title, median: g.ft.median };
}

export interface SocRow {
  soc: string;
  socTitle: string;
  /** Curated occupations in this unit group, in dataset order. */
  occupations: OccupationPay[];
  /** Display name: the curated job titles, joined. */
  name: string;
  median: number | null;
  p25: number | null;
  p75: number | null;
  payNote?: string;
}

/** Collapse occupations that share a SOC unit group (and so share ONS pay) into one row. */
export function groupBySoc(list: OccupationPay[]): SocRow[] {
  const map = new Map<string, SocRow>();
  for (const p of list) {
    const row = map.get(p.soc);
    if (row) {
      row.occupations.push(p);
      row.name = row.occupations.map((o, i) => (i === 0 ? o.title : lcFirst(o.title))).join(", ");
      row.payNote ??= p.payNote;
    } else {
      map.set(p.soc, {
        soc: p.soc,
        socTitle: p.socTitle,
        occupations: [p],
        name: p.title,
        median: p.median,
        p25: p.p25,
        p75: p.p75,
        payNote: p.payNote,
      });
    }
  }
  return [...map.values()];
}

/** Apprenticeship standards below degree level (level 2 to 5) across a row's occupations, lowest level first. */
export function subDegreeApprenticeships(occupations: OccupationPay[]): ApprenticeshipStandard[] {
  const seen = new Map<string, ApprenticeshipStandard>();
  for (const o of occupations) for (const s of o.apprenticeships) if (s.level <= 5) seen.set(s.referenceNumber, s);
  return [...seen.values()].sort((a, b) => a.level - b.level || a.typicalDurationMonths - b.typicalDurationMonths);
}

/** Licences across a row's occupations, without duplicates. */
export function rowLicences(occupations: OccupationPay[]): Licence[] {
  const seen = new Map<string, Licence>();
  for (const o of occupations) for (const l of o.licences) seen.set(l.id, l);
  return [...seen.values()];
}

/** Link to a Skills England apprenticeship standard with its level and typical length. */
export function ApprenticeshipLink({ standard }: { standard: ApprenticeshipStandard }) {
  return (
    <>
      <a href={standard.url} className="link" rel="noopener">
        {standard.title}
      </a>{" "}
      apprenticeship (level {standard.level}, typically {standard.typicalDurationMonths} months)
    </>
  );
}

/** Link to the official page for a licence or registration. */
export function LicenceLink({ licence }: { licence: Licence }) {
  const url = licence.sources[0]?.url;
  return url ? (
    <a href={url} className="link" rel="noopener">
      {licence.name}
    </a>
  ) : (
    <>{licence.name}</>
  );
}

/** Citation for the Skills England apprenticeship standards snapshot. */
export function ApprenticeshipSourceNote({ className }: { className?: string }) {
  return (
    <SourceNote
      label="Apprenticeships"
      source="Skills England, apprenticeship standards (approved for delivery)"
      href="https://skillsengland.education.gov.uk/apprenticeships"
      className={className}
      note="Checked 28 September 2026. Typical length is the duration Skills England gives for each standard. Apprenticeship standards apply in England."
    />
  );
}

/** A job title as it reads mid-sentence, keeping acronyms ("UX designer") and proper nouns ("Ofsted inspector"). */
export function lcFirst(title: string): string {
  return titleInSentence(title);
}

function lowestSubDegree(o: OccupationPay): ApprenticeshipStandard | undefined {
  return subDegreeApprenticeships([o])[0];
}

/**
 * The way in for each job in a row, grouped so jobs with the same route share
 * a line. Licences are attributed to the job that needs them, never the whole
 * ONS group. Falls back to the National Careers Service profile link.
 */
export function RouteList({ occupations, max = 3 }: { occupations: OccupationPay[]; max?: number }) {
  const groups = new Map<string, { titles: string[]; app?: ApprenticeshipStandard; licences: Licence[] }>();
  for (const o of occupations) {
    const app = lowestSubDegree(o);
    if (!app && o.licences.length === 0) continue;
    const key = `${app?.referenceNumber ?? ""}|${o.licences.map((l) => l.id).join(",")}`;
    const g = groups.get(key);
    if (g) g.titles.push(o.title);
    else groups.set(key, { titles: [o.title], app, licences: o.licences });
  }
  const items = [...groups.values()];
  if (items.length === 0) {
    const withNcs = occupations.find((o) => o.ncsUrl);
    return (
      <span className="block text-ink-2">
        No apprenticeship below degree level in our data.
        {withNcs?.ncsUrl && (
          <>
            {" "}
            See the{" "}
            <a href={withNcs.ncsUrl} className="link" rel="noopener">
              National Careers Service profile
            </a>{" "}
            for routes.
          </>
        )}
      </span>
    );
  }
  const labelled = occupations.length > 1;
  return (
    <span className="block space-y-1.5">
      {items.slice(0, max).map((g) => (
        <span key={g.titles.join()} className="block">
          {labelled && <span className="font-semibold text-ink">{g.titles.map((t, i) => (i === 0 ? t : lcFirst(t))).join(", ")}: </span>}
          {g.app && <ApprenticeshipLink standard={g.app} />}
          {g.licences.length > 0 && (
            <span className={g.app ? "block text-sm text-ink-2" : ""}>
              {g.app ? "Also needs: " : "Needs: "}
              {g.licences.map((l, i) => (
                <span key={l.id}>
                  {i > 0 && ", "}
                  <LicenceLink licence={l} />
                </span>
              ))}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
