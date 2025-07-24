import React, { useState, useEffect } from 'react';
import { XMarkIcon, CurrencyPoundIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface AssignedResource {
  resourceId: string;
  name: string;
  type: 'labour' | 'material' | 'cost';
  quantity: number;
  unit: string;
  rate: number;
  fromDate: Date;
  toDate: Date;
}

interface AdjustRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Record<string, { rate: number; overrideRate?: number }>) => void;
  assignedResources: AssignedResource[];
  disabled?: boolean;
}

const AdjustRateModal: React.FC<AdjustRateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assignedResources,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [resourceUpdates, setResourceUpdates] = useState<Record<string, { rate: number; overrideRate?: number }>>({});
  const [useOverride, setUseOverride] = useState<Record<string, boolean>>({});

  const canEdit = canAccess('programme.resource.edit');
  const isDisabled = disabled || !canEdit;

  useEffect(() => {
    if (isOpen) {
      const initialUpdates: Record<string, { rate: number; overrideRate?: number }> = {};
      const initialOverride: Record<string, boolean> = {};
      assignedResources.forEach(resource => {
        initialUpdates[resource.resourceId] = {
          rate: resource.rate,
          overrideRate: resource.rate
        };
        initialOverride[resource.resourceId] = false;
      });
      setResourceUpdates(initialUpdates);
      setUseOverride(initialOverride);
    }
  }, [isOpen, assignedResources]);

  const handleRateChange = (resourceId: string, rate: number) => {
    setResourceUpdates(prev => ({
      ...prev,
      [resourceId]: {
        ...prev[resourceId],
        rate: Math.max(0, rate)
      }
    }));
  };

  const handleOverrideRateChange = (resourceId: string, overrideRate: number) => {
    setResourceUpdates(prev => ({
      ...prev,
      [resourceId]: {
        ...prev[resourceId],
        overrideRate: Math.max(0, overrideRate)
      }
    }));
  };

  const handleOverrideToggle = (resourceId: string, enabled: boolean) => {
    setUseOverride(prev => ({
      ...prev,
      [resourceId]: enabled
    }));
  };

  const handleSave = () => {
    const finalUpdates: Record<string, { rate: number; overrideRate?: number }> = {};
    Object.keys(resourceUpdates).forEach(resourceId => {
      if (useOverride[resourceId]) {
        finalUpdates[resourceId] = {
          rate: resourceUpdates[resourceId].rate,
          overrideRate: resourceUpdates[resourceId].overrideRate
        };
      } else {
        finalUpdates[resourceId] = {
          rate: resourceUpdates[resourceId].rate
        };
      }
    });
    onSave(finalUpdates);
    onClose();
  };

  const handleCancel = () => {
    setResourceUpdates({});
    setUseOverride({});
    onClose();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labour': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'material': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'cost': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'labour': return '👷';
      case 'material': return '🏗️';
      case 'cost': return '💰';
      default: return '📋';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CurrencyPoundIcon className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Adjust Rate
            </h2>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {assignedResources.length} resource(s)
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {assignedResources.map((resource) => (
              <div
                key={resource.resourceId}
                className={`p-4 rounded border ${getTypeColor(resource.type)}`}
              >
                <div className="flex items-center mb-3">
                  <span className="mr-2">{getTypeIcon(resource.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {resource.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.quantity} {resource.unit} @ £{resource.rate}/{resource.unit}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Standard Rate (£/{resource.unit})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={resourceUpdates[resource.resourceId]?.rate || resource.rate}
                      onChange={(e) => handleRateChange(resource.resourceId, parseFloat(e.target.value) || 0)}
                      disabled={isDisabled}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`override-${resource.resourceId}`}
                      checked={useOverride[resource.resourceId] || false}
                      onChange={(e) => handleOverrideToggle(resource.resourceId, e.target.checked)}
                      disabled={isDisabled}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                    />
                    <label htmlFor={`override-${resource.resourceId}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use Override Rate
                    </label>
                  </div>
                  
                  {useOverride[resource.resourceId] && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Override Rate (£/{resource.unit})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={resourceUpdates[resource.resourceId]?.overrideRate || resource.rate}
                        onChange={(e) => handleOverrideRateChange(resource.resourceId, parseFloat(e.target.value) || 0)}
                        disabled={isDisabled}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                        placeholder="Enter override rate"
                      />
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        This rate will override the standard rate for this assignment only
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">New Total:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      £{((resource.quantity) * (useOverride[resource.resourceId] ? (resourceUpdates[resource.resourceId]?.overrideRate || resource.rate) : (resourceUpdates[resource.resourceId]?.rate || resource.rate))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Change:</span>
                    <span className={((resource.quantity) * (useOverride[resource.resourceId] ? (resourceUpdates[resource.resourceId]?.overrideRate || resource.rate) : (resourceUpdates[resource.resourceId]?.rate || resource.rate)) - (resource.quantity * resource.rate)) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {((resource.quantity) * (useOverride[resource.resourceId] ? (resourceUpdates[resource.resourceId]?.overrideRate || resource.rate) : (resourceUpdates[resource.resourceId]?.rate || resource.rate)) - (resource.quantity * resource.rate)) >= 0 ? '+' : ''}
                      £{((resource.quantity) * (useOverride[resource.resourceId] ? (resourceUpdates[resource.resourceId]?.overrideRate || resource.rate) : (resourceUpdates[resource.resourceId]?.rate || resource.rate)) - (resource.quantity * resource.rate)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustRateModal; 