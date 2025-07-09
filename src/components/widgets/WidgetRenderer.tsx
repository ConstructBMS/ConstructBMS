import React from 'react';
import StatsCards from '../dashboard/StatsCards';
import RevenueChart from '../dashboard/RevenueChart';
import TasksWidget from '../dashboard/TasksWidget';
import ProjectsOverview from '../dashboard/ProjectsOverview';
import RecentActivity from '../dashboard/RecentActivity';
import QuickActions from '../dashboard/QuickActions';

interface WidgetRendererProps {
  type: string;
  config?: any;
  onNavigateToModule?: (module: string) => void;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  type,
  config,
  onNavigateToModule,
}) => {
  switch (type) {
    case 'stats-cards':
      return <StatsCards />;

    case 'revenue-chart':
      return <RevenueChart />;

    case 'tasks-widget':
      return <TasksWidget onNavigateToModule={onNavigateToModule} />;

    case 'projects-overview':
      return <ProjectsOverview onNavigateToModule={onNavigateToModule} />;

    case 'recent-activity':
      return <RecentActivity onNavigateToModule={onNavigateToModule} />;

    case 'quick-actions':
      return <QuickActions onNavigateToModule={onNavigateToModule} />;

    case 'team-overview':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Team Overview</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-blue-600 font-bold text-sm'>TH</span>
                </div>
                <div>
                  <p className='font-medium text-gray-900'>Tom Harvey</p>
                  <p className='text-sm text-gray-500'>Project Manager</p>
                </div>
              </div>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Online
              </span>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-purple-600 font-bold text-sm'>JS</span>
                </div>
                <div>
                  <p className='font-medium text-gray-900'>Jane Smith</p>
                  <p className='text-sm text-gray-500'>Developer</p>
                </div>
              </div>
              <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                Away
              </span>
            </div>
          </div>
        </div>
      );

    case 'calendar-widget':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Calendar</h3>
          <div className='space-y-3'>
            <div className='p-3 bg-blue-50 border-l-4 border-blue-500 rounded'>
              <p className='font-medium text-gray-900'>Team Meeting</p>
              <p className='text-sm text-gray-600'>Today, 2:00 PM</p>
            </div>
            <div className='p-3 bg-green-50 border-l-4 border-green-500 rounded'>
              <p className='font-medium text-gray-900'>Project Review</p>
              <p className='text-sm text-gray-600'>Tomorrow, 10:00 AM</p>
            </div>
            <div className='p-3 bg-purple-50 border-l-4 border-purple-500 rounded'>
              <p className='font-medium text-gray-900'>Client Call</p>
              <p className='text-sm text-gray-600'>Friday, 3:30 PM</p>
            </div>
          </div>
        </div>
      );

    case 'financial-overview':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Financial Overview
          </h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Monthly Revenue</span>
              <span className='font-semibold text-green-600'>£45,230</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Expenses</span>
              <span className='font-semibold text-red-600'>£12,450</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Profit</span>
              <span className='font-semibold text-blue-600'>£32,780</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-500 h-2 rounded-full'
                style={{ width: '72%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    case 'notifications-widget':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Notifications</h3>
          <div className='space-y-3'>
            <div className='flex items-start space-x-3 p-3 bg-blue-50 rounded-lg'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm font-medium text-gray-900'>
                  New project assigned
                </p>
                <p className='text-xs text-gray-600'>2 minutes ago</p>
              </div>
            </div>
            <div className='flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm font-medium text-gray-900'>
                  Task deadline approaching
                </p>
                <p className='text-xs text-gray-600'>15 minutes ago</p>
              </div>
            </div>
            <div className='flex items-start space-x-3 p-3 bg-green-50 rounded-lg'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm font-medium text-gray-900'>
                  Invoice approved
                </p>
                <p className='text-xs text-gray-600'>1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      );

    // Analytics Widgets
    case 'performance-metrics':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Performance Metrics
          </h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>98.5%</div>
              <div className='text-sm text-gray-600'>Uptime</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>2.3s</div>
              <div className='text-sm text-gray-600'>Response Time</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>1,247</div>
              <div className='text-sm text-gray-600'>Active Users</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>89%</div>
              <div className='text-sm text-gray-600'>Satisfaction</div>
            </div>
          </div>
        </div>
      );

    case 'conversion-funnel':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Conversion Funnel
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Visitors</span>
              <span className='font-semibold'>10,000</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-500 h-2 rounded-full'
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Leads</span>
              <span className='font-semibold'>1,200</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-500 h-2 rounded-full'
                style={{ width: '12%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Customers</span>
              <span className='font-semibold'>240</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-purple-500 h-2 rounded-full'
                style={{ width: '2.4%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    // Communication Widgets
    case 'email-overview':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Email Overview</h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Inbox</span>
              <span className='font-semibold text-blue-600'>23</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Unread</span>
              <span className='font-semibold text-red-600'>7</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Sent Today</span>
              <span className='font-semibold text-green-600'>12</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Drafts</span>
              <span className='font-semibold text-yellow-600'>3</span>
            </div>
          </div>
        </div>
      );

    case 'chat-activity':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Chat Activity</h3>
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 p-2 bg-gray-50 rounded'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Support Team</p>
                <p className='text-xs text-gray-500'>Last message: 2 min ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 bg-gray-50 rounded'>
              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Development</p>
                <p className='text-xs text-gray-500'>
                  Last message: 15 min ago
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 bg-gray-50 rounded'>
              <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Marketing</p>
                <p className='text-xs text-gray-500'>
                  Last message: 1 hour ago
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    // Monitoring Widgets
    case 'system-health':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>System Health</h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>CPU Usage</span>
              <span className='font-semibold text-green-600'>45%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-500 h-2 rounded-full'
                style={{ width: '45%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Memory</span>
              <span className='font-semibold text-yellow-600'>78%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-yellow-500 h-2 rounded-full'
                style={{ width: '78%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Disk Space</span>
              <span className='font-semibold text-green-600'>32%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-500 h-2 rounded-full'
                style={{ width: '32%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    case 'error-logs':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Error Logs</h3>
          <div className='space-y-3'>
            <div className='p-3 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-sm font-medium text-red-900'>
                Database Connection Failed
              </p>
              <p className='text-xs text-red-700'>2 minutes ago</p>
            </div>
            <div className='p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
              <p className='text-sm font-medium text-yellow-900'>
                High Memory Usage
              </p>
              <p className='text-xs text-yellow-700'>15 minutes ago</p>
            </div>
            <div className='p-3 bg-blue-50 border-l-4 border-blue-500 rounded'>
              <p className='text-sm font-medium text-blue-900'>
                Backup Completed
              </p>
              <p className='text-xs text-blue-700'>1 hour ago</p>
            </div>
          </div>
        </div>
      );

    // Finance Widgets
    case 'expense-tracker':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Expense Tracker</h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Office Supplies</span>
              <span className='font-semibold text-red-600'>£450</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Software Licenses</span>
              <span className='font-semibold text-red-600'>£1,200</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Travel</span>
              <span className='font-semibold text-red-600'>£800</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Marketing</span>
              <span className='font-semibold text-red-600'>£2,100</span>
            </div>
            <div className='border-t pt-2'>
              <div className='flex justify-between items-center font-semibold'>
                <span>Total</span>
                <span className='text-red-600'>£4,550</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'budget-overview':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Budget Overview</h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-600'>Q1 Budget</span>
                <span className='text-sm font-semibold'>£50,000</span>
              </div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-600'>Spent</span>
                <span className='text-sm font-semibold text-red-600'>
                  £32,450
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full'
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-bold text-green-600'>£17,550</div>
              <div className='text-sm text-gray-600'>Remaining</div>
            </div>
          </div>
        </div>
      );

    // Document Widgets
    case 'document-library':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Document Library</h3>
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-blue-100 rounded flex items-center justify-center'>
                <span className='text-blue-600 text-xs'>PDF</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Q1 Report</p>
                <p className='text-xs text-gray-500'>Updated 2 days ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-green-100 rounded flex items-center justify-center'>
                <span className='text-green-600 text-xs'>DOC</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Project Proposal</p>
                <p className='text-xs text-gray-500'>Updated 1 week ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-purple-100 rounded flex items-center justify-center'>
                <span className='text-purple-600 text-xs'>XLS</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Budget Spreadsheet</p>
                <p className='text-xs text-gray-500'>Updated 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      );

    // IT Widgets
    case 'server-status':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Server Status</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                <span className='font-medium'>Web Server</span>
              </div>
              <span className='text-sm text-green-600'>Online</span>
            </div>
            <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                <span className='font-medium'>Database</span>
              </div>
              <span className='text-sm text-green-600'>Online</span>
            </div>
            <div className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-yellow-500 rounded-full mr-3'></div>
                <span className='font-medium'>Backup Server</span>
              </div>
              <span className='text-sm text-yellow-600'>Maintenance</span>
            </div>
          </div>
        </div>
      );

    case 'backup-status':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Backup Status</h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Last Backup</span>
              <span className='font-semibold text-green-600'>2 hours ago</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Next Backup</span>
              <span className='font-semibold text-blue-600'>22 hours</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Backup Size</span>
              <span className='font-semibold'>2.4 GB</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Status</span>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Success
              </span>
            </div>
          </div>
        </div>
      );

    case 'security-alerts':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Security Alerts</h3>
          <div className='space-y-3'>
            <div className='p-3 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-sm font-medium text-red-900'>
                Failed Login Attempt
              </p>
              <p className='text-xs text-red-700'>
                Multiple attempts from IP: 192.168.1.100
              </p>
            </div>
            <div className='p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
              <p className='text-sm font-medium text-yellow-900'>
                SSL Certificate Expiring
              </p>
              <p className='text-xs text-yellow-700'>Expires in 15 days</p>
            </div>
            <div className='p-3 bg-green-50 border-l-4 border-green-500 rounded'>
              <p className='text-sm font-medium text-green-900'>
                Security Scan Complete
              </p>
              <p className='text-xs text-green-700'>No vulnerabilities found</p>
            </div>
          </div>
        </div>
      );

    // Marketing Widgets
    case 'campaign-performance':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Campaign Performance
          </h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Email Campaign</span>
              <span className='font-semibold text-green-600'>24.5%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-500 h-2 rounded-full'
                style={{ width: '24.5%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Social Media</span>
              <span className='font-semibold text-blue-600'>18.2%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-500 h-2 rounded-full'
                style={{ width: '18.2%' }}
              ></div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>PPC Ads</span>
              <span className='font-semibold text-purple-600'>32.1%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-purple-500 h-2 rounded-full'
                style={{ width: '32.1%' }}
              ></div>
            </div>
          </div>
        </div>
      );

    case 'social-media-feed':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Social Media Feed
          </h3>
          <div className='space-y-3'>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-6 h-6 bg-blue-500 rounded'></div>
                <span className='text-sm font-medium'>Twitter</span>
              </div>
              <p className='text-sm text-gray-700'>
                New product launch getting great feedback! #innovation
              </p>
            </div>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-6 h-6 bg-blue-600 rounded'></div>
                <span className='text-sm font-medium'>LinkedIn</span>
              </div>
              <p className='text-sm text-gray-700'>
                Excited to announce our latest partnership...
              </p>
            </div>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-6 h-6 bg-blue-400 rounded'></div>
                <span className='text-sm font-medium'>Facebook</span>
              </div>
              <p className='text-sm text-gray-700'>
                Behind the scenes of our latest project...
              </p>
            </div>
          </div>
        </div>
      );

    // Weather Widget
    case 'weather-widget':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Weather</h3>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>22°C</div>
            <div className='text-sm text-gray-600 mb-4'>London, UK</div>
            <div className='flex justify-between text-sm'>
              <div>
                <div className='text-gray-600'>Humidity</div>
                <div className='font-semibold'>65%</div>
              </div>
              <div>
                <div className='text-gray-600'>Wind</div>
                <div className='font-semibold'>12 km/h</div>
              </div>
              <div>
                <div className='text-gray-600'>UV Index</div>
                <div className='font-semibold'>3</div>
              </div>
            </div>
          </div>
        </div>
      );

    // Custom Widgets
    case 'custom-html':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Custom HTML</h3>
          <div className='text-center text-gray-500'>
            <p className='text-sm'>Configure custom HTML content</p>
            <p className='text-xs mt-2'>Click the settings icon to edit</p>
          </div>
        </div>
      );

    case 'iframe-widget':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>External Website</h3>
          <div className='text-center text-gray-500'>
            <p className='text-sm'>Configure external website URL</p>
            <p className='text-xs mt-2'>Click the settings icon to edit</p>
          </div>
        </div>
      );

    // Additional widgets
    case 'time-tracking':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Time Tracking</h3>
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>6h 23m</div>
              <div className='text-sm text-gray-600'>Today</div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Project A</span>
                <span className='font-semibold'>3h 45m</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Project B</span>
                <span className='font-semibold'>2h 38m</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'goals-progress':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Goals Progress</h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-600'>Q1 Revenue Target</span>
                <span className='text-sm font-semibold'>78%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full'
                  style={{ width: '78%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-600'>
                  Customer Acquisition
                </span>
                <span className='text-sm font-semibold'>92%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full'
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'meeting-schedule':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Meeting Schedule</h3>
          <div className='space-y-3'>
            <div className='p-3 bg-blue-50 border-l-4 border-blue-500 rounded'>
              <p className='font-medium text-gray-900'>Weekly Standup</p>
              <p className='text-sm text-gray-600'>Today, 9:00 AM</p>
            </div>
            <div className='p-3 bg-green-50 border-l-4 border-green-500 rounded'>
              <p className='font-medium text-gray-900'>Client Review</p>
              <p className='text-sm text-gray-600'>Tomorrow, 2:00 PM</p>
            </div>
            <div className='p-3 bg-purple-50 border-l-4 border-purple-500 rounded'>
              <p className='font-medium text-gray-900'>Team Retrospective</p>
              <p className='text-sm text-gray-600'>Friday, 3:30 PM</p>
            </div>
          </div>
        </div>
      );

    case 'deadlines':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Deadlines</h3>
          <div className='space-y-3'>
            <div className='p-3 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='font-medium text-gray-900'>Project Alpha</p>
              <p className='text-sm text-gray-600'>Due: Today</p>
            </div>
            <div className='p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
              <p className='font-medium text-gray-900'>Beta Testing</p>
              <p className='text-sm text-gray-600'>Due: Tomorrow</p>
            </div>
            <div className='p-3 bg-green-50 border-l-4 border-green-500 rounded'>
              <p className='font-medium text-gray-900'>Documentation</p>
              <p className='text-sm text-gray-600'>Due: Next Week</p>
            </div>
          </div>
        </div>
      );

    case 'team-availability':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Team Availability
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-2 bg-green-50 rounded'>
              <span className='font-medium'>Tom Harvey</span>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Available
              </span>
            </div>
            <div className='flex items-center justify-between p-2 bg-yellow-50 rounded'>
              <span className='font-medium'>Jane Smith</span>
              <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                In Meeting
              </span>
            </div>
            <div className='flex items-center justify-between p-2 bg-red-50 rounded'>
              <span className='font-medium'>Mike Johnson</span>
              <span className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'>
                Offline
              </span>
            </div>
          </div>
        </div>
      );

    case 'favorites':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Favorites</h3>
          <div className='space-y-2'>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-6 h-6 bg-blue-100 rounded flex items-center justify-center'>
                <span className='text-blue-600 text-xs'>P</span>
              </div>
              <span className='text-sm font-medium'>Projects</span>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-6 h-6 bg-green-100 rounded flex items-center justify-center'>
                <span className='text-green-600 text-xs'>T</span>
              </div>
              <span className='text-sm font-medium'>Tasks</span>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-6 h-6 bg-purple-100 rounded flex items-center justify-center'>
                <span className='text-purple-600 text-xs'>C</span>
              </div>
              <span className='text-sm font-medium'>Calendar</span>
            </div>
          </div>
        </div>
      );

    case 'recent-documents':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Recent Documents</h3>
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-blue-100 rounded flex items-center justify-center'>
                <span className='text-blue-600 text-xs'>PDF</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Monthly Report</p>
                <p className='text-xs text-gray-500'>Opened 2 hours ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-green-100 rounded flex items-center justify-center'>
                <span className='text-green-600 text-xs'>DOC</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Meeting Notes</p>
                <p className='text-xs text-gray-500'>Opened 1 day ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer'>
              <div className='w-8 h-8 bg-purple-100 rounded flex items-center justify-center'>
                <span className='text-purple-600 text-xs'>XLS</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Budget 2024</p>
                <p className='text-xs text-gray-500'>Opened 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'inventory-status':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>Inventory Status</h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Product A</span>
              <span className='font-semibold text-green-600'>In Stock</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Product B</span>
              <span className='font-semibold text-yellow-600'>Low Stock</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Product C</span>
              <span className='font-semibold text-red-600'>Out of Stock</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Total Items</span>
              <span className='font-semibold'>1,247</span>
            </div>
          </div>
        </div>
      );

    case 'maintenance-schedule':
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-4'>
            Maintenance Schedule
          </h3>
          <div className='space-y-3'>
            <div className='p-3 bg-blue-50 border-l-4 border-blue-500 rounded'>
              <p className='font-medium text-gray-900'>Server Maintenance</p>
              <p className='text-sm text-gray-600'>
                Scheduled: Tomorrow, 2:00 AM
              </p>
            </div>
            <div className='p-3 bg-green-50 border-l-4 border-green-500 rounded'>
              <p className='font-medium text-gray-900'>Backup System</p>
              <p className='text-sm text-gray-600'>Last: Today, 1:00 AM</p>
            </div>
            <div className='p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
              <p className='font-medium text-gray-900'>Security Updates</p>
              <p className='text-sm text-gray-600'>Due: This weekend</p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <p className='text-gray-500'>Widget type "{type}" not found</p>
        </div>
      );
  }
};

export default WidgetRenderer;
