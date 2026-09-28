-- =============================================================================
-- MatchMySkillset: live state BEFORE migrations 003 and 004
-- Captured 2026-09-28 from the shared Supabase project noxczmrnyyosgvvjlqca
-- (PostgreSQL 17.6, region eu-west-1) using read-only catalogue SELECTs:
--   pg_trigger + pg_get_triggerdef, pg_proc + pg_get_functiondef,
--   pg_policies, pg_class.relacl, pg_depend.
--
-- PURPOSE: restore the pre-revamp trigger, function, RLS policies and grants
-- if 003_revamp_cleanup.sql has to be undone. Running this file RE-OPENS the
-- problems 003 fixes (the trigger fires on every sign-up across every site,
-- anon can read mms_employers / mms_featured_jobs and can insert into
-- mms_email_leads / mms_job_clicks / mms_search_logs). Only run it on purpose.
--
-- It does not touch 004. To undo 004 the new tables would have to be dropped,
-- which must never be done without the owner's explicit approval.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Function public.handle_mms_new_user()
--    Live: owner postgres, SECURITY DEFINER, no SET search_path,
--    ACL {=X/postgres,postgres=X/postgres,anon=X/postgres,
--         authenticated=X/postgres,service_role=X/postgres}
--    Only dependent object (pg_depend): trigger on_auth_user_created_mms.
--    Body below is pg_get_functiondef output, unchanged.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_mms_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    BEGIN
      INSERT INTO mms_profiles (id, email, full_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
      )
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_mms_new_user failed for %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
  END;
  $function$;

ALTER FUNCTION public.handle_mms_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_mms_new_user() TO PUBLIC, anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. Trigger on the SHARED auth.users table
--    Live (pg_get_triggerdef), enabled (tgenabled = 'O'):
--    CREATE TRIGGER on_auth_user_created_mms AFTER INSERT ON auth.users
--      FOR EACH ROW EXECUTE FUNCTION handle_mms_new_user()
--    auth.users is owned by supabase_auth_admin and postgres is not a member,
--    so this CREATE may need the Supabase dashboard or support if refused.
--    The other two triggers on auth.users (on_auth_user_created ->
--    handle_new_user, on_auth_user_created_notify -> notify_new_signup) belong
--    to other sites and are never touched by MMS migrations.
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created_mms ON auth.users;
CREATE TRIGGER on_auth_user_created_mms
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_mms_new_user();

-- -----------------------------------------------------------------------------
-- 3. Row level security: enabled (not forced) on all seven mms_* tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.mms_email_leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_employers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_featured_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_job_clicks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_search_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mms_skill_assessments ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. RLS policies (pg_policies, all PERMISSIVE). Twelve in total.
-- -----------------------------------------------------------------------------
-- mms_email_leads
DROP POLICY IF EXISTS anon_insert ON public.mms_email_leads;
CREATE POLICY anon_insert ON public.mms_email_leads
  AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS service_role_all ON public.mms_email_leads;
CREATE POLICY service_role_all ON public.mms_email_leads
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mms_employers
DROP POLICY IF EXISTS anon_select ON public.mms_employers;
CREATE POLICY anon_select ON public.mms_employers
  AS PERMISSIVE FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS service_role_all ON public.mms_employers;
CREATE POLICY service_role_all ON public.mms_employers
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mms_featured_jobs
DROP POLICY IF EXISTS anon_select ON public.mms_featured_jobs;
CREATE POLICY anon_select ON public.mms_featured_jobs
  AS PERMISSIVE FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS service_role_all ON public.mms_featured_jobs;
CREATE POLICY service_role_all ON public.mms_featured_jobs
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mms_job_clicks
DROP POLICY IF EXISTS anon_insert ON public.mms_job_clicks;
CREATE POLICY anon_insert ON public.mms_job_clicks
  AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS service_role_all ON public.mms_job_clicks;
CREATE POLICY service_role_all ON public.mms_job_clicks
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mms_profiles
DROP POLICY IF EXISTS service_role_all ON public.mms_profiles;
CREATE POLICY service_role_all ON public.mms_profiles
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mms_search_logs
DROP POLICY IF EXISTS anon_insert ON public.mms_search_logs;
CREATE POLICY anon_insert ON public.mms_search_logs
  AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS service_role_all ON public.mms_search_logs;
CREATE POLICY service_role_all ON public.mms_search_logs
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mms_skill_assessments
DROP POLICY IF EXISTS service_role_all ON public.mms_skill_assessments;
CREATE POLICY service_role_all ON public.mms_skill_assessments
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 5. Table grants. Every mms_* table had the Supabase default ACL:
--    {postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,
--     authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres}
--    (arwdDxtm = INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES,
--     TRIGGER, MAINTAIN, which is ALL on PostgreSQL 17).
--    No column-level grants beyond those implied by the table grants.
--    No sequences belong to mms_* tables (all ids are uuid).
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.mms_email_leads       TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mms_employers         TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mms_featured_jobs     TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mms_job_clicks        TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mms_profiles          TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mms_search_logs       TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.mms_skill_assessments TO anon, authenticated, service_role;

COMMIT;

-- -----------------------------------------------------------------------------
-- Reference only (unchanged by 003/004, recorded so the picture is complete):
--   public.mms_update_updated_at() trigger function, used by
--     mms_profiles_updated_at (BEFORE UPDATE ON mms_profiles) and
--     mms_featured_jobs_updated_at (BEFORE UPDATE ON mms_featured_jobs).
--   There is NO mms_email_leads_updated_at trigger live, although
--     002_add_cv_to_leads.sql tries to create one.
--   Row counts on 2026-09-28: mms_skill_assessments 3, mms_email_leads 3,
--     mms_search_logs 3, mms_job_clicks 0, mms_profiles 0, mms_employers 0,
--     mms_featured_jobs 0.
--   CommandCenter reads mms_profiles and mms_email_leads with its service-role
--     key (commandcenter/src/lib/signup-attribution.ts,
--     commandcenter/src/app/api/signups/route.ts).
-- -----------------------------------------------------------------------------
