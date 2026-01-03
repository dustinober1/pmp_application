/**
 * Winston transport configurations
 */

import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import type { LoggerConfig } from './types';

/**
 * Create console transport for development
 */
export function createConsoleTransport(isDevelopment: boolean): winston.transport {
  return new winston.transports.Console({
    format: isDevelopment
      ? winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
            let output = `${timestamp} [${level}]: ${message}`;

            if (meta.context?.trace_id) {
              output += ` (trace_id=${meta.context.trace_id})`;
            }

            if (Object.keys(meta).length > 0 && !meta.context) {
              output += ` ${JSON.stringify(meta)}`;
            }

            return output;
          })
        )
      : winston.format.combine(winston.format.timestamp(), winston.format.json()),
  });
}

/**
 * Create file transport for persistent logging
 */
export function createFileTransport(filename: string, level: string = 'info'): winston.transport {
  return new winston.transports.File({
    filename,
    level,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  });
}

/**
 * Create CloudWatch transport for production logging
 */
export function createCloudWatchTransport(config: LoggerConfig): winston.transport | null {
  if (!config.enableCloudWatch) {
    return null;
  }

  return new WinstonCloudWatch({
    logGroupName: config.cloudWatchLogGroup,
    logStreamName: config.cloudWatchLogStream,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsOptions: {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    },
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    messageFormatter: ({ level, message, metadata }) => {
      const logData: any = {
        timestamp: new Date().toISOString(),
        level,
        message,
        environment: config.environment,
        service_name: config.serviceName,
      };

      if (metadata?.trace_id) logData.trace_id = metadata.trace_id;
      if (metadata?.user_id) logData.user_id = metadata.user_id;

      return JSON.stringify(logData);
    },
    uploadBatchSize: 20,
    uploadBatchTimeoutMs: 1000,
  });
}

/**
 * Create all transports based on environment
 */
export function createTransports(config: LoggerConfig): winston.transport[] {
  const transports: winston.transport[] = [];
  const isDevelopment = config.environment === 'development';

  // Console transport (always)
  transports.push(createConsoleTransport(isDevelopment));

  // File transport for error logs
  transports.push(createFileTransport('logs/error.log', 'error'));

  // File transport for combined logs in production
  if (!isDevelopment) {
    transports.push(createFileTransport('logs/combined.log', 'info'));
  }

  // CloudWatch transport in production
  if (config.enableCloudWatch) {
    const cwTransport = createCloudWatchTransport(config);
    if (cwTransport) {
      transports.push(cwTransport);
    }
  }

  return transports;
}
