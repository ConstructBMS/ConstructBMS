import React, { useState } from 'react';
import { ChevronDownIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type PageLayout = 'A4P' | 'A4L' | 'A3L';

interface PageLayoutDropdownProps {
  currentLayout: PageLayout;
  onLayoutChange: (layout: PageLayout) => void;
  disabled?: boolean;
}

const PageLayoutDropdown: React.FC<PageLayoutDropdownProps> = ({
  currentLayout,
  onLayoutChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canExport = canAccess('programme.export.view');
  const isDisabled = disabled || !canExport;

  const layoutOptions: Array<{
    value: PageLayout;
    label: string;
    description: string;
    dimensions: string;
  }> = [
    {
      value: 'A4P',
      label: 'A4 Portrait',
      description: 'Standard portrait orientation',
      dimensions: '210 × 297 mm'
    },
    {
      value: 'A4L',
      label: 'A4 Landscape',
      description: 'Wide landscape orientation',
      dimensions: '297 × 210 mm'
    },
    {
      value: 'A3L',
      label: 'A3 Landscape',
      description: 'Large format landscape',
      dimensions: '420 × 297 mm'
    }
  ];

  const currentOption = layoutOptions.find(option => option.value === currentLayout) || layoutOptions[0];

  const handleLayoutChange = (layout: PageLayout) => {
    onLayoutChange(layout);
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
        title="Set paper size and orientation for printing"
      >
        <DocumentIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {layoutOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleLayoutChange(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${option.value === currentLayout
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
                    {option.dimensions}
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

export default PageLayoutDropdown; 