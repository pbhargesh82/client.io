import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Panel({
  title,
  titleId,
  action,
  children,
  className,
  bodyClassName,
  variant = 'default',
}: {
  title: string;
  titleId?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: 'default' | 'inset';
}) {
  const id = titleId ?? `panel-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section className={cn('flex flex-col', className)} aria-labelledby={id}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id} className="text-sm font-semibold tracking-tight">
          {title}
        </h2>
        {action}
      </div>
      <div
        className={cn(
          variant === 'inset' && 'rounded-lg border bg-card',
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function FormPanel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('max-w-lg rounded-lg border bg-card shadow-sm', className)}>
      {(title || description) && (
        <div className="border-b px-5 py-4">
          {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
          {description && (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
