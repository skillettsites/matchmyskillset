-- =============================================================================
-- 010_tracking.sql  (MatchMySkillset journey tracking, 29 Sep 2026)
--
-- NOT APPLIED YET. Adds, on top of 006-008:
--   * mms_tracked_applications: a job seeker's application tracker. One row per
--     job they applied for: jobs applied for through MatchMySkillset (linked to
--     mms_applications) and outside jobs they told us they applied for from a
--     results card. Rows sharing a manage_token make up one private tracker
--     page (/tracker/<token>). "Did you hear back?" check-ins go out 7 and 21
--     days after applying (next_checkin_at, checkins_sent).
--   * mms_placements: people who got the job, recorded when an employer marks
--     an applicant hired, the job seeker answers "Placed", or admin records one.
--     Holds the separate, unticked case-study (marketing) consent with its time
--     and exact wording. Anonymous by default.
--   * mms_journey_events: an append-only log of what happened (application
--     status changes, check-ins sent and answered, placements, consent). No
--     names or email addresses: a keyed hash of the email only. kind 'stage'
--     rows record the first time an application reaches applied / interview /
--     offer / placed (unique per stage_key and status), which is what the admin
--     funnel counts.
--   * mms_employer_accounts: partner rates (partner_plan, partner_price_pence,
--     partner_set_at) set by admin for Flintstone Associates clients, and
--     billed_price_pence, the monthly price of the card subscription in force
--     (written by the Stripe webhook).
--   * mms_funnel_counts(): the admin funnel, counted in Postgres by period.
--
-- The Lite plan (plan = 'lite') needs no change: mms_employer_accounts.plan
-- and mms_applications.status have no check constraints. The new application
-- statuses are new | viewed | shortlisted | interview | offer | hired | rejected.
--
-- Runs on the SHARED Supabase project: mms_ prefix, RLS on, service role only
-- (no anon or authenticated grants). The code works before this is applied:
-- the tracker, check-ins, placements, funnel and partner rates say they are
-- not switched on yet. Safe to run more than once.
-- =============================================================================
BEGIN;

-- -----------------------------------------------------------------------------
-- Tracked applications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_tracked_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  manage_token text NOT NULL,                    -- the person's private tracker link; shared by all their rows
  email text NOT NULL,
  email_hash text NOT NULL,                      -- keyed hash of the address (TRACKER_SECRET)
  results_token text,                            -- the results link they applied from, if any
  account_id uuid,                               -- candidate account (added by the candidate accounts work); null for guests
  candidate_id uuid REFERENCES public.mms_candidates (id) ON DELETE SET NULL,
  application_id uuid REFERENCES public.mms_applications (id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.mms_jobs (id) ON DELETE SET NULL,
  employer_account_id uuid REFERENCES public.mms_employer_accounts (id) ON DELETE SET NULL,
  source text NOT NULL,                          -- mms (applied through us) | external (another job board)
  job_source text,                               -- board id: mms, reed, adzuna, teaching-vacancies, ...
  job_key text NOT NULL,                         -- one row per job per tracker
  job_title text NOT NULL,
  company text,
  job_location text,
  job_url text,
  salary text,
  field text,                                    -- family of work worked out from the job title
  soc_code text,
  applied_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'applied',        -- applied | no_response | interview | offer | placed | withdrawn
  status_at timestamptz,
  next_checkin_at timestamptz,                   -- null once both check-ins are sent, or they are stopped
  checkins_sent int NOT NULL DEFAULT 0,
  last_checkin_at timestamptz,
  checkins_stopped_at timestamptz,
  consent_at timestamptz NOT NULL DEFAULT now(),
  consent_text text NOT NULL,                    -- the notice shown when tracking started
  is_test boolean NOT NULL DEFAULT false,        -- example.com / resend.dev addresses
  delete_after timestamptz NOT NULL DEFAULT (now() + interval '12 months'),
  CONSTRAINT mms_tracked_applications_source_check CHECK (source IN ('mms', 'external')),
  CONSTRAINT mms_tracked_applications_status_check CHECK (status IN ('applied', 'no_response', 'interview', 'offer', 'placed', 'withdrawn')),
  CONSTRAINT mms_tracked_applications_checkins_check CHECK (checkins_sent BETWEEN 0 AND 2)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_tracked_token_job ON public.mms_tracked_applications (manage_token, job_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_tracked_application ON public.mms_tracked_applications (application_id) WHERE application_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_tracked_due ON public.mms_tracked_applications (next_checkin_at) WHERE next_checkin_at IS NOT NULL AND checkins_stopped_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mms_tracked_email ON public.mms_tracked_applications (lower(email));
CREATE INDEX IF NOT EXISTS idx_mms_tracked_account ON public.mms_tracked_applications (account_id) WHERE account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_tracked_delete_after ON public.mms_tracked_applications (delete_after);
CREATE INDEX IF NOT EXISTS idx_mms_tracked_created ON public.mms_tracked_applications (created_at);

-- -----------------------------------------------------------------------------
-- Placements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid REFERENCES public.mms_jobs (id) ON DELETE SET NULL,
  application_id uuid REFERENCES public.mms_applications (id) ON DELETE SET NULL,
  tracked_id uuid REFERENCES public.mms_tracked_applications (id) ON DELETE SET NULL,
  employer_account_id uuid REFERENCES public.mms_employer_accounts (id) ON DELETE SET NULL,
  candidate_email_hash text,
  candidate_id uuid REFERENCES public.mms_candidates (id) ON DELETE SET NULL,
  candidate_account_id uuid,
  candidate_email text,                          -- only to ask about case studies; cleared at email_purge_after
  job_title text,
  company text,
  job_location text,
  field text,
  soc_code text,
  source text NOT NULL,                          -- who recorded it first: employer | candidate | admin
  confirmed_by text NOT NULL,                    -- everyone who has confirmed it, e.g. "candidate, employer"
  employer_confirmed_at timestamptz,
  candidate_confirmed_at timestamptz,
  admin_confirmed_at timestamptz,
  started_on date,
  admin_note text,
  cancelled_at timestamptz,                      -- set when it turns out not to be a placement (for example hired by mistake)
  consent_token text,                            -- private link to the case-study consent page
  consent_requested_at timestamptz,              -- when we emailed the consent question
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  marketing_consent_text text,                   -- exact wording agreed to
  marketing_consent_answered_at timestamptz,     -- last yes or no
  marketing_consent_withdrawn_at timestamptz,
  is_test boolean NOT NULL DEFAULT false,
  email_purge_after timestamptz NOT NULL DEFAULT (now() + interval '12 months'),
  CONSTRAINT mms_placements_source_check CHECK (source IN ('employer', 'candidate', 'admin'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_placements_application ON public.mms_placements (application_id) WHERE application_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_placements_tracked ON public.mms_placements (tracked_id) WHERE tracked_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_placements_consent_token ON public.mms_placements (consent_token) WHERE consent_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_placements_created ON public.mms_placements (created_at);
CREATE INDEX IF NOT EXISTS idx_mms_placements_employer ON public.mms_placements (employer_account_id) WHERE employer_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_placements_consent_due ON public.mms_placements (created_at) WHERE consent_requested_at IS NULL AND cancelled_at IS NULL;

-- -----------------------------------------------------------------------------
-- Journey events (append-only; no names or email addresses)
--   kind: status (employer changed an application's status), stage (first time
--   an application reached applied / interview / offer / placed), tracked,
--   checkin_sent, checkin_answer, tracker_update, checkins_stopped, placement,
--   placement_cancelled, marketing_consent
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mms_journey_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  source text NOT NULL,                          -- employer | candidate | admin | system
  status text,                                   -- the new status, answer or stage
  stage_key text,                                -- kind 'stage' only: app:<id>, trk:<id> or plc:<id>
  channel text,                                  -- mms | external
  application_id uuid REFERENCES public.mms_applications (id) ON DELETE SET NULL,
  tracked_id uuid REFERENCES public.mms_tracked_applications (id) ON DELETE SET NULL,
  placement_id uuid REFERENCES public.mms_placements (id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.mms_jobs (id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.mms_employer_accounts (id) ON DELETE SET NULL,
  candidate_email_hash text,
  candidate_id uuid REFERENCES public.mms_candidates (id) ON DELETE SET NULL,
  candidate_account_id uuid,
  field text,
  is_test boolean NOT NULL DEFAULT false,
  detail jsonb,
  CONSTRAINT mms_journey_events_source_check CHECK (source IN ('employer', 'candidate', 'admin', 'system')),
  CONSTRAINT mms_journey_events_stage_check CHECK (kind <> 'stage' OR (stage_key IS NOT NULL AND status IN ('applied', 'interview', 'offer', 'placed'))),
  -- Other kinds have no stage_key, and NULLs never clash, so only stages are unique.
  CONSTRAINT mms_journey_events_stage_unique UNIQUE (stage_key, status)
);
CREATE INDEX IF NOT EXISTS idx_mms_journey_events_kind ON public.mms_journey_events (kind, created_at);
CREATE INDEX IF NOT EXISTS idx_mms_journey_events_created ON public.mms_journey_events (created_at);
CREATE INDEX IF NOT EXISTS idx_mms_journey_events_application ON public.mms_journey_events (application_id) WHERE application_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_journey_events_tracked ON public.mms_journey_events (tracked_id) WHERE tracked_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_journey_events_placement ON public.mms_journey_events (placement_id) WHERE placement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_journey_events_account ON public.mms_journey_events (account_id, created_at) WHERE account_id IS NOT NULL;

-- Applications made before this migration count as "applied" in the funnel.
INSERT INTO public.mms_journey_events (created_at, kind, source, status, stage_key, channel, application_id, job_id, account_id, is_test, detail)
SELECT a.created_at, 'stage', 'system', 'applied', 'app:' || a.id::text, 'mms', a.id, a.job_id, j.account_id,
       (a.email ILIKE '%@example.com' OR a.email ILIKE '%@resend.dev'), jsonb_build_object('backfilled', true)
  FROM public.mms_applications a
  LEFT JOIN public.mms_jobs j ON j.id = a.job_id
ON CONFLICT (stage_key, status) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Partner rates and the price actually billed
-- -----------------------------------------------------------------------------
ALTER TABLE public.mms_employer_accounts ADD COLUMN IF NOT EXISTS partner_plan text;
ALTER TABLE public.mms_employer_accounts ADD COLUMN IF NOT EXISTS partner_price_pence int;
ALTER TABLE public.mms_employer_accounts ADD COLUMN IF NOT EXISTS partner_set_at timestamptz;
ALTER TABLE public.mms_employer_accounts ADD COLUMN IF NOT EXISTS billed_price_pence int;

DO $partner$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mms_employer_accounts_partner_check') THEN
    ALTER TABLE public.mms_employer_accounts ADD CONSTRAINT mms_employer_accounts_partner_check CHECK (
      (partner_plan IS NULL AND partner_price_pence IS NULL)
      OR (partner_plan IN ('lite', 'starter', 'growth') AND partner_price_pence BETWEEN 100 AND 100000)
    );
  END IF;
END
$partner$;

-- -----------------------------------------------------------------------------
-- Admin funnel: counts per period, done in Postgres (never by tallying rows).
--   results, optins: all results links and switched-on profiles (only when no
--     field or employer filter is set: they belong to no job).
--   applied_mms, applied_external, interview, offer: kind 'stage' events, each
--     application counted once, the first time it reached the stage.
--   placed: placements that have not been cancelled.
-- p_bucket is 'day', 'week' or 'month' (checked by the caller).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mms_funnel_counts(
  p_from timestamptz,
  p_to timestamptz,
  p_bucket text DEFAULT 'week',
  p_field text DEFAULT NULL,
  p_employer uuid DEFAULT NULL,
  p_include_test boolean DEFAULT false
)
RETURNS TABLE (bucket timestamptz, metric text, n bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT date_trunc(p_bucket, r.created_at, 'Europe/London'), 'results'::text, count(*)::bigint
    FROM public.mms_reports r
   WHERE p_field IS NULL AND p_employer IS NULL
     AND r.created_at >= p_from AND r.created_at < p_to
     AND (p_include_test OR (coalesce(r.source, '') <> 'qa-test' AND coalesce(r.email, '') NOT ILIKE '%@example.com'))
   GROUP BY 1
  UNION ALL
  SELECT date_trunc(p_bucket, c.discoverable_consent_at, 'Europe/London'), 'optins'::text, count(*)::bigint
    FROM public.mms_candidates c
   WHERE p_field IS NULL AND p_employer IS NULL
     AND c.discoverable_consent_at >= p_from AND c.discoverable_consent_at < p_to
     AND (p_include_test OR (c.email NOT ILIKE '%@example.com' AND c.email NOT ILIKE '%@resend.dev'))
   GROUP BY 1
  UNION ALL
  SELECT date_trunc(p_bucket, e.created_at, 'Europe/London'),
         CASE WHEN e.status = 'applied' THEN 'applied_' || coalesce(e.channel, 'mms') ELSE e.status END,
         count(*)::bigint
    FROM public.mms_journey_events e
   WHERE e.kind = 'stage' AND e.status IN ('applied', 'interview', 'offer')
     AND e.created_at >= p_from AND e.created_at < p_to
     AND (p_field IS NULL OR e.field = p_field)
     AND (p_employer IS NULL OR e.account_id = p_employer)
     AND (p_include_test OR NOT e.is_test)
   GROUP BY 1, 2
  UNION ALL
  SELECT date_trunc(p_bucket, p.created_at, 'Europe/London'), 'placed'::text, count(*)::bigint
    FROM public.mms_placements p
   WHERE p.cancelled_at IS NULL
     AND p.created_at >= p_from AND p.created_at < p_to
     AND (p_field IS NULL OR p.field = p_field)
     AND (p_employer IS NULL OR p.employer_account_id = p_employer)
     AND (p_include_test OR NOT p.is_test)
   GROUP BY 1;
$fn$;

REVOKE ALL ON FUNCTION public.mms_funnel_counts(timestamptz, timestamptz, text, text, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mms_funnel_counts(timestamptz, timestamptz, text, text, uuid, boolean) TO service_role;

-- -----------------------------------------------------------------------------
-- Lock the new tables to the service role
-- -----------------------------------------------------------------------------
DO $lock$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mms_tracked_applications','mms_placements','mms_journey_events'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);
  END LOOP;
END
$lock$;

COMMIT;

-- PostgREST caches the schema; reload it so the new tables, columns and function are visible at once.
NOTIFY pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- Read-only checks to run afterwards:
--   SELECT relname, relrowsecurity, relacl FROM pg_class
--    WHERE relname IN ('mms_tracked_applications','mms_placements','mms_journey_events');
--     -> relrowsecurity true; relacl lists postgres and service_role only
--   SELECT count(*) FROM pg_policies WHERE tablename IN ('mms_tracked_applications','mms_placements','mms_journey_events');
--     -> 0
--   SELECT * FROM public.mms_funnel_counts(now() - interval '30 days', now(), 'week', NULL, NULL, true);
-- -----------------------------------------------------------------------------
