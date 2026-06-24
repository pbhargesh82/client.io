import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AlertBanner({
  children,
  variant = 'destructive',
  className,
}: {
  children: ReactNode;
  variant?: 'destructive' | 'info';
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'rounded border px-4 py-3 font-body-sm text-body-sm',
        variant === 'destructive' && 'border-error/25 bg-error-container/30 text-on-surface',
        variant === 'info' && 'border-outline-variant bg-secondary-container/50 text-on-surface',
        className
      )}
    >
      {children}
    </div>
  );
}
