import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskPriority } from '@clientspace/shared';

const styles: Record<TaskPriority, string> = {
  Low: 'bg-surface-container-highest text-on-surface-variant',
  Medium: 'bg-secondary-container text-on-secondary-container',
  High: 'bg-[#e0e7ff] text-[#3730a3]',
  Urgent: 'bg-error-container text-on-error-container',
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent text-[10px] font-semibold uppercase tracking-wider', styles[priority], className)}
    >
      {priority}
    </Badge>
  );
}
