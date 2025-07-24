import React, { useState } from 'react';
import { ChevronDownIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type RowBorderStyle = 'none' | 'bottom' | 'full';

interface RowBorderDropdownProps {
  currentBorder: RowBorderStyle;
  onBorderChange: (border: RowBorderStyle) => void;
  disabled?: boolean;
}

const RowBorderDropdown: React.FC<RowBorderDropdownProps> = ({
  currentBorder,
  onBorderChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const borderOptions: Array<{
    value: RowBorderStyle;
    label: string;
    description: string;
    preview: string;
  }> = [
    {
      value: 'none',
      label: 'None',
      description: 'No borders',
      preview: 'No border'
    },
    {
      value: 'bottom',
      label: 'Bottom Border',
      description: 'Bottom border only',
      preview: 'Bottom border'
    },
    {
      value: 'full',
      label: 'Full Border',
      description: 'Border on all sides',
      preview: 'Full border'
    }
  ];

  const currentOption = borderOptions.find(option => option.value === currentBorder) || borderOptions[0];

  const handleBorderChange = (border: RowBorderStyle) => {
    onBorderChange(border);
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
        title="Choose the border style for task rows"
      >
        <Square3Stack3DIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {borderOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBorderChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentBorder
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

export default RowBorderDropdown; 