import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

// Who is logged in. The login itself lives in an httpOnly cookie set by the server.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then((r) => setUser(r.user)).catch(() => {}).finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const { user: signedIn } = await api.login({ email, password });
    setUser(signedIn);
    return signedIn;
  };
  const register = async (name, email, password) => setUser((await api.register({ name, email, password })).user);
  const logout = async () => {
    await api.logout().catch(() => {});
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
