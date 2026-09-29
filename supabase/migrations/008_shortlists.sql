-- =============================================================================
-- 008_shortlists.sql  (MatchMySkillset recruiter shortlists, 29 Sep 2026)
--
-- NOT APPLIED YET. Growth and Enterprise employers get a top-candidate
-- shortlist for each live job, picked by our recruiters in /recruiter:
--   * mms_shortlists: one request per job (requested -> in_progress -> sent,
--     or cancelled), with the recruiter's name and an overall summary.
--   * mms_shortlist_items: the picks, in order, each either an application to
--     that job or an opted-in candidate, with the recruiter's note.
--   * mms_jobs.shortlist_wanted: the "Send me a recruiter shortlist" box on the
--     job form. The request itself is created when the job goes live.
--
-- Items are deleted with the application or candidate they point at (ON
-- DELETE CASCADE), so deleting a profile or an application (the candidate's
-- own delete link, or the 12-month retention job) also removes them from any
-- shortlist and removes the recruiter's note about them. ON DELETE SET NULL
-- would clash with the "exactly one of the two" check and block those deletes.
--
-- Runs on the SHARED Supabase project: mms_ prefix, RLS on, service role only
-- (no anon or authenticated grants). The code works before this is applied:
-- the shortlist parts say they are not switched on yet. Safe to run more than
-- once.
-- =============================================================================
BEGIN;

ALTER TABLE public.mms_jobs ADD COLUMN IF NOT EXISTS shortlist_wanted boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.mms_shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES public.mms_jobs (id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.mms_employer_accounts (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'requested',      -- requested | in_progress | sent | cancelled
  requested_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  sent_at timestamptz,
  recruiter_name text,
  summary text,
  CONSTRAINT mms_shortlists_job_unique UNIQUE (job_id),
  CONSTRAINT mms_shortlists_status_check CHECK (status IN ('requested', 'in_progress', 'sent', 'cancelled'))
);
CREATE INDEX IF NOT EXISTS idx_mms_shortlists_queue ON public.mms_shortlists (status, requested_at);
CREATE INDEX IF NOT EXISTS idx_mms_shortlists_account ON public.mms_shortlists (account_id);

CREATE TABLE IF NOT EXISTS public.mms_shortlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  shortlist_id uuid NOT NULL REFERENCES public.mms_shortlists (id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.mms_applications (id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES public.mms_candidates (id) ON DELETE CASCADE,
  rank int NOT NULL,
  recruiter_note text,
  CONSTRAINT mms_shortlist_items_one_person CHECK (num_nonnulls(application_id, candidate_id) = 1)
);
CREATE INDEX IF NOT EXISTS idx_mms_shortlist_items_shortlist ON public.mms_shortlist_items (shortlist_id, rank);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_shortlist_items_application
  ON public.mms_shortlist_items (shortlist_id, application_id) WHERE application_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mms_shortlist_items_candidate
  ON public.mms_shortlist_items (shortlist_id, candidate_id) WHERE candidate_id IS NOT NULL;
-- The cascades above look rows up by these columns.
CREATE INDEX IF NOT EXISTS idx_mms_shortlist_items_application_fk ON public.mms_shortlist_items (application_id) WHERE application_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mms_shortlist_items_candidate_fk ON public.mms_shortlist_items (candidate_id) WHERE candidate_id IS NOT NULL;

-- Lock both tables to the service role
DO $lock$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mms_shortlists','mms_shortlist_items'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', t);
  END LOOP;
END
$lock$;

COMMIT;

-- PostgREST caches the schema; reload it so the new tables and column are visible at once.
NOTIFY pgrst, 'reload schema';
