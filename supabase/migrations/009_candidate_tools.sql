-- =============================================================================
-- 009_candidate_tools.sql  (MatchMySkillset candidate CV tools, 29 Sep 2026)
--
-- NOT APPLIED YET. Candidate accounts, job packs and the Plus plan:
--   * mms_candidate_accounts: job seeker accounts (email magic link, no
--     password), the Plus subscription, the one free tailored CV, consents,
--     and a saved CV only when the person ticks "keep my CV on my account".
--   * mms_candidate_login_tokens / mms_candidate_sessions: sign-in links and
--     sessions, stored only as SHA-256 hashes (same model as the employer side).
--   * mms_job_packs: one job pack per row (tailored CV, cover letter,
--     interview prep for one job). Holds the CV text that was used, which is
--     deleted with the pack. account_id is null for guest purchases; guest
--     packs expire after 12 months, unpaid drafts after a day.
--   * mms_candidate_usage: Plus fair-use counter (30 packs a billing month)
--     and "Check any job" uses. Kept when a pack is deleted, so deleting packs
--     does not reset the monthly count; deleted with the account.
--   * mms_candidate_reports: results pages (mms_reports) linked to an account.
--   * mms_purchases.product: tells job pack purchases apart from Career
--     Change Report purchases in the 6-year purchase record.
--   * mms_candidate_claim_usage(): counts and records one use atomically, so
--     two requests at the same moment cannot both take the 30th pack.
--
-- Runs on the SHARED Supabase project: every object is mms_ prefixed, RLS is
-- on, and only the service role can touch the tables (no anon or
-- authenticated grants). The code works before this is applied: accounts, job
-- packs and Plus say they are "not switched on yet". Safe to run more than
-- once. Nothing is dropped.
-- =============================================================================
BEGIN;

-- -----------------------------------------------------------------------------
-- Accounts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_candidate_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE,                     -- always lower case
  verified_at timestamptz,
  last_sign_in_at timestamptz,
  plan text NOT NULL DEFAULT 'none',              -- none | plus
  plan_status text NOT NULL DEFAULT 'inactive',   -- inactive | active | past_due | cancelled | comped
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  free_pack_used_at timestamptz,                  -- the one free tailored CV
  marketing_consent_at timestamptz,               -- optional, unticked by default
  tracking_consent_at timestamptz,                -- optional: application tracking and check-ins
  saved_cv_text text,                             -- only with the "keep my CV on my account" tick
  saved_cv_name text,
  saved_cv_at timestamptz,
  CONSTRAINT mms_candidate_accounts_email_lower CHECK (email = lower(email)),
  CONSTRAINT mms_candidate_accounts_plan_check CHECK (plan IN ('none', 'plus')),
  CONSTRAINT mms_candidate_accounts_status_check CHECK (plan_status IN ('inactive', 'active', 'past_due', 'cancelled', 'comped'))
);
CREATE INDEX IF NOT EXISTS idx_mms_candidate_accounts_subscription
  ON public.mms_candidate_accounts (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_candidate_accounts_customer
  ON public.mms_candidate_accounts (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

COMMENT ON TABLE public.mms_candidate_accounts IS
  'MatchMySkillset job seeker accounts (magic link sign-in). Deleting a row deletes its sessions, packs, usage and links.';
COMMENT ON COLUMN public.mms_candidate_accounts.saved_cv_text IS
  'Raw CV text, kept only when the person ticked "keep my CV on my account". They can delete it from /account.';

-- Sign-in links and sessions (hashed)
CREATE TABLE IF NOT EXISTS public.mms_candidate_login_tokens (
  token_hash text PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_mms_candidate_login_tokens_expires ON public.mms_candidate_login_tokens (expires_at);

CREATE TABLE IF NOT EXISTS public.mms_candidate_sessions (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES public.mms_candidate_accounts (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mms_candidate_sessions_account ON public.mms_candidate_sessions (account_id);
CREATE INDEX IF NOT EXISTS idx_mms_candidate_sessions_expires ON public.mms_candidate_sessions (expires_at);

-- -----------------------------------------------------------------------------
-- Job packs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_job_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  token text UNIQUE NOT NULL,                     -- private link /packs/<token>
  account_id uuid REFERENCES public.mms_candidate_accounts (id) ON DELETE CASCADE,  -- null for guest purchases
  email text,
  results_token text,                             -- the results link the job came from, if any
  job jsonb NOT NULL,                             -- title, company, url, source, description text used
  source_cv_text text,                            -- the CV text used; deleted with the pack
  scope text NOT NULL DEFAULT 'full',             -- cv (the free tailored CV) | full (CV, cover letter, interview prep)
  status text NOT NULL DEFAULT 'queued',          -- awaiting_payment | queued | generating | ready | failed
  paid_via text,                                  -- free | one_off | plus
  upgrade_paid_via text,                          -- one_off | plus, when a free CV was later made a full pack
  stripe_session_id text UNIQUE,
  upgrade_session_id text UNIQUE,
  amount_pence int,
  consent_at timestamptz,                         -- digital content consent (Consumer Contracts Regulations 2013)
  consent_text text,
  claimed_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  error text,
  fit jsonb,                                      -- deterministic match and skills check at the time
  tailored_cv jsonb,
  cover_letter text,
  interview_prep jsonb,
  gaps jsonb,
  checks jsonb,                                   -- lines removed by the grounding checks, change notes
  model text,
  usage jsonb,                                    -- tokens, cost and time per generation
  generated_at timestamptz,
  approved_at timestamptz,
  emailed_at timestamptz,
  expires_at timestamptz,                         -- guest packs: 12 months; unpaid drafts: 1 day; account packs: null
  CONSTRAINT mms_job_packs_scope_check CHECK (scope IN ('cv', 'full')),
  CONSTRAINT mms_job_packs_status_check CHECK (status IN ('awaiting_payment', 'queued', 'generating', 'ready', 'failed')),
  CONSTRAINT mms_job_packs_paid_via_check CHECK (paid_via IS NULL OR paid_via IN ('free', 'one_off', 'plus')),
  CONSTRAINT mms_job_packs_upgrade_check CHECK (upgrade_paid_via IS NULL OR upgrade_paid_via IN ('one_off', 'plus'))
);
CREATE INDEX IF NOT EXISTS idx_mms_job_packs_account ON public.mms_job_packs (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mms_job_packs_results ON public.mms_job_packs (results_token) WHERE results_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_job_packs_email ON public.mms_job_packs (lower(email));
CREATE INDEX IF NOT EXISTS idx_mms_job_packs_expires ON public.mms_job_packs (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_job_packs_status ON public.mms_job_packs (status, created_at);

COMMENT ON TABLE public.mms_job_packs IS
  'MatchMySkillset job packs. source_cv_text and the tailored text are personal data: deleted with the pack, the account, or at expires_at.';

-- Plus fair use and tool use (not deleted with a pack, so the monthly count holds)
CREATE TABLE IF NOT EXISTS public.mms_candidate_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.mms_candidate_accounts (id) ON DELETE CASCADE,
  kind text NOT NULL,                             -- pack | check
  pack_id uuid                                    -- no foreign key on purpose: the row outlives the pack
);
CREATE INDEX IF NOT EXISTS idx_mms_candidate_usage_account ON public.mms_candidate_usage (account_id, kind, created_at);

-- Results pages linked to an account (same browser, or opened while signed in)
CREATE TABLE IF NOT EXISTS public.mms_candidate_reports (
  account_id uuid NOT NULL REFERENCES public.mms_candidate_accounts (id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES public.mms_reports (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, report_id)
);
CREATE INDEX IF NOT EXISTS idx_mms_candidate_reports_report ON public.mms_candidate_reports (report_id);

-- Which product a purchase row is for (null = Career Change Report, as before)
ALTER TABLE public.mms_purchases ADD COLUMN IF NOT EXISTS product text;

-- -----------------------------------------------------------------------------
-- One use, counted and recorded atomically. Returns false (and records
-- nothing) when p_limit uses of p_kind have already been recorded since
-- p_since. The advisory lock serialises callers for the same account and kind.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mms_candidate_claim_usage(
  p_account uuid,
  p_kind text,
  p_since timestamptz,
  p_limit integer,
  p_pack uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $fn$
DECLARE
  used integer;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_account::text || ':' || p_kind, 0));
  SELECT count(*) INTO used
    FROM public.mms_candidate_usage
   WHERE account_id = p_account AND kind = p_kind AND created_at >= p_since;
  IF used >= p_limit THEN
    RETURN false;
  END IF;
  INSERT INTO public.mms_candidate_usage (account_id, kind, pack_id) VALUES (p_account, p_kind, p_pack);
  RETURN true;
END
$fn$;

REVOKE ALL ON FUNCTION public.mms_candidate_claim_usage(uuid, text, timestamptz, integer, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mms_candidate_claim_usage(uuid, text, timestamptz, integer, uuid) TO service_role;

-- -----------------------------------------------------------------------------
-- Lock every new table to the service role
-- -----------------------------------------------------------------------------
DO $lock$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mms_candidate_accounts','mms_candidate_login_tokens','mms_candidate_sessions','mms_job_packs','mms_candidate_usage','mms_candidate_reports'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);
  END LOOP;
END
$lock$;

COMMIT;

-- PostgREST caches the schema; reload it so the new tables and function are visible at once.
NOTIFY pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- Read-only checks to run afterwards:
--   SELECT relname, relrowsecurity FROM pg_class WHERE relname LIKE 'mms_candidate%' OR relname = 'mms_job_packs';
--     -> relrowsecurity true for all six
--   SELECT count(*) FROM pg_policies WHERE tablename LIKE 'mms_candidate%' OR tablename = 'mms_job_packs';
--     -> 0
--   SELECT has_table_privilege('anon', 'public.mms_job_packs', 'select');
--     -> false
-- -----------------------------------------------------------------------------
