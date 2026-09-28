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
    if ((word.match(/[A-Z]/g) ?? []).length >= 2) return word;
    return word.charAt(0).toLowerCase() + word.slice(1);
  });
}
