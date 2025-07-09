import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  BarChart,
  PieChart,
  LineChart,
  Target,
  Clock,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
} from 'lucide-react';
import {
  analytics,
  AnalyticsEvent,
  PerformanceMetric,
  UserBehavior,
  BusinessMetric,
} from '../../services/analytics';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticsData {
  events: AnalyticsEvent[];
  behaviors: UserBehavior[];
  performance: PerformanceMetric[];
  business: BusinessMetric[];
}

interface DashboardMetrics {
  revenue: { current: number; previous: number; growth: number };
  projects: { current: number; previous: number; growth: number };
  tasks: { current: number; previous: number; growth: number };
  users: { current: number; previous: number; growth: number };
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dashboardMetrics, setDashboardMetrics] =
    useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(
    analytics.isTrackingEnabled()
  );

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    if (!user?.organization_id) return;

    setLoading(true);
    try {
      const startDate = getStartDate(dateRange);
      const analyticsData = await analytics.getAnalytics(
        user.organization_id,
        startDate
      );
      const metrics = await analytics.getDashboardMetrics(user.organization_id);

      setData(analyticsData);
      setDashboardMetrics(metrics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const toggleTracking = () => {
    const newState = !isTrackingEnabled;
    setIsTrackingEnabled(newState);
    analytics.setTrackingEnabled(newState);
  };

  const exportData = () => {
    if (!data) return;

    const csvContent = generateCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (data: AnalyticsData): string => {
    const headers = ['Type', 'Event', 'Timestamp', 'Value', 'Details'];
    const rows = [
      ...data.events.map(e => [
        e.event_type,
        e.event_type,
        e.timestamp,
        '',
        JSON.stringify(e.event_data),
      ]),
      ...data.behaviors.map(b => [
        b.action,
        b.target_element || '',
        b.timestamp,
        b.time_spent.toString(),
        b.page_url,
      ]),
      ...data.performance.map(p => [
        p.metric_type,
        p.metric_name,
        p.timestamp,
        p.metric_value.toString(),
        p.unit,
      ]),
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGrowthColor = (growth: number): string => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className='w-4 h-4 text-green-600' />;
    if (growth < 0)
      return <TrendingUp className='w-4 h-4 text-red-600 rotate-180' />;
    return <Activity className='w-4 h-4 text-gray-600' />;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='w-8 h-8 animate-spin text-blue-600' />
        <span className='ml-2 text-gray-600'>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Analytics & Insights
          </h1>
          <p className='text-gray-600'>
            Track user behavior, performance, and business metrics
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={toggleTracking}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isTrackingEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {isTrackingEnabled ? (
              <Eye className='w-4 h-4 mr-2' />
            ) : (
              <EyeOff className='w-4 h-4 mr-2' />
            )}
            {isTrackingEnabled ? 'Tracking Enabled' : 'Tracking Disabled'}
          </button>
          <button
            onClick={exportData}
            className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Download className='w-4 h-4 mr-2' />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <Calendar className='w-4 h-4 text-gray-500' />
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='7d'>Last 7 days</option>
                <option value='30d'>Last 30 days</option>
                <option value='90d'>Last 90 days</option>
              </select>
            </div>
            <div className='flex items-center space-x-2'>
              <Filter className='w-4 h-4 text-gray-500' />
              <select
                value={selectedMetric}
                onChange={e => setSelectedMetric(e.target.value)}
                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='overview'>Overview</option>
                <option value='user-behavior'>User Behavior</option>
                <option value='performance'>Performance</option>
                <option value='business'>Business Metrics</option>
              </select>
            </div>
          </div>
          <button
            onClick={loadAnalytics}
            className='flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Refresh
          </button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      {dashboardMetrics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Revenue</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatCurrency(dashboardMetrics.revenue.current)}
                </p>
              </div>
              <div className='flex items-center space-x-1'>
                {getGrowthIcon(dashboardMetrics.revenue.growth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(dashboardMetrics.revenue.growth)}`}
                >
                  {dashboardMetrics.revenue.growth > 0 ? '+' : ''}
                  {dashboardMetrics.revenue.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Active Projects
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatNumber(dashboardMetrics.projects.current)}
                </p>
              </div>
              <div className='flex items-center space-x-1'>
                {getGrowthIcon(dashboardMetrics.projects.growth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(dashboardMetrics.projects.growth)}`}
                >
                  {dashboardMetrics.projects.growth > 0 ? '+' : ''}
                  {dashboardMetrics.projects.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Tasks Completed
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatNumber(dashboardMetrics.tasks.current)}
                </p>
              </div>
              <div className='flex items-center space-x-1'>
                {getGrowthIcon(dashboardMetrics.tasks.growth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(dashboardMetrics.tasks.growth)}`}
                >
                  {dashboardMetrics.tasks.growth > 0 ? '+' : ''}
                  {dashboardMetrics.tasks.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Active Users
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatNumber(dashboardMetrics.users.current)}
                </p>
              </div>
              <div className='flex items-center space-x-1'>
                {getGrowthIcon(dashboardMetrics.users.growth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(dashboardMetrics.users.growth)}`}
                >
                  {dashboardMetrics.users.growth > 0 ? '+' : ''}
                  {dashboardMetrics.users.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analytics */}
      {data && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* User Behavior */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                User Behavior
              </h3>
              <MousePointer className='w-5 h-5 text-gray-500' />
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Total Clicks</span>
                <span className='font-medium'>
                  {data.behaviors.filter(b => b.action === 'click').length}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Form Submissions</span>
                <span className='font-medium'>
                  {
                    data.behaviors.filter(b => b.action === 'form_submit')
                      .length
                  }
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Page Views</span>
                <span className='font-medium'>
                  {data.events.filter(e => e.event_type === 'page_view').length}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Avg. Session Time</span>
                <span className='font-medium'>
                  {Math.round(
                    data.behaviors.reduce((sum, b) => sum + b.time_spent, 0) /
                      Math.max(data.behaviors.length, 1) /
                      1000
                  )}
                  s
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Performance
              </h3>
              <Activity className='w-5 h-5 text-gray-500' />
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>
                  Avg. Page Load Time
                </span>
                <span className='font-medium'>
                  {Math.round(
                    data.performance
                      .filter(p => p.metric_name === 'total_load_time')
                      .reduce((sum, p) => sum + p.metric_value, 0) /
                      Math.max(
                        data.performance.filter(
                          p => p.metric_name === 'total_load_time'
                        ).length,
                        1
                      )
                  )}
                  ms
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>API Response Time</span>
                <span className='font-medium'>
                  {Math.round(
                    data.performance
                      .filter(p => p.metric_type === 'api_response')
                      .reduce((sum, p) => sum + p.metric_value, 0) /
                      Math.max(
                        data.performance.filter(
                          p => p.metric_type === 'api_response'
                        ).length,
                        1
                      )
                  )}
                  ms
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Error Rate</span>
                <span className='font-medium'>
                  {(
                    (data.performance.filter(p => p.metric_type === 'error')
                      .length /
                      Math.max(data.performance.length, 1)) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Total Events</span>
                <span className='font-medium'>{data.events.length}</span>
              </div>
            </div>
          </div>

          {/* Device Analytics */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Device Usage
              </h3>
              <div className='flex space-x-2'>
                <Monitor className='w-5 h-5 text-gray-500' />
                <Smartphone className='w-5 h-5 text-gray-500' />
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Desktop</span>
                <span className='font-medium'>65%</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Mobile</span>
                <span className='font-medium'>30%</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Tablet</span>
                <span className='font-medium'>5%</span>
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Geographic Distribution
              </h3>
              <Globe className='w-5 h-5 text-gray-500' />
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>United States</span>
                <span className='font-medium'>45%</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Europe</span>
                <span className='font-medium'>30%</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Asia Pacific</span>
                <span className='font-medium'>20%</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Other</span>
                <span className='font-medium'>5%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Placeholder */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Trends & Patterns
          </h3>
          <div className='flex space-x-2'>
            <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
              <LineChart className='w-5 h-5 text-gray-500' />
            </button>
            <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
              <BarChart className='w-5 h-5 text-gray-500' />
            </button>
            <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
              <PieChart className='w-5 h-5 text-gray-500' />
            </button>
          </div>
        </div>
        <div className='h-64 bg-gray-50 rounded-lg flex items-center justify-center'>
          <div className='text-center'>
            <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-2' />
            <p className='text-gray-500'>Interactive charts coming soon</p>
            <p className='text-sm text-gray-400'>
              Real-time data visualization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
