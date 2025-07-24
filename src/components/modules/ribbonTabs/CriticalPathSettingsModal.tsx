import React, { useState } from 'react';
import { XMarkIcon, BoltIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface CriticalPathSettings {
  floatThreshold: number;
  highlightColor: string;
  includeMilestones: boolean;
  showPredecessors: boolean;
  demo?: boolean;
}

interface CriticalPathSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CriticalPathSettings) => void;
  currentSettings: CriticalPathSettings;
  disabled?: boolean;
}

const CriticalPathSettingsModal: React.FC<CriticalPathSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [settings, setSettings] = useState<CriticalPathSettings>(currentSettings);

  const canView = canAccess('programme.view');
  const isDisabled = disabled || !canView;

  const handleSave = () => {
    if (!isDisabled) {
      onSave(settings);
      onClose();
    }
  };

  const handleCancel = () => {
    setSettings(currentSettings);
    onClose();
  };

  const colorOptions = [
    { value: 'red', label: 'Red', preview: 'bg-red-500' },
    { value: 'orange', label: 'Orange', preview: 'bg-orange-500' },
    { value: 'purple', label: 'Purple', preview: 'bg-purple-500' },
    { value: 'pink', label: 'Pink', preview: 'bg-pink-500' },
    { value: 'yellow', label: 'Yellow', preview: 'bg-yellow-500' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <BoltIcon className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Critical Path Settings
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Float Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Float Threshold (days)
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={settings.floatThreshold}
              onChange={(e) => setSettings({
                ...settings,
                floatThreshold: parseInt(e.target.value) || 0
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tasks with total float ≤ this value will be considered critical
            </p>
          </div>

          {/* Highlight Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Highlight Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSettings({
                    ...settings,
                    highlightColor: color.value
                  })}
                  disabled={isDisabled}
                  className={`
                    p-3 rounded-md border-2 transition-colors
                    ${settings.highlightColor === color.value
                      ? 'border-gray-900 dark:border-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={color.label}
                >
                  <div className={`w-full h-4 rounded ${color.preview}`}></div>
                  <span className="text-xs mt-1 block text-gray-700 dark:text-gray-300">
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.includeMilestones}
                onChange={(e) => setSettings({
                  ...settings,
                  includeMilestones: e.target.checked
                })}
                disabled={isDisabled}
                className="mr-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include milestones in critical path
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showPredecessors}
                onChange={(e) => setSettings({
                  ...settings,
                  showPredecessors: e.target.checked
                })}
                disabled={isDisabled}
                className="mr-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show predecessors in path from selection
              </span>
            </label>
          </div>

          {/* Demo Mode Warning */}
          {settings.demo && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                ⚠️ Demo Mode: These settings will be reset when switching to live mode
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriticalPathSettingsModal; 