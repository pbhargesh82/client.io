import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProjectStat = {
  label: string;
  value: string | number;
  icon: string;
};

export function AdminProjectHeader({
  title,
  status,
  archived,
  description,
  client,
  stats,
  onEdit,
  backTo = '/projects',
  backLabel = 'All projects',
}: {
  title: string;
  status: string;
  archived?: boolean;
  description?: string | null;
  client?: { id: string; name: string; company?: string | null };
  stats: ProjectStat[];
  onEdit: () => void;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <section className="card-surface overflow-hidden">
      <div className="relative border-b border-outline-variant px-stack-md py-stack-md sm:px-stack-lg sm:py-stack-lg">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/90 to-transparent"
          aria-hidden
        />
        <Link
          to={backTo}
          className="relative mb-stack-md inline-flex w-fit items-center gap-1.5 rounded font-body-sm text-body-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-ring"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          {backLabel}
        </Link>

        <div className="relative flex flex-col gap-stack-md lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-[0_4px_14px_rgba(15,23,42,0.28)] ring-2 ring-secondary-container/70 ring-offset-2 ring-offset-card"
              aria-hidden
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/25" />
              <Icon name="folder_open" className="relative text-[26px] text-primary-foreground" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
                <StatusBadge status={status} />
                {archived && (
                  <span className="rounded bg-surface-container-highest px-2 py-0.5 font-body-sm text-[11px] font-medium text-on-surface-variant">
                    Archived
                  </span>
                )}
              </div>

              {client && (
                <Link
                  to={`/clients?client=${client.id}`}
                  className="inline-flex items-center gap-1.5 rounded-sm font-body-sm text-body-sm font-medium text-primary hover:underline focus-ring"
                >
                  <Icon name="group" className="text-[16px]" />
                  {client.name}
                  {client.company && (
                    <span className="font-normal text-on-surface-variant">· {client.company}</span>
                  )}
                </Link>
              )}

              {description && (
                <p className="max-w-prose font-body-sm text-body-sm text-on-surface-variant">{description}</p>
              )}
            </div>
          </div>

          <Button variant="outline" onClick={onEdit} className="shrink-0 gap-2 self-start">
            <Icon name="edit" className="text-[18px]" />
            Edit project
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-gutter p-stack-md sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-lg bg-surface-container-low/60 px-3 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
              <Icon name={stat.icon} className="text-[18px] text-on-surface-variant" />
            </div>
            <div className="min-w-0">
              <dt className="font-label-caps text-label-caps text-on-surface-variant">{stat.label}</dt>
              <dd className="mt-0.5 font-headline-md text-headline-md font-semibold tabular-nums text-on-surface">
                {stat.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProjectJumpNav({
  taskCount,
  fileCount,
  className,
}: {
  taskCount: number;
  fileCount: number;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        'sticky top-header-mobile z-10 -mx-margin-page flex gap-1 border-b border-outline-variant bg-surface px-margin-page py-2 md:top-0 lg:hidden',
        className
      )}
      aria-label="Project sections"
    >
      <a
        href="#project-tasks"
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 font-body-sm text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-row-hover hover:text-on-surface"
      >
        <Icon name="task" className="text-[14px]" />
        Tasks ({taskCount})
      </a>
      <a
        href="#project-files"
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 font-body-sm text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-row-hover hover:text-on-surface"
      >
        <Icon name="attach_file" className="text-[14px]" />
        Files ({fileCount})
      </a>
    </nav>
  );
}

export function ProjectWorkspace({
  tasks,
  files,
  className,
}: {
  tasks: ReactNode;
  files: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-gutter lg:grid-cols-[minmax(0,1fr)_min(100%,280px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_320px]',
        className
      )}
    >
      <div
        id="project-tasks"
        className="min-w-0 scroll-mt-[calc(var(--spacing-header-mobile)+3.5rem)] md:scroll-mt-14 lg:scroll-mt-4"
      >
        {tasks}
      </div>
      <aside
        id="project-files"
        className="card-surface scroll-mt-[calc(var(--spacing-header-mobile)+3.5rem)] p-stack-md md:scroll-mt-14 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:scroll-mt-4 lg:overflow-y-auto"
      >
        {files}
      </aside>
    </div>
  );
}

export function ProjectSectionTitle({
  id,
  icon,
  title,
  count,
  className,
  action,
}: {
  id: string;
  icon: string;
  title: string;
  count: number;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn('mb-stack-md flex items-center justify-between gap-3', className)}>
      <h2 id={id} className="flex items-center gap-unit font-headline-md text-headline-md font-semibold text-on-surface">
        <Icon name={icon} className="text-[20px] text-on-surface-variant" />
        {title}
        <span className="font-normal text-on-surface-variant">({count})</span>
      </h2>
      {action}
    </div>
  );
}
