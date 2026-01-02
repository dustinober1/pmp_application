/**
 * OpenTelemetry React Hooks
 *
 * Custom hooks for tracing in React components
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createSpan,
  withSpan,
  setUserContext,
  setPageContext,
  setFeatureContext,
  addEvent,
  recordError,
  trackPageNavigation,
  trackUserInteraction,
  type Span,
} from './opentelemetry';

/**
 * Hook to track component lifecycle
 */
export function useComponentTrace(componentName: string, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const span = createSpan(`component.mount:${componentName}`);
    span.setAttributes({
      'component.name': componentName,
      'component.lifecycle': 'mount',
    });

    return () => {
      span.addEvent('component.unmount');
      span.end();
    };
  }, [componentName, enabled]);
}

/**
 * Hook to track page views
 */
export function usePageTracking(path: string, title?: string) {
  useEffect(() => {
    trackPageNavigation(path, title);
  }, [path, title]);
}

/**
 * Hook to track async operations
 */
export function useAsyncTracer<T>(
  operation: string,
  asyncFn: () => Promise<T>,
  dependencies: any[] = []
) {
  return useCallback(
    () =>
      withSpan(`async.operation:${operation}`, async (span) => {
        span.setAttributes({
          'operation.name': operation,
        });
        return asyncFn();
      }),
    [operation, ...dependencies]
  );
}

/**
 * Hook to track user interactions
 */
export function useInteractionTracker() {
  const trackClick = useCallback((elementId: string, elementType: string) => {
    trackUserInteraction(elementType, 'click', elementId);
  }, []);

  const trackSubmit = useCallback((formId: string) => {
    trackUserInteraction('form', 'submit', formId);
  }, []);

  const trackChange = useCallback((elementId: string, elementType: string, value: any) => {
    trackUserInteraction(elementType, 'change', elementId);

    const span = createSpan(`input.change:${elementId}`);
    span.setAttributes({
      'input.element_id': elementId,
      'input.element_type': elementType,
      'input.value_length': String(value)?.length || 0,
    });
    span.end();
  }, []);

  return { trackClick, trackSubmit, trackChange };
}

/**
 * Hook to track API calls with error handling
 */
export function useApiTracer() {
  const traceApiCall = useCallback(
    async <T>(
      url: string,
      method: string,
      apiCall: () => Promise<T>
    ): Promise<T> => {
      return withSpan(`api.call:${method}:${url}`, async (span) => {
        try {
          span.setAttributes({
            'http.method': method,
            'http.url': url,
            'http.type': 'fetch',
          });

          addEvent('api.call.start', { url, method });

          const result = await apiCall();

          addEvent('api.call.success', {
            url,
            method,
            status: 'success',
          });

          return result;
        } catch (error) {
          recordError(error as Error, {
            'api.url': url,
            'api.method': method,
          });

          throw error;
        }
      });
    },
    []
  );

  return { traceApiCall };
}

/**
 * Hook to track performance metrics
 */
export function usePerformanceTracker(componentName: string) {
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (!renderStartTime.current) return;

    const renderTime = performance.now() - renderStartTime.current;

    const span = createSpan(`component.render:${componentName}`);
    span.setAttributes({
      'component.name': componentName,
      'performance.render_time_ms': renderTime,
    });
    span.end();
  });
}

/**
 * Hook to add context to spans
 */
export function useTracingContext() {
  const setUser = useCallback((user: { id: string; email?: string; tier?: string }) => {
    setUserContext(user);
  }, []);

  const setPage = useCallback((page: { path: string; title?: string; referrer?: string }) => {
    setPageContext(page);
  }, []);

  const setFeature = useCallback((feature: { name: string; action?: string }) => {
    setFeatureContext(feature);
  }, []);

  const addCustomEvent = useCallback((
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>
  ) => {
    addEvent(name, attributes);
  }, []);

  const logError = useCallback((
    error: Error,
    attributes?: Record<string, string | number | boolean | undefined>
  ) => {
    recordError(error, attributes);
  }, []);

  return {
    setUser,
    setPage,
    setFeature,
    addEvent: addCustomEvent,
    logError,
  };
}
