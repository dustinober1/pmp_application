/**
 * OpenTelemetry Browser Configuration
 *
 * Initializes distributed tracing for the Next.js frontend
 */

import {
  trace,
  context,
  Span,
  SpanStatusCode,
} from '@opentelemetry/api';
import {
  WebTracerProvider,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-web';
import {
  Resource,
} from '@opentelemetry/resources';
import {
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions';
import {
  OTLPTraceExporter,
} from '@opentelemetry/exporter-trace-otlp-http';
import {
  FetchInstrumentation,
} from '@opentelemetry/instrumentation-fetch';
import {
  XMLHttpRequestInstrumentation,
} from '@opentelemetry/instrumentation-xml-http-request';
import {
  UserInteractionInstrumentation,
} from '@opentelemetry/instrumentation-user-interaction';
import {
  registerInstrumentations,
} from '@opentelemetry/instrumentation';

// Configuration
const SERVICE_NAME = process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || 'pmp-web';
const SERVICE_VERSION = process.env.NEXT_PUBLIC_OTEL_SERVICE_VERSION || '1.0.0';
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ||
  (typeof window !== 'undefined' ? `${window.location.origin}/otlp` : 'http://localhost:4318/v1/traces');

// Initialize tracing
export function initializeTracing() {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    return;
  }

  // Create resource
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
      [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    })
  );

  // Create tracer provider
  const provider = new WebTracerProvider({
    resource,
  });

  // Configure exporter (using collector in production, console in development)
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    // Production: Send to OTLP collector
    const exporter = new OTLPTraceExporter({
      url: OTEL_EXPORTER_OTLP_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  }

  // Register the provider
  provider.register();

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      // Fetch API instrumentation
      new FetchInstrumentation({
        ignoreUrls: [/localhost:3000\/otlp/, /localhost:3001\/otlp/],
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: true,
      }),

      // XMLHttpRequest instrumentation
      new XMLHttpRequestInstrumentation({
        ignoreUrls: [/localhost:3000\/otlp/, /localhost:3001\/otlp/],
        propagateTraceHeaderCorsUrls: /.*/,
      }),

      // User interaction instrumentation (optional - can be disabled for performance)
      ...(isDevelopment ? [
        new UserInteractionInstrumentation({
          eventNames: ['click', 'submit', 'change'],
        }),
      ] : []),
    ],
  });

  // Log initialization
  if (isDevelopment) {
    console.log('[OpenTelemetry] Browser tracing initialized', {
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      environment: process.env.NODE_ENV,
      endpoint: OTEL_EXPORTER_OTLP_ENDPOINT,
    });
  }
}

/**
 * Create a custom span for frontend operations
 */
export function createSpan(name: string): Span {
  const tracer = trace.getTracer(SERVICE_NAME);
  return tracer.startSpan(name);
}

/**
 * Run an operation within a span
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T> | T
): Promise<T> {
  const tracer = trace.getTracer(SERVICE_NAME);

  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add user context to current span
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  tier?: string;
}) {
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttributes({
      'user.id': user.id,
      'user.email': user.email,
      'user.tier': user.tier,
    });
  }
}

/**
 * Add page context to current span
 */
export function setPageContext(page: {
  path: string;
  title?: string;
  referrer?: string;
}) {
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttributes({
      'page.path': page.path,
      'page.title': page.title,
      'page.referrer': page.referrer,
    });
  }
}

/**
 * Add feature context to current span
 */
export function setFeatureContext(feature: {
  name: string;
  action?: string;
  [key: string]: string | number | boolean | undefined;
}) {
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttributes(feature);
  }
}

/**
 * Get current active span
 */
export function getCurrentSpan(): Span | undefined {
  return trace.getSpan(context.active());
}

/**
 * Add event to current span
 */
export function addEvent(name: string, attributes?: Record<string, string | number | boolean | undefined>) {
  const span = getCurrentSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Record error in current span
 */
export function recordError(error: Error, attributes?: Record<string, string | number | boolean | undefined>) {
  const span = getCurrentSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });

    if (attributes) {
      span.setAttributes(attributes);
    }
  }
}

/**
 * Track page navigation
 */
export function trackPageNavigation(path: string, title?: string) {
  withSpan(`page.navigation:${path}`, (span) => {
    setPageContext({
      path,
      title,
      referrer: document.referrer,
    });

    span.setAttributes({
      'navigation.type': 'route_change',
    });
  });
}

/**
 * Track API call
 */
export function trackApiCall(url: string, method: string) {
  return withSpan(`http.request:${method}:${url}`, (span) => {
    span.setAttributes({
      'http.method': method,
      'http.url': url,
      'http.type': 'fetch',
    });
  });
}

/**
 * Track user interaction
 */
export function trackUserInteraction(
  elementType: string,
  action: string,
  elementId?: string
) {
  if (process.env.NODE_ENV === 'development') {
    withSpan(`user.interaction:${action}`, (span) => {
      span.setAttributes({
        'ui.element_type': elementType,
        'ui.action': action,
        'ui.element_id': elementId,
      });
    });
  }
}
