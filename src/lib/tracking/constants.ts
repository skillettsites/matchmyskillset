// Journey tracking: statuses, answers and the exact wording people see. No
// server imports, so client components can use it. Consent and notice texts
// are stored with each record and quoted in /privacy: change them here only,
// and update src/components/tracking/legal/TrackingPrivacy.tsx at the same time.

/** Shown wherever check-ins start: the tracker email box, the "I applied" prompt and the apply form. */
export const CHECKIN_NOTICE = "We'll email you at 7 and 21 days to ask how it went. You can stop these any time.";

/** The separate, unticked case-study question sent after a placement. Stored with the answer. */
export const MARKETING_CONSENT_TEXT =
  "Yes, MatchMySkillset may mention my move in its case studies and marketing, without my name, contact details or anything else that identifies me. I can withdraw this at any time from this page.";

/** Days after applying that the two "Did you hear back?" emails go out. */
export const CHECKIN_DAYS = [7, 21] as const;

/** How a tracked application stands, as the job seeker tells us. */
export type TrackedStatus = "applied" | "no_response" | "interview" | "offer" | "placed" | "withdrawn";

export const TRACKED_STATUSES: TrackedStatus[] = ["applied", "no_response", "interview", "offer", "placed", "withdrawn"];

export const TRACKED_STATUS_LABELS: Record<TrackedStatus, string> = {
  applied: "Applied",
  no_response: "No response yet",
  interview: "Interview",
  offer: "Offer",
  placed: "Got the job",
  withdrawn: "Withdrawn or turned down",
};

export function isTrackedStatus(value: unknown): value is TrackedStatus {
  return typeof value === "string" && (TRACKED_STATUSES as string[]).includes(value);
}

/** One-tap answers in a check-in email. "stop" stops asking about that job; "stopall" stops every check-in to the address. */
export type CheckinAnswer = "no_response" | "interview" | "offer" | "placed" | "stop" | "stopall";

export const CHECKIN_ANSWERS: CheckinAnswer[] = ["no_response", "interview", "offer", "placed", "stop", "stopall"];

export const CHECKIN_ANSWER_LABELS: Record<CheckinAnswer, string> = {
  no_response: "No response yet",
  interview: "Interview",
  offer: "Offer",
  placed: "Placed: I got the job",
  stop: "Stop asking about this job",
  stopall: "Stop all check-in emails",
};

export function isCheckinAnswer(value: unknown): value is CheckinAnswer {
  return typeof value === "string" && (CHECKIN_ANSWERS as string[]).includes(value);
}

/** What the employer sees of the job seeker's own answer (never more than these three). */
export const CANDIDATE_SAYS: Partial<Record<TrackedStatus, string>> = {
  interview: "Candidate says: interview",
  offer: "Candidate says: offer",
  placed: "Candidate says: placed",
};

/** Employer statuses, in pipeline order, with the words the dashboard uses. */
export const EMPLOYER_STATUS_LABELS = {
  new: "New",
  viewed: "Viewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Not taken forward",
} as const;

/** Funnel stages an application can reach, in order. */
export type Stage = "applied" | "interview" | "offer" | "placed";
