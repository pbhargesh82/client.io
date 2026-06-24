import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export type SummaryItem = {
  label: string;
  value: number | string;
  emphasis?: 'alert';
  icon: string;
};

function summaryGridClass(count: number) {
  if (count <= 1) return '';
  if (count === 2) return 'grid-cols-2';
  if (count === 3) return 'grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 lg:grid-cols-4';
}

export function SummaryBar({
  items,
  className,
  loading,
}: {
  items: SummaryItem[];
  className?: string;
  loading?: boolean;
}) {
  const gridClass = summaryGridClass(items.length || 3);

  if (loading) {
    return (
      <div
        className={cn('grid gap-gutter', gridClass, className)}
        aria-busy="true"
        aria-label="Loading summary"
      >
        {Array.from({ length: items.length || 4 }).map((_, i) => (
          <div key={i} className="summary-card animate-pulse">
            <div className="summary-card__icon bg-surface-container-low" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-24 rounded bg-surface-container-low" />
              <div className="h-8 w-12 rounded bg-surface-container-low" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className={cn('grid gap-gutter', gridClass, className)}>
      {items.map((item) => {
        const isAlert = item.emphasis === 'alert' && item.value !== 0;

        return (
          <div key={item.label} className="summary-card">
            <div className="summary-card__icon">
              <Icon
                name={item.icon}
                className={cn('text-[20px] text-on-surface-variant', isAlert && 'text-error')}
              />
            </div>
            <div className="min-w-0">
              <dt className="summary-card__label">{item.label}</dt>
              <dd className={cn('summary-card__value', isAlert && 'text-error')}>{item.value}</dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}
