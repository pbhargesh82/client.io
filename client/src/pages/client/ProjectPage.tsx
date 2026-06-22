import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ListTodo, Paperclip } from 'lucide-react';
import { api, apiUpload } from '@/lib/api';
import type { ProjectDetail, ProjectFile } from '@clientspace/shared';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { FormAlert } from '@/components/app/query-error';
import { ProjectFilesPanel } from '@/components/app/project-files-panel';
import {
  ProjectJumpNav,
  ProjectSectionTitle,
  ProjectWorkspace,
} from '@/components/app/project-workspace';
import { TaskList, TaskRowClient } from '@/components/app/task-row';
import { TaskCommentsSheet, TaskDetailSheet } from '@/components/app/task-sheets';
import { ButtonLink } from '@/components/ui/button-link';

type SheetMode = 'details' | 'comments' | null;

export default function ClientProjectPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
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

  const openSheet = (taskId: string, mode: Exclude<SheetMode, null>) => {
    setSheetTaskId(taskId);
    setSheetMode(mode);
  };

  const closeSheet = () => {
    setSheetTaskId(null);
    setSheetMode(null);
  };

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

  const taskCount = project.tasks?.length ?? 0;
  const fileCount = project.files?.length ?? 0;

  return (
    <div className="page-stack">
      <PageHeader title={project.title}>
        <ButtonLink variant="outline" to="/client/dashboard">
          <ArrowLeft className="size-4" /> Back
        </ButtonLink>
      </PageHeader>

      {error && <FormAlert message={error} />}

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={project.status} />
        {project.target_date && (
          <span className="text-[13px] text-muted-foreground">
            Target {new Date(project.target_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {project.description && (
        <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      )}

      <ProjectJumpNav taskCount={taskCount} fileCount={fileCount} />

      <ProjectWorkspace
        tasks={
          <section aria-labelledby="client-project-tasks-heading">
            <ProjectSectionTitle
              id="client-project-tasks-heading"
              icon={ListTodo}
              title="Tasks"
              count={taskCount}
            />

            {!project.tasks?.length ? (
              <EmptyState icon={ListTodo} message="No tasks yet." className="py-8" />
            ) : (
              <TaskList variant="client">
                {project.tasks.map((task) => (
                  <TaskRowClient
                    key={task.id}
                    task={task}
                    active={sheetTaskId === task.id}
                    onView={() => openSheet(task.id, 'details')}
                    onComments={() => openSheet(task.id, 'comments')}
                  />
                ))}
              </TaskList>
            )}
          </section>
        }
        files={
          <section aria-labelledby="client-project-files-heading">
            <ProjectSectionTitle
              id="client-project-files-heading"
              icon={Paperclip}
              title="Files"
              count={fileCount}
              className="hidden lg:flex"
            />
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight lg:hidden">
              <Paperclip className="size-4 text-muted-foreground" aria-hidden />
              Files
              <span className="font-normal text-muted-foreground">({fileCount})</span>
            </h2>
            <ProjectFilesPanel
              files={project.files ?? []}
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
            />
          </section>
        }
      />

      <TaskDetailSheet
        task={sheetTask}
        open={sheetMode === 'details'}
        onOpenChange={(open) => !open && closeSheet()}
        onOpenComments={() => {
          if (sheetTask) openSheet(sheetTask.id, 'comments');
        }}
      />

      <TaskCommentsSheet
        task={sheetTask}
        open={sheetMode === 'comments'}
        onOpenChange={(open) => !open && closeSheet()}
      />
    </div>
  );
}
