import React, { useState } from 'react';
import { DocumentTextIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type FontStyleOption = 'default' | 'serif' | 'sans' | 'mono';

interface FontStyleDropdownProps {
  currentFont: FontStyleOption;
  onFontChange: (font: FontStyleOption) => void;
  disabled?: boolean;
}

const FontStyleDropdown: React.FC<FontStyleDropdownProps> = ({
  currentFont,
  onFontChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.view') || canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const fontOptions: Array<{
    value: FontStyleOption;
    label: string;
    description: string;
    fontClass: string;
  }> = [
    {
      value: 'default',
      label: 'Default',
      description: 'System default',
      fontClass: 'font-sans'
    },
    {
      value: 'serif',
      label: 'Serif',
      description: 'Traditional serif',
      fontClass: 'font-serif'
    },
    {
      value: 'sans',
      label: 'Sans-serif',
      description: 'Clean sans-serif',
      fontClass: 'font-sans'
    },
    {
      value: 'mono',
      label: 'Monospace',
      description: 'Fixed-width font',
      fontClass: 'font-mono'
    }
  ];

  const currentOption = fontOptions.find(option => option.value === currentFont) || fontOptions[0];

  const handleFontChange = (font: FontStyleOption) => {
    onFontChange(font);
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
        title="Choose a font for Gantt task labels"
      >
        <DocumentTextIcon className="w-4 h-4" />
        <span className={currentOption.fontClass}>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {fontOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFontChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentFont
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${option.fontClass}`}>{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  <div className={`text-xs ${option.fontClass}`}>
                    Aa
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

export default FontStyleDropdown; 