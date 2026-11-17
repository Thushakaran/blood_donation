import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('username'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'ADMIN');
  const [hospitalName, setHospitalName] = useState(() => localStorage.getItem('hospitalName') || '');

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('hospitalName');
    setToken(null);
    setUser(null);
    setRole('ADMIN');
    setHospitalName('');
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearSession]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    api
      .me()
      .then((data) => {
        if (!active || !data?.username) return;
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role || 'ADMIN');
        if (data.hospitalName) localStorage.setItem('hospitalName', data.hospitalName);
        else localStorage.removeItem('hospitalName');
        setUser(data.username);
        setRole(data.role || 'ADMIN');
        setHospitalName(data.hospitalName || '');
      })
      .catch(() => {
        if (active) clearSession();
      });
    return () => {
      active = false;
    };
  }, [token, clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      hospitalName,
      isAdmin: Boolean(token),
      isSuperAdmin: Boolean(token) && role === 'SUPERADMIN',
      async login(username, password) {
        const data = await api.login({ username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        if (data.hospitalName) localStorage.setItem('hospitalName', data.hospitalName);
        else localStorage.removeItem('hospitalName');
        setToken(data.token);
        setUser(data.username);
        setRole(data.role);
        setHospitalName(data.hospitalName || '');
      },
      logout: clearSession,
    }),
    [user, token, role, hospitalName, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
