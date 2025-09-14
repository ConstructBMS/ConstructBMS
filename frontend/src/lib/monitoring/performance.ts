/**
 * Performance Monitoring and Development Analytics
 *
 * This module provides performance tracking and development insights
 * to help identify bottlenecks and improve user experience.
 */

import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.initializeWebVitals();
  }

  private initializeWebVitals() {
    if (!this.isEnabled) return;

    // Track Core Web Vitals
    this.trackWebVitals();

    // Track custom metrics
    this.trackCustomMetrics();
  }

  private trackWebVitals() {
    // Track Largest Contentful Paint (LCP)
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime, {
        element: lastEntry.element?.tagName,
        url: lastEntry.url,
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('FID', entry.processingStart - entry.startTime, {
          eventType: entry.name,
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private trackCustomMetrics() {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordMetric('PageLoad', loadTime);
    });

    // Track route changes
    let routeStartTime = 0;
    window.addEventListener('popstate', () => {
      routeStartTime = performance.now();
    });

    // Track API response times
    this.interceptFetch();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0]?.toString() || 'unknown';

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric('APIResponse', duration, {
          url,
          status: response.status,
          method: args[1]?.method || 'GET',
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric('APIError', duration, {
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    };
  }

  public recordMetric(
    name: string,
    value: number,
    metadata?: Record<string, any>
  ) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log in development
    console.log(
      `📊 Performance Metric: ${name} = ${value.toFixed(2)}ms`,
      metadata
    );

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  public trackComponentRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;

    const existing = this.componentMetrics.get(componentName) || {
      componentName,
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
      lastUpdate: 0,
    };

    existing.renderTime = renderTime;
    existing.updateCount++;
    existing.lastUpdate = Date.now();

    this.componentMetrics.set(componentName, existing);

    // Log slow renders
    if (renderTime > 16) {
      // More than one frame
      console.warn(
        `🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values());
  }

  public getSlowComponents(threshold: number = 16): ComponentPerformance[] {
    return this.getComponentMetrics().filter(
      metric => metric.renderTime > threshold
    );
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const components = this.getComponentMetrics();
    const slowComponents = this.getSlowComponents();

    const report = `
🚀 Performance Report
====================

📊 Core Metrics:
${metrics
  .filter(m => ['LCP', 'FID', 'CLS', 'PageLoad'].includes(m.name))
  .map(m => `  ${m.name}: ${m.value.toFixed(2)}ms`)
  .join('\n')}

🐌 Slow Components (${slowComponents.length}):
${slowComponents
  .map(
    c =>
      `  ${c.componentName}: ${c.renderTime.toFixed(2)}ms (${c.updateCount} updates)`
  )
  .join('\n')}

📈 API Performance:
${metrics
  .filter(m => m.name === 'APIResponse')
  .slice(-10)
  .map(m => `  ${m.metadata?.url}: ${m.value.toFixed(2)}ms`)
  .join('\n')}
`;

    return report;
  }

  public exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.getMetrics(),
        components: this.getComponentMetrics(),
        timestamp: Date.now(),
      },
      null,
      2
    );
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();

  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    performanceMonitor.trackComponentRender(componentName, renderTime);
  });
}

// Utility function to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const endTime = performance.now();
    performanceMonitor.recordMetric(name, endTime - startTime, {
      success: true,
    });
    return result;
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.recordMetric(name, endTime - startTime, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Development-only global access
if (process.env.NODE_ENV === 'development') {
  (window as any).performanceMonitor = performanceMonitor;
}
