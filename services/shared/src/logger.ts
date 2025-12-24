import winston from 'winston';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const isProduction = process.env.NODE_ENV === 'production';

// Development format - human readable with colors
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const correlationId = info.correlationId ? ` [${info.correlationId}]` : '';
        const service = info.service ? ` [${info.service}]` : '';
        return `${info.timestamp}${service}${correlationId} ${info.level}: ${info.message}`;
    }),
);

// Production format - JSON for log aggregation
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

export const createLogger = (serviceName: string) => {
    return winston.createLogger({
        level: isProduction ? 'warn' : 'debug',
        levels,
        defaultMeta: { service: serviceName },
        transports: [
            new winston.transports.Console({
                format: isProduction ? prodFormat : devFormat,
            }),
        ],
    });
};

export type Logger = ReturnType<typeof createLogger>;
