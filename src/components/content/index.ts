/**
 * Shared building blocks for content pages. All are server components.
 * Usage notes for each are in src/components/README.md.
 */
export { Breadcrumbs, type BreadcrumbItem, type BreadcrumbsProps } from "./Breadcrumbs";
export { DataTable, type DataTableColumn, type DataTableProps } from "./DataTable";
export { Disclosure, type DisclosureProps } from "./Disclosure";
export { FaqSection, type FaqItem, type FaqSectionProps } from "./FaqSection";
export { PageHeader, type PageHeaderProps, type Reviewer } from "./PageHeader";
export { Prose, type ProseProps } from "./Prose";
export { RouteCard, type RouteCardProps } from "./RouteCard";
export { SalaryFigure, type SalaryFigureProps } from "./SalaryFigure";
export { SourceNote, type SourceNoteProps } from "./SourceNote";
export { ToolCallout, type ToolCalloutProps } from "./ToolCallout";
export {
  formatDate,
  formatGBP,
  formatGBPChange,
  formatMonths,
  formatNumber,
  type PayPeriod,
} from "./format";
