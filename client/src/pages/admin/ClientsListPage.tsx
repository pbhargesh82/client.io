import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Client } from '@clientspace/shared';
import {
  ClientCreateSheet,
  ClientCredentialsSheet,
  ClientManageSheet,
} from '@/components/app/admin-entity-sheets';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { QueryError } from '@/components/app/query-error';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ClientsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const createOpen = searchParams.get('create') === '1';
  const selectedClientId = searchParams.get('client');
  const manageOpen = !!selectedClientId;
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: () => api<Client[]>('/clients?active=false'),
  });

  const setCreateOpen = (open: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (open) next.set('create', '1');
    else next.delete('create');
    setSearchParams(next);
  };

  const setManageOpen = (open: boolean, clientId?: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete('create');
    if (open && clientId) next.set('client', clientId);
    else next.delete('client');
    setSearchParams(next);
  };

  const openClient = (clientId: string) => setManageOpen(true, clientId);

  return (
    <div className="page-stack">
      <PageHeader title="Clients" description="Manage your client accounts and portal access">
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Icon name="add" className="text-[18px]" />
          Add client
        </Button>
      </PageHeader>

      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <QueryError message="Could not load clients. Refresh to try again." />
      ) : !clients?.length ? (
        <EmptyState
          icon="group"
          title="No clients yet"
          message="Add your first client to start creating projects."
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Icon name="add" className="text-[18px]" />
              Add client
            </Button>
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
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
                <TableRow
                  key={c.id}
                  className={cn(
                    'group cursor-pointer',
                    !c.active && 'bg-surface-container-low/50 text-on-surface-variant'
                  )}
                  onClick={() => openClient(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openClient(c.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open ${c.name}`}
                >
                  <TableCell>
                    <span className="font-semibold text-on-surface group-hover:text-primary">
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-on-surface-variant sm:table-cell">
                    {c.company || '—'}
                  </TableCell>
                  <TableCell className="font-data-mono text-data-mono text-on-surface-variant">
                    {c.email}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.active ? 'Active' : 'Inactive'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ClientCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(result) => {
          if (result.temp_password) {
            setCredentials({ email: result.email, password: result.temp_password });
          } else {
            openClient(result.id);
          }
        }}
      />

      <ClientManageSheet
        clientId={selectedClientId}
        open={manageOpen}
        onOpenChange={(open) => setManageOpen(open)}
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
