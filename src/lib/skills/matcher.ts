import { OCCUPATIONS, type Occupation } from "@/data/occupations";
import { SKILLS, getSkillById } from "@/data/skills-taxonomy";
import type { ExtractedSkill, CareerMatch } from "@/lib/types";

interface MatchResult {
  occupation: Occupation;
  matchPercentage: number;
  matchedSkills: { skillId: string; name: string; importance: number }[];
  gapSkills: { skillId: string; name: string; importance: number }[];
}

// Check if two skills are related (adjacent) via the taxonomy
function areSkillsRelated(skillId1: string, skillId2: string): boolean {
  const skill1 = getSkillById(skillId1);
  const skill2 = getSkillById(skillId2);
  if (!skill1 || !skill2) return false;
  return (
    skill1.relatedSkillIds.includes(skillId2) ||
    skill2.relatedSkillIds.includes(skillId1)
  );
}

// Score how well a user's skills match an occupation
function scoreMatch(
  userSkills: ExtractedSkill[],
  occupation: Occupation
): MatchResult {
  const userSkillIds = new Set(userSkills.map((s) => s.skillId));
  const userSkillConfidence = new Map(
    userSkills.map((s) => [s.skillId, s.confidence])
  );

  let totalImportance = 0;
  let matchedImportance = 0;
  const matchedSkills: { skillId: string; name: string; importance: number }[] =
    [];
  const gapSkills: { skillId: string; name: string; importance: number }[] = [];

  for (const reqSkill of occupation.requiredSkills) {
    const skill = getSkillById(reqSkill.skillId);
    if (!skill) continue;

    totalImportance += reqSkill.importance;

    if (userSkillIds.has(reqSkill.skillId)) {
      // Direct match
      const confidence = userSkillConfidence.get(reqSkill.skillId) || 0.5;
      matchedImportance += reqSkill.importance * confidence;
      matchedSkills.push({
        skillId: reqSkill.skillId,
        name: skill.name,
        importance: reqSkill.importance,
      });
    } else {
      // Check for adjacent/related skill match (partial credit)
      let adjacentMatch = false;
      for (const userSkillId of userSkillIds) {
        if (areSkillsRelated(userSkillId, reqSkill.skillId)) {
          const confidence =
            userSkillConfidence.get(userSkillId) || 0.5;
          matchedImportance += reqSkill.importance * confidence * 0.5; // 50% credit for adjacent
          matchedSkills.push({
            skillId: reqSkill.skillId,
            name: skill.name + " (related)",
            importance: reqSkill.importance,
          });
          adjacentMatch = true;
          break;
        }
      }

      if (!adjacentMatch) {
        gapSkills.push({
          skillId: reqSkill.skillId,
          name: skill.name,
          importance: reqSkill.importance,
        });
      }
    }
  }

  const matchPercentage =
    totalImportance > 0
      ? Math.round((matchedImportance / totalImportance) * 100)
      : 0;

  return {
    occupation,
    matchPercentage: Math.min(matchPercentage, 99), // cap at 99% (never a "perfect" match)
    matchedSkills,
    gapSkills,
  };
}

// Match user skills against all occupations and return top N
export function matchSkillsToOccupations(
  userSkills: ExtractedSkill[],
  topN: number = 10
): CareerMatch[] {
  const results: MatchResult[] = OCCUPATIONS.map((occ) =>
    scoreMatch(userSkills, occ)
  );

  // Sort by match percentage descending
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Take top N
  const topResults = results.slice(0, topN);

  return topResults.map((result) => ({
    occupationId: result.occupation.id,
    title: result.occupation.title,
    description: result.occupation.description,
    matchPercentage: result.matchPercentage,
    matchedSkills: result.matchedSkills,
    gapSkills: result.gapSkills,
    salaryRange: result.occupation.salary,
    demandLevel: result.occupation.demand,
    transitionDifficulty:
      result.gapSkills.length <= 1
        ? "easy"
        : result.gapSkills.length <= 3
          ? "moderate"
          : "hard",
  }));
}
