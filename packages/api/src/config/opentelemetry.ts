import {
  NodeSDK,
  NodeSDKConfiguration,
} from '@opentelemetry/sdk-node';
import {
  OTLPTraceExporter,
} from '@opentelemetry/exporter-trace-otlp-grpc';
import {
  OTLPMetricExporter,
} from '@opentelemetry/exporter-metrics-otlp-proto';
import {
  getResource,
  processDetector,
  envDetector,
} from '@opentelemetry/resources';
import {
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions';
import {
  InstrumentationOption,
} from '@opentelemetry/instrumentation';
import {
  getNodeAutoInstrumentations,
} from '@opentelemetry/auto-instrumentations-node';

// Service configuration
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'pmp-api';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';
const DEPLOYMENT_ENVIRONMENT = process.env.NODE_ENV || 'development';

// Exporter configuration
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';
const OTEL_EXPORTER_OTLP_HEADERS = process.env.OTEL_EXPORTER_OTLP_HEADERS;

// Parse headers from environment variable
let headers: Record<string, string> = {};
if (OTEL_EXPORTER_OTLP_HEADERS) {
  try {
    headers = JSON.parse(OTEL_EXPORTER_OTLP_HEADERS);
  } catch (error) {
    console.warn('Failed to parse OTEL_EXPORTER_OTLP_HEADERS:', error);
  }
}

// Configure resource attributes
const resource = getResource({
  detectors: [processDetector, envDetector],
})
  .merge(
    getResource({
      [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
      [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: DEPLOYMENT_ENVIRONMENT,
    })
  );

// Configure trace exporter
const traceExporter = new OTLPTraceExporter({
  url: OTEL_EXPORTER_OTLP_ENDPOINT,
  headers,
});

// Configure metrics exporter
const metricsExporter = new OTLPMetricExporter({
  url: OTEL_EXPORTER_OTLP_ENDPOINT,
  headers,
});

// Configure instrumentations
const instrumentations: InstrumentationOption[] = getNodeAutoInstrumentations({
  // Disable instrumentations we don't need
  '@opentelemetry/instrumentation-fs': {
    enabled: false,
  },
  '@opentelemetry/instrumentation-dns': {
    enabled: false,
  },
  '@opentelemetry/instrumentation-net': {
    enabled: false,
  },
});

// Configure SDK
const sdkConfig: NodeSDKConfiguration = {
  resource,
  traceExporter,
  metricReader: undefined, // Using Prometheus for metrics
  instrumentations,
  serviceName: SERVICE_NAME,
  // Sampling configuration
  sampler: {
    shouldSample: (context, traceId, spanName, spanKind, attributes, links) => {
      // Sample 100% of requests in development
      if (DEPLOYMENT_ENVIRONMENT === 'development') {
        return true;
      }

      // Sample based on route importance
      const route = attributes?.[SemanticResourceAttributes.HTTP_ROUTE] as string || '';

      // Critical paths - 100% sampling
      if (route.includes('/api/stripe') ||
          route.includes('/api/subscriptions') ||
          route.includes('/api/auth')) {
        return true;
      }

      // Health checks - 10% sampling
      if (route.includes('/api/health')) {
        return Math.random() < 0.1;
      }

      // Default - 30% sampling
      return Math.random() < 0.3;
    },
  },
  // Add additional span processors for local development
  spanProcessors: [],
};

// Initialize SDK
const sdk = new NodeSDK(sdkConfig);

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
