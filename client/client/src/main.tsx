import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/dark-mode.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ThemeProvider } from './contexts/ThemeContext';

// Initialize Sentry for frontend error tracking
// Requirements: Story 3 - Implement Error Tracking and Monitoring
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Environment for filtering in dashboard
    environment: import.meta.env.MODE,

    // Release version
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Integrations
    integrations: [
      // Enable browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),
      // Enable replay for session recording on errors
      Sentry.replayIntegration({
        // Only record on error, not continuously
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance monitoring - sample rate
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session replay - only on errors
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Ignore common non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      /^Loading chunk .* failed/,
      /^Network Error$/,
    ],

    // Don't send in development unless explicitly enabled
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true',

    // Scrub sensitive data
    beforeSend(event) {
      // Scrub any password fields that might be in the event
      if (event.request?.data && typeof event.request.data === 'object') {
        const data = event.request.data as Record<string, unknown>;
        if ('password' in data) data.password = '[REDACTED]';
        if ('token' in data) data.token = '[REDACTED]';
      }
      return event;
    },
  });

  console.log('[Sentry] Frontend initialized for environment:', import.meta.env.MODE);
}

// Error callback for ErrorBoundary to send to Sentry
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  Sentry.withScope((scope) => {
    scope.setExtra('componentStack', errorInfo.componentStack);
    Sentry.captureException(error);
  });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary onError={handleError}>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
