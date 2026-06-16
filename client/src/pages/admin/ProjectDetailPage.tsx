import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Trash2, Download, ListTodo, Paperclip } from 'lucide-react';
import { api, apiUpload } from '@/lib/api';
import type { ProjectDetail, Task, ProjectFile, ProjectStatus } from '@clientspace/shared';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel } from '@/components/app/panel';
import { FormAlert } from '@/components/app/query-error';
import { FileUploadZone } from '@/components/app/file-upload-zone';
import { TaskCreateForm } from '@/components/app/task-create-form';
import { TaskRowAdmin } from '@/components/app/task-row';
import { Button } from '@/components/ui/button';
import { ButtonAnchor } from '@/components/ui/button-link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Done'];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => api<ProjectDetail>(`/projects/${id}`),
    enabled: !!id,
  });

  const updateProject = useMutation({
    mutationFn: (updates: Partial<ProjectDetail>) =>
      api(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', id] }),
  });

  const archiveProject = useMutation({
    mutationFn: () => api(`/projects/${id}/archive`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const addTask = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<Task>(`/projects/${id}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', id] }),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to add task'),
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      api(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', id] }),
  });

  const uploadFile = useMutation({
    mutationFn: (file: File) => apiUpload<ProjectFile>(`/projects/${id}/files`, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', id] }),
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

  return (
    <div>
      <PageHeader title={project.title} description={project.client?.name}>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={project.status}
            onValueChange={(v) => v && updateProject.mutate({ status: v as ProjectStatus })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!project.archived && (
            <Button variant="outline" onClick={() => archiveProject.mutate()}>
              Archive
            </Button>
          )}
        </div>
      </PageHeader>

      {error && <FormAlert message={error} />}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={project.status} />
        {project.target_date && (
          <span className="text-[13px] text-muted-foreground">
            Target {new Date(project.target_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {project.description && (
        <p className="mb-6 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      )}

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tasks">
            <ListTodo className="size-4" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="files">
            <Paperclip className="size-4" /> Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Panel title="Task list">
            <TaskCreateForm
              pending={addTask.isPending}
              onSubmit={(task) => addTask.mutate(task)}
            />

            {!project.tasks?.length ? (
              <EmptyState icon={ListTodo} message="No tasks yet. Add one above." className="py-8" />
            ) : (
              <ul className="divide-y divide-border">
                {project.tasks.map((task, idx) => (
                  <TaskRowAdmin
                    key={task.id}
                    task={task}
                    expanded={expandedTask === task.id}
                    onToggleComments={() =>
                      setExpandedTask(expandedTask === task.id ? null : task.id)
                    }
                    onUpdate={(updates) => updateTask.mutate({ taskId: task.id, updates })}
                    reorder={
                      <div className="flex flex-col gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveTask(task, 'up')}
                          disabled={idx === 0}
                          aria-label="Move task up"
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveTask(task, 'down')}
                          disabled={idx === (project.tasks?.length ?? 0) - 1}
                          aria-label="Move task down"
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="files">
          <Panel title="Shared files">
            <FileUploadZone
              className="mb-4"
              uploading={uploadFile.isPending}
              onFile={(f) => uploadFile.mutate(f)}
            />

            {!project.files?.length ? (
              <EmptyState icon={Paperclip} message="No files uploaded yet." className="py-8" />
            ) : (
              <ul className="divide-y divide-border">
                {project.files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{f.name}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {(f.size_bytes / 1024).toFixed(1)} KB ·{' '}
                        {new Date(f.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {f.download_url && (
                        <ButtonAnchor
                          variant="ghost"
                          size="icon-sm"
                          href={f.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download ${f.name}`}
                        >
                          <Download className="size-4" />
                        </ButtonAnchor>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => deleteFile.mutate(f.id)}
                        aria-label={`Delete ${f.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
