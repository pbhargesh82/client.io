import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Download, FolderKanban, ListTodo, Paperclip } from 'lucide-react';
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
import { ButtonAnchor } from '@/components/ui/button-link';
import { cn } from '@/lib/utils';

function ClientSummary({
  projectCount,
  taskCount,
  fileCount,
}: {
  projectCount: number;
  taskCount: number;
  fileCount: number;
}) {
  const items = [
    { label: 'Active projects', value: projectCount },
    { label: 'Open tasks', value: taskCount },
    { label: 'Recent files', value: fileCount },
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3.5 first:rounded-l-lg last:rounded-r-lg">
          <dt className="text-[12px] text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionHeading({
  id,
  title,
  description,
}: {
  id?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 space-y-1">
      <h2 id={id} className="text-sm font-semibold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

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
        'group flex items-start justify-between gap-4 rounded-lg border border-border/80 bg-card p-4 sm:p-5',
        'transition-colors duration-150 hover:border-border hover:bg-row-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold tracking-tight">{title}</span>
          <StatusBadge status={status} />
        </span>
        {description && (
          <span className="block text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </span>
        )}
        {targetDate && (
          <span className="block text-[12px] text-muted-foreground">
            Target {new Date(targetDate).toLocaleDateString()}
          </span>
        )}
      </span>
      <ChevronRight
        className="mt-0.5 size-4 shrink-0 text-muted-foreground/35 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
        aria-hidden
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
      className={cn(
        'group flex items-start justify-between gap-3 px-4 py-3.5',
        'interactive-row'
      )}
    >
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary">
          <FolderKanban className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span className="sr-only">Project: </span>
          <span className="truncate">{task.project_title}</span>
        </span>
        <span className="block text-[13px] font-medium leading-snug text-foreground">
          {task.title}
        </span>
        {task.due_date && (
          <span className="block text-[12px] text-muted-foreground">
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
    <div className="flex items-start justify-between gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-row-hover">
      <div className="min-w-0 flex-1 space-y-1.5">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary">
          <FolderKanban className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span className="sr-only">Project: </span>
          <span className="truncate">{file.project_title}</span>
        </span>
        <p className="truncate text-[13px] font-medium leading-snug text-foreground">{file.name}</p>
        <p className="text-[12px] text-muted-foreground">
          Shared{' '}
          <time dateTime={file.created_at}>{formatRelativeTime(file.created_at)}</time>
        </p>
      </div>
      {file.download_url ? (
        <ButtonAnchor
          variant="outline"
          size="sm"
          href={file.download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Download className="size-3.5" aria-hidden />
          Download
        </ButtonAnchor>
      ) : (
        <Link
          to={`/client/projects/${file.project_id}`}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View
          <ChevronRight className="size-3.5" aria-hidden />
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
      <header className="space-y-2 pb-2">
        <h1>{firstName ? `${getTimeGreeting()}, ${firstName}` : 'Your projects'}</h1>
        <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground md:text-sm">
          {hasProjects
            ? 'Pick a project to review progress, tasks, and shared files.'
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
        <>
          <ClientSummary
            projectCount={projects.length}
            taskCount={tasks.length}
            fileCount={files.length}
          />

          <section aria-labelledby="client-projects-heading">
            <SectionHeading
              id="client-projects-heading"
              title="Your projects"
              description="Open a project to see tasks, files, and leave comments."
            />
            <ul className="flex flex-col gap-3" role="list">
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
            <section aria-labelledby="client-activity-heading" className="space-y-8">
              <SectionHeading
                id="client-activity-heading"
                title="Recent activity"
                description="Each item shows its project first, then the task or file name."
              />

              <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <ListTodo className="size-4" aria-hidden />
                    <h3 className="text-[13px] font-medium">Upcoming tasks</h3>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center text-[13px] text-muted-foreground">
                      No open tasks right now.
                    </p>
                  ) : (
                    <ul className="rounded-lg border bg-card" role="list">
                      {tasks.map((t, i) => (
                        <li
                          key={t.id}
                          className={cn(i > 0 && 'border-t border-border/80')}
                        >
                          <TaskRow task={t} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <Paperclip className="size-4" aria-hidden />
                    <h3 className="text-[13px] font-medium">Recent files</h3>
                  </div>
                  {files.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-center text-[13px] text-muted-foreground">
                      No files shared yet.
                    </p>
                  ) : (
                    <ul className="rounded-lg border bg-card" role="list">
                      {files.map((f, i) => (
                        <li
                          key={f.id}
                          className={cn(i > 0 && 'border-t border-border/80')}
                        >
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
