import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('username'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const value = useMemo(
    () => ({
      user,
      token,
      isAdmin: Boolean(token),
      async login(username, password) {
        const data = await api.login({ username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUser(data.username);
      },
      logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUser(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
