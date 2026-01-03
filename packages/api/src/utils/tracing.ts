import type { Span, SpanKind } from '@opentelemetry/api';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

/**
 * Tracing utilities for manual span creation and management
 */

/**
 * Create a custom span for business logic
 */
export function createSpan(
  name: string,
  options?: {
    attributes?: Record<string, string | number | boolean | undefined>;
    kind?: SpanKind;
  }
): Span {
  const tracer = trace.getTracer('@pmp/api');

  return tracer.startSpan(name, {
    kind: options?.kind,
    attributes: options?.attributes,
  });
}

/**
 * Run a function within a span
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T> | T,
  options?: {
    attributes?: Record<string, string | number | boolean | undefined>;
    kind?: SpanKind;
  }
): Promise<T> {
  const tracer = trace.getTracer('@pmp/api');

  return tracer.startActiveSpan(name, options, async span => {
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
export function setUserContext(
  span: Span,
  user: {
    id: string;
    email?: string;
    tier?: string;
  }
) {
  span.setAttributes({
    'user.id': user.id,
    'user.email': user.email,
    'user.tier': user.tier,
  });
}

/**
 * Add database query context to span
 */
export function setDatabaseContext(
  span: Span,
  query: {
    table: string;
    operation: string;
    statement?: string;
  }
) {
  span.setAttributes({
    'db.system': 'postgresql',
    'db.name': process.env.DB_NAME || 'pmp_db',
    'db.table': query.table,
    'db.operation': query.operation,
    ...(query.statement && { 'db.statement': query.statement }),
  });
}

/**
 * Add HTTP context to span
 */
export function setHttpContext(
  span: Span,
  request: {
    method: string;
    url: string;
    statusCode?: number;
  }
) {
  span.setAttributes({
    'http.method': request.method,
    'http.url': request.url,
    ...(request.statusCode && { 'http.status_code': request.statusCode }),
  });
}

/**
 * Add external API call context to span
 */
export function setExternalApiContext(
  span: Span,
  api: {
    name: string;
    method: string;
    url?: string;
  }
) {
  span.setAttributes({
    'http.method': api.method,
    'http.url': api.url,
    'external_api.name': api.name,
  });
}

/**
 * Add business logic context to span
 */
export function setBusinessContext(
  span: Span,
  context: {
    feature?: string;
    action?: string;
    domain?: string;
    [key: string]: string | number | boolean | undefined;
  }
) {
  span.setAttributes(context);
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
export function addEvent(
  name: string,
  attributes?: Record<string, string | number | boolean | undefined>
) {
  const span = getCurrentSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Record error in current span
 */
export function recordError(
  error: Error,
  attributes?: Record<string, string | number | boolean | undefined>
) {
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
