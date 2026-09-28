-- =============================================================================
-- 004_revamp_tables.sql  (MatchMySkillset, written 2026-09-28, NOT YET APPLIED)
--
-- Runs on the SHARED Supabase project noxczmrnyyosgvvjlqca. Needs the owner's
-- approval before it is run. Safe to run more than once (IF NOT EXISTS /
-- OR REPLACE throughout). Touches only mms_ objects.
--
-- New tables for the revamp (no accounts, one-off paid report, guest checkout):
--   mms_reports        results behind a shareable token link, kept 12 months
--   mms_purchases      one row per Stripe Checkout session, kept 6 years (tax)
--   mms_stripe_events  webhook idempotency for MMS only (replaces MMS use of
--                      the shared, unprefixed stripe_events table)
--   mms_rate_limits    fixed-window counters used by src/lib/rate-limit.ts
-- plus mms_rate_limit_hit(), an atomic increment for mms_rate_limits,
-- and opt-in recruiter consent columns on the existing mms_email_leads
-- (existing rows get recruiter_consent = false).
--
-- Access model: RLS ON, NO policies, and no privileges for anon or
-- authenticated. Only the service-role key used by server routes can read or
-- write. (The project's default privileges grant everything to anon and
-- authenticated on new tables, hence the explicit REVOKEs.)
--
-- NOTE: "current_role" is a reserved word in PostgreSQL, so that column name
-- must always be double-quoted in raw SQL. PostgREST / supabase-js quote
-- column names themselves, so `.select("current_role")` and
-- `.insert({ current_role: ... })` work as normal.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- mms_reports
-- raw CV text is NEVER stored here: only the extracted skills and matches.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  token text UNIQUE NOT NULL,
  skills jsonb,
  matches jsonb,
  "current_role" text,
  email text NULL,
  source text,
  expires_at timestamptz DEFAULT (now() + interval '12 months')
);

CREATE INDEX IF NOT EXISTS idx_mms_reports_expires_at ON public.mms_reports (expires_at);

COMMENT ON TABLE public.mms_reports IS
  'MatchMySkillset results behind a token link. No raw CV text. Delete rows once expires_at has passed (12 months).';

-- -----------------------------------------------------------------------------
-- mms_purchases
-- report_id is SET NULL when a report expires and is deleted, so the purchase
-- record survives for the 6-year tax retention period.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  stripe_session_id text UNIQUE,
  report_id uuid REFERENCES public.mms_reports (id) ON DELETE SET NULL,
  target_soc text,
  email text,
  amount_pence int,
  currency text,
  status text,
  fulfilled_at timestamptz,
  delivery_email_id text
);

CREATE INDEX IF NOT EXISTS idx_mms_purchases_report_id ON public.mms_purchases (report_id);
CREATE INDEX IF NOT EXISTS idx_mms_purchases_created_at ON public.mms_purchases (created_at);

COMMENT ON TABLE public.mms_purchases IS
  'MatchMySkillset one-off report purchases (guest checkout). Keep 6 years for tax, then delete.';

-- -----------------------------------------------------------------------------
-- mms_stripe_events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_stripe_events (
  event_id text PRIMARY KEY,
  type text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.mms_stripe_events IS
  'MatchMySkillset Stripe webhook idempotency: insert event_id first; a unique violation (23505) means already processed.';

-- -----------------------------------------------------------------------------
-- mms_rate_limits
-- key is an opaque, keyed hash (never a raw IP address); rows older than a
-- day are deleted by src/lib/rate-limit.ts.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_rate_limits (
  key text,
  window_start timestamptz,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_mms_rate_limits_window_start ON public.mms_rate_limits (window_start);

COMMENT ON TABLE public.mms_rate_limits IS
  'MatchMySkillset fixed-window rate limit counters. Hashed keys only. Rows older than 24 hours are purged.';

-- Atomic "add one and tell me the new count" for a window. SECURITY INVOKER,
-- so it can only do what the caller could do directly (service role only).
CREATE OR REPLACE FUNCTION public.mms_rate_limit_hit(p_key text, p_window_start timestamptz)
  RETURNS integer
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path = ''
AS $fn$
  INSERT INTO public.mms_rate_limits AS r (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET count = r.count + 1
  RETURNING r.count;
$fn$;

REVOKE ALL ON FUNCTION public.mms_rate_limit_hit(text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mms_rate_limit_hit(text, timestamptz) TO service_role;

-- -----------------------------------------------------------------------------
-- mms_email_leads: opt-in sharing with the recruitment partner
-- A lead is shown to the partner (GET /api/admin) only when
-- recruiter_consent = true, consent_at is within the last 12 months and
-- consent_withdrawn_at is null. Existing rows get recruiter_consent = false.
-- first_name and "current_role" are nullable extras the admin view shows when
-- the product collects them.
-- -----------------------------------------------------------------------------
ALTER TABLE public.mms_email_leads
  ADD COLUMN IF NOT EXISTS recruiter_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_withdrawn_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS "current_role" text;

CREATE INDEX IF NOT EXISTS idx_mms_email_leads_consented
  ON public.mms_email_leads (consent_at)
  WHERE recruiter_consent;

COMMENT ON COLUMN public.mms_email_leads.recruiter_consent IS
  'True only when the person ticked the optional recruiter box. cv_text must only be kept when this is true.';
COMMENT ON COLUMN public.mms_email_leads.consent_text IS
  'Exact wording of the checkbox the person agreed to.';

-- -----------------------------------------------------------------------------
-- RLS on, no policies, service role only
-- -----------------------------------------------------------------------------
ALTER TABLE public.mms_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_purchases     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_rate_limits   ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.mms_reports       FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_purchases     FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_stripe_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_rate_limits   FROM anon, authenticated;

GRANT ALL ON TABLE public.mms_reports       TO service_role;
GRANT ALL ON TABLE public.mms_purchases     TO service_role;
GRANT ALL ON TABLE public.mms_stripe_events TO service_role;
GRANT ALL ON TABLE public.mms_rate_limits   TO service_role;

COMMIT;

-- -----------------------------------------------------------------------------
-- Read-only checks to run afterwards:
--   SELECT relname, relrowsecurity, relacl FROM pg_class
--     WHERE relname IN ('mms_reports','mms_purchases','mms_stripe_events','mms_rate_limits');
--     -> relrowsecurity true; relacl lists postgres and service_role only
--   SELECT count(*) FROM pg_policies
--     WHERE tablename IN ('mms_reports','mms_purchases','mms_stripe_events','mms_rate_limits');
--     -> 0
-- -----------------------------------------------------------------------------
