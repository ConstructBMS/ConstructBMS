import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { progressTrackingService, type TaskProgress } from '../../../services/progressTrackingService';
import { usePermissions } from '../../../hooks/usePermissions';

interface ProgressTabProps {
  isDemoMode: boolean;
  onProgressUpdate?: (taskId: string, progress: number) => void;
  projectId: string;
  taskId: string;
}

const ProgressTab: React.FC<ProgressTabProps> = ({
  taskId,
  projectId,
  isDemoMode,
  onProgressUpdate
}) => {
  const { canAccess } = usePermissions();
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [percentComplete, setPercentComplete] = useState(0);
  const [actualStartDate, setActualStartDate] = useState<string>('');
  const [actualFinishDate, setActualFinishDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [demoTaskCount, setDemoTaskCount] = useState(0);
  const [canEditInDemo, setCanEditInDemo] = useState(true);

  const canEdit = canAccess('programme.progress.edit');
  const canView = canAccess('programme.progress.view');
  const demoConfig = progressTrackingService.getDemoModeConfig();

  useEffect(() => {
    if (taskId) {
      loadTaskProgress();
      if (isDemoMode) {
        checkDemoLimits();
      }
    }
  }, [taskId, isDemoMode]);

  const loadTaskProgress = async () => {
    try {
      setIsLoading(true);
      const progress = await progressTrackingService.getTaskProgress(taskId);
      if (progress) {
        setTaskProgress(progress);
        setPercentComplete(progress.percentComplete);
        setActualStartDate(progress.actualStartDate || '');
        setActualFinishDate(progress.actualFinishDate || '');
      }
    } catch (error) {
      console.error('Error loading task progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDemoLimits = async () => {
    const count = await progressTrackingService.getDemoTaskCount();
    const canEdit = await progressTrackingService.canEditInDemoMode();
    setDemoTaskCount(count);
    setCanEditInDemo(canEdit);
  };

  const handleProgressChange = (value: number) => {
    const maxProgress = isDemoMode ? demoConfig.maxProgress : 100;
    setPercentComplete(Math.min(value, maxProgress));
  };

  const handleMarkComplete = () => {
    setPercentComplete(100);
    if (!actualFinishDate) {
      setActualFinishDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleSave = async () => {
    if (!canEdit || (isDemoMode && !canEditInDemo)) return;

    try {
      setIsSaving(true);
      const success = await progressTrackingService.updateTaskProgress({
        taskId,
        percentComplete,
        actualStartDate: actualStartDate || null,
        actualFinishDate: actualFinishDate || null,
        demoMode: isDemoMode
      });

      if (success) {
        await loadTaskProgress();
        if (onProgressUpdate) {
          onProgressUpdate(taskId, percentComplete);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getProgressBarStyle = () => {
    const { width, color, tooltip, watermarkClass } = progressTrackingService.getProgressBarStyle(percentComplete, isDemoMode);
    return { width, color, tooltip, watermarkClass };
  };

  const { width, color, tooltip, watermarkClass } = getProgressBarStyle();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading progress...</span>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">You don't have permission to view progress information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Demo Mode Restrictions</p>
              <ul className="mt-1 space-y-1">
                <li>• Maximum progress: {demoConfig.maxProgress}%</li>
                <li>• Actual dates disabled</li>
                <li>• Limited to {demoConfig.maxEditableTasks} tasks ({demoTaskCount}/{demoConfig.maxEditableTasks} used)</li>
                <li>• Progress bars show watermark pattern</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Progress Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress (%)
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            min="0"
            max={isDemoMode ? demoConfig.maxProgress : 100}
            value={percentComplete}
            onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
            disabled={!canEdit || (isDemoMode && !canEditInDemo)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <span className="text-sm text-gray-500">%</span>
          <button
            onClick={handleMarkComplete}
            disabled={!canEdit || (isDemoMode && !canEditInDemo) || percentComplete === 100}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Complete
          </button>
        </div>
        {isDemoMode && (
          <p className="text-xs text-orange-600 mt-1">
            Demo mode: Maximum {demoConfig.maxProgress}%
          </p>
        )}
      </div>

      {/* Progress Bar Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress Bar Preview
        </label>
        <div className="relative bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${color} ${watermarkClass || ''}`}
            style={{ width }}
            title={tooltip}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{tooltip}</p>
      </div>

      {/* Actual Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Start Date
          </label>
          <input
            type="date"
            value={actualStartDate}
            onChange={(e) => setActualStartDate(e.target.value)}
            disabled={!canEdit || isDemoMode || (isDemoMode && !canEditInDemo)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          {isDemoMode && (
            <p className="text-xs text-gray-500 mt-1">Disabled in demo mode</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Finish Date
          </label>
          <input
            type="date"
            value={actualFinishDate}
            onChange={(e) => setActualFinishDate(e.target.value)}
            disabled={!canEdit || isDemoMode || (isDemoMode && !canEditInDemo)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          {isDemoMode && (
            <p className="text-xs text-gray-500 mt-1">Disabled in demo mode</p>
          )}
        </div>
      </div>

      {/* Progress Information */}
      {taskProgress && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Progress Information</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {taskProgress.progressUpdatedAt && (
              <p>Last updated: {new Date(taskProgress.progressUpdatedAt).toLocaleString()}</p>
            )}
            {taskProgress.progressUpdatedBy && (
              <p>Updated by: {taskProgress.progressUpdatedBy}</p>
            )}
            {taskProgress.demo && (
              <p className="text-orange-600">Demo data</p>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || (isDemoMode && !canEditInDemo)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Save Progress
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressTab; 