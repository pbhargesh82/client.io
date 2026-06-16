import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QueryError } from '@/components/app/query-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function ClientLoginPage() {
  const { signIn, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/client/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_420px]">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary-foreground/15 text-xs font-semibold">
            CS
          </span>
          <span className="font-semibold">ClientSpace</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-balance">
            See your projects, tasks, and files in one place.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
            A simple portal to follow progress and leave feedback — no clutter, no guesswork.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/45">Client portal</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              CS
            </span>
            <h1 className="mt-4 text-xl font-semibold">Client portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">View your projects and progress</p>
          </div>
          <div className="mb-8 hidden lg:block">
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your portal credentials</p>
          </div>

          {error && <div className="mb-4"><QueryError message={error} /></div>}
          {magicSent && (
            <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-[13px] text-primary">
              Magic link sent — check your email.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px]">
                Password
              </Label>
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

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
            disabled={loading}
          >
            Email magic link
          </Button>

          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            Admin?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Admin sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
