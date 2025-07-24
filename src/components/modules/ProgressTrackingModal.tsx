import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalculatorIcon, CogIcon } from '@heroicons/react/24/outline';
import { progressTrackingService, type TaskProgress } from '../../services/progressTrackingService';

interface ProgressTrackingModalProps {
  currentProgress: number;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdate: (taskId: string, progress: number, autoProgress: boolean) => void;
  taskId: string;
  taskName: string;
}

const ProgressTrackingModal: React.FC<ProgressTrackingModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskName,
  currentProgress,
  onProgressUpdate
}) => {
  const [progress, setProgress] = useState(currentProgress);
  const [autoProgress, setAutoProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [hasChildren, setHasChildren] = useState(false);
  const [calculatedProgress, setCalculatedProgress] = useState(0);

  const isDemo = progressTrackingService.isInDemoMode();
  const demoConfig = progressTrackingService.getDemoModeConfig();

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskProgress();
      checkForChildren();
    }
  }, [isOpen, taskId]);

  const loadTaskProgress = async () => {
    try {
      const progressData = await progressTrackingService.getTaskProgress(taskId);
      if (progressData) {
        setTaskProgress(progressData);
        setProgress(progressData.percentComplete);
        setAutoProgress(progressData.autoProgress);
      }
    } catch (error) {
      console.error('Error loading task progress:', error);
    }
  };

  const checkForChildren = async () => {
    try {
      const aggregation = await progressTrackingService.calculateAggregatedProgress(taskId);
      setHasChildren(aggregation.hasChildren);
      setCalculatedProgress(aggregation.calculatedProgress);
    } catch (error) {
      console.error('Error checking for children:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await progressTrackingService.updateTaskProgress({
        taskId,
        percentComplete: progress,
        autoProgress,
        demoMode: isDemo
      });

      if (success) {
        onProgressUpdate(taskId, progress, autoProgress);
        onClose();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressChange = (newProgress: number) => {
    if (isDemo) {
      setProgress(Math.min(newProgress, demoConfig.maxProgress));
    } else {
      setProgress(newProgress);
    }
  };

  const handleAutoProgressToggle = () => {
    if (!isDemo) {
      setAutoProgress(!autoProgress);
      if (!autoProgress && hasChildren) {
        setProgress(calculatedProgress);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CalculatorIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Progress Tracking
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {taskName}
            </p>
          </div>

          {/* Progress Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Progress (%)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0"
                max={isDemo ? demoConfig.maxProgress : 100}
                value={progress}
                onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={autoProgress}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            {isDemo && (
              <p className="text-xs text-orange-600 mt-1">
                Demo mode: Maximum {demoConfig.maxProgress}%
              </p>
            )}
          </div>

          {/* Progress Bar Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded">
              <div
                className={`h-6 rounded transition-all duration-300 ${
                  isDemo ? demoConfig.barColor : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progress, isDemo ? demoConfig.maxProgress : 100)}%` }}
              />
            </div>
          </div>

          {/* Auto Progress Toggle */}
          {hasChildren && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CogIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-calculate from child tasks
                  </label>
                </div>
                <button
                  onClick={handleAutoProgressToggle}
                  disabled={isDemo}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoProgress ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  } ${isDemo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoProgress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {autoProgress && (
                <p className="text-xs text-gray-500 mt-1">
                  Calculated progress: {calculatedProgress}% (from {hasChildren ? 'child tasks' : 'no children'})
                </p>
              )}
              {isDemo && (
                <p className="text-xs text-orange-600 mt-1">
                  Auto-progress disabled in demo mode
                </p>
              )}
            </div>
          )}

          {/* Last Updated Info */}
          {taskProgress?.updatedAt && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-500">
                Last updated: {taskProgress.updatedAt.toLocaleDateString()} at{' '}
                {taskProgress.updatedAt.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTrackingModal; 