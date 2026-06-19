'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@casevault/types';
import * as api from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────
type AuthUser = Pick<User, 'id' | 'email'>;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Attempt silent refresh on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { accessToken } = await api.refreshToken();
        if (cancelled) return;
        api.setAccessToken(accessToken);
        // Decode user from token payload (JWT)
        const payload = JSON.parse(atob(accessToken.split('.')[1])) as {
          id: string;
          email: string;
        };
        setUser({ id: payload.id, email: payload.email });
      } catch {
        // Not authenticated — that's fine
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    api.setAccessToken(res.accessToken);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await api.register({ email, password });
      api.setAccessToken(res.accessToken);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await api.logout();
    api.clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
