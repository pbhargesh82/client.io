import type { ReactNode } from 'react';
import { ListTodo, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'sticky top-14 z-10 -mx-4 flex gap-1 border-b border-border/80 bg-background/95 px-4 py-2 backdrop-blur-md lg:hidden',
        className
      )}
      aria-label="Project sections"
    >
      <a
        href="#project-tasks"
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-row-hover hover:text-foreground"
      >
        <ListTodo className="size-3.5" aria-hidden />
        Tasks ({taskCount})
      </a>
      <a
        href="#project-files"
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-row-hover hover:text-foreground"
      >
        <Paperclip className="size-3.5" aria-hidden />
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
        'grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,280px)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_320px]',
        className
      )}
    >
      <div id="project-tasks" className="min-w-0 scroll-mt-24">
        {tasks}
      </div>
      <aside
        id="project-files"
        className="scroll-mt-24 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:rounded-lg lg:border lg:border-border/80 lg:bg-card lg:p-4"
      >
        {files}
      </aside>
    </div>
  );
}

export function ProjectSectionTitle({
  id,
  icon: Icon,
  title,
  count,
  className,
  action,
}: {
  id: string;
  icon: typeof ListTodo;
  title: string;
  count: number;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 id={id} className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        {title}
        <span className="font-normal text-muted-foreground">({count})</span>
      </h2>
      {action}
    </div>
  );
}
