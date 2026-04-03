-- MatchMySkillset Database Schema
-- All tables prefixed with mms_ to avoid conflicts with other projects

-- Profiles (extends auth.users)
CREATE TABLE mms_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  cv_text text,
  preferences jsonb DEFAULT '{}',
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  visible_to_employers boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mms_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mms_profiles_select_own" ON mms_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "mms_profiles_update_own" ON mms_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "mms_profiles_admin_select" ON mms_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mms_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create mms_profile on signup
CREATE OR REPLACE FUNCTION handle_mms_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO mms_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_mms
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_mms_new_user();

-- Skill Assessments
CREATE TABLE mms_skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  input_hash text NOT NULL,
  input_text text,
  extracted_skills jsonb NOT NULL DEFAULT '[]',
  career_matches jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mms_assessments_hash ON mms_skill_assessments(input_hash);
CREATE INDEX idx_mms_assessments_user ON mms_skill_assessments(user_id);
CREATE INDEX idx_mms_assessments_email ON mms_skill_assessments(email);

ALTER TABLE mms_skill_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mms_assessments_insert" ON mms_skill_assessments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "mms_assessments_select_own" ON mms_skill_assessments
  FOR SELECT USING (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "mms_assessments_admin_select" ON mms_skill_assessments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mms_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Employers (Fred's network)
CREATE TABLE mms_employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text,
  contact_name text,
  industry text,
  size text,
  notes text,
  website text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mms_employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mms_employers_admin" ON mms_employers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM mms_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Featured Jobs
CREATE TABLE mms_featured_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text DEFAULT 'UK',
  salary_min integer,
  salary_max integer,
  description text,
  required_skills jsonb DEFAULT '[]',
  application_url text,
  application_email text,
  employer_id uuid REFERENCES mms_employers(id) ON DELETE SET NULL,
  is_hidden boolean DEFAULT false,
  is_active boolean DEFAULT true,
  featured_until timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mms_featured_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mms_featured_jobs_select" ON mms_featured_jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "mms_featured_jobs_admin" ON mms_featured_jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM mms_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Job Clicks (CPC tracking)
CREATE TABLE mms_job_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  job_external_id text,
  job_title text,
  job_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_page text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mms_clicks_source ON mms_job_clicks(source);
CREATE INDEX idx_mms_clicks_created ON mms_job_clicks(created_at);

ALTER TABLE mms_job_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mms_clicks_insert" ON mms_job_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "mms_clicks_admin_select" ON mms_job_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mms_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Search Logs
CREATE TABLE mms_search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type text NOT NULL,
  query_text text,
  results_count integer,
  email text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mms_search_logs_type ON mms_search_logs(search_type);
CREATE INDEX idx_mms_search_logs_created ON mms_search_logs(created_at);

ALTER TABLE mms_search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mms_logs_insert" ON mms_search_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "mms_logs_admin_select" ON mms_search_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mms_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Email Leads (from assessments)
CREATE TABLE mms_email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  assessment_id uuid REFERENCES mms_skill_assessments(id),
  top_match text,
  match_percentage integer,
  skills_count integer,
  source text DEFAULT 'discover',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_mms_email_leads_unique ON mms_email_leads(email);
CREATE INDEX idx_mms_email_leads_created ON mms_email_leads(created_at);

ALTER TABLE mms_email_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mms_leads_insert" ON mms_email_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "mms_leads_admin_select" ON mms_email_leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mms_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION mms_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mms_profiles_updated_at
  BEFORE UPDATE ON mms_profiles
  FOR EACH ROW EXECUTE FUNCTION mms_update_updated_at();

CREATE TRIGGER mms_featured_jobs_updated_at
  BEFORE UPDATE ON mms_featured_jobs
  FOR EACH ROW EXECUTE FUNCTION mms_update_updated_at();
