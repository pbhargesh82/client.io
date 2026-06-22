import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { api } from '@/lib/api';
import type { Client } from '@clientspace/shared';
import {
  ClientCreateSheet,
  ClientCredentialsSheet,
} from '@/components/app/admin-entity-sheets';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel } from '@/components/app/panel';
import { QueryError } from '@/components/app/query-error';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ClientsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const createOpen = searchParams.get('create') === '1';
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api<Client[]>('/clients'),
  });

  const setCreateOpen = (open: boolean) => {
    if (open) setSearchParams({ create: '1' });
    else setSearchParams({});
  };

  return (
    <div className="page-stack">
      <PageHeader title="Clients" description="Manage your client accounts and portal access">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add client
        </Button>
      </PageHeader>

      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <QueryError message="Could not load clients. Refresh to try again." />
      ) : !clients?.length ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          message="Add your first client to start creating projects."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add client
            </Button>
          }
        />
      ) : (
        <Panel
          title={`${clients.length} client${clients.length === 1 ? '' : 's'}`}
          variant="inset"
          bodyClassName="overflow-hidden p-0"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      to={`/clients/${c.id}`}
                      className="rounded-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {c.company || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.active ? 'Active' : 'Inactive'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      )}

      <ClientCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(result) => {
          if (result.temp_password) {
            setCredentials({ email: result.email, password: result.temp_password });
          } else {
            navigate(`/clients/${result.id}`);
          }
        }}
      />

      {credentials && (
        <ClientCredentialsSheet
          open={!!credentials}
          onOpenChange={(open) => {
            if (!open) setCredentials(null);
          }}
          email={credentials.email}
          password={credentials.password}
        />
      )}
    </div>
  );
}
