// Row shapes for the job board tables (supabase/migrations/006_job_board.sql,
// plus the optional columns from 007_employer_extras.sql and 008_shortlists.sql).

export interface EmployerAccount {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  company_name: string | null;
  contact_name: string | null;
  website: string | null;
  plan: string;
  plan_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  verified_at: string | null;
  terms_accepted_at: string | null;
  notes: string | null;
  /** 007: public company page address. */
  slug?: string | null;
  /** 007: company page text. */
  company_description?: string | null;
}

export type JobStatus = "draft" | "pending" | "live" | "closed" | "rejected";
export type RemoteMode = "onsite" | "hybrid" | "remote";
export type ApplyMethod = "mms" | "url" | "email";

export interface JobRow {
  id: string;
  created_at: string;
  updated_at: string;
  account_id: string | null;
  status: JobStatus;
  title: string;
  company_name: string;
  location: string | null;
  region: string | null;
  remote: RemoteMode;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string | null;
  contract_type: string | null;
  hours: string | null;
  description: string;
  apply_method: ApplyMethod;
  apply_url: string | null;
  apply_email: string | null;
  soc_code: string | null;
  skills: unknown;
  featured: boolean;
  approved_at: string | null;
  expires_at: string | null;
  views: number;
  /** 007: the reason given when a job is sent back. */
  review_note?: string | null;
  /** 008: the employer ticked "Send me a recruiter shortlist"; the request is opened when the job goes live. */
  shortlist_wanted?: boolean;
}

export type ApplicationStatus = "new" | "viewed" | "shortlisted" | "rejected";

export interface ApplicationRow {
  id: string;
  created_at: string;
  job_id: string;
  candidate_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  cv_text: string | null;
  cover_note: string | null;
  match_score: number | null;
  matched_skills: unknown;
  consent_at: string;
  consent_text: string;
  status: ApplicationStatus;
  employer_notified_at: string | null;
}

/** What an employer may see of a discoverable candidate before contact is accepted. */
export interface AnonymousCandidate {
  id: string;
  headline: string | null;
  current_role: string | null;
  region: string | null;
  years_experience: number | null;
  skills: unknown;
  created_at: string;
}

export type ContactStatus = "pending" | "accepted" | "declined" | "expired";

export interface ContactRequestRow {
  id: string;
  created_at: string;
  account_id: string;
  candidate_id: string;
  job_id: string | null;
  message: string | null;
  status: ContactStatus;
  response_token: string;
  responded_at: string | null;
}

export type ShortlistStatus = "requested" | "in_progress" | "sent" | "cancelled";

/** 008: one recruiter shortlist request per job. */
export interface ShortlistRow {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string;
  account_id: string | null;
  status: ShortlistStatus;
  requested_at: string;
  started_at: string | null;
  sent_at: string | null;
  recruiter_name: string | null;
  summary: string | null;
}

/** 008: one pick on a shortlist: an application to the job, or an opted-in candidate (never both). */
export interface ShortlistItemRow {
  id: string;
  created_at: string;
  shortlist_id: string;
  application_id: string | null;
  candidate_id: string | null;
  rank: number;
  recruiter_note: string | null;
}
