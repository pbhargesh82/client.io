import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { ClientDashboard } from '@clientspace/shared';
import { Card, EmptyState, LoadingSkeleton, PageHeader, StatusBadge } from '../../components/ui';

export default function ClientDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['client', 'dashboard'],
    queryFn: () => api<ClientDashboard>('/client/dashboard'),
  });

  if (isLoading) return <LoadingSkeleton rows={6} />;

  return (
    <div>
      <PageHeader title="Your Projects" />

      {!data?.projects?.length ? (
        <EmptyState message="No projects assigned yet. Your agency will add projects here." />
      ) : (
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {data.projects.map((p) => (
            <Link key={p.id} to={`/client/projects/${p.id}`}>
              <Card className="transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-slate-900">{p.title}</h3>
                  <StatusBadge status={p.status} />
                </div>
                {p.description && (
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{p.description}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Upcoming Tasks</h2>
          {!data?.upcoming_tasks?.length ? (
            <EmptyState message="No upcoming tasks." />
          ) : (
            <Card className="divide-y divide-slate-100 p-0">
              {data.upcoming_tasks.map((t) => (
                <div key={t.id} className="px-6 py-4">
                  <p className="font-medium text-slate-900">{t.title}</p>
                  <p className="text-sm text-slate-500">
                    {t.project_title}
                    {t.due_date && ` · Due ${new Date(t.due_date).toLocaleDateString()}`}
                  </p>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Files</h2>
          {!data?.recent_files?.length ? (
            <EmptyState message="No files shared yet." />
          ) : (
            <Card className="divide-y divide-slate-100 p-0">
              {data.recent_files.map((f) => (
                <div key={f.id} className="px-6 py-4">
                  <p className="font-medium text-slate-900">{f.name}</p>
                  <p className="text-sm text-slate-500">
                    {f.project_title} · {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
