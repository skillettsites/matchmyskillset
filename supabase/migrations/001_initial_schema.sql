-- MatchMySkillset Database Schema
-- Run this in the Supabase SQL Editor after creating the project

-- Profiles (extends auth.users)
CREATE TABLE profiles (
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Skill Assessments
CREATE TABLE skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  input_hash text NOT NULL,
  input_text text,
  extracted_skills jsonb NOT NULL DEFAULT '[]',
  career_matches jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_assessments_hash ON skill_assessments(input_hash);
CREATE INDEX idx_assessments_user ON skill_assessments(user_id);
CREATE INDEX idx_assessments_email ON skill_assessments(email);

ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert assessments" ON skill_assessments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own assessments" ON skill_assessments
  FOR SELECT USING (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Admins can view all assessments" ON skill_assessments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Employers (Fred's network) - created before featured_jobs due to FK reference
CREATE TABLE employers (
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

ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage employers" ON employers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Featured Jobs
CREATE TABLE featured_jobs (
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
  employer_id uuid REFERENCES employers(id) ON DELETE SET NULL,
  is_hidden boolean DEFAULT false,
  is_active boolean DEFAULT true,
  featured_until timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE featured_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured jobs" ON featured_jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage featured jobs" ON featured_jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Job Clicks (CPC tracking)
CREATE TABLE job_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  job_external_id text,
  job_title text,
  job_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_page text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clicks_source ON job_clicks(source);
CREATE INDEX idx_clicks_created ON job_clicks(created_at);

ALTER TABLE job_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert clicks" ON job_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view clicks" ON job_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Search Logs
CREATE TABLE search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type text NOT NULL, -- 'assessment', 'job_search', 'page_view'
  query_text text,
  results_count integer,
  email text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_search_logs_type ON search_logs(search_type);
CREATE INDEX idx_search_logs_created ON search_logs(created_at);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert logs" ON search_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view logs" ON search_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Email Leads (from assessments)
CREATE TABLE email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  assessment_id uuid REFERENCES skill_assessments(id),
  top_match text,
  match_percentage integer,
  skills_count integer,
  source text DEFAULT 'discover',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_email_leads_unique ON email_leads(email);
CREATE INDEX idx_email_leads_created ON email_leads(created_at);

ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" ON email_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view leads" ON email_leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER featured_jobs_updated_at
  BEFORE UPDATE ON featured_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
