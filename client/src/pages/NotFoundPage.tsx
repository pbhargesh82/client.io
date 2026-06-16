import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-4 text-center">
      <p className="text-6xl font-semibold tracking-tight text-muted-foreground/25">404</p>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 max-w-sm text-[13px] text-muted-foreground">
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
