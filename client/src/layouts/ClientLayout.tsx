import { Link, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getFirstName } from '@/lib/greeting';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ClientLayout() {
  const { name, signOut } = useAuth();
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CL';
  const firstName = getFirstName(name);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/client/dashboard" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
              CS
            </span>
            <span className="text-sm font-semibold tracking-tight">Your projects</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-[13px] text-muted-foreground sm:inline">
              {firstName ?? name}
            </span>
            <Avatar className="size-7">
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon-sm" onClick={() => signOut()} aria-label="Sign out">
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
