/**
 * Enterprise Logging System
 * Centralized logging with different levels and structured output
 * 
 * @deprecated Use the new loggingService from '../services/loggingService' instead
 */

import { env, isDevelopment, isProduction } from '../config/environment';
import { loggingService, LogLevel as NewLogLevel } from '../services/loggingService';

export enum LogLevel {
  DEBUG = 0,
  ERROR = 3,
  FATAL = 4,
  INFO = 1,
  WARN = 2,
}

export interface LogEntry {
  context?: string;
  data?: any;
  error?: Error | undefined;
  level: LogLevel;
  message: string;
  requestId?: string | undefined;
  sessionId?: string | undefined;
  timestamp: string;
  userId?: string | undefined;
}

class Logger {
  private logLevel: LogLevel;
  private context: string;

  constructor(context: string = 'App', logLevel?: LogLevel) {
    this.context = context;
    this.logLevel = logLevel ?? this.getDefaultLogLevel();
  }

  private getDefaultLogLevel(): LogLevel {
    if (isDevelopment) return LogLevel.DEBUG;
    if (isProduction) return LogLevel.INFO;
    return LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = `[${timestamp}] [${levelName}] [${this.context}]`;

    if (data) {
      return `${prefix}: ${message} ${JSON.stringify(data, null, 2)}`;
    }

    return `${prefix}: ${message}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      error,
      // Add user context if available
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // This would be implemented based on your auth context
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    // This would be implemented based on your session management
    return sessionStorage.getItem('sessionId') || undefined;
  }

  private getRequestId(): string | undefined {
    // This would be implemented based on your request tracking
    return undefined;
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.createLogEntry(level, message, data, error);
    const formattedMessage = this.formatMessage(level, message, data);

    // Console output for development
    if (isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formattedMessage);
          if (error) {
            console.error('Error details:', error);
          }
          break;
      }
    }

    // Production logging (could be sent to external service)
    if (isProduction && level >= LogLevel.ERROR) {
      this.sendToExternalService(logEntry);
    }

    // Store logs for debugging (development only)
    if (isDevelopment) {
      this.storeLog(logEntry);
    }
  }

  private sendToExternalService(logEntry: LogEntry): void {
    // Implementation for sending logs to external service (e.g., Sentry, LogRocket)
    // This would be implemented based on your monitoring service
    try {
      // Example: Send to external service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  private storeLog(logEntry: LogEntry): void {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(logEntry);

      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  // Public logging methods
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  fatal(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.FATAL, message, data, error);
  }

  // Performance logging
  time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(`[${this.context}] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(`[${this.context}] ${label}`);
    }
  }

  // Utility methods
  setContext(context: string): void {
    this.context = context;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Get stored logs for debugging
  getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored logs
  clearStoredLogs(): void {
    localStorage.removeItem('app_logs');
  }
}

// Create default logger instance
export const logger = new Logger('App');

// Create context-specific loggers
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

// Export commonly used loggers
export const authLogger = createLogger('Auth');
export const apiLogger = createLogger('API');
export const chatLogger = createLogger('Chat');
export const uiLogger = createLogger('UI');
export const dbLogger = createLogger('Database');

// Performance monitoring utilities
export const withPerformanceLogging = <T extends any[], R>(
  fn: (...args: T) => R,
  context: string
) => {
  return (...args: T): R => {
    const startTime = performance.now();
    try {
      const result = fn(...args);
      const endTime = performance.now();
      logger.debug(`${context} completed in ${endTime - startTime}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      logger.error(
        `${context} failed after ${endTime - startTime}ms`,
        error as Error
      );
      throw error;
    }
  };
};

// Re-export new logging service for easy migration
export { loggingService, logger as newLogger } from '../services/loggingService';
