// Server-side: builds the small, serialisable data the transferable skills tool
// needs, so the client never loads the careers dataset or the taxonomy.

import { CAREER_OCCUPATIONS, getAsheUnitGroup, getSocUnitGroup } from "@/data/careers";
import { getSkillById } from "@/data/skills-taxonomy";
import { occupationPay, subDegreeApprenticeships } from "@/components/guides/pay";
import { STARTING_JOBS, type StartingJob } from "./starting-jobs";

export interface ToolSkill {
  name: string;
  cv: string;
}

export interface ToolDestination {
  id: string;
  title: string;
  /** ONS full-time median for the destination's SOC group, or null if not published. */
  median: number | null;
  /** ONS group the pay figure describes. */
  socTitle: string;
  degreeUsuallyRequired: boolean;
  shared: string[];
  route: string;
}

export interface ToolJob {
  key: string;
  title: string;
  group: StartingJob["group"];
  /** ONS full-time median for the starting job's SOC group, or null if not published. */
  median: number | null;
  skills: ToolSkill[];
  destinations: ToolDestination[];
}

function skillName(id: string): string {
  const skill = getSkillById(id);
  if (!skill) throw new Error(`Unknown skill id in starting-jobs.ts: ${id}`);
  return skill.name;
}

function routeText(id: string): string {
  const occupation = CAREER_OCCUPATIONS.find((o) => o.id === id)!;
  const pay = occupationPay(occupation);
  const app = subDegreeApprenticeships([pay])[0];
  if (app) return `${app.title} apprenticeship, level ${app.level}, typically ${app.typicalDurationMonths} months`;
  if (pay.licences.length > 0) return `Needs: ${pay.licences.map((l) => l.name).join(", ")}`;
  return occupation.degreeUsuallyRequired ? "Usually needs a degree" : "No apprenticeship below degree level in our data";
}

// How many curated destinations use each skill. Common skills (attention to
// detail appears in dozens) say less about fit than rare ones, so each shared
// skill is weighted by log(N / count), as in a standard IDF weighting.
const SKILL_COUNTS = new Map<string, number>();
for (const o of CAREER_OCCUPATIONS) for (const s of o.skills) SKILL_COUNTS.set(s.skillId, (SKILL_COUNTS.get(s.skillId) ?? 0) + 1);
const weight = (id: string) => Math.log(CAREER_OCCUPATIONS.length / (SKILL_COUNTS.get(id) ?? 1));

/**
 * Rank destinations by skills in common. Each shared skill scores
 * (importance in the starting job) x (importance in the destination) x (rarity
 * weight), and the total is multiplied by the share of the destination's own
 * weighted skills that the starting job covers. A destination needs at least
 * two shared skills, one of them rated 4 or 5 in both jobs, and at least a
 * quarter of its weighted skills covered. Deterministic; no AI.
 */
function destinationsFor(job: StartingJob, limit = 5): ToolDestination[] {
  const from = new Map(job.skills.map((s) => [s.id, s.importance]));
  return CAREER_OCCUPATIONS.filter((o) => o.soc !== job.soc)
    .map((o) => {
      const shared = o.skills.filter((s) => from.has(s.skillId));
      const total = o.skills.reduce((sum, s) => sum + s.importance * weight(s.skillId), 0);
      const coverage = total > 0 ? shared.reduce((sum, s) => sum + s.importance * weight(s.skillId), 0) / total : 0;
      const raw = shared.reduce((sum, s) => sum + s.importance * (from.get(s.skillId) ?? 0) * weight(s.skillId), 0);
      const core = shared.some((s) => s.importance >= 4 && (from.get(s.skillId) ?? 0) >= 4);
      return { o, shared, coverage, core, score: raw * coverage };
    })
    .filter((d) => d.shared.length >= 2 && d.core && d.coverage >= 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ o, shared }) => ({
      id: o.id,
      title: o.title,
      median: getAsheUnitGroup(o.soc)?.ft.median ?? null,
      socTitle: getSocUnitGroup(o.soc)?.title ?? "",
      degreeUsuallyRequired: o.degreeUsuallyRequired,
      shared: [...shared].sort((a, b) => b.importance - a.importance).map((s) => skillName(s.skillId)),
      route: routeText(o.id),
    }));
}

export function buildToolData(): ToolJob[] {
  return STARTING_JOBS.map((job) => ({
    key: job.key,
    title: job.title,
    group: job.group,
    median: getAsheUnitGroup(job.soc)?.ft.median ?? null,
    skills: [...job.skills].sort((a, b) => b.importance - a.importance).map((s) => ({ name: skillName(s.id), cv: s.cv })),
    destinations: destinationsFor(job),
  }));
}
