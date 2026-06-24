import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QueryError } from '@/components/app/query-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await signIn(email, password);
      const destination = role === 'admin' ? '/dashboard' : '/client/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_440px]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-container-low p-12 lg:flex">
        <div className="relative flex items-center gap-3">
          <div
            className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-[0_4px_14px_rgba(15,23,42,0.28)] ring-2 ring-secondary-container/70 ring-offset-2 ring-offset-surface-container-low"
            aria-hidden
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/25" />
            <Icon name="layers" className="relative text-[22px] text-primary-foreground" />
          </div>
          <p className="font-headline-md text-headline-md font-semibold tracking-tight text-primary">ClientSpace</p>
        </div>

        <div className="max-w-md space-y-stack-md">
          <p className="font-label-caps text-label-caps text-on-surface-variant">Project workspace</p>
          <h2 className="font-headline-lg text-headline-lg text-balance text-on-surface">
            One calm place for clients, projects, and delivery.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sign in with the email and password from your invite. Admins manage work; clients follow progress and
            share feedback.
          </p>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">Secure email and password access</p>
      </div>

      <div className="auth-panel">
        <div className="auth-form-card">
          <div className="mb-stack-lg flex items-center gap-3 lg:hidden">
            <div
              className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-[0_4px_14px_rgba(15,23,42,0.28)]"
              aria-hidden
            >
              <Icon name="layers" className="relative text-[22px] text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">ClientSpace</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Sign in to continue</p>
            </div>
          </div>

          <div className="mb-stack-lg hidden lg:block">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Sign in</h1>
            <p className="mt-unit font-body-sm text-body-sm text-on-surface-variant">
              Use your invite email and password
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <QueryError message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-stack-md">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
