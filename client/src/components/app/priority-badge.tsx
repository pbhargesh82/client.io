import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskPriority } from '@clientspace/shared';

const styles: Record<TaskPriority, string> = {
  Low: 'border-transparent bg-muted text-muted-foreground',
  Medium: 'border-transparent bg-secondary text-secondary-foreground',
  High: 'border-transparent bg-primary/10 text-primary',
  Urgent: 'border-transparent bg-destructive/10 text-destructive',
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium', styles[priority], className)}>
      {priority}
    </Badge>
  );
}
