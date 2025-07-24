import React, { useState } from 'react';
import { ChevronDownIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ColumnPresetType = 'default' | 'compact' | 'data-entry' | 'custom';

export interface ColumnPreset {
  id: string;
  name: string;
  type: ColumnPresetType;
  description: string;
  columns: string[];
}

interface ColumnPresetsDropdownProps {
  currentPreset: string;
  presets: ColumnPreset[];
  onPresetChange: (presetId: string) => void;
  onSavePreset?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ColumnPresetsDropdown: React.FC<ColumnPresetsDropdownProps> = ({
  currentPreset,
  presets,
  onPresetChange,
  onSavePreset,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || loading || !canEdit;

  const currentPresetData = presets.find(preset => preset.id === currentPreset) || presets[0];

  const handlePresetChange = (presetId: string) => {
    onPresetChange(presetId);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSavePreset = () => {
    if (onSavePreset) {
      onSavePreset();
    }
    setIsOpen(false);
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
        title="Load a saved column layout"
      >
        <BookmarkIcon className="w-4 h-4" />
        <span>{currentPresetData?.name || 'Default'}</span>
        <ChevronDownIcon className="w-4 h-4" />
        {loading && (
          <div className="ml-2">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  ${preset.id === currentPreset
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
                title={preset.description}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {preset.description}
                  </span>
                </div>
              </button>
            ))}
            
            {onSavePreset && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={handleSavePreset}
                  className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900"
                >
                  <div className="flex items-center space-x-2">
                    <BookmarkIcon className="w-4 h-4" />
                    <span>Save Current Layout</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnPresetsDropdown; 