import React, { useState } from 'react';
import { SwatchIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type MilestoneColorOption = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

interface MilestoneColourDropdownProps {
  currentColor: MilestoneColorOption;
  disabled?: boolean;
  onColorChange: (color: MilestoneColorOption) => void;
}

const MilestoneColourDropdown: React.FC<MilestoneColourDropdownProps> = ({
  currentColor,
  onColorChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const colorOptions: Array<{
    bgColor: string;
    color: string;
    label: string;
    value: MilestoneColorOption;
  }> = [
    {
      value: 'blue',
      label: 'Blue',
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    },
    {
      value: 'green',
      label: 'Green',
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      value: 'purple',
      label: 'Purple',
      color: '#8B5CF6',
      bgColor: '#EDE9FE'
    },
    {
      value: 'orange',
      label: 'Orange',
      color: '#F59E0B',
      bgColor: '#FED7AA'
    },
    {
      value: 'red',
      label: 'Red',
      color: '#EF4444',
      bgColor: '#FEE2E2'
    },
    {
      value: 'gray',
      label: 'Gray',
      color: '#6B7280',
      bgColor: '#F3F4F6'
    }
  ];

  const currentOption = colorOptions.find(option => option.value === currentColor) || colorOptions[0];

  const handleColorChange = (color: MilestoneColorOption) => {
    onColorChange(color);
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
        title="Change the colour of milestone markers"
      >
        <SwatchIcon className="w-4 h-4" />
        <div
          className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: currentOption.color }}
        />
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleColorChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentColor
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  <div
                    className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: option.color }}
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

export default MilestoneColourDropdown; 