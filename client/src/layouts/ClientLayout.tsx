import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ClientLayout() {
  const { name, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/client/dashboard" className="text-lg font-bold text-indigo-600">
            ClientSpace
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{name}</span>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
