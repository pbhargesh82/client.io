import { useQuery } from '@tanstack/react-query';
import { FolderKanban } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { getFirstName, getTimeGreeting } from '@/lib/greeting';
import type { ClientDashboard } from '@clientspace/shared';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/app/status-badge';
import { PriorityBadge } from '@/components/app/priority-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { Panel } from '@/components/app/panel';
import { QueryError } from '@/components/app/query-error';
import { ListLinkRow } from '@/components/app/list-link-row';

export default function ClientDashboardPage() {
  const { name } = useAuth();
  const firstName = getFirstName(name);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['client', 'dashboard'],
    queryFn: () => api<ClientDashboard>('/client/dashboard'),
  });

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) return <QueryError message="Could not load your dashboard. Refresh to try again." />;

  const hasProjects = (data?.projects?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {firstName ? `${getTimeGreeting()}, ${firstName}` : 'Your projects'}
        </h1>
        <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-muted-foreground md:text-sm">
          {hasProjects
            ? 'Progress, tasks, and shared files for everything in flight.'
            : 'Your agency will add projects here when work begins.'}
        </p>
      </header>

      {!hasProjects ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          message="When your agency starts work, you'll see status updates and deliverables here."
        />
      ) : (
        <Panel title="Projects">
          <ul className="-mx-1">
            {data!.projects.map((p) => (
              <li key={p.id}>
                <ListLinkRow
                  to={`/client/projects/${p.id}`}
                  title={p.title}
                  subtitle={p.description || undefined}
                  trailing={<StatusBadge status={p.status} />}
                />
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {hasProjects && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Upcoming tasks">
            {!data?.upcoming_tasks?.length ? (
              <p className="text-[13px] text-muted-foreground">No upcoming tasks.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.upcoming_tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{t.title}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {t.project_title}
                      {t.due_date && (
                        <>
                          <span aria-hidden> · </span>
                          Ends {new Date(t.due_date).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={t.status} />
                    {t.priority && <PriorityBadge priority={t.priority} />}
                  </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent files">
            {!data?.recent_files?.length ? (
              <p className="text-[13px] text-muted-foreground">No files shared yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recent_files.map((f) => (
                  <li key={f.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-[13px] font-medium">{f.name}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {f.project_title}
                      <span aria-hidden> · </span>
                      <time dateTime={f.created_at}>{formatRelativeTime(f.created_at)}</time>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
