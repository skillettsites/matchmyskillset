-- =============================================================================
-- 011_job_listings.sql  (MatchMySkillset job pages, 29 Sep 2026)
--
-- mms_job_listings: the adverts from other boards that we have shown to
-- someone (a job search or a results page), so a job page (/jobs/<id>) can be
-- opened from its id alone. One row per advert, keyed by the listing id
-- ("reed_57381080", "adzuna_5859525919"...). `listing` is what the job page
-- shows: title, employer, place, pay, dates, the advert text the board gave us
-- (as plain blocks, no HTML) and the link to the original. No CV data and
-- nothing about who saw it.
--
-- Rows not seen for 14 days are deleted by the daily job alerts cron. Reed and
-- GOV.UK Teaching Vacancies adverts are also read live by id, so their pages
-- work without a row.
--
-- Service role only, like every mms_ table. Safe to run more than once.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.mms_job_listings (
  id text PRIMARY KEY,
  source text NOT NULL,
  listing jsonb NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mms_job_listings_seen ON public.mms_job_listings (last_seen_at);

ALTER TABLE public.mms_job_listings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.mms_job_listings FROM anon, authenticated;
GRANT ALL ON TABLE public.mms_job_listings TO service_role;
