/**
 * Enterprise API Client
 * Centralized API client with retry logic, error handling, and monitoring
 */

import { env } from '../config/environment';
import { apiLogger, withPerformanceLogging } from '../utils/logger';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTime?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ApiRequestConfig;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  retryable: boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.baseURL = env.supabase.url;
    this.defaultTimeout = env.app.apiTimeout;
    this.defaultRetries = env.app.maxRetries;
    this.defaultRetryDelay = 1000;
    this.cache = new Map();
  }

  /**
   * Make an API request with retry logic and error handling
   */
  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      cache = false,
      cacheTime = 5 * 60 * 1000, // 5 minutes
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${method}:${url}:${JSON.stringify(body || {})}`;

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cached = this.getCachedResponse<T>(cacheKey, cacheTime);
      if (cached) {
        apiLogger.debug('Cache hit', { url, cacheKey });
        return cached;
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    if (body) {
      requestConfig.body = JSON.stringify(body);
    }

    return this.executeWithRetry<T>(
      url,
      requestConfig,
      retries,
      retryDelay,
      cacheKey,
      cacheTime
    );
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    url: string,
    config: RequestInit,
    retries: number,
    retryDelay: number,
    cacheKey?: string,
    cacheTime?: number
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = performance.now();
        apiLogger.debug('API request', { url, attempt: attempt + 1 });

        const response = await fetch(url, config);
        const responseTime = performance.now() - startTime;

        apiLogger.info('API response', {
          url,
          status: response.status,
          responseTime: `${responseTime.toFixed(2)}ms`,
        });

        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw this.createApiError(
            response.status,
            response.statusText,
            errorData
          );
        }

        const data = await response.json();
        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: this.parseHeaders(response.headers),
          config: config as any,
        };

        // Cache successful GET responses
        if (cacheKey && cacheTime && config.method === 'GET') {
          this.cacheResponse(cacheKey, apiResponse, cacheTime);
        }

        return apiResponse;
      } catch (error) {
        lastError = this.handleRequestError(error, attempt === retries);

        if (attempt < retries && lastError.retryable) {
          apiLogger.warn('Retrying request', {
            url,
            attempt: attempt + 1,
            error: lastError.message,
          });

          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        } else {
          break;
        }
      }
    }

    const error = new Error(lastError!.message);
    (error as any).code = lastError!.code;
    (error as any).status = lastError!.status;
    apiLogger.error('API request failed', error, {
      url,
      attempts: retries + 1,
    });

    throw lastError!;
  }

  /**
   * Handle different types of request errors
   */
  private handleRequestError(error: any, isLastAttempt: boolean): ApiError {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timeout',
        code: 'TIMEOUT',
        retryable: !isLastAttempt,
      };
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: 'Network error',
        code: 'NETWORK_ERROR',
        retryable: !isLastAttempt,
      };
    }

    if (error.status) {
      // HTTP error response
      return {
        message: error.message || 'HTTP error',
        status: error.status,
        code: error.code,
        details: error.details,
        retryable: this.isRetryableStatus(error.status) && !isLastAttempt,
      };
    }

    return {
      message: error.message || 'Unknown error',
      code: 'UNKNOWN_ERROR',
      retryable: !isLastAttempt,
    };
  }

  /**
   * Check if HTTP status code is retryable
   */
  private isRetryableStatus(status: number): boolean {
    return status >= 500 || status === 429; // Server errors or rate limiting
  }

  /**
   * Create standardized API error
   */
  private createApiError(
    status: number,
    statusText: string,
    details?: any
  ): ApiError {
    return {
      message: statusText || 'HTTP error',
      status,
      details,
      retryable: this.isRetryableStatus(status),
    };
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  /**
   * Parse response headers
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Cache management
   */
  private getCachedResponse<T>(
    key: string,
    ttl: number
  ): ApiResponse<T> | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private cacheResponse<T>(
    key: string,
    response: ApiResponse<T>,
    ttl: number
  ): void {
    this.cache.set(key, {
      data: response,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Utility methods
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Convenience methods
   */
  async get<T = any>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  async delete<T = any>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data,
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Performance-wrapped version
export const apiClientWithPerformance = {
  ...apiClient,
  request: withPerformanceLogging(
    apiClient.request.bind(apiClient),
    'API Request'
  ),
  get: withPerformanceLogging(apiClient.get.bind(apiClient), 'API GET'),
  post: withPerformanceLogging(apiClient.post.bind(apiClient), 'API POST'),
  put: withPerformanceLogging(apiClient.put.bind(apiClient), 'API PUT'),
  delete: withPerformanceLogging(
    apiClient.delete.bind(apiClient),
    'API DELETE'
  ),
  patch: withPerformanceLogging(apiClient.patch.bind(apiClient), 'API PATCH'),
};
