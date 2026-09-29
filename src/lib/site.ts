// Site-wide facts used by the legal pages and anywhere else that needs them.

export const SITE_NAME = "MatchMySkillset";
export const SITE_URL = "https://matchmyskillset.com";
export const CONTACT_EMAIL = "hello@matchmyskillset.com";

// OWNER TO CONFIRM: the legal name of the business that runs the site (the
// data controller), for example a limited company name, and whether it is
// registered with the ICO for this site. Until confirmed this is the trading
// name only, and the legal pages show no ICO registration number. Do not add
// one here until it has been checked on the ICO register.
export const LEGAL_ENTITY_NAME = "MatchMySkillset";

// OWNER TO CONFIRM: the registered legal name of the recruitment agency that
// receives details from people who tick the optional recruiter box. Consent is
// only valid if it names the recipient, so the box on /discover and the
// recruiter section of the privacy policy stay switched off until this is set.
export const RECRUITMENT_PARTNER_NAME = "";

/** True once the recruitment partner is named; gates the opt-in box and policy text. */
export const RECRUITER_SHARING_ENABLED = RECRUITMENT_PARTNER_NAME.trim().length > 0;

// Date shown on /privacy and /terms. Update it whenever either page changes.
export const LEGAL_LAST_UPDATED = "29 September 2026";
