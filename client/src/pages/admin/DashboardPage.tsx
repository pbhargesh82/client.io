import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  ChevronRight,
  MessageSquare,
  Upload,
  ListTodo,
  Activity,
  FolderKanban,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { getFirstName, getTimeGreeting } from '@/lib/greeting';
import type { DashboardStats, ActivityItem, Project } from '@clientspace/shared';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/app/empty-state';
import { Panel } from '@/components/app/panel';
import { QueryError } from '@/components/app/query-error';
import { SummaryBar } from '@/components/app/summary-bar';
import { AlertBanner } from '@/components/app/alert-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { ButtonLink } from '@/components/ui/button-link';
import { StatusBadge } from '@/components/app/status-badge';
import type { LucideIcon } from 'lucide-react';

const activityMeta: Record<ActivityItem['type'], { icon: LucideIcon }> = {
  task_updated: { icon: ListTodo },
  file_uploaded: { icon: Upload },
  comment_added: { icon: MessageSquare },
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
  const isEmptyWorkspace =
    !statsQuery.isLoading &&
    !statsQuery.isError &&
    (stats?.active_clients ?? 0) === 0 &&
    (stats?.active_projects ?? 0) === 0;

  return (
    <div className="page-stack">
      <header className="flex flex-col gap-4 border-b border-border/80 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Overview</p>
          <h1>{firstName ? `${greeting}, ${firstName}` : greeting}</h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-muted-foreground md:text-sm">
            {overdue > 0
              ? `${overdue} overdue task${overdue === 1 ? '' : 's'} need attention.`
              : isEmptyWorkspace
                ? 'Add a client and project to start tracking work.'
                : 'Recent updates across your clients and projects.'}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ButtonLink variant="outline" to="/clients?create=1">
            Add client
          </ButtonLink>
          <ButtonLink to="/projects?create=1">
            <Plus className="size-4" aria-hidden />
            New project
          </ButtonLink>
        </div>
      </header>

      {statsQuery.isError ? (
        <QueryError message="Could not load summary. Refresh to try again." />
      ) : (
        <SummaryBar
          loading={statsQuery.isLoading}
          items={[
            { label: 'active clients', value: stats?.active_clients ?? 0 },
            { label: 'active projects', value: stats?.active_projects ?? 0 },
            { label: 'due this week', value: stats?.tasks_due_this_week ?? 0 },
            { label: 'overdue', value: overdue, emphasis: 'alert' },
          ]}
        />
      )}

      {overdue > 0 && !statsQuery.isLoading && (
        <AlertBanner variant="destructive">
          <span className="font-medium text-destructive">
            {overdue} overdue task{overdue === 1 ? '' : 's'}
          </span>
          {' '}— open a project and review tasks to get back on track.
        </AlertBanner>
      )}

      {isEmptyWorkspace && (
        <AlertBanner variant="info">
          <p className="font-medium">Get started in two steps</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
            <li>
              <ButtonLink variant="link" className="h-auto p-0 text-[13px]" to="/clients?create=1">
                Add a client
              </ButtonLink>{' '}
              and share portal access
            </li>
            <li>
              <ButtonLink variant="link" className="h-auto p-0 text-[13px]" to="/projects?create=1">
                Create a project
              </ButtonLink>{' '}
              with tasks and files
            </li>
          </ol>
        </AlertBanner>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title="Recent activity" titleId="recent-activity-heading" className="xl:col-span-3">
          {activityQuery.isError ? (
            <QueryError message="Could not load activity." />
          ) : activityQuery.isLoading ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-md" />
              ))}
            </div>
          ) : !activityQuery.data?.length ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              message="Task updates, file uploads, and comments will appear here."
              className="py-10"
            />
          ) : (
            <ul className="divide-y divide-border">
              {activityQuery.data.map((item) => {
                const Icon = activityMeta[item.type].icon;
                return (
                  <li key={item.id}>
                    <Link
                      to={`/projects/${item.project_id}`}
                      className="group flex gap-3 px-1 py-3 interactive-row first:pt-0 last:pb-0"
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-background">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium leading-snug">
                          {item.description}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-muted-foreground">
                          {item.project_title}
                          <span aria-hidden> · </span>
                          <time dateTime={item.created_at}>
                            {formatRelativeTime(item.created_at)}
                          </time>
                        </span>
                      </span>
                      <ChevronRight
                        className="mt-1 size-4 shrink-0 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Active projects"
          titleId="active-projects-heading"
          className="xl:col-span-2"
          action={
            projects.length > 0 ? (
              <Link
                to="/projects"
                className="inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View all
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : undefined
          }
        >
          {projectsQuery.isError ? (
            <QueryError message="Could not load projects." />
          ) : projectsQuery.isLoading ? (
            <div className="space-y-1" aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : !projects.length ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              message="Create a project and assign it to a client."
              className="py-10"
              action={
                <ButtonLink size="sm" to="/projects?create=1">
                  Create project
                </ButtonLink>
              }
            />
          ) : (
            <ul className="-mx-1">
              {projects.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="group flex items-center justify-between gap-3 px-3 py-3 interactive-row"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{p.title}</span>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {p.clients?.name}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={p.status} />
                      <ChevronRight
                        className="size-4 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
