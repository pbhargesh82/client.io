import { useId, useRef, useState, type ReactNode } from 'react';
import type { TaskPriority, TaskStatus } from '@clientspace/shared';
import { PriorityBadge } from '@/components/app/priority-badge';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarRange, Loader2, Plus } from 'lucide-react';

const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

const priorityChip: Record<TaskPriority, string> = {
  Low: 'data-[active=true]:bg-muted data-[active=true]:text-foreground',
  Medium: 'data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground',
  High: 'data-[active=true]:bg-primary/15 data-[active=true]:text-primary',
  Urgent: 'data-[active=true]:bg-destructive/15 data-[active=true]:text-destructive',
};

const statusChip: Record<TaskStatus, string> = {
  'To Do': 'data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground',
  'In Progress': 'data-[active=true]:bg-primary/15 data-[active=true]:text-primary',
  Done: 'data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-800',
};

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-active={active}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-md border border-transparent px-2.5 py-1 text-[12px] font-medium transition-colors duration-150',
        'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </button>
  );
}

function formatPreviewDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TaskCreateForm({
  onSubmit,
  pending,
}: {
  onSubmit: (task: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    start_date?: string;
    due_date?: string;
  }) => void;
  pending?: boolean;
}) {
  const formId = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const canSubmit = title.trim().length > 0 && !pending;
  const dateWarning =
    startDate && endDate && startDate > endDate
      ? 'End date should be on or after the start date.'
      : null;

  const reset = () => {
    setTitle('');
    setDescription('');
    setShowDescription(false);
    setStatus('To Do');
    setPriority('Medium');
    setStartDate('');
    setEndDate('');
    titleRef.current?.focus();
  };

  const submit = () => {
    if (!canSubmit || dateWarning) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      start_date: startDate || undefined,
      due_date: endDate || undefined,
    });
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  const showPreview = title.trim().length > 0;

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="mb-6 overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow duration-150 focus-within:ring-2 focus-within:ring-ring/40 focus-within:ring-offset-2"
      aria-labelledby={`${formId}-label`}
    >
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Plus className="size-3.5" aria-hidden />
        </span>
        <p id={`${formId}-label`} className="text-sm font-semibold">
          New task
        </p>
        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
          ⌘↵ to save
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="h-10 border-0 bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0"
            aria-label="Task title"
            autoComplete="off"
          />
          {!showDescription ? (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Add description
            </button>
          ) : (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, acceptance criteria, links…"
              rows={3}
              className="resize-y text-[13px]"
              aria-label="Task description"
              autoFocus
            />
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Task status">
              {TASK_STATUSES.map((s) => (
                <Chip
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                  className={statusChip[s]}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">Priority</p>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Task priority">
              {TASK_PRIORITIES.map((p) => (
                <Chip
                  key={p}
                  active={priority === p}
                  onClick={() => setPriority(p)}
                  className={priorityChip[p]}
                >
                  {p}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
              <CalendarRange className="size-3.5" aria-hidden />
              Schedule
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-auto min-w-[9.5rem]"
                aria-label="Start date"
              />
              <span className="text-[13px] text-muted-foreground" aria-hidden>
                to
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-auto min-w-[9.5rem]"
                aria-label="End date"
              />
            </div>
            {dateWarning && (
              <p className="mt-1.5 text-[12px] text-destructive" role="alert">
                {dateWarning}
              </p>
            )}
          </div>
        </div>

        {showPreview && (
          <div
            className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border bg-muted/25 px-3 py-2"
            aria-live="polite"
          >
            <span className="text-[12px] text-muted-foreground">Preview</span>
            <span className="text-[13px] font-medium">{title.trim()}</span>
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
            {startDate && endDate && !dateWarning && (
              <span className="text-[12px] text-muted-foreground">
                {formatPreviewDate(startDate)} – {formatPreviewDate(endDate)}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={pending || (!title && !description && !startDate && !endDate)}
          >
            Clear
          </Button>
          <Button type="submit" disabled={!canSubmit || !!dateWarning}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Adding…
              </>
            ) : (
              'Add task'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
