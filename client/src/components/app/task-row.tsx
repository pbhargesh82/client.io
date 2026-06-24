import type { MouseEvent } from 'react';
import type { Task } from '@clientspace/shared';
import { PriorityBadge } from '@/components/app/priority-badge';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

function formatDueDate(due: string | null): string | null {
  if (!due) return null;
  return new Date(due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function TaskReorderButtons({
  task,
  idx,
  total,
  onMoveTask,
}: {
  task: Task;
  idx: number;
  total: number;
  onMoveTask: (taskId: string, direction: 'up' | 'down') => void;
}) {
  return (
    <div className="flex shrink-0 flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          onMoveTask(task.id, 'up');
        }}
        disabled={idx === 0}
        aria-label={`Move ${task.title} up`}
      >
        <Icon name="expand_less" className="text-[16px]" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          onMoveTask(task.id, 'down');
        }}
        disabled={idx === total - 1}
        aria-label={`Move ${task.title} down`}
      >
        <Icon name="expand_more" className="text-[16px]" />
      </Button>
    </div>
  );
}

function TaskCard({
  task,
  active,
  onTaskClick,
  showReorder,
  idx,
  total,
  onMoveTask,
}: {
  task: Task;
  active: boolean;
  onTaskClick: (taskId: string) => void;
  showReorder?: boolean;
  idx?: number;
  total?: number;
  onMoveTask?: (taskId: string, direction: 'up' | 'down') => void;
}) {
  const dueLabel = formatDueDate(task.due_date);

  return (
    <button
      type="button"
      onClick={() => onTaskClick(task.id)}
      className={cn(
        'flex w-full gap-2 rounded-lg border border-border p-3 text-left transition-colors',
        'hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action',
        active && 'bg-surface-container-low'
      )}
    >
      {showReorder && onMoveTask && idx !== undefined && total !== undefined && (
        <TaskReorderButtons task={task} idx={idx} total={total} onMoveTask={onMoveTask} />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-semibold text-on-surface">{task.title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority ?? 'Medium'} />
          {dueLabel && (
            <span className="font-data-mono text-data-mono text-on-surface-variant">{dueLabel}</span>
          )}
        </div>
      </div>
    </button>
  );
}

export function AdminTaskTable({
  tasks,
  onTaskClick,
  activeTaskId,
  onMoveTask,
  className,
}: {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  activeTaskId?: string | null;
  onMoveTask?: (taskId: string, direction: 'up' | 'down') => void;
  className?: string;
}) {
  const showReorder = !!onMoveTask;

  return (
    <div
      className={cn(
        'card-surface overflow-hidden',
        'max-h-[min(70vh,720px)] overflow-y-auto lg:max-h-[calc(100vh-15rem)]',
        className
      )}
    >
      <div className="flex flex-col gap-2 p-2 md:hidden">
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            active={activeTaskId === task.id}
            onTaskClick={onTaskClick}
            showReorder={showReorder}
            idx={idx}
            total={tasks.length}
            onMoveTask={onMoveTask}
          />
        ))}
      </div>

      <Table className="hidden w-full table-fixed md:table">
        <colgroup>
          {showReorder && <col className="w-[2.75rem]" />}
          <col className="w-auto" />
          <col className="w-[7.5rem]" />
          <col className="w-[6.5rem]" />
          <col className="w-[5.5rem]" />
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {showReorder && <TableHead className="w-[2.75rem]" />}
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, idx) => {
            const dueLabel = formatDueDate(task.due_date);
            const active = activeTaskId === task.id;

            return (
              <TableRow
                key={task.id}
                className={cn('cursor-pointer', active && 'bg-surface-container-low')}
                onClick={() => onTaskClick(task.id)}
              >
                {showReorder && onMoveTask && (
                  <TableCell className="align-middle p-0 pl-1">
                    <TaskReorderButtons
                      task={task}
                      idx={idx}
                      total={tasks.length}
                      onMoveTask={onMoveTask}
                    />
                  </TableCell>
                )}
                <TableCell className="align-middle whitespace-normal">
                  <span className="font-semibold text-on-surface">{task.title}</span>
                </TableCell>
                <TableCell className="align-middle">
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell className="align-middle">
                  <PriorityBadge priority={task.priority ?? 'Medium'} />
                </TableCell>
                <TableCell className="align-middle font-data-mono text-data-mono text-on-surface-variant">
                  {dueLabel ?? '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function ClientTaskTable({
  tasks,
  onTaskClick,
  activeTaskId,
  className,
}: {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  activeTaskId?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'card-surface overflow-hidden',
        'max-h-[min(70vh,720px)] overflow-y-auto lg:max-h-[calc(100vh-15rem)]',
        className
      )}
    >
      <div className="flex flex-col gap-2 p-2 md:hidden">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            active={activeTaskId === task.id}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <Table className="hidden w-full table-fixed md:table">
        <colgroup>
          <col className="w-auto" />
          <col className="w-[7.5rem]" />
          <col className="w-[6.5rem]" />
          <col className="w-[5.5rem]" />
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const dueLabel = formatDueDate(task.due_date);
            const active = activeTaskId === task.id;
            return (
              <TableRow
                key={task.id}
                className={cn('cursor-pointer', active && 'bg-surface-container-low')}
                onClick={() => onTaskClick(task.id)}
              >
                <TableCell className="align-middle whitespace-normal">
                  <span className="font-semibold text-on-surface">{task.title}</span>
                </TableCell>
                <TableCell className="align-middle">
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell className="align-middle">
                  <PriorityBadge priority={task.priority ?? 'Medium'} />
                </TableCell>
                <TableCell className="align-middle font-data-mono text-data-mono text-on-surface-variant">
                  {dueLabel ?? '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
