'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;

    const nextParam = encodeURIComponent(pathname || '/dashboard');
    router.push(`/auth/login?next=${nextParam}`);
  }, [isAuthenticated, isLoading, pathname, router]);

  const isEmailVerified = !!user?.emailVerified;
  const canAccess = isAuthenticated && isEmailVerified;

  return { user, isAuthenticated, isLoading, isEmailVerified, canAccess };
}
