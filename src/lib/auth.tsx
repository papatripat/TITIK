'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type AuthContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

const STORAGE_KEY = 'titik_admin';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setIsAdmin(true);
        setAdminPassword(stored);
      }
    } catch {
      // sessionStorage not available (SSR)
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAdmin(true);
        setAdminPassword(password);
        try {
          sessionStorage.setItem(STORAGE_KEY, password);
        } catch {
          // ignore
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Login gagal' };
    } catch {
      return { success: false, error: 'Koneksi gagal. Coba lagi.' };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    setAdminPassword(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Get the stored admin password for API calls.
 * Call this from components that need to make authenticated requests.
 */
export function getAdminPassword(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
