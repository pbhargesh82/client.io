import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  Planning: 'border-transparent bg-secondary text-secondary-foreground',
  'In Progress': 'border-transparent bg-primary/10 text-primary',
  Review: 'border-transparent bg-accent/15 text-accent-foreground',
  Done: 'border-transparent bg-emerald-500/10 text-emerald-800',
  'To Do': 'border-transparent bg-secondary text-secondary-foreground',
  Active: 'border-transparent bg-emerald-500/10 text-emerald-800',
  Inactive: 'border-transparent bg-muted text-muted-foreground',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium', styles[status], className)}>
      {status}
    </Badge>
  );
}
