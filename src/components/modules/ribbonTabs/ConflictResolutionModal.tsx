import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ResourceConflict {
  assignedHours: number;
  date: Date;
  id: string;
  maxCapacity: number;
  overallocation: number;
  resourceId: string;
  resourceName: string;
  taskId: string;
  taskName: string;
  type: 'overallocation' | 'double-booking';
}

interface ConflictResolution {
  conflictId: string;
  details?: string;
  resolution: 'split' | 'delay' | 'reassign' | 'ignore';
}

interface ConflictResolutionModalProps {
  conflicts: ResourceConflict[];
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolutions: ConflictResolution[]) => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  onResolve,
  conflicts,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [resolutions, setResolutions] = useState<ConflictResolution[]>([]);

  const canEdit = canAccess('programme.resource.edit');
  const isDisabled = disabled || !canEdit;

  useEffect(() => {
    if (isOpen) {
      const initialResolutions: ConflictResolution[] = conflicts.map(conflict => ({
        conflictId: conflict.id,
        resolution: 'ignore'
      }));
      setResolutions(initialResolutions);
    }
  }, [isOpen, conflicts]);

  const handleResolutionChange = (conflictId: string, resolution: 'split' | 'delay' | 'reassign' | 'ignore') => {
    setResolutions(prev => 
      prev.map(r => 
        r.conflictId === conflictId 
          ? { ...r, resolution }
          : r
      )
    );
  };

  const handleDetailsChange = (conflictId: string, details: string) => {
    setResolutions(prev => 
      prev.map(r => 
        r.conflictId === conflictId 
          ? { ...r, details }
          : r
      )
    );
  };

  const handleResolve = () => {
    onResolve(resolutions);
    onClose();
  };

  const handleCancel = () => {
    setResolutions([]);
    onClose();
  };

  const getConflictTypeColor = (type: string) => {
    switch (type) {
      case 'overallocation': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'double-booking': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'overallocation': return '⚠️';
      case 'double-booking': return '🔄';
      default: return '❓';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Conflict Resolution
            </h2>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {conflicts.length} conflict(s) detected
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
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Resource Conflicts Detected
                </h3>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  The following resources are overallocated or double-booked. Choose resolution actions for each conflict.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`p-4 rounded border ${getConflictTypeColor(conflict.type)}`}
              >
                <div className="flex items-center mb-3">
                  <span className="mr-2">{getConflictTypeIcon(conflict.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {conflict.resourceName} - {conflict.taskName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {conflict.date.toLocaleDateString()}: {conflict.assignedHours}h assigned, {conflict.maxCapacity}h capacity
                    </div>
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">
                      Overallocation: {conflict.overallocation}h
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resolution Action
                    </label>
                    <select
                      value={resolutions.find(r => r.conflictId === conflict.id)?.resolution || 'ignore'}
                      onChange={(e) => handleResolutionChange(conflict.id, e.target.value as any)}
                      disabled={isDisabled}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="ignore">Ignore (No Action)</option>
                      <option value="split">Split Resource Between Tasks</option>
                      <option value="delay">Delay One of the Tasks</option>
                      <option value="reassign">Reassign to Different Resource</option>
                    </select>
                  </div>
                  
                  {resolutions.find(r => r.conflictId === conflict.id)?.resolution !== 'ignore' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Resolution Details
                      </label>
                      <textarea
                        value={resolutions.find(r => r.conflictId === conflict.id)?.details || ''}
                        onChange={(e) => handleDetailsChange(conflict.id, e.target.value)}
                        disabled={isDisabled}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                        placeholder="Enter specific details for this resolution..."
                      />
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
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Resolutions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal; 