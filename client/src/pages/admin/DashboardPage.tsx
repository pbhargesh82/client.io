import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { DashboardStats, ActivityItem, Project } from '@clientspace/shared';
import { Card, EmptyState, LoadingSkeleton, PageHeader } from '../../components/ui';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api<DashboardStats>('/dashboard/stats'),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api<ActivityItem[]>('/dashboard/activity'),
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<(Project & { clients: { name: string } })[]>('/projects'),
  });

  const statCards = [
    { label: 'Active Clients', value: stats?.active_clients ?? 0 },
    { label: 'Active Projects', value: stats?.active_projects ?? 0 },
    { label: 'Due This Week', value: stats?.tasks_due_this_week ?? 0 },
    { label: 'Overdue Tasks', value: stats?.overdue_tasks ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      {statsLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          {activityLoading ? (
            <LoadingSkeleton />
          ) : !activity?.length ? (
            <EmptyState message="No recent activity" />
          ) : (
            <Card className="divide-y divide-slate-100 p-0">
              {activity.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <p className="text-sm text-slate-900">{item.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.project_title} · {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Active Projects</h2>
          {!projects?.length ? (
            <EmptyState message="No active projects" />
          ) : (
            <Card className="divide-y divide-slate-100 p-0">
              {projects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{p.title}</span>
                  <span className="text-sm text-slate-500">{p.clients?.name}</span>
                </Link>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
