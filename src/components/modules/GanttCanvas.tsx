import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useBarStyles } from '../../hooks/useBarStyles';

// Types for Gantt data
export interface GanttTask {
  assignedTo?: string;
  children?: string[];
  constraintDate?: Date;
  // Constraint type for the new system
  constraintType?: 'none' | 'MSO' | 'SNET' | 'FNLT' | 'MFO';
  constraintViolated?: boolean;
  endDate: Date; 
  float: number;
  id: string;
  isCritical: boolean; 
  // 0-100
  isMilestone: boolean;
  level: number;
  name: string;
  // Indentation level
  parentId?: string;
  progress: number; 
  startDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  wbsNumber?: string;
}

export interface GanttLink {
  id: string;
  lag: number;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'; // Lag in days
}

export interface GanttCanvasProps {
  criticalOnly: boolean;
  endDate: Date;
  links: GanttLink[];
  onTaskSelect?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void; 
  projectId?: string;
  selectedTaskId?: string | undefined;
  showCriticalPath: boolean;
  showFloat: boolean;
  // 1 = day, 7 = week, 30 = month
  showGridlines: boolean;
  showTaskLinks: boolean;
  startDate: Date;
  tasks: GanttTask[];
  userRole: string;
  zoomLevel: number;
}

interface CanvasDimensions {
  canvasWidth: number;
  headerHeight: number;
  height: number;
  leftColumnWidth: number;
  rowHeight: number;
  width: number;
}

interface DragState {
  dragType: 'move' | 'resize-start' | 'resize-end' | null;
  isDragging: boolean;
  originalEndDate: Date | null;
  originalStartDate: Date | null;
  startX: number;
  startY: number;
  taskId: string | null;
}

const GanttCanvas: React.FC<GanttCanvasProps> = ({
  tasks,
  links,
  startDate,
  endDate,
  zoomLevel,
  showGridlines,
  showTaskLinks,
  showFloat,
  showCriticalPath,
  criticalOnly,
  onTaskUpdate,
  onTaskSelect,
  selectedTaskId,
  userRole,
  projectId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 1200,
    height: 600,
    leftColumnWidth: 300,
    canvasWidth: 900,
    rowHeight: 40,
    headerHeight: 60
  });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    taskId: null,
    dragType: null,
    startX: 0,
    startY: 0,
    originalStartDate: null,
    originalEndDate: null
  });
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Bar styles hook
  const { getBarStyleForTask } = useBarStyles({ 
    projectId: projectId || '', 
    enabled: true 
  });

  const canEdit = userRole !== 'viewer';

  // Calculate time scale
  const timeScale = useCallback(() => {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    // Apply zoom level to adjust pixels per day
    const basePixelsPerDay = dimensions.canvasWidth / totalDays;
    const zoomMultiplier = zoomLevel / 7; // 7 = week view (baseline)
    const pixelsPerDay = basePixelsPerDay * zoomMultiplier;
    return { totalDays, pixelsPerDay };
  }, [startDate, endDate, dimensions.canvasWidth, zoomLevel]);

  // Convert date to pixel position
  const dateToPixel = useCallback((date: Date): number => {
    const { pixelsPerDay } = timeScale();
    const daysFromStart = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysFromStart * pixelsPerDay;
  }, [startDate, timeScale]);

  // Convert pixel position to date
  const pixelToDate = useCallback((pixel: number): Date => {
    const { pixelsPerDay } = timeScale();
    const daysFromStart = pixel / pixelsPerDay;
    return new Date(startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
  }, [startDate, timeScale]);

  // Get visible tasks (flattened hierarchy)
  const getVisibleTasks = useCallback((): GanttTask[] => {
    const visible: GanttTask[] = [];
    
    const addTask = (task: GanttTask, level: number = 0) => {
      const taskWithLevel = { ...task, level };
      visible.push(taskWithLevel);
      
      if (expandedTasks.has(task.id) && task.children) {
        task.children.forEach(childId => {
          const childTask = tasks.find(t => t.id === childId);
          if (childTask) {
            addTask(childTask, level + 1);
          }
        });
      }
    };

    // Start with root tasks (no parent or parent not in tasks)
    const rootTasks = tasks.filter(task => !task.parentId || !tasks.find(t => t.id === task.parentId));
    rootTasks.forEach(task => addTask(task));

    return visible;
  }, [tasks, expandedTasks]);

  // Toggle task expansion
  const toggleTaskExpansion = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // Handle mouse down for drag operations
  const handleMouseDown = useCallback((e: React.MouseEvent, taskId: string, dragType: 'move' | 'resize-start' | 'resize-end') => {
    if (!canEdit) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    e.preventDefault();
    e.stopPropagation();

    setDragState({
      isDragging: true,
      taskId,
      dragType,
      startX: e.clientX,
      startY: e.clientY,
      originalStartDate: new Date(task.startDate),
      originalEndDate: new Date(task.endDate)
    });
  }, [tasks, canEdit]);

  // Handle mouse move for drag operations
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.taskId || !onTaskUpdate) return;

    const deltaX = e.clientX - dragState.startX;
    const { pixelsPerDay } = timeScale();
    const daysDelta = deltaX / pixelsPerDay;

    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task || !dragState.originalStartDate || !dragState.originalEndDate) return;

    let newStartDate = new Date(dragState.originalStartDate);
    let newEndDate = new Date(dragState.originalEndDate);

    switch (dragState.dragType) {
      case 'move':
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        newEndDate.setDate(newEndDate.getDate() + daysDelta);
        break;
      case 'resize-start':
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        if (newStartDate >= newEndDate) {
          newStartDate = new Date(newEndDate.getTime() - 24 * 60 * 60 * 1000);
        }
        break;
      case 'resize-end':
        newEndDate.setDate(newEndDate.getDate() + daysDelta);
        if (newEndDate <= newStartDate) {
          newEndDate = new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000);
        }
        break;
    }

    // Snap to grid if needed
    if (zoomLevel >= 7) { // Week view or larger
      const snapToDay = (date: Date) => {
        const dayOfWeek = date.getDay();
        const daysToAdd = (7 - dayOfWeek) % 7;
        date.setDate(date.getDate() + daysToAdd);
        return date;
      };
      newStartDate = snapToDay(newStartDate);
      newEndDate = snapToDay(newEndDate);
    }

    onTaskUpdate(dragState.taskId, {
      startDate: newStartDate,
      endDate: newEndDate
    });
  }, [dragState, onTaskUpdate, tasks, timeScale, zoomLevel]);

  // Handle mouse up to end drag operations
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      taskId: null,
      dragType: null,
      startX: 0,
      startY: 0,
      originalStartDate: null,
      originalEndDate: null
    });
  }, []);

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Update dimensions on container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions(prev => ({
          ...prev,
          width: rect.width,
          height: rect.height,
          canvasWidth: rect.width - prev.leftColumnWidth
        }));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate time grid
  const generateTimeGrid = useCallback(() => {
    const { totalDays, pixelsPerDay } = timeScale();
    const gridLines = [];
    
    // Adjust grid density based on zoom level
    const step = zoomLevel >= 30 ? 7 : zoomLevel >= 7 ? 1 : 1; // Monthly, weekly, daily
    
    for (let i = 0; i <= totalDays; i += step) {
      const x = i * pixelsPerDay;
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      gridLines.push({
        x,
        date,
        isMajor: zoomLevel >= 30 ? date.getDate() === 1 : zoomLevel >= 7 ? date.getDay() === 0 : true
      });
    }
    
    return gridLines;
  }, [startDate, timeScale, zoomLevel]);

  // Render task bar
  const renderTaskBar = useCallback((task: GanttTask, y: number) => {
    const startX = dateToPixel(task.startDate);
    const endX = dateToPixel(task.endDate);
    const width = endX - startX;
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;

    if (task.isMilestone) {
      // Render milestone as diamond with enhanced styling
      const centerX = startX;
      const diamondSize = 14; // Slightly larger for better visibility
      const points = [
        `${centerX},${y + dimensions.rowHeight / 2 - diamondSize}`,
        `${centerX + diamondSize},${y + dimensions.rowHeight / 2}`,
        `${centerX},${y + dimensions.rowHeight / 2 + diamondSize}`,
        `${centerX - diamondSize},${y + dimensions.rowHeight / 2}`
      ].join(' ');

      // Critical path styling for milestones
      const isCritical = showCriticalPath && task.isCritical;
      const shouldShow = !criticalOnly || isCritical;
      
      if (!shouldShow) return null;

      // Determine fill color based on critical path, critical status and demo mode
      let fillColor = '#3b82f6'; // Default blue
      if (isCritical) {
        fillColor = '#ef4444'; // Red for critical path
      } else if (task.isCritical) {
        fillColor = '#ef4444'; // Red for critical
      } else if ((task as any).demo) {
        fillColor = '#ec4899'; // Pink for demo
      }

      // Determine stroke color
      const strokeColor = isCritical ? '#dc2626' : (isSelected ? '#1e40af' : '#1e3a8a');

      return (
        <g key={task.id}>
          {/* Main diamond */}
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={isCritical ? 3 : (isSelected ? 2 : 1)}
            className={`cursor-pointer ${isCritical ? 'critical-milestone' : ''}`}
            onMouseEnter={() => setHoveredTaskId(task.id)}
            onMouseLeave={() => setHoveredTaskId(null)}
            onClick={() => onTaskSelect?.(task.id)}
          />
          
          {/* Progress indicator for milestones */}
          {task.progress > 0 && (
            <circle
              cx={centerX}
              cy={y + dimensions.rowHeight / 2}
              r={diamondSize * 0.25}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={1}
            />
          )}

          {/* Demo mode watermark */}
          {(task as any).demo && (
            <text
              x={centerX}
              y={y + dimensions.rowHeight / 2 + diamondSize + 12}
              fontSize="8"
              fill="#ec4899"
              textAnchor="middle"
              className="pointer-events-none"
            >
              DEMO MILESTONE
            </text>
          )}

          {/* Task name label */}
          <text
            x={centerX + diamondSize + 8}
            y={y + dimensions.rowHeight / 2 + 4}
            fontSize="11"
            fill="#1f2937"
            className="pointer-events-none"
          >
            {task.name}
          </text>

          {/* Tag indicator if present */}
          {(task as any).tag && (
            <text
              x={centerX + diamondSize + 8}
              y={y + dimensions.rowHeight / 2 + 16}
              fontSize="9"
              fill="#6b7280"
              className="pointer-events-none"
            >
              {(task as any).tag}
            </text>
          )}
        </g>
      );
    }

    // Render regular task bar
    const barHeight = dimensions.rowHeight * 0.6;
    const barY = y + (dimensions.rowHeight - barHeight) / 2;
    const progressWidth = (width * task.progress) / 100;

    // Critical path styling
    const isCritical = showCriticalPath && task.isCritical;
    const shouldShow = !criticalOnly || isCritical;
    
    if (!shouldShow) return null;

    // Get custom bar style for this task
    const customStyle = getBarStyleForTask(task);
    
    // Determine bar colors and styling
    let fillColor = '#e5e7eb';
    let strokeColor = '#d1d5db';
    let strokeWidth = 1;
    let textColor = '#1f2937';
    let strokeDasharray = 'none';
    
    if (customStyle) {
      fillColor = customStyle.barColor;
      strokeColor = customStyle.borderColor;
      textColor = customStyle.textColor;
      if (customStyle.pattern === 'dashed') {
        strokeDasharray = '5,5';
      } else if (customStyle.pattern === 'dotted') {
        strokeDasharray = '2,2';
      }
    } else if (isCritical) {
      fillColor = '#fecaca';
      strokeColor = '#ef4444';
      strokeWidth = 2;
    }

    return (
      <g key={task.id}>
        {/* Background bar */}
        <rect
          x={startX}
          y={barY}
          width={width}
          height={barHeight}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          rx={4}
          className={`cursor-pointer gantt-task-bar ${isCritical ? 'critical-task-bar' : ''}`}
          onMouseEnter={() => setHoveredTaskId(task.id)}
          onMouseLeave={() => setHoveredTaskId(null)}
          onClick={() => onTaskSelect?.(task.id)}
        />
        
        {/* Progress bar */}
        {task.progress > 0 && (
          <rect
            x={startX}
            y={barY}
            width={progressWidth}
            height={barHeight}
            fill={customStyle ? customStyle.barColor : (isCritical ? '#ef4444' : '#3b82f6')}
            rx={4}
          />
        )}
        
        {/* Constraint violation indicator */}
        {task.constraintViolated && (
          <g>
            <ExclamationTriangleIcon
              x={endX - 16}
              y={barY - 8}
              width={16}
              height={16}
              fill="#ef4444"
              className="pointer-events-none"
            />
            <circle
              cx={endX - 8}
              cy={barY - 4}
              r={8}
              fill="#ef4444"
              opacity={0.2}
            />
          </g>
        )}
        
        {/* Task name on bar */}
        <text
          x={startX + 8}
          y={barY + barHeight / 2 + 4}
          fontSize="12"
          fill={textColor}
          className="pointer-events-none"
        >
          {task.name}
        </text>
        
        {/* Resize handles */}
        {canEdit && (isSelected || isHovered) && (
          <>
            <rect
              x={startX - 4}
              y={barY}
              width={8}
              height={barHeight}
              fill="#3b82f6"
              opacity={0.5}
              className="cursor-ew-resize"
              onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-start')}
            />
            <rect
              x={endX - 4}
              y={barY}
              width={8}
              height={barHeight}
              fill="#3b82f6"
              opacity={0.5}
              className="cursor-ew-resize"
              onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-end')}
            />
          </>
        )}
        
        {/* Float line */}
        {showFloat && task.float > 0 && (
          <line
            x1={endX}
            y1={barY + barHeight / 2}
            x2={endX + (task.float * timeScale().pixelsPerDay)}
            y2={barY + barHeight / 2}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
      </g>
    );
  }, [
    dateToPixel,
    dimensions.rowHeight,
    selectedTaskId,
    hoveredTaskId,
    onTaskSelect,
    canEdit,
    handleMouseDown,
    showFloat,
    timeScale
  ]);

  // Render task links
  const renderTaskLinks = useCallback(() => {
    if (!showTaskLinks) return null;

    return links.map(link => {
      const sourceTask = tasks.find(t => t.id === link.sourceTaskId);
      const targetTask = tasks.find(t => t.id === link.targetTaskId);
      
      if (!sourceTask || !targetTask) return null;

      // Check if this is a critical dependency
      const isCriticalLink = showCriticalPath && 
        sourceTask.isCritical && 
        targetTask.isCritical;

      const sourceX = dateToPixel(sourceTask.endDate);
      const sourceY = getVisibleTasks().findIndex(t => t.id === sourceTask.id) * dimensions.rowHeight + dimensions.rowHeight / 2;
      const targetX = dateToPixel(targetTask.startDate);
      const targetY = getVisibleTasks().findIndex(t => t.id === targetTask.id) * dimensions.rowHeight + dimensions.rowHeight / 2;

      return (
        <g key={link.id}>
          <defs>
            <marker
              id={`arrowhead-${link.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={isCriticalLink ? "#ef4444" : "#6b7280"} />
            </marker>
          </defs>
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke={isCriticalLink ? "#ef4444" : "#6b7280"}
            strokeWidth={isCriticalLink ? 3 : 2}
            markerEnd={`url(#arrowhead-${link.id})`}
            className={isCriticalLink ? 'critical-link' : ''}
          />
        </g>
      );
    });
  }, [links, tasks, showTaskLinks, showCriticalPath, dateToPixel, getVisibleTasks, dimensions.rowHeight]);

  // Render time header
  const renderTimeHeader = useCallback(() => {
    const gridLines = generateTimeGrid();
    
    return (
      <g>
        {gridLines.map((line, index) => (
          <g key={index}>
            <line
              x1={line.x}
              y1={0}
              x2={line.x}
              y2={dimensions.headerHeight}
              stroke={line.isMajor ? '#d1d5db' : '#f3f4f6'}
              strokeWidth={1}
            />
            {line.isMajor && (
              <text
                x={line.x + 4}
                y={dimensions.headerHeight / 2 + 4}
                fontSize="12"
                fill="#6b7280"
                className="pointer-events-none"
              >
                {line.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </text>
            )}
          </g>
        ))}
      </g>
    );
  }, [generateTimeGrid, dimensions.headerHeight]);

  // Render grid lines
  const renderGridLines = useCallback(() => {
    if (!showGridlines) return null;

    const gridLines = generateTimeGrid();
    const visibleTasks = getVisibleTasks();
    
    return (
      <g>
        {gridLines.map((line, index) => (
          <line
            key={index}
            x1={line.x}
            y1={dimensions.headerHeight}
            x2={line.x}
            y2={dimensions.height}
            stroke={line.isMajor ? '#d1d5db' : '#f3f4f6'}
            strokeWidth={1}
          />
        ))}
        {visibleTasks.map((_, index) => (
          <line
            key={`row-${index}`}
            x1={0}
            y1={dimensions.headerHeight + index * dimensions.rowHeight}
            x2={dimensions.canvasWidth}
            y2={dimensions.headerHeight + index * dimensions.rowHeight}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        ))}
      </g>
    );
  }, [showGridlines, generateTimeGrid, getVisibleTasks, dimensions]);

  // Render left column
  const renderLeftColumn = useCallback(() => {
    const visibleTasks = getVisibleTasks();
    
    return (
      <div className="absolute left-0 top-0 w-[300px] bg-white border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="h-[60px] bg-gray-50 border-b border-gray-200 flex items-center px-4">
          <h3 className="font-semibold text-gray-900">Tasks</h3>
        </div>
        
        {/* Task list */}
        <div className="overflow-y-auto" style={{ height: dimensions.height - dimensions.headerHeight }}>
          {visibleTasks.map((task, index) => (
            <div
              key={task.id}
              className={`flex items-center px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedTaskId === task.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              style={{ height: dimensions.rowHeight }}
              onClick={() => onTaskSelect?.(task.id)}
            >
              {/* Indentation */}
              <div style={{ width: task.level * 20 }} />
              
              {/* Expand/collapse button */}
              {task.children && task.children.length > 0 && (
                <button
                  className="mr-2 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskExpansion(task.id);
                  }}
                >
                  {expandedTasks.has(task.id) ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {/* Task icon */}
              <div className="mr-2">
                {task.isMilestone ? (
                  <div className="w-4 h-4 bg-blue-500 transform rotate-45" />
                ) : (
                  <div className="w-4 h-4 bg-gray-300 rounded" />
                )}
              </div>
              
              {/* Task name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {task.name}
                </div>
                {task.assignedTo && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <UserIcon className="w-3 h-3 mr-1" />
                    {task.assignedTo}
                  </div>
                )}
              </div>
              
              {/* Status indicators */}
              <div className="flex items-center space-x-1">
                {task.isCritical && (
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                )}
                {task.status === 'completed' && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                )}
                {task.float > 0 && (
                  <ClockIcon className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [
    getVisibleTasks,
    selectedTaskId,
    onTaskSelect,
    toggleTaskExpansion,
    expandedTasks,
    dimensions
  ]);

  // Render tooltip
  const renderTooltip = useCallback(() => {
    if (!hoveredTaskId) return null;

    const task = tasks.find(t => t.id === hoveredTaskId);
    if (!task) return null;

    return (
      <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 pointer-events-none">
        <div className="font-medium text-gray-900">{task.name}</div>
        <div className="text-sm text-gray-600 mt-1">
          <div>Start: {task.startDate.toLocaleDateString()}</div>
          <div>End: {task.endDate.toLocaleDateString()}</div>
          <div>Progress: {task.progress}%</div>
          {task.float > 0 && <div>Float: {task.float} days</div>}
          {task.isCritical && <div className="text-red-600">Critical Path</div>}
        </div>
      </div>
    );
  }, [hoveredTaskId, tasks]);

  const visibleTasks = getVisibleTasks();

  return (
    <div
      ref={containerRef}
      className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
      style={{ width: '100%', height: '600px' }}
    >
      {/* Left Column */}
      {renderLeftColumn()}
      
      {/* Canvas */}
      <div
        className="absolute left-[300px] top-0 right-0 bottom-0 overflow-auto"
        style={{ width: dimensions.canvasWidth, height: dimensions.height }}
      >
        <svg
          width={dimensions.canvasWidth}
          height={dimensions.height}
          className="absolute top-0 left-0"
        >
          {/* Grid lines */}
          {renderGridLines()}
          
          {/* Time header */}
          {renderTimeHeader()}
          
          {/* Task links */}
          {renderTaskLinks()}
          
          {/* Task bars */}
          {visibleTasks.map((task, index) => 
            renderTaskBar(task, dimensions.headerHeight + index * dimensions.rowHeight)
          )}
        </svg>
      </div>
      
      {/* Tooltip */}
      {renderTooltip()}
    </div>
  );
};

export default GanttCanvas; 