"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/components/I18nProvider";
import { SkipToContentLink } from "@/components/SkipToContentLink";

// Note: Sync service removed - no longer needed for static site
// import "@/lib/sync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <SkipToContentLink />
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
