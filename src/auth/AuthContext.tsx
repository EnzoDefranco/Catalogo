import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

type Ctx = { logged: boolean; loading: boolean; login:(u:string,p:string)=>Promise<void>; logout:()=>Promise<void>; };
const AuthCtx = createContext<Ctx>({} as Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  // chequeo inicial
  useEffect(() => {
    api('/me.php')
      .then(() => setLogged(true))
      .catch(() => setLogged(false))
      .finally(() => setLoading(false));
  }, []);

  // 👇 si el server devuelve 401 en cualquier request, forzamos logout
  useEffect(() => {
    const h = () => setLogged(false);
    window.addEventListener('auth:unauthorized', h);
    return () => window.removeEventListener('auth:unauthorized', h);
  }, []);

  const login  = async (u:string,p:string) => { await api('/login.php', { method:'POST', body: JSON.stringify({ username:u, password:p }) }); setLogged(true); };
  const logout = async () => { try { await api('/logout.php', { method:'POST' }); } catch {} setLogged(false); };

  return <AuthCtx.Provider value={{ logged, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
