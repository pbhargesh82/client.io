import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Icon name="progress_activity" className="animate-spin text-[24px] text-on-surface-variant" label="Loading" />
    </div>
  );
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded" />
      ))}
    </div>
  );
}
