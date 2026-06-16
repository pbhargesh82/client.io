import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function FormActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 pt-2', className)}>
      {children}
    </div>
  );
}
