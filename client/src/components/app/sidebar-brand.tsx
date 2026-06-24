import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export function SidebarBrand({
  portalLabel,
  className,
  compact,
}: {
  portalLabel: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn('relative shrink-0 border-b border-outline-variant px-4 py-4', className)}>
      {!compact && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent"
          aria-hidden
        />
      )}
      <div className="relative flex items-center gap-3">
        <div
          className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-[0_4px_14px_rgba(15,23,42,0.28)] ring-2 ring-secondary-container/70 ring-offset-2 ring-offset-surface-container-low"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/25" />
          <Icon name="layers" className="relative text-[22px] text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-headline-md text-headline-md font-semibold leading-none tracking-tight text-primary">
            ClientSpace
          </p>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-secondary-container/70 px-2.5 py-0.5 font-label-caps text-[10px] tracking-[0.1em] text-on-secondary-container">
            <span className="size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
            {portalLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
