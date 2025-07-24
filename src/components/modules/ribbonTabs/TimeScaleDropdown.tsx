import React, { useState } from 'react';
import { ChevronDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type TimeScaleOption = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface TimeScaleDropdownProps {
  currentScale: TimeScaleOption;
  disabled?: boolean;
  loading?: boolean;
  onScaleChange: (scale: TimeScaleOption) => void;
}

const TimeScaleDropdown: React.FC<TimeScaleDropdownProps> = ({
  currentScale,
  onScaleChange,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canView = canAccess('programme.format.view') || canAccess('programme.format.edit');
  const isDisabled = disabled || loading || !canView;

  const scaleOptions: Array<{
    description: string;
    label: string;
    value: TimeScaleOption;
  }> = [
    {
      value: 'hourly',
      label: 'Hourly',
      description: 'Show hours on timeline'
    },
    {
      value: 'daily',
      label: 'Daily',
      description: 'Show days on timeline'
    },
    {
      value: 'weekly',
      label: 'Weekly',
      description: 'Show weeks on timeline'
    },
    {
      value: 'monthly',
      label: 'Monthly',
      description: 'Show months on timeline'
    },
    {
      value: 'quarterly',
      label: 'Quarterly',
      description: 'Show quarters on timeline'
    }
  ];

  const currentOption = scaleOptions.find(option => option.value === currentScale) || scaleOptions[1]; // Default to daily

  const handleScaleChange = (scale: TimeScaleOption) => {
    onScaleChange(scale);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        className={`
          flex items-center space-x-2 px-3 py-2
          border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-700 rounded-md
          text-sm font-medium text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          transition-colors duration-200
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
          }
        `}
        title="Set time unit used in the timeline view"
      >
        <ClockIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
        {loading && (
          <div className="ml-2">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {scaleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleScaleChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentScale
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
                title={option.description}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeScaleDropdown; 