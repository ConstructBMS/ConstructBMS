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
  FileText,
  Edit3,
  Share2,
  BookOpen,
  UserCheck,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  documentAnalytics,
  type DocumentAnalytics,
} from '../../services/documentAnalytics';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
}) => (
  <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
          {title}
        </p>
        <p className='text-2xl font-bold text-gray-900 dark:text-white'>
          {value}
        </p>
        {change !== undefined && (
          <div className='flex items-center mt-2'>
            {change >= 0 ? (
              <ArrowUpRight className='w-4 h-4 text-green-600' />
            ) : (
              <ArrowDownRight className='w-4 h-4 text-red-600' />
            )}
            <span
              className={`text-sm font-medium ml-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(change)}%
            </span>
            <span className='text-sm text-gray-500 dark:text-gray-400 ml-1'>
              vs last period
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

const DocumentAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedView, setSelectedView] = useState<
    'overview' | 'documents' | 'users' | 'trends'
  >('overview');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      const startDate = getStartDate(dateRange);
      const analyticsData = await documentAnalytics.getDocumentAnalytics(
        user.organizationId,
        startDate
      );
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load document analytics:', error);
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

  const exportData = () => {
    if (!analytics) return;

    const csvContent = generateCSV(analytics);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (data: DocumentAnalytics): string => {
    const headers = ['Metric', 'Value', 'Details'];
    const rows = [
      ['Total Documents', data.total_documents.toString(), ''],
      ['Total Views', data.total_views.toString(), ''],
      ['Total Edits', data.total_edits.toString(), ''],
      ['Total Shares', data.total_shares.toString(), ''],
      ...data.most_viewed_documents.map(doc => [
        'Most Viewed',
        doc.title,
        `${doc.view_count} views`,
      ]),
      ...data.most_edited_documents.map(doc => [
        'Most Edited',
        doc.title,
        `${doc.edit_count} edits`,
      ]),
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className='h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <RefreshCw className='h-8 w-8 text-gray-400 animate-spin mx-auto mb-4' />
          <p className='text-gray-600 dark:text-gray-400'>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className='h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <BarChart3 className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            No Analytics Data
          </h3>
          <p className='text-gray-600 dark:text-gray-400'>
            Start using documents to see analytics data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full bg-gray-50 dark:bg-gray-900 flex flex-col'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white'>
              Document Analytics
            </h1>
            <p className='text-sm lg:text-base text-gray-600 dark:text-gray-400'>
              Track document usage, engagement, and performance
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
            >
              <option value='7d'>Last 7 days</option>
              <option value='30d'>Last 30 days</option>
              <option value='90d'>Last 90 days</option>
            </select>
            <button
              onClick={exportData}
              className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
            >
              <Download className='h-4 w-4' />
              Export
            </button>
            <button
              onClick={loadAnalytics}
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
            >
              <RefreshCw className='h-4 w-4' />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex space-x-8 px-4 lg:px-6 overflow-x-auto'>
          <button
            onClick={() => setSelectedView('overview')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedView === 'overview'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 className='h-4 w-4 lg:h-5 lg:w-5 inline mr-2' />
            Overview
          </button>
          <button
            onClick={() => setSelectedView('documents')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedView === 'documents'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className='h-4 w-4 lg:h-5 lg:w-5 inline mr-2' />
            Documents
          </button>
          <button
            onClick={() => setSelectedView('users')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedView === 'users'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users className='h-4 w-4 lg:h-5 lg:w-5 inline mr-2' />
            Users
          </button>
          <button
            onClick={() => setSelectedView('trends')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedView === 'trends'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <TrendingUp className='h-4 w-4 lg:h-5 lg:w-5 inline mr-2' />
            Trends
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 lg:p-6'>
        {selectedView === 'overview' && (
          <div className='space-y-6'>
            {/* Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <AnalyticsCard
                title='Total Documents'
                value={formatNumber(analytics.total_documents)}
                icon={<FileText className='h-6 w-6 text-white' />}
                color='bg-blue-500'
              />
              <AnalyticsCard
                title='Total Views'
                value={formatNumber(analytics.total_views)}
                icon={<Eye className='h-6 w-6 text-white' />}
                color='bg-green-500'
              />
              <AnalyticsCard
                title='Total Edits'
                value={formatNumber(analytics.total_edits)}
                icon={<Edit3 className='h-6 w-6 text-white' />}
                color='bg-purple-500'
              />
              <AnalyticsCard
                title='Total Shares'
                value={formatNumber(analytics.total_shares)}
                icon={<Share2 className='h-6 w-6 text-white' />}
                color='bg-orange-500'
              />
            </div>

            {/* Charts Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Category Breakdown */}
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Category Breakdown
                </h3>
                <div className='space-y-3'>
                  {analytics.category_breakdown
                    .slice(0, 5)
                    .map((category, index) => (
                      <div
                        key={category.category}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              [
                                'bg-blue-500',
                                'bg-green-500',
                                'bg-purple-500',
                                'bg-orange-500',
                                'bg-red-500',
                              ][index % 5]
                            }`}
                          ></div>
                          <span className='text-sm text-gray-700 dark:text-gray-300'>
                            {category.category}
                          </span>
                        </div>
                        <div className='text-right'>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {category.document_count} docs
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            {category.view_count} views
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Recent Activity
                </h3>
                <div className='space-y-3'>
                  {analytics.recent_activity
                    .slice(0, 5)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between'
                      >
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                            {activity.title}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                            {activity.action} by {activity.user_id}
                          </p>
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400 ml-2'>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'documents' && (
          <div className='space-y-6'>
            {/* Most Viewed Documents */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                Most Viewed Documents
              </h3>
              <div className='space-y-3'>
                {analytics.most_viewed_documents.map((doc, index) => (
                  <div
                    key={doc.document_id}
                    className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                        <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {doc.title}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {doc.view_count} views
                        </p>
                      </div>
                    </div>
                    <button className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'>
                      <ArrowUpRight className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Edited Documents */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <Edit3 className='h-5 w-5' />
                Most Edited Documents
              </h3>
              <div className='space-y-3'>
                {analytics.most_edited_documents.map((doc, index) => (
                  <div
                    key={doc.document_id}
                    className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center'>
                        <span className='text-sm font-medium text-purple-600 dark:text-purple-400'>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {doc.title}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {doc.edit_count} edits
                        </p>
                      </div>
                    </div>
                    <button className='text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300'>
                      <ArrowUpRight className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'users' && (
          <div className='space-y-6'>
            {/* User Activity */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <UserCheck className='h-5 w-5' />
                User Activity
              </h3>
              <div className='space-y-3'>
                {analytics.user_activity.slice(0, 10).map((user, index) => (
                  <div
                    key={user.user_id}
                    className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                        <Users className='h-4 w-4 text-green-600 dark:text-green-400' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {user.user_id}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {user.documents_created} created,{' '}
                          {user.documents_edited} edited
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {user.total_views} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'trends' && (
          <div className='space-y-6'>
            {/* Time Series Chart */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <LineChart className='h-5 w-5' />
                Activity Trends
              </h3>
              <div className='h-64 flex items-center justify-center'>
                <div className='text-center'>
                  <TrendingUp className='h-12 w-12 text-gray-400 mx-auto mb-2' />
                  <p className='text-gray-600 dark:text-gray-400'>
                    Chart visualization would be implemented here
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-500'>
                    Using libraries like Chart.js or Recharts
                  </p>
                </div>
              </div>
            </div>

            {/* Time Series Data Table */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <CalendarDays className='h-5 w-5' />
                Daily Activity
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-200 dark:border-gray-700'>
                      <th className='text-left py-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Date
                      </th>
                      <th className='text-right py-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Views
                      </th>
                      <th className='text-right py-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Edits
                      </th>
                      <th className='text-right py-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Shares
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.time_series_data.slice(-10).map(data => (
                      <tr
                        key={data.date}
                        className='border-b border-gray-100 dark:border-gray-800'
                      >
                        <td className='py-2 text-sm text-gray-900 dark:text-white'>
                          {new Date(data.date).toLocaleDateString()}
                        </td>
                        <td className='py-2 text-sm text-gray-900 dark:text-white text-right'>
                          {data.views}
                        </td>
                        <td className='py-2 text-sm text-gray-900 dark:text-white text-right'>
                          {data.edits}
                        </td>
                        <td className='py-2 text-sm text-gray-900 dark:text-white text-right'>
                          {data.shares}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentAnalytics;
