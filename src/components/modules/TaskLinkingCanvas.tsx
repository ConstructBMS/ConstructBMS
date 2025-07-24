import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { taskLinkingService } from '../../services/taskLinkingService';
import type { TaskLink, LinkType, LinkPath } from '../../services/taskLinkingService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui';

interface GanttTask {
  assignedTo?: string;
  endDate: Date;
  float: number;
  id: string;
  name: string;
  progress: number;
  startDate: Date;
  status: string;
}

interface TaskLinkingCanvasProps {
  containerRef: React.RefObject<HTMLDivElement>;
  links: TaskLink[];
  onLinkCreate?: (link: TaskLink) => void;
  onLinkDelete?: (linkId: string) => void;
  onLinkUpdate?: (linkId: string, updates: Partial<TaskLink>) => void;
  projectId: string;
  tasks: GanttTask[];
  userRole: string;
}

interface DragState {
  currentPoint: { x: number; y: number } | null;
  isDragging: boolean;
  sourceTaskId: string | null;
  startPoint: { x: number; y: number } | null;
}

interface EditState {
  lagDays: number;
  linkId: string | null;
  linkType: LinkType;
}

const TaskLinkingCanvas: React.FC<TaskLinkingCanvasProps> = ({
  projectId,
  tasks,
  links,
  onLinkCreate,
  onLinkUpdate,
  onLinkDelete,
  userRole,
  containerRef
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    sourceTaskId: null,
    startPoint: null,
    currentPoint: null
  });

  const [editState, setEditState] = useState<EditState>({
    linkId: null,
    linkType: 'finish-to-start',
    lagDays: 0
  });

  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<{ linkId: string, x: number; y: number; } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<SVGSVGElement>(null);
  const canEdit = userRole !== 'viewer';

  // Get task element by ID
  const getTaskElement = useCallback((taskId: string): HTMLElement | null => {
    return document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
  }, []);

  // Get container bounds
  const getContainerBounds = useCallback((): DOMRect | null => {
    return containerRef.current?.getBoundingClientRect() || null;
  }, [containerRef]);

  // Calculate link path
  const calculateLinkPath = useCallback((link: TaskLink): LinkPath | null => {
    const sourceElement = getTaskElement(link.source_task_id);
    const targetElement = getTaskElement(link.target_task_id);
    const containerBounds = getContainerBounds();

    if (!sourceElement || !targetElement || !containerBounds) {
      return null;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    return taskLinkingService.calculateLinkPath(sourceRect, targetRect, link.link_type, containerBounds);
  }, [getTaskElement, getContainerBounds]);

  // Handle mouse down on task
  const handleTaskMouseDown = useCallback((e: React.MouseEvent, taskId: string) => {
    if (!canEdit) return;

    e.preventDefault();
    e.stopPropagation();

    const containerBounds = getContainerBounds();
    if (!containerBounds) return;

    setDragState({
      isDragging: true,
      sourceTaskId: taskId,
      startPoint: {
        x: e.clientX - containerBounds.left,
        y: e.clientY - containerBounds.top
      },
      currentPoint: {
        x: e.clientX - containerBounds.left,
        y: e.clientY - containerBounds.top
      }
    });
  }, [canEdit, getContainerBounds]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging) return;

    const containerBounds = getContainerBounds();
    if (!containerBounds) return;

    setDragState(prev => ({
      ...prev,
      currentPoint: {
        x: e.clientX - containerBounds.left,
        y: e.clientY - containerBounds.top
      }
    }));
  }, [dragState.isDragging, getContainerBounds]);

  // Handle mouse up
  const handleMouseUp = useCallback(async (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.sourceTaskId) return;

    const containerBounds = getContainerBounds();
    if (!containerBounds) return;

    // Find target task under cursor
    const targetElement = document.elementFromPoint(e.clientX, e.clientY);
    const targetTaskElement = targetElement?.closest('[data-task-id]') as HTMLElement;
    const targetTaskId = targetTaskElement?.dataset.taskId;

    if (targetTaskId && targetTaskId !== dragState.sourceTaskId) {
      // Check for circular dependency
      const hasCircular = await taskLinkingService.checkCircularDependency(
        dragState.sourceTaskId,
        targetTaskId,
        projectId
      );

      if (hasCircular) {
        setErrorMessage('Cannot create link: Circular dependency detected');
        setTimeout(() => setErrorMessage(null), 3000);
      } else {
        // Create new link
        const newLink = await taskLinkingService.createTaskLink({
          project_id: projectId,
          source_task_id: dragState.sourceTaskId,
          target_task_id: targetTaskId,
          link_type: 'finish-to-start',
          lag_days: 0
        });

        if (newLink && onLinkCreate) {
          onLinkCreate(newLink);
        }
      }
    }

    setDragState({
      isDragging: false,
      sourceTaskId: null,
      startPoint: null,
      currentPoint: null
    });
  }, [dragState, projectId, onLinkCreate, getContainerBounds]);

  // Handle link click
  const handleLinkClick = useCallback((e: React.MouseEvent, linkId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const link = links.find(l => l.id === linkId);
    if (link) {
      setEditState({
        linkId,
        linkType: link.link_type,
        lagDays: link.lag_days
      });
      setSelectedLink(linkId);
    }
  }, [links]);

  // Handle link right-click
  const handleLinkContextMenu = useCallback((e: React.MouseEvent, linkId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (canEdit) {
      setShowContextMenu({
        x: e.clientX,
        y: e.clientY,
        linkId
      });
    }
  }, [canEdit]);

  // Handle link update
  const handleLinkUpdate = useCallback(async () => {
    if (!editState.linkId) return;

    const updatedLink = await taskLinkingService.updateTaskLink(editState.linkId, {
      link_type: editState.linkType,
      lag_days: editState.lagDays
    });

    if (updatedLink && onLinkUpdate) {
      onLinkUpdate(editState.linkId, {
        link_type: editState.linkType,
        lag_days: editState.lagDays
      });
    }

    setEditState({ linkId: null, linkType: 'finish-to-start', lagDays: 0 });
    setSelectedLink(null);
  }, [editState, onLinkUpdate]);

  // Handle link delete
  const handleLinkDelete = useCallback(async (linkId: string) => {
    const success = await taskLinkingService.deleteTaskLink(linkId);
    
    if (success && onLinkDelete) {
      onLinkDelete(linkId);
    }

    setShowContextMenu(null);
    setSelectedLink(null);
  }, [onLinkDelete]);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setShowContextMenu(null);
  }, []);

  // Close edit dialog
  const closeEditDialog = useCallback(() => {
    setEditState({ linkId: null, linkType: 'finish-to-start', lagDays: 0 });
    setSelectedLink(null);
  }, []);

  // Add event listeners
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (dragState.isDragging) {
        handleMouseUp(e as any);
      }
    };

    const handleGlobalClick = () => {
      closeContextMenu();
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [dragState.isDragging, handleMouseUp, closeContextMenu]);

  // Render drag preview
  const renderDragPreview = () => {
    if (!dragState.isDragging || !dragState.startPoint || !dragState.currentPoint) {
      return null;
    }

    const path = `M ${dragState.startPoint.x} ${dragState.startPoint.y} L ${dragState.currentPoint.x} ${dragState.currentPoint.y}`;

    return (
      <g className="drag-preview">
        <path
          d={path}
          stroke="#666"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          opacity="0.7"
        />
        <circle
          cx={dragState.currentPoint.x}
          cy={dragState.currentPoint.y}
          r="4"
          fill="#666"
          opacity="0.7"
        />
      </g>
    );
  };

  // Render link
  const renderLink = (link: TaskLink) => {
    const path = calculateLinkPath(link);
    if (!path) return null;

    const isHovered = hoveredLink === link.id;
    const isSelected = selectedLink === link.id;
    const isEditing = editState.linkId === link.id;

    const strokeColor = isSelected ? '#3b82f6' : isHovered ? '#10b981' : '#666';
    const strokeWidth = isSelected ? 3 : isHovered ? 2 : 1;

    return (
      <g
        key={link.id}
        className="task-link"
        onMouseEnter={() => setHoveredLink(link.id)}
        onMouseLeave={() => setHoveredLink(null)}
        onClick={(e) => handleLinkClick(e, link.id)}
        onContextMenu={(e) => handleLinkContextMenu(e, link.id)}
        style={{ cursor: 'pointer' }}
      >
        <path
          d={taskLinkingService.generateSVGPath(path)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        
        {/* Link label */}
        <text
          x={(path.control1.x + path.control2.x) / 2}
          y={(path.control1.y + path.control2.y) / 2 - 10}
          textAnchor="middle"
          fontSize="12"
          fill={strokeColor}
          fontWeight="bold"
          className="link-label"
        >
          {taskLinkingService.getLinkTypeAbbreviation(link.link_type)}
          {link.lag_days !== 0 && (
            <tspan x={(path.control1.x + path.control2.x) / 2} dy="15" fontSize="10">
              {link.lag_days > 0 ? `+${link.lag_days}` : link.lag_days}
            </tspan>
          )}
        </text>

        {/* Edit dialog */}
        {isEditing && (
          <foreignObject
            x={(path.control1.x + path.control2.x) / 2 - 100}
            y={(path.control1.y + path.control2.y) / 2 - 50}
            width="200"
            height="100"
          >
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Link Type
                  </label>
                  <select
                    value={editState.linkType}
                    onChange={(e) => setEditState(prev => ({ ...prev, linkType: e.target.value as LinkType }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="finish-to-start">Finish to Start (FS)</option>
                    <option value="start-to-start">Start to Start (SS)</option>
                    <option value="finish-to-finish">Finish to Finish (FF)</option>
                    <option value="start-to-finish">Start to Finish (SF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lag (days)
                  </label>
                  <input
                    type="number"
                    value={editState.lagDays}
                    onChange={(e) => setEditState(prev => ({ ...prev, lagDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    min="-365"
                    max="365"
                  />
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={handleLinkUpdate}
                    className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    <CheckIcon className="w-3 h-3 inline mr-1" />
                    Save
                  </button>
                  <button
                    onClick={closeEditDialog}
                    className="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    <XMarkIcon className="w-3 h-3 inline mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* SVG Canvas */}
      <svg
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>

        {/* Render existing links */}
        {links.map(renderLink)}

        {/* Render drag preview */}
        {renderDragPreview()}
      </svg>

      {/* Task elements with drag handlers */}
      <div className="absolute inset-0 pointer-events-none">
        {tasks.map(task => (
          <div
            key={task.id}
            data-task-id={task.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${(task.startDate.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24) * 20}px`,
              top: `${tasks.indexOf(task) * 40}px`,
              width: `${(task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24) * 20}px`,
              height: '30px'
            }}
            onMouseDown={(e) => handleTaskMouseDown(e, task.id)}
          >
            <div className="w-full h-full bg-blue-500 rounded border-2 border-blue-600 flex items-center justify-center text-white text-xs font-medium">
              {task.name}
            </div>
          </div>
        ))}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg z-10">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {errorMessage}
          </div>
        </div>
      )}

      {/* Context menu */}
      {showContextMenu && (
        <div
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-20"
          style={{
            left: showContextMenu.x,
            top: showContextMenu.y
          }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                const link = links.find(l => l.id === showContextMenu.linkId);
                if (link) {
                  setEditState({
                    linkId: link.id,
                    linkType: link.link_type,
                    lagDays: link.lag_days
                  });
                  setSelectedLink(link.id);
                }
                setShowContextMenu(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Link
            </button>
            <button
              onClick={() => handleLinkDelete(showContextMenu.linkId)}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Link
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {canEdit && (
        <div className="absolute bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">
              Drag from a task to create a link. Click links to edit.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskLinkingCanvas; 