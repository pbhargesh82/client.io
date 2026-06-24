import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { getFirstName, getTimeGreeting } from '@/lib/greeting';
import type { ClientDashboard } from '@clientspace/shared';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/app/status-badge';
import { PriorityBadge } from '@/components/app/priority-badge';
import { EmptyState } from '@/components/app/empty-state';
import { PageSkeleton } from '@/components/app/loading';
import { QueryError } from '@/components/app/query-error';
import { SummaryBar } from '@/components/app/summary-bar';
import { downloadNamedFile } from '@/lib/files';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

function ProjectCard({
  id,
  title,
  description,
  status,
  targetDate,
}: {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  targetDate?: string | null;
}) {
  return (
    <Link
      to={`/client/projects/${id}`}
      className={cn(
        'card-surface group flex items-start justify-between gap-4 p-stack-md transition-shadow hover:shadow-ambient',
        'focus-ring'
      )}
    >
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-primary">
            {title}
          </span>
          <StatusBadge status={status} />
        </span>
        {description && (
          <span className="block font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
            {description}
          </span>
        )}
        {targetDate && (
          <span className="block font-data-mono text-[12px] text-on-surface-variant">
            Target {new Date(targetDate).toLocaleDateString()}
          </span>
        )}
      </span>
      <Icon
        name="chevron_right"
        className="mt-0.5 shrink-0 text-on-surface-variant/35 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-on-surface-variant"
      />
    </Link>
  );
}

function TaskRow({
  task,
}: {
  task: ClientDashboard['upcoming_tasks'][number];
}) {
  return (
    <Link
      to={`/client/projects/${task.project_id}`}
      className="group flex items-start justify-between gap-3 px-stack-sm py-unit interactive-row"
    >
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="flex items-center gap-1.5 font-body-sm text-[12px] font-medium text-primary">
          <Icon name="folder_open" className="text-[14px]" />
          <span className="sr-only">Project: </span>
          <span className="truncate">{task.project_title}</span>
        </span>
        <span className="block font-body-sm text-body-sm font-medium leading-snug text-on-surface">
          {task.title}
        </span>
        {task.due_date && (
          <span className="block font-data-mono text-[12px] text-on-surface-variant">
            Due {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
        <StatusBadge status={task.status} />
        {task.priority && <PriorityBadge priority={task.priority} />}
      </span>
    </Link>
  );
}

function FileRow({
  file,
}: {
  file: ClientDashboard['recent_files'][number];
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-stack-sm py-unit transition-colors duration-150 hover:bg-row-hover">
      <div className="min-w-0 flex-1 space-y-1.5">
        <span className="flex items-center gap-1.5 font-body-sm text-[12px] font-medium text-primary">
          <Icon name="folder_open" className="text-[14px]" />
          <span className="sr-only">Project: </span>
          <span className="truncate">{file.project_title}</span>
        </span>
        <p className="truncate font-body-sm text-body-sm font-medium leading-snug text-on-surface">
          {file.name}
        </p>
        <p className="font-data-mono text-[12px] text-on-surface-variant">
          Shared{' '}
          <time dateTime={file.created_at}>{formatRelativeTime(file.created_at)}</time>
        </p>
      </div>
      {file.download_url ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => downloadNamedFile(file.download_url!, file.name).catch(() => undefined)}
        >
          <Icon name="download" className="text-[14px]" />
          Download
        </Button>
      ) : (
        <Link
          to={`/client/projects/${file.project_id}`}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded px-2.5 font-body-sm text-[13px] font-medium text-primary hover:underline focus-ring"
        >
          View
          <Icon name="chevron_right" className="text-[14px]" />
        </Link>
      )}
    </div>
  );
}

export default function ClientDashboardPage() {
  const { name } = useAuth();
  const firstName = getFirstName(name);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['client', 'dashboard'],
    queryFn: () => api<ClientDashboard>('/client/dashboard'),
  });

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) return <QueryError message="Could not load your dashboard. Refresh to try again." />;

  const projects = data?.projects ?? [];
  const tasks = data?.upcoming_tasks ?? [];
  const files = data?.recent_files ?? [];
  const hasProjects = projects.length > 0;
  const hasActivity = tasks.length > 0 || files.length > 0;

  return (
    <div className="page-stack">
      <section className="mb-stack-lg">
        <h1 className="font-display text-display text-on-surface mb-unit">
          {firstName ? `${getTimeGreeting()}, ${firstName}.` : 'Your projects'}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          {hasProjects
            ? 'Pick a project to review progress, tasks, and shared files.'
            : 'Your agency will add projects here when work begins.'}
        </p>
      </section>

      {!hasProjects ? (
        <EmptyState
          icon="folder_open"
          title="No projects yet"
          message="When your agency starts work, you'll see status updates and deliverables here."
        />
      ) : (
        <>
          <SummaryBar
            items={[
              { label: 'Active projects', value: projects.length, icon: 'folder_open' },
              { label: 'Open tasks', value: tasks.length, icon: 'task' },
              { label: 'Recent files', value: files.length, icon: 'attach_file' },
            ]}
          />

          <section aria-labelledby="client-projects-heading">
            <h2
              id="client-projects-heading"
              className="mb-stack-md font-headline-md text-headline-md font-semibold text-on-surface"
            >
              Your projects
            </h2>
            <ul className="flex flex-col gap-gutter" role="list">
              {projects.map((p) => (
                <li key={p.id}>
                  <ProjectCard
                    id={p.id}
                    title={p.title}
                    description={p.description}
                    status={p.status}
                    targetDate={p.target_date}
                  />
                </li>
              ))}
            </ul>
          </section>

          {hasActivity && (
            <section aria-labelledby="client-activity-heading" className="space-y-stack-lg">
              <h2
                id="client-activity-heading"
                className="font-headline-md text-headline-md font-semibold text-on-surface"
              >
                Recent activity
              </h2>

              <div className="grid gap-gutter lg:grid-cols-2">
                <div className="card-surface overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-outline-variant p-stack-sm text-on-surface-variant">
                    <Icon name="task" />
                    <h3 className="font-body-sm text-body-sm font-semibold">Upcoming tasks</h3>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="px-stack-sm py-6 text-center font-body-sm text-body-sm text-on-surface-variant">
                      No open tasks right now.
                    </p>
                  ) : (
                    <ul role="list">
                      {tasks.map((t, i) => (
                        <li key={t.id} className={cn(i > 0 && 'border-t border-outline-variant')}>
                          <TaskRow task={t} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="card-surface overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-outline-variant p-stack-sm text-on-surface-variant">
                    <Icon name="attach_file" />
                    <h3 className="font-body-sm text-body-sm font-semibold">Recent files</h3>
                  </div>
                  {files.length === 0 ? (
                    <p className="px-stack-sm py-6 text-center font-body-sm text-body-sm text-on-surface-variant">
                      No files shared yet.
                    </p>
                  ) : (
                    <ul role="list">
                      {files.map((f, i) => (
                        <li key={f.id} className={cn(i > 0 && 'border-t border-outline-variant')}>
                          <FileRow file={f} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
