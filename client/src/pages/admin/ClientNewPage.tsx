import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button, Card, ErrorMessage, Input, PageHeader } from '../../components/ui';

export default function ClientNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      api<{ id: string; temp_password?: string }>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name,
          company: company || undefined,
          email,
          password: password || undefined,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      if (data.temp_password) {
        setTempPassword(data.temp_password);
      } else {
        navigate(`/clients/${data.id}`);
      }
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create client'),
  });

  if (tempPassword) {
    return (
      <div>
        <PageHeader title="Client Created" />
        <Card>
          <p className="mb-4 text-slate-700">Share these credentials with your client:</p>
          <p className="font-mono text-sm"><strong>Email:</strong> {email}</p>
          <p className="font-mono text-sm"><strong>Password:</strong> {tempPassword}</p>
          <Button className="mt-6" onClick={() => navigate('/clients')}>
            Back to Clients
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="New Client" />
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      <Card className="max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Password (optional — auto-generated if blank)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Client'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
