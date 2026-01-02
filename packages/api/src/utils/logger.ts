/**
 * Backward-compatible logger wrapper
 * @deprecated Import from @pmp/api/logging instead
 */

import { getLogger } from '../logging';

/**
 * Legacy logger interface for backward compatibility
 */
export const logger = {
  debug(message: string, metadata?: any): void {
    const structuredLogger = getLogger();
    if (metadata) {
      structuredLogger.debug(message, metadata);
    } else {
      structuredLogger.debug(message);
    }
  },

  info(message: string, metadata?: any): void {
    const structuredLogger = getLogger();
    if (metadata) {
      structuredLogger.info(message, metadata);
    } else {
      structuredLogger.info(message);
    }
  },

  warn(message: string, metadata?: any): void {
    const structuredLogger = getLogger();
    if (metadata) {
      structuredLogger.warn(message, metadata);
    } else {
      structuredLogger.warn(message);
    }
  },

  error(message: string, error?: Error | any, metadata?: any): void {
    const structuredLogger = getLogger();
    if (metadata) {
      structuredLogger.error(message, error, metadata);
    } else if (error) {
      structuredLogger.error(message, error);
    } else {
      structuredLogger.error(message);
    }
  },
};
