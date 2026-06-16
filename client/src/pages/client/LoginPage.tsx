import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card, ErrorMessage, Input } from '../../components/ui';

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Client Portal</h1>
        <p className="mb-6 text-sm text-slate-500">View your projects and track progress</p>

        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
        {magicSent && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Magic link sent! Check your email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleMagicLink}
            className="text-sm text-indigo-600 hover:underline"
            disabled={loading}
          >
            Send magic link instead
          </button>
        </div>
      </Card>
    </div>
  );
}
