/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { AuthContextType, User } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isInitializing, setIsInitializing] = useState(true);

  const clearAuth = (redirectToLogin: boolean) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);

    if (redirectToLogin && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  const syncUserFromToken = async (activeToken: string) => {
    localStorage.setItem('token', activeToken);
    setToken(activeToken);

    const response = await api.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });

    localStorage.setItem('user', JSON.stringify(response.data));
    setUser(response.data);
  };

  const login = async (newToken: string) => {
    await syncUserFromToken(newToken);
  };

  const logout = () => {
    clearAuth(true);
  };

  useEffect(() => {
    const boot = async () => {
      const savedToken = localStorage.getItem('token');

      if (!savedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        await syncUserFromToken(savedToken);
      } catch {
        clearAuth(false);
      } finally {
        setIsInitializing(false);
      }
    };

    void boot();
  }, []);

  useEffect(() => {
    const handler = () => {
      clearAuth(true);
    };

    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      login,
      logout,
    }),
    [user, token, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};