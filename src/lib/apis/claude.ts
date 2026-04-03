import Anthropic from "@anthropic-ai/sdk";
import { getSkillNamesForPrompt } from "@/data/skills-taxonomy";
import { getOccupationSummariesForPrompt } from "@/data/occupations";
import type { ExtractedSkill, CareerMatch } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SKILL_NAMES = getSkillNamesForPrompt();
const OCCUPATION_SUMMARIES = getOccupationSummariesForPrompt();

const SYSTEM_PROMPT = `You are a career skills analyst. Your job is to extract skills from a person's experience description and match them to career opportunities.

IMPORTANT RULES:
1. You MUST only use skill IDs from the provided taxonomy. Never invent new skill IDs.
2. Recognise ALL types of experience: paid work, volunteering, parenting, caring, hobbies, side projects, education.
3. A stay-at-home parent has project management, budget management, crisis management, and scheduling skills.
4. A volunteer coordinator has team leadership, event planning, and stakeholder management skills.
5. Look for transferable skills that cross industries.
6. Be generous with confidence scores for clearly demonstrated skills.
7. For career matches, think about non-obvious transitions. A teacher could be a UX researcher. A construction PM could be an operations manager.

SKILLS TAXONOMY (id:name format):
${SKILL_NAMES}

OCCUPATIONS (id:title|median_salary|demand|sector):
${OCCUPATION_SUMMARIES}

Respond with valid JSON only. No markdown, no explanation, just the JSON object.`;

const USER_PROMPT_TEMPLATE = `Analyse the following experience description. Extract all skills (minimum 10, maximum 30) and suggest career matches (minimum 5, maximum 10).

For each extracted skill, provide:
- skillId: the exact ID from the taxonomy
- name: the skill name
- confidence: 0.0 to 1.0 (how clearly this skill is demonstrated)
- category: one of "hard", "soft", "knowledge", "life"
- source: brief note on where in the input this skill was identified

For each career match, provide:
- occupationId: the exact ID from the occupations list
- title: the occupation title
- description: one sentence on why this is a good match for THIS person
- matchPercentage: 0-100 based on skill overlap
- matchedSkills: array of {skillId, name, importance} for skills they have
- gapSkills: array of {skillId, name, importance} for skills they need to develop
- salaryRange: {min, max, median} from the occupations data
- demandLevel: "high", "medium", or "low"
- transitionDifficulty: "easy" (mostly matching skills), "moderate" (some upskilling needed), or "hard" (significant gap)

EXPERIENCE DESCRIPTION:
---
{INPUT_TEXT}
---

Respond with this exact JSON structure:
{
  "extractedSkills": [...],
  "careerMatches": [...]
}`;

export interface ClaudeAssessmentResult {
  extractedSkills: ExtractedSkill[];
  careerMatches: CareerMatch[];
}

export async function extractSkillsAndMatch(
  inputText: string
): Promise<ClaudeAssessmentResult> {
  const userPrompt = USER_PROMPT_TEMPLATE.replace("{INPUT_TEXT}", inputText);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let jsonText = textBlock.text.trim();
  // Strip markdown code fences if present
  if (jsonText.startsWith("```")) {
    jsonText = jsonText
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
  }

  try {
    const result = JSON.parse(jsonText) as ClaudeAssessmentResult;

    // Validate: ensure we have at least some skills and matches
    if (
      !result.extractedSkills ||
      !Array.isArray(result.extractedSkills) ||
      result.extractedSkills.length === 0
    ) {
      throw new Error("No skills extracted");
    }
    if (
      !result.careerMatches ||
      !Array.isArray(result.careerMatches) ||
      result.careerMatches.length === 0
    ) {
      throw new Error("No career matches found");
    }

    return result;
  } catch (parseError) {
    // Retry once on parse failure
    console.error(
      "[claude] JSON parse failed, retrying:",
      parseError
    );

    const retryResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        SYSTEM_PROMPT +
        "\n\nCRITICAL: Your previous response was not valid JSON. Respond with ONLY a valid JSON object. No markdown, no backticks, no explanation.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const retryBlock = retryResponse.content.find(
      (block) => block.type === "text"
    );
    if (!retryBlock || retryBlock.type !== "text") {
      throw new Error("No text response from Claude on retry");
    }

    let retryJson = retryBlock.text.trim();
    if (retryJson.startsWith("```")) {
      retryJson = retryJson
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    return JSON.parse(retryJson) as ClaudeAssessmentResult;
  }
}
