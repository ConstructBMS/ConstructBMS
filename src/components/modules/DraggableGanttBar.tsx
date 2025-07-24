import React, { useState, useRef, useEffect, useCallback } from 'react';
import { dragRescheduleService, type SnapConfig } from '../../services/dragRescheduleService';
import { toastService } from './ToastNotification';

interface DraggableGanttBarProps {
  className?: string;
  dayWidth?: number;
  endDate: Date;
  height?: number;
  isCritical?: boolean;
  isDemo?: boolean;
  isSelected?: boolean;
  onDependencyRecalculate?: () => void;
  onProgressChange?: (taskId: string, newProgress: number) => void;
  onTaskClick?: (taskId: string) => void;
  onTaskReschedule?: (taskId: string, newStart: Date, newEnd: Date) => void;
  progress: number;
  showProgress?: boolean;
  snapConfig: SnapConfig;
  startDate: Date;
  taskName: string;
  taskId: string;
}

const DraggableGanttBar: React.FC<DraggableGanttBarProps> = ({
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
  dayWidth = 20,
  snapConfig,
  onProgressChange,
  onTaskClick,
  onTaskReschedule,
  onDependencyRecalculate,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Calculate bar width based on duration
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const barWidth = Math.max(duration * dayWidth, 60); // Minimum 60px width

  // Handle mouse down to start drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we can start dragging (demo mode limits, permissions, etc.)
    const canDrag = dragRescheduleService.startDrag(taskId, startDate, endDate, e.clientX);
    
    if (!canDrag) {
      if (isDemo) {
        // Show demo limit message
        toastService.warning('Demo Mode', 'Only first 3 tasks can be dragged');
      }
      return;
    }

    setIsDragging(true);
    setDragOffset(0);

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [taskId, startDate, endDate, isDemo]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const dragState = dragRescheduleService.updateDrag(e.clientX, dayWidth, snapConfig);
    setDragOffset(dragState.currentOffset);
  }, [isDragging, dayWidth, snapConfig]);

  // Handle mouse up to complete drag
  const handleMouseUp = useCallback(async (e: MouseEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    setDragOffset(0);

    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Complete the drag operation
    const result = await dragRescheduleService.completeDrag(
      e.clientX,
      dayWidth,
      snapConfig,
      onDependencyRecalculate
    );

    if (result.success) {
      // Call the reschedule callback
      if (onTaskReschedule) {
        onTaskReschedule(taskId, result.newStart, result.newEnd);
      }

      // Show success message
      if (result.demoMode) {
        toastService.warning('Demo Mode', result.message);
      } else {
        toastService.success('Task Rescheduled', result.message);
      }
    } else if (result.message !== 'No movement detected') {
      // Show error message
      toastService.error('Reschedule Failed', result.message);
    }
  }, [isDragging, dayWidth, snapConfig, taskId, onTaskReschedule, onDependencyRecalculate]);

  // Handle click (when not dragging)
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDragging && onTaskClick) {
      onTaskClick(taskId);
    }
  }, [isDragging, onTaskClick, taskId]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Calculate visual position with drag offset
  const visualOffset = isDragging ? dragOffset : 0;

  // Get progress bar styling
  const getProgressBarStyle = (progress: number, isDemo: boolean = false) => {
    let color = 'bg-blue-500';
    if (isDemo) {
      color = 'bg-blue-300';
    } else if (progress >= 100) {
      color = 'bg-green-500';
    } else if (progress >= 75) {
      color = 'bg-blue-500';
    } else if (progress >= 50) {
      color = 'bg-yellow-500';
    } else if (progress >= 25) {
      color = 'bg-orange-500';
    } else {
      color = 'bg-red-500';
    }
    return color;
  };

  const progressColor = getProgressBarStyle(progress, isDemo);

  return (
    <div
      ref={barRef}
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Main task bar */}
      <div
        className={`relative rounded transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-blue-500 ring-offset-2' 
            : isHovered 
              ? 'ring-1 ring-gray-400' 
              : ''
        } ${
          isCritical 
            ? 'bg-red-500 dark:bg-red-600' 
            : 'bg-blue-500 dark:bg-blue-600'
        } ${
          isDragging ? 'cursor-grabbing shadow-lg' : 'cursor-grab'
        }`}
        style={{
          width: `${barWidth}px`,
          height: `${height}px`,
          transform: `translateX(${visualOffset}px)`,
          zIndex: isDragging ? 1000 : 'auto'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Progress overlay */}
        {showProgress && progress > 0 && (
          <div
            className={`absolute left-0 top-0 rounded transition-all duration-300 ${progressColor}`}
            style={{
              width: `${progress}%`,
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
        {showProgress && progress > 0 && (
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
            <span className="text-xs font-bold text-white drop-shadow-sm">
              {progress}%
            </span>
          </div>
        )}

        {/* Drag indicator */}
        {isHovered && !isDragging && (
          <div className="absolute inset-0 bg-black bg-opacity-10 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                Drag to reschedule
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {isHovered && !isDragging && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg z-10 whitespace-nowrap">
          <div className="font-medium">{taskName}</div>
          <div className="text-xs text-gray-300">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-300">
            Duration: {duration} days
          </div>
          <div className="text-xs text-gray-300">
            Progress: {progress}%
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
          <div className="text-xs text-blue-400 font-medium">
            Click and drag to reschedule
          </div>
        </div>
      )}

      {/* Drag preview line */}
      {isDragging && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 opacity-50"
          style={{ 
            left: `${visualOffset}px`,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default DraggableGanttBar; 