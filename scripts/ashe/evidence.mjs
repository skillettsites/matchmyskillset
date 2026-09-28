// Rules that decide whether a curated occupation's apprenticeship, licence or
// qualification is backed by a source. Shared by validate.mjs.

/** Lower-case, drop bracketed text (e.g. "(integrated degree)"), keep letters and digits only. */
export function normTitle(s) {
  return String(s)
    .toLowerCase()
    .replace(/\([^()]*\)/g, " ")
    .replace(/\([^()]*\)/g, " ")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Function words that can sit just before an apprenticeship name in NCS sentences
// such as "You could apply to do a Social Worker Level 6 Degree Apprenticeship".
// Only function words are listed, so a longer name such as "Maintenance Operations
// Engineering Technician" can never be cut down to a different standard's title.
const FILLER = new Set("a an the do to on for by as like you could can may might also apply doing complete take taking".split(" "));

/**
 * The names NCS gives for apprenticeships, reduced to candidate titles plus level.
 * Each NCS item is cut at "Level N" (or "LN"). The candidates are the whole name
 * and every tail of it that starts right after a function word. "X or Y" is also
 * tried as two names.
 */
export function ncsApprenticeshipCandidates(namedItems) {
  const out = [];
  for (const item of namedItems) {
    for (const m of String(item).matchAll(/([A-Za-z0-9,()'&\- ]+?)\s+(?:Level|L)\s?(\d)\b/g)) {
      const level = m[2];
      const words = normTitle(m[1]).split(" ").filter(Boolean);
      const variants = [words];
      const joined = words.join(" ");
      if (joined.includes(" or ")) for (const part of joined.split(" or ")) variants.push(part.split(" ").filter(Boolean));
      for (const w of variants) {
        // Try every suffix that starts right after a filler word (or at the start).
        for (let k = 0; k < w.length; k++) {
          if (k > 0 && !FILLER.has(w[k - 1])) continue;
          out.push({ name: w.slice(k).join(" "), level });
        }
      }
    }
  }
  return out;
}

export function ncsNamesStandard(ncsProfile, standard) {
  if (!ncsProfile) return false;
  const target = normTitle(standard.title);
  return ncsApprenticeshipCandidates(ncsProfile.apprenticeshipsNamed).some(
    (c) => c.name === target && c.level === String(standard.level),
  );
}

function occupationNames(occ) {
  return [occ.title, ...occ.aliases].map(normTitle);
}

export function standardJobTitleMatches(occ, standard) {
  const names = new Set(occupationNames(occ));
  return (standard.typicalJobTitles ?? []).some((t) => names.has(normTitle(t)));
}

export function standardTitleMatches(occ, standard) {
  return occupationNames(occ).includes(normTitle(standard.title));
}

/** Returns the evidence type for an apprenticeship, or null when there is none. */
export function apprenticeshipEvidence(occ, standard, ncsProfile) {
  if (ncsNamesStandard(ncsProfile, standard)) return "named on NCS profile";
  if (standardJobTitleMatches(occ, standard)) return "typical job title on standard";
  if (standardTitleMatches(occ, standard)) return "standard title matches occupation";
  return null;
}

function containsWord(text, word) {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9])${esc}([^A-Za-z0-9]|$)`, "i").test(text);
}

export function ncsText(profile) {
  if (!profile) return "";
  return [profile.howToBecomeText, profile.moreInformationText, ...(profile.registration ?? []), ...(profile.restrictions ?? [])].join(" ");
}

export function licenceEvidence(occ, licence, ncsProfile, onsEntryRoutes, licenceCheck) {
  const text = ncsText(ncsProfile);
  const kw = licence.keywords.find((k) => containsWord(text, k));
  if (kw) return `NCS profile mentions "${kw}"`;
  const onsKw = licence.keywords.find((k) => containsWord(onsEntryRoutes ?? "", k));
  if (onsKw) return `ONS SOC 2020 entry text mentions "${onsKw}"`;
  const phrase = licence.appliesVia?.[occ.id];
  if (phrase && licenceCheck?.pages?.some((p) => p.ok && p.phrasesFound?.includes(phrase))) {
    return `licence body page lists "${phrase}"`;
  }
  return null;
}

export function qualificationEvidence(qualification, ncsProfile) {
  return containsWord(ncsText(ncsProfile), qualification) ? "named on NCS profile" : null;
}
