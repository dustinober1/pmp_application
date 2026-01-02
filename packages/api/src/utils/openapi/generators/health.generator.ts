import type { OpenAPIV3_1 } from 'openapi-types';

/**
 * Generate Health endpoints OpenAPI spec
 */
export const healthPaths: OpenAPIV3_1.PathsObject = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Check API health and database connectivity.',
      security: [],
      responses: {
        '200': {
          description: 'API is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'healthy' },
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                  },
                  version: { type: 'string', example: '1.0.0' },
                  services: {
                    type: 'object',
                    properties: {
                      database: {
                        type: 'string',
                        example: 'connected',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '503': {
          description: 'API is unhealthy (e.g., database disconnected)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'unhealthy' },
                  timestamp: { type: 'string', format: 'date-time' },
                  version: { type: 'string', example: '1.0.0' },
                  services: {
                    type: 'object',
                    properties: {
                      database: {
                        type: 'string',
                        example: 'disconnected',
                      },
                    },
                  },
                  error: {
                    type: 'string',
                    example: 'Database connection failed',
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/health/live': {
    get: {
      tags: ['Health'],
      summary: 'Liveness probe',
      description: 'Kubernetes liveness probe - returns 200 if service is running.',
      security: [],
      responses: {
        '200': {
          description: 'Service is alive',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'alive' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/health/ready': {
    get: {
      tags: ['Health'],
      summary: 'Readiness probe',
      description: 'Kubernetes readiness probe - returns 200 if service can handle requests.',
      security: [],
      responses: {
        '200': {
          description: 'Service is ready',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ready' },
                },
              },
            },
          },
        },
        '503': {
          description: 'Service is not ready',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'not ready' },
                },
              },
            },
          },
        },
      },
    },
  },
};
