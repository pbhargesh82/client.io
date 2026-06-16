import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload } from '../../lib/api';
import type { ProjectDetail, Task, TaskStatus, Comment, ProjectFile, ProjectStatus } from '@clientspace/shared';
import {
  Button, Card, EmptyState, ErrorMessage, Input, LoadingSkeleton,
  PageHeader, Select, StatusBadge,
} from '../../components/ui';

const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Done'];

function TaskComments({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const { data: comments } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => api<Comment[]>(`/tasks/${taskId}/comments`),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setBody('');
    },
  });

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="mb-2 space-y-2">
        {comments?.map((c) => (
          <div key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="font-medium">{c.user?.name}</span>
            <span className="ml-2 text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
            <p className="mt-1 text-slate-700">{c.body}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) mutation.mutate();
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          placeholder="Add a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" disabled={mutation.isPending}>Post</Button>
      </form>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
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
    mutationFn: () =>
      api<Task>(`/projects/${id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      setNewTaskTitle('');
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

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (!project) return <EmptyState message="Project not found" />;

  return (
    <div>
      <PageHeader title={project.title}>
        <div className="flex gap-2">
          <Select
            value={project.status}
            onChange={(e) => updateProject.mutate({ status: e.target.value as ProjectStatus })}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          {!project.archived && (
            <Button variant="secondary" onClick={() => archiveProject.mutate()}>
              Archive
            </Button>
          )}
        </div>
      </PageHeader>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={project.status} />
        {project.client && (
          <span className="text-sm text-slate-500">Client: {project.client.name}</span>
        )}
        {project.target_date && (
          <span className="text-sm text-slate-500">
            Target: {new Date(project.target_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {project.description && (
        <Card className="mb-8">
          <p className="text-sm text-slate-700">{project.description}</p>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTaskTitle.trim()) addTask.mutate();
              }}
              className="mb-4 flex gap-2"
            >
              <Input
                placeholder="New task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <Button type="submit" disabled={addTask.isPending}>Add</Button>
            </form>

            {!project.tasks?.length ? (
              <EmptyState message="No tasks yet." />
            ) : (
              <div className="space-y-2">
                {project.tasks.map((task, idx) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveTask(task, 'up')}
                          disabled={idx === 0}
                          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTask(task, 'down')}
                          disabled={idx === (project.tasks?.length ?? 0) - 1}
                          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          <Select
                            value={task.status}
                            onChange={(e) =>
                              updateTask.mutate({ taskId: task.id, updates: { status: e.target.value as TaskStatus } })
                            }
                            className="w-auto text-xs"
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </Select>
                          <Input
                            type="date"
                            value={task.due_date || ''}
                            onChange={(e) =>
                              updateTask.mutate({ taskId: task.id, updates: { due_date: e.target.value || null } })
                            }
                            className="w-auto text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          className="mt-1 text-xs text-indigo-600 hover:underline"
                        >
                          {expandedTask === task.id ? 'Hide comments' : 'Comments'}
                        </button>
                        {expandedTask === task.id && <TaskComments taskId={task.id} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Files</h2>
          <Card>
            <label className="mb-4 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile.mutate(file);
                  e.target.value = '';
                }}
              />
              {uploadFile.isPending ? 'Uploading...' : 'Click to upload'}
            </label>

            {!project.files?.length ? (
              <EmptyState message="No files uploaded." />
            ) : (
              <ul className="space-y-2">
                {project.files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-slate-400">
                        {(f.size_bytes / 1024).toFixed(1)} KB · {new Date(f.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {f.download_url && (
                        <a
                          href={f.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Download
                        </a>
                      )}
                      <Button variant="danger" onClick={() => deleteFile.mutate(f.id)}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
