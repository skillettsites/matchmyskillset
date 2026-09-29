/**
 * Blocks for the engineering, manufacturing and Industry 4.0 guides (added
 * 29 September 2026). Server components only: they read the careers dataset.
 * Every figure comes from `@/data/careers` (ONS ASHE 2025, Skills England).
 */
import Link from "next/link";
import { DataTable, SourceNote, formatGBP } from "@/components/content";
import { OTHER_CAREER_HUBS } from "@/components/site";
import { getAsheUnitGroup, type ApprenticeshipStandard } from "@/data/careers";
import { titleInSentence } from "@/lib/text";
import { ASHE, type ResolvedRoute } from "./routes";

/* ------------------------------------------------------------------ */
/* Live job searches                                                   */
/* ------------------------------------------------------------------ */

/** Links to the live job search for each title, as pills. */
export function LiveJobLinks({ terms, className = "" }: { terms: string[]; className?: string }) {
  return (
    <ul className={`mt-6 flex flex-wrap gap-2 ${className}`}>
      {terms.map((t) => (
        <li key={t}>
          <Link
            href={`/jobs?q=${encodeURIComponent(t)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cloud px-4 text-[15px] font-medium text-ink transition-colors hover:bg-hair"
          >
            <span className="live-dot" aria-hidden="true" />
            {t} jobs
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Who a guide is for                                                  */
/* ------------------------------------------------------------------ */

export interface AudienceCard {
  kicker: string;
  title: string;
  text: string;
  href: string;
  linkLabel: string;
}

/** Cards for the audiences a guide serves, each linking to the page or section for them. */
export function AudienceCards({ items }: { items: AudienceCard[] }) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {items.map((a) => (
        <li key={a.href + a.title}>
          <Link
            href={a.href}
            className="group flex h-full flex-col rounded-[28px] bg-white p-6 shadow-card ring-1 ring-black/[0.05] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-7"
          >
            <span className="kicker !text-link">{a.kicker}</span>
            <span className="mt-1.5 text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink group-hover:underline group-hover:underline-offset-4">
              {a.title}
            </span>
            <span className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-2">{a.text}</span>
            <span className="mt-5 inline-flex items-center gap-0.5 text-[15px] text-link">
              {a.linkLabel}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Pay ranges                                                          */
/* ------------------------------------------------------------------ */

interface RangeRow {
  id: string;
  title: string;
  soc: string;
  p25: number | null;
  median: number | null;
  p75: number | null;
}

/** ONS lower quartile, median and upper quartile (full time) for each route, with gaps where ONS published none. */
export function PayRangeTable({ routes, caption }: { routes: ResolvedRoute[]; caption: string }) {
  const rows: RangeRow[] = routes.map((r) => {
    const ft = getAsheUnitGroup(r.soc)?.ft;
    return { id: r.id, title: r.title, soc: r.soc, p25: ft?.p25 ?? null, median: ft?.median ?? null, p75: ft?.p75 ?? null };
  });
  const money = (v: number | null) => (v === null ? <span className="text-mute">not published</span> : formatGBP(v));
  return (
    <DataTable<RangeRow>
      caption={caption}
      description="Gross annual pay for full-time employees, UK, tax year to April 2025. A quarter of people in the group earn less than the lower quartile, and a quarter more than the upper quartile."
      rowKey={(r) => r.id}
      rows={rows}
      columns={[
        { key: "title", header: "Career", rowHeader: true },
        { key: "p25", header: "Lower quartile", numeric: true, render: (r) => money(r.p25) },
        { key: "median", header: "Median", numeric: true, render: (r) => money(r.median) },
        { key: "p75", header: "Upper quartile", numeric: true, render: (r) => money(r.p75) },
        { key: "soc", header: "ONS group", mobileLabel: "ONS group", render: (r) => r.soc },
      ]}
      source={
        <SourceNote
          source={ASHE.short}
          href={ASHE.href}
          published={ASHE.published}
          note="Each figure covers the whole ONS unit group named by its code, not only the job title shown. ONS leaves a quartile out when the estimate is not reliable enough to publish."
        />
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Apprenticeships                                                     */
/* ------------------------------------------------------------------ */

interface StandardRow {
  standard: ApprenticeshipStandard;
  forTitles: string[];
}

/** Every Skills England standard linked to these routes, lowest level first, with the careers it leads to. */
export function ApprenticeshipTable({
  routes,
  caption,
  minLevel = 0,
}: {
  routes: ResolvedRoute[];
  caption: string;
  /** Only standards at this level or above (6 for degree apprenticeships). */
  minLevel?: number;
}) {
  const byRef = new Map<string, StandardRow>();
  for (const r of routes) {
    for (const s of r.apprenticeships) {
      if (s.level < minLevel) continue;
      const row = byRef.get(s.referenceNumber) ?? { standard: s, forTitles: [] };
      if (!row.forTitles.includes(r.title)) row.forTitles.push(r.title);
      byRef.set(s.referenceNumber, row);
    }
  }
  const rows = [...byRef.values()].sort(
    (a, b) => a.standard.level - b.standard.level || a.standard.typicalDurationMonths - b.standard.typicalDurationMonths || a.standard.title.localeCompare(b.standard.title)
  );
  if (rows.length === 0) return null;
  return (
    <DataTable<StandardRow>
      caption={caption}
      rowKey={(r) => r.standard.referenceNumber}
      rows={rows}
      columns={[
        {
          key: "title",
          header: "Apprenticeship",
          rowHeader: true,
          render: (r) => (
            <a href={r.standard.url} className="link" rel="noopener">
              {r.standard.title}
            </a>
          ),
        },
        { key: "level", header: "Level", numeric: true, render: (r) => r.standard.level },
        { key: "months", header: "Typical length", mobileLabel: "Length", render: (r) => `${r.standard.typicalDurationMonths} months` },
        { key: "for", header: "Leads to", render: (r) => r.forTitles.map((t) => titleInSentence(t)).join(", ") },
      ]}
      source={
        <SourceNote
          source="Skills England, apprenticeship standards approved for delivery"
          href="https://skillsengland.education.gov.uk/apprenticeships/"
          published="retrieved 29 September 2026"
          note="Standards apply in England. Typical lengths are Skills England's figures; relevant experience can shorten them."
        />
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Other careers                                                       */
/* ------------------------------------------------------------------ */

/** The profession guides outside engineering, shown lower down as "Other careers". */
export function OtherCareers() {
  const links = [
    ...OTHER_CAREER_HUBS.filter((h) => h.href !== "/careers-for").map((h) => ({ href: h.href, label: h.label })),
    { href: "/careers-for", label: "Careers by profession: 18 more jobs" },
    { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
    { href: "/highest-paying-careers-uk", label: "Highest-paying careers in the UK" },
  ];
  return (
    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className="group flex h-full min-h-14 items-center justify-between gap-4 rounded-[20px] bg-cloud px-5 py-4 transition-colors hover:bg-hair"
          >
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink group-hover:underline group-hover:underline-offset-4">{l.label}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}
