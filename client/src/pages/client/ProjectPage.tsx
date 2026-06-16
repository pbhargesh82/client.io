import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { ProjectDetail, Comment } from '@clientspace/shared';
import { Button, Card, EmptyState, Input, LoadingSkeleton, PageHeader, StatusBadge } from '../../components/ui';

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
    <div className="mt-3 space-y-2">
      {comments?.map((c) => (
        <div key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="font-medium">{c.user?.name}</span>
          <span className="ml-2 text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
          <p className="mt-1">{c.body}</p>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) mutation.mutate();
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Leave a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" disabled={mutation.isPending}>Post</Button>
      </form>
    </div>
  );
}

export default function ClientProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['client', 'projects', id],
    queryFn: () => api<ProjectDetail>(`/client/projects/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (!project) return <EmptyState message="Project not found" />;

  return (
    <div>
      <PageHeader title={project.title}>
        <Link to="/client/dashboard">
          <Button variant="secondary">Back</Button>
        </Link>
      </PageHeader>

      <div className="mb-6">
        <StatusBadge status={project.status} />
        {project.description && (
          <p className="mt-4 text-sm text-slate-600">{project.description}</p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
          {!project.tasks?.length ? (
            <EmptyState message="No tasks yet." />
          ) : (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <Card key={task.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  {task.due_date && (
                    <p className="mt-1 text-xs text-slate-500">
                      Due {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="mt-2 text-xs text-indigo-600 hover:underline"
                  >
                    {expandedTask === task.id ? 'Hide comments' : 'Comments'}
                  </button>
                  {expandedTask === task.id && <TaskComments taskId={task.id} />}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Files</h2>
          {!project.files?.length ? (
            <EmptyState message="No files shared yet." />
          ) : (
            <Card className="divide-y divide-slate-100 p-0">
              {project.files.map((f) => (
                <div key={f.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-sm">{f.name}</p>
                    <p className="text-xs text-slate-400">
                      {(f.size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
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
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
