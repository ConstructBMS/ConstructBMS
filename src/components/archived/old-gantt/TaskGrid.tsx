import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { criticalPathService } from '../../services/criticalPathService';
import { ganttTaskService } from '../../services/ganttTaskService';
import { useProjectView } from '../../contexts/ProjectViewContext';
import type { Task } from '../../services/ganttTaskService';

interface TaskGridProps {
  leftPaneWidth: number;
  onTaskEdit?: (task: Task) => void;
  onTaskExpand: (taskId: string, isExpanded: boolean) => void;
  onTaskSelect: (taskId: string, isSelected: boolean) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  selectedTasks: string[];
  tasks: Task[]; // New prop for task editing
}

export const TaskGrid: React.FC<TaskGridProps> = ({
  tasks,
  selectedTasks,
  onTaskSelect,
  onTaskUpdate,
  onTaskExpand,
  leftPaneWidth,
  onTaskEdit
}) => {
  const { state } = useProjectView();
  const { rowHeight } = state.layoutSettings;
  const [editingCell, setEditingCell] = useState<{ field: string, taskId: string; } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts for indent/outdent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTasks.length !== 1) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        const taskId = selectedTasks[0];
        if (!taskId) return;
        
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
          if (e.shiftKey) {
            // Outdent task
            if (task.level > 0) {
              onTaskUpdate(taskId, { level: task.level - 1 });
            }
          } else {
            // Indent task
            if (task.level < 5) { // Max 5 levels deep
              onTaskUpdate(taskId, { level: task.level + 1 });
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTasks, tasks, onTaskUpdate]);

  // Handle double-click to edit task
  const handleTaskDoubleClick = (task: Task) => {
    if (onTaskEdit) {
      onTaskEdit(task);
    }
  };

  // Handle single click for selection
  const handleTaskClick = (taskId: string, event: React.MouseEvent) => {
    const isSelected = selectedTasks.includes(taskId);
    
    if (event.shiftKey) {
      // Range selection
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      const lastSelectedIndex = tasks.findIndex(t => t.id === selectedTasks[selectedTasks.length - 1]);
      
      if (lastSelectedIndex !== -1) {
        const start = Math.min(taskIndex, lastSelectedIndex);
        const end = Math.max(taskIndex, lastSelectedIndex);
        
        for (let i = start; i <= end; i++) {
          const task = tasks[i];
          if (task && !selectedTasks.includes(task.id)) {
            onTaskSelect(task.id, true);
          }
        }
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-selection
      onTaskSelect(taskId, !isSelected);
    } else {
      // Single selection
      if (!isSelected) {
        selectedTasks.forEach(id => onTaskSelect(id, false));
        onTaskSelect(taskId, true);
      }
    }
  };

  // Handle expand/collapse
  const handleExpandToggle = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskExpand(taskId, !task.isExpanded);
    }
  };

  // Handle inline editing
  const handleCellDoubleClick = (taskId: string, field: string, value: string) => {
    setEditingCell({ taskId, field });
    setEditValue(value);
  };

  const handleEditSave = () => {
    if (editingCell) {
      let parsedValue: any = editValue;
      
      // Parse value based on field type
      if (editingCell.field === 'startDate' || editingCell.field === 'endDate') {
        parsedValue = new Date(editValue);
        // Validate date
        if (isNaN(parsedValue.getTime())) {
          alert('Invalid date format. Please use YYYY-MM-DD format.');
          return;
        }
      } else if (editingCell.field === 'predecessors' || editingCell.field === 'successors') {
        parsedValue = editValue.split(',').map(s => s.trim()).filter(Boolean);
      } else if (editingCell.field === 'duration') {
        parsedValue = parseInt(editValue) || 0;
      }

      // Update the task
      onTaskUpdate(editingCell.taskId, { [editingCell.field]: parsedValue });

      // Validate dependencies if we're editing predecessors or successors
      if (editingCell.field === 'predecessors' || editingCell.field === 'successors') {
        // Get updated tasks for validation
        const updatedTasks = tasks.map(task => 
          task.id === editingCell.taskId 
            ? { ...task, [editingCell.field]: parsedValue }
            : task
        );

        // Validate dependencies
        const validation = criticalPathService.validateDependencies(updatedTasks);
        if (!validation.isValid) {
          alert(`Dependency validation failed:\n${validation.errors.join('\n')}`);
        }
      }

      // Validate dates if we're editing start or end dates
      if (editingCell.field === 'startDate' || editingCell.field === 'endDate') {
        const task = tasks.find(t => t.id === editingCell.taskId);
        if (task) {
          const updatedTask = { ...task, [editingCell.field]: parsedValue };
          const validation = ganttTaskService.validateTaskDates(updatedTask.id);
          if (!validation.isValid) {
            alert(`Date validation failed:\n${validation.errors.join('\n')}`);
          }
        }
      }

      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleEditSave();
    } else if (event.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Enhanced drag and drop handlers
  const handleDragStart = (taskId: string, index: number) => {
    setDraggedTaskId(taskId);
    setDragStartIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, taskId: string, index: number) => {
    e.preventDefault();
    setDropTargetId(taskId);
    setDragOverIndex(index);
  };

  const handleDrop = (taskId: string) => {
    if (dragStartIndex !== null && dragOverIndex !== null && dragStartIndex !== dragOverIndex) {
      const visibleTasks = getVisibleTasks();
      const draggedTask = visibleTasks[dragStartIndex];
      const targetTask = visibleTasks[dragOverIndex];
      
      if (draggedTask && targetTask) {
        // Use the existing moveTask method
        const success = ganttTaskService.moveTask(draggedTask.id, targetTask.id);
        if (success) {
          // Trigger a re-render by calling onTaskUpdate with the moved task
          const movedTask = ganttTaskService.getTaskById(draggedTask.id);
          if (movedTask) {
            onTaskUpdate(draggedTask.id, movedTask);
          }
        }
      }
    }
    
    setDraggedTaskId(null);
    setDropTargetId(null);
    setDragStartIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDropTargetId(null);
    setDragStartIndex(null);
    setDragOverIndex(null);
  };

  // Get visible tasks (respecting hierarchy)
  const getVisibleTasks = () => {
    const visible: Task[] = [];
    
    const addVisibleTask = (task: Task) => {
      visible.push(task);
      if (task.isExpanded && task.children) {
        // Get children and sort by position
        const childTasks = task.children
          .map(childId => tasks.find(t => t.id === childId))
          .filter((t): t is Task => t !== undefined)
          .sort((a, b) => a.position - b.position);
        
        childTasks.forEach(childTask => {
          addVisibleTask(childTask);
        });
      }
    };

    // Start with root tasks (level 0) sorted by position
    const rootTasks = tasks
      .filter(task => task.level === 0)
      .sort((a, b) => a.position - b.position);
    
    rootTasks.forEach(addVisibleTask);
    
    return visible;
  };

  const visibleTasks = getVisibleTasks();

  // Render task row
  const renderTaskRow = (task: Task, index: number) => {
    const isSelected = selectedTasks.includes(task.id);
    const isEditing = editingCell?.taskId === task.id;
    const indentLevel = task.level * 20;
    const isDragging = draggedTaskId === task.id;
    const isDropTarget = dropTargetId === task.id;

    return (
      <div
        key={task.id}
        draggable
        onDragStart={() => handleDragStart(task.id, index)}
        onDragOver={(e) => handleDragOver(e, task.id, index)}
        onDrop={() => handleDrop(task.id)}
        onDragEnd={handleDragEnd}
        className={`flex items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 task-row ${
          isSelected ? 'bg-blue-100' : ''
        } ${
          isDragging ? 'opacity-50 bg-yellow-100 shadow-lg' : ''
        } ${
          isDropTarget ? 'bg-yellow-100 border-l-4 border-l-blue-500' : ''
        } ${
          dragOverIndex !== null && index === dragOverIndex ? 'bg-yellow-100' : ''
        } ${
          task.level > 0 ? `task-indent-level-${Math.min(task.level, 5)}` : ''
        }`}
        style={{ height: `${rowHeight}px` }}
        onClick={(e) => handleTaskClick(task.id, e)}
        onDoubleClick={() => handleTaskDoubleClick(task)}
      >
        {/* Task Name Column */}
        <div 
          className="flex items-center flex-1 min-w-0 px-2"
          style={{ paddingLeft: `${indentLevel + 8}px` }}
        >
          {/* Drag Handle */}
          <div 
            className="w-2 h-4 mr-2 bg-gray-300 rounded-sm opacity-50 drag-handle"
            title="Drag to reorder"
          />
          
          {/* Expand/Collapse Button */}
          {(task.children && task.children.length > 0) && (
            <button
              onClick={(e) => handleExpandToggle(task.id, e)}
              className="p-1 hover:bg-gray-200 rounded mr-1"
            >
              {task.isExpanded ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
              )}
            </button>
          )}
          
          {/* Task Name */}
          <div className="flex-1 min-w-0">
            {isEditing && editingCell?.field === 'name' ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleEditSave}
                onKeyDown={handleEditKeyDown}
                className="w-full px-1 py-0.5 border border-blue-500 rounded text-sm"
                autoFocus
              />
            ) : (
              <span
                className="text-sm truncate block"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleCellDoubleClick(task.id, 'name', task.name);
                }}
              >
                {task.name}
              </span>
            )}
          </div>
        </div>

        {/* Duration Column */}
        <div className="w-20 px-2 text-center">
          {isEditing && editingCell?.field === 'duration' ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              className="w-full px-1 py-0.5 border border-blue-500 rounded text-xs text-center"
              autoFocus
            />
          ) : (
            <span
              className="text-xs text-gray-600 block"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleCellDoubleClick(task.id, 'duration', task.duration.toString());
              }}
            >
              {task.duration}d
            </span>
          )}
        </div>

        {/* Start Date Column */}
        <div className="w-24 px-2 text-center">
          {isEditing && editingCell?.field === 'startDate' ? (
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              className="w-full px-1 py-0.5 border border-blue-500 rounded text-xs text-center"
              autoFocus
            />
          ) : (
            <span
              className="text-xs text-gray-600 block cursor-pointer date-cell px-1"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleCellDoubleClick(task.id, 'startDate', task.startDate.toISOString().slice(0, 10));
              }}
              title="Double-click to edit start date"
            >
              {task.startDate.toLocaleDateString()}
            </span>
          )}
        </div>

        {/* End Date Column */}
        <div className="w-24 px-2 text-center">
          {isEditing && editingCell?.field === 'endDate' ? (
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              className="w-full px-1 py-0.5 border border-blue-500 rounded text-xs text-center"
              autoFocus
            />
          ) : (
            <span
              className="text-xs text-gray-600 block cursor-pointer date-cell px-1"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleCellDoubleClick(task.id, 'endDate', task.endDate.toISOString().slice(0, 10));
              }}
              title="Double-click to edit end date"
            >
              {task.endDate.toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Progress Column */}
        <div className="w-16 px-2 text-center">
          <span className="text-xs text-gray-600">
            {task.percentComplete}%
          </span>
        </div>

        {/* Status Column */}
        <div className="w-20 px-2 text-center">
          <span className={`text-xs px-2 py-1 rounded-full ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>

        {/* Priority Column */}
        <div className="w-16 px-2 text-center">
          <span className={`text-xs px-2 py-1 rounded-full ${
            task.priority === 'critical' ? 'bg-red-100 text-red-800' :
            task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.priority}
          </span>
        </div>

        {/* Assigned To Column */}
        <div className="w-24 px-2 text-center">
          <span className="text-xs text-gray-600 truncate block">
            {task.assignedTo || '-'}
          </span>
        </div>

        {/* Predecessors Column */}
        <div className="w-24 px-2 text-center">
          {isEditing && editingCell?.field === 'predecessors' ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              className="w-full px-1 py-0.5 border border-blue-500 rounded text-xs text-center"
              autoFocus
              placeholder="task-1,task-2"
            />
          ) : (
            <span
              className={`text-xs block cursor-pointer hover:bg-gray-100 rounded px-1 ${
                (task.predecessors || []).length > 0 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-500'
              }`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleCellDoubleClick(task.id, 'predecessors', (task.predecessors || []).join(','));
              }}
              title={`Double-click to edit predecessors${(task.predecessors || []).length > 0 ? ` (${(task.predecessors || []).length} dependency)` : ''}`}
            >
              {(task.predecessors || []).length > 0 
                ? `${(task.predecessors || []).join(',')} (${(task.predecessors || []).length})`
                : '-'
              }
            </span>
          )}
        </div>

        {/* Successors Column */}
        <div className="w-24 px-2 text-center">
          {isEditing && editingCell?.field === 'successors' ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              className="w-full px-1 py-0.5 border border-blue-500 rounded text-xs text-center"
              autoFocus
              placeholder="task-3,task-4"
            />
          ) : (
            <span
              className={`text-xs block cursor-pointer hover:bg-gray-100 rounded px-1 ${
                (task.successors || []).length > 0 
                  ? 'text-green-600 font-medium' 
                  : 'text-gray-500'
              }`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleCellDoubleClick(task.id, 'successors', (task.successors || []).join(','));
              }}
              title={`Double-click to edit successors${(task.successors || []).length > 0 ? ` (${(task.successors || []).length} dependency)` : ''}`}
            >
              {(task.successors || []).length > 0 
                ? `${(task.successors || []).join(',')} (${(task.successors || []).length})`
                : '-'
              }
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={gridRef}
      className="bg-white border-r border-gray-300 overflow-auto"
      style={{ width: leftPaneWidth }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-gray-100 border-b border-gray-300 z-10">
        <div className="flex items-center h-8 text-xs font-medium text-gray-700">
          <div className="flex-1 px-2">Task Name</div>
          <div className="w-20 px-2 text-center">Duration</div>
          <div className="w-24 px-2 text-center">Start Date</div>
          <div className="w-24 px-2 text-center">End Date</div>
          <div className="w-16 px-2 text-center">Progress</div>
          <div className="w-20 px-2 text-center">Status</div>
          <div className="w-16 px-2 text-center">Priority</div>
          <div className="w-24 px-2 text-center">Assigned To</div>
          <div className="w-24 px-2 text-center">Predecessors</div>
          <div className="w-24 px-2 text-center">Successors</div>
        </div>
      </div>

              {/* Task Rows */}
        <div>
          {visibleTasks.map((task, index) => renderTaskRow(task, index))}
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        {selectedTasks.length === 1 && (
          <div className="p-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
            <span className="font-medium">Keyboard shortcuts:</span> 
            <span className="ml-2">Tab = Indent, Shift+Tab = Outdent</span>
          </div>
        )}
    </div>
  );
}; 