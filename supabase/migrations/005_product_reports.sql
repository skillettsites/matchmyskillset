-- =============================================================================
-- 005_product_reports.sql  (MatchMySkillset, written 2026-09-28, NOT YET APPLIED)
--
-- Runs on the SHARED Supabase project noxczmrnyyosgvvjlqca. Needs the owner's
-- approval before it is run. Safe to run more than once (ADD COLUMN IF NOT
-- EXISTS throughout). Touches only mms_purchases. No data is changed.
--
-- Adds the paid Career Change Report to its purchase row, so each purchase
-- holds the report it paid for and the report is written once:
--   occupation_id                 the curated occupation bought (target_soc
--                                 alone is ambiguous when two careers share a
--                                 SOC unit group)
--   report_status                 null | 'generating' | 'ready' | 'failed'
--   report_claimed_at             when generation was claimed (a claim older
--                                 than 4 minutes can be taken over)
--   report_content                the generated report (jsonb, v1)
--   report_generated_at, report_model, report_usage  (token counts and cost)
--   digital_content_consent_at, digital_content_consent_text
--                                 the buyer's consent to immediate supply of
--                                 digital content (Consumer Contracts
--                                 Regulations 2013), also kept in Stripe
--                                 session metadata
--
-- The app works before this is applied: it retries writes without these
-- columns and keeps generated reports inside mms_reports.matches under
-- "paid", keyed by Stripe session id. Nothing needs migrating afterwards:
-- reports stored the old way keep working.
--
-- mms_purchases already has RLS on, no policies and no anon/authenticated
-- privileges (004), so new columns inherit service-role-only access.
-- =============================================================================

BEGIN;

ALTER TABLE public.mms_purchases
  ADD COLUMN IF NOT EXISTS occupation_id text,
  ADD COLUMN IF NOT EXISTS report_status text,
  ADD COLUMN IF NOT EXISTS report_claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_content jsonb,
  ADD COLUMN IF NOT EXISTS report_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_model text,
  ADD COLUMN IF NOT EXISTS report_usage jsonb,
  ADD COLUMN IF NOT EXISTS digital_content_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS digital_content_consent_text text;

COMMENT ON COLUMN public.mms_purchases.report_content IS
  'Generated Career Change Report for this purchase (jsonb v1). Derived from skills and matches; contains no raw CV text.';
COMMENT ON COLUMN public.mms_purchases.digital_content_consent_text IS
  'Exact wording of the immediate-supply consent box the buyer ticked before checkout.';

COMMIT;

-- -----------------------------------------------------------------------------
-- Read-only check to run afterwards:
--   SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_schema = 'public' AND table_name = 'mms_purchases'
--     ORDER BY ordinal_position;
--   -> the nine columns above are listed
-- -----------------------------------------------------------------------------
