import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Panel({
  title,
  titleId,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  titleId?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const id = titleId ?? `panel-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section className={cn('overflow-hidden rounded-lg border bg-card shadow-sm', className)} aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <h2 id={id} className="text-sm font-semibold">
          {title}
        </h2>
        {action}
      </div>
      <div className={cn('p-4', bodyClassName)}>{children}</div>
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
    <section className={cn('max-w-lg rounded-lg border bg-card', className)}>
      {(title || description) && (
        <div className="border-b px-4 py-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
