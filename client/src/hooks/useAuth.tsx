import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { UserRole } from '@clientspace/shared';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: SupabaseUser | null;
  role: UserRole | null;
  name: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserRole>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', userId)
      .single();
    if (data) {
      setRole(data.role as UserRole);
      setName(data.name);
    } else {
      setRole(null);
      setName(null);
    }
  }

  async function applySession(sess: Session | null) {
    setSession(sess);
    if (sess?.user) {
      await loadProfile(sess.user.id);
    } else {
      setRole(null);
      setName(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setLoading(true);
      applySession(sess).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<UserRole> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session?.user) throw new Error('Login failed');

    setLoading(true);
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', data.session.user.id)
      .single();

    if (profileError || !profile?.role) {
      setLoading(false);
      throw new Error('Account not found');
    }

    setSession(data.session);
    setRole(profile.role as UserRole);
    setName(profile.name);
    setLoading(false);
    return profile.role as UserRole;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        name,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
