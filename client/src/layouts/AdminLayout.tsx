import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, buttonVariants } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icon } from '@/components/ui/icon';
import { SidebarBrand } from '@/components/app/sidebar-brand';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/clients', label: 'Clients', icon: 'group' },
  { to: '/projects', label: 'Projects', icon: 'folder_open' },
];

function NavItem({
  to,
  icon,
  label,
  active,
  onNavigate,
}: {
  to: string;
  icon: string;
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
      <Icon name={icon} className="shrink-0 text-[18px]" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { name, signOut } = useAuth();
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CS';

  return (
    <div className="flex h-full w-full flex-col">
      <SidebarBrand portalLabel="Admin Portal" />

      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-4 pb-3"
        aria-label="Admin navigation"
      >
        {nav.map(({ to, label, icon }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
          return (
            <NavItem
              key={to}
              to={to}
              icon={icon}
              label={label}
              active={active}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-outline-variant bg-surface-container-low px-3 py-3">
        <ButtonLink
          to="/clients?create=1"
          className={cn(buttonVariants({ variant: 'default', size: 'default' }), 'w-full')}
          onClick={onNavigate}
        >
          Invite Client
        </ButtonLink>
        <div className="flex items-center gap-2 rounded-lg px-1 py-1">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-surface-container-highest text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body-sm text-body-sm font-medium text-on-surface">{name}</p>
            <p className="truncate font-body-sm text-[12px] text-on-surface-variant">Administrator</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => signOut()} aria-label="Sign out">
            <Icon name="logout" className="text-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AppFooter() {
  return (
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
  );
}

export default function AdminLayout() {
  const { name } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CS';

  return (
    <div className="flex min-h-screen overflow-x-clip bg-background">
      <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 shrink-0 border-r border-outline-variant bg-surface-container-low md:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex h-header-mobile items-center justify-between border-b border-outline-variant bg-surface px-4 md:hidden">
          <SidebarBrand portalLabel="Admin Portal" compact className="border-0 px-0 py-0" />
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

        <AppFooter />
      </div>
    </div>
  );
}
