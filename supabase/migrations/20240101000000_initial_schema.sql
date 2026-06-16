-- ClientSpace schema migration

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'In Progress', 'Review', 'Done')),
  start_date DATE,
  target_date DATE,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Done')),
  due_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_active ON clients(active);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_archived ON projects(archived);
CREATE INDEX idx_tasks_project_sort ON tasks(project_id, sort_order);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_comments_task_created ON comments(task_id, created_at);
CREATE INDEX idx_files_project_created ON files(project_id, created_at);

-- Updated_at trigger for tasks
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get client_id for current user
CREATE OR REPLACE FUNCTION current_client_id()
RETURNS UUID AS $$
  SELECT id FROM clients WHERE user_id = auth.uid() AND active = true LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select ON users FOR SELECT USING (
  is_admin() OR id = auth.uid()
);

-- Clients policies
CREATE POLICY clients_admin_all ON clients FOR ALL USING (is_admin());
CREATE POLICY clients_select_own ON clients FOR SELECT USING (user_id = auth.uid());

-- Projects policies
CREATE POLICY projects_admin_all ON projects FOR ALL USING (is_admin());
CREATE POLICY projects_client_select ON projects FOR SELECT USING (
  client_id = current_client_id() AND archived = false
);

-- Tasks policies
CREATE POLICY tasks_admin_all ON tasks FOR ALL USING (is_admin());
CREATE POLICY tasks_client_select ON tasks FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE client_id = current_client_id() AND archived = false)
);

-- Comments policies
CREATE POLICY comments_admin_all ON comments FOR ALL USING (is_admin());
CREATE POLICY comments_client_select ON comments FOR SELECT USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE p.client_id = current_client_id() AND p.archived = false
  )
);
CREATE POLICY comments_client_insert ON comments FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE p.client_id = current_client_id() AND p.archived = false
  )
);

-- Files policies
CREATE POLICY files_admin_all ON files FOR ALL USING (is_admin());
CREATE POLICY files_client_select ON files FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE client_id = current_client_id() AND archived = false)
);

-- Storage bucket (run via supabase storage API or dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY storage_admin_all ON storage.objects FOR ALL USING (
  bucket_id = 'project-files' AND is_admin()
);

CREATE POLICY storage_client_select ON storage.objects FOR SELECT USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM projects WHERE client_id = current_client_id() AND archived = false
  )
);
