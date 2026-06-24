import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { ClientDashboard } from '@clientspace/shared';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icon } from '@/components/ui/icon';
import { SidebarBrand } from '@/components/app/sidebar-brand';
import { cn } from '@/lib/utils';

function NavItem({
  to,
  icon,
  label,
  active,
  onNavigate,
}: {
  to: string;
  icon?: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-2 font-body-sm text-body-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
        active
          ? 'bg-white font-semibold text-on-surface shadow-sm ring-1 ring-outline-variant/60'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      )}
    >
      {icon && <Icon name={icon} className="shrink-0 text-[18px]" />}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { name, signOut } = useAuth();
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CL';

  const { data } = useQuery({
    queryKey: ['client', 'dashboard'],
    queryFn: () => api<ClientDashboard>('/client/dashboard'),
  });

  const projects = data?.projects ?? [];
  const dashboardActive = pathname === '/client/dashboard';

  return (
    <div className="flex h-full w-full flex-col">
      <SidebarBrand portalLabel="Customer Portal" />

      {/* Nav — full width within sidebar, consistent inset */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-4 pb-3" aria-label="Client navigation">
        <NavItem
          to="/client/dashboard"
          icon="dashboard"
          label="Dashboard"
          active={dashboardActive}
          onNavigate={onNavigate}
        />

        {projects.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 px-2 font-label-caps text-label-caps text-on-surface-variant">
              Projects
            </p>
            <div className="flex flex-col gap-0.5">
              {projects.map((project) => (
                <NavItem
                  key={project.id}
                  to={`/client/projects/${project.id}`}
                  icon="folder_open"
                  label={project.title}
                  active={pathname === `/client/projects/${project.id}`}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User — spans full sidebar width */}
      <div className="shrink-0 border-t border-outline-variant bg-surface-container-low px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg px-1 py-1">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-surface-container-highest text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body-sm text-body-sm font-medium text-on-surface">{name}</p>
            <p className="truncate font-body-sm text-[12px] text-on-surface-variant">Client</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => signOut()} aria-label="Sign out">
            <Icon name="logout" className="text-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ClientLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { name } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CL';

  const { data } = useQuery({
    queryKey: ['client', 'dashboard'],
    queryFn: () => api<ClientDashboard>('/client/dashboard'),
  });

  useEffect(() => {
    const projectList = data?.projects;
    if (pathname === '/client/dashboard' && projectList?.length === 1) {
      navigate(`/client/projects/${projectList[0].id}`, { replace: true });
    }
  }, [pathname, data?.projects, navigate]);

  return (
    <div className="flex min-h-screen overflow-x-clip bg-background">
      {/* Sidebar — single surface, border only on right edge */}
      <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 shrink-0 border-r border-outline-variant bg-surface-container-low md:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-header-mobile items-center justify-between border-b border-outline-variant bg-surface px-4 md:hidden">
          <SidebarBrand portalLabel="Customer Portal" compact className="border-0 px-0 py-0" />
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                aria-label="Open menu"
              >
                <Icon name="menu" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 border-0 border-r border-outline-variant bg-surface-container-low p-0"
              >
                <SidebarContent onNavigate={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            <Avatar className="size-8">
              <AvatarFallback className="bg-surface-container-highest text-[10px] font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="mx-auto w-full max-w-container-max flex-1 px-margin-page py-stack-lg">
          <Outlet />
        </main>

        <footer className="mt-auto w-full border-t border-outline-variant bg-surface">
          <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 px-margin-page py-stack-md sm:flex-row">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © {new Date().getFullYear()} ClientSpace Portal. All rights reserved.
            </p>
            <div className="flex gap-stack-md">
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary">
                Terms of Service
              </a>
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary">
                Security
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
