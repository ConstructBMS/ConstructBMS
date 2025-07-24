import React, { useState } from 'react';
import { ChevronDownIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type GridlineStyle = 'none' | 'solid' | 'dotted' | 'dashed';

interface GridlineStyleDropdownProps {
  currentStyle: GridlineStyle;
  onStyleChange: (style: GridlineStyle) => void;
  disabled?: boolean;
}

const GridlineStyleDropdown: React.FC<GridlineStyleDropdownProps> = ({
  currentStyle,
  onStyleChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const styleOptions: Array<{
    value: GridlineStyle;
    label: string;
    description: string;
    preview: string;
  }> = [
    {
      value: 'none',
      label: 'None',
      description: 'No gridlines',
      preview: 'No lines'
    },
    {
      value: 'solid',
      label: 'Solid',
      description: 'Full contrast lines',
      preview: 'Solid lines'
    },
    {
      value: 'dotted',
      label: 'Dotted',
      description: 'Lower contrast dots',
      preview: 'Dotted lines'
    },
    {
      value: 'dashed',
      label: 'Dashed',
      description: 'Broken line pattern',
      preview: 'Dashed lines'
    }
  ];

  const currentOption = styleOptions.find(option => option.value === currentStyle) || styleOptions[0];

  const handleStyleChange = (style: GridlineStyle) => {
    onStyleChange(style);
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
        title="Change how gridlines appear in the timeline"
      >
        <Square3Stack3DIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {styleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStyleChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentStyle
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

export default GridlineStyleDropdown; 