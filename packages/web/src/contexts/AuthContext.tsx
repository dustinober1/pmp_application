'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '@pmp/shared';
import { apiRequest } from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    void hydrate();
  }, []);

  const hydrate = async () => {
    try {
      const response = await apiRequest<{ user: UserProfile }>('/auth/me');
      const user = response.data?.user || null;

      setState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await apiRequest<{ user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: { email, password, rememberMe },
    });

    const user = response.data?.user || null;
    setState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    });
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await apiRequest<{ user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });

    const user = response.data?.user || null;
    setState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    });
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const refreshToken = async () => {
    try {
      await apiRequest('/auth/refresh', { method: 'POST' });
      await hydrate();
    } catch {
      await logout();
    }
  };

  const refreshUser = async () => {
    await hydrate();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
