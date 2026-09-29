// Shapes of a job pack as stored in mms_job_packs and sent to the browser.
// Type-only plus small pure helpers: safe to import from client components.

export interface PackJob {
  title: string;
  company: string;
  location?: string;
  url?: string;
  /** Board id ("reed", "mms", ...) or "pasted". */
  source: string;
  sourceLabel?: string;
  /** The board's id for the advert, e.g. "reed_12345". */
  jobId?: string;
  /** The advert text the pack was written from. */
  description: string;
  /** True when `description` is the whole advert, not a summary. */
  fullText: boolean;
  salary?: string;
}

export interface CvContact {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  links: string[];
}

export interface CvRole {
  title: string;
  employer: string;
  location: string;
  dates: string;
  bullets: string[];
}

export interface CvEducation {
  qualification: string;
  institution: string;
  dates: string;
}

export interface CvSection {
  heading: string;
  items: string[];
}

export interface TailoredCv {
  contact: CvContact;
  summary: string;
  keySkills: string[];
  experience: CvRole[];
  education: CvEducation[];
  certifications: string[];
  otherSections: CvSection[];
}

export interface Gap {
  requirement: string;
  note: string;
}

export interface PrepQuestion {
  question: string;
  whyTheyAsk: string;
  answerPoints: string[];
}

export interface InterviewPrep {
  questions: PrepQuestion[];
  questionsToAsk: string[];
}

/** What the grounding checks changed, shown to the person. */
export interface PackChecks {
  /** Notes from the model on what it changed and why. */
  changes: string[];
  /** Lines taken out because something in them was not in the CV. */
  removed: { where: string; text: string; why: string }[];
  /** Things worth a second look (kept, but we could not match them to the CV exactly). */
  review: string[];
}

export interface PackFit {
  /** Match score from fit.ts, when the person has a results profile. */
  match: number | null;
  explain: string | null;
  /** Skill names found in the advert that the CV shows / does not show. */
  matched: string[];
  missing: string[];
}

export type PackStatus = "awaiting_payment" | "queued" | "generating" | "ready" | "failed";
export type PackScope = "cv" | "full";
export type PaidVia = "free" | "one_off" | "plus";

/** A pack as the pack page sees it (never includes the source CV text). */
export interface PackView {
  token: string;
  status: PackStatus;
  scope: PackScope;
  paidVia: PaidVia | null;
  upgradePaidVia: "one_off" | "plus" | null;
  job: PackJob;
  fit: PackFit | null;
  tailoredCv: TailoredCv | null;
  coverLetter: string | null;
  interviewPrep: InterviewPrep | null;
  gaps: Gap[];
  checks: PackChecks | null;
  error: string | null;
  createdAt: string;
  generatedAt: string | null;
  approvedAt: string | null;
  expiresAt: string | null;
  hasAccount: boolean;
  /** True while the full pack's extra parts are being written after an upgrade. */
  extrasPending: boolean;
  /** A failed pack that can be tried again (attempts left, and the CV looked like a CV). */
  canRetry: boolean;
}

export const EMPTY_CV: TailoredCv = {
  contact: { name: null, email: null, phone: null, location: null, links: [] },
  summary: "",
  keySkills: [],
  experience: [],
  education: [],
  certifications: [],
  otherSections: [],
};

/** Words in a piece of text (for the cover letter counter). */
export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
