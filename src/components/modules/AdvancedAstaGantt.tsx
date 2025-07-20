import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';

// Advanced PowerProject-style interfaces
export interface AdvancedGanttTask {
  id: string;
  name: string;
  wbsId: string;
  parentId: string | null;
  type: 'summary' | 'task' | 'milestone';
  start: Date;
  end: Date;
  duration: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  isCritical: boolean;
  expanded: boolean;
  children?: string[];
  level?: number;
  
  // Advanced PowerProject features
  constraints?: {
    type: 'start-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on' | 'as-soon-as-possible' | 'as-late-as-possible';
    date?: Date;
  };
  dependencies?: Array<{
    id: string;
    type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
    lag?: number;
  }>;
  resources?: Array<{
    id: string;
    name: string;
    type: 'work' | 'material' | 'cost';
    units: number;
    cost?: number;
  }>;
  baseline?: {
    start: Date;
    end: Date;
    duration: number;
    progress: number;
  };
  actuals?: {
    start?: Date;
    end?: Date;
    duration?: number;
    progress?: number;
    cost?: number;
  };
  notes?: string;
  customFields?: Record<string, any>;
  
  // Scheduling properties
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
  totalFloat: number;
  freeFloat: number;
  criticalPath: boolean;
  
  // Resource properties
  work: number; // hours
  cost: number;
  resourceId?: string;
  
  // Display properties
  color?: string;
  pattern?: 'solid' | 'dashed' | 'dotted';
  showBaseline?: boolean;
  showActuals?: boolean;
}

export interface AdvancedGanttLink {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag: number;
  critical: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: 'work' | 'material' | 'cost';
  maxUnits: number;
  costPerUnit: number;
  calendar: ResourceCalendar;
  availability: ResourceAvailability[];
}

export interface ResourceCalendar {
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  workingHours: { start: string; end: string };
  holidays: Date[];
  exceptions: Array<{
    date: Date;
    hours: number;
  }>;
}

export interface ResourceAvailability {
  startDate: Date;
  endDate: Date;
  units: number;
}

export interface CriticalPathAnalysis {
  criticalTasks: string[];
  totalFloat: Record<string, number>;
  freeFloat: Record<string, number>;
  projectDuration: number;
  criticalPathDuration: number;
  slackAnalysis: Record<string, {
    totalSlack: number;
    freeSlack: number;
    critical: boolean;
  }>;
}

export interface ViewMode {
  type: 'day' | 'week' | 'month' | 'quarter' | 'year';
  zoom: number;
  showWeekends: boolean;
  showHolidays: boolean;
  workingTimeOnly: boolean;
}

export interface AdvancedGanttProps {
  projectId: string;
  tasks: AdvancedGanttTask[];
  links: AdvancedGanttLink[];
  resources: Resource[];
  viewMode: ViewMode;
  showCriticalPath: boolean;
  showBaseline: boolean;
  showActuals: boolean;
  showConstraints: boolean;
  showDependencies: boolean;
  showResourceAllocation: boolean;
  onTaskUpdate: (taskId: string, updates: Partial<AdvancedGanttTask>) => void;
  onTaskSelect: (taskId: string) => void;
  selectedTaskId?: string;
  userRole: string;
}

const AdvancedAstaGantt: React.FC<AdvancedGanttProps> = ({
  projectId,
  tasks,
  links,
  resources,
  viewMode,
  showCriticalPath,
  showBaseline,
  showActuals,
  showConstraints,
  showDependencies,
  showResourceAllocation,
  onTaskUpdate,
  onTaskSelect,
  selectedTaskId,
  userRole
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 1400,
    height: 800,
    leftColumnWidth: 400,
    canvasWidth: 1000,
    rowHeight: 45,
    headerHeight: 80
  });
  
  const [dragState, setDragState] = useState({
    isDragging: false,
    taskId: null as string | null,
    dragType: null as 'move' | 'resize-start' | 'resize-end' | null,
    startX: 0,
    startY: 0,
    originalStart: null as Date | null,
    originalEnd: null as Date | null
  });
  
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [criticalPathAnalysis, setCriticalPathAnalysis] = useState<CriticalPathAnalysis | null>(null);
  const [resourceAllocation, setResourceAllocation] = useState<Record<string, any>>({});
  
  const canEdit = userRole !== 'viewer';

  // Calculate time scale based on view mode
  const calculateTimeScale = useCallback(() => {
    const projectStart = new Date(Math.min(...tasks.map(t => t.start.getTime())));
    const projectEnd = new Date(Math.max(...tasks.map(t => t.end.getTime())));
    
    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    const basePixelsPerDay = dimensions.canvasWidth / totalDays;
    
    // Apply zoom level
    const zoomMultiplier = viewMode.zoom / 100;
    const pixelsPerDay = basePixelsPerDay * zoomMultiplier;
    
    return {
      projectStart,
      projectEnd,
      totalDays,
      pixelsPerDay,
      workingDaysOnly: viewMode.workingTimeOnly
    };
  }, [tasks, dimensions.canvasWidth, viewMode]);

  // Convert date to pixel position
  const dateToPixel = useCallback((date: Date): number => {
    const { projectStart, pixelsPerDay, workingDaysOnly } = calculateTimeScale();
    
    if (workingDaysOnly) {
      // Calculate working days only
      let workingDays = 0;
      const current = new Date(projectStart);
      while (current < date) {
        if (current.getDay() !== 0 && current.getDay() !== 6) { // Skip weekends
          workingDays++;
        }
        current.setDate(current.getDate() + 1);
      }
      return workingDays * pixelsPerDay;
    } else {
      const daysFromStart = (date.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
      return daysFromStart * pixelsPerDay;
    }
  }, [calculateTimeScale]);

  // Convert pixel position to date
  const pixelToDate = useCallback((pixel: number): Date => {
    const { projectStart, pixelsPerDay, workingDaysOnly } = calculateTimeScale();
    
    if (workingDaysOnly) {
      // Convert back to working days
      const workingDays = pixel / pixelsPerDay;
      let current = new Date(projectStart);
      let workingDaysCount = 0;
      
      while (workingDaysCount < workingDays) {
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          workingDaysCount++;
        }
        current.setDate(current.getDate() + 1);
      }
      return current;
    } else {
      const daysFromStart = pixel / pixelsPerDay;
      return new Date(projectStart.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
    }
  }, [calculateTimeScale]);

  // Get visible tasks (flattened hierarchy)
  const getVisibleTasks = useCallback((): AdvancedGanttTask[] => {
    const visible: AdvancedGanttTask[] = [];
    
    const addTask = (task: AdvancedGanttTask, level: number = 0) => {
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

    // Fix: Only compare string to string, not string to object
    const rootTasks = tasks.filter(task => !task.parentId || !tasks.some(t => t.id === task.parentId));
    rootTasks.forEach(task => addTask(task));

    return visible;
  }, [tasks, expandedTasks]);

  // Critical path analysis
  const calculateCriticalPath = useCallback(() => {
    const visibleTasks = getVisibleTasks();
    const analysis: CriticalPathAnalysis = {
      criticalTasks: [],
      totalFloat: {},
      freeFloat: {},
      projectDuration: 0,
      criticalPathDuration: 0,
      slackAnalysis: {}
    };

    // Forward pass - calculate early start/finish
    visibleTasks.forEach(task => {
      if (!task.parentId) {
        task.earlyStart = new Date(task.start);
        task.earlyFinish = new Date(task.earlyStart.getTime() + task.duration * 24 * 60 * 60 * 1000);
      } else {
        const predecessors = links.filter(l => l.targetTaskId === task.id);
        if (predecessors.length === 0) {
          task.earlyStart = new Date(task.start);
        } else {
          const maxEarlyFinish = Math.max(...predecessors.map(p => {
            const predTask = visibleTasks.find(t => t.id === p.sourceTaskId);
            return predTask ? predTask.earlyFinish.getTime() : 0;
          }));
          task.earlyStart = new Date(maxEarlyFinish);
        }
        task.earlyFinish = new Date(task.earlyStart.getTime() + task.duration * 24 * 60 * 60 * 1000);
      }
    });

    // Backward pass - calculate late start/finish
    const reverseTasks = [...visibleTasks].reverse();
    reverseTasks.forEach(task => {
      const successors = links.filter(l => l.sourceTaskId === task.id);
      if (successors.length === 0) {
        task.lateFinish = new Date(task.earlyFinish);
      } else {
        const minLateStart = Math.min(...successors.map(s => {
          const succTask = visibleTasks.find(t => t.id === s.targetTaskId);
          return succTask ? succTask.lateStart.getTime() : Infinity;
        }));
        task.lateFinish = new Date(minLateStart);
      }
      task.lateStart = new Date(task.lateFinish.getTime() - task.duration * 24 * 60 * 60 * 1000);
      
      // Calculate float
      task.totalFloat = (task.lateFinish.getTime() - task.earlyFinish.getTime()) / (1000 * 60 * 60 * 24);
      task.freeFloat = 0; // Simplified calculation
      
      // Determine critical path
      task.criticalPath = task.totalFloat <= 0;
      if (task.criticalPath) {
        analysis.criticalTasks.push(task.id);
      }
    });

    // Calculate project duration
    analysis.projectDuration = Math.max(...visibleTasks.map(t => t.earlyFinish.getTime()));
    analysis.criticalPathDuration = analysis.projectDuration;

    setCriticalPathAnalysis(analysis);
  }, [tasks, links, getVisibleTasks]);

  // Resource allocation calculation
  const calculateResourceAllocation = useCallback(() => {
    const allocation: Record<string, any> = {};
    
    tasks.forEach(task => {
      if (task.resources) {
        task.resources.forEach(resource => {
          if (!allocation[resource.id]) {
            allocation[resource.id] = {
              totalWork: 0,
              totalCost: 0,
              assignments: []
            };
          }
          
          allocation[resource.id].totalWork += resource.units * task.duration;
          allocation[resource.id].totalCost += (resource.cost || 0) * resource.units * task.duration;
          allocation[resource.id].assignments.push({
            taskId: task.id,
            taskName: task.name,
            start: task.start,
            end: task.end,
            units: resource.units,
            work: resource.units * task.duration
          });
        });
      }
    });
    
    setResourceAllocation(allocation);
  }, [tasks]);

  // Handle mouse events for drag operations
  const handleMouseDown = useCallback((e: React.MouseEvent, taskId: string, dragType: 'move' | 'resize-start' | 'resize-end') => {
    if (!canEdit) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setDragState({
      isDragging: true,
      taskId,
      dragType,
      startX: e.clientX,
      startY: e.clientY,
      originalStart: new Date(task.start),
      originalEnd: new Date(task.end)
    });
  }, [canEdit, tasks]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.taskId) return;
    
    const deltaX = e.clientX - dragState.startX;
    const deltaDays = deltaX / calculateTimeScale().pixelsPerDay;
    
    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task || !dragState.originalStart || !dragState.originalEnd) return;
    
    let newStart = new Date(dragState.originalStart);
    let newEnd = new Date(dragState.originalEnd);
    
    switch (dragState.dragType) {
      case 'move':
        newStart.setDate(newStart.getDate() + deltaDays);
        newEnd.setDate(newEnd.getDate() + deltaDays);
        break;
      case 'resize-start':
        newStart.setDate(newStart.getDate() + deltaDays);
        break;
      case 'resize-end':
        newEnd.setDate(newEnd.getDate() + deltaDays);
        break;
    }
    
    // Ensure minimum duration
    const minDuration = 1; // 1 day minimum
    if ((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24) < minDuration) {
      return;
    }
    
    onTaskUpdate(dragState.taskId, {
      start: newStart,
      end: newEnd,
      duration: (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)
    });
  }, [dragState, tasks, calculateTimeScale, onTaskUpdate]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      taskId: null,
      dragType: null,
      startX: 0,
      startY: 0,
      originalStart: null,
      originalEnd: null
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

  // Calculate critical path and resource allocation on data changes
  useEffect(() => {
    calculateCriticalPath();
    calculateResourceAllocation();
  }, [calculateCriticalPath, calculateResourceAllocation]);

  // Render task bar with advanced features
  const renderTaskBar = useCallback((task: AdvancedGanttTask, y: number) => {
    const startX = dateToPixel(task.start);
    const endX = dateToPixel(task.end);
    const width = endX - startX;
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;
    const isCritical = showCriticalPath && task.criticalPath;
    
    const barY = y + dimensions.rowHeight * 0.2;
    const barHeight = dimensions.rowHeight * 0.6;
    
    // Determine bar color based on status and critical path
    let barColor = '#3b82f6'; // Default blue
    if (isCritical) {
      barColor = '#ef4444'; // Red for critical path
    } else if (task.status === 'completed') {
      barColor = '#10b981'; // Green for completed
    } else if (task.status === 'on-hold') {
      barColor = '#f59e0b'; // Amber for on-hold
    } else if (task.status === 'cancelled') {
      barColor = '#6b7280'; // Gray for cancelled
    }
    
    // Determine pattern based on task type
    let pattern = 'solid';
    if (task.type === 'milestone') {
      pattern = 'dashed';
    } else if (task.type === 'summary') {
      pattern = 'dotted';
    }
    
    return (
      <g key={task.id}>
        {/* Main task bar */}
        <rect
          x={startX}
          y={barY}
          width={width}
          height={barHeight}
          fill={barColor}
          stroke={isSelected ? '#1d4ed8' : isHovered ? '#2563eb' : '#1e40af'}
          strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
          strokeDasharray={pattern === 'dashed' ? '5,5' : pattern === 'dotted' ? '2,2' : 'none'}
          rx={4}
          onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
          onMouseEnter={() => setHoveredTaskId(task.id)}
          onMouseLeave={() => setHoveredTaskId(null)}
          onClick={() => onTaskSelect(task.id)}
          style={{ cursor: canEdit ? 'pointer' : 'default' }}
        />
        
        {/* Progress overlay */}
        {task.progress > 0 && (
          <rect
            x={startX}
            y={barY}
            width={width * (task.progress / 100)}
            height={barHeight}
            fill="#ffffff"
            fillOpacity={0.3}
            rx={4}
          />
        )}
        
        {/* Baseline bar */}
        {showBaseline && task.baseline && (
          (() => {
            const baselineStartX = dateToPixel(task.baseline.start);
            const baselineEndX = dateToPixel(task.baseline.end);
            const baselineWidth = baselineEndX - baselineStartX;
            
            return (
              <rect
                x={baselineStartX}
                y={barY - 2}
                width={baselineWidth}
                height={barHeight + 4}
                fill="none"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="3,3"
                rx={4}
              />
            );
          })()
        )}
        
        {/* Actuals bar */}
        {showActuals && task.actuals?.start && task.actuals?.end && (
          (() => {
            const actualStartX = dateToPixel(task.actuals.start);
            const actualEndX = dateToPixel(task.actuals.end);
            const actualWidth = actualEndX - actualStartX;
            
            return (
              <rect
                x={actualStartX}
                y={barY + 2}
                width={actualWidth}
                height={barHeight - 4}
                fill="#10b981"
                fillOpacity={0.7}
                rx={2}
              />
            );
          })()
        )}
        
        {/* Constraint indicators */}
        {showConstraints && task.constraints && (
          (() => {
            const constraintX = task.constraints.type.includes('start') ? startX : endX;
            return (
              <circle
                cx={constraintX}
                cy={barY + barHeight / 2}
                r={4}
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth={1}
              />
            );
          })()
        )}
        
        {/* Resource allocation indicator */}
        {showResourceAllocation && task.resources && task.resources.length > 0 && (
          <rect
            x={startX}
            y={barY + barHeight}
            width={width}
            height={2}
            fill="#8b5cf6"
            opacity={0.7}
          />
        )}
        
        {/* Resize handles */}
        {canEdit && (
          <>
            <rect
              x={startX - 2}
              y={barY}
              width={4}
              height={barHeight}
              fill="transparent"
              stroke="#1d4ed8"
              strokeWidth={1}
              onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-start')}
              style={{ cursor: 'ew-resize' }}
            />
            <rect
              x={endX - 2}
              y={barY}
              width={4}
              height={barHeight}
              fill="transparent"
              stroke="#1d4ed8"
              strokeWidth={1}
              onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-end')}
              style={{ cursor: 'ew-resize' }}
            />
          </>
        )}
        
        {/* Task name label */}
        {width > 60 && (
          <text
            x={startX + 4}
            y={barY + barHeight / 2 + 4}
            fontSize="11"
            fill="#ffffff"
            fontWeight="500"
            textAnchor="start"
            dominantBaseline="middle"
          >
            {task.name}
          </text>
        )}
      </g>
    );
  }, [
    dateToPixel,
    dimensions.rowHeight,
    selectedTaskId,
    hoveredTaskId,
    showCriticalPath,
    showBaseline,
    showActuals,
    showConstraints,
    showResourceAllocation,
    onTaskSelect,
    canEdit,
    handleMouseDown
  ]);

  // Render task links with advanced features
  const renderTaskLinks = useCallback(() => {
    if (!showDependencies) return null;

    return links.map(link => {
      const sourceTask = tasks.find(t => t.id === link.sourceTaskId);
      const targetTask = tasks.find(t => t.id === link.targetTaskId);
      
      if (!sourceTask || !targetTask) return null;

      const sourceX = dateToPixel(sourceTask.end);
      const sourceY = getVisibleTasks().findIndex(t => t.id === sourceTask.id) * dimensions.rowHeight + dimensions.rowHeight / 2;
      const targetX = dateToPixel(targetTask.start);
      const targetY = getVisibleTasks().findIndex(t => t.id === targetTask.id) * dimensions.rowHeight + dimensions.rowHeight / 2;

      const isCritical = showCriticalPath && link.critical;
      const strokeColor = isCritical ? '#ef4444' : '#6b7280';
      const strokeWidth = isCritical ? 3 : 2;

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
              <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
            </marker>
          </defs>
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            markerEnd={`url(#arrowhead-${link.id})`}
            strokeDasharray={isCritical ? 'none' : '5,5'}
          />
          
          {/* Lag indicator */}
          {link.lag > 0 && (
            <text
              x={(sourceX + targetX) / 2}
              y={(sourceY + targetY) / 2 - 10}
              fontSize="10"
              fill={strokeColor}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              +{link.lag}d
            </text>
          )}
        </g>
      );
    });
  }, [links, tasks, showDependencies, showCriticalPath, dateToPixel, getVisibleTasks, dimensions.rowHeight]);

  // Render time grid with advanced features
  const renderTimeGrid = useCallback(() => {
    const { projectStart, projectEnd, pixelsPerDay } = calculateTimeScale();
    const gridLines = [];
    
    let current = new Date(projectStart);
    while (current <= projectEnd) {
      const x = dateToPixel(current);
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      const isMajor = viewMode.type === 'month' ? current.getDate() === 1 : 
                     viewMode.type === 'week' ? current.getDay() === 0 : true;
      
      gridLines.push({
        x,
        date: new Date(current),
        isMajor,
        isWeekend
      });
      
      // Increment based on view mode
      switch (viewMode.type) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarter':
          current.setMonth(current.getMonth() + 3);
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
    
    return gridLines;
  }, [calculateTimeScale, dateToPixel, viewMode]);

  // Render time header
  const renderTimeHeader = useCallback(() => {
    const gridLines = renderTimeGrid();
    
    return (
      <g>
        {gridLines.map((line, index) => (
          <g key={index}>
            <line
              x1={line.x}
              y1={0}
              x2={line.x}
              y2={dimensions.headerHeight}
              stroke={line.isWeekend ? '#f3f4f6' : line.isMajor ? '#d1d5db' : '#e5e7eb'}
              strokeWidth={1}
            />
            {line.isMajor && (
              <text
                x={line.x + 4}
                y={dimensions.headerHeight / 2}
                fontSize="11"
                fill="#374151"
                textAnchor="start"
                dominantBaseline="middle"
              >
                {line.date.toLocaleDateString('en-US', {
                  month: viewMode.type === 'month' ? 'short' : 'numeric',
                  day: viewMode.type === 'day' ? 'numeric' : undefined,
                  year: viewMode.type === 'year' ? 'numeric' : undefined
                })}
              </text>
            )}
          </g>
        ))}
      </g>
    );
  }, [renderTimeGrid, dimensions.headerHeight, viewMode]);

  // Render left column with advanced information
  const renderLeftColumn = useCallback(() => {
    const visibleTasks = getVisibleTasks();
    
    return (
      <div className="absolute left-0 top-0 w-[400px] h-full bg-white border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-700">
            <div>WBS</div>
            <div>Task Name</div>
            <div>Duration</div>
            <div>Start</div>
            <div>Finish</div>
            <div>Progress</div>
          </div>
        </div>
        
        {/* Task list */}
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 40px)' }}>
          {visibleTasks.map((task, index) => (
            <div
              key={task.id}
              className={`grid grid-cols-6 gap-2 px-4 py-2 text-sm border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedTaskId === task.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => onTaskSelect(task.id)}
              style={{ paddingLeft: `${(task.level || 0) * 20 + 16}px` }}
            >
              <div className="flex items-center">
                {task.children && task.children.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedTasks(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(task.id)) {
                          newSet.delete(task.id);
                        } else {
                          newSet.add(task.id);
                        }
                        return newSet;
                      });
                    }}
                    className="mr-1"
                  >
                    {expandedTasks.has(task.id) ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
                <span className="text-xs text-gray-500">{task.wbsId}</span>
              </div>
              
              <div className="flex items-center">
                <span className="truncate">{task.name}</span>
                {task.isCritical && showCriticalPath && (
                  <BoltIcon className="w-4 h-4 text-red-500 ml-1" />
                )}
                {task.type === 'milestone' && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full ml-1" />
                )}
              </div>
              
              <div className="text-xs text-gray-600">
                {task.duration}d
              </div>
              
              <div className="text-xs text-gray-600">
                {task.start.toLocaleDateString()}
              </div>
              
              <div className="text-xs text-gray-600">
                {task.end.toLocaleDateString()}
              </div>
              
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{task.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [getVisibleTasks, selectedTaskId, expandedTasks, showCriticalPath, onTaskSelect]);

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

  const visibleTasks = getVisibleTasks();

  return (
    <div
      ref={containerRef}
      className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
      style={{ width: '100%', height: '800px' }}
    >
      {/* Left Column */}
      {renderLeftColumn()}
      
      {/* Canvas */}
      <div
        className="absolute left-[400px] top-0 right-0 bottom-0 overflow-auto"
        style={{ width: dimensions.canvasWidth, height: dimensions.height }}
      >
        <svg
          width={dimensions.canvasWidth}
          height={dimensions.height}
          className="absolute top-0 left-0"
        >
          {/* Grid lines */}
          <g>
            {renderTimeGrid().map((line, index) => (
              <line
                key={index}
                x1={line.x}
                y1={dimensions.headerHeight}
                x2={line.x}
                y2={dimensions.height}
                stroke={line.isWeekend ? '#f3f4f6' : line.isMajor ? '#d1d5db' : '#e5e7eb'}
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
      
      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>Tasks: {visibleTasks.length}</span>
            <span>Links: {links.length}</span>
            {criticalPathAnalysis && (
              <span>Critical Path: {criticalPathAnalysis.criticalTasks.length} tasks</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>Zoom: {viewMode.zoom}%</span>
            <span>View: {viewMode.type}</span>
            {showCriticalPath && <span className="text-red-600">Critical Path Active</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAstaGantt; 