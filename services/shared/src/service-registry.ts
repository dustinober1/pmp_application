/**
 * Service registry for microservices discovery
 */
export interface ServiceConfig {
    name: string;
    host: string;
    port: number;
    healthPath: string;
}

export const getServiceUrl = (config: ServiceConfig): string => {
    return `http://${config.host}:${config.port}`;
};

/**
 * Default service configurations
 */
export const ServiceRegistry = {
    gateway: {
        name: 'gateway',
        host: process.env.GATEWAY_HOST || 'localhost',
        port: parseInt(process.env.GATEWAY_PORT || '3000'),
        healthPath: '/health',
    },
    auth: {
        name: 'auth-service',
        host: process.env.AUTH_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.AUTH_SERVICE_PORT || '3001'),
        healthPath: '/health',
    },
    questions: {
        name: 'questions-service',
        host: process.env.QUESTIONS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.QUESTIONS_SERVICE_PORT || '3002'),
        healthPath: '/health',
    },
    analytics: {
        name: 'analytics-service',
        host: process.env.ANALYTICS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.ANALYTICS_SERVICE_PORT || '3003'),
        healthPath: '/health',
    },
};

/**
 * Inter-service HTTP client configuration
 */
export interface ServiceRequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
    correlationId?: string;
}

/**
 * Build headers for inter-service communication
 */
export const buildServiceHeaders = (
    correlationId?: string,
    authToken?: string,
    additionalHeaders?: Record<string, string>
): Record<string, string> => {
    return {
        'Content-Type': 'application/json',
        ...(correlationId && { 'X-Correlation-ID': correlationId }),
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...(additionalHeaders || {}),
    };
};
