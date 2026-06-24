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
  variant?: 'default' | 'inset' | 'card';
}) {
  const id = titleId ?? `panel-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const isCard = variant === 'inset' || variant === 'card';

  return (
    <section
      className={cn('flex flex-col', isCard && 'card-surface overflow-hidden', className)}
      aria-labelledby={id}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3',
          isCard ? 'border-b border-outline-variant bg-surface-bright p-stack-md' : 'mb-4'
        )}
      >
        <h2 id={id} className="font-headline-md text-headline-md font-semibold text-on-surface">
          {title}
        </h2>
        {action}
      </div>
      <div className={cn(isCard && 'p-stack-md', bodyClassName)}>{children}</div>
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
    <section className={cn('card-surface max-w-lg overflow-hidden', className)}>
      {(title || description) && (
        <div className="border-b border-outline-variant p-stack-md">
          {title && (
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{description}</p>
          )}
        </div>
      )}
      <div className="p-stack-md">{children}</div>
    </section>
  );
}
