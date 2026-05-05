'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

import { supabase } from './supabase';

export type UserRole = 'guest' | 'user' | 'admin';

type AuthState = {
  role: UserRole;
  email: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('guest');
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount and listen to Supabase auth changes
  useEffect(() => {
    let isMounted = true;

    // Check Admin session first (Hardcoded Login)
    const savedRole = sessionStorage.getItem('titik_role') as UserRole | null;
    const savedEmail = sessionStorage.getItem('titik_email');
    
    if (savedRole === 'admin') {
      setRole('admin');
      setEmail(savedEmail);
      setIsLoading(false);
    } else {
      // Check Supabase session (User Login)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (isMounted) {
          if (session) {
            setRole('user');
            setEmail(session.user.email ?? null);
          } else {
            setRole('guest');
            setEmail(null);
          }
          setIsLoading(false);
        }
      });
    }

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't override admin session
      if (sessionStorage.getItem('titik_role') === 'admin') return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) {
          setRole('user');
          setEmail(session.user.email ?? null);
        }
      } else if (event === 'SIGNED_OUT') {
        setRole('guest');
        setEmail(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (loginEmail: string, loginPassword: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login gagal' };
      }

      const userRole: UserRole = data.role;
      setRole(userRole);
      setEmail(loginEmail);
      sessionStorage.setItem('titik_role', userRole);
      sessionStorage.setItem('titik_email', loginEmail);

      return { success: true };
    } catch {
      return { success: false, error: 'Terjadi kesalahan jaringan' };
    }
  }, []);

  const logout = useCallback(async () => {
    // Clear Admin session
    sessionStorage.removeItem('titik_role');
    sessionStorage.removeItem('titik_email');
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    setRole('guest');
    setEmail(null);
  }, []);

  return (
    <AuthContext.Provider value={{ role, email, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
