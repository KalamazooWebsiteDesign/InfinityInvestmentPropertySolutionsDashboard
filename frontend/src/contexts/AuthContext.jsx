import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);   // { id, email, name? }
  const [role, setRole]     = useState(null);   // 'admin' | 'investor' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('iips_token');
    if (!token) { setLoading(false); return; }

    api.auth.me()
      .then(data => {
        setUser(data.user);
        setRole(data.role);
      })
      .catch(() => localStorage.removeItem('iips_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('iips_token', data.token);
    setUser(data.user);
    setRole(data.role);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('iips_token');
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin:     role === 'admin',
      isInvestor:  role === 'investor',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
