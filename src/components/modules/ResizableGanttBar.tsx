import React, { useState, useRef, useEffect, useCallback } from 'react';
import { taskResizeService, type ResizeConstraint } from '../../services/taskResizeService';
import { toastService } from './ToastNotification';

interface ResizableGanttBarProps {
  className?: string;
  constraints: ResizeConstraint;
  dayWidth?: number;
  endDate: Date;
  height?: number;
  isCritical?: boolean;
  isDemo?: boolean;
  isSelected?: boolean;
  onDependencyRecalculate?: () => void;
  onProgressChange?: (taskId: string, newProgress: number) => void;
  onTaskClick?: (taskId: string) => void;
  onTaskResize?: (taskId: string, newStart: Date, newEnd: Date) => void;
  progress: number;
  showProgress?: boolean;
  snapConfig: { enabled: boolean; type: 'day' | 'week' | 'month' };
  startDate: Date;
  taskId: string;
  taskName: string;
}

const ResizableGanttBar: React.FC<ResizableGanttBarProps> = ({
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
  constraints,
  onProgressChange,
  onTaskClick,
  onTaskResize,
  onDependencyRecalculate,
  className = ''
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeEdge, setResizeEdge] = useState<'start' | 'end' | null>(null);
  const [resizeOffset, setResizeOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [constraintViolations, setConstraintViolations] = useState<string[]>([]);
  const barRef = useRef<HTMLDivElement>(null);

  // Calculate bar width based on duration
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const barWidth = Math.max(duration * dayWidth, 60); // Minimum 60px width

  // Check if task is a milestone (duration = 0)
  const isMilestone = duration === 0;

  // Handle mouse down on resize handle
  const handleResizeStart = useCallback((e: React.MouseEvent, edge: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();

    // Don't allow resizing milestones
    if (isMilestone) {
      toastService.warning('Cannot Resize', 'Milestones cannot be resized');
      return;
    }

    // Check if we can start resizing (demo mode limits, permissions, etc.)
    const canResize = taskResizeService.startResize(taskId, startDate, endDate, edge, e.clientX);
    
    if (!canResize) {
      if (isDemo) {
        toastService.warning('Demo Mode', 'Only first 2 tasks can be resized');
      }
      return;
    }

    setIsResizing(true);
    setResizeEdge(edge);
    setResizeOffset(0);

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [taskId, startDate, endDate, isMilestone, isDemo]);

  // Handle mouse move during resize
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const resizeState = taskResizeService.updateResize(e.clientX, dayWidth, snapConfig);
    setResizeOffset(resizeState.currentOffset);
  }, [isResizing, dayWidth, snapConfig]);

  // Handle mouse up to complete resize
  const handleResizeEnd = useCallback(async (e: MouseEvent) => {
    if (!isResizing) return;

    setIsResizing(false);
    setResizeEdge(null);
    setResizeOffset(0);

    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    // Complete the resize operation
    const result = await taskResizeService.completeResize(
      e.clientX,
      dayWidth,
      snapConfig,
      constraints,
      onDependencyRecalculate
    );

    if (result.success) {
      // Call the resize callback
      if (onTaskResize) {
        onTaskResize(taskId, result.newStart, result.newEnd);
      }

      // Show success message
      if (result.demoMode) {
        toastService.warning('Demo Mode', result.message);
      } else {
        toastService.success('Task Resized', result.message);
      }

      // Clear constraint violations
      setConstraintViolations([]);
    } else {
      // Show error message
      if (result.message !== 'No resize detected') {
        toastService.error('Resize Failed', result.message);
        
        // Show constraint violations
        if (result.constraintViolations && result.constraintViolations.length > 0) {
          setConstraintViolations(result.constraintViolations);
        }
      }
    }
  }, [isResizing, dayWidth, snapConfig, constraints, taskId, onTaskResize, onDependencyRecalculate]);

  // Handle click (when not resizing)
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isResizing && onTaskClick) {
      onTaskClick(taskId);
    }
  }, [isResizing, onTaskClick, taskId]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Calculate visual position with resize offset
  const visualOffset = isResizing ? resizeOffset : 0;

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

  // Determine if task has constraint violations
  const hasViolations = constraintViolations.length > 0;

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
          hasViolations
            ? 'bg-red-500 dark:bg-red-600 ring-2 ring-red-300'
            : isCritical 
              ? 'bg-red-500 dark:bg-red-600' 
              : 'bg-blue-500 dark:bg-blue-600'
        } ${
          isResizing ? 'cursor-ew-resize shadow-lg' : 'cursor-pointer'
        }`}
        style={{
          width: `${barWidth}px`,
          height: `${height}px`,
          transform: `translateX(${visualOffset}px)`,
          zIndex: isResizing ? 1000 : 'auto'
        }}
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

        {/* Resize handles */}
        {!isMilestone && (isHovered || isResizing) && (
          <>
            {/* Start handle */}
            <div
              className={`absolute left-0 top-0 w-2 h-full cursor-ew-resize ${
                resizeEdge === 'start' ? 'bg-white bg-opacity-50' : 'bg-white bg-opacity-20'
              } rounded-l transition-opacity duration-200`}
              onMouseDown={(e) => handleResizeStart(e, 'start')}
              title="Drag to resize start date"
            />
            
            {/* End handle */}
            <div
              className={`absolute right-0 top-0 w-2 h-full cursor-ew-resize ${
                resizeEdge === 'end' ? 'bg-white bg-opacity-50' : 'bg-white bg-opacity-20'
              } rounded-r transition-opacity duration-200`}
              onMouseDown={(e) => handleResizeStart(e, 'end')}
              title="Drag to resize end date"
            />
          </>
        )}

        {/* Constraint violation indicator */}
        {hasViolations && (
          <div className="absolute inset-0 bg-red-600 bg-opacity-20 rounded animate-pulse" />
        )}
      </div>

      {/* Tooltip */}
      {isHovered && !isResizing && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg z-10 whitespace-nowrap max-w-xs">
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
          {isMilestone ? (
            <div className="text-xs text-gray-400">
              Milestone (cannot be resized)
            </div>
          ) : (
            <div className="text-xs text-blue-400 font-medium">
              Drag edges to resize
            </div>
          )}
          {hasViolations && (
            <div className="text-xs text-red-400 font-medium mt-1">
              Constraint Violations:
              {constraintViolations.map((violation, index) => (
                <div key={index} className="text-xs text-red-300">
                  • {violation}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resize preview line */}
      {isResizing && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 opacity-50"
          style={{ 
            left: resizeEdge === 'start' ? `${visualOffset}px` : `${barWidth + visualOffset}px`,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default ResizableGanttBar; 