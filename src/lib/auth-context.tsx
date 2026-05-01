'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

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

  // Restore session on mount
  useEffect(() => {
    const savedRole = sessionStorage.getItem('titik_role') as UserRole | null;
    const savedEmail = sessionStorage.getItem('titik_email');
    if (savedRole && savedRole !== 'guest') {
      setRole(savedRole);
      setEmail(savedEmail);
    }
    setIsLoading(false);
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

  const logout = useCallback(() => {
    setRole('guest');
    setEmail(null);
    sessionStorage.removeItem('titik_role');
    sessionStorage.removeItem('titik_email');
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
