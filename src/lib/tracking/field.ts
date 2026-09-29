// The "field" a tracked application, event or placement belongs to, for the
// admin funnel's sector filter. It is the family of work the job title points
// to (src/lib/apis/jobs/role.ts classifyTitle, the same rules the job matcher
// uses), worked out once when the record is written. Server code only.
//
// Families are editorial groupings (see src/lib/skills/role-families.ts), not
// official statistics: the funnel labels them "Field (from the job title)".

import { classifyTitle } from "@/lib/apis/jobs/role";
import { FAMILY_LABELS, type RoleFamily } from "@/lib/skills/role-families";

/** The family id for a job title, or null when the title does not say. */
export function fieldOfTitle(title: string | null | undefined): string | null {
  const t = (title ?? "").trim();
  if (!t) return null;
  try {
    return classifyTitle(t).family;
  } catch {
    return null;
  }
}

/** Human name for a stored field id. */
export function fieldLabel(field: string | null | undefined): string {
  if (!field) return "Not known";
  return (FAMILY_LABELS as Record<string, string>)[field] ?? field;
}

/** Every field, for the filter, sorted by name. */
export function fieldOptions(): { id: string; label: string }[] {
  return (Object.entries(FAMILY_LABELS) as [RoleFamily, string][]).map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
}

export function isFieldId(value: unknown): value is string {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(FAMILY_LABELS, value);
}
