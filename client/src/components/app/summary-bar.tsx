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
        className={cn('h-[4.5rem] animate-pulse rounded-lg border bg-muted/30', className)}
        aria-busy="true"
        aria-label="Loading summary"
      />
    );
  }

  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4',
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            'flex flex-col gap-0.5 bg-card px-4 py-3.5',
            index === 0 && 'rounded-tl-lg sm:rounded-bl-lg',
            index === 1 && 'rounded-tr-lg sm:rounded-none',
            index === items.length - 2 && 'sm:rounded-none',
            index === items.length - 1 && 'rounded-br-lg rounded-bl-lg sm:rounded-tr-lg sm:rounded-bl-none'
          )}
        >
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn(
              'text-2xl font-semibold tabular-nums tracking-tight',
              item.emphasis === 'alert' && item.value > 0 && 'text-destructive'
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
