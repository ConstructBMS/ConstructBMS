import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  PoundSterling,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { dataSourceService } from '../../services/dataSourceService';
import { DatabaseStatus } from '../DatabaseStatus';

interface StatCard {
  change: string;
  changeType: 'increase' | 'decrease';
  color: string;
  icon: React.ComponentType<{ className?: string 
}>;
  id: string;
  name: string;
  value: string;
}

const defaultStats = [
  {
    label: 'Revenue',
    value: '$12,400',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7m0 0h4m-4 0H8'
        />
      </svg>
    ),
    color: 'bg-green-100 text-green-600',
    trend: 'up',
    change: '+5.2%',
  },
  {
    label: 'New Users',
    value: '1,200',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z'
        />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600',
    trend: 'up',
    change: '+2.1%',
  },
  {
    label: 'Tasks',
    value: '320',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-8 0a2 2 0 100-4 2 2 0 000 4zm2 8a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z'
        />
      </svg>
    ),
    color: 'bg-yellow-100 text-yellow-600',
    trend: 'down',
    change: '-1.3%',
  },
  {
    label: 'Active Projects',
    value: '8',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 001 1h3m-7 4v4a1 1 0 001 1h3m-10-5v4a1 1 0 001 1h3'
        />
      </svg>
    ),
    color: 'bg-teal-100 text-teal-600',
    trend: 'up',
    change: '+0.8%',
  },
];

export const StatsCards: React.FC<any> = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Get data from appropriate source
        const customers = await dataSourceService.getCustomers();
        const projects = await dataSourceService.getProjects();
        const tasks = await dataSourceService.getTasks();
        const deals = await dataSourceService.getDeals();
        const metrics = await dataSourceService.getMetrics();

        // Calculate stats from real data
        const realStats = [
          {
            label: 'Total Revenue',
            value: `£${(metrics.totalRevenue || 0).toLocaleString()}`,
            icon: <PoundSterling className="w-5 h-5" />,
            color: 'bg-green-100 text-green-600',
            trend: 'up',
            change: '+5.2%',
          },
          {
            label: 'Active Projects',
            value: projects.filter((p: any) => p.status === 'In Progress').length.toString(),
            icon: <Building2 className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-600',
            trend: 'up',
            change: '+2.1%',
          },
          {
            label: 'Total Tasks',
            value: tasks.length.toString(),
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'bg-yellow-100 text-yellow-600',
            trend: 'down',
            change: '-1.3%',
          },
          {
            label: 'Active Customers',
            value: customers.filter((c: any) => c.status === 'active').length.toString(),
            icon: <Users className="w-5 h-5" />,
            color: 'bg-teal-100 text-teal-600',
            trend: 'up',
            change: '+0.8%',
          },
        ];

        // If in production mode and all data is empty, show empty state
        if (dataSourceService.isProductionMode() && 
            metrics.totalRevenue === 0 && 
            projects.length === 0 && 
            tasks.length === 0 && 
            customers.length === 0) {
          setStats([
            {
              label: 'Total Revenue',
              value: '£0',
              icon: <PoundSterling className="w-5 h-5" />,
              color: 'bg-gray-100 text-gray-600',
              trend: 'up',
              change: '0%',
            },
            {
              label: 'Active Projects',
              value: '0',
              icon: <Building2 className="w-5 h-5" />,
              color: 'bg-gray-100 text-gray-600',
              trend: 'up',
              change: '0%',
            },
            {
              label: 'Total Tasks',
              value: '0',
              icon: <CheckCircle className="w-5 h-5" />,
              color: 'bg-gray-100 text-gray-600',
              trend: 'down',
              change: '0%',
            },
            {
              label: 'Active Customers',
              value: '0',
              icon: <Users className="w-5 h-5" />,
              color: 'bg-gray-100 text-gray-600',
              trend: 'up',
              change: '0%',
            },
          ]);
        } else {
          setStats(realStats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700 animate-pulse'
            >
              <div className='h-4 bg-gray-200 rounded mb-2'></div>
              <div className='h-6 bg-gray-200 rounded'></div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat, idx) => (
          <div key={idx} className={`rounded-lg p-4 flex items-center gap-4 shadow-sm border border-gray-200 dark:border-gray-700`}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className='text-lg font-bold text-gray-900 dark:text-white'>{stat.value}</div>
              <div className='text-sm text-gray-500 dark:text-gray-300'>{stat.label}</div>
              <div className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{stat.change}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add a separate component for database status
export const DatabaseStatusCard: React.FC = () => {
  return (
    <div className='mb-6'>
      <DatabaseStatus />
    </div>
  );
};

export default StatsCards;
