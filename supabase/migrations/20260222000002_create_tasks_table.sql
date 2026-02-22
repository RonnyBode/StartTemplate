-- Migration: Create tasks table for PROJ-3 Task Management

-- 1. Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 1000),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Owner-only: user can only access tasks in their own projects)

-- SELECT: User can read tasks in their own projects
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: User can create tasks in their own projects
CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: User can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: User can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Indexes
-- Index on project_id for fast per-project lookups
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
-- Index on user_id for fast per-user lookups
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
-- Index on status for filtering
CREATE INDEX idx_tasks_status ON tasks(status);
-- Index on created_at for ordering
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
-- Index on due_date for deadline queries
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- 5. Auto-update updated_at timestamp on row changes
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
