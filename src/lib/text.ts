// Small text helpers shared by server and client code.

/** Names that keep their capitals mid-sentence, as they appear in job and ONS titles. */
const PROPER_NOUNS = ["His Majesty's Inspector", "Civil Service", "Border Force", "Royal Marines", "Royal Navy", "Ofsted", "English", "Jobcentre"];

/**
 * A job or occupation title as it reads mid-sentence: "Data analyst" becomes
 * "data analyst", while acronyms (HR, HGV, IT, UX, NHS, SIA, L&D) and proper
 * nouns (Ofsted, Civil Service, Border Force) keep their capitals, so "HR
 * officer" never becomes "hR officer" or "hr officer".
 */
export function titleInSentence(title: string): string {
  const keep: [number, number][] = [];
  for (const p of PROPER_NOUNS) {
    for (let i = title.indexOf(p); i >= 0; i = title.indexOf(p, i + p.length)) keep.push([i, i + p.length]);
  }
  return title.replace(/[A-Za-z][A-Za-z'&]*/g, (word: string, offset: number) => {
    if (keep.some(([a, b]) => offset >= a && offset < b)) return word;
    // "3D printing technician": a letter straight after a digit is part of a code, not a word.
    if (offset > 0 && /[0-9]/.test(title.charAt(offset - 1))) return word;
    if ((word.match(/[A-Z]/g) ?? []).length >= 2) return word;
    return word.charAt(0).toLowerCase() + word.slice(1);
  });
}

/**
 * "a" or "an" for a phrase as it reads mid-sentence: "an accountant", "an HR
 * officer" (said "aitch"), "a UX designer" (said "you"), "a user researcher".
 */
export function aOrAn(phrase: string): "a" | "an" {
  const w = phrase.trim().split(/\s+/)[0] ?? "";
  if (/^[A-Z]{2,}/.test(w)) return /^[AEFHILMNORSX]/.test(w) ? "an" : "a";
  const l = w.toLowerCase();
  if (/^(uni|use|usu|uti|ur[ai]|eu|one\b|once)/.test(l)) return "a";
  if (/^(hour|honest|honour|heir)/.test(l)) return "an";
  return /^[aeiou]/.test(l) ? "an" : "a";
}

/** The phrase with "a" or "an" in front: withArticle("HR officer") is "an HR officer". */
export function withArticle(phrase: string): string {
  return `${aOrAn(phrase)} ${phrase}`;
}

/** First letter in capitals, for the start of a sentence. */
export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
