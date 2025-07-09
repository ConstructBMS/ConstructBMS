import React, { useState, useEffect } from 'react';
import { TrendingUp, PoundSterling } from 'lucide-react';
import { demoDataService } from '../../services/demoData';

interface MonthlyData {
  month: string;
  revenue: number;
  projects: number;
}

const defaultData = [
  { month: 'Jan', value: 1200 },
  { month: 'Feb', value: 2100 },
  { month: 'Mar', value: 1800 },
  { month: 'Apr', value: 2400 },
  { month: 'May', value: 2000 },
  { month: 'Jun', value: 2600 },
  { month: 'Jul', value: 2200 },
  { month: 'Aug', value: 2800 },
  { month: 'Sep', value: 2500 },
  { month: 'Oct', value: 3000 },
  { month: 'Nov', value: 2700 },
  { month: 'Dec', value: 3200 },
];

const RevenueChart: React.FC<WidgetProps> = ({ config, onConfigChange }) => {
  const data = config?.data || defaultData;

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 flex flex-col'>
        <div className='flex-1 flex items-end justify-between space-x-1'>
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className='flex-1 flex flex-col items-center'>
              <div
                className='w-full bg-gradient-to-t from-green-500 to-teal-400 rounded-t'
                style={{
                  height: `${(item.value / Math.max(...data.map(d => d.value))) * 90}%`,
                }}
              />
              <span className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                {item.month}
              </span>
            </div>
          ))}
        </div>
        <div className='mt-3 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Total Revenue:{' '}
            <span className='font-semibold text-green-600 dark:text-green-400'>
              $
              {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
