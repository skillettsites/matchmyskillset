// Finds taxonomy skills mentioned in free text (a job advert, a job title).
// Deterministic and free: no model call. Used to score live job adverts against
// a CV's skills and to tag jobs that employers post.

import { SKILLS } from "@/data/skills-taxonomy";

export interface TextSkillHit {
  id: string;
  /** How many distinct phrases for this skill appeared. */
  hits: number;
  /** True when the skill's name or an alias appears in the title. */
  inTitle: boolean;
}

interface Pattern {
  id: string;
  /** The phrase in lower case: a quick substring check before the regex. */
  phrase: string;
  re: RegExp;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Phrases shorter than this are too ambiguous to match on their own ("it", "hr").
const MIN_PHRASE_LENGTH = 3;

let cache: Pattern[] | null = null;

function patterns(): Pattern[] {
  if (cache) return cache;
  const out: Pattern[] = [];
  for (const skill of SKILLS) {
    const phrases = [skill.name, ...skill.aliases]
      .map((p) => p.trim().toLowerCase())
      .filter((p) => p.length >= MIN_PHRASE_LENGTH);
    for (const phrase of new Set(phrases)) {
      out.push({ id: skill.id, phrase, re: new RegExp(`(^|[^a-z0-9])${escapeRegExp(phrase)}(?=$|[^a-z0-9])`, "i") });
    }
  }
  cache = out;
  return out;
}

/** Taxonomy skills found in `text` (and flagged when also in `title`), strongest first. */
export function skillsInText(text: string, title = ""): TextSkillHit[] {
  const body = ` ${text.toLowerCase()} `;
  const head = ` ${title.toLowerCase()} `;
  const found = new Map<string, TextSkillHit>();
  for (const { id, phrase, re } of patterns()) {
    // Most phrases are not in the text at all; the substring check skips the regex for them.
    const inBody = body.includes(phrase) && re.test(body);
    const inTitle = title ? head.includes(phrase) && re.test(head) : false;
    if (!inBody && !inTitle) continue;
    const hit = found.get(id) ?? { id, hits: 0, inTitle: false };
    hit.hits += 1;
    hit.inTitle = hit.inTitle || inTitle;
    found.set(id, hit);
  }
  return [...found.values()].sort((a, b) => Number(b.inTitle) - Number(a.inTitle) || b.hits - a.hits);
}
