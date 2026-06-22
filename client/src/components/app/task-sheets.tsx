import { useEffect, useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';

const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export type NewTaskPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  due_date?: string;
};

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (d: string) => new Date(d).toLocaleDateString();
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `Starts ${fmt(start)}`;
  return `Due ${fmt(end!)}`;
}

function TaskFormFields({
  idPrefix,
  title,
  description,
  status,
  priority,
  startDate,
  dueDate,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onPriorityChange,
  onStartDateChange,
  onDueDateChange,
}: {
  idPrefix: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onStatusChange: (v: TaskStatus) => void;
  onPriorityChange: (v: TaskPriority) => void;
  onStartDateChange: (v: string) => void;
  onDueDateChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="What needs to be done?"
          className="h-9 font-medium"
          autoComplete="off"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => v && onStatusChange(v as TaskStatus)}>
            <SelectTrigger className="h-9 w-full">
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
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => v && onPriorityChange(v as TaskPriority)}>
            <SelectTrigger className="h-9 w-full">
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-start`}>Start</Label>
          <Input
            id={`${idPrefix}-start`}
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-9 w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-due`}>Due</Label>
          <Input
            id={`${idPrefix}-due`}
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="h-9 w-full"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-desc`}>Description</Label>
        <Textarea
          id={`${idPrefix}-desc`}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Scope, notes, links…"
          rows={4}
          className="min-h-[5rem] resize-y text-[13px]"
        />
      </div>
    </div>
  );
}

export function TaskCreateSheet({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: NewTaskPayload) => void;
  pending?: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const dateWarning =
    startDate && dueDate && startDate > dueDate
      ? 'Due date should be on or after the start date.'
      : null;
  const canSubmit = title.trim().length > 0 && !pending && !dateWarning;

  const reset = () => {
    setTitle('');
    setDescription('');
    setStatus('To Do');
    setPriority('Medium');
    setStartDate('');
    setDueDate('');
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      start_date: startDate || undefined,
      due_date: dueDate || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="pr-8">New task</SheetTitle>
          <SheetDescription>Add a task to this project</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <TaskFormFields
            idPrefix="create-task"
            title={title}
            description={description}
            status={status}
            priority={priority}
            startDate={startDate}
            dueDate={dueDate}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
            onStartDateChange={setStartDate}
            onDueDateChange={setDueDate}
          />
          {dateWarning && (
            <p className="mt-3 text-[12px] text-destructive" role="alert">
              {dateWarning}
            </p>
          )}
        </div>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border/80 px-5 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Creating…
              </>
            ) : (
              'Create task'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function TaskCommentsSheet({
  task,
  open,
  onOpenChange,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="truncate pr-8">{task?.title ?? 'Comments'}</SheetTitle>
          <SheetDescription>Discussion on this task</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {task && <TaskComments taskId={task.id} variant="sheet" />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TaskEditSheet({
  task,
  open,
  onOpenChange,
  onUpdate,
  pending,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<Task>) => void;
  pending?: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority ?? 'Medium');
      setStartDate(task.start_date || '');
      setDueDate(task.due_date || '');
    }
  }, [task, open]);

  const dateWarning =
    startDate && dueDate && startDate > dueDate
      ? 'Due date should be on or after the start date.'
      : null;
  const canSave = title.trim().length > 0 && !pending && !dateWarning;

  const save = () => {
    if (!task || !canSave) return;
    const updates: Partial<Task> = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim() || null;

    if (trimmedTitle !== task.title) updates.title = trimmedTitle;
    if (trimmedDescription !== (task.description ?? null)) updates.description = trimmedDescription;
    if (status !== task.status) updates.status = status;
    if (priority !== (task.priority ?? 'Medium')) updates.priority = priority;
    if (startDate !== (task.start_date || '')) updates.start_date = startDate || null;
    if (dueDate !== (task.due_date || '')) updates.due_date = dueDate || null;

    if (Object.keys(updates).length > 0) onUpdate(updates);
    onOpenChange(false);
  };

  if (!task) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md" />
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="pr-8">Edit task</SheetTitle>
          <SheetDescription className="truncate">{task.title}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <TaskFormFields
            idPrefix={`edit-task-${task.id}`}
            title={title}
            description={description}
            status={status}
            priority={priority}
            startDate={startDate}
            dueDate={dueDate}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
            onStartDateChange={setStartDate}
            onDueDateChange={setDueDate}
          />
          {dateWarning && (
            <p className="mt-3 text-[12px] text-destructive" role="alert">
              {dateWarning}
            </p>
          )}
        </div>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border/80 px-5 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={!canSave}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onOpenComments,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenComments: () => void;
}) {
  const dateRange = task ? formatDateRange(task.start_date, task.due_date) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/80 px-5 py-4 text-left">
          <SheetTitle className="truncate pr-8">{task?.title ?? 'Task'}</SheetTitle>
          {task && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority ?? 'Medium'} />
            </div>
          )}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {task && (
            <div className="space-y-4">
              {task.description ? (
                <p className="text-[13px] leading-relaxed text-foreground">{task.description}</p>
              ) : (
                <p className="text-[13px] text-muted-foreground">No description provided.</p>
              )}
              {dateRange && (
                <p className="text-[13px] text-muted-foreground">{dateRange}</p>
              )}
              <button
                type="button"
                onClick={onOpenComments}
                className="text-[13px] font-medium text-primary hover:underline"
              >
                View comments →
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
