import React, { useState, useRef, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import {
  dependenciesEngine,
  TaskDependency,
  ArrowCoordinates,
} from '../services/DependenciesEngine';
import {
  dependencyConstraintsService,
  ConstraintViolation,
} from '../services/dependencyConstraintsService';
import {
  criticalPathService,
  CriticalPathResult,
} from '../services/criticalPathService';
import { taskService } from '../services/taskService';

export interface Task {
  createdAt: Date;
  demo?: boolean;
  description?: string;
  endDate: Date;
  id: string;
  name: string;
  projectId: string;
  startDate: Date;
  statusId: string;
  tags: string[];
  type: 'task' | 'milestone' | 'phase' | 'summary';
  updatedAt: Date;
  userId: string;
}

interface DependencyArrowsProps {
  criticalPath?: CriticalPathResult;
  dayWidth: number;
  enforceConstraints?: boolean;
  onDependencyHover?: (dependency: TaskDependency) => void;
  onDependencyLeave?: () => void;
  onDependencyUnlink?: (dependencyId: string) => void;
  projectId: string;
  rowHeight: number;
  showCriticalPath?: boolean;
  startDate: Date;
  tasks: Task[];
}

const DependencyArrows: React.FC<DependencyArrowsProps> = ({
  projectId,
  tasks,
  dayWidth,
  rowHeight,
  startDate,
  onDependencyUnlink,
  onDependencyHover,
  onDependencyLeave,
  enforceConstraints = false,
  showCriticalPath = true,
  criticalPath,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [constraintViolations, setConstraintViolations] = useState<
    ConstraintViolation[]
  >([]);
  const [arrowCoordinates, setArrowCoordinates] = useState<
    Array<ArrowCoordinates & { id: string }>
  >([]);
  const [hoveredArrow, setHoveredArrow] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<{
    dependencyId: string;
    x: number;
    y: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canView = canAccess('programme.task.view');
  const canEdit = canAccess('programme.task.edit');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load dependencies and check violations
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const projectDependencies =
          await dependenciesEngine.getProjectDependencies(projectId);
        setDependencies(projectDependencies);

        // Check for constraint violations
        if (projectDependencies.length > 0 && tasks.length > 0) {
          const taskSchedules = tasks.map(task => ({
            id: task.id,
            startDate: task.startDate,
            endDate: task.endDate,
            duration: Math.ceil(
              (task.endDate.getTime() - task.startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          }));

          const violations =
            await dependencyConstraintsService.checkConstraintViolations(
              taskSchedules,
              projectDependencies,
              enforceConstraints
            );
          setConstraintViolations(violations);
        }
      } catch (error) {
        console.error('Error loading dependencies:', error);
      }
    };

    loadDependencies();
  }, [projectId, tasks, enforceConstraints]);

  // Calculate arrow coordinates when dependencies or tasks change
  useEffect(() => {
    const calculateArrows = () => {
      const arrows: Array<ArrowCoordinates & { id: string }> = [];

      dependencies.forEach(dependency => {
        const predecessorTask = tasks.find(
          t => t.id === dependency.predecessorId
        );
        const successorTask = tasks.find(t => t.id === dependency.successorId);

        if (predecessorTask && successorTask) {
          // Calculate task positions
          const predecessorDaysFromStart = Math.floor(
            (predecessorTask.startDate.getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const successorDaysFromStart = Math.floor(
            (successorTask.startDate.getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const predecessorIndex = tasks.findIndex(
            t => t.id === dependency.predecessorId
          );
          const successorIndex = tasks.findIndex(
            t => t.id === dependency.successorId
          );

          if (predecessorIndex !== -1 && successorIndex !== -1) {
            const predecessorRect = {
              left: predecessorDaysFromStart * dayWidth,
              right:
                (predecessorDaysFromStart +
                  Math.ceil(
                    (predecessorTask.endDate.getTime() -
                      predecessorTask.startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )) *
                dayWidth,
              top: predecessorIndex * rowHeight + 2,
              height: rowHeight - 4,
            };

            const successorRect = {
              left: successorDaysFromStart * dayWidth,
              right:
                (successorDaysFromStart +
                  Math.ceil(
                    (successorTask.endDate.getTime() -
                      successorTask.startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )) *
                dayWidth,
              top: successorIndex * rowHeight + 2,
              height: rowHeight - 4,
            };

            const coordinates = dependenciesEngine.calculateArrowCoordinates(
              predecessorTask,
              successorTask,
              predecessorRect as DOMRect,
              successorRect as DOMRect,
              dependency.type
            );

            arrows.push({
              ...coordinates,
              id: dependency.id,
            });
          }
        }
      });

      setArrowCoordinates(arrows);
    };

    calculateArrows();
  }, [dependencies, tasks, dayWidth, rowHeight, startDate]);

  // Handle arrow hover
  const handleArrowHover = (dependencyId: string) => {
    if (!canView) return;

    setHoveredArrow(dependencyId);
    const dependency = dependencies.find(d => d.id === dependencyId);
    if (dependency && onDependencyHover) {
      onDependencyHover(dependency);
    }
  };

  // Handle arrow leave
  const handleArrowLeave = () => {
    setHoveredArrow(null);
    if (onDependencyLeave) {
      onDependencyLeave();
    }
  };

  // Handle arrow right-click for context menu
  const handleArrowContextMenu = (
    e: React.MouseEvent,
    dependencyId: string
  ) => {
    e.preventDefault();
    if (!canEdit) return;

    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      dependencyId,
    });
  };

  // Handle unlink from context menu
  const handleUnlink = async (dependencyId: string) => {
    try {
      const result = await dependenciesEngine.unlinkTasks(dependencyId);
      if (result.success) {
        // Remove from local state
        setDependencies(prev => prev.filter(d => d.id !== dependencyId));

        // Notify parent
        if (onDependencyUnlink) {
          onDependencyUnlink(dependencyId);
        }
      } else {
        console.error('Failed to unlink tasks:', result.error);
      }
    } catch (error) {
      console.error('Error unlinking tasks:', error);
    }

    setShowContextMenu(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Generate SVG path for arrow
  const generateArrowPath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): string => {
    const dx = endX - startX;
    const dy = endY - startY;

    // Create a curved path
    const controlPoint1X = startX + dx * 0.25;
    const controlPoint1Y = startY;
    const controlPoint2X = endX - dx * 0.25;
    const controlPoint2Y = endY;

    return `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
  };

  // Generate arrowhead
  const generateArrowhead = (
    endX: number,
    endY: number,
    angle: number
  ): string => {
    const arrowLength = 8;
    const arrowWidth = 4;

    const angle1 = angle - Math.PI / 6;
    const angle2 = angle + Math.PI / 6;

    const x1 = endX - arrowLength * Math.cos(angle1);
    const y1 = endY - arrowLength * Math.sin(angle1);
    const x2 = endX - arrowLength * Math.cos(angle2);
    const y2 = endY - arrowLength * Math.sin(angle2);

    return `M ${endX} ${endY} L ${x1} ${y1} M ${endX} ${endY} L ${x2} ${y2}`;
  };

  // Calculate arrow angle
  const calculateArrowAngle = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): number => {
    return Math.atan2(endY - startY, endX - startX);
  };

  const getViolationForDependency = (
    dependencyId: string
  ): ConstraintViolation | undefined => {
    return constraintViolations.find(v => v.dependencyId === dependencyId);
  };

  const isDependencyViolated = (dependencyId: string): boolean => {
    return constraintViolations.some(v => v.dependencyId === dependencyId);
  };

  // Get critical path styling for arrows
  const getCriticalPathArrowStyling = (dependencyId: string) => {
    if (!showCriticalPath || !criticalPath) {
      return {};
    }

    const isCriticalDependency =
      criticalPath.criticalDependencies.includes(dependencyId);

    if (!isCriticalDependency) {
      return {};
    }

    const strokeColor = isDemoMode ? '#fca5a5' : '#dc2626'; // red-300 for demo, red-500 for normal
    const strokeWidth = isDemoMode ? 3 : 4; // Thinner for demo mode

    return {
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      strokeDasharray: 'none',
    };
  };

  // Get violation styling for arrows
  const getViolationArrowStyling = (dependencyId: string) => {
    const violation = getViolationForDependency(dependencyId);

    if (!violation) {
      return {};
    }

    return {
      stroke: '#dc2626', // red-500
      strokeWidth: 3,
      strokeDasharray: '5,5', // Dashed line for violations
    };
  };

  if (!canView) return null;

  return (
    <div ref={containerRef} className='absolute inset-0 pointer-events-none'>
      <svg
        ref={svgRef}
        className='absolute inset-0 w-full h-full pointer-events-none'
        style={{ zIndex: 5 }}
      >
        <defs>
          <marker
            id='arrowhead'
            markerWidth='10'
            markerHeight='7'
            refX='9'
            refY='3.5'
            orient='auto'
          >
            <polygon
              points='0 0, 10 3.5, 0 7'
              fill={isDemoMode ? '#fbbf24' : '#3b82f6'}
            />
          </marker>
        </defs>

        {arrowCoordinates.map(arrow => {
          const dependency = dependencies.find(d => d.id === arrow.id);
          if (!dependency) return null;

          const isCritical =
            showCriticalPath &&
            criticalPath?.criticalDependencies.includes(arrow.id);
          const hasViolation = getViolationForDependency(arrow.id);
          const isHovered = hoveredArrow === arrow.id;

          // Priority: violation > critical > normal
          const arrowStyling = hasViolation
            ? getViolationArrowStyling(arrow.id)
            : isCritical
              ? getCriticalPathArrowStyling(arrow.id)
              : {
                  stroke: isHovered ? '#3b82f6' : '#6b7280',
                  strokeWidth: isHovered ? 3 : 2,
                  strokeDasharray: 'none',
                };

          return (
            <g key={arrow.id}>
              {/* Arrow Path */}
              <path
                d={arrow.path}
                fill='none'
                style={{
                  ...arrowStyling,
                  cursor: canEdit ? 'pointer' : 'default',
                  pointerEvents: canEdit ? 'auto' : 'none',
                }}
                onMouseEnter={() => handleArrowHover(arrow.id)}
                onMouseLeave={handleArrowLeave}
                onContextMenu={e => handleArrowContextMenu(e, arrow.id)}
              />

              {/* Arrowhead */}
              <path
                d={arrow.arrowhead}
                fill={arrowStyling.stroke || '#6b7280'}
                style={{
                  cursor: canEdit ? 'pointer' : 'default',
                  pointerEvents: canEdit ? 'auto' : 'none',
                }}
                onMouseEnter={() => handleArrowHover(arrow.id)}
                onMouseLeave={handleArrowLeave}
                onContextMenu={e => handleArrowContextMenu(e, arrow.id)}
              />

              {/* Critical Path Indicator */}
              {isCritical && (
                <circle
                  cx={arrow.endX - 8}
                  cy={arrow.endY}
                  r='3'
                  fill={isDemoMode ? '#fca5a5' : '#dc2626'}
                  className='pointer-events-none'
                />
              )}

              {/* Violation Indicator */}
              {hasViolation && (
                <circle
                  cx={arrow.endX + 8}
                  cy={arrow.endY}
                  r='3'
                  fill='#dc2626'
                  className='pointer-events-none'
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Context Menu */}
      {showContextMenu && canEdit && (
        <div
          className='absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-32'
          style={{
            left: showContextMenu.x,
            top: showContextMenu.y,
          }}
        >
          <button
            onClick={() => handleUnlink(showContextMenu.dependencyId)}
            className='w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200'
          >
            Unlink Dependency
          </button>
        </div>
      )}
    </div>
  );
};

export default DependencyArrows;
