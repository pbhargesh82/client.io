import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon?: string;
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center py-14 text-center', className)}>
      {icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded border border-dashed border-outline-variant bg-surface-container-low">
          <Icon name={icon} className="text-[20px] text-on-surface-variant" />
        </div>
      )}
      {title && (
        <p className="font-body-md text-body-md font-semibold text-on-surface">{title}</p>
      )}
      <p className="mt-1.5 max-w-sm font-body-sm text-body-sm text-on-surface-variant">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
