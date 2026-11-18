import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, getToken, setToken, type User } from './api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  register: (data: Record<string, unknown>) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try { setUser((await api<{ user: User }>('/auth/me')).user); }
    catch { setToken(null); setUser(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const finish = (r: { token: string; user: User }) => { setToken(r.token); setUser(r.user); return r.user; };
  const value: AuthCtx = {
    user, loading, refresh,
    login: async (phone, password) => finish(await api('/auth/login', { method: 'POST', body: { phone, password } })),
    register: async (data) => finish(await api('/auth/register', { method: 'POST', body: data })),
    logout: () => { setToken(null); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
};
