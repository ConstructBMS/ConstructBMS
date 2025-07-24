import React, { useState } from 'react';
import { ArrowsPointingOutIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type LabelPositionOption = 'insideLeft' | 'insideRight' | 'above' | 'below' | 'hidden';

interface LabelPositionDropdownProps {
  currentPosition: LabelPositionOption;
  onPositionChange: (position: LabelPositionOption) => void;
  disabled?: boolean;
}

const LabelPositionDropdown: React.FC<LabelPositionDropdownProps> = ({
  currentPosition,
  onPositionChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.view') || canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const positionOptions: Array<{
    value: LabelPositionOption;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      value: 'insideLeft',
      label: 'Inside Left',
      description: 'Left side of bar',
      icon: '⬅️'
    },
    {
      value: 'insideRight',
      label: 'Inside Right',
      description: 'Right side of bar',
      icon: '➡️'
    },
    {
      value: 'above',
      label: 'Above',
      description: 'Above the bar',
      icon: '⬆️'
    },
    {
      value: 'below',
      label: 'Below',
      description: 'Below the bar',
      icon: '⬇️'
    },
    {
      value: 'hidden',
      label: 'Hidden',
      description: 'No labels shown',
      icon: '🚫'
    }
  ];

  const currentOption = positionOptions.find(option => option.value === currentPosition) || positionOptions[0];

  const handlePositionChange = (position: LabelPositionOption) => {
    onPositionChange(position);
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
        title="Set where task names appear in the timeline"
      >
        <ArrowsPointingOutIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {positionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePositionChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentPosition
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
                  <div className="text-lg">
                    {option.icon}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelPositionDropdown; 