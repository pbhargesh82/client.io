import type { Task, TaskPriority, TaskStatus } from '@clientspace/shared';
import { TaskComments } from '@/components/app/task-comments';
import { PriorityBadge } from '@/components/app/priority-badge';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';

const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (d: string) => new Date(d).toLocaleDateString();
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `Starts ${fmt(start)}`;
  return `Due ${fmt(end!)}`;
}

export function TaskRowAdmin({
  task,
  expanded,
  onToggleComments,
  onUpdate,
  reorder,
}: {
  task: Task;
  expanded: boolean;
  onToggleComments: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  reorder?: React.ReactNode;
}) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex gap-3">
        {reorder}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <Input
              defaultValue={task.title}
              onBlur={(e) => {
                if (e.target.value !== task.title) onUpdate({ title: e.target.value });
              }}
              className="h-8 max-w-md font-medium"
              aria-label="Task title"
            />
            <Select
              value={task.status}
              onValueChange={(v) => v && onUpdate({ status: v as TaskStatus })}
            >
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={task.priority ?? 'Medium'}
              onValueChange={(v) => v && onUpdate({ priority: v as TaskPriority })}
            >
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            defaultValue={task.description ?? ''}
            onBlur={(e) => {
              const val = e.target.value || null;
              if (val !== (task.description ?? '')) onUpdate({ description: val });
            }}
            placeholder="Task description…"
            rows={2}
            className="text-[13px]"
            aria-label="Task description"
          />

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-[12px] text-muted-foreground">Start</Label>
              <Input
                type="date"
                value={task.start_date || ''}
                onChange={(e) => onUpdate({ start_date: e.target.value || null })}
                className="h-8 w-auto"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] text-muted-foreground">End</Label>
              <Input
                type="date"
                value={task.due_date || ''}
                onChange={(e) => onUpdate({ due_date: e.target.value || null })}
                className="h-8 w-auto"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground"
            onClick={onToggleComments}
          >
            <MessageSquare className="size-3.5" />
            {expanded ? 'Hide comments' : 'Comments'}
          </Button>
          {expanded && <TaskComments taskId={task.id} />}
        </div>
      </div>
    </li>
  );
}

export function TaskRowClient({
  task,
  expanded,
  onToggleComments,
}: {
  task: Task;
  expanded: boolean;
  onToggleComments: () => void;
}) {
  const dateRange = formatDateRange(task.start_date, task.due_date);

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium">{task.title}</span>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority ?? 'Medium'} />
        </div>
        {task.description && (
          <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        )}
        {dateRange && <p className="text-[13px] text-muted-foreground">{dateRange}</p>}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={onToggleComments}
        >
          <MessageSquare className="size-3.5" />
          {expanded ? 'Hide comments' : 'Comments'}
        </Button>
        {expanded && <TaskComments taskId={task.id} />}
      </div>
    </li>
  );
}

