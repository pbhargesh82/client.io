import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  eyebrow,
  children,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'mb-stack-lg flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-unit font-label-caps text-label-caps text-on-surface-variant">{eyebrow}</p>
        )}
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
        {description && (
          <p className="mt-unit max-w-2xl font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      )}
    </header>
  );
}
