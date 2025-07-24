import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { baselineService, type Baseline } from '../../services/baselineService';
import { toastService } from './ToastNotification';

interface BaselineModalProps {
  currentTasks: Array<{ end: Date, id: string; name: string; start: Date; }>;
  isOpen: boolean;
  onBaselineChange?: () => void;
  onClose: () => void;
  projectId: string;
}

const BaselineModal: React.FC<BaselineModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentTasks,
  onBaselineChange
}) => {
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [newBaselineName, setNewBaselineName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(baselineService.isInDemoMode());

  // Load baselines on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBaselines();
    }
  }, [isOpen, projectId]);

  // Load baselines for project
  const loadBaselines = async () => {
    const projectBaselines = await baselineService.getBaselinesForProject(projectId);
    setBaselines(projectBaselines);
    setIsDemoMode(baselineService.isInDemoMode());
  };

  // Handle create baseline
  const handleCreateBaseline = async () => {
    if (!newBaselineName.trim()) {
      toastService.error('Error', 'Please enter a baseline name');
      return;
    }

    setIsCreating(true);
    try {
      const baseline = await baselineService.createBaseline(
        projectId,
        newBaselineName.trim(),
        currentTasks.map(task => ({
          id: task.id,
          start: task.start,
          end: task.end
        }))
      );

      if (baseline) {
        toastService.success('Success', `Baseline "${baseline.name}" created successfully`);
        setNewBaselineName('');
        await loadBaselines();
        if (onBaselineChange) {
          onBaselineChange();
        }
      } else {
        if (isDemoMode) {
          toastService.warning('Demo Mode', 'Baseline creation is limited in demo mode');
        } else {
          toastService.error('Error', 'Failed to create baseline');
        }
      }
    } catch (error) {
      console.error('Error creating baseline:', error);
      toastService.error('Error', 'Failed to create baseline');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle set active baseline
  const handleSetActive = async (baselineId: string) => {
    try {
      const success = await baselineService.setActiveBaseline(baselineId);
      if (success) {
        toastService.success('Success', 'Active baseline updated');
        await loadBaselines();
        if (onBaselineChange) {
          onBaselineChange();
        }
      } else {
        toastService.error('Error', 'Failed to set active baseline');
      }
    } catch (error) {
      console.error('Error setting active baseline:', error);
      toastService.error('Error', 'Failed to set active baseline');
    }
  };

  // Handle delete baseline
  const handleDeleteBaseline = async (baselineId: string) => {
    setIsDeleting(baselineId);
    try {
      const success = await baselineService.deleteBaseline(baselineId);
      if (success) {
        toastService.success('Success', 'Baseline deleted successfully');
        await loadBaselines();
        if (onBaselineChange) {
          onBaselineChange();
        }
      } else {
        toastService.error('Error', 'Failed to delete baseline');
      }
    } catch (error) {
      console.error('Error deleting baseline:', error);
      toastService.error('Error', 'Failed to delete baseline');
    } finally {
      setIsDeleting(null);
    }
  };

  // Get demo mode configuration
  const demoConfig = baselineService.getDemoModeConfig();

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Baseline Management
            </h2>
            {isDemoMode && (
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 ml-2" />
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Mode Info */}
        {isDemoMode && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
              Demo Mode Active
            </h3>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Maximum baselines per project: {demoConfig.maxBaselinesPerProject}</li>
              <li>• Maximum tasks per baseline: {demoConfig.maxTasksPerBaseline}</li>
              <li>• Tooltip message: "{demoConfig.tooltipMessage}"</li>
              <li>• All data tagged: {demoConfig.baselineStateTag}</li>
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Create New Baseline */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Create New Baseline
            </h3>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newBaselineName}
                onChange={(e) => setNewBaselineName(e.target.value)}
                placeholder="Enter baseline name (e.g., 'Initial Plan')"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                disabled={isCreating}
              />
              <button
                onClick={handleCreateBaseline}
                disabled={isCreating || !newBaselineName.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <PlusIcon className="w-4 h-4 mr-2" />
                )}
                Create
              </button>
            </div>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Will snapshot {currentTasks.length} tasks with current dates
            </div>
          </div>

          {/* Existing Baselines */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Existing Baselines
            </h3>
            
            {baselines.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No baselines created yet
              </div>
            ) : (
              <div className="space-y-3">
                {baselines.map((baseline) => (
                  <div
                    key={baseline.id}
                    className={`p-4 border rounded-lg ${
                      baseline.isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {baseline.name}
                          </h4>
                          {baseline.isActive && (
                            <CheckIcon className="w-4 h-4 text-blue-600 ml-2" />
                          )}
                          {isDemoMode && (
                            <ExclamationTriangleIcon className="w-3 h-3 text-orange-500 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Created {formatDate(baseline.createdAt)} by {baseline.createdBy}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {baseline.demo ? 'Demo baseline' : 'Production baseline'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!baseline.isActive && (
                          <button
                            onClick={() => handleSetActive(baseline.id)}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Set Active
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteBaseline(baseline.id)}
                          disabled={isDeleting === baseline.id}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {isDeleting === baseline.id ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaselineModal; 