import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export function ListLinkRow({
  to,
  title,
  subtitle,
  trailing,
  className,
}: {
  to: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center justify-between gap-3 rounded-lg px-stack-sm py-unit',
        'interactive-row',
        className
      )}
    >
      <span className="min-w-0">
        <span className="block truncate font-body-sm text-body-sm font-semibold text-on-surface">
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate font-body-sm text-body-sm text-on-surface-variant">
            {subtitle}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {trailing}
        <Icon
          name="chevron_right"
          className="text-on-surface-variant/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-on-surface-variant"
        />
      </span>
    </Link>
  );
}
