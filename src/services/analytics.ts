import { supabase } from './supabase';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  organization_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  page_url?: string;
  user_agent?: string;
  ip_address?: string;
  timestamp?: string;
  session_id?: string;
}

export interface PerformanceMetric {
  id?: string;
  user_id?: string;
  organization_id?: string;
  metric_type: 'page_load' | 'api_response' | 'error' | 'user_interaction';
  metric_name: string;
  metric_value: number;
  unit: string;
  timestamp?: string;
  additional_data?: Record<string, any>;
}

export interface UserBehavior {
  id?: string;
  user_id?: string;
  organization_id?: string;
  action: string;
  target_element?: string;
  page_url: string;
  time_spent: number;
  timestamp?: string;
  session_id?: string;
}

export interface BusinessMetric {
  id?: string;
  organization_id: string;
  metric_type: 'revenue' | 'projects' | 'tasks' | 'users' | 'customers';
  metric_name: string;
  metric_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  timestamp?: string;
  comparison_period?: number;
  growth_rate?: number;
}

class AnalyticsService {
  private sessionId: string;
  private startTime: number;
  private isTracking: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeTracking() {
    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      this.isTracking = false;
      return;
    }

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('your-project') ||
      supabaseKey.includes('your-anon-key')
    ) {
      console.log('Analytics disabled: Supabase not configured');
      this.isTracking = false;
      return;
    }

    // Check if user has opted out of analytics
    const analyticsOptOut = localStorage.getItem('analytics_opt_out');
    if (analyticsOptOut === 'true') {
      this.isTracking = false;
      return;
    }

    this.isTracking = true;

    // Track page load
    this.trackPageView();

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Only set up event listeners if tracking is actually enabled
    if (!this.isTracking) {
      return;
    }

    // Check analytics configuration again
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }

    // Track clicks
    document.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target) {
        this.trackUserBehavior(
          'click',
          target.tagName.toLowerCase(),
          target.className || target.id
        );
      }
    });

    // Track form submissions
    document.addEventListener('submit', e => {
      const form = e.target as HTMLFormElement;
      if (form) {
        this.trackUserBehavior(
          'form_submit',
          form.tagName.toLowerCase(),
          form.action || form.id
        );
      }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackUserBehavior('page_hide', 'document', 'visibility_change');
      } else {
        this.trackUserBehavior('page_show', 'document', 'visibility_change');
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - this.startTime;
      this.trackUserBehavior('page_exit', 'window', 'beforeunload', timeSpent);
    });
  }

  private trackPerformanceMetrics() {
    // Only track performance if analytics is enabled
    if (!this.isTracking || import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }

    // Track page load time
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance(
            'page_load',
            'dom_content_loaded',
            navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            'ms'
          );
          this.trackPerformance(
            'page_load',
            'load_complete',
            navigation.loadEventEnd - navigation.loadEventStart,
            'ms'
          );
          this.trackPerformance(
            'page_load',
            'total_load_time',
            navigation.loadEventEnd - navigation.fetchStart,
            'ms'
          );
        }
      });
    }

    // Track API response times
    this.interceptFetchRequests();
  }

  private interceptFetchRequests() {
    // Only intercept fetch if tracking is enabled
    if (!this.isTracking || import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.trackPerformance('api_response', 'fetch_request', duration, 'ms', {
          url: args[0] as string,
          method: args[1]?.method || 'GET',
          status: response.status,
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.trackPerformance('error', 'fetch_error', duration, 'ms', {
          url: args[0] as string,
          method: args[1]?.method || 'GET',
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    };
  }

  async trackEvent(eventType: string, eventData: Record<string, any> = {}) {
    if (!this.isTracking) return;

    // Check if analytics is enabled and Supabase is configured
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }

    // Double check Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('your-project') ||
      supabaseKey.includes('your-anon-key')
    ) {
      return;
    }

    const event: AnalyticsEvent = {
      event_type: eventType,
      event_data: eventData,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
    };

    try {
      const { error } = await supabase.from('analytics_events').insert([event]);

      if (error) {
        console.error('Analytics event tracking failed:', error);
      }
    } catch (error) {
      console.error('Analytics event tracking error:', error);
    }
  }

  async trackPageView(pageUrl?: string) {
    const url = pageUrl || window.location.href;
    await this.trackEvent('page_view', {
      page_url: url,
      referrer: document.referrer,
      title: document.title,
    });
  }

  async trackUserBehavior(
    action: string,
    targetElement?: string,
    targetId?: string,
    timeSpent?: number
  ) {
    if (!this.isTracking) return;

    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }

    // Double check Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('your-project') ||
      supabaseKey.includes('your-anon-key')
    ) {
      return;
    }

    const behavior: UserBehavior = {
      action,
      target_element: targetElement,
      page_url: window.location.href,
      time_spent: timeSpent || 0,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
    };

    try {
      const { error } = await supabase
        .from('user_behaviors')
        .insert([behavior]);

      if (error) {
        console.error('User behavior tracking failed:', error);
      }
    } catch (error) {
      console.error('User behavior tracking failed:', error);
    }
  }

  async trackPerformance(
    metricType: PerformanceMetric['metric_type'],
    metricName: string,
    metricValue: number,
    unit: string,
    additionalData?: Record<string, any>
  ) {
    if (!this.isTracking) return;

    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }

    // Double check Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('your-project') ||
      supabaseKey.includes('your-anon-key')
    ) {
      return;
    }

    const metric: PerformanceMetric = {
      metric_type: metricType,
      metric_name: metricName,
      metric_value: metricValue,
      unit,
      timestamp: new Date().toISOString(),
      additional_data: additionalData,
    };

    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert([metric]);

      if (error) {
        console.error('Performance metric tracking failed:', error);
      }
    } catch (error) {
      console.error('Performance metric tracking failed:', error);
    }
  }

  async trackBusinessMetric(
    metricType: BusinessMetric['metric_type'],
    metricName: string,
    metricValue: number,
    period: BusinessMetric['period'],
    organizationId: string
  ) {
    if (!this.isTracking) return;

    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }

    const metric: BusinessMetric = {
      organization_id: organizationId,
      metric_type: metricType,
      metric_name: metricName,
      metric_value: metricValue,
      period,
      timestamp: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('business_metrics')
        .insert([metric]);

      if (error) {
        console.error('Business metric tracking failed:', error);
      }
    } catch (error) {
      console.error('Business metric tracking failed:', error);
    }
  }

  async getAnalytics(
    organizationId: string,
    startDate?: string,
    endDate?: string
  ) {
    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return {
        events: [],
        performance: [],
        behaviors: [],
        business: [],
      };
    }

    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    try {
      const [eventsResult, performanceResult, behaviorsResult, businessResult] =
        await Promise.all([
          supabase
            .from('analytics_events')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('timestamp', start)
            .lte('timestamp', end)
            .order('timestamp', { ascending: false }),

          supabase
            .from('performance_metrics')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('timestamp', start)
            .lte('timestamp', end)
            .order('timestamp', { ascending: false }),

          supabase
            .from('user_behaviors')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('timestamp', start)
            .lte('timestamp', end)
            .order('timestamp', { ascending: false }),

          supabase
            .from('business_metrics')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('timestamp', start)
            .lte('timestamp', end)
            .order('timestamp', { ascending: false }),
        ]);

      return {
        events: eventsResult.data || [],
        performance: performanceResult.data || [],
        behaviors: behaviorsResult.data || [],
        business: businessResult.data || [],
      };
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return {
        events: [],
        performance: [],
        behaviors: [],
        business: [],
      };
    }
  }

  async getDashboardMetrics(organizationId: string) {
    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        completedTasks: 0,
        revenue: 0,
        growthRate: 0,
      };
    }

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [currentMetrics, previousMetrics] = await Promise.all([
        supabase
          .from('business_metrics')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('timestamp', thirtyDaysAgo.toISOString())
          .lte('timestamp', now.toISOString()),

        supabase
          .from('business_metrics')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('timestamp', sixtyDaysAgo.toISOString())
          .lte('timestamp', thirtyDaysAgo.toISOString()),
      ]);

      const current = currentMetrics.data || [];
      const previous = previousMetrics.data || [];

      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const currentRevenue = current
        .filter(m => m.metric_type === 'revenue')
        .reduce((sum, m) => sum + m.metric_value, 0);

      const previousRevenue = previous
        .filter(m => m.metric_type === 'revenue')
        .reduce((sum, m) => sum + m.metric_value, 0);

      return {
        totalUsers: current.filter(m => m.metric_type === 'users').length,
        activeUsers: current.filter(
          m => m.metric_type === 'users' && m.metric_value > 0
        ).length,
        totalProjects: current.filter(m => m.metric_type === 'projects').length,
        completedTasks: current.filter(
          m => m.metric_type === 'tasks' && m.metric_value > 0
        ).length,
        revenue: currentRevenue,
        growthRate: calculateGrowth(currentRevenue, previousRevenue),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        completedTasks: 0,
        revenue: 0,
        growthRate: 0,
      };
    }
  }

  setTrackingEnabled(enabled: boolean) {
    this.isTracking = enabled;
    localStorage.setItem('analytics_opt_out', (!enabled).toString());
  }

  isTrackingEnabled(): boolean {
    return this.isTracking;
  }
}

// Lazy-loaded singleton instance
let analyticsInstance: AnalyticsService | null = null;

const getAnalyticsInstance = (): AnalyticsService => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
};

// Create a proxy object that only initializes the service when actually used
export const analytics = {
  trackEvent: (eventType: string, eventData: Record<string, any> = {}) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getAnalyticsInstance().trackEvent(eventType, eventData);
  },
  trackPageView: (pageUrl?: string) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getAnalyticsInstance().trackPageView(pageUrl);
  },
  trackUserBehavior: (
    action: string,
    targetElement?: string,
    targetId?: string,
    timeSpent?: number
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getAnalyticsInstance().trackUserBehavior(
      action,
      targetElement,
      targetId,
      timeSpent
    );
  },
  trackPerformance: (
    metricType: PerformanceMetric['metric_type'],
    metricName: string,
    metricValue: number,
    unit: string,
    additionalData?: Record<string, any>
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getAnalyticsInstance().trackPerformance(
      metricType,
      metricName,
      metricValue,
      unit,
      additionalData
    );
  },
  trackBusinessMetric: (
    metricType: BusinessMetric['metric_type'],
    metricName: string,
    metricValue: number,
    period: BusinessMetric['period'],
    organizationId: string
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getAnalyticsInstance().trackBusinessMetric(
      metricType,
      metricName,
      metricValue,
      period,
      organizationId
    );
  },
  getAnalytics: (
    organizationId: string,
    startDate?: string,
    endDate?: string
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return Promise.resolve({
        events: [],
        performance: [],
        behaviors: [],
        business: [],
      });
    }
    return getAnalyticsInstance().getAnalytics(
      organizationId,
      startDate,
      endDate
    );
  },
  getDashboardMetrics: (organizationId: string) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return Promise.resolve({
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        completedTasks: 0,
        revenue: 0,
        growthRate: 0,
      });
    }
    return getAnalyticsInstance().getDashboardMetrics(organizationId);
  },
  setTrackingEnabled: (enabled: boolean) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') return;
    return getAnalyticsInstance().setTrackingEnabled(enabled);
  },
  isTrackingEnabled: () => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') return false;
    return getAnalyticsInstance().isTrackingEnabled();
  },
};

// Export for use in components
export default analytics;
