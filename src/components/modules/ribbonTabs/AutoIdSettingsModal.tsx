import React, { useState, useEffect } from 'react';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface TaskIdSettings {
  applyOnNewTask: boolean;
  demo?: boolean;
  idFormat: 'prefix' | 'wbs' | 'mixed';
  numberPadding: number;
  prefix?: string;
  startingNumber: number;
}

interface AutoIdSettingsModalProps {
  currentSettings?: TaskIdSettings;
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TaskIdSettings) => void;
}

const AutoIdSettingsModal: React.FC<AutoIdSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings,
  isDemoMode = false
}) => {
  const [settings, setSettings] = useState<TaskIdSettings>({
    startingNumber: 1,
    numberPadding: 3,
    idFormat: 'prefix',
    applyOnNewTask: true,
    prefix: '',
    demo: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen && currentSettings) {
      setSettings({ ...currentSettings });
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        demo: isDemoMode
      };
      await onSave(updatedSettings);
      onClose();
    } catch (error) {
      console.error('Failed to save auto ID settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const updateSettings = (updates: Partial<TaskIdSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getFormatPreview = () => {
    const { startingNumber, numberPadding, idFormat, prefix } = settings;
    const paddedNumber = startingNumber.toString().padStart(numberPadding, '0');
    
    switch (idFormat) {
      case 'prefix':
        return `${prefix || 'TASK'}-${paddedNumber}`;
      case 'wbs':
        return `${startingNumber}.0`;
      case 'mixed':
        return `${prefix || 'TASK'}-${startingNumber}.1`;
      default:
        return `${prefix || 'TASK'}-${paddedNumber}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Auto ID Settings</h2>
              <p className="text-sm text-gray-500">Configure automatic task ID generation</p>
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
            {/* Starting Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Number
              </label>
              <input
                type="number"
                min="1"
                value={settings.startingNumber}
                onChange={(e) => updateSettings({ startingNumber: parseInt(e.target.value) || 1 })}
                disabled={!canEdit}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
              />
              <p className="text-xs text-gray-500 mt-1">
                The first number to use when generating task IDs
              </p>
            </div>

            {/* Number Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number Padding
              </label>
              <select
                value={settings.numberPadding}
                onChange={(e) => updateSettings({ numberPadding: parseInt(e.target.value) })}
                disabled={!canEdit}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
              >
                <option value={2}>2 digits (01, 02, 03...)</option>
                <option value={3}>3 digits (001, 002, 003...)</option>
                <option value={4}>4 digits (0001, 0002, 0003...)</option>
                <option value={5}>5 digits (00001, 00002, 00003...)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How many digits to use for the number portion
              </p>
            </div>

            {/* ID Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Format
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="idFormat"
                    value="prefix"
                    checked={settings.idFormat === 'prefix'}
                    onChange={(e) => updateSettings({ idFormat: e.target.value as 'prefix' })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Prefix Only</div>
                    <div className="text-sm text-gray-500">TASK-001, TASK-002, etc.</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="idFormat"
                    value="wbs"
                    checked={settings.idFormat === 'wbs'}
                    onChange={(e) => updateSettings({ idFormat: e.target.value as 'wbs' })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">WBS Style</div>
                    <div className="text-sm text-gray-500">1.0, 1.1, 1.1.1, etc.</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="idFormat"
                    value="mixed"
                    checked={settings.idFormat === 'mixed'}
                    onChange={(e) => updateSettings({ idFormat: e.target.value as 'mixed' })}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Mixed</div>
                    <div className="text-sm text-gray-500">TASK-1.1, TASK-1.2, etc.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Prefix (for prefix and mixed formats) */}
            {(settings.idFormat === 'prefix' || settings.idFormat === 'mixed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefix
                </label>
                <input
                  type="text"
                  value={settings.prefix || ''}
                  onChange={(e) => updateSettings({ prefix: e.target.value })}
                  disabled={!canEdit}
                  placeholder="e.g., TASK, PRJ, PHASE"
                  className={`
                    w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                  `}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Text prefix to use before the number
                </p>
              </div>
            )}

            {/* Apply on New Task Creation */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.applyOnNewTask}
                  onChange={(e) => updateSettings({ applyOnNewTask: e.target.checked })}
                  disabled={!canEdit}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Apply on New Task Creation</div>
                  <div className="text-sm text-gray-500">
                    Automatically assign IDs when creating new tasks
                  </div>
                </div>
              </label>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
              <div className="text-sm text-blue-800">
                <div className="font-mono bg-white px-2 py-1 rounded border">
                  {getFormatPreview()}
                </div>
              </div>
            </div>

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to modify auto ID settings.
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
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoIdSettingsModal; 