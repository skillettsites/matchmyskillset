-- Add CV text and skills summary to email leads so Fred can browse candidates
-- Run this in Supabase SQL Editor

ALTER TABLE mms_email_leads ADD COLUMN IF NOT EXISTS cv_text text;
ALTER TABLE mms_email_leads ADD COLUMN IF NOT EXISTS skills_summary text;
ALTER TABLE mms_email_leads ADD COLUMN IF NOT EXISTS top_5_matches jsonb DEFAULT '[]';
ALTER TABLE mms_email_leads ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Also increase input_text limit on assessments (remove any truncation at DB level)
-- The column is already text type (unlimited), so no change needed there.

-- Add trigger for updated_at on leads
CREATE TRIGGER mms_email_leads_updated_at
  BEFORE UPDATE ON mms_email_leads
  FOR EACH ROW EXECUTE FUNCTION mms_update_updated_at();
