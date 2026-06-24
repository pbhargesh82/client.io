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
      <Table className="w-full table-fixed">
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
                {showReorder && (
                  <TableCell className="align-middle p-0 pl-1">
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-7"
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          onMoveTask?.(task.id, 'up');
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
                          onMoveTask?.(task.id, 'down');
                        }}
                        disabled={idx === tasks.length - 1}
                        aria-label={`Move ${task.title} down`}
                      >
                        <Icon name="expand_more" className="text-[16px]" />
                      </Button>
                    </div>
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
      <Table className="w-full table-fixed">
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
