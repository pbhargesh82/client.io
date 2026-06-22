import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 text-center">
      <p className="text-7xl font-semibold tabular-nums tracking-tighter text-muted-foreground/20">404</p>
      <div className="space-y-2">
        <h1>Page not found</h1>
        <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <ButtonLink to="/" variant="outline">
        <ArrowLeft className="size-4" />
        Go home
      </ButtonLink>
    </div>
  );
}
