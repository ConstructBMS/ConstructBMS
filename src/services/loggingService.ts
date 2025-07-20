/**
 * Advanced Logging Service
 * Centralized logging with configurable levels, filtering, and dedicated UI
 */

import React from 'react';

export enum LogLevel {
  DEBUG = 0,
  ERROR = 3,
  FATAL = 4,
  INFO = 1,
  WARN = 2,
}

export interface LogEntry {
  data?: any;
  error?: Error | undefined;
  id: string;
  level: LogLevel;
  message: string;
  sessionId?: string;
  source: string;
  timestamp: number;
  userId?: string;
}

export interface LoggingConfig {
  consoleLevel: LogLevel;
  enableDebugMode: boolean;
  enableErrorTracking: boolean;
  enablePerformanceLogging: boolean;
  externalServiceUrl?: string;
  logToExternalService: boolean;
  maxLogs: number;
  uiLevel: LogLevel;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private config: LoggingConfig;
  private sessionId: string;
  private listeners: Set<(entry: LogEntry) => void> = new Set();
  private performanceMarks: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = this.loadConfig();
    this.setupGlobalErrorHandling();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadConfig(): LoggingConfig {
    const stored = localStorage.getItem('logging_config');
    if (stored) {
      return { ...this.getDefaultConfig(), ...JSON.parse(stored) };
    }
    return this.getDefaultConfig();
  }

  private getDefaultConfig(): LoggingConfig {
    return {
      consoleLevel: LogLevel.ERROR, // Only show errors in console by default
      uiLevel: LogLevel.DEBUG, // Show debug+ in UI for testing
      maxLogs: 1000,
      enablePerformanceLogging: true,
      enableErrorTracking: true,
      enableDebugMode: false,
      logToExternalService: false,
    };
  }

  private setupGlobalErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Global error caught', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', event.reason, {
        promise: event.promise,
      });
    });

      // React error boundary support
  if ((window as any).React) {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.error('React error', new Error(args.join(' ')), { args });
      originalConsoleError.apply(console, args);
    };
  }
  }

  // Configuration management
  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('logging_config', JSON.stringify(this.config));
    this.info('Logging configuration updated', newConfig);
  }

  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  // Logging methods
  debug(message: string, data?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, data, undefined, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.log(LogLevel.INFO, message, data, undefined, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.log(LogLevel.WARN, message, data, undefined, source);
  }

  error(message: string, error?: Error, data?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, data, error, source);
  }

  fatal(message: string, error?: Error, data?: any, source?: string): void {
    this.log(LogLevel.FATAL, message, data, error, source);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error,
    source?: string
  ): void {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      message,
      data,
      error,
      source: source || 'unknown',
      sessionId: this.sessionId,
    };

    // Store log entry
    this.logs.push(entry);
    this.trimLogs();

    // Console output based on config
    if (level >= this.config.consoleLevel) {
      this.outputToConsole(entry);
    }

    // Notify listeners (for UI)
    if (level >= this.config.uiLevel) {
      this.notifyListeners(entry);
    }

    // Send to external service if configured
    if (this.config.logToExternalService && this.config.externalServiceUrl) {
      this.sendToExternalService(entry);
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trimLogs(): void {
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.source}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${prefix} ${entry.message}`, entry.data || '');
        if (entry.error) {
          console.error('Error details:', entry.error);
        }
        break;
    }
  }

  private notifyListeners(entry: LogEntry): void {
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.config.externalServiceUrl) return;

    try {
      await fetch(this.config.externalServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Don't log this error to avoid infinite loops
      console.error('Failed to send log to external service:', error);
    }
  }

  // Performance logging
  startPerformanceMark(name: string): void {
    if (!this.config.enablePerformanceLogging) return;
    this.performanceMarks.set(name, performance.now());
    this.debug(`Performance mark started: ${name}`);
  }

  endPerformanceMark(name: string, additionalData?: any): void {
    if (!this.config.enablePerformanceLogging) return;
    
    const startTime = this.performanceMarks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.info(`Performance mark completed: ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...additionalData,
      });
      this.performanceMarks.delete(name);
    }
  }

  // Log retrieval and management
  getLogs(level?: LogLevel, source?: string, limit?: number): LogEntry[] {
    let filtered = this.logs;

    if (level !== undefined) {
      filtered = filtered.filter(log => log.level >= level);
    }

    if (source) {
      filtered = filtered.filter(log => log.source === source);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this.logs.filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared');
  }

  exportLogs(format: 'json' | 'csv' | 'text' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      case 'csv':
        return this.logsToCSV();
      case 'text':
        return this.logsToText();
      default:
        return JSON.stringify(this.logs, null, 2);
    }
  }

  private logsToCSV(): string {
    const headers = ['Timestamp', 'Level', 'Source', 'Message', 'Data', 'Error'];
    const rows = this.logs.map(log => [
      new Date(log.timestamp).toISOString(),
      LogLevel[log.level],
      log.source,
      log.message,
      log.data ? JSON.stringify(log.data) : '',
      log.error ? log.error.message : '',
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  private logsToText(): string {
    return this.logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const level = LogLevel[log.level];
      return `[${timestamp}] [${level}] [${log.source}] ${log.message}`;
    }).join('\n');
  }

  // Event listeners for UI
  addListener(listener: (entry: LogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Statistics
  getLogStats(): {
    byLevel: Record<string, number>;
    bySource: Record<string, number>;
    errorsInLastHour: number;
    total: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const byLevel: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let errorsInLastHour = 0;

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;
      bySource[log.source] = (bySource[log.source] || 0) + 1;
      
      if (log.level >= LogLevel.ERROR && log.timestamp >= oneHourAgo) {
        errorsInLastHour++;
      }
    });

    return {
      total: this.logs.length,
      byLevel,
      bySource,
      errorsInLastHour,
    };
  }

  // Debug utilities
  logSystemInfo(): void {
    this.info('System information', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      memory: (performance as any).memory,
      sessionId: this.sessionId,
      config: this.config,
    });
  }

  // Error tracking
  trackError(error: unknown, context?: any): void {
    if (!this.config.enableErrorTracking) return;
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.error('Tracked error', errorObj, {
      stack: errorObj.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }
}

// Create singleton instance
export const loggingService = new LoggingService();

// Convenience exports
export const logger = {
  debug: (message: string, data?: any, source?: string) => 
    loggingService.debug(message, data, source),
  info: (message: string, data?: any, source?: string) => 
    loggingService.info(message, data, source),
  warn: (message: string, data?: any, source?: string) => 
    loggingService.warn(message, data, source),
  error: (message: string, error?: Error, data?: any, source?: string) => 
    loggingService.error(message, error, data, source),
  fatal: (message: string, error?: Error, data?: any, source?: string) => 
    loggingService.fatal(message, error, data, source),
};

// Performance decorator
export const withPerformanceLogging = <T extends any[], R>(
  fn: (...args: T) => R,
  context: string
) => {
  return (...args: T): R => {
    loggingService.startPerformanceMark(context);
    try {
      const result = fn(...args);
      loggingService.endPerformanceMark(context);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      loggingService.endPerformanceMark(context, { error: errorMessage });
      throw error;
    }
  };
};

// React hook for logging
export const useLogging = () => {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [stats, setStats] = React.useState(loggingService.getLogStats());

  React.useEffect(() => {
    // Load existing logs on mount
    setLogs(loggingService.getLogs());
    setStats(loggingService.getLogStats());

    // Subscribe to new logs
    const unsubscribe = loggingService.addListener((entry) => {
      setLogs(prev => [...prev, entry]);
      setStats(loggingService.getLogStats());
    });

    return unsubscribe;
  }, []);

  return {
    logs,
    stats,
    clearLogs: () => {
      loggingService.clearLogs();
      setLogs([]);
      setStats(loggingService.getLogStats());
    },
    exportLogs: loggingService.exportLogs.bind(loggingService),
    updateConfig: loggingService.updateConfig.bind(loggingService),
    getConfig: loggingService.getConfig.bind(loggingService),
  };
}; 
