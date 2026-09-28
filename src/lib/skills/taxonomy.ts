// Helpers over the skills taxonomy in src/data/skills-taxonomy.ts.
// The taxonomy is small (about 230 skills), so this module is safe to use on
// the server and, if needed, in client components.

import { SKILLS, type Skill, type SkillCategory } from "@/data/skills-taxonomy";

const BY_ID = new Map<string, Skill>(SKILLS.map((s) => [s.id, s]));

/** Every skill id, in taxonomy order. Used to constrain the model's output. */
export const SKILL_IDS: string[] = SKILLS.map((s) => s.id);

export function getSkill(id: string): Skill | undefined {
  return BY_ID.get(id);
}

export function isSkillId(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

/** Display name for a skill id, or the id itself if it is unknown. */
export function skillName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}

/** True when either skill lists the other as related (the taxonomy is not always symmetric). */
export function areRelated(a: string, b: string): boolean {
  if (a === b) return false;
  const sa = BY_ID.get(a);
  const sb = BY_ID.get(b);
  if (!sa || !sb) return false;
  return sa.relatedSkillIds.includes(b) || sb.relatedSkillIds.includes(a);
}

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  communication: "Communication",
  analytical: "Analytical",
  technical: "Technical and IT",
  management: "Management and leadership",
  interpersonal: "Working with people",
  creative: "Creative",
  physical: "Practical and trades",
  financial: "Finance",
  digital: "Digital",
  scientific: "Scientific",
  legal: "Legal and regulatory",
  education: "Teaching and training",
  healthcare: "Health and care",
  life: "Life experience",
};

export function categoryLabel(category: SkillCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

/**
 * The taxonomy as plain text for the extraction prompt: one skill per line,
 * "s001 Written Communication (writing, report writing, ...)". Built once and
 * never changes between requests, so it sits in the cached system prompt.
 */
export function taxonomyForPrompt(): string {
  return SKILLS.map((s) => {
    const aliases = s.aliases.slice(0, 6).join(", ");
    return aliases ? `${s.id} ${s.name} (${aliases})` : `${s.id} ${s.name}`;
  }).join("\n");
}
