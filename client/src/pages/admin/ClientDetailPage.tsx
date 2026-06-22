import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban } from 'lucide-react';
import { api } from '@/lib/api';
import type { ClientWithProjects } from '@clientspace/shared';
import {
  ClientEditSheet,
  ProjectCreateSheet,
} from '@/components/app/admin-entity-sheets';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel } from '@/components/app/panel';
import { ListLinkRow } from '@/components/app/list-link-row';
import { Button } from '@/components/ui/button';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => api<ClientWithProjects>(`/clients/${id}`),
    enabled: !!id,
  });

  const deactivateMutation = useMutation({
    mutationFn: () => api(`/clients/${id}/deactivate`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', id] });
    },
  });

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) return <EmptyState title="Could not load client" message="Refresh to try again." />;
  if (!client) return <EmptyState message="Client not found" />;

  return (
    <div className="page-stack">
      <PageHeader title={client.name} description={client.email}>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
        {client.active && (
          <Button
            variant="destructive"
            onClick={() => deactivateMutation.mutate()}
            disabled={deactivateMutation.isPending}
          >
            Deactivate
          </Button>
        )}
        <Button onClick={() => setCreateProjectOpen(true)}>
          <Plus className="size-4" /> New project
        </Button>
      </PageHeader>

      <Panel title="Details">
        <dl className="grid gap-4 text-[13px] sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Company</dt>
            <dd className="mt-0.5 font-medium">{client.company || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={client.active ? 'Active' : 'Inactive'} />
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Projects">
        {!client.projects?.length ? (
          <EmptyState
            icon={FolderKanban}
            message="No projects for this client yet."
            className="py-8"
            action={
              <Button size="sm" onClick={() => setCreateProjectOpen(true)}>
                Create project
              </Button>
            }
          />
        ) : (
          <ul className="-mx-1">
            {client.projects.map((p) => (
              <li key={p.id}>
                <ListLinkRow
                  to={`/projects/${p.id}`}
                  title={p.title}
                  subtitle={p.description || undefined}
                  trailing={<StatusBadge status={p.status} />}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ClientEditSheet client={client} open={editOpen} onOpenChange={setEditOpen} />

      <ProjectCreateSheet
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        defaultClientId={client.id}
      />
    </div>
  );
}
