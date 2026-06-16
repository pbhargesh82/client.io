import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, ListTodo, Paperclip } from 'lucide-react';
import { api, apiUpload } from '@/lib/api';
import type { ProjectDetail, ProjectFile } from '@clientspace/shared';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel } from '@/components/app/panel';
import { FormAlert } from '@/components/app/query-error';
import { FileUploadZone } from '@/components/app/file-upload-zone';
import { TaskRowClient } from '@/components/app/task-row';
import { ButtonLink, ButtonAnchor } from '@/components/ui/button-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClientProjectPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['client', 'projects', id],
    queryFn: () => api<ProjectDetail>(`/client/projects/${id}`),
    enabled: !!id,
  });

  const uploadFile = useMutation({
    mutationFn: (file: File) => apiUpload<ProjectFile>(`/projects/${id}/files`, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', 'projects', id] }),
    onError: (err) => setError(err instanceof Error ? err.message : 'Upload failed'),
  });

  if (isLoading) return <PageSkeleton rows={6} />;
  if (!project) return <EmptyState message="Project not found" />;

  return (
    <div>
      <PageHeader title={project.title}>
        <ButtonLink variant="outline" to="/client/dashboard">
          <ArrowLeft className="size-4" /> Back
        </ButtonLink>
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
          <Panel title="Tasks">
            {!project.tasks?.length ? (
              <EmptyState icon={ListTodo} message="No tasks yet." className="py-8" />
            ) : (
              <ul className="divide-y divide-border">
                {project.tasks.map((task) => (
                  <TaskRowClient
                    key={task.id}
                    task={task}
                    expanded={expandedTask === task.id}
                    onToggleComments={() =>
                      setExpandedTask(expandedTask === task.id ? null : task.id)
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
              label="Upload a file"
              onFile={(f) => uploadFile.mutate(f)}
            />

            {!project.files?.length ? (
              <EmptyState
                icon={Paperclip}
                message="No files yet. Upload briefs, assets, or feedback here."
                className="py-8"
              />
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
                        {(f.size_bytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {f.download_url && (
                      <ButtonAnchor
                        variant="outline"
                        size="sm"
                        href={f.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="size-4" /> Download
                      </ButtonAnchor>
                    )}
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
