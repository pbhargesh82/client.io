import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export function AdminRoute() {
  const { session, role, loading } = useAuth();
  if (loading || (session && !role)) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/client/dashboard" replace />;
  return <Outlet />;
}

export function ClientRoute() {
  const { session, role, loading } = useAuth();
  if (loading || (session && !role)) return <LoadingScreen />;
  if (!session) return <Navigate to="/client/login" replace />;
  if (role !== 'client') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function GuestRoute({ redirectTo }: { redirectTo: string }) {
  const { session, role, loading } = useAuth();
  if (loading || (session && !role)) return <LoadingScreen />;
  if (session && role) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
