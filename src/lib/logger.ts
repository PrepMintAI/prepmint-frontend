/**
 * Environment-aware logger utility
 *
 * Only logs to console in development mode.
 * In production, all logs are silenced to prevent exposing internal logic.
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Logger object with methods that conditionally log based on environment
 */
export const logger = {
  /**
   * Log general information (development only)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log error messages (development only)
   */
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log info messages (development only)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};
