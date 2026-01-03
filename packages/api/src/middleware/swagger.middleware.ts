import swaggerUi from 'swagger-ui-express';
import { generateOpenAPISpec } from '../utils/openapi/generate-spec';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Generate OpenAPI specification
 */
const openAPISpec = generateOpenAPISpec();

/**
 * Swagger UI middleware options
 */
const swaggerOptions = {
  explorer: true,
  deepLinking: true,
  persistAuthorization: true,
  displayRequestDuration: true,
  displayOperationId: false,
  filter: true,
  showExtensions: true,
  showCommonExtensions: true,
  docExpansion: env.NODE_ENV === 'production' ? 'none' : 'list',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true,
    operationsSorter: (a: any, b: any) => {
      const methodsOrder = ['get', 'post', 'put', 'patch', 'delete'];
      const aMethod = a.get('method').toLowerCase();
      const bMethod = b.get('method').toLowerCase();

      // Sort by method first
      const aIndex = methodsOrder.indexOf(aMethod);
      const bIndex = methodsOrder.indexOf(bMethod);
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      // Then by path
      const aPath = a.get('path');
      const bPath = b.get('path');
      return aPath.localeCompare(bPath);
    },
    tagsSorter: 'alpha' as const,
    requestInterceptor: (_request: any) => {
      // CSRF token injection handled server-side via cookies
      // No client-side interception needed
      return _request;
    },
  },
  customSiteTitle: 'PMP Study API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-size: 32px; }
    .swagger-ui .info .description { font-size: 16px; }
  `,
  customfavIcon: '/favicon.ico',
};

/**
 * Serve Swagger UI documentation
 * Only available in development and staging environments
 */
export function serveSwaggerDocs() {
  if (env.NODE_ENV === 'production') {
    logger.warn('Swagger UI is disabled in production');
    return (_req: any, res: any, _next: any) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API documentation is not available in production',
        },
      });
    };
  }

  logger.info('Swagger UI enabled at /api-docs');
  return [swaggerUi.serve, swaggerUi.setup(openAPISpec, swaggerOptions)];
}

/**
 * Serve raw OpenAPI specification as JSON
 */
export function serveOpenAPISpec(_req: any, res: any) {
  if (env.NODE_ENV === 'production') {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'API specification is not available in production',
      },
    });
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(openAPISpec);
}

/**
 * Export for use in main app
 */
export { openAPISpec, swaggerUi };
