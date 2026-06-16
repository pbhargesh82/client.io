import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
        'group flex items-center justify-between gap-3 rounded-md px-3 py-2.5 transition-colors duration-150',
        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium">{title}</span>
        {subtitle && (
          <span className="block truncate text-[13px] text-muted-foreground">{subtitle}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {trailing}
        <ChevronRight
          className="size-4 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
          aria-hidden
        />
      </span>
    </Link>
  );
}
