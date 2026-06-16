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
        'rounded-lg border px-4 py-3 text-[13px] leading-relaxed',
        variant === 'destructive' && 'border-destructive/25 bg-destructive/5 text-foreground',
        variant === 'info' && 'border-primary/20 bg-primary/5 text-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
