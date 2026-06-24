import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload } from '@/lib/api';
import type { ProjectDetail, ProjectFile } from '@clientspace/shared';
import { useAuth } from '@/hooks/useAuth';
import { getFirstName, getTimeGreeting } from '@/lib/greeting';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { FormAlert } from '@/components/app/query-error';
import { ProjectFilesPanel } from '@/components/app/project-files-panel';
import {
  ProjectJumpNav,
  ProjectSectionTitle,
  ProjectWorkspace,
} from '@/components/app/project-workspace';
import { ClientTaskTable } from '@/components/app/task-row';
import { TaskCommentsSheet } from '@/components/app/task-sheets';

export default function ClientProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { name } = useAuth();
  const firstName = getFirstName(name);
  const queryClient = useQueryClient();
  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['client', 'projects', id],
    queryFn: () => api<ProjectDetail>(`/client/projects/${id}`),
    enabled: !!id,
  });

  const sheetTask = useMemo(
    () => project?.tasks?.find((t) => t.id === sheetTaskId) ?? null,
    [project?.tasks, sheetTaskId]
  );

  const uploadFile = useMutation({
    mutationFn: (file: File) => apiUpload<ProjectFile>(`/projects/${id}/files`, file),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['client', 'projects', id] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Upload failed'),
  });

  if (isLoading) return <PageSkeleton rows={6} />;
  if (!project) return <EmptyState message="Project not found" />;

  const tasks = project.tasks ?? [];
  const files = project.files ?? [];

  return (
    <div className="page-stack">
      <section>
        <h1 className="mb-unit font-display text-display text-on-surface">
          {firstName ? `${getTimeGreeting()}, ${firstName}.` : getTimeGreeting()}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Here's your project status for {project.title}.
        </p>
      </section>

      {error && <FormAlert message={error} />}

      <ProjectJumpNav taskCount={tasks.length} fileCount={files.length} />

      <ProjectWorkspace
        tasks={
          <section aria-labelledby="client-project-tasks-heading">
            <ProjectSectionTitle
              id="client-project-tasks-heading"
              icon="task"
              title="Tasks"
              count={tasks.length}
            />

            {!tasks.length ? (
              <EmptyState icon="task" message="No tasks yet." className="py-8" />
            ) : (
              <ClientTaskTable
                tasks={tasks}
                activeTaskId={sheetTaskId}
                onTaskClick={(taskId) => setSheetTaskId(taskId)}
              />
            )}
          </section>
        }
        files={
          <section aria-labelledby="client-project-files-heading">
            <ProjectSectionTitle
              id="client-project-files-heading"
              icon="attach_file"
              title="Files"
              count={files.length}
              className="hidden lg:flex"
            />
            <ProjectFilesPanel
              files={files}
              canUpload
              uploading={uploadFile.isPending}
              uploadError={
                uploadFile.isError
                  ? uploadFile.error instanceof Error
                    ? uploadFile.error.message
                    : 'Upload failed'
                  : null
              }
              onUpload={(f) => uploadFile.mutateAsync(f)}
              description="Official project deliverables and documents."
              uploadLabel="Upload a file"
              variant="deliverables"
            />
          </section>
        }
      />

      <TaskCommentsSheet
        task={sheetTask}
        open={!!sheetTaskId}
        onOpenChange={(open) => !open && setSheetTaskId(null)}
      />
    </div>
  );
}
