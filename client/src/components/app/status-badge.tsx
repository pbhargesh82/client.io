import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const styles: Record<string, { badge: string; dot: string }> = {
  Planning: {
    badge: 'border-transparent bg-secondary text-secondary-foreground',
    dot: 'bg-muted-foreground',
  },
  'In Progress': {
    badge: 'border-transparent bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  Review: {
    badge: 'border-transparent bg-warning/15 text-warning-foreground',
    dot: 'bg-warning',
  },
  Done: {
    badge: 'border-transparent bg-success/10 text-success-foreground',
    dot: 'bg-success',
  },
  'To Do': {
    badge: 'border-transparent bg-secondary text-secondary-foreground',
    dot: 'bg-muted-foreground',
  },
  Active: {
    badge: 'border-transparent bg-success/10 text-success-foreground',
    dot: 'bg-success',
  },
  Inactive: {
    badge: 'border-transparent bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground/50',
  },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = styles[status] ?? {
    badge: 'border-transparent bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  };

  return (
    <Badge variant="outline" className={cn('gap-1.5 text-[11px] font-medium', style.badge, className)}>
      <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} aria-hidden />
      {status}
    </Badge>
  );
}
