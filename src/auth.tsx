import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, tokenStore } from './api';
import { clearMode, demoForced, getMode, setMode } from './mode';

interface AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  startDemo: () => void;
  logout: () => void;
}

const DEMO_TOKEN = 'demo-session';

function initialToken(): string | null {
  const stored = tokenStore.get();
  if (demoForced) return stored;
  return getMode() === 'demo' ? DEMO_TOKEN : stored;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(initialToken);

  const login = useCallback(async (email: string, password: string) => {
    setMode(demoForced ? 'demo' : 'live');
    const { accessToken } = await api<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    tokenStore.set(accessToken);
    setToken(accessToken);
  }, []);

  // Demo: sample data that stays in this browser; nothing is sent to the server.
  const startDemo = useCallback(() => {
    setMode('demo');
    setToken(DEMO_TOKEN);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    clearMode();
    setToken(null);
  }, []);

  // api.ts fires this event when the server rejects our token.
  useEffect(() => {
    const handleUnauthorized = () => setToken(null);
    window.addEventListener('kosku:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('kosku:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated: token !== null, login, startDemo, logout }),
    [token, login, startDemo, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
