-- =============================================================================
-- 003_revamp_cleanup.sql  (MatchMySkillset, written 2026-09-28, NOT YET APPLIED)
--
-- Runs on the SHARED Supabase project noxczmrnyyosgvvjlqca. Needs the owner's
-- approval before it is run. Safe to run more than once.
-- Undo: supabase/rollback/2026-09-28-before.sql
--
-- What it does:
--   1. Removes the MMS trigger on the shared auth.users table and its function.
--      It fires on every sign-up for every site on this project and has failed
--      silently every time (0 rows in mms_profiles after 492 sign-ups), and if
--      it ever worked it would copy other sites' users into MMS.
--   2. Drops the anon policies that let anyone with the public anon key read
--      mms_employers / mms_featured_jobs and write to mms_email_leads /
--      mms_job_clicks / mms_search_logs. Also drops, if present, the
--      anon-reachable policies from 001_initial_schema.sql (never live, but
--      its select-own policy would expose every stored CV if 001 were re-run).
--   3. Revokes table privileges from anon and authenticated on every mms_*
--      table. MMS only touches its tables from server routes with the
--      service-role key, which keeps its own grants and service_role_all
--      policies. CommandCenter also reads mms_profiles and mms_email_leads with
--      a service-role key, so it is unaffected.
--   4. Makes sure RLS stays enabled on every mms_* table.
--
-- Checked before writing (2026-09-28): no browser code in the MMS repo inserts
-- or selects with the anon key. Every .from() call is in a server route using
-- createAdminClient() (service role). The browser Supabase client was only
-- ever used for auth, which the revamp removes.
--
-- Not done here (owner decision): what to do with the 3 stored CV texts in
-- mms_skill_assessments.input_text and mms_email_leads.cv_text. See
-- supabase/README.md.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Trigger on_auth_user_created_mms (auth.users) and handle_mms_new_user()
--
-- auth.users is owned by supabase_auth_admin and postgres is not a member of
-- that role, so a plain DROP TRIGGER may be refused ("must be owner of table
-- users"). The block therefore:
--   a) aborts if anything other than this one trigger depends on the function;
--   b) tries DROP TRIGGER;
--   c) drops the function with CASCADE, which also removes the trigger if (b)
--      was refused. (a) guarantees the cascade can only reach that trigger;
--   d) if even that is refused, replaces the function body with a no-op so
--      the trigger stops doing anything, and raises a WARNING saying so.
-- The final check aborts the whole migration if the trigger still calls the
-- old insert.
-- -----------------------------------------------------------------------------
DO $mig$
DECLARE
  fn oid := to_regprocedure('public.handle_mms_new_user()');
  unexpected int;
BEGIN
  IF fn IS NULL THEN
    RAISE NOTICE 'handle_mms_new_user() does not exist; nothing to remove';
    RETURN;
  END IF;

  SELECT count(*) INTO unexpected
  FROM pg_depend d
  LEFT JOIN pg_trigger t
    ON d.classid = 'pg_trigger'::regclass AND t.oid = d.objid
  WHERE d.refclassid = 'pg_proc'::regclass
    AND d.refobjid = fn
    AND NOT (
      d.classid = 'pg_trigger'::regclass
      AND t.tgname = 'on_auth_user_created_mms'
      AND t.tgrelid = 'auth.users'::regclass
    );

  IF unexpected > 0 THEN
    RAISE EXCEPTION 'handle_mms_new_user() has % unexpected dependent object(s); aborting so nothing else is dropped', unexpected;
  END IF;

  BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created_mms ON auth.users;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not the owner of auth.users; the trigger will be removed by DROP FUNCTION ... CASCADE instead';
  END;

  BEGIN
    DROP FUNCTION public.handle_mms_new_user() CASCADE;
  EXCEPTION WHEN insufficient_privilege THEN
    CREATE OR REPLACE FUNCTION public.handle_mms_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY INVOKER
      SET search_path = ''
    AS $fn$
    BEGIN
      -- Neutralised by 003_revamp_cleanup.sql: MatchMySkillset has no accounts.
      RETURN NEW;
    END;
    $fn$;
    REVOKE EXECUTE ON FUNCTION public.handle_mms_new_user() FROM PUBLIC, anon, authenticated;
    RAISE WARNING 'Could not drop handle_mms_new_user(); it is now a no-op. Remove trigger on_auth_user_created_mms from auth.users in the Supabase dashboard or via support.';
  END;
END
$mig$;

DO $check$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE t.tgrelid = 'auth.users'::regclass
      AND t.tgname = 'on_auth_user_created_mms'
      AND position('mms_profiles' IN pg_get_functiondef(p.oid)) > 0
  ) THEN
    RAISE EXCEPTION 'on_auth_user_created_mms still inserts into mms_profiles; migration rolled back';
  END IF;
END
$check$;

-- -----------------------------------------------------------------------------
-- 2. Anon policies (live names first, then the 001 names in case 001 was ever
--    re-run). Policies named service_role_all are kept.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS anon_select ON public.mms_employers;
DROP POLICY IF EXISTS anon_select ON public.mms_featured_jobs;
DROP POLICY IF EXISTS anon_insert ON public.mms_email_leads;
DROP POLICY IF EXISTS anon_insert ON public.mms_job_clicks;
DROP POLICY IF EXISTS anon_insert ON public.mms_search_logs;

DROP POLICY IF EXISTS mms_assessments_insert     ON public.mms_skill_assessments;
DROP POLICY IF EXISTS mms_assessments_select_own ON public.mms_skill_assessments;
DROP POLICY IF EXISTS mms_featured_jobs_select   ON public.mms_featured_jobs;
DROP POLICY IF EXISTS mms_clicks_insert          ON public.mms_job_clicks;
DROP POLICY IF EXISTS mms_logs_insert            ON public.mms_search_logs;
DROP POLICY IF EXISTS mms_leads_insert           ON public.mms_email_leads;

-- -----------------------------------------------------------------------------
-- 3. Table privileges: service role only
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.mms_email_leads       FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_employers         FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_featured_jobs     FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_job_clicks        FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_profiles          FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_search_logs       FROM anon, authenticated;
REVOKE ALL ON TABLE public.mms_skill_assessments FROM anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. RLS stays on for every mms_* table
-- -----------------------------------------------------------------------------
ALTER TABLE public.mms_email_leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_employers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_featured_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_job_clicks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_search_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_skill_assessments ENABLE ROW LEVEL SECURITY;

COMMIT;

-- -----------------------------------------------------------------------------
-- Read-only checks to run afterwards (each should return what is noted):
--   SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
--     -> on_auth_user_created, on_auth_user_created_notify (no _mms)
--   SELECT tablename, policyname, roles FROM pg_policies
--     WHERE tablename LIKE 'mms\_%' ORDER BY 1, 2;
--     -> only service_role_all rows
--   SELECT relname, relrowsecurity, relacl FROM pg_class
--     WHERE relname LIKE 'mms\_%' AND relkind = 'r';
--     -> relrowsecurity true, no anon= or authenticated= entries
-- -----------------------------------------------------------------------------
