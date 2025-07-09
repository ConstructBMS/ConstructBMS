import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  PoundSterling,
  Calendar,
} from 'lucide-react';
import { demoDataService } from '../../services/demoData';
import { DatabaseStatus } from '../DatabaseStatus';

interface StatCard {
  id: string;
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
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

export const StatsCards: React.FC<WidgetProps> = ({
  config,
  onConfigChange,
}) => {
  const stats = config?.stats || defaultStats;

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 grid grid-cols-2 gap-3'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700'
          >
            <div className='flex items-center justify-between'>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400 truncate'>
                  {stat.label}
                </p>
                <p className='text-xl font-bold text-gray-900 dark:text-white truncate'>
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-2 rounded-full ${stat.color} flex-shrink-0 ml-2`}
              >
                {stat.icon}
              </div>
            </div>
            <div className='mt-2 flex items-center text-xs'>
              <span
                className={`flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
              >
                {stat.trend === 'up' ? (
                  <svg
                    className='w-3 h-3 mr-1'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 10.586z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-3 h-3 mr-1'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L12 9.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
                {stat.change}
              </span>
              <span className='text-gray-500 ml-1 truncate'>vs last month</span>
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
