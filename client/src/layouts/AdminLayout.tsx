import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, LogOut, Menu, Plus } from 'lucide-react';
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
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Main">
      {nav.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary"
                aria-hidden
              />
            )}
            <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
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
      <div className="flex h-14 items-center gap-3 px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-[11px] font-semibold tracking-tight text-sidebar-primary-foreground">
          CS
        </div>
        <div className="leading-none">
          <p className="text-[13px] font-semibold tracking-tight">ClientSpace</p>
          <p className="mt-0.5 text-[11px] text-sidebar-foreground/45">Admin</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 py-2">
        <NavLinks onNavigate={onNavigate} />
        <div className="px-2">
          <ButtonLink
            to="/projects?create=1"
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'w-full justify-center gap-1.5 bg-sidebar-primary text-sidebar-primary-foreground shadow-none hover:bg-sidebar-primary/90'
            )}
            onClick={onNavigate}
          >
            <Plus className="size-3.5" aria-hidden />
            New project
          </ButtonLink>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-[10px] font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{name}</p>
            <p className="text-[11px] text-sidebar-foreground/45">Administrator</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md md:hidden">
          <Sheet>
            <SheetTrigger
              className={buttonVariants({ variant: 'outline', size: 'icon-sm' })}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 border-sidebar-border bg-sidebar p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold tracking-tight">ClientSpace</span>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
