import winston from 'winston';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Development format - human readable with colors
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => {
            const correlationId = info.correlationId ? ` [${info.correlationId}]` : '';
            return `${info.timestamp}${correlationId} ${info.level}: ${info.message}`;
        },
    ),
);

// Production format - JSON for log aggregation (ELK, CloudWatch, etc.)
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

const isProduction = process.env.NODE_ENV === 'production';

const transports = [
    new winston.transports.Console({
        format: isProduction ? prodFormat : devFormat,
    }),
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: prodFormat,
    }),
    new winston.transports.File({
        filename: 'logs/all.log',
        format: prodFormat,
    }),
];

const Logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

// Create a child logger with correlation ID for request-scoped logging
export const createRequestLogger = (correlationId: string) => {
    return Logger.child({ correlationId });
};

export default Logger;
