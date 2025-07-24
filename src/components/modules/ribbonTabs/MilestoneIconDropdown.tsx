import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type MilestoneIconType = 'diamond' | 'flag' | 'dot' | 'star';

interface MilestoneIconDropdownProps {
  currentIcon: MilestoneIconType;
  disabled?: boolean;
  onIconChange: (icon: MilestoneIconType) => void;
}

const MilestoneIconDropdown: React.FC<MilestoneIconDropdownProps> = ({
  currentIcon,
  onIconChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const iconOptions: Array<{
    className: string;
    label: string;
    symbol: string;
    value: MilestoneIconType;
  }> = [
    {
      value: 'diamond',
      label: 'Diamond',
      symbol: '◇',
      className: 'text-blue-600'
    },
    {
      value: 'flag',
      label: 'Flag',
      symbol: '⚑',
      className: 'text-green-600'
    },
    {
      value: 'dot',
      label: 'Dot',
      symbol: '●',
      className: 'text-purple-600'
    },
    {
      value: 'star',
      label: 'Star',
      symbol: '★',
      className: 'text-yellow-600'
    }
  ];

  const currentOption = iconOptions.find(option => option.value === currentIcon) || iconOptions[0];

  const handleIconChange = (icon: MilestoneIconType) => {
    onIconChange(icon);
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
        title="Choose the shape for milestone markers"
      >
        <span className={`text-lg ${currentOption.className}`}>
          {currentOption.symbol}
        </span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleIconChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentIcon
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  <span className={`text-lg ${option.className}`}>
                    {option.symbol}
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

export default MilestoneIconDropdown; 