import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getConfiguredLevel(): LogLevel {
  if (env.NODE_ENV === 'test') return 'error';
  return env.LOG_LEVEL;
}

function shouldLog(level: LogLevel): boolean {
  const configured = getConfiguredLevel();
  return levelWeight[level] >= levelWeight[configured];
}

function writeLine(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} ${level.toUpperCase()} ${message}\n`;
  const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
  stream.write(line);
}

export const logger = {
  debug(message: string): void {
    if (!shouldLog('debug')) return;
    writeLine('debug', message);
  },
  info(message: string): void {
    if (!shouldLog('info')) return;
    writeLine('info', message);
  },
  warn(message: string): void {
    if (!shouldLog('warn')) return;
    writeLine('warn', message);
  },
  error(message: string): void {
    if (!shouldLog('error')) return;
    writeLine('error', message);
  },
};
