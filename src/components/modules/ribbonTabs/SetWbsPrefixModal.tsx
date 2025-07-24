import React, { useState, useEffect } from 'react';
import { XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface WbsPrefixSettings {
  applyToExisting: boolean;
  demo?: boolean;
  prefix: string;
  scope: 'project' | 'selected';
}

interface SetWbsPrefixModalProps {
  currentPrefix?: string;
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: WbsPrefixSettings) => void;
  selectedTasksCount?: number;
}

const SetWbsPrefixModal: React.FC<SetWbsPrefixModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPrefix = '',
  selectedTasksCount = 0,
  isDemoMode = false
}) => {
  const [settings, setSettings] = useState<WbsPrefixSettings>({
    prefix: '',
    scope: 'project',
    applyToExisting: false,
    demo: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  // Load current prefix when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(prev => ({
        ...prev,
        prefix: currentPrefix
      }));
    }
  }, [isOpen, currentPrefix]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !settings.prefix.trim()) return;

    setIsLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        demo: isDemoMode
      };
      await onSave(updatedSettings);
      onClose();
    } catch (error) {
      console.error('Failed to save WBS prefix:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const updateSettings = (updates: Partial<WbsPrefixSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getPreview = () => {
    if (!settings.prefix.trim()) return 'Enter a prefix to see preview';
    
    const prefix = settings.prefix.trim();
    switch (settings.scope) {
      case 'project':
        return `All tasks: ${prefix}-001, ${prefix}-002, ${prefix}-003...`;
      case 'selected':
        return `Selected tasks: ${prefix}-001, ${prefix}-002...`;
      default:
        return `${prefix}-001, ${prefix}-002, ${prefix}-003...`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <QrCodeIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Set WBS Prefix</h2>
              <p className="text-sm text-gray-500">Define a prefix for task ID generation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Prefix Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WBS Prefix *
              </label>
              <input
                type="text"
                value={settings.prefix}
                onChange={(e) => updateSettings({ prefix: e.target.value })}
                disabled={!canEdit}
                placeholder="e.g., PHASE, TASK, PRJ"
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a prefix that will be used for task ID generation
              </p>
            </div>

            {/* Scope Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Apply To
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scope"
                    value="project"
                    checked={settings.scope === 'project'}
                    onChange={(e) => updateSettings({ scope: e.target.value as 'project' })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Entire Project</div>
                    <div className="text-sm text-gray-500">
                      Apply prefix to all tasks in the project
                    </div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scope"
                    value="selected"
                    checked={settings.scope === 'selected'}
                    onChange={(e) => updateSettings({ scope: e.target.value as 'selected' })}
                    disabled={!canEdit || selectedTasksCount === 0}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Selected Tasks Only</div>
                    <div className="text-sm text-gray-500">
                      Apply prefix to {selectedTasksCount} selected task{selectedTasksCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </label>
              </div>
              {selectedTasksCount === 0 && settings.scope === 'selected' && (
                <p className="text-xs text-orange-600 mt-1">
                  No tasks selected. Please select tasks first or choose "Entire Project".
                </p>
              )}
            </div>

            {/* Apply to Existing Tasks */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.applyToExisting}
                  onChange={(e) => updateSettings({ applyToExisting: e.target.checked })}
                  disabled={!canEdit}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Apply to Existing Tasks</div>
                  <div className="text-sm text-gray-500">
                    Update IDs for tasks that already have IDs assigned
                  </div>
                </div>
              </label>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
              <div className="text-sm text-blue-800">
                <div className="font-mono bg-white px-2 py-1 rounded border">
                  {getPreview()}
                </div>
              </div>
            </div>

            {/* Current Prefix Info */}
            {currentPrefix && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Prefix</h4>
                <div className="text-sm text-gray-600">
                  <div className="font-mono bg-white px-2 py-1 rounded border">
                    {currentPrefix}
                  </div>
                </div>
              </div>
            )}

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to set WBS prefixes.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !settings.prefix.trim()}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading || !settings.prefix.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Saving...' : 'Set Prefix'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetWbsPrefixModal; 