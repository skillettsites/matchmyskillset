-- =============================================================================
-- 007_employer_extras.sql  (MatchMySkillset v3 employer side, 28 Sep 2026)
--
-- NOT APPLIED YET. Small additions the employer side needs on top of 006:
--   * company pages (/companies/[slug]): a unique slug and the page text
--   * the reason given when a job is sent back, shown in the employer dashboard
--   * an atomic job view counter for the public job page
-- The code works before this is applied (company pages say they are not ready,
-- the rejection reason is only emailed, views use read-then-write), and uses
-- these as soon as they exist. Safe to run more than once.
-- =============================================================================
BEGIN;

ALTER TABLE public.mms_employer_accounts ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.mms_employer_accounts ADD COLUMN IF NOT EXISTS company_description text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_employer_accounts_slug
  ON public.mms_employer_accounts (slug) WHERE slug IS NOT NULL;

ALTER TABLE public.mms_jobs ADD COLUMN IF NOT EXISTS review_note text;

-- One view of a live job, counted atomically.
CREATE OR REPLACE FUNCTION public.mms_job_view(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.mms_jobs SET views = views + 1 WHERE id = p_id AND status = 'live';
$$;
REVOKE ALL ON FUNCTION public.mms_job_view(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mms_job_view(uuid) TO service_role;

COMMIT;

-- PostgREST caches the schema; reload it so the new columns and function are visible at once.
NOTIFY pgrst, 'reload schema';
