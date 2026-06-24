import { Icon } from '@/components/ui/icon';
import { ButtonLink } from '@/components/ui/button-link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-stack-md bg-background px-4 text-center">
      <p className="font-display text-display tabular-nums text-on-surface-variant/20">404</p>
      <div className="space-y-unit">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Page not found</h1>
        <p className="mx-auto max-w-sm font-body-sm text-body-sm text-on-surface-variant">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <ButtonLink to="/" variant="outline" className="gap-2">
        <Icon name="arrow_back" className="text-[18px]" />
        Go home
      </ButtonLink>
    </div>
  );
}
