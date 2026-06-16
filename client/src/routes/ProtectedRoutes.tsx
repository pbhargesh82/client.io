import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/app/loading';

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
