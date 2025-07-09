import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Share2,
  FileText,
  Mail,
  Clock,
  Star,
  Flag,
  Archive,
  Trash2,
  Users,
  Building,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface EmailAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  emailVolume: { date: string; count: number }[];
  responseTime: { category: string; avgHours: number }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  priorityBreakdown: { priority: string; count: number; color: string }[];
  senderActivity: { sender: string; count: number; lastActivity: string }[];
  timeOfDay: { hour: number; count: number }[];
  weeklyTrends: { week: string; sent: number; received: number }[];
  performanceMetrics: {
    avgResponseTime: number;
    totalEmails: number;
    unreadCount: number;
    flaggedCount: number;
    attachmentCount: number;
  };
}

const EmailAnalyticsModal: React.FC<EmailAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [chartType, setChartType] = useState('bar');
  const [showCustomization, setShowCustomization] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    emailVolume: [
      { date: '2024-01-01', count: 45 },
      { date: '2024-01-02', count: 52 },
      { date: '2024-01-03', count: 38 },
      { date: '2024-01-04', count: 67 },
      { date: '2024-01-05', count: 41 },
      { date: '2024-01-06', count: 29 },
      { date: '2024-01-07', count: 33 },
    ],
    responseTime: [
      { category: 'Critical', avgHours: 2.5 },
      { category: 'High', avgHours: 4.2 },
      { category: 'Medium', avgHours: 8.7 },
      { category: 'Low', avgHours: 24.3 },
    ],
    categoryDistribution: [
      { category: 'Project-related', count: 156, percentage: 35 },
      { category: 'Client Communication', count: 89, percentage: 20 },
      { category: 'Internal Team', count: 78, percentage: 18 },
      { category: 'Invoice/Payment', count: 67, percentage: 15 },
      { category: 'Urgent/Actionable', count: 44, percentage: 12 },
    ],
    priorityBreakdown: [
      { priority: 'Critical', count: 23, color: '#ef4444' },
      { priority: 'High', count: 67, color: '#f97316' },
      { priority: 'Medium', count: 189, color: '#eab308' },
      { priority: 'Low', count: 156, color: '#22c55e' },
    ],
    senderActivity: [
      { sender: 'TechCorp Solutions', count: 45, lastActivity: '2 hours ago' },
      { sender: 'Project Manager', count: 38, lastActivity: '1 day ago' },
      { sender: 'Client Support', count: 32, lastActivity: '3 hours ago' },
      { sender: 'Finance Team', count: 28, lastActivity: '5 hours ago' },
      { sender: 'Development Team', count: 25, lastActivity: '1 day ago' },
    ],
    timeOfDay: [
      { hour: 9, count: 45 },
      { hour: 10, count: 67 },
      { hour: 11, count: 52 },
      { hour: 12, count: 38 },
      { hour: 13, count: 41 },
      { hour: 14, count: 58 },
      { hour: 15, count: 63 },
      { hour: 16, count: 49 },
      { hour: 17, count: 34 },
    ],
    weeklyTrends: [
      { week: 'Week 1', sent: 45, received: 67 },
      { week: 'Week 2', sent: 52, received: 73 },
      { week: 'Week 3', sent: 38, received: 58 },
      { week: 'Week 4', sent: 67, received: 89 },
    ],
    performanceMetrics: {
      avgResponseTime: 6.2,
      totalEmails: 435,
      unreadCount: 23,
      flaggedCount: 12,
      attachmentCount: 89,
    },
  });

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'volume', label: 'Email Volume', icon: TrendingUp },
    { key: 'response', label: 'Response Time', icon: Clock },
    { key: 'categories', label: 'Categories', icon: PieChart },
    { key: 'senders', label: 'Top Senders', icon: Users },
    { key: 'performance', label: 'Performance', icon: Activity },
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' },
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'area', label: 'Area Chart', icon: Activity },
  ];

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const renderChart = (type: string, data: any) => {
    // Simple chart rendering - in a real app, you'd use a charting library like Chart.js or Recharts
    return (
      <div className='bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center'>
        <div className='text-center'>
          <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-2' />
          <p className='text-sm text-gray-600'>Chart: {type}</p>
          <p className='text-xs text-gray-500'>Data points: {data.length}</p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-4'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Email Analytics
            </h2>
            <div className='flex items-center space-x-2'>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className='text-sm border border-gray-300 rounded px-3 py-1'
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className='p-2 hover:bg-gray-100 rounded transition-colors'
              >
                <Settings className='w-4 h-4' />
              </button>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={exportData}
              className='flex items-center space-x-2 px-4 py-2 bg-archer-neon text-black rounded-lg hover:bg-opacity-90 transition-colors'
            >
              <Download className='w-4 h-4' />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Customization Panel */}
        {showCustomization && (
          <div className='bg-gray-50 border-b border-gray-200 p-4'>
            <div className='flex items-center space-x-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Chart Type
                </label>
                <select
                  value={chartType}
                  onChange={e => setChartType(e.target.value)}
                  className='text-sm border border-gray-300 rounded px-3 py-1'
                >
                  {chartTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Refresh Interval
                </label>
                <select className='text-sm border border-gray-300 rounded px-3 py-1'>
                  <option value='manual'>Manual</option>
                  <option value='5m'>5 minutes</option>
                  <option value='15m'>15 minutes</option>
                  <option value='1h'>1 hour</option>
                </select>
              </div>
              <div className='flex items-center space-x-2'>
                <input type='checkbox' id='auto-refresh' className='rounded' />
                <label htmlFor='auto-refresh' className='text-sm text-gray-700'>
                  Auto-refresh
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Sidebar */}
          <div className='w-64 bg-gray-50 border-r border-gray-200 p-4'>
            <nav className='space-y-1'>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.key
                        ? 'bg-archer-neon text-black'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span className='font-medium'>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Overview Dashboard</h3>

                {/* Key Metrics */}
                <div className='grid grid-cols-5 gap-4'>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>Total Emails</p>
                        <p className='text-2xl font-bold'>
                          {analyticsData.performanceMetrics.totalEmails}
                        </p>
                      </div>
                      <Mail className='w-8 h-8 text-blue-500' />
                    </div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>Avg Response</p>
                        <p className='text-2xl font-bold'>
                          {analyticsData.performanceMetrics.avgResponseTime}h
                        </p>
                      </div>
                      <Clock className='w-8 h-8 text-green-500' />
                    </div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>Unread</p>
                        <p className='text-2xl font-bold'>
                          {analyticsData.performanceMetrics.unreadCount}
                        </p>
                      </div>
                      <Eye className='w-8 h-8 text-orange-500' />
                    </div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>Flagged</p>
                        <p className='text-2xl font-bold'>
                          {analyticsData.performanceMetrics.flaggedCount}
                        </p>
                      </div>
                      <Flag className='w-8 h-8 text-red-500' />
                    </div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>Attachments</p>
                        <p className='text-2xl font-bold'>
                          {analyticsData.performanceMetrics.attachmentCount}
                        </p>
                      </div>
                      <FileText className='w-8 h-8 text-purple-500' />
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <h4 className='font-medium mb-3'>Email Volume Trend</h4>
                    {renderChart('line', analyticsData.emailVolume)}
                  </div>
                  <div>
                    <h4 className='font-medium mb-3'>Category Distribution</h4>
                    {renderChart('pie', analyticsData.categoryDistribution)}
                  </div>
                  <div>
                    <h4 className='font-medium mb-3'>
                      Response Time by Priority
                    </h4>
                    {renderChart('bar', analyticsData.responseTime)}
                  </div>
                  <div>
                    <h4 className='font-medium mb-3'>Weekly Trends</h4>
                    {renderChart('area', analyticsData.weeklyTrends)}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'volume' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Email Volume Analysis</h3>
                <div className='grid grid-cols-1 gap-6'>
                  <div>
                    <h4 className='font-medium mb-3'>Daily Email Volume</h4>
                    {renderChart('bar', analyticsData.emailVolume)}
                  </div>
                  <div>
                    <h4 className='font-medium mb-3'>
                      Time of Day Distribution
                    </h4>
                    {renderChart('line', analyticsData.timeOfDay)}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'response' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>
                  Response Time Analysis
                </h3>
                <div className='grid grid-cols-1 gap-6'>
                  <div>
                    <h4 className='font-medium mb-3'>
                      Average Response Time by Priority
                    </h4>
                    {renderChart('bar', analyticsData.responseTime)}
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <h4 className='font-medium mb-3'>Response Time Insights</h4>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm'>Critical emails</span>
                        <span className='text-sm font-medium'>
                          {analyticsData.responseTime[0].avgHours}h average
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm'>High priority</span>
                        <span className='text-sm font-medium'>
                          {analyticsData.responseTime[1].avgHours}h average
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm'>Medium priority</span>
                        <span className='text-sm font-medium'>
                          {analyticsData.responseTime[2].avgHours}h average
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Category Analysis</h3>
                <div className='grid grid-cols-1 gap-6'>
                  <div>
                    <h4 className='font-medium mb-3'>
                      Email Distribution by Category
                    </h4>
                    {renderChart('pie', analyticsData.categoryDistribution)}
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <h4 className='font-medium mb-3'>Category Breakdown</h4>
                    <div className='space-y-3'>
                      {analyticsData.categoryDistribution.map(
                        (category, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <div className='flex items-center space-x-3'>
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                                }}
                              ></div>
                              <span className='text-sm'>
                                {category.category}
                              </span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <span className='text-sm font-medium'>
                                {category.count}
                              </span>
                              <span className='text-sm text-gray-500'>
                                ({category.percentage}%)
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'senders' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Top Senders Analysis</h3>
                <div className='bg-white border border-gray-200 rounded-lg'>
                  <div className='p-4 border-b border-gray-200'>
                    <h4 className='font-medium'>Most Active Senders</h4>
                  </div>
                  <div className='divide-y divide-gray-200'>
                    {analyticsData.senderActivity.map((sender, index) => (
                      <div
                        key={index}
                        className='p-4 flex items-center justify-between'
                      >
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                            <Users className='w-4 h-4 text-gray-600' />
                          </div>
                          <div>
                            <p className='font-medium'>{sender.sender}</p>
                            <p className='text-sm text-gray-500'>
                              Last activity: {sender.lastActivity}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{sender.count} emails</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Performance Metrics</h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <h4 className='font-medium mb-3'>Priority Distribution</h4>
                    <div className='space-y-3'>
                      {analyticsData.priorityBreakdown.map(
                        (priority, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <div className='flex items-center space-x-2'>
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{ backgroundColor: priority.color }}
                              ></div>
                              <span className='text-sm'>
                                {priority.priority}
                              </span>
                            </div>
                            <span className='text-sm font-medium'>
                              {priority.count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <h4 className='font-medium mb-3'>Performance Insights</h4>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm'>Response Rate</span>
                        <span className='text-sm font-medium text-green-600'>
                          94%
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm'>Resolution Time</span>
                        <span className='text-sm font-medium'>2.3 days</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm'>Customer Satisfaction</span>
                        <span className='text-sm font-medium text-green-600'>
                          4.8/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAnalyticsModal;
