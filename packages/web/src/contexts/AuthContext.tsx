'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  tier: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState({
          user: data.data.user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Token invalid, try refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    const { accessToken, refreshToken: refresh, user } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refresh);

    setState({
      user,
      token: accessToken,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Registration failed');
    }

    const { accessToken, refreshToken: refresh, user } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refresh);

    setState({
      user,
      token: accessToken,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const refreshToken = async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) {
      logout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });

      if (response.ok) {
        const data = await response.json();
        const { accessToken, refreshToken: newRefresh } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);

        await fetchUser(accessToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshToken }}>
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
