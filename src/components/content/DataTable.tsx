import type { ReactNode } from "react";
import { formatGBP, formatNumber, isNumber } from "./format";

/** One column of a {@link DataTable}. */
export interface DataTableColumn<Row> {
  /** Unique column id. Without `render`, the cell shows `row[key]`. */
  key: string;
  /** Column header. Also used as the label on the stacked mobile cards. */
  header: string;
  /** Shorter label for the mobile cards, if the header is long. */
  mobileLabel?: string;
  /** Right-aligned with tabular figures. Set for money and counts. */
  numeric?: boolean;
  /**
   * Formatting for plain number values when there is no `render`:
   * `gbp` gives "£34,500", `number` gives "34,500".
   */
  format?: "gbp" | "number";
  /**
   * Render this column as the row header (`<th scope="row">`). Use it on the
   * first column, usually the job title. On mobile it becomes the card title.
   */
  rowHeader?: boolean;
  /** Custom cell content. Server components only (functions cannot cross to the client). */
  render?: (row: Row, index: number) => ReactNode;
  /** Extra classes for this column's cells. */
  className?: string;
}

/** Props for {@link DataTable}. */
export interface DataTableProps<Row> {
  /** What the table shows. Required: it is the table's accessible name. */
  caption: ReactNode;
  /** Optional sentence under the caption, e.g. what "median" means here. */
  description?: ReactNode;
  /** Column definitions, in display order. */
  columns: DataTableColumn<Row>[];
  /** Data rows. */
  rows: Row[];
  /** Stable key per row. Defaults to the row index. */
  rowKey?: (row: Row, index: number) => string;
  /** Slot for the citation, normally a `<SourceNote />`. */
  source?: ReactNode;
  /** Footnotes shown under the source. */
  notes?: ReactNode;
  /** Extra classes for the outer `<figure>`. */
  className?: string;
}

function cellValue<Row>(row: Row, col: DataTableColumn<Row>, index: number): ReactNode {
  if (col.render) return col.render(row, index);
  const raw = (row as Record<string, unknown>)[col.key];
  if (raw === null || raw === undefined || raw === "") return <span className="text-muted">n/a</span>;
  if (isNumber(raw)) {
    if (col.format === "gbp") return formatGBP(raw);
    return formatNumber(raw);
  }
  return String(raw);
}

/**
 * A responsive data table: a normal table from 640px, and one card per row
 * below that (the row header becomes the card title, other cells get their
 * column header as a label). Explicit ARIA roles keep the table semantics
 * when the mobile layout switches the cells to `display: block`.
 */
export function DataTable<Row>({
  caption,
  description,
  columns,
  rows,
  rowKey,
  source,
  notes,
  className = "",
}: DataTableProps<Row>) {
  return (
    <figure className={`my-8 ${className}`}>
      <div className="sm:overflow-x-auto">
        <table className="mms-table" role="table">
          <caption>
            <span className="block font-serif text-xl font-semibold leading-snug text-ink">{caption}</span>
            {description && <span className="mt-1 block text-sm text-muted">{description}</span>}
          </caption>
          <thead role="rowgroup">
            <tr role="row">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  role="columnheader"
                  data-numeric={col.numeric ? "" : undefined}
                  className={col.className}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {rows.map((row, i) => (
              <tr key={rowKey ? rowKey(row, i) : i} role="row">
                {columns.map((col) =>
                  col.rowHeader ? (
                    <th key={col.key} scope="row" role="rowheader" className={col.className}>
                      {cellValue(row, col, i)}
                    </th>
                  ) : (
                    <td
                      key={col.key}
                      role="cell"
                      data-label={col.mobileLabel ?? col.header}
                      data-numeric={col.numeric ? "" : undefined}
                      className={col.className}
                    >
                      {cellValue(row, col, i)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(source || notes) && (
        <div className="mt-3 space-y-1.5">
          {source}
          {notes && <div className="text-xs leading-relaxed text-muted">{notes}</div>}
        </div>
      )}
    </figure>
  );
}
