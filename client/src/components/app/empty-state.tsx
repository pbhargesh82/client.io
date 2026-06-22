import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center py-14 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
          <Icon className="size-[18px] text-muted-foreground" strokeWidth={1.75} />
        </div>
      )}
      {title && <p className="text-sm font-semibold tracking-tight">{title}</p>}
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
