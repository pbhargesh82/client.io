import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, buttonVariants } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-0.5 px-3" aria-label="Main">
      {nav.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { name, signOut } = useAuth();
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CS';

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground">
          CS
        </div>
        <div className="leading-none">
          <p className="text-[13px] font-semibold">ClientSpace</p>
          <p className="mt-0.5 text-[11px] text-sidebar-foreground/50">Admin</p>
        </div>
      </div>

      <div className="flex-1 py-4">
        <NavLinks onNavigate={onNavigate} />
        <div className="mt-6 px-3">
          <ButtonLink
            to="/projects/new"
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
            )}
            onClick={onNavigate}
          >
            New project
          </ButtonLink>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-sidebar-accent text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{name}</p>
            <p className="text-[11px] text-sidebar-foreground/50">Administrator</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => signOut()}
            aria-label="Sign out"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border md:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
          <Sheet>
            <SheetTrigger
              className={buttonVariants({ variant: 'outline', size: 'icon-sm' })}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold">ClientSpace</span>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
