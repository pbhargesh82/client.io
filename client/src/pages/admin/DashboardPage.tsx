import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { getFirstName, getTimeGreeting } from '@/lib/greeting';
import type { DashboardStats, ActivityItem, Project } from '@clientspace/shared';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/app/empty-state';
import { QueryError } from '@/components/app/query-error';
import { SummaryBar } from '@/components/app/summary-bar';
import { AlertBanner } from '@/components/app/alert-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { ButtonLink } from '@/components/ui/button-link';
import { StatusBadge } from '@/components/app/status-badge';
import { Icon } from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const activityTypeLabel: Record<ActivityItem['type'], string> = {
  task_updated: 'In Progress',
  file_uploaded: 'Completed',
  comment_added: 'In Progress',
};

export default function AdminDashboardPage() {
  const { name } = useAuth();
  const firstName = getFirstName(name);
  const greeting = getTimeGreeting();

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api<DashboardStats>('/dashboard/stats'),
  });

  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api<ActivityItem[]>('/dashboard/activity'),
  });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<(Project & { clients: { name: string } })[]>('/projects'),
  });

  const stats = statsQuery.data;
  const projects = projectsQuery.data ?? [];
  const overdue = stats?.overdue_tasks ?? 0;
  const reviewProjects = projects.filter((p) => p.status === 'Review');
  const attentionItems = [
    ...reviewProjects.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: `${p.clients?.name} — awaiting review`,
      badge: 'Review',
      badgeClass: 'bg-secondary-container text-on-secondary-container',
      to: `/projects/${p.id}`,
      time: 'Needs review',
    })),
  ].slice(0, 5);

  const isEmptyWorkspace =
    !statsQuery.isLoading &&
    !statsQuery.isError &&
    (stats?.active_clients ?? 0) === 0 &&
    (stats?.active_projects ?? 0) === 0;

  return (
    <div className="page-stack">
      <section className="mb-stack-lg flex flex-col gap-stack-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-display text-on-surface mb-unit">
            {firstName ? `${greeting}, ${firstName}.` : 'Overview'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Here's what's happening across your workspace today.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <ButtonLink variant="outline" to="/clients?create=1">
            Add client
          </ButtonLink>
          <ButtonLink to="/projects?create=1" className="gap-2">
            <Icon name="add" className="text-[18px]" />
            New project
          </ButtonLink>
        </div>
      </section>

      {statsQuery.isError ? (
        <QueryError message="Could not load summary. Refresh to try again." />
      ) : (
        <SummaryBar
          loading={statsQuery.isLoading}
          items={[
            { label: 'Active clients', value: stats?.active_clients ?? 0, icon: 'group' },
            { label: 'Active projects', value: stats?.active_projects ?? 0, icon: 'folder_open' },
            { label: 'Due this week', value: stats?.tasks_due_this_week ?? 0, icon: 'schedule' },
            { label: 'Overdue tasks', value: overdue, emphasis: 'alert', icon: 'warning' },
          ]}
        />
      )}

      {overdue > 0 && !statsQuery.isLoading && (
        <AlertBanner variant="destructive">
          <span className="font-semibold text-error">
            {overdue} overdue task{overdue === 1 ? '' : 's'}
          </span>{' '}
          — open a project and review tasks to get back on track.
        </AlertBanner>
      )}

      {isEmptyWorkspace && (
        <AlertBanner variant="info">
          <p className="font-semibold">Get started in two steps</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-on-surface-variant">
            <li>
              <ButtonLink variant="link" className="h-auto p-0" to="/clients?create=1">
                Add a client
              </ButtonLink>{' '}
              and share portal access
            </li>
            <li>
              <ButtonLink variant="link" className="h-auto p-0" to="/projects?create=1">
                Create a project
              </ButtonLink>{' '}
              with tasks and files
            </li>
          </ol>
        </AlertBanner>
      )}

      <div className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="card-surface flex h-full flex-col overflow-hidden md:col-span-4">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-bright p-stack-sm">
            <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">
              Needs Attention
            </h3>
          </div>
          <div className="flex flex-1 flex-col gap-unit overflow-y-auto p-stack-sm">
            {overdue === 0 && attentionItems.length === 0 ? (
              <p className="py-4 text-center font-body-sm text-body-sm text-on-surface-variant">
                Nothing needs attention right now.
              </p>
            ) : (
              <>
                {overdue > 0 && (
                  <Link
                    to="/projects"
                    className="group cursor-pointer rounded-lg p-unit outline-none hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-action"
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface group-hover:text-primary">
                        Overdue tasks
                      </span>
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-error-container text-on-error-container">
                        Overdue
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {overdue} task{overdue === 1 ? '' : 's'} past due date
                    </p>
                  </Link>
                )}
                {attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.to}
                    className="group cursor-pointer rounded-lg p-unit outline-none hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-action"
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface group-hover:text-primary">
                        {item.title}
                      </span>
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
                      {item.subtitle}
                    </p>
                    <span className="mt-2 block font-label-caps text-[10px] text-outline">
                      {item.time}
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>
          {(overdue > 0 || attentionItems.length > 0) && (
            <div className="border-t border-outline-variant bg-surface-bright p-stack-sm">
              <Link
                to="/projects"
                className="block w-full text-center font-body-sm text-body-sm font-semibold text-on-surface-variant hover:text-primary focus-ring rounded-sm"
              >
                View all projects
              </Link>
            </div>
          )}
        </div>

        <div className="md:col-span-8">
          <div className="card-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-bright p-stack-md">
              <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
            </div>
            {activityQuery.isError ? (
              <div className="p-stack-md">
                <QueryError message="Could not load activity." />
              </div>
            ) : activityQuery.isLoading ? (
              <div className="space-y-3 p-stack-md" aria-busy="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 rounded" />
                ))}
              </div>
            ) : !activityQuery.data?.length ? (
              <EmptyState
                icon="monitoring"
                title="No activity yet"
                message="Task updates, file uploads, and comments will appear here."
                className="py-10"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client / Project</TableHead>
                    <TableHead>Update</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityQuery.data.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <div className="font-semibold transition-colors group-hover:text-primary">
                          {item.project_title}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 sm:hidden">
                          <StatusBadge status={activityTypeLabel[item.type]} />
                          <time
                            dateTime={item.created_at}
                            className="font-data-mono text-data-mono text-on-surface-variant"
                          >
                            {formatRelativeTime(item.created_at)}
                          </time>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">{item.description}</TableCell>
                      <TableCell className="hidden font-data-mono text-data-mono text-on-surface-variant sm:table-cell">
                        <time dateTime={item.created_at}>
                          {formatRelativeTime(item.created_at)}
                        </time>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={activityTypeLabel[item.type]} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/projects/${item.project_id}`}
                          aria-label="View details"
                          className="text-on-surface-variant hover:text-primary focus-ring rounded-sm"
                        >
                          <Icon name="chevron_right" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
