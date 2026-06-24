import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload } from '@/lib/api';
import type { ProjectDetail, Task, ProjectFile } from '@clientspace/shared';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { FormAlert } from '@/components/app/query-error';
import { ProjectFilesPanel } from '@/components/app/project-files-panel';
import {
  AdminProjectHeader,
  ProjectJumpNav,
  ProjectSectionTitle,
  ProjectWorkspace,
} from '@/components/app/project-workspace';
import { ProjectEditSheet } from '@/components/app/admin-entity-sheets';
import { TaskCreateSheet, TaskEditSheet } from '@/components/app/task-sheets';
import { AdminTaskTable } from '@/components/app/task-row';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => api<ProjectDetail>(`/projects/${id}`),
    enabled: !!id,
  });

  const sheetTask = useMemo(
    () => project?.tasks?.find((t) => t.id === sheetTaskId) ?? null,
    [project?.tasks, sheetTaskId]
  );

  const addTask = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<Task>(`/projects/${id}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to add task'),
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      api(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', id] }),
  });

  const uploadFile = useMutation({
    mutationFn: (file: File) => apiUpload<ProjectFile>(`/projects/${id}/files`, file),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Upload failed'),
  });

  const deleteFile = useMutation({
    mutationFn: (fileId: string) => api(`/files/${fileId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', id] }),
  });

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const tasks = project?.tasks ?? [];
    const idx = tasks.findIndex((t) => t.id === taskId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= tasks.length) return;
    const items = tasks.map((t, i) => {
      if (i === idx) return { id: t.id, sort_order: swapIdx };
      if (i === swapIdx) return { id: t.id, sort_order: idx };
      return { id: t.id, sort_order: t.sort_order };
    });
    api('/tasks/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    });
  };

  if (isLoading) return <PageSkeleton rows={8} />;
  if (!project) return <EmptyState message="Project not found" />;

  const tasks = project.tasks ?? [];
  const files = project.files ?? [];

  const headerStats = [
    {
      label: 'Tasks',
      value: tasks.length,
      icon: 'task',
    },
    {
      label: 'Files',
      value: files.length,
      icon: 'attach_file',
    },
    {
      label: 'Target date',
      value: project.target_date
        ? new Date(project.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : '—',
      icon: 'calendar_today',
    },
  ];

  return (
    <div className="page-stack">
      <AdminProjectHeader
        title={project.title}
        status={project.status}
        archived={project.archived}
        description={project.description}
        client={
          project.client
            ? {
                id: project.client_id,
                name: project.client.name,
                company: project.client.company,
              }
            : undefined
        }
        stats={headerStats}
        onEdit={() => setEditProjectOpen(true)}
      />

      {error && <FormAlert message={error} />}

      <ProjectJumpNav taskCount={tasks.length} fileCount={files.length} />

      <ProjectWorkspace
        tasks={
          <section aria-labelledby="project-tasks-heading">
            <ProjectSectionTitle
              id="project-tasks-heading"
              icon="task"
              title="Tasks"
              count={tasks.length}
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
                  <Icon name="add" className="text-[16px]" />
                  Add task
                </Button>
              }
            />

            {!tasks.length ? (
              <EmptyState
                icon="task"
                title="No tasks yet"
                message="Add a task to break work into trackable steps."
                action={
                  <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
                    <Icon name="add" className="text-[16px]" />
                    Add task
                  </Button>
                }
                className="py-10"
              />
            ) : (
              <AdminTaskTable
                tasks={tasks}
                activeTaskId={sheetTaskId}
                onTaskClick={setSheetTaskId}
                onMoveTask={moveTask}
              />
            )}
          </section>
        }
        files={
          <section aria-labelledby="project-files-heading">
            <ProjectSectionTitle
              id="project-files-heading"
              icon="attach_file"
              title="Files"
              count={files.length}
              className="hidden lg:flex"
            />
            <ProjectFilesPanel
              files={files}
              canUpload
              canDelete
              uploading={uploadFile.isPending}
              uploadError={
                uploadFile.isError
                  ? uploadFile.error instanceof Error
                    ? uploadFile.error.message
                    : 'Upload failed'
                  : null
              }
              onUpload={(f) => uploadFile.mutateAsync(f)}
              onDelete={(fileId) => deleteFile.mutate(fileId)}
            />
          </section>
        }
      />

      <TaskCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        pending={addTask.isPending}
        onSubmit={(task) => addTask.mutate(task)}
      />

      <ProjectEditSheet
        project={project}
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
      />

      <TaskEditSheet
        task={sheetTask}
        open={!!sheetTaskId}
        onOpenChange={(open) => !open && setSheetTaskId(null)}
        onUpdate={(updates) => {
          if (sheetTask) updateTask.mutate({ taskId: sheetTask.id, updates });
        }}
      />
    </div>
  );
}
