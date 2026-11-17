import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('username'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'ADMIN');
  const [hospitalName, setHospitalName] = useState(() => localStorage.getItem('hospitalName') || '');

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
      logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('hospitalName');
        setToken(null);
        setUser(null);
        setRole('ADMIN');
        setHospitalName('');
      },
    }),
    [user, token, role, hospitalName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
