'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import '@/lib/sync'; // Initialize sync service

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
