import type { ReactNode } from "react";
import { formatDate, isoDate } from "./format";

/** Props for {@link SourceNote}. */
export interface SourceNoteProps {
  /**
   * Name of the source as a reader would cite it, e.g.
   * "ONS, Annual Survey of Hours and Earnings 2025, Table 14".
   */
  source: string;
  /** Link to the exact table, bulletin or page. Strongly recommended. */
  href?: string;
  /**
   * Publication date of the source. ISO ("2025-10-23" or "2025-10") is
   * formatted as "23 October 2025"; any other string is shown as given.
   */
  published?: string;
  /** Extra detail after the citation, e.g. "Median gross annual pay, full-time employees, UK." */
  note?: ReactNode;
  /** Label before the citation. Defaults to "Source". Use "Sources" or "Data" as needed. */
  label?: string;
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * A one-line citation: "Source: <linked name>, published 23 October 2025."
 * Put one under every figure, table or chart that quotes data.
 */
export function SourceNote({
  source,
  href,
  published,
  note,
  label = "Source",
  className = "",
}: SourceNoteProps) {
  const dt = published ? isoDate(published) : undefined;
  return (
    <p className={`text-xs leading-relaxed text-mute ${className}`}>
      <span className="font-semibold text-ink-2">{label}:</span>{" "}
      {href ? (
        <a href={href} className="link" rel="noopener">
          {source}
        </a>
      ) : (
        source
      )}
      {published && (
        <>
          , published{" "}
          {dt ? <time dateTime={dt}>{formatDate(published)}</time> : published}
        </>
      )}
      .{note ? <> {note}</> : null}
    </p>
  );
}
