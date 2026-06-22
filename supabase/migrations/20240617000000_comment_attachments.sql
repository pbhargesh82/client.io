-- Comment attachments: extend files + allow comments without text
ALTER TABLE comments ALTER COLUMN body DROP NOT NULL;

ALTER TABLE files
  ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS content_type TEXT;

CREATE INDEX IF NOT EXISTS idx_files_comment ON files(comment_id) WHERE comment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_files_project_deliverables
  ON files(project_id, created_at DESC)
  WHERE comment_id IS NULL;

-- Project-level client uploads only (not comment attachments)
DROP POLICY IF EXISTS files_client_insert ON files;
CREATE POLICY files_client_insert ON files FOR INSERT
  WITH CHECK (
    comment_id IS NULL
    AND uploaded_by = auth.uid()
    AND project_id IN (
      SELECT id FROM projects
      WHERE client_id = current_client_id() AND archived = false
    )
  );

-- Clients may read comment attachments on accessible tasks
CREATE POLICY files_client_select_comment ON files FOR SELECT USING (
  comment_id IS NOT NULL
  AND task_id IN (
    SELECT t.id FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE p.client_id = current_client_id() AND p.archived = false
  )
);
