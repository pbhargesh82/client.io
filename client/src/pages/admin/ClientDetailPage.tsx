import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { ClientWithProjects } from '@clientspace/shared';
import { Button, Card, EmptyState, ErrorMessage, Input, LoadingSkeleton, PageHeader, StatusBadge } from '../../components/ui';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => api<ClientWithProjects>(`/clients/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api(`/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, company, email }),
      }),
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

  if (isLoading) return <LoadingSkeleton />;
  if (!client) return <EmptyState message="Client not found" />;

  return (
    <div>
      <PageHeader title={client.name}>
        <div className="flex gap-2">
          {!editing && (
            <>
              <Button variant="secondary" onClick={startEdit}>Edit</Button>
              {client.active && (
                <Button variant="danger" onClick={() => deactivateMutation.mutate()}>
                  Deactivate
                </Button>
              )}
            </>
          )}
          <Link to="/projects/new">
            <Button>Add Project</Button>
          </Link>
        </div>
      </PageHeader>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <Card className="mb-8 max-w-lg">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="flex gap-3">
              <Button type="submit" disabled={updateMutation.isPending}>Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-2 text-sm">
            <div><dt className="text-slate-500">Company</dt><dd>{client.company || '—'}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd>{client.email}</dd></div>
            <div><dt className="text-slate-500">Status</dt><dd>{client.active ? 'Active' : 'Inactive'}</dd></div>
          </dl>
        )}
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Projects</h2>
      {!client.projects?.length ? (
        <EmptyState message="No projects for this client yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {client.projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-slate-900">{p.title}</h3>
                  <StatusBadge status={p.status} />
                </div>
                {p.description && <p className="mt-2 text-sm text-slate-500 line-clamp-2">{p.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
