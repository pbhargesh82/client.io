import { cn } from '@/lib/utils';

export type SummaryItem = {
  label: string;
  value: number;
  emphasis?: 'alert';
};

export function SummaryBar({
  items,
  className,
  loading,
}: {
  items: SummaryItem[];
  className?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div
        className={cn('h-11 animate-pulse rounded-lg border bg-muted/40', className)}
        aria-busy="true"
        aria-label="Loading summary"
      />
    );
  }

  return (
    <dl
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-card px-4 py-3',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          <dt className="sr-only">{item.label}</dt>
          <dd
            className={cn(
              'text-base font-semibold tabular-nums tracking-tight',
              item.emphasis === 'alert' && item.value > 0 && 'text-destructive'
            )}
          >
            {item.value}
          </dd>
          <dd className="text-[13px] text-muted-foreground">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}
