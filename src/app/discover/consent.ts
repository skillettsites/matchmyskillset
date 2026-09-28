import { RECRUITMENT_PARTNER_NAME } from "@/lib/site";

/**
 * Exact wording of the optional recruiter box on /discover. The same string is
 * stored as consent_text when someone ticks it, and the privacy policy
 * (section 4a) quotes it. Only used while RECRUITER_SHARING_ENABLED is true.
 */
export function recruiterConsentText(): string {
  return `Let ${RECRUITMENT_PARTNER_NAME}, a UK recruitment agency, contact me about roles that fit my skills. MatchMySkillset will pass them my email address, my CV and my results. I can withdraw at any time.`;
}
