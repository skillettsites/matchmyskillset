import Link from "next/link";
import type { ReactNode } from "react";
import { DataTable, SourceNote, formatGBP, formatGBPChange } from "@/components/content";
import { ASHE, quickestStandard, type ResolvedRoute } from "./routes";

export interface PayComparator {
  /** Column header, e.g. "Change vs secondary teacher". */
  header: string;
  /** Short label for the mobile card, e.g. "vs teacher". */
  mobileLabel?: string;
  /** The figure the change is worked out against, in pounds. */
  value: number;
}

export interface HubPayTableProps {
  caption: ReactNode;
  description?: ReactNode;
  routes: ResolvedRoute[];
  /** Adds a pay-change column. Only full-time medians are compared. */
  comparator?: PayComparator;
  /** Extra footnotes, e.g. where the comparator figure comes from. */
  notes?: ReactNode;
  /** Where the job title links: the route card on this page (default), live vacancies, or nowhere. */
  jobLink?: "anchor" | "jobs" | "none";
}

interface Row {
  r: ResolvedRoute;
}

/** Summary table of a hub's destinations, with ONS pay and the quickest listed route in. */
export function HubPayTable({ caption, description, routes, comparator, notes, jobLink = "anchor" }: HubPayTableProps) {
  const rows: Row[] = routes.map((r) => ({ r }));
  const hasAll = routes.some((r) => r.basis === "all");
  const hasNull = routes.some((r) => r.basis === null);
  return (
    <DataTable<Row>
      caption={caption}
      description={description}
      rowKey={(row) => row.r.id}
      rows={rows}
      columns={[
        {
          key: "job",
          header: "Job",
          rowHeader: true,
          render: ({ r }) =>
            jobLink === "none" ? (
              <span className="font-semibold">{r.title}</span>
            ) : jobLink === "jobs" ? (
              <Link href={r.jobsHref} className="link font-semibold">
                {r.title}
              </Link>
            ) : (
              <a href={`#${r.anchor}`} className="link font-semibold">
                {r.title}
              </a>
            ),
        },
        {
          key: "pay",
          header: "UK median pay",
          numeric: true,
          render: ({ r }) =>
            r.median === null ? (
              <span className="text-mute">Not published</span>
            ) : (
              <>
                {formatGBP(r.median)}
                {r.basis === "all" ? <sup className="text-mute">*</sup> : null}
              </>
            ),
        },
        ...(comparator
          ? [
              {
                key: "change",
                header: comparator.header,
                mobileLabel: comparator.mobileLabel,
                numeric: true,
                render: ({ r }: Row) =>
                  r.basis === "ft" && r.median !== null ? (
                    <span className={r.median - comparator.value < 0 ? "text-negative" : undefined}>
                      {formatGBPChange(r.median - comparator.value)}
                    </span>
                  ) : (
                    <span className="text-mute">n/a</span>
                  ),
              },
            ]
          : []),
        {
          key: "degree",
          header: "Degree usually needed",
          mobileLabel: "Degree needed",
          render: ({ r }) => (r.degreeUsuallyRequired ? "Yes" : "No"),
        },
        {
          key: "route",
          header: "Apprenticeship (lowest level listed)",
          mobileLabel: "Apprenticeship",
          render: ({ r }) => {
            const s = quickestStandard(r);
            return s ? `Level ${s.level}, ${s.typicalDurationMonths} months` : <span className="text-mute">None listed</span>;
          },
        },
      ]}
      source={
        <SourceNote
          label="Sources"
          source={`${ASHE.name}; Skills England apprenticeship standards (retrieved 28 September 2026)`}
          href={ASHE.href}
          published={ASHE.published}
          note="Full-time medians unless marked. Pay covers the whole ONS unit group behind each job."
        />
      }
      notes={
        <>
          {hasAll && <p>* All-employee median, including part-time jobs: ONS did not publish a reliable full-time figure.</p>}
          {hasNull && <p>Not published: ONS suppressed the 2025 figure for this group on quality grounds.</p>}
          {notes}
        </>
      }
    />
  );
}
