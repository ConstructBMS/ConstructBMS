import React, { useState, useEffect } from 'react';
import { XMarkIcon, WalletIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface AssignedResource {
  fixedCost?: number;
  fromDate: Date;
  name: string;
  quantity: number;
  rate: number;
  resourceId: string;
  toDate: Date;
  type: 'labour' | 'material' | 'cost';
  unit: string;
}

interface SetFixedCostModalProps {
  assignedResources: AssignedResource[];
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Record<string, { fixedCost: number }>) => void;
}

const SetFixedCostModal: React.FC<SetFixedCostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assignedResources,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [resourceUpdates, setResourceUpdates] = useState<Record<string, { fixedCost: number }>>({});

  const canEdit = canAccess('programme.resource.edit');
  const isDisabled = disabled || !canEdit;

  useEffect(() => {
    if (isOpen) {
      const initialUpdates: Record<string, { fixedCost: number }> = {};
      assignedResources.forEach(resource => {
        initialUpdates[resource.resourceId] = {
          fixedCost: resource.fixedCost || 0
        };
      });
      setResourceUpdates(initialUpdates);
    }
  }, [isOpen, assignedResources]);

  const handleFixedCostChange = (resourceId: string, fixedCost: number) => {
    setResourceUpdates(prev => ({
      ...prev,
      [resourceId]: {
        fixedCost: Math.max(0, fixedCost)
      }
    }));
  };

  const handleSave = () => {
    onSave(resourceUpdates);
    onClose();
  };

  const handleCancel = () => {
    setResourceUpdates({});
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
            <WalletIcon className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Set Fixed Cost
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
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
            <div className="flex items-start">
              <WalletIcon className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Fixed Cost Override
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Set a flat fee that overrides the calculated cost based on quantity and rate. 
                  Useful for subcontractors, fixed-price work, or one-off costs.
                </p>
              </div>
            </div>
          </div>

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
                      Current: {resource.quantity} {resource.unit} @ £{resource.rate}/{resource.unit}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Calculated Cost: £{(resource.quantity * resource.rate).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fixed Cost (£)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={resourceUpdates[resource.resourceId]?.fixedCost || 0}
                      onChange={(e) => handleFixedCostChange(resource.resourceId, parseFloat(e.target.value) || 0)}
                      disabled={isDisabled}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter fixed cost amount"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`use-fixed-${resource.resourceId}`}
                      checked={(resourceUpdates[resource.resourceId]?.fixedCost || 0) > 0}
                      onChange={(e) => handleFixedCostChange(resource.resourceId, e.target.checked ? (resource.quantity * resource.rate) : 0)}
                      disabled={isDisabled}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <label htmlFor={`use-fixed-${resource.resourceId}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use Fixed Cost Instead of Calculated
                    </label>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Final Cost:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      £{(resourceUpdates[resource.resourceId]?.fixedCost || 0) > 0 
                        ? (resourceUpdates[resource.resourceId]?.fixedCost || 0).toFixed(2)
                        : (resource.quantity * resource.rate).toFixed(2)
                      }
                    </span>
                  </div>
                  {(resourceUpdates[resource.resourceId]?.fixedCost || 0) > 0 && (
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Difference:</span>
                      <span className={((resourceUpdates[resource.resourceId]?.fixedCost || 0) - (resource.quantity * resource.rate)) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {((resourceUpdates[resource.resourceId]?.fixedCost || 0) - (resource.quantity * resource.rate)) >= 0 ? '+' : ''}
                        £{((resourceUpdates[resource.resourceId]?.fixedCost || 0) - (resource.quantity * resource.rate)).toFixed(2)}
                      </span>
                    </div>
                  )}
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
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetFixedCostModal; 