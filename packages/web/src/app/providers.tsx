'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import '@/lib/sync'; // Initialize sync service
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/components/I18nProvider';
import { SkipToContentLink } from '@/components/SkipToContentLink';

function EmailVerificationGate({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) return;
    if (user.emailVerified) return;
    if (pathname.startsWith('/auth/verify-email')) return;

    const nextParam = encodeURIComponent(pathname || '/dashboard');
    router.push(`/auth/verify-email?next=${nextParam}`);
  }, [isAuthenticated, isLoading, pathname, router, user]);

  return children;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <SkipToContentLink />
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <EmailVerificationGate>{children}</EmailVerificationGate>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
