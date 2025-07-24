import React, { useState } from 'react';
import { ChevronDownIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ExportTheme = 'default' | 'monochrome' | 'light' | 'dark' | 'custom';

interface ExportThemeDropdownProps {
  currentTheme: ExportTheme;
  onThemeChange: (theme: ExportTheme) => void;
  disabled?: boolean;
}

const ExportThemeDropdown: React.FC<ExportThemeDropdownProps> = ({
  currentTheme,
  onThemeChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canExport = canAccess('programme.export.view');
  const isDisabled = disabled || !canExport;

  const themeOptions: Array<{
    value: ExportTheme;
    label: string;
    description: string;
    preview: string;
  }> = [
    {
      value: 'default',
      label: 'Default',
      description: 'Standard ConstructBMS theme',
      preview: 'Full color scheme'
    },
    {
      value: 'monochrome',
      label: 'Monochrome',
      description: 'High contrast black and white',
      preview: 'Print-friendly'
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Clean light background',
      preview: 'Professional appearance'
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark background theme',
      preview: 'Modern appearance'
    },
    {
      value: 'custom',
      label: 'Custom',
      description: 'User-defined theme',
      preview: 'Custom colors and styles'
    }
  ];

  const currentOption = themeOptions.find(option => option.value === currentTheme) || themeOptions[0];

  const handleThemeChange = (theme: ExportTheme) => {
    onThemeChange(theme);
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
        title="Choose style/theme for exported view"
      >
        <SwatchIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentTheme
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
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {option.preview}
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

export default ExportThemeDropdown; 