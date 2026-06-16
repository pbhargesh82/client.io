import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Client } from '@clientspace/shared';
import { Button, Card, EmptyState, LoadingSkeleton, PageHeader } from '../../components/ui';

export default function ClientsListPage() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api<Client[]>('/clients'),
  });

  return (
    <div>
      <PageHeader title="Clients">
        <Link to="/clients/new">
          <Button>Add Client</Button>
        </Link>
      </PageHeader>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !clients?.length ? (
        <EmptyState message="No clients yet. Add your first client to get started." />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Name</th>
                <th className="hidden px-6 py-3 font-medium text-slate-600 sm:table-cell">Company</th>
                <th className="px-6 py-3 font-medium text-slate-600">Email</th>
                <th className="px-6 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link to={`/clients/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="hidden px-6 py-4 text-slate-600 sm:table-cell">{c.company || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{c.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
