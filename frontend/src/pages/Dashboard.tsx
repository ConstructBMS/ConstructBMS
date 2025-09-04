import { useTheme } from '@/hooks/useTheme';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  FolderOpen,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import React from 'react';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();

  const stats = [
    {
      name: 'Active Projects',
      value: '12',
      change: '+2.5%',
      changeType: 'positive',
      icon: FolderOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Clients',
      value: '45',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Tasks',
      value: '28',
      change: '-5%',
      changeType: 'negative',
      icon: CheckSquare,
      color: 'bg-yellow-600',
    },
    {
      name: 'Revenue',
      value: '£245,000',
      change: '+18%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Office Building Renovation',
      client: 'ABC Corporation',
      status: 'in_progress',
      progress: 65,
      dueDate: '2024-02-15',
    },
    {
      id: 2,
      name: 'Residential Complex',
      client: 'XYZ Developers',
      status: 'planning',
      progress: 25,
      dueDate: '2024-03-20',
    },
    {
      id: 3,
      name: 'Shopping Center',
      client: 'Retail Group Ltd',
      status: 'completed',
      progress: 100,
      dueDate: '2024-01-30',
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Review construction plans',
      project: 'Office Building Renovation',
      dueDate: '2024-01-15',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Client meeting',
      project: 'Residential Complex',
      dueDate: '2024-01-16',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Material procurement',
      project: 'Shopping Center',
      dueDate: '2024-01-17',
      priority: 'low',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case 'in_progress':
        return <Clock className='w-5 h-5 text-blue-600' />;
      case 'planning':
        return <AlertCircle className='w-5 h-5 text-yellow-600' />;
      default:
        return <XCircle className='w-5 h-5 text-red-600' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
        >
          Dashboard
        </h1>
        <p style={{ color: theme === 'light' ? '#1e293b' : '#d1d5db' }}>
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map(stat => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.name} className='card'>
              <div className='flex items-center'>
                <div className={`p-3 rounded-lg ${stat.color} shadow-lg`}>
                  <IconComponent className='w-6 h-6 text-white drop-shadow-lg' />
                </div>
                <div className='ml-4'>
                  <p
                    className='text-sm font-medium'
                    style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
                  >
                    {stat.name}
                  </p>
                  <p
                    className='text-2xl font-bold'
                    style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className='mt-4'>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span
                  className='text-sm ml-1'
                  style={{ color: theme === 'light' ? '#1e293b' : '#d1d5db' }}
                >
                  from last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Projects */}
        <div className='card'>
          <div className='flex items-center justify-between mb-3 sm:mb-4 lg:mb-6'>
            <h2
              className='text-base sm:text-lg lg:text-xl font-semibold'
              style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
            >
              Recent Projects
            </h2>
            <button className='text-xs sm:text-sm lg:text-base text-primary-600 hover:text-primary-500'>
              View all
            </button>
          </div>
          <div className='space-y-3 sm:space-y-4 lg:space-y-6'>
            {recentProjects.map(project => (
              <div
                key={project.id}
                className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 lg:p-5 bg-gray-50 rounded-lg space-y-2 sm:space-y-0'
              >
                <div className='flex items-center space-x-3 min-w-0 flex-1'>
                  {getStatusIcon(project.status)}
                  <div className='min-w-0 flex-1'>
                    <p
                      className='font-medium text-sm sm:text-base lg:text-lg truncate'
                      style={{
                        color: theme === 'light' ? '#1e293b' : '#f9fafb',
                      }}
                    >
                      {project.name}
                    </p>
                    <p
                      className='text-xs sm:text-sm lg:text-base text-gray-600 truncate'
                      style={{
                        color: theme === 'light' ? '#1e293b' : '#d1d5db',
                      }}
                    >
                      {project.client}
                    </p>
                  </div>
                </div>
                <div className='flex flex-col sm:items-end space-y-2 sm:space-y-1'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-16 sm:w-20 lg:w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-primary-600 h-2 rounded-full'
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span
                      className='text-xs sm:text-sm lg:text-base text-gray-600'
                      style={{
                        color: theme === 'light' ? '#1e293b' : '#d1d5db',
                      }}
                    >
                      {project.progress}%
                    </span>
                  </div>
                  <p
                    className='text-xs sm:text-sm text-gray-500'
                    style={{ color: theme === 'light' ? '#1e293b' : '#d1d5db' }}
                  >
                    Due: {project.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className='card'>
          <div className='flex items-center justify-between mb-4'>
            <h2
              className='text-lg font-semibold'
              style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
            >
              Upcoming Tasks
            </h2>
            <button className='text-sm text-primary-600 hover:text-primary-500'>
              View all
            </button>
          </div>
          <div className='space-y-3'>
            {upcomingTasks.map(task => (
              <div
                key={task.id}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <CheckSquare className='w-5 h-5 text-gray-400' />
                  <div>
                    <p
                      className='font-medium'
                      style={{
                        color: theme === 'light' ? '#1e293b' : '#f9fafb',
                      }}
                    >
                      {task.title}
                    </p>
                    <p
                      className='text-sm'
                      style={{
                        color: theme === 'light' ? '#1e293b' : '#d1d5db',
                      }}
                    >
                      {task.project}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                  <p
                    className='text-xs mt-1'
                    style={{ color: theme === 'light' ? '#1e293b' : '#d1d5db' }}
                  >
                    {task.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='card'>
        <h2
          className='text-lg font-semibold mb-4'
          style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
        >
          Quick Actions
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <button className='flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors'>
            <FolderOpen className='w-8 h-8 text-primary-600 mb-2' />
            <span className='text-sm font-medium text-primary-900'>
              New Project
            </span>
          </button>
          <button className='flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'>
            <Users className='w-8 h-8 text-blue-600 mb-2' />
            <span className='text-sm font-medium text-blue-900'>
              Add Client
            </span>
          </button>
          <button className='flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'>
            <CheckSquare className='w-8 h-8 text-green-600 mb-2' />
            <span className='text-sm font-medium text-green-900'>
              Create Task
            </span>
          </button>
          <button className='flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors'>
            <Calendar className='w-8 h-8 text-purple-600 mb-2' />
            <span className='text-sm font-medium text-purple-900'>
              Schedule Meeting
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
