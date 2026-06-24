import { cn } from '@/lib/utils';

export function Icon({
  name,
  className,
  fill = false,
  label,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  label?: string;
}) {
  return (
    <span
      className={cn('material-symbols-outlined inline-block leading-none', className)}
      data-fill={fill ? 'true' : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
