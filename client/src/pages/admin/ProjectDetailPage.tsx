import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Paperclip,
  Plus,
  Users,
  Calendar,
} from 'lucide-react';
import { api, apiUpload } from '@/lib/api';
import type { ProjectDetail, Task, ProjectFile } from '@clientspace/shared';
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
import { ProjectEditSheet } from '@/components/app/admin-entity-sheets';
import { TaskCreateSheet, TaskCommentsSheet, TaskEditSheet } from '@/components/app/task-sheets';
import { TaskList, TaskRowAdmin } from '@/components/app/task-row';
import { Button } from '@/components/ui/button';

type SheetMode = 'edit' | 'comments' | null;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
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

  const openSheet = (taskId: string, mode: Exclude<SheetMode, null>) => {
    setSheetTaskId(taskId);
    setSheetMode(mode);
  };

  const closeSheet = () => {
    setSheetTaskId(null);
    setSheetMode(null);
  };

  const archiveProject = useMutation({
    mutationFn: () => api(`/projects/${id}/archive`, { method: 'PATCH' }),
    onSuccess: () => {
      setEditProjectOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });

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

  const moveTask = (task: Task, direction: 'up' | 'down') => {
    const tasks = project?.tasks ?? [];
    const idx = tasks.findIndex((t) => t.id === task.id);
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

  const taskCount = project.tasks?.length ?? 0;
  const fileCount = project.files?.length ?? 0;

  return (
    <div className="page-stack">
      <Link
        to="/projects"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All projects
      </Link>

      <section className="rounded-lg border border-border/80 bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1>{project.title}</h1>
              <StatusBadge status={project.status} />
              {project.archived && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Archived
                </span>
              )}
            </div>

            {project.client && (
              <Link
                to={`/clients/${project.client_id}`}
                className="inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Users className="size-3.5 shrink-0" aria-hidden />
                {project.client.name}
                {project.client.company && (
                  <span className="font-normal text-muted-foreground">· {project.client.company}</span>
                )}
              </Link>
            )}

            {project.description && (
              <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}

            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              {project.target_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" aria-hidden />
                  <dt className="text-muted-foreground">Target</dt>
                  <dd className="font-medium">
                    {new Date(project.target_date).toLocaleDateString()}
                  </dd>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <ListTodo className="size-3.5 text-muted-foreground" aria-hidden />
                <dt className="text-muted-foreground">Tasks</dt>
                <dd className="font-medium tabular-nums">{taskCount}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Paperclip className="size-3.5 text-muted-foreground" aria-hidden />
                <dt className="text-muted-foreground">Files</dt>
                <dd className="font-medium tabular-nums">{fileCount}</dd>
              </div>
            </dl>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">
            <Button variant="outline" onClick={() => setEditProjectOpen(true)}>
              Edit project
            </Button>
          </div>
        </div>
      </section>

      {error && <FormAlert message={error} />}

      <ProjectJumpNav taskCount={taskCount} fileCount={fileCount} />

      <ProjectWorkspace
        tasks={
          <section aria-labelledby="project-tasks-heading">
            <ProjectSectionTitle
              id="project-tasks-heading"
              icon={ListTodo}
              title="Tasks"
              count={taskCount}
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" aria-hidden />
                  Add task
                </Button>
              }
            />

            {!project.tasks?.length ? (
              <EmptyState
                icon={ListTodo}
                title="No tasks yet"
                message="Add a task to break work into trackable steps."
                action={
                  <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4" aria-hidden />
                    Add task
                  </Button>
                }
                className="py-10"
              />
            ) : (
              <TaskList variant="admin">
                {project.tasks.map((task, idx) => (
                  <TaskRowAdmin
                    key={task.id}
                    task={task}
                    isFirst={idx === 0}
                    active={sheetTaskId === task.id}
                    onEdit={() => openSheet(task.id, 'edit')}
                    onComments={() => openSheet(task.id, 'comments')}
                    reorder={
                      <div className="flex shrink-0 flex-col gap-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-7"
                          onClick={() => moveTask(task, 'up')}
                          disabled={idx === 0}
                          aria-label="Move task up"
                        >
                          <ChevronUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-7"
                          onClick={() => moveTask(task, 'down')}
                          disabled={idx === (project.tasks?.length ?? 0) - 1}
                          aria-label="Move task down"
                        >
                          <ChevronDown className="size-3.5" />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </TaskList>
            )}
          </section>
        }
        files={
          <section aria-labelledby="project-files-heading">
            <ProjectSectionTitle
              id="project-files-heading"
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
        onArchive={!project.archived ? () => archiveProject.mutate() : undefined}
        archiving={archiveProject.isPending}
      />

      <TaskEditSheet
        task={sheetTask}
        open={sheetMode === 'edit'}
        onOpenChange={(open) => !open && closeSheet()}
        onUpdate={(updates) => {
          if (sheetTask) updateTask.mutate({ taskId: sheetTask.id, updates });
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
