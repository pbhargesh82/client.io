import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/app/page-header';
import { FormPanel } from '@/components/app/panel';
import { FormAlert } from '@/components/app/query-error';
import { FormActions } from '@/components/app/form-actions';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ClientNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
      if (data.temp_password) setTempPassword(data.temp_password);
      else navigate(`/clients/${data.id}`);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create client'),
  });

  const copyCredentials = async () => {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(`Email: ${email}\nPassword: ${tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tempPassword) {
    return (
      <div>
        <PageHeader
          title="Client created"
          description="Share these credentials with your client"
        />
        <FormPanel title="Portal credentials" description="They can sign in at the client portal">
          <dl className="space-y-3 text-[13px]">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-mono font-medium">{email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Password</dt>
              <dd className="mt-0.5 font-mono font-medium">{tempPassword}</dd>
            </div>
          </dl>
          <FormActions>
            <Button type="button" variant="outline" size="sm" onClick={copyCredentials}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy credentials'}
            </Button>
            <Button size="sm" onClick={() => navigate('/clients')}>
              Back to clients
            </Button>
          </FormActions>
        </FormPanel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="New client" description="Create a client account with portal access">
        <ButtonLink variant="outline" to="/clients">
          <ArrowLeft className="size-4" /> Back
        </ButtonLink>
      </PageHeader>

      {error && <FormAlert message={error} />}

      <FormPanel title="Client details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[13px]">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company" className="text-[13px]">
              Company
            </Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px]">
              Password <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Auto-generated if blank"
            />
          </div>
          <FormActions>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create client'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
              Cancel
            </Button>
          </FormActions>
        </form>
      </FormPanel>
    </div>
  );
}
