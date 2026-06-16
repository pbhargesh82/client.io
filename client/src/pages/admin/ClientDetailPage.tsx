import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban } from 'lucide-react';
import { api } from '@/lib/api';
import type { ClientWithProjects } from '@clientspace/shared';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel, FormPanel } from '@/components/app/panel';
import { FormAlert } from '@/components/app/query-error';
import { ListLinkRow } from '@/components/app/list-link-row';
import { FormActions } from '@/components/app/form-actions';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => api<ClientWithProjects>(`/clients/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify({ name, company, email }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', id] });
      setEditing(false);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Update failed'),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => api(`/clients/${id}/deactivate`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', id] });
    },
  });

  const startEdit = () => {
    if (client) {
      setName(client.name);
      setCompany(client.company || '');
      setEmail(client.email);
      setEditing(true);
    }
  };

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) return <EmptyState title="Could not load client" message="Refresh to try again." />;
  if (!client) return <EmptyState message="Client not found" />;

  return (
    <div>
      <PageHeader title={client.name} description={client.email}>
        {!editing && (
          <>
            <Button variant="outline" onClick={startEdit}>
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
          </>
        )}
        <ButtonLink to="/projects/new">
          <Plus className="size-4" /> New project
        </ButtonLink>
      </PageHeader>

      {error && <FormAlert message={error} />}

      <FormPanel title="Details" className="mb-8">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label className="text-[13px]">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <FormActions className="pt-0">
              <Button type="submit" disabled={updateMutation.isPending}>
                Save
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </FormActions>
          </form>
        ) : (
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
        )}
      </FormPanel>

      <Panel title="Projects">
        {!client.projects?.length ? (
          <EmptyState
            icon={FolderKanban}
            message="No projects for this client yet."
            className="py-8"
            action={
              <ButtonLink size="sm" to="/projects/new">
                Create project
              </ButtonLink>
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
    </div>
  );
}
