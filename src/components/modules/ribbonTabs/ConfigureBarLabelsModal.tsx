import React, { useState } from 'react';
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { BarLabelConfig } from '../../../services/barLabelService';

interface ConfigureBarLabelsModalProps {
  currentConfig: BarLabelConfig;
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: BarLabelConfig) => void;
}

const ConfigureBarLabelsModal: React.FC<ConfigureBarLabelsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  isDemoMode = false
}) => {
  const [config, setConfig] = useState<BarLabelConfig>(currentConfig);
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  const labelOptions = [
    { value: 'none', label: '(None)' },
    { value: 'taskName', label: 'Task Name' },
    { value: 'taskId', label: 'Task ID' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'finishDate', label: 'Finish Date' },
    { value: 'duration', label: 'Duration' },
    { value: 'percentComplete', label: '% Complete' },
    { value: 'customField1', label: 'Custom Field 1' },
    { value: 'customField2', label: 'Custom Field 2' },
    { value: 'customField3', label: 'Custom Field 3' }
  ];

  const handleSave = async () => {
    if (!canEdit) {
      alert('You don\'t have permission to configure bar labels');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('Failed to save bar label config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setConfig(currentConfig);
    onClose();
  };

  const updateConfig = (position: keyof BarLabelConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [position]: value
    }));
  };

  const getLabelDisplayName = (value: string) => {
    const option = labelOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <EyeIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configure Bar Labels</h2>
              <p className="text-sm text-gray-500">Select what appears around each bar</p>
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

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Label Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top Label
                </label>
                <select
                  value={config.top}
                  onChange={(e) => updateConfig('top', e.target.value)}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {labelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bar Label
                </label>
                <select
                  value={config.center}
                  onChange={(e) => updateConfig('center', e.target.value)}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {labelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bottom Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bottom Label
                </label>
                <select
                  value={config.bottom}
                  onChange={(e) => updateConfig('bottom', e.target.value)}
                  disabled={!canEdit}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {labelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preview
              </label>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="space-y-2">
                  {/* Top Label Preview */}
                  {config.top !== 'none' && (
                    <div className="text-xs text-gray-600 text-center">
                      {getLabelDisplayName(config.top)}
                    </div>
                  )}
                  
                  {/* Bar Preview */}
                  <div className="flex items-center justify-center">
                    <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded min-w-[120px] text-center">
                      {config.center !== 'none' ? getLabelDisplayName(config.center) : 'Task Bar'}
                    </div>
                  </div>
                  
                  {/* Bottom Label Preview */}
                  {config.bottom !== 'none' && (
                    <div className="text-xs text-gray-600 text-center">
                      {getLabelDisplayName(config.bottom)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Label Options Info */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Available Label Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-800">
                <div>• Task Name - Full task name</div>
                <div>• Task ID - Unique identifier</div>
                <div>• Start Date - Task start date</div>
                <div>• Finish Date - Task end date</div>
                <div>• Duration - Task duration</div>
                <div>• % Complete - Progress percentage</div>
                <div>• Custom Fields - User-defined fields</div>
              </div>
            </div>

            {/* Demo Mode Warning */}
            {isDemoMode && (
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Demo Mode</h4>
                <p className="text-sm text-yellow-800">
                  Bar label changes in demo mode will be reset when switching to live mode.
                </p>
              </div>
            )}

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to configure bar labels.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureBarLabelsModal; 