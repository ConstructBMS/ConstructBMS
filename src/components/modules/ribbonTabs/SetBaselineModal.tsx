import React, { useState } from 'react';
import { XMarkIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface Baseline {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  projectId: string;
  snapshot: any[];
  demo?: boolean;
}

interface SetBaselineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (baseline: Omit<Baseline, 'id' | 'createdAt' | 'createdBy'>) => void;
  isDemoMode?: boolean;
  currentUser?: string;
}

const SetBaselineModal: React.FC<SetBaselineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isDemoMode = false,
  currentUser = 'Demo User'
}) => {
  const [baselineName, setBaselineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !baselineName.trim()) return;

    setIsLoading(true);
    try {
      const baselineData = {
        name: baselineName.trim(),
        projectId: 'demo',
        snapshot: [], // Will be populated by the service
        demo: isDemoMode
      };

      await onSave(baselineData);
      setBaselineName('');
      onClose();
    } catch (error) {
      console.error('Failed to set baseline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setBaselineName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BookmarkIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Set Baseline</h2>
              <p className="text-sm text-gray-500">Save current schedule as a snapshot</p>
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
            {/* Baseline Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baseline Name *
              </label>
              <input
                type="text"
                value={baselineName}
                onChange={(e) => setBaselineName(e.target.value)}
                disabled={!canEdit}
                placeholder="e.g., Tender Baseline, Contract Award, etc."
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
                required
              />
            </div>

            {/* What will be captured */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                This baseline will capture:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Current task list and structure</li>
                <li>• Task start and finish dates</li>
                <li>• Task dependencies and relationships</li>
                <li>• Task constraints and calendars</li>
                <li>• Resource assignments</li>
                <li>• Progress and completion status</li>
              </ul>
            </div>

            {/* Current User Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Created by:</span> {currentUser}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Date:</span> {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to create baselines.
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
                disabled={isLoading || !baselineName.trim()}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading || !baselineName.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Creating...' : 'Create Baseline'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetBaselineModal; 