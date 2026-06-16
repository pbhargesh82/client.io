import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Client, ProjectStatus } from '@clientspace/shared';
import { Button, Card, ErrorMessage, Input, PageHeader, Select, Textarea } from '../../components/ui';

const STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Done'];

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState('');

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api<Client[]>('/clients'),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api<{ id: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || undefined,
          client_id: clientId,
          status,
          start_date: startDate || undefined,
          target_date: targetDate || undefined,
        }),
      }),
    onSuccess: (data) => navigate(`/projects/${data.id}`),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create project'),
  });

  return (
    <div>
      <PageHeader title="New Project" />
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      <Card className="max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="">Select a client</option>
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="Target Date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={mutation.isPending || !clientId}>
              {mutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
