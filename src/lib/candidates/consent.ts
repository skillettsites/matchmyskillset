// Exact consent wording shown to job seekers. The same strings are stored with
// each record (consent_text) and quoted in the privacy policy, so change them
// here only, and update /privacy at the same time.

export const ALERT_CONSENT_TEXT =
  "Email me new jobs that match my results. I can change how often or unsubscribe with one click in any email.";

export const PROFILE_CONSENT_TEXT =
  "Let employers who use MatchMySkillset find my anonymous profile and ask to contact me. They see my headline, job title, region, years of experience and skills, never my name, email or CV, unless I accept their request. I can switch this off or delete my profile at any time.";

/** Ticked on the apply form. Names the employer and the job, as consent must. */
export function applyConsentText(company: string, title: string): string {
  return `Send my name, email, phone number (if given), CV and note to ${company} for the ${title} job. ${company} will contact me directly and handles my details under its own privacy policy.`;
}

/** What a candidate agrees to by pressing Accept on a contact request. */
export function contactAcceptText(company: string): string {
  return `Share my first name, email address and CV with ${company} so they can contact me.`;
}

/** Months a candidate profile, alert or application is kept before it is deleted. */
export const RETENTION_MONTHS = 12;
