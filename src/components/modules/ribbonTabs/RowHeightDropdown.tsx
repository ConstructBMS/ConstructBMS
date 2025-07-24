import React, { useState } from 'react';
import { Bars3BottomLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type RowHeightOption = 'small' | 'medium' | 'large';

interface RowHeightDropdownProps {
  currentHeight: RowHeightOption;
  disabled?: boolean;
  onHeightChange: (height: RowHeightOption) => void;
}

const RowHeightDropdown: React.FC<RowHeightDropdownProps> = ({
  currentHeight,
  onHeightChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.view') || canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const heightOptions: Array<{
    description: string;
    height: number;
    label: string;
    value: RowHeightOption;
  }> = [
    {
      value: 'small',
      label: 'Small',
      description: 'Compact view',
      height: 24
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Default spacing',
      height: 32
    },
    {
      value: 'large',
      label: 'Large',
      description: 'Presentation view',
      height: 40
    }
  ];

  const currentOption = heightOptions.find(option => option.value === currentHeight) || heightOptions[1];

  const handleHeightChange = (height: RowHeightOption) => {
    onHeightChange(height);
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
        title="Change height of task rows"
      >
        <Bars3BottomLeftIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {heightOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleHeightChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentHeight
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  <div
                    className="w-8 h-2 bg-gray-300 dark:bg-gray-600 rounded"
                    style={{ height: `${option.height / 4}px` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RowHeightDropdown; 