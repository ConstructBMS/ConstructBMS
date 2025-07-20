import React, { useState, useRef, useEffect } from 'react';
import { differenceInCalendarDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { criticalPathService } from '../../services/criticalPathService';
import { useProjectView } from '../../contexts/ProjectViewContext';
import { ganttTaskService } from '../../services/ganttTaskService';
import type { Task } from '../../services/ganttTaskService';

// Define the start of the visible timeline (can later be dynamic)
const TIMELINE_START_DATE = new Date(2024, 0, 1); // January 1, 2024

// Define zoom scaling: how many pixels per day/week/month
const ZOOM_SCALE = {
  day: 40,
  week: 120,
  month: 200,
};

interface TimelineChartProps {
  tasks: Task[];
  selectedTasks: string[];
  onTaskSelect: (taskId: string, isSelected: boolean) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  leftPaneWidth: number;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
  tasks,
  selectedTasks,
  onTaskSelect,
  onTaskUpdate,
  leftPaneWidth
}) => {
  const { state } = useProjectView();
  const { zoomLevel, rowHeight, showGrid, showDependencies } = state.layoutSettings;
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [hoveredDependency, setHoveredDependency] = useState<string | null>(null);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [linkingFromTaskId, setLinkingFromTaskId] = useState<string | null>(null);
  const [linkingToTaskId, setLinkingToTaskId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Get time scale configuration based on zoom level
  const getTimeScale = () => {
    switch (zoomLevel) {
      case 'day':
        return { 
          tickSize: 1, 
          labelFormat: 'dd MMM', 
          columnWidth: ZOOM_SCALE.day,
          headerFormat: 'EEE dd',
          subHeaderFormat: 'MMM yyyy'
        };
      case 'week':
        return { 
          tickSize: 7, 
          labelFormat: "'W'w", 
          columnWidth: ZOOM_SCALE.week,
          headerFormat: 'MMM dd',
          subHeaderFormat: 'yyyy'
        };
      case 'month':
        return { 
          tickSize: 30, 
          labelFormat: 'MMM yyyy', 
          columnWidth: ZOOM_SCALE.month,
          headerFormat: 'MMM',
          subHeaderFormat: 'yyyy'
        };
      default:
        return { 
          tickSize: 7, 
          labelFormat: "'W'w", 
          columnWidth: ZOOM_SCALE.week,
          headerFormat: 'MMM dd',
          subHeaderFormat: 'yyyy'
        };
    }
  };

  const { tickSize, columnWidth, headerFormat, subHeaderFormat } = getTimeScale();

  // Date-to-pixel conversion helpers
  const getZoomLevel = () => {
    return zoomLevel || 'week';
  };

  const getPixelsPerDay = () => {
    const zoom = getZoomLevel();
    if (zoom === 'week') return ZOOM_SCALE.week / 7;
    if (zoom === 'month') return ZOOM_SCALE.month / 30;
    return ZOOM_SCALE.day;
  };

  // Calculate critical path
  const criticalPathResult = criticalPathService.calculateCriticalPath(tasks);
  const criticalTasks = criticalPathResult.criticalTasks;

  // Get project date range
  const projectStartDate = new Date(Math.min(...tasks.map(task => task.startDate.getTime())));
  const projectEndDate = new Date(Math.max(...tasks.map(task => task.endDate.getTime())));

  // Calculate timeline dimensions
  const totalDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const timelineWidth = totalDays * getPixelsPerDay();

  // Generate timeline headers based on zoom level
  const generateTimelineHeaders = () => {
    const headers: JSX.Element[] = [];
    
    if (zoomLevel === 'day') {
      // Daily view - show each day
      const currentDate = new Date(projectStartDate);
      for (let i = 0; i < totalDays; i++) {
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        const isToday = currentDate.toDateString() === new Date().toDateString();
        
        headers.push(
          <div
            key={i}
            className={`flex-shrink-0 text-xs text-center border-r border-gray-200 ${
              isWeekend ? 'bg-gray-50' : 'bg-white'
            } ${isToday ? 'bg-blue-100 font-semibold' : ''}`}
            style={{ width: columnWidth }}
          >
            <div className="font-medium">
              {format(currentDate, 'dd')}
            </div>
            <div className="text-gray-500">
              {format(currentDate, 'EEE')}
            </div>
          </div>
        );

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (zoomLevel === 'week') {
      // Weekly view - show weeks
      const weeks = eachWeekOfInterval({ start: projectStartDate, end: projectEndDate });
      weeks.forEach((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart);
        const isCurrentWeek = new Date() >= weekStart && new Date() <= weekEnd;
        
        headers.push(
          <div
            key={index}
            className={`flex-shrink-0 text-xs text-center border-r border-gray-200 bg-white ${
              isCurrentWeek ? 'bg-blue-100 font-semibold' : ''
            }`}
            style={{ width: columnWidth }}
          >
            <div className="font-medium">
              {format(weekStart, 'MMM dd')}
            </div>
            <div className="text-gray-500">
              {format(weekEnd, 'MMM dd')}
            </div>
          </div>
        );
      });
    } else if (zoomLevel === 'month') {
      // Monthly view - show months
      const months = eachMonthOfInterval({ start: projectStartDate, end: projectEndDate });
      months.forEach((monthStart, index) => {
        const monthEnd = endOfMonth(monthStart);
        const isCurrentMonth = new Date().getMonth() === monthStart.getMonth() && 
                              new Date().getFullYear() === monthStart.getFullYear();
        
        headers.push(
          <div
            key={index}
            className={`flex-shrink-0 text-xs text-center border-r border-gray-200 bg-white ${
              isCurrentMonth ? 'bg-blue-100 font-semibold' : ''
            }`}
            style={{ width: columnWidth }}
          >
            <div className="font-medium">
              {format(monthStart, 'MMM')}
            </div>
            <div className="text-gray-500">
              {format(monthStart, 'yyyy')}
            </div>
          </div>
        );
      });
    }

    return headers;
  };

  // Calculate task bar position and width using new date-to-pixel conversion
  const getTaskBarStyle = (task: Task) => {
    const left = getTaskStartX(task);
    const width = (task.duration || 1) * getPixelsPerDay();
    
    return { left, width };
  };

  // Get task start X position based on zoom level
  const getTaskStartX = (task: Task): number => {
    const daysFromStart = differenceInCalendarDays(task.startDate, projectStartDate);
    return daysFromStart * getPixelsPerDay();
  };

  // Get task end X position based on zoom level
  const getTaskEndX = (task: Task): number => {
    const daysFromStart = differenceInCalendarDays(task.endDate, projectStartDate);
    return (daysFromStart + 1) * getPixelsPerDay(); // +1 to include the end date
  };

  // Get task bar styling based on status and critical path
  const getTaskBarClasses = (task: Task) => {
    const isSelected = selectedTasks.includes(task.id);
    const isCritical = criticalTasks.includes(task.id);
    const isOnCriticalPath = showCriticalPath && isCritical;

    let baseClasses = 'h-6 rounded-sm border cursor-pointer transition-all duration-200 relative';
    
    // Status-based styling
    if (task.status === 'completed') {
      baseClasses += ' bg-green-500 border-green-600';
    } else if (task.status === 'in-progress') {
      baseClasses += ' bg-blue-500 border-blue-600';
    } else {
      baseClasses += ' bg-gray-400 border-gray-500';
    }

    // Critical path styling
    if (isOnCriticalPath) {
      baseClasses += ' shadow-lg border-2 border-red-500';
      if (task.status === 'completed') {
        baseClasses += ' bg-red-500 border-red-600';
      } else if (task.status === 'in-progress') {
        baseClasses += ' bg-red-400 border-red-500';
      } else {
        baseClasses += ' bg-red-300 border-red-400';
      }
    }

    // Selection styling
    if (isSelected) {
      baseClasses += ' ring-2 ring-blue-400 ring-offset-1';
    }

    // Hover effects
    baseClasses += ' hover:shadow-md hover:scale-105';

    return baseClasses;
  };

  // Render task bar with progress and drag functionality
  const renderTaskBar = (task: Task) => {
    const style = getTaskBarStyle(task);
    const classes = getTaskBarClasses(task);
    const isCritical = criticalTasks.includes(task.id);
    const isDragging = draggingTask?.id === task.id;
    const isSnapping = isDragging && (dragType === 'move' || dragType === 'resize-start' || dragType === 'resize-end');
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    const y = taskIndex * rowHeight + (rowHeight * 0.25); // 25% padding from top of row
    const barHeight = rowHeight * 0.5; // 50% of row height for the task bar

    return (
      <g
        key={task.id}
        className={`gantt-task-bar ${isDragging ? 'dragging' : ''} ${isSnapping ? 'snapping' : ''}`}
        onMouseDown={(e) => handleDragStart(e, task, 'move')}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: 'grab' }}
      >
        {/* Main task bar */}
        <rect
          x={getTaskStartX(task)}
          y={y}
          width={getTaskEndX(task) - getTaskStartX(task)}
          height={barHeight}
          fill={task.status === 'completed' ? '#10b981' : 
                task.status === 'in-progress' ? '#3b82f6' : '#6b7280'}
          rx={3}
          ry={3}
          stroke={isCritical && showCriticalPath ? '#dc2626' : '#374151'}
          strokeWidth={isCritical && showCriticalPath ? 2 : 1}
          opacity={isDragging ? 0.8 : 1}
          onMouseEnter={(e) => {
            if (!draggingTask) {
              setHoveredTask(task);
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
            // Handle dependency creation hover
            if (isLinking) {
              setLinkingToTaskId(task.id);
            }
          }}
          onMouseMove={(e) => {
            if (!draggingTask && hoveredTask?.id === task.id) {
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseLeave={() => {
            if (!draggingTask) {
              setHoveredTask(null);
              setTooltipPosition(null);
            }
            // Handle dependency creation hover
            if (isLinking && linkingToTaskId === task.id) {
              setLinkingToTaskId(null);
            }
          }}
        />

        {/* Progress indicator */}
        {task.percentComplete > 0 && (
          <rect
            x={getTaskStartX(task)}
            y={y}
            width={(getTaskEndX(task) - getTaskStartX(task)) * (task.percentComplete / 100)}
            height={rowHeight}
            fill="#059669"
            rx={3}
            ry={3}
          />
        )}

        {/* Task name label */}
        <text
          x={getTaskStartX(task) + 4}
          y={y + rowHeight / 2 + 4}
          className="text-xs font-medium fill-white pointer-events-none"
          style={{ fontSize: '10px' }}
        >
          {task.name}
        </text>

        {/* Resize handles */}
        <rect
          x={getTaskStartX(task) - 2}
          y={y}
          width={4}
          height={rowHeight}
          fill="transparent"
          stroke="transparent"
          onMouseDown={(e) => handleDragStart(e, task, 'resize-start')}
          onMouseEnter={(e) => {
            if (!draggingTask) {
              setHoveredTask(task);
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseMove={(e) => {
            if (!draggingTask && hoveredTask?.id === task.id) {
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseLeave={() => {
            if (!draggingTask) {
              setHoveredTask(null);
              setTooltipPosition(null);
            }
          }}
          style={{ cursor: 'col-resize' }}
        />
        
        <rect
          x={getTaskEndX(task) - 2}
          y={y}
          width={4}
          height={rowHeight}
          fill="transparent"
          stroke="transparent"
          onMouseDown={(e) => handleDragStart(e, task, 'resize-end')}
          onMouseEnter={(e) => {
            if (!draggingTask) {
              setHoveredTask(task);
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseMove={(e) => {
            if (!draggingTask && hoveredTask?.id === task.id) {
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseLeave={() => {
            if (!draggingTask) {
              setHoveredTask(null);
              setTooltipPosition(null);
            }
          }}
          style={{ cursor: 'col-resize' }}
        />

        {/* Critical path indicator */}
        {isCritical && showCriticalPath && (
          <text
            x={getTaskStartX(task)}
            y={y - 4}
            className="text-xs font-bold fill-red-600 pointer-events-none"
            style={{ fontSize: '10px' }}
          >
            ⚡ Critical
          </text>
        )}

        {/* Progress percentage */}
        {task.percentComplete > 0 && (
          <text
            x={getTaskStartX(task) + (getTaskEndX(task) - getTaskStartX(task)) / 2}
            y={y + rowHeight / 2 + 4}
            className="text-xs font-semibold fill-white pointer-events-none text-center"
            style={{ fontSize: '10px', textAnchor: 'middle' }}
          >
            {task.percentComplete}%
          </text>
        )}

        {/* Dependency connector dot (right edge) */}
        <circle
          cx={getTaskEndX(task) + 6}
          cy={y + rowHeight / 2}
          r={3}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          className="dependency-connector"
          onMouseDown={(e) => handleLinkStart(task.id, e)}
          onMouseEnter={(e) => {
            if (!draggingTask && !isLinking) {
              setHoveredTask(task);
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseMove={(e) => {
            if (!draggingTask && !isLinking && hoveredTask?.id === task.id) {
              setTooltipPosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseLeave={() => {
            if (!draggingTask && !isLinking) {
              setHoveredTask(null);
              setTooltipPosition(null);
            }
          }}
        />
      </g>
    );
  };

  // Helper functions for task positioning (using project start date)

  const getTaskCenterY = (task: Task): number => {
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    return taskIndex * rowHeight + (rowHeight * 0.5); // Center of the row
  };

  // Utility function to snap dates to day boundaries
  const snapToDay = (date: Date): Date => {
    const snapped = new Date(date);
    snapped.setHours(0, 0, 0, 0);
    return snapped;
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent, task: Task, type: 'move' | 'resize-start' | 'resize-end' = 'move') => {
    e.stopPropagation();
    e.preventDefault();
    
    setDraggingTask(task);
    setDragStartX(e.clientX);
    setDragType(type);
    
    // Change cursor based on drag type
    const target = e.currentTarget as HTMLElement;
    if (type === 'move') {
      target.style.cursor = 'grabbing';
    } else {
      target.style.cursor = 'col-resize';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTask || dragStartX === null || !dragType) return;

    const deltaX = e.clientX - dragStartX;
    const daysDelta = Math.round(deltaX / getPixelsPerDay());

    if (daysDelta !== 0) {
      let updatedTask = { ...draggingTask };

      switch (dragType) {
        case 'move':
          // Move the entire task with day snapping
          const newStart = new Date(draggingTask.startDate);
          newStart.setDate(newStart.getDate() + daysDelta);
          const snappedStart = snapToDay(newStart);
          const snappedEnd = new Date(snappedStart);
          snappedEnd.setDate(snappedStart.getDate() + draggingTask.duration);
          
          updatedTask = {
            ...draggingTask,
            startDate: snappedStart,
            endDate: snappedEnd
          };
          break;

        case 'resize-start':
          // Resize from start (change start date and duration) with day snapping
          const newStartDate = new Date(draggingTask.startDate);
          newStartDate.setDate(newStartDate.getDate() + daysDelta);
          const snappedStartDate = snapToDay(newStartDate);
          const newDuration = Math.max(1, draggingTask.duration - daysDelta);
          
          updatedTask = {
            ...draggingTask,
            startDate: snappedStartDate,
            duration: newDuration
          };
          break;

        case 'resize-end':
          // Resize from end (change duration only) with day snapping
          const newDurationEnd = Math.max(1, draggingTask.duration + daysDelta);
          const snappedEndDate = new Date(draggingTask.startDate);
          snappedEndDate.setDate(draggingTask.startDate.getDate() + newDurationEnd);
          
          updatedTask = {
            ...draggingTask,
            duration: newDurationEnd,
            endDate: snappedEndDate
          };
          break;
      }

      // Update the task
      ganttTaskService.updateTask(draggingTask.id, updatedTask);
      
      // Notify parent component of the update
      if (onTaskUpdate) {
        onTaskUpdate(draggingTask.id, updatedTask);
      }
      
      setDragStartX(e.clientX); // reset for continued dragging
    }
  };

  const handleMouseUp = () => {
    if (draggingTask) {
      // Reset cursor
      const elements = document.querySelectorAll('.gantt-task-bar');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.cursor = 'grab';
        }
      });
    }
    
    setDraggingTask(null);
    setDragStartX(null);
    setDragType(null);
  };

  // Dependency creation handlers
  const handleLinkStart = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLinkingFromTaskId(taskId);
    setIsLinking(true);
  };

  // Helper functions for dependency creation
  const calculateBarRightX = (taskId: string): number => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return 0;
    return getTaskEndX(task);
  };

  const calculateBarY = (taskId: string): number => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    return taskIndex * rowHeight + (rowHeight * 0.5); // Center of the row
  };

  // Dependency creation effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isLinking) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (linkingFromTaskId && linkingToTaskId && linkingFromTaskId !== linkingToTaskId) {
        // Add dependency using ganttTaskService
        const fromTask = tasks.find(t => t.id === linkingFromTaskId);
        const toTask = tasks.find(t => t.id === linkingToTaskId);
        
        if (fromTask && toTask) {
          // Update the "to" task to include the "from" task as a predecessor
          const updatedToTask = {
            ...toTask,
            predecessors: [...(toTask.predecessors || []), linkingFromTaskId]
          };
          
          // Update the "from" task to include the "to" task as a successor
          const updatedFromTask = {
            ...fromTask,
            successors: [...(fromTask.successors || []), linkingToTaskId]
          };
          
          // Update both tasks
          ganttTaskService.updateTask(linkingToTaskId, updatedToTask);
          ganttTaskService.updateTask(linkingFromTaskId, updatedFromTask);
          
          // Notify parent component
          if (onTaskUpdate) {
            onTaskUpdate(linkingToTaskId, updatedToTask);
            onTaskUpdate(linkingFromTaskId, updatedFromTask);
          }
        }
      }
      
      setIsLinking(false);
      setLinkingFromTaskId(null);
      setLinkingToTaskId(null);
      setMousePosition(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isLinking, linkingFromTaskId, linkingToTaskId, tasks, onTaskUpdate]);

  // Render dependency arrows with improved positioning
  const renderDependencies = () => {
    const arrows: JSX.Element[] = [];

    tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(dep => {
          const fromTask = tasks.find(t => t.id === dep.from);
          if (fromTask) {
            // Calculate start and end points based on dependency type
            let startX: number, startY: number, endX: number, endY: number;
            
            // Determine start point based on dependency type
            if (dep.type[0] === 'F') {
              // Finish point of the predecessor task
              startX = getTaskEndX(fromTask);
            } else {
              // Start point of the predecessor task
              startX = getTaskStartX(fromTask);
            }
            startY = getTaskCenterY(fromTask);
            
            // Determine end point based on dependency type
            if (dep.type[1] === 'S') {
              // Start point of the current task
              endX = getTaskStartX(task);
            } else {
              // Finish point of the current task
              endX = getTaskEndX(task);
            }
            endY = getTaskCenterY(task);
            
            // Apply lag/lead offset
            const pixelsPerDay = getPixelsPerDay();
            const lagOffset = dep.lag * pixelsPerDay;
            endX += lagOffset;

            // Calculate control points for smooth curve
            const distance = endX - startX;
            const controlPoint1X = startX + Math.min(distance * 0.3, 50);
            const controlPoint2X = endX - Math.min(distance * 0.3, 50);
            
            // Adjust curve height based on row distance
            const rowDistance = Math.abs(endY - startY);
            const curveHeight = Math.max(20, rowDistance * 0.5);
            const controlPoint1Y = startY - curveHeight;
            const controlPoint2Y = endY - curveHeight;

            const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${endX} ${endY}`;

            // Check if this is a critical path dependency
            const isCriticalDependency = criticalTasks.includes(dep.from) && criticalTasks.includes(task.id);

            const dependencyKey = `${dep.from}-${task.id}`;
            const isHovered = hoveredDependency === dependencyKey;
            
            // Get dependency type label
            const getDependencyTypeLabel = (type: string) => {
              switch (type) {
                case 'FS': return 'Finish-to-Start';
                case 'SS': return 'Start-to-Start';
                case 'FF': return 'Finish-to-Finish';
                case 'SF': return 'Start-to-Finish';
                default: return type;
              }
            };
            
            // Get lag/lead label
            const getLagLabel = (lag: number) => {
              if (lag === 0) return '';
              if (lag > 0) return `+${lag}d`;
              return `${lag}d`;
            };
            
            arrows.push(
              <g key={dependencyKey}>
                <path
                  d={pathData}
                  stroke={isCriticalDependency && showCriticalPath ? '#dc2626' : '#1d4ed8'}
                  strokeWidth={isHovered ? 4 : (isCriticalDependency && showCriticalPath ? 3 : 2)}
                  fill="none"
                  markerEnd={isCriticalDependency && showCriticalPath ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                  opacity={isHovered ? 1 : (isCriticalDependency && showCriticalPath ? 1 : 0.7)}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredDependency(dependencyKey)}
                  onMouseLeave={() => setHoveredDependency(null)}
                />
                {isHovered && (
                  <text
                    x={(startX + endX) / 2}
                    y={Math.min(startY, endY) - 10}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 pointer-events-none"
                  >
                    {fromTask.name} → {task.name}
                    <tspan x={(startX + endX) / 2} dy="12" className="text-xs fill-gray-500">
                      {getDependencyTypeLabel(dep.type)} {getLagLabel(dep.lag)}
                    </tspan>
                  </text>
                )}
              </g>
            );
          }
        });
      }
      
      // Legacy support for predecessors array
      if (task.predecessors) {
        task.predecessors.forEach(predId => {
          const predTask = tasks.find(t => t.id === predId);
          if (predTask) {
            const startX = getTaskEndX(predTask);
            const endX = getTaskStartX(task);
            const startY = getTaskCenterY(predTask);
            const endY = getTaskCenterY(task);

            // Calculate control points for smooth curve
            const distance = endX - startX;
            const controlPoint1X = startX + Math.min(distance * 0.3, 50);
            const controlPoint2X = endX - Math.min(distance * 0.3, 50);
            
            // Adjust curve height based on row distance
            const rowDistance = Math.abs(endY - startY);
            const curveHeight = Math.max(20, rowDistance * 0.5);
            const controlPoint1Y = startY - curveHeight;
            const controlPoint2Y = endY - curveHeight;

            const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${endX} ${endY}`;

            // Check if this is a critical path dependency
            const isCriticalDependency = criticalTasks.includes(predId) && criticalTasks.includes(task.id);

            const dependencyKey = `${predId}-${task.id}`;
            const isHovered = hoveredDependency === dependencyKey;
            
            arrows.push(
              <g key={dependencyKey}>
                <path
                  d={pathData}
                  stroke={isCriticalDependency && showCriticalPath ? '#dc2626' : '#1d4ed8'}
                  strokeWidth={isHovered ? 4 : (isCriticalDependency && showCriticalPath ? 3 : 2)}
                  fill="none"
                  markerEnd={isCriticalDependency && showCriticalPath ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                  opacity={isHovered ? 1 : (isCriticalDependency && showCriticalPath ? 1 : 0.7)}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredDependency(dependencyKey)}
                  onMouseLeave={() => setHoveredDependency(null)}
                />
                {isHovered && (
                  <text
                    x={(startX + endX) / 2}
                    y={Math.min(startY, endY) - 10}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 pointer-events-none"
                  >
                    {predTask.name} → {task.name}
                    <tspan x={(startX + endX) / 2} dy="12" className="text-xs fill-gray-500">
                      FS (Legacy)
                    </tspan>
                  </text>
                )}
              </g>
            );
          }
        });
      }
    });

    return arrows;
  };

  // Handle scroll synchronization
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  return (
    <div className="flex-1 bg-white overflow-hidden">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-50">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showCriticalPath}
              onChange={(e) => setShowCriticalPath(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Show Critical Path</span>
          </label>



          <div className="text-sm text-gray-600">
            {criticalTasks.length} critical tasks
          </div>
          
          {showDependencies && (
            <div className="text-sm text-gray-600">
              {tasks.reduce((count, task) => count + (task.predecessors?.length || 0), 0)} dependencies
            </div>
          )}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="relative overflow-auto" ref={timelineRef}>
        {/* SVG for dependencies */}
        {showDependencies && (
          <svg
            className="absolute inset-0"
            style={{ width: timelineWidth, height: '100%' }}
          >
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="#1d4ed8"
                />
              </marker>
              <marker
                id="arrowhead-critical"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="#dc2626"
                />
              </marker>
            </defs>
            {renderDependencies()}
          </svg>
        )}

        {/* Timeline Headers */}
        <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
          <div className="flex" style={{ width: timelineWidth }}>
            {generateTimelineHeaders()}
          </div>
        </div>

        {/* Task Bars */}
        <svg
          className="relative"
          style={{ width: timelineWidth, height: `${tasks.length * rowHeight}px` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {tasks.map((task) => renderTaskBar(task))}
          
          {/* Dependency connection indicators */}
          {showDependencies && tasks.map((task) => {
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            const y = taskIndex * rowHeight + (rowHeight * 0.5);
            
            return (
              <g key={`connections-${task.id}`}>
                {/* Predecessor connection point (left side) */}
                {(task.predecessors && task.predecessors.length > 0) && (
                  <circle
                    cx={getTaskStartX(task) - 4}
                    cy={y}
                    r={4}
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={2}
                    className="pointer-events-none"
                  />
                )}
                
                {/* Successor connection point (right side) */}
                {(task.successors && task.successors.length > 0) && (
                  <circle
                    cx={getTaskEndX(task) + 4}
                    cy={y}
                    r={4}
                    fill="#10b981"
                    stroke="white"
                    strokeWidth={2}
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Live dependency creation line */}
        {isLinking && mousePosition && linkingFromTaskId && (
          <svg 
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
            style={{ width: timelineWidth, height: `${tasks.length * rowHeight}px` }}
          >
            <line
              x1={calculateBarRightX(linkingFromTaskId)}
              y1={calculateBarY(linkingFromTaskId)}
              x2={mousePosition.x - (timelineRef.current?.getBoundingClientRect().left || 0)}
              y2={mousePosition.y - (timelineRef.current?.getBoundingClientRect().top || 0)}
              stroke="#3b82f6"
              strokeWidth={3}
              className="dependency-line"
              opacity={0.8}
            />
            {linkingToTaskId && (
              <circle
                cx={getTaskStartX(tasks.find(t => t.id === linkingToTaskId)!)}
                cy={calculateBarY(linkingToTaskId)}
                r={6}
                fill="#10b981"
                stroke="white"
                strokeWidth={2}
                opacity={0.8}
              />
            )}
          </svg>
        )}
      </div>

      {/* Critical Path Legend */}
      {showCriticalPath && (
        <div className="p-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-sm border-2 border-red-600"></div>
              <span className="text-red-700 font-medium">Critical Path Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg width="20" height="20" className="text-red-600">
                <path
                  d="M 2 10 Q 5 5 8 10 Q 11 15 18 10"
                  stroke="#dc2626"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </svg>
              <span className="text-red-700">Critical Dependencies</span>
            </div>
            <div className="text-gray-600">
              Project Duration: {criticalPathResult.projectDuration} days
            </div>
          </div>
        </div>
      )}

      {/* Task Tooltip */}
      {hoveredTask && tooltipPosition && (
        <div
          className="gantt-tooltip bg-white rounded-lg text-xs p-3"
          style={{
            top: tooltipPosition.y + 12,
            left: tooltipPosition.x + 12,
            minWidth: '200px',
            maxWidth: '280px'
          }}
        >
          <div className="font-semibold text-gray-800 truncate mb-1">{hoveredTask.name}</div>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Start:</span>
              <span className="font-medium">{hoveredTask.startDate.toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              })}</span>
            </div>
            <div className="flex justify-between">
              <span>End:</span>
              <span className="font-medium">{hoveredTask.endDate.toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              })}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{hoveredTask.duration} days</span>
            </div>
            <div className="flex justify-between">
              <span>Complete:</span>
              <span className="font-medium">{hoveredTask.percentComplete}%</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${
                hoveredTask.status === 'completed' ? 'text-green-600' :
                hoveredTask.status === 'in-progress' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {hoveredTask.status.charAt(0).toUpperCase() + hoveredTask.status.slice(1)}
              </span>
            </div>
            {criticalTasks.includes(hoveredTask.id) && (
              <div className="flex justify-between">
                <span>Path:</span>
                <span className="font-medium text-red-600">Critical</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Snapping:</span>
              <span className="font-medium text-blue-600">Day Boundaries</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 