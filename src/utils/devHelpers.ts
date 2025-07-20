/**
 * Development Helper Utilities
 * Quick utilities to speed up development and debugging
 */

import { logger } from './logger';

// Performance monitoring
export const measurePerformance = <T extends any[], R>(
  fn: (...args: T) => R,
  name: string
) => {
  return (...args: T): R => {
    const start = performance.now();
    try {
      const result = fn(...args);
      const end = performance.now();
      logger.debug(`${name} took ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      logger.error(`${name} failed after ${(end - start).toFixed(2)}ms`, error as Error);
      throw error;
    }
  };
};

// Quick debugging utilities
export const debugState = (componentName: string, state: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 ${componentName} State`);
    console.log(state);
    console.groupEnd();
  }
};

export const debugProps = (componentName: string, props: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📦 ${componentName} Props`);
    console.log(props);
    console.groupEnd();
  }
};

// Quick validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { errors: string[], isValid: boolean; } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least 1 uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least 1 lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least 1 number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain at least 1 special character');
  
  return { isValid: errors.length === 0, errors };
};

// Quick data helpers
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Quick testing helpers
export const mockApiResponse = <T>(data: T, delay = 1000): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

export const createTestUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  created_at: new Date().toISOString(),
});

// Quick development shortcuts
export const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 DEV: ${message}`, data || '');
  }
};

export const devWarn = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ DEV: ${message}`, data || '');
  }
};

export const devError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ DEV: ${message}`, error || '');
  }
};

// Quick utility functions
export const formatCurrency = (amount: number, currency = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Quick array/object helpers
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Quick string helpers
export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}; 
