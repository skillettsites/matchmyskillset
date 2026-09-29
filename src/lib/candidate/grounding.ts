// Deterministic checks run on every generated job pack, after the model has
// answered. The prompt tells the model never to invent anything; these checks
// make sure of the things we can check mechanically, against the person's own
// CV text:
//
//   - employers, dates, qualifications, certificates and contact details in
//     the tailored CV must appear in the CV (allowing for "Ltd" and the like);
//   - every number (digits, money, percentages, and number words such as
//     "five") in a CV line must appear in the CV; in the cover letter and the
//     interview prep it must appear in the CV or the advert;
//   - every key skill must appear in the CV or be a taxonomy skill the CV
//     shows; one that the advert asks for but the CV does not show becomes a
//     "gap" instead.
//
// Anything that fails is taken out and listed for the person ("removed"), so
// nothing is dropped silently. A job title we cannot match word for word is
// kept but flagged ("review"). No dashes: em and en dashes become commas, or
// "to" inside dates.
//
// Pure functions with no imports from the app, so they can be tested on their
// own (node --experimental-strip-types).

import type { CvContact, CvEducation, CvRole, CvSection, Gap, InterviewPrep, PackChecks, TailoredCv } from "./pack-types";

export interface GroundingInput {
  cvText: string;
  advertText: string;
  /** Taxonomy skill ids the CV shows (results profile plus skills found in the CV text). */
  cvSkillIds: Set<string>;
  /** Taxonomy skill ids named in a short phrase (skillsInText). */
  skillIdsOf: (phrase: string) => string[];
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

// En dash (U+2013) and em dash (U+2014), built from their code points so the
// source file itself never contains either character.
const DASH = new RegExp(`\\s*[${String.fromCharCode(0x2013, 0x2014)}]\\s*`, "g");

/** No em or en dashes (house style). Inside a date range they read as "to". */
export function noDashes(value: string, dates = false): string {
  if (dates) return value.replace(DASH, " to ").replace(/\s+-\s+/g, " to ");
  return value.replace(DASH, ", ").replace(/,\s*,/g, ",");
}

/** One line of text: dashes out, whitespace collapsed, length capped. */
export function line(value: unknown, max = 400, dates = false): string {
  if (typeof value !== "string") return "";
  return noDashes(value, dates).replace(/\s+/g, " ").trim().slice(0, max);
}

/** Multi-paragraph text: dashes out, spaces tidied, paragraphs kept. */
export function paragraphs(value: unknown, max = 4000): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => noDashes(l).replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function normalise(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

const STOP = new Set([
  "and", "or", "the", "of", "in", "at", "to", "for", "a", "an", "with", "on", "by", "from", "as", "my", "our", "your",
  "ltd", "limited", "plc", "llp", "inc", "co", "company", "uk", "group", "the",
]);

/** Light stem so "managing", "manager" and "management" meet. */
function stem(word: string): string {
  return word.length >= 6 ? word.slice(0, 5) : word;
}

function tokens(text: string): string[] {
  return normalise(text)
    .trim()
    .split(" ")
    .filter((w) => w.length >= 2 && !STOP.has(w));
}

/** A haystack prepared once for many lookups. */
export class Source {
  readonly raw: string;
  readonly norm: string;
  readonly stems: Set<string>;
  readonly numbers: Set<string>;
  readonly figures: Set<string>;
  readonly years: Set<string>;
  readonly digits: string;
  constructor(raw: string) {
    this.raw = raw;
    this.norm = normalise(raw);
    this.stems = new Set(tokens(raw).map(stem));
    this.numbers = numbersIn(raw);
    this.figures = figuresIn(raw);
    this.years = new Set(raw.match(/\b(19|20)\d{2}\b/g) ?? []);
    this.digits = raw.replace(/\D+/g, "");
  }

  /**
   * True when `phrase` appears in the text: word for word, or with at least
   * `share` of its meaningful words present (stems, so small wording changes pass).
   */
  has(phrase: string, share = 0.8): boolean {
    const p = normalise(phrase);
    if (p.trim().length === 0) return true;
    if (this.norm.includes(p)) return true;
    const t = tokens(phrase);
    if (t.length === 0) return false;
    const found = t.filter((w) => this.stems.has(stem(w))).length;
    return found / t.length >= share;
  }
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

const NUMBER_WORDS: Record<string, string> = {
  two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12",
  thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18", nineteen: "19", twenty: "20",
  thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90", hundred: "100", thousand: "1000",
};
const WORD_RE = new RegExp(`\\b(${Object.keys(NUMBER_WORDS).join("|")})\\b`, "gi");
// A figure not glued to letters in front ("S4" and "B2B" are names, not
// figures), with "24/7" and "1:1" kept whole.
const FIGURE_RE = /(?<![A-Za-z0-9.])\d+(?:[.,]\d+)*(?:[/:]\d+)*/g;

function normNumber(raw: string): string {
  let n = raw.replace(/,(?=\d{3}\b)/g, "");
  if (/^\d+\.\d+$/.test(n)) n = n.replace(/\.?0+$/, "");
  return n.replace(/^0+(?=\d)/, "");
}

/** Whole figures in a text, normalised ("£1,200" gives "1200", "24/7" stays "24/7", "five" gives "5"). */
export function figuresIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.match(FIGURE_RE) ?? []) {
    out.add(
      m
        .split(/([/:])/)
        .map((p) => (p === "/" || p === ":" ? p : normNumber(p)))
        .join("")
    );
  }
  for (const m of text.match(WORD_RE) ?? []) out.add(NUMBER_WORDS[m.toLowerCase()]);
  return out;
}

/** Every number in a text, with "24/7" split into its parts. */
export function numbersIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const f of figuresIn(text)) for (const p of f.split(/[/:]/)) out.add(p);
  return out;
}

/**
 * Figures in `text` the sources do not support. A figure is supported when
 * every number in it is in the CV, or (cover letter and interview prep only)
 * when the same whole figure is in the advert: "24/7" in an advert does not
 * let "7 years" through.
 */
export function unsupportedNumbers(text: string, cvNumbers: Set<string>, advertFigures?: Set<string>): string[] {
  const bad: string[] = [];
  for (const f of figuresIn(text)) {
    const ok = f.split(/[/:]/).every((p) => cvNumbers.has(p)) || Boolean(advertFigures?.has(f));
    if (!ok) bad.push(f);
  }
  return bad;
}

/**
 * Splits prose into sentences, keeping the punctuation. A full stop only ends
 * a sentence when a space and a capital (or a figure or quote) follow, so
 * "£1.2m" and "e.g. the" stay whole.
 */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=["'(£$A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// The checks
// ---------------------------------------------------------------------------

type Removed = PackChecks["removed"];

function keepSentences(text: string, where: string, removed: Removed, cvNumbers: Set<string>, advertFigures?: Set<string>): string {
  return text
    .split("\n")
    .map((para) => {
      if (!para.trim()) return para;
      const kept: string[] = [];
      for (const s of sentences(para)) {
        const bad = unsupportedNumbers(s, cvNumbers, advertFigures);
        if (bad.length) removed.push({ where, text: s, why: `It had a figure (${bad.join(", ")}) that is not in your CV${advertFigures ? " or the advert" : ""}.` });
        else kept.push(s);
      }
      return kept.join(" ");
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function yearsOk(dates: string, cv: Source): boolean {
  const ys = dates.match(/\b(19|20)\d{2}\b/g) ?? [];
  return ys.every((y) => cv.years.has(y));
}

function checkContact(raw: CvContact, cv: Source, removed: Removed): CvContact {
  const keep = (value: string | null, what: string, test: (v: string) => boolean): string | null => {
    if (!value) return null;
    if (test(value)) return value;
    removed.push({ where: "Contact details", text: value, why: `We could not find this ${what} in your CV.` });
    return null;
  };
  const phoneOk = (v: string) => {
    const d = v.replace(/\D+/g, "");
    return d.length >= 6 && (cv.digits.includes(d) || cv.digits.includes(d.replace(/^44/, "0")));
  };
  return {
    name: keep(raw.name, "name", (v) => cv.has(v, 1)),
    email: keep(raw.email, "email address", (v) => cv.raw.toLowerCase().includes(v.toLowerCase())),
    phone: keep(raw.phone, "phone number", phoneOk),
    location: keep(raw.location, "place", (v) => cv.has(v, 0.8)),
    links: raw.links.filter((l) => {
      const bare = l.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").toLowerCase();
      const ok = bare.length > 3 && cv.raw.toLowerCase().includes(bare);
      if (!ok) removed.push({ where: "Contact details", text: l, why: "We could not find this link in your CV." });
      return ok;
    }),
  };
}

export interface GroundedCv {
  cv: TailoredCv;
  /** Key skills taken out that the advert asks for: shown as gaps. */
  newGaps: Gap[];
  removed: Removed;
  review: string[];
}

export function groundCv(raw: TailoredCv, input: GroundingInput): GroundedCv {
  const cv = new Source(input.cvText);
  const advert = new Source(input.advertText);
  const removed: Removed = [];
  const review: string[] = [];
  const newGaps: Gap[] = [];

  const contact = checkContact(raw.contact, cv, removed);
  const summary = keepSentences(raw.summary, "Profile", removed, cv.numbers);

  const keySkills: string[] = [];
  for (const skill of raw.keySkills) {
    const byWords = cv.has(skill, 0.6);
    const byTaxonomy = input.skillIdsOf(skill).some((id) => input.cvSkillIds.has(id));
    if ((byWords || byTaxonomy) && unsupportedNumbers(skill, cv.numbers).length === 0) {
      keySkills.push(skill);
    } else if (advert.has(skill, 0.6)) {
      newGaps.push({ requirement: skill, note: "The advert asks for this but your CV does not show it, so it is not in your tailored CV. Mention it only if it is true." });
      removed.push({ where: "Key skills", text: skill, why: "Your CV does not show this skill." });
    } else {
      removed.push({ where: "Key skills", text: skill, why: "We could not find this skill in your CV." });
    }
  }

  const experience: CvRole[] = [];
  for (const role of raw.experience) {
    const label = [role.title, role.employer].filter(Boolean).join(", ") || "A job";
    const employerOk = !role.employer || cv.has(role.employer, 0.8);
    const titleOk = !role.title || cv.has(role.title, 0.6);
    if (!employerOk && !titleOk) {
      removed.push({ where: "Experience", text: label, why: "Neither the job title nor the employer is in your CV." });
      continue;
    }
    let employer = role.employer;
    if (!employerOk) {
      removed.push({ where: "Experience", text: role.employer, why: "This employer name is not in your CV." });
      employer = "";
    }
    if (!titleOk) review.push(`Check the job title "${role.title}": we could not find it word for word in your CV.`);
    let dates = role.dates;
    if (dates && !yearsOk(dates, cv)) {
      removed.push({ where: `Experience: ${label}`, text: dates, why: "These dates are not in your CV." });
      dates = "";
    }
    let location = role.location;
    if (location && !cv.has(location, 0.8)) {
      removed.push({ where: `Experience: ${label}`, text: location, why: "This place is not in your CV." });
      location = "";
    }
    const bullets: string[] = [];
    for (const b of role.bullets) {
      const bad = unsupportedNumbers(b, cv.numbers);
      if (bad.length) removed.push({ where: `Experience: ${label}`, text: b, why: `It had a figure (${bad.join(", ")}) that is not in your CV.` });
      else bullets.push(b);
    }
    experience.push({ title: role.title, employer, location, dates, bullets });
  }

  const education: CvEducation[] = [];
  for (const e of raw.education) {
    const label = [e.qualification, e.institution].filter(Boolean).join(", ");
    const ok = (!e.qualification || cv.has(e.qualification, 0.6)) && (!e.institution || cv.has(e.institution, 0.7)) && (e.qualification || e.institution);
    if (!ok) {
      removed.push({ where: "Education", text: label, why: "We could not find this qualification in your CV." });
      continue;
    }
    let dates = e.dates;
    if (dates && !yearsOk(dates, cv)) {
      removed.push({ where: `Education: ${label}`, text: dates, why: "These dates are not in your CV." });
      dates = "";
    }
    education.push({ qualification: e.qualification, institution: e.institution, dates });
  }

  const certifications = raw.certifications.filter((c) => {
    const ok = cv.has(c, 0.7) && unsupportedNumbers(c, cv.numbers).length === 0;
    if (!ok) removed.push({ where: "Certifications", text: c, why: "We could not find this certificate in your CV." });
    return ok;
  });

  const otherSections: CvSection[] = [];
  for (const s of raw.otherSections) {
    const items = s.items.filter((i) => {
      const ok = cv.has(i, 0.5) && unsupportedNumbers(i, cv.numbers).length === 0;
      if (!ok) removed.push({ where: s.heading || "Other", text: i, why: "We could not find this in your CV." });
      return ok;
    });
    if (s.heading && items.length) otherSections.push({ heading: s.heading, items });
  }

  return { cv: { contact, summary, keySkills, experience, education, certifications, otherSections }, newGaps, removed, review };
}

export interface GroundedExtras {
  coverLetter: string;
  prep: InterviewPrep;
  removed: Removed;
  review: string[];
}

// Capitalised words that say nothing about experience.
const PLAIN_CAPS = new Set([
  "dear", "hiring", "manager", "yours", "sincerely", "faithfully", "kind", "regards", "i", "uk", "cv", "english", "british",
  "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]);

/**
 * Names in a sentence that the advert uses and the CV does not: product,
 * brand and system names such as FANUC, ABB or Siemens. The first word of the
 * sentence, and the words of the job title and employer, are left out.
 */
function advertOnlyNames(sentence: string, cv: Source, advertRaw: string, skip: Set<string>): string[] {
  const words = sentence.match(/[A-Za-z][A-Za-z0-9+#&-]*/g) ?? [];
  const cvLower = ` ${cv.raw.toLowerCase().replace(/[^a-z0-9+#&-]+/g, " ")} `;
  const advertWords = new Set(advertRaw.match(/[A-Za-z][A-Za-z0-9+#&-]*/g) ?? []);
  const out: string[] = [];
  words.forEach((w, i) => {
    if (i === 0 || !/^[A-Z]/.test(w)) return;
    const lower = w.toLowerCase();
    if (PLAIN_CAPS.has(lower) || skip.has(lower) || !advertWords.has(w) || cvLower.includes(` ${lower} `)) return;
    if (!out.includes(w)) out.push(w);
  });
  return out;
}

/**
 * The cover letter and interview prep may use figures from the CV, or whole
 * figures from the advert, nothing else. A letter sentence that names a
 * product or system from the advert that the CV never mentions (FANUC, ABB,
 * Siemens) is flagged for the person to check rather than taken out: "I have
 * not used FANUC robots yet" is fine, a claim to have used them is not.
 */
export function groundExtras(
  letter: string,
  prep: InterviewPrep,
  input: Pick<GroundingInput, "cvText" | "advertText"> & { jobTitle?: string; company?: string }
): GroundedExtras {
  const cv = new Source(input.cvText);
  const advert = new Source(input.advertText);
  const removed: Removed = [];
  const review: string[] = [];
  const coverLetter = keepSentences(letter, "Cover letter", removed, cv.numbers, advert.figures);
  const skip = new Set(`${input.jobTitle ?? ""} ${input.company ?? ""}`.toLowerCase().match(/[a-z0-9+#&-]+/g) ?? []);
  for (const s of sentences(coverLetter.replace(/\n+/g, " "))) {
    const names = advertOnlyNames(s, cv, input.advertText, skip);
    if (names.length) review.push(`Cover letter: "${s}" names ${names.join(", ")}, which your CV does not mention. Keep it only if it is true.`);
  }
  const bad = (t: string) => unsupportedNumbers(t, cv.numbers, advert.figures);
  const questions = prep.questions
    .map((q) => ({
      question: q.question,
      whyTheyAsk: bad(q.whyTheyAsk).length ? "" : q.whyTheyAsk,
      answerPoints: q.answerPoints.filter((p) => {
        const b = bad(p);
        if (b.length) removed.push({ where: "Interview prep", text: p, why: `It had a figure (${b.join(", ")}) that is not in your CV or the advert.` });
        return b.length === 0;
      }),
    }))
    .filter((q) => q.question && bad(q.question).length === 0);
  const questionsToAsk = prep.questionsToAsk.filter((q) => bad(q).length === 0);
  return { coverLetter, prep: { questions, questionsToAsk }, removed, review: review.slice(0, 6) };
}
