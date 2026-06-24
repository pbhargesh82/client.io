import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { AdminRoute, ClientRoute, GuestRoute } from './routes/ProtectedRoutes';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import ClientsListPage from './pages/admin/ClientsListPage';
import ClientLegacyRedirect from './pages/admin/ClientLegacyRedirect';
import ProjectsListPage from './pages/admin/ProjectsListPage';
import ProjectDetailPage from './pages/admin/ProjectDetailPage';
import ClientDashboardPage from './pages/client/DashboardPage';
import ClientProjectPage from './pages/client/ProjectPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/client/login" element={<Navigate to="/login" replace />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<AdminDashboardPage />} />
                <Route path="/clients" element={<ClientsListPage />} />
                <Route path="/clients/new" element={<Navigate to="/clients?create=1" replace />} />
                <Route path="/clients/:id" element={<ClientLegacyRedirect />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/new" element={<Navigate to="/projects?create=1" replace />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
              </Route>
            </Route>

            <Route element={<ClientRoute />}>
              <Route element={<ClientLayout />}>
                <Route path="/client/dashboard" element={<ClientDashboardPage />} />
                <Route path="/client/projects/:id" element={<ClientProjectPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
