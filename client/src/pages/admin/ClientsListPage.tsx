import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { api } from '@/lib/api';
import type { Client } from '@clientspace/shared';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel } from '@/components/app/panel';
import { QueryError } from '@/components/app/query-error';
import { ButtonLink } from '@/components/ui/button-link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ClientsListPage() {
  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api<Client[]>('/clients'),
  });

  return (
    <div>
      <PageHeader title="Clients" description="Manage your client accounts and portal access">
        <ButtonLink to="/clients/new">
          <Plus className="size-4" />
          Add client
        </ButtonLink>
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
            <ButtonLink size="sm" to="/clients/new">
              Add client
            </ButtonLink>
          }
        />
      ) : (
        <Panel title={`${clients.length} client${clients.length === 1 ? '' : 's'}`} bodyClassName="p-0">
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
                      className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
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
    </div>
  );
}
