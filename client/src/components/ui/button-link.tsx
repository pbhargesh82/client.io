import type { ComponentProps } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

type ButtonLinkProps = LinkProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

/** Router link styled as a button. Use instead of `<Button asChild><Link /></Button>`. */
export function ButtonLink({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Link>
  );
}

type ButtonAnchorProps = ComponentProps<'a'> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

/** External link styled as a button. */
export function ButtonAnchor({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonAnchorProps) {
  return (
    <a className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </a>
  );
}
