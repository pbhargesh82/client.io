-- Task fields: start date + priority (due_date remains the end date)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium'
    CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'));

-- Clients may upload files to their own active projects
CREATE POLICY files_client_insert ON files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    project_id IN (
      SELECT id FROM projects
      WHERE client_id = current_client_id() AND archived = false
    )
  );

CREATE POLICY storage_client_insert ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM projects
      WHERE client_id = current_client_id() AND archived = false
    )
  );
