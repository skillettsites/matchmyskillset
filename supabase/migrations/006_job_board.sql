-- =============================================================================
-- 006_job_board.sql  (MatchMySkillset v3, 28 Sep 2026)
--
-- The two-sided job board: employers post jobs and receive applicants; job
-- seekers get CV-matched jobs, can apply, set job alerts, and can opt in to be
-- found by employers. Runs on the SHARED Supabase project: every object is
-- mms_ prefixed, RLS is on, and only the service role can touch the tables.
-- The old empty mms_employers / mms_featured_jobs / mms_profiles tables are
-- left alone. Safe to run more than once.
-- =============================================================================
BEGIN;

-- Employer accounts (no Supabase Auth: sign-in is by emailed magic link)
CREATE TABLE IF NOT EXISTS public.mms_employer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text UNIQUE NOT NULL,
  company_name text,
  contact_name text,
  website text,
  plan text NOT NULL DEFAULT 'none',            -- none | starter | growth | enterprise
  plan_status text NOT NULL DEFAULT 'inactive',  -- inactive | active | past_due | cancelled | comped
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  verified_at timestamptz,
  terms_accepted_at timestamptz,
  notes text
);

-- One-time sign-in tokens (hashed) and sessions (hashed)
CREATE TABLE IF NOT EXISTS public.mms_login_tokens (
  token_hash text PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.mms_employer_sessions (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES public.mms_employer_accounts (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Jobs posted on MatchMySkillset
CREATE TABLE IF NOT EXISTS public.mms_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid REFERENCES public.mms_employer_accounts (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',          -- draft | pending | live | closed | rejected
  title text NOT NULL,
  company_name text NOT NULL,
  location text,
  region text,
  remote text NOT NULL DEFAULT 'onsite',         -- onsite | hybrid | remote
  salary_min int,
  salary_max int,
  salary_period text DEFAULT 'year',             -- year | hour | day
  contract_type text,                            -- permanent | contract | temporary | apprenticeship
  hours text,                                    -- full_time | part_time
  description text NOT NULL,
  apply_method text NOT NULL DEFAULT 'mms',      -- mms | url | email
  apply_url text,
  apply_email text,
  soc_code text,
  skills jsonb,                                  -- skill ids from the taxonomy
  featured boolean NOT NULL DEFAULT false,
  approved_at timestamptz,
  expires_at timestamptz,
  views int NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_mms_jobs_status ON public.mms_jobs (status, expires_at);
CREATE INDEX IF NOT EXISTS idx_mms_jobs_account ON public.mms_jobs (account_id);

-- Job seekers who saved a profile (only with consent)
CREATE TABLE IF NOT EXISTS public.mms_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  manage_token text UNIQUE NOT NULL,             -- private link to view, edit or delete
  email text NOT NULL,
  first_name text,
  "current_role" text,
  location text,
  region text,
  years_experience int,
  skills jsonb,
  headline text,
  cv_text text,                                  -- kept only while discoverable or for their own applications
  report_id uuid REFERENCES public.mms_reports (id) ON DELETE SET NULL,
  discoverable boolean NOT NULL DEFAULT false,   -- "let employers find me"
  discoverable_consent_at timestamptz,
  consent_text text,
  withdrawn_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '12 months')
);
CREATE INDEX IF NOT EXISTS idx_mms_candidates_email ON public.mms_candidates (lower(email));
CREATE INDEX IF NOT EXISTS idx_mms_candidates_discoverable ON public.mms_candidates (discoverable) WHERE discoverable;

-- Applications to jobs posted on MatchMySkillset (consent given at apply time)
CREATE TABLE IF NOT EXISTS public.mms_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES public.mms_jobs (id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES public.mms_candidates (id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  cv_text text,
  cover_note text,
  match_score int,
  matched_skills jsonb,
  consent_at timestamptz NOT NULL,
  consent_text text NOT NULL,
  status text NOT NULL DEFAULT 'new',            -- new | viewed | shortlisted | rejected
  employer_notified_at timestamptz,
  delete_after timestamptz DEFAULT (now() + interval '12 months')
);
CREATE INDEX IF NOT EXISTS idx_mms_applications_job ON public.mms_applications (job_id);

-- Employers asking to contact a discoverable candidate; the candidate decides
CREATE TABLE IF NOT EXISTS public.mms_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.mms_employer_accounts (id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.mms_candidates (id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.mms_jobs (id) ON DELETE SET NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',        -- pending | accepted | declined | expired
  response_token text UNIQUE NOT NULL,
  responded_at timestamptz
);

-- Job alerts: new matching jobs emailed to the seeker
CREATE TABLE IF NOT EXISTS public.mms_job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  manage_token text UNIQUE NOT NULL,             -- change or unsubscribe
  report_id uuid REFERENCES public.mms_reports (id) ON DELETE SET NULL,
  skills jsonb,
  query jsonb,                                   -- titles, location, region, remote, salary floor
  frequency text NOT NULL DEFAULT 'weekly',      -- daily | weekly
  active boolean NOT NULL DEFAULT true,
  consent_at timestamptz NOT NULL,
  last_sent_at timestamptz,
  sent_job_keys jsonb                            -- recent job keys already sent, to avoid repeats
);
CREATE INDEX IF NOT EXISTS idx_mms_job_alerts_active ON public.mms_job_alerts (active, last_sent_at);

-- Lock everything to the service role
DO $lock$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mms_employer_accounts','mms_login_tokens','mms_employer_sessions','mms_jobs','mms_candidates','mms_applications','mms_contact_requests','mms_job_alerts'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);
  END LOOP;
END
$lock$;

COMMIT;
