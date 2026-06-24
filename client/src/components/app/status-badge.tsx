import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  Planning: 'bg-surface-container-highest text-on-surface-variant',
  'In Progress': 'bg-[#e0e7ff] text-[#3730a3]',
  Review: 'bg-secondary-container text-on-secondary-container',
  Done: 'bg-[#dcfce7] text-[#166534]',
  'To Do': 'bg-surface-container-highest text-on-surface-variant',
  Active: 'bg-[#dcfce7] text-[#166534]',
  Inactive: 'bg-surface-container-highest text-on-surface-variant',
  Blocked: 'bg-surface-container-highest text-on-surface-variant',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = styles[status] ?? 'bg-surface-container-highest text-on-surface-variant';

  return (
    <Badge variant="outline" className={cn('border-transparent text-[11px] font-medium', style, className)}>
      {status}
    </Badge>
  );
}
