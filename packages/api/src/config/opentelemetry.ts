// OpenTelemetry Configuration for PMP API
// Uses @opentelemetry/sdk-node v0.54+

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Service configuration
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'pmp-api';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';
const DEPLOYMENT_ENVIRONMENT = process.env.NODE_ENV || 'development';

// Exporter configuration
const OTEL_EXPORTER_OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1';

// Parse headers from environment variable
let headers: Record<string, string> = {};
const otelHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;
if (otelHeaders) {
  try {
    headers = JSON.parse(otelHeaders);
  } catch (error) {
    console.warn('Failed to parse OTEL_EXPORTER_OTLP_HEADERS:', error);
  }
}

// Configure resource attributes
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: DEPLOYMENT_ENVIRONMENT,
});

// Configure trace exporter
const traceExporter = new OTLPTraceExporter({
  url: OTEL_EXPORTER_OTLP_ENDPOINT,
  headers,
});

// Configure instrumentations
const instrumentations = [
  getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': { enabled: false },
    '@opentelemetry/instrumentation-dns': { enabled: false },
    '@opentelemetry/instrumentation-net': { enabled: false },
  }),
];

// Initialize SDK with minimal configuration for v0.54+
const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations,
});

// Export SDK for initialization
export { sdk };

// Export helper function to start SDK
export async function startOpenTelemetry() {
  try {
    await sdk.start();
    console.log('[OpenTelemetry] Instrumentation started successfully');
    console.log(`[OpenTelemetry] Service: ${SERVICE_NAME} v${SERVICE_VERSION}`);
    console.log(`[OpenTelemetry] Environment: ${DEPLOYMENT_ENVIRONMENT}`);
    console.log(`[OpenTelemetry] Endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT}`);
  } catch (error) {
    console.error('[OpenTelemetry] Failed to start instrumentation:', error);
    throw error;
  }
}

// Export helper function to shutdown SDK
export async function shutdownOpenTelemetry() {
  try {
    await sdk.shutdown();
    console.log('[OpenTelemetry] Instrumentation shutdown complete');
  } catch (error) {
    console.error('[OpenTelemetry] Error during shutdown:', error);
    throw error;
  }
}
