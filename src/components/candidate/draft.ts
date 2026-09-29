// Hands a pasted advert from "Check any job" to the tailor page in the same
// tab. sessionStorage only (gone when the tab closes); every read and write is
// wrapped in try/catch because storage can throw in private windows.

const KEY = "mms_tailor_draft";

export interface TailorDraft {
  title: string;
  company: string;
  advert: string;
}

export function saveTailorDraft(d: TailorDraft): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // storage unavailable
  }
}

/** Reads the draft once and clears it. */
export function takeTailorDraft(): TailorDraft | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(KEY);
    const d = JSON.parse(raw) as Partial<TailorDraft>;
    if (typeof d.advert !== "string" || typeof d.title !== "string") return null;
    return { title: d.title.slice(0, 200), company: typeof d.company === "string" ? d.company.slice(0, 160) : "", advert: d.advert.slice(0, 12_000) };
  } catch {
    return null;
  }
}
