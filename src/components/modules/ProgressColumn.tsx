import React, { useState, useEffect } from 'react';
import { progressTrackingService, type TaskProgress } from '../../services/progressTrackingService';
import { usePermissions } from '../../hooks/usePermissions';

interface ProgressColumnProps {
  className?: string;
  isDemo?: boolean;
  isEditable?: boolean;
  onProgressChange?: (taskId: string, newProgress: number) => void;
  progress: number;
  taskId: string;
}

const ProgressColumn: React.FC<ProgressColumnProps> = ({
  taskId,
  progress,
  isDemo = false,
  isEditable = true,
  onProgressChange,
  className = ''
}) => {
  const { canAccess } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(progress.toString());
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [canEditInDemo, setCanEditInDemo] = useState(true);

  const canEdit = canAccess('programme.progress.edit');
  const demoConfig = progressTrackingService.getDemoModeConfig();

  useEffect(() => {
    if (taskId) {
      loadTaskProgress();
      if (isDemo) {
        checkDemoLimits();
      }
    }
  }, [taskId, isDemo]);

  const loadTaskProgress = async () => {
    try {
      const progressData = await progressTrackingService.getTaskProgress(taskId);
      if (progressData) {
        setTaskProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading task progress:', error);
    }
  };

  const checkDemoLimits = async () => {
    const canEdit = await progressTrackingService.canEditInDemoMode();
    setCanEditInDemo(canEdit);
  };

  const handleClick = () => {
    if (isEditable && canEdit && !isDemo) {
      setIsEditing(true);
      setEditValue(progress.toString());
    }
  };

  const handleEditSubmit = () => {
    const newProgress = parseInt(editValue, 10);
    if (progressTrackingService.validateProgress(newProgress) && onProgressChange) {
      const limitedProgress = progressTrackingService.applyDemoLimits(newProgress);
      onProgressChange(taskId, limitedProgress);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(progress.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const { width, color, tooltip, watermarkClass } = progressTrackingService.getProgressBarStyle(progress, isDemo);

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          type="number"
          min="0"
          max={isDemo ? demoConfig.maxProgress : 100}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleEditSubmit}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <span className="text-xs text-gray-500">%</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center space-x-2 cursor-pointer ${className}`}
      onClick={handleClick}
      title={tooltip}
    >
      {/* Progress bar */}
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${color} ${watermarkClass || ''}`}
          style={{ width }}
        />
      </div>

      {/* Progress percentage */}
      <span className={`text-xs font-medium min-w-[2rem] text-right ${
        isDemo ? 'text-blue-600' : 'text-gray-700'
      }`}>
        {progress}%
      </span>

      {/* Demo indicator */}
      {isDemo && (
        <span className="text-xs text-blue-500">DEMO</span>
      )}

      {/* Edit disabled indicator */}
      {isDemo && !canEditInDemo && (
        <span className="text-xs text-orange-500" title="Demo limit reached">
          ⚠️
        </span>
      )}
    </div>
  );
};

export default ProgressColumn; 