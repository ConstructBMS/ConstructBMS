import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FireIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { taskService } from '../services/taskService';
import { adminTabService } from '../services/adminTabService';
import { taskBarColorService } from '../services/taskBarColorService';
import { baselineService, BaselineDelta } from '../services/baselineService';
import BaselineBar from './BaselineBar';
import TaskLockIndicator from './TaskLockIndicator';

export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  statusId: string;
  tags: string[];
  type: 'task' | 'milestone' | 'phase' | 'summary';
  description?: string;
  projectId: string;
  userId: string;
  demo?: boolean;
  createdAt: Date;
  updatedAt: Date;
  progress?: number; // Added for progress indicator
}

export interface TaskStatus {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface ProjectTag {
  id: string;
  name: string;
  color: string;
  scope: 'global' | 'project';
}

interface TaskBarProps {
  task: Task;
  projectId: string;
  rowHeight: number;
  dayWidth: number;
  startDate: Date;
  onTaskClick: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  isSelected?: boolean;
  isCritical?: boolean;
  isInSelectedPath?: boolean;
  showCriticalPath?: boolean;
  showBaseline?: boolean;
  baselineDelta?: BaselineDelta | null;
  baselineTask?: {
    baselineId: string;
    taskId: string;
    baselineStartDate: Date;
    baselineEndDate: Date;
    baselineDuration: number;
    demo?: boolean;
  } | null;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startDate: Date;
  endDate: Date;
  originalStartDate: Date;
  originalEndDate: Date;
}

interface ResizeState {
  isResizing: boolean;
  resizeHandle: 'left' | 'right' | null;
  startX: number;
  startDate: Date;
  endDate: Date;
  originalStartDate: Date;
  originalEndDate: Date;
}

const TaskBar: React.FC<TaskBarProps> = ({
  task,
  projectId,
  rowHeight,
  dayWidth,
  startDate,
  onTaskClick,
  onTaskUpdate,
  isSelected = false,
  isCritical = false,
  isInSelectedPath = false,
  showCriticalPath = true,
  showBaseline = false,
  baselineDelta = null,
  baselineTask = null
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startDate: task.startDate,
    endDate: task.endDate,
    originalStartDate: task.startDate,
    originalEndDate: task.endDate
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizeHandle: null,
    startX: 0,
    startDate: task.startDate,
    endDate: task.endDate,
    originalStartDate: task.startDate,
    originalEndDate: task.endDate
  });
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [projectTags, setProjectTags] = useState<ProjectTag[]>([]);
  const [taskCount, setTaskCount] = useState(0);

  const barRef = useRef<HTMLDivElement>(null);
  const leftHandleRef = useRef<HTMLDivElement>(null);
  const rightHandleRef = useRef<HTMLDivElement>(null);

  const canEdit = canAccess('programme.task.edit');
  const canView = canAccess('programme.task.view');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load task data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load task statuses
        const statuses = await adminTabService.getTaskStatuses();
        setTaskStatuses(statuses);

        // Load project tags
        const tags = await adminTabService.getProjectTags(projectId);
        setProjectTags(tags);

        // Get task count for demo mode restrictions
        const count = await taskService.getTaskCount(projectId);
        setTaskCount(count);
      } catch (error) {
        console.error('Error loading task bar data:', error);
      }
    };

    loadData();
  }, [projectId]);

  // Calculate bar position and width
  const calculateBarStyle = useCallback(() => {
    const daysFromStart = Math.floor((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = daysFromStart * dayWidth;
    const width = Math.max(duration * dayWidth, 20); // Minimum 20px width
    
    return {
      left: `${left}px`,
      width: `${width}px`,
      height: `${rowHeight - 4}px`, // 2px margin top and bottom
      top: '2px'
    };
  }, [task.startDate, task.endDate, startDate, dayWidth, rowHeight]);

  // Get task bar color using the color service
  const getTaskBarColor = () => {
    const colorInfo = taskBarColorService.getTaskBarColor(task, taskStatuses, projectTags);
    return colorInfo.color;
  };

  // Get task status color for tooltip
  const getStatusColor = () => {
    const status = taskStatuses.find(s => s.id === task.statusId);
    return status?.color || 'bg-gray-400';
  };

  // Get task tags for tooltip
  const getTaskTags = () => {
    return projectTags.filter(tag => task.tags.includes(tag.id));
  };

  // Calculate duration in days
  const getDuration = useCallback(() => {
    const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
    return duration;
  }, [task.startDate, task.endDate]);

  // Format date for display
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Handle click on task bar
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEdit) {
      onTaskClick(task.id);
    }
  }, [canEdit, task.id, onTaskClick]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canEdit || (isDemoMode && taskCount >= 3)) return;
    
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startDate: task.startDate,
      endDate: task.endDate,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate
    });
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [canEdit, isDemoMode, taskCount, task.startDate, task.endDate]);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return;
    
    const deltaX = e.clientX - dragState.startX;
    const deltaDays = Math.round(deltaX / dayWidth);
    
    let newStartDate = new Date(dragState.originalStartDate);
    let newEndDate = new Date(dragState.originalEndDate);
    
    newStartDate.setDate(newStartDate.getDate() + deltaDays);
    newEndDate.setDate(newEndDate.getDate() + deltaDays);
    
    // Demo mode restrictions
    if (isDemoMode) {
      const maxDays = 5;
      const originalDuration = getDuration();
      const newDuration = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (newDuration > maxDays) {
        // Adjust to maintain original duration but within 5-day range
        newStartDate = new Date(newStartDate);
        newEndDate = new Date(newStartDate.getTime() + originalDuration * 24 * 60 * 60 * 1000);
      }
    }
    
    setDragState(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: newEndDate
    }));
    
    // Update task immediately for visual feedback
    onTaskUpdate(task.id, {
      startDate: newStartDate,
      endDate: newEndDate
    });
  }, [dragState, dayWidth, isDemoMode, getDuration, onTaskUpdate, task.id]);

  // Handle drag end
  const handleDragEnd = useCallback(async () => {
    if (!dragState.isDragging) return;
    
    try {
      // Persist changes to Supabase
      await taskService.updateTask(task.id, {
        startDate: dragState.startDate,
        endDate: dragState.endDate,
        demo: isDemoMode
      });
      
      console.log('Task dates updated via drag:', task.id);
    } catch (error) {
      console.error('Error updating task dates:', error);
      
      // Revert to original dates on error
      onTaskUpdate(task.id, {
        startDate: dragState.originalStartDate,
        endDate: dragState.originalEndDate
      });
    }
    
    setDragState(prev => ({ ...prev, isDragging: false }));
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  }, [dragState, task.id, isDemoMode, onTaskUpdate]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canEdit || (isDemoMode && taskCount >= 3)) return;
    
    setResizeState({
      isResizing: true,
      resizeHandle: handle,
      startX: e.clientX,
      startDate: task.startDate,
      endDate: task.endDate,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate
    });
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [canEdit, isDemoMode, taskCount, task.startDate, task.endDate]);

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeState.isResizing) return;
    
    const deltaX = e.clientX - resizeState.startX;
    const deltaDays = Math.round(deltaX / dayWidth);
    
    let newStartDate = new Date(resizeState.originalStartDate);
    let newEndDate = new Date(resizeState.originalEndDate);
    
    if (resizeState.resizeHandle === 'left') {
      newStartDate.setDate(newStartDate.getDate() + deltaDays);
    } else if (resizeState.resizeHandle === 'right') {
      newEndDate.setDate(newEndDate.getDate() + deltaDays);
    }
    
    // Ensure start date is before end date
    if (newStartDate >= newEndDate) {
      if (resizeState.resizeHandle === 'left') {
        newStartDate = new Date(newEndDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        newEndDate = new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    
    // Demo mode restrictions
    if (isDemoMode) {
      const newDuration = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const maxDuration = 10;
      
      if (newDuration > maxDuration) {
        if (resizeState.resizeHandle === 'left') {
          newStartDate = new Date(newEndDate.getTime() - maxDuration * 24 * 60 * 60 * 1000);
        } else {
          newEndDate = new Date(newStartDate.getTime() + maxDuration * 24 * 60 * 60 * 1000);
        }
      }
    }
    
    setResizeState(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: newEndDate
    }));
    
    // Update task immediately for visual feedback
    onTaskUpdate(task.id, {
      startDate: newStartDate,
      endDate: newEndDate
    });
  }, [resizeState, dayWidth, isDemoMode, onTaskUpdate, task.id]);

  // Handle resize end
  const handleResizeEnd = useCallback(async () => {
    if (!resizeState.isResizing) return;
    
    try {
      // Persist changes to Supabase
      await taskService.updateTask(task.id, {
        startDate: resizeState.startDate,
        endDate: resizeState.endDate,
        demo: isDemoMode
      });
      
      console.log('Task resized:', task.id);
    } catch (error) {
      console.error('Error resizing task:', error);
      
      // Revert to original dates on error
      onTaskUpdate(task.id, {
        startDate: resizeState.originalStartDate,
        endDate: resizeState.originalEndDate
      });
    }
    
    setResizeState(prev => ({ ...prev, isResizing: false, resizeHandle: null }));
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [resizeState, task.id, isDemoMode, onTaskUpdate]);

  // Handle mouse enter for tooltip
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (!canView) return;
    
    const rect = barRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
    setShowTooltip(true);
  }, [canView]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Handle mouse move for tooltip positioning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canView) return;
    const rect = barRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({ x: e.clientX, y: e.clientY - 10 });
    }
  }, [canView]);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setDragState({
      isDragging: true,
      startX: e.touches[0].clientX,
      startDate: task.startDate,
      endDate: task.endDate,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate
    });
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [canEdit, task.startDate, task.endDate]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging) return;
    const deltaX = e.touches[0].clientX - dragState.startX;
    const deltaDays = Math.round(deltaX / dayWidth);

    let newStartDate = new Date(dragState.originalStartDate);
    let newEndDate = new Date(dragState.originalEndDate);

    newStartDate.setDate(newStartDate.getDate() + deltaDays);
    newEndDate.setDate(newEndDate.getDate() + deltaDays);

    // Demo mode restrictions
    if (isDemoMode) {
      const maxDays = 5;
      const originalDuration = getDuration();
      const newDuration = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (newDuration > maxDays) {
        // Adjust to maintain original duration but within 5-day range
        newStartDate = new Date(newStartDate);
        newEndDate = new Date(newStartDate.getTime() + originalDuration * 24 * 60 * 60 * 1000);
      }
    }

    setDragState(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: newEndDate
    }));

    // Update task immediately for visual feedback
    onTaskUpdate(task.id, {
      startDate: newStartDate,
      endDate: newEndDate
    });
  }, [dragState, dayWidth, isDemoMode, getDuration, onTaskUpdate, task.id]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!dragState.isDragging) return;
    
    try {
      // Persist changes to Supabase
      await taskService.updateTask(task.id, {
        startDate: dragState.startDate,
        endDate: dragState.endDate,
        demo: isDemoMode
      });
      
      console.log('Task dates updated via drag:', task.id);
    } catch (error) {
      console.error('Error updating task dates:', error);
      
      // Revert to original dates on error
      onTaskUpdate(task.id, {
        startDate: dragState.originalStartDate,
        endDate: dragState.originalEndDate
      });
    }
    
    setDragState(prev => ({ ...prev, isDragging: false }));
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [dragState, task.id, isDemoMode, onTaskUpdate]);

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleDragMove, handleDragEnd, handleResizeMove, handleResizeEnd, handleTouchMove, handleTouchEnd]);

  const barStyle = calculateBarStyle();
  const statusColor = getStatusColor();
  const taskTags = getTaskTags();
  const duration = getDuration();

  // Get critical path styling
  const getCriticalPathStyling = () => {
    if (!showCriticalPath || !isCritical) {
      return {};
    }

    const baseColor = isDemoMode ? '#fca5a5' : '#dc2626'; // red-300 for demo, red-500 for normal
    const borderColor = isDemoMode ? '#f87171' : '#b91c1c'; // red-400 for demo, red-700 for normal

    return {
      border: `2px solid ${borderColor}`,
      boxShadow: `0 0 0 1px ${baseColor}`,
      position: 'relative' as const
    };
  };

  // Get baseline styling
  const getBaselineStyling = () => {
    if (!showBaseline || !baselineDelta) {
      return {};
    }

    // Determine color based on drift severity
    const maxDrift = Math.max(Math.abs(baselineDelta.startDrift), Math.abs(baselineDelta.endDrift));
    
    if (maxDrift <= 1) {
      // On time - no additional styling
      return {};
    } else if (baselineDelta.startDrift > 0 || baselineDelta.endDrift > 0) {
      // Delayed - red indicator
      const color = isDemoMode ? '#fca5a5' : '#dc2626'; // red-300 for demo, red-500 for normal
      return {
        borderLeft: `3px solid ${color}`,
        borderRight: `3px solid ${color}`
      };
    } else {
      // Early - green indicator
      const color = isDemoMode ? '#86efac' : '#16a34a'; // green-300 for demo, green-600 for normal
      return {
        borderLeft: `3px solid ${color}`,
        borderRight: `3px solid ${color}`
      };
    }
  };

  return (
    <>
      {/* Baseline Bar Overlay */}
      {showBaseline && baselineTask && (
        <BaselineBar
          baselineTask={baselineTask}
          delta={baselineDelta}
          dayWidth={dayWidth}
          rowHeight={rowHeight}
          startDate={startDate}
          isDemoMode={isDemoMode}
        />
      )}

      <div
        ref={barRef}
        className={`
          relative cursor-pointer select-none transition-all duration-200
          ${isSelected ? 'z-20' : 'z-10'}
          ${isInSelectedPath ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        `}
        style={{
          ...barStyle,
          backgroundColor: getTaskBarColor(),
          border: `1px solid ${getTaskBarColor()}dd`,
          boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
          ...getCriticalPathStyling(),
          ...getBaselineStyling()
        }}
        onClick={() => onTaskClick(task.id)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Critical Path Indicator */}
        {showCriticalPath && isCritical && (
          <div className="absolute -top-1 -right-1 z-30">
            <FireIcon 
              className={`w-3 h-3 ${isDemoMode ? 'text-red-300' : 'text-red-500'}`}
              title={isDemoMode ? 'DEMO CRITICAL PATH' : 'Critical Task - No Slack'}
            />
          </div>
        )}

        {/* Task Lock Indicator */}
        <TaskLockIndicator taskId={task.id} position="top-left" />

        {/* Baseline Drift Indicator */}
        {showBaseline && baselineDelta && Math.max(Math.abs(baselineDelta.startDrift), Math.abs(baselineDelta.endDrift)) > 1 && (
          <div className="absolute -top-1 -left-1 z-30">
            <div
              className={`w-2 h-2 rounded-full ${
                baselineDelta.startDrift > 0 || baselineDelta.endDrift > 0
                  ? isDemoMode ? 'bg-red-300' : 'bg-red-500'
                  : isDemoMode ? 'bg-green-300' : 'bg-green-500'
              }`}
              title={`Baseline drift: Start ${baselineService.formatDelta(baselineDelta.startDrift)}, End ${baselineService.formatDelta(baselineDelta.endDrift)}`}
            />
          </div>
        )}

        {/* Task Content */}
        <div className="flex items-center justify-between h-full px-2 text-xs text-white font-medium">
          <span className="truncate flex-1">{task.name}</span>
          <span className="ml-2 text-xs opacity-75">
            {Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24))}d
          </span>
        </div>

        {/* Progress Indicator */}
        {task.progress > 0 && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-50 transition-all duration-200"
            style={{ 
              width: `${task.progress}%`,
              backgroundColor: 'rgba(255, 255, 255, 0.7)'
            }}
          />
        )}

        {/* Resize Handles */}
        {canEdit && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white hover:bg-opacity-50 transition-colors duration-200"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white hover:bg-opacity-50 transition-colors duration-200"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
          </>
        )}

        {/* Ghost Bar for Drag Preview */}
        {dragState.isDragging && (
          <div
            className="absolute opacity-50 bg-gray-400 border border-gray-500 rounded"
            style={{
              left: `${(dragState.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) * dayWidth}px`,
              width: `${(dragState.endDate.getTime() - dragState.startDate.getTime()) / (1000 * 60 * 60 * 24) * dayWidth}px`,
              height: `${rowHeight - 4}px`,
              top: '2px'
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && canView && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            pointerEvents: 'none'
          }}
        >
          <div className="space-y-2">
            {/* Demo Watermark */}
            {isDemoMode && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                DEMO TASK
              </div>
            )}

            {/* Task Name */}
            <div className="font-medium text-gray-900 dark:text-white">
              {task.name}
            </div>

            {/* Dates */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div>Start: {task.startDate.toLocaleDateString()}</div>
              <div>End: {task.endDate.toLocaleDateString()}</div>
              <div>Duration: {Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24))} days</div>
            </div>

            {/* Baseline Comparison */}
            {showBaseline && baselineDelta && !isDemoMode && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Baseline Comparison
                </div>
                <div className="space-y-1 text-xs">
                  <div className={`flex justify-between ${baselineService.getDeltaColorClass(baselineDelta.startDrift)}`}>
                    <span>Start Drift:</span>
                    <span className="font-medium">{baselineService.formatDelta(baselineDelta.startDrift)}</span>
                  </div>
                  <div className={`flex justify-between ${baselineService.getDeltaColorClass(baselineDelta.endDrift)}`}>
                    <span>End Drift:</span>
                    <span className="font-medium">{baselineService.formatDelta(baselineDelta.endDrift)}</span>
                  </div>
                  <div className={`flex justify-between ${baselineService.getDeltaColorClass(baselineDelta.durationChange)}`}>
                    <span>Duration Change:</span>
                    <span className="font-medium">{baselineService.formatDelta(baselineDelta.durationChange)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor() }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {taskStatuses.find(s => s.id === task.statusId)?.name || 'Unknown'}
              </span>
            </div>

            {/* Tags */}
            {getTaskTags().length > 0 && (
              <div className="flex flex-wrap gap-1">
                {getTaskTags().map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: tag.color,
                      color: 'white'
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Type */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Type: {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
            </div>

            {/* Critical Path Indicator */}
            {showCriticalPath && isCritical && (
              <div className="flex items-center space-x-2 text-sm">
                <FireIcon className={`w-4 h-4 ${isDemoMode ? 'text-red-300' : 'text-red-500'}`} />
                <span className={`font-medium ${isDemoMode ? 'text-red-300' : 'text-red-500'}`}>
                  {isDemoMode ? 'DEMO CRITICAL PATH' : 'Critical Task - No Slack'}
                </span>
              </div>
            )}

            {/* Demo Restrictions */}
            {isDemoMode && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Demo mode: Limited functionality
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TaskBar; 