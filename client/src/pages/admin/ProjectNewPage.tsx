import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import type { Client, ProjectStatus } from '@clientspace/shared';
import { PageHeader } from '@/components/app/page-header';
import { FormPanel } from '@/components/app/panel';
import { FormAlert } from '@/components/app/query-error';
import { FormActions } from '@/components/app/form-actions';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <PageHeader title="New project" description="Create a project and assign it to a client">
        <ButtonLink variant="outline" to="/projects">
          <ArrowLeft className="size-4" /> Back
        </ButtonLink>
      </PageHeader>

      {error && <FormAlert message={error} />}

      <FormPanel title="Project details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label className="text-[13px]">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Client</Label>
            <Select value={clientId} onValueChange={(v) => v && setClientId(v)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Target date</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          </div>
          <FormActions>
            <Button type="submit" disabled={mutation.isPending || !clientId}>
              {mutation.isPending ? 'Creating…' : 'Create project'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
              Cancel
            </Button>
          </FormActions>
        </form>
      </FormPanel>
    </div>
  );
}
