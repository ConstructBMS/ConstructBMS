import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type AppearanceDropdownType = 'barHeight' | 'rowSpacing' | 'fontSize';

interface AppearanceDropdownProps {
  type: AppearanceDropdownType;
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  loading?: boolean;
}

const AppearanceDropdown: React.FC<AppearanceDropdownProps> = ({
  type,
  value,
  onChange,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const dropdownConfig = {
    barHeight: {
      label: 'Bar Height',
      tooltip: 'Adjust height of task bars',
      permission: 'programme.view',
      options: [
        { value: 16, label: 'Small (16px)' },
        { value: 24, label: 'Medium (24px)' },
        { value: 32, label: 'Large (32px)' },
        { value: 40, label: 'XL (40px)' }
      ]
    },
    rowSpacing: {
      label: 'Row Spacing',
      tooltip: 'Change vertical gap between rows',
      permission: 'programme.view',
      options: [
        { value: 'tight', label: 'Tight' },
        { value: 'normal', label: 'Normal' },
        { value: 'relaxed', label: 'Relaxed' }
      ]
    },
    fontSize: {
      label: 'Font Size',
      tooltip: 'Adjust label and date text size',
      permission: 'programme.view',
      options: [
        { value: 10, label: 'XS (10px)' },
        { value: 12, label: 'SM (12px)' },
        { value: 14, label: 'MD (14px)' },
        { value: 16, label: 'LG (16px)' }
      ]
    }
  };

  const config = dropdownConfig[type];
  const hasPermission = canAccess(config.permission);
  const isDisabled = disabled || !hasPermission || loading;

  const currentOption = config.options.find(option => option.value === value) || config.options[0];

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12
          border border-gray-300 bg-white hover:bg-gray-50
          transition-colors duration-200 rounded
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400'
          }
          ${loading ? 'animate-pulse' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title={config.tooltip}
      >
        <div className="flex items-center justify-center w-full">
          <span className={`text-xs font-medium ${
            isDisabled ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {currentOption.label.split(' ')[0]}
          </span>
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${
            isDisabled ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <span className={`text-xs mt-1 ${
          isDisabled ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {config.label}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {config.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                  option.value === value ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
                }`}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearanceDropdown; 