-- Migration: Create projects table for PROJ-2 Project Management

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Owner-only: user can only access their own projects)

-- SELECT: User can read their own projects
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: User can create projects for themselves
CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: User can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: User can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Indexes
-- Index on user_id for fast per-user lookups
CREATE INDEX idx_projects_user_id ON projects(user_id);
-- Index on created_at for ordering
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- 5. Auto-update updated_at timestamp on row changes
-- Reuse the function created in the profiles migration if it exists,
-- otherwise create it.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
