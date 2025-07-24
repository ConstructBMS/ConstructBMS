import React, { useState } from 'react';
import { PaintBucketIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type BackgroundColorOption = 'light' | 'dark' | 'system' | 'custom';

interface BackgroundColorPickerProps {
  currentColor: BackgroundColorOption;
  customColor?: string;
  onColorChange: (color: BackgroundColorOption, customColor?: string) => void;
  disabled?: boolean;
}

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  currentColor,
  customColor = '#ffffff',
  onColorChange,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const canEdit = canAccess('programme.format.view') || canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const colorOptions: Array<{
    value: BackgroundColorOption;
    label: string;
    description: string;
    color: string;
    preview: string;
  }> = [
    {
      value: 'light',
      label: 'Light',
      description: 'White background',
      color: '#ffffff',
      preview: 'bg-white'
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark background',
      color: '#1f2937',
      preview: 'bg-gray-800'
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follows theme',
      color: 'auto',
      preview: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
    },
    {
      value: 'custom',
      label: 'Custom',
      description: 'Choose color',
      color: customColor,
      preview: 'bg-gradient-to-r from-blue-100 to-purple-100'
    }
  ];

  const currentOption = colorOptions.find(option => option.value === currentColor) || colorOptions[0];

  const handleColorChange = (color: BackgroundColorOption, customHex?: string) => {
    if (color === 'custom' && !customHex) {
      setShowCustomPicker(true);
      return;
    }
    
    onColorChange(color, customHex);
    setIsOpen(false);
    setShowCustomPicker(false);
  };

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    onColorChange('custom', newColor);
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
        title="Change background colour of Gantt timeline"
      >
        <PaintBucketIcon className="w-4 h-4" />
        <span>{currentOption.label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
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
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded border border-gray-300 dark:border-gray-600 ${option.preview}`}
                    style={option.value === 'custom' ? { backgroundColor: option.color } : {}}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Custom Color Picker */}
          {showCustomPicker && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="#000000"
                />
                <button
                  onClick={() => handleColorChange('custom', customColor)}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundColorPicker; 