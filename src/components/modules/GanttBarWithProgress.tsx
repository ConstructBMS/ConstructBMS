import React, { useState, useEffect } from 'react';
import { progressTrackingService } from '../../services/progressTrackingService';
import ProgressBar from './ProgressBar';

interface GanttBarWithProgressProps {
  className?: string;
  endDate: Date;
  height?: number;
  isCritical?: boolean;
  isDemo?: boolean;
  isSelected?: boolean;
  onProgressChange?: (taskId: string, newProgress: number) => void;
  onTaskClick?: (taskId: string) => void;
  progress: number;
  showProgress?: boolean;
  startDate: Date;
  taskId: string;
  taskName: string;
}

const GanttBarWithProgress: React.FC<GanttBarWithProgressProps> = ({
  taskId,
  taskName,
  startDate,
  endDate,
  progress,
  isCritical = false,
  isSelected = false,
  isDemo = false,
  showProgress = true,
  height = 24,
  onProgressChange,
  onTaskClick,
  className = ''
}) => {
  const [taskProgress, setTaskProgress] = useState(progress);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setTaskProgress(progress);
  }, [progress]);

  const handleProgressChange = async (newProgress: number) => {
    setTaskProgress(newProgress);
    if (onProgressChange) {
      onProgressChange(taskId, newProgress);
    }
  };

  const handleClick = () => {
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };

  // Get progress bar styling
  const { color, tooltip } = progressTrackingService.getProgressBarStyle(taskProgress, isDemo);

  // Calculate bar width based on duration
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const barWidth = Math.max(duration * 20, 60); // Minimum 60px width

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Main task bar */}
      <div
        className={`relative rounded transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'ring-2 ring-blue-500 ring-offset-2' 
            : isHovered 
              ? 'ring-1 ring-gray-400' 
              : ''
        } ${
          isCritical 
            ? 'bg-red-500 dark:bg-red-600' 
            : 'bg-blue-500 dark:bg-blue-600'
        }`}
        style={{
          width: `${barWidth}px`,
          height: `${height}px`
        }}
      >
        {/* Progress overlay */}
        {showProgress && taskProgress > 0 && (
          <div
            className={`absolute left-0 top-0 rounded transition-all duration-300 ${color}`}
            style={{
              width: `${taskProgress}%`,
              height: `${height}px`
            }}
          />
        )}

        {/* Task name label */}
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <span className="text-xs font-medium text-white truncate drop-shadow-sm">
            {taskName}
          </span>
        </div>

        {/* Progress percentage label */}
        {showProgress && taskProgress > 0 && (
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
            <span className="text-xs font-bold text-white drop-shadow-sm">
              {taskProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg z-10 whitespace-nowrap">
          <div className="font-medium">{taskName}</div>
          <div className="text-xs text-gray-300">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-300">
            Duration: {duration} days
          </div>
          <div className="text-xs text-gray-300">
            {tooltip}
          </div>
          {isCritical && (
            <div className="text-xs text-red-400 font-medium">
              Critical Path
            </div>
          )}
          {isDemo && (
            <div className="text-xs text-orange-400 font-medium">
              Demo Mode
            </div>
          )}
        </div>
      )}

      {/* Progress bar for editing (shown on hover) */}
      {isHovered && showProgress && onProgressChange && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-600 z-10">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Progress: {taskProgress}%
          </div>
          <ProgressBar
            taskId={taskId}
            progress={taskProgress}
            isDemo={isDemo}
            showLabel={false}
            height="h-3"
            onProgressChange={handleProgressChange}
            readOnly={false}
          />
          <div className="text-xs text-gray-500 mt-1">
            Click to edit progress
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttBarWithProgress; 