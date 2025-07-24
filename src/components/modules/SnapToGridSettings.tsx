import React, { useState, useEffect } from 'react';
import { CogIcon, CheckIcon } from '@heroicons/react/24/outline';
import { type SnapConfig } from '../../services/dragRescheduleService';

interface SnapToGridSettingsProps {
  className?: string;
  dayWidth: number;
  onSnapConfigChange: (config: SnapConfig) => void;
  snapConfig: SnapConfig;
}

const SnapToGridSettings: React.FC<SnapToGridSettingsProps> = ({
  snapConfig,
  onSnapConfigChange,
  dayWidth,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<SnapConfig>(snapConfig);

  useEffect(() => {
    setLocalConfig(snapConfig);
  }, [snapConfig]);

  const handleToggleSnap = () => {
    const newConfig = {
      ...localConfig,
      enabled: !localConfig.enabled
    };
    setLocalConfig(newConfig);
    onSnapConfigChange(newConfig);
  };

  const handleSnapTypeChange = (type: 'day' | 'week' | 'month') => {
    const newConfig = {
      ...localConfig,
      type,
      gridWidth: getGridWidth(type, dayWidth)
    };
    setLocalConfig(newConfig);
    onSnapConfigChange(newConfig);
  };

  const getGridWidth = (type: 'day' | 'week' | 'month', dayWidth: number): number => {
    switch (type) {
      case 'day':
        return dayWidth;
      case 'week':
        return dayWidth * 7;
      case 'month':
        return dayWidth * 30; // Approximate
      default:
        return dayWidth;
    }
  };

  const getSnapTypeLabel = (type: 'day' | 'week' | 'month'): string => {
    switch (type) {
      case 'day':
        return 'Day';
      case 'week':
        return 'Week';
      case 'month':
        return 'Month';
      default:
        return 'Day';
    }
  };

  const getGridWidthLabel = (type: 'day' | 'week' | 'month'): string => {
    const width = getGridWidth(type, dayWidth);
    return `${width}px`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          snapConfig.enabled
            ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        title="Snap-to-Grid Settings"
      >
        <CogIcon className="w-4 h-4 mr-2" />
        Snap
        {snapConfig.enabled && (
          <CheckIcon className="w-4 h-4 ml-2 text-green-600" />
        )}
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Snap-to-Grid Settings
            </h3>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Enable Snap-to-Grid
              </label>
              <button
                onClick={handleToggleSnap}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localConfig.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Snap Type Selection */}
            {localConfig.enabled && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Snap Type
                </label>
                <div className="space-y-2">
                  {(['day', 'week', 'month'] as const).map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="snapType"
                        value={type}
                        checked={localConfig.type === type}
                        onChange={() => handleSnapTypeChange(type)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {getSnapTypeLabel(type)}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Grid width: {getGridWidthLabel(type)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            {localConfig.enabled && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Preview
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tasks will snap to {getSnapTypeLabel(localConfig.type)} boundaries
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SnapToGridSettings; 