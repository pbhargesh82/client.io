import type { Task } from '@clientspace/shared';
import { PriorityBadge } from '@/components/app/priority-badge';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDueDate(due: string | null): string | null {
  if (!due) return null;
  return new Date(due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TaskList({
  children,
  className,
  variant = 'client',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'admin' | 'client';
}) {
  const headerCols =
    variant === 'admin'
      ? 'sm:grid-cols-[2rem_minmax(0,1fr)_5.5rem_5rem_4.5rem_4.5rem]'
      : 'sm:grid-cols-[minmax(0,1fr)_5.5rem_5rem_4.5rem_4.5rem]';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border/80 bg-card',
        'max-h-[min(70vh,720px)] overflow-y-auto lg:max-h-[calc(100vh-15rem)]',
        className
      )}
    >
      <div
        className={cn(
          'sticky top-0 z-[1] hidden border-b border-border/80 bg-muted/40 px-4 py-2 text-[12px] font-medium text-muted-foreground sm:grid',
          headerCols
        )}
        aria-hidden
      >
        {variant === 'admin' && <span />}
        <span>Task</span>
        <span className="hidden md:block">Status</span>
        <span className="hidden lg:block">Priority</span>
        <span className="hidden lg:block">Due</span>
        <span className="text-right">Actions</span>
      </div>
      <ul role="list">{children}</ul>
    </div>
  );
}

const adminRowGrid =
  'grid items-center gap-x-3 px-3 py-2.5 sm:px-4 grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_5.5rem_5rem_4.5rem_4.5rem]';

const clientRowGrid =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_5.5rem_5rem_4.5rem_4.5rem] sm:px-4';

export function TaskRowAdmin({
  task,
  onEdit,
  onComments,
  reorder,
  isFirst,
  active,
}: {
  task: Task;
  onEdit: () => void;
  onComments: () => void;
  reorder?: React.ReactNode;
  isFirst?: boolean;
  active?: boolean;
}) {
  const dueLabel = formatDueDate(task.due_date);

  return (
    <li className={cn(!isFirst && 'border-t border-border/80')}>
      <div
        className={cn(
          adminRowGrid,
          'transition-colors duration-150 hover:bg-row-hover',
          active && 'bg-muted/25'
        )}
      >
        {reorder}

        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 truncate text-left text-[13px] font-medium hover:text-primary"
        >
          {task.title}
        </button>

        <div className="hidden md:flex md:items-center">
          <StatusBadge status={task.status} />
        </div>

        <div className="hidden lg:flex lg:items-center">
          <PriorityBadge priority={task.priority ?? 'Medium'} />
        </div>

        <div className="hidden text-[12px] tabular-nums text-muted-foreground lg:block">
          {dueLabel ?? '—'}
        </div>

        <div className="flex items-center justify-end gap-0.5">
          <div className="flex md:hidden">
            <StatusBadge status={task.status} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${task.title}`}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onComments}
            aria-label={`Comments on ${task.title}`}
          >
            <MessageSquare className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function TaskRowClient({
  task,
  onView,
  onComments,
  active,
}: {
  task: Task;
  onView: () => void;
  onComments: () => void;
  active?: boolean;
}) {
  const dueLabel = formatDueDate(task.due_date);

  return (
    <li className="border-t border-border/80 first:border-t-0">
      <div
        className={cn(
          clientRowGrid,
          'transition-colors duration-150 hover:bg-row-hover',
          active && 'bg-muted/25'
        )}
      >
        <button
          type="button"
          onClick={onView}
          className="min-w-0 truncate text-left text-[13px] font-medium hover:text-primary"
        >
          {task.title}
        </button>

        <div className="hidden md:flex md:items-center">
          <StatusBadge status={task.status} />
        </div>

        <div className="hidden lg:flex lg:items-center">
          <PriorityBadge priority={task.priority ?? 'Medium'} />
        </div>

        <div className="hidden text-[12px] tabular-nums text-muted-foreground lg:block">
          {dueLabel ?? '—'}
        </div>

        <div className="flex items-center justify-end gap-0.5">
          <div className="flex md:hidden">
            <StatusBadge status={task.status} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onComments}
            aria-label={`Comments on ${task.title}`}
          >
            <MessageSquare className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}
