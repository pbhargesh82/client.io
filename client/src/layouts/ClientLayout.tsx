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
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link to="/client/dashboard" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-[11px] font-semibold tracking-tight text-primary-foreground">
              CS
            </span>
            <span className="text-sm font-semibold tracking-tight">Your projects</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-[13px] text-muted-foreground sm:inline">
              {firstName ?? name}
            </span>
            <Avatar className="size-8">
              <AvatarFallback className="bg-muted text-[10px] font-medium">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon-sm" onClick={() => signOut()} aria-label="Sign out">
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
