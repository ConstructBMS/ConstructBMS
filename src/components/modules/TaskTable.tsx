import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import type { GanttTask, GanttLink } from './GanttCanvas';

export interface TaskTableProps {
  tasks: GanttTask[];
  links: GanttLink[];
  selectedTaskId?: string;
  onTaskSelect?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onScrollSync?: (scrollTop: number) => void;
  userRole: string;
  expandedTasks: Set<string>;
  onToggleExpansion: (taskId: string) => void;
}

interface EditingCell {
  taskId: string;
  field: keyof GanttTask;
  value: string;
}

interface ValidationError {
  taskId: string;
  field: string;
  message: string;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  links,
  selectedTaskId,
  onTaskSelect,
  onTaskUpdate,
  onScrollSync,
  userRole,
  expandedTasks,
  onToggleExpansion
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [sortConfig, setSortConfig] = useState<{ field: keyof GanttTask; direction: 'asc' | 'desc' } | null>(null);
  const [groupByWBS, setGroupByWBS] = useState(true);

  const canEdit = userRole !== 'viewer';

  // Calculate duration in days
  const calculateDuration = useCallback((startDate: Date, endDate: Date): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // Format date for display
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

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

  // Sort tasks
  const getSortedTasks = useCallback((tasks: GanttTask[]): GanttTask[] => {
    if (!sortConfig) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue: any = a[sortConfig.field];
      let bValue: any = b[sortConfig.field];

      // Handle different data types
      if (sortConfig.field === 'startDate' || sortConfig.field === 'endDate') {
        aValue = aValue instanceof Date ? aValue.getTime() : 0;
        bValue = bValue instanceof Date ? bValue.getTime() : 0;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortConfig]);

  // Group tasks by WBS
  const getGroupedTasks = useCallback((tasks: GanttTask[]): (GanttTask | { type: 'group'; wbs: string; tasks: GanttTask[] })[] => {
    if (!groupByWBS) return tasks;

    const groups: { [key: string]: GanttTask[] } = {};
    
    tasks.forEach(task => {
      const wbsPrefix = task.wbsNumber ? task.wbsNumber.split('.')[0] : 'No WBS';
      if (!groups[wbsPrefix]) {
        groups[wbsPrefix] = [];
      }
      groups[wbsPrefix].push(task);
    });

    const result: (GanttTask | { type: 'group'; wbs: string; tasks: GanttTask[] })[] = [];
    
    Object.entries(groups).forEach(([wbs, groupTasks]) => {
      if (groupTasks.length > 1) {
        result.push({ type: 'group', wbs, tasks: groupTasks });
      } else if (groupTasks.length === 1) {
        result.push(groupTasks[0]);
      }
    });

    return result;
  }, [groupByWBS]);

  // Validate task data
  const validateTask = useCallback((task: GanttTask, field: keyof GanttTask, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value || String(value).trim().length === 0) {
          return 'Task name is required';
        }
        break;
      case 'startDate':
        if (value instanceof Date && task.endDate && value >= task.endDate) {
          return 'Start date must be before end date';
        }
        break;
      case 'endDate':
        if (value instanceof Date && task.startDate && value <= task.startDate) {
          return 'End date must be after start date';
        }
        break;
      case 'progress':
        const progress = Number(value);
        if (isNaN(progress) || progress < 0 || progress > 100) {
          return 'Progress must be between 0 and 100';
        }
        break;
    }
    return null;
  }, []);

  // Handle cell edit start
  const handleEditStart = useCallback((taskId: string, field: keyof GanttTask, currentValue: any) => {
    if (!canEdit) return;

    let value = '';
    if (field === 'startDate' || field === 'endDate') {
      value = currentValue instanceof Date ? currentValue.toISOString().split('T')[0] : '';
    } else {
      value = String(currentValue || '');
    }

    setEditingCell({ taskId, field, value });
  }, [canEdit]);

  // Handle cell edit save
  const handleEditSave = useCallback(() => {
    if (!editingCell || !onTaskUpdate) return;

    const task = tasks.find(t => t.id === editingCell.taskId);
    if (!task) return;

    // Validate the new value
    let newValue: any = editingCell.value;
    if (editingCell.field === 'startDate' || editingCell.field === 'endDate') {
      newValue = new Date(editingCell.value);
    } else if (editingCell.field === 'progress') {
      newValue = Number(editingCell.value);
    }

    const error = validateTask(task, editingCell.field, newValue);
    if (error) {
      setValidationErrors(prev => [...prev, { taskId: editingCell.taskId, field: editingCell.field, message: error }]);
      return;
    }

    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(e => !(e.taskId === editingCell.taskId && e.field === editingCell.field)));

    // Update the task
    const updates: Partial<GanttTask> = {};
    (updates as any)[editingCell.field] = newValue;

    // Auto-calculate duration if dates changed
    if (editingCell.field === 'startDate' || editingCell.field === 'endDate') {
      const newStartDate = editingCell.field === 'startDate' ? newValue : task.startDate;
      const newEndDate = editingCell.field === 'endDate' ? newValue : task.endDate;
      if (newStartDate && newEndDate) {
        // Duration is calculated automatically, no need to store it
      }
    }

    onTaskUpdate(editingCell.taskId, updates);
    setEditingCell(null);
  }, [editingCell, onTaskUpdate, tasks, validateTask]);

  // Handle cell edit cancel
  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
    setValidationErrors(prev => prev.filter(e => !(e.taskId === editingCell?.taskId && e.field === editingCell?.field)));
  }, [editingCell]);

  // Handle sort
  const handleSort = useCallback((field: keyof GanttTask) => {
    setSortConfig(prev => {
      if (prev?.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
  }, []);

  // Handle scroll sync
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (onScrollSync) {
      onScrollSync(e.currentTarget.scrollTop);
    }
  }, [onScrollSync]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleEditSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleEditCancel();
      }
    }
  }, [editingCell, handleEditSave, handleEditCancel]);

  // Render sort indicator
  const renderSortIndicator = useCallback((field: keyof GanttTask) => {
    if (sortConfig?.field !== field) return null;
    return (
      <span className="ml-1 text-gray-400">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  }, [sortConfig]);

  // Render editable cell
  const renderEditableCell = useCallback((task: GanttTask, field: keyof GanttTask, value: any, displayValue: string) => {
    const isEditing = editingCell?.taskId === task.id && editingCell?.field === field;
    const hasError = validationErrors.some(e => e.taskId === task.id && e.field === field);

    if (isEditing) {
      return (
        <div className="flex items-center space-x-1">
          <input
            type={field === 'startDate' || field === 'endDate' ? 'date' : 'text'}
            value={editingCell.value}
            onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
            onKeyDown={handleKeyDown}
            className={`flex-1 px-2 py-1 text-sm border rounded ${
              hasError ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
            }`}
            autoFocus
          />
          <button
            onClick={handleEditSave}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
          >
            <CheckIcon className="w-3 h-3" />
          </button>
          <button
            onClick={handleEditCancel}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div 
        className={`flex items-center justify-between group ${
          canEdit ? 'cursor-pointer hover:bg-gray-50' : ''
        }`}
        onClick={() => canEdit && handleEditStart(task.id, field, value)}
      >
        <span className="truncate">{displayValue}</span>
        {canEdit && (
          <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    );
  }, [editingCell, validationErrors, canEdit, handleEditStart, handleEditSave, handleEditCancel, handleKeyDown]);

  // Render task row
  const renderTaskRow = useCallback((task: GanttTask, index: number) => {
    const isSelected = selectedTaskId === task.id;
    const duration = calculateDuration(task.startDate, task.endDate);
    const hasError = validationErrors.some(e => e.taskId === task.id);

    return (
      <div
        key={task.id}
        className={`flex items-center border-b border-gray-200 hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        } ${hasError ? 'bg-red-50' : ''}`}
        style={{ height: '40px' }}
        onClick={() => onTaskSelect?.(task.id)}
      >
        {/* Task Name */}
        <div className="flex items-center px-3 py-2 w-64 border-r border-gray-200">
          <div style={{ width: task.level * 20 }} />
          {task.children && task.children.length > 0 && (
            <button
              className="mr-2 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpansion(task.id);
              }}
            >
              {expandedTasks.has(task.id) ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          <div className="flex items-center mr-2">
            {task.isMilestone ? (
              <div className="w-4 h-4 bg-blue-500 transform rotate-45" />
            ) : (
              <div className="w-4 h-4 bg-gray-300 rounded" />
            )}
          </div>
          {renderEditableCell(task, 'name', task.name, task.name)}
        </div>

        {/* Start Date */}
        <div className="px-3 py-2 w-24 border-r border-gray-200">
          {renderEditableCell(task, 'startDate', task.startDate, formatDate(task.startDate))}
        </div>

        {/* End Date */}
        <div className="px-3 py-2 w-24 border-r border-gray-200">
          {renderEditableCell(task, 'endDate', task.endDate, formatDate(task.endDate))}
        </div>

        {/* Duration */}
        <div className="px-3 py-2 w-20 border-r border-gray-200 text-center">
          <span className="text-sm text-gray-600">{duration}d</span>
        </div>

        {/* Resource Assigned */}
        <div className="px-3 py-2 w-32 border-r border-gray-200">
          <div className="flex items-center">
            <UserIcon className="w-3 h-3 mr-1 text-gray-400" />
            <span className="text-sm truncate">{task.assignedTo || 'Unassigned'}</span>
          </div>
        </div>

        {/* Calendar Assigned */}
        <div className="px-3 py-2 w-32 border-r border-gray-200">
          <div className="flex items-center">
            <CalendarIcon className="w-3 h-3 mr-1 text-gray-400" />
            <span className="text-sm truncate">Standard</span>
          </div>
        </div>

        {/* Float / Slack */}
        <div className="px-3 py-2 w-20 border-r border-gray-200 text-center">
          <div className="flex items-center justify-center">
            <ClockIcon className="w-3 h-3 mr-1 text-gray-400" />
            <span className="text-sm text-gray-600">{task.float}d</span>
          </div>
        </div>

        {/* % Complete */}
        <div className="px-3 py-2 w-20 text-center">
          {renderEditableCell(task, 'progress', task.progress, `${task.progress}%`)}
        </div>
      </div>
    );
  }, [
    selectedTaskId,
    calculateDuration,
    formatDate,
    validationErrors,
    expandedTasks,
    onTaskSelect,
    onToggleExpansion,
    renderEditableCell,
    canEdit
  ]);

  // Render group header
  const renderGroupHeader = useCallback((group: { type: 'group'; wbs: string; tasks: GanttTask[] }) => {
    const totalDuration = group.tasks.reduce((sum, task) => sum + calculateDuration(task.startDate, task.endDate), 0);
    const avgProgress = group.tasks.reduce((sum, task) => sum + task.progress, 0) / group.tasks.length;

    return (
      <div className="flex items-center border-b border-gray-300 bg-gray-100 font-medium text-gray-700" style={{ height: '40px' }}>
        <div className="px-3 py-2 w-64 border-r border-gray-200">
          <span className="text-sm">WBS {group.wbs}</span>
        </div>
        <div className="px-3 py-2 w-24 border-r border-gray-200 text-center">
          <span className="text-sm">-</span>
        </div>
        <div className="px-3 py-2 w-24 border-r border-gray-200 text-center">
          <span className="text-sm">-</span>
        </div>
        <div className="px-3 py-2 w-20 border-r border-gray-200 text-center">
          <span className="text-sm">{totalDuration}d</span>
        </div>
        <div className="px-3 py-2 w-32 border-r border-gray-200 text-center">
          <span className="text-sm">-</span>
        </div>
        <div className="px-3 py-2 w-32 border-r border-gray-200 text-center">
          <span className="text-sm">-</span>
        </div>
        <div className="px-3 py-2 w-20 border-r border-gray-200 text-center">
          <span className="text-sm">-</span>
        </div>
        <div className="px-3 py-2 w-20 text-center">
          <span className="text-sm">{Math.round(avgProgress)}%</span>
        </div>
      </div>
    );
  }, [calculateDuration]);

  const visibleTasks = getVisibleTasks();
  const sortedTasks = getSortedTasks(visibleTasks);
  const groupedTasks = getGroupedTasks(sortedTasks);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center px-3 py-2" style={{ height: '40px' }}>
          <div className="flex items-center px-3 py-2 w-64 border-r border-gray-200">
            <button
              onClick={() => handleSort('name')}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Task Name
              {renderSortIndicator('name')}
            </button>
          </div>
          <div className="flex items-center px-3 py-2 w-24 border-r border-gray-200">
            <button
              onClick={() => handleSort('startDate')}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Start
              {renderSortIndicator('startDate')}
            </button>
          </div>
          <div className="flex items-center px-3 py-2 w-24 border-r border-gray-200">
            <button
              onClick={() => handleSort('endDate')}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              End
              {renderSortIndicator('endDate')}
            </button>
          </div>
          <div className="flex items-center px-3 py-2 w-20 border-r border-gray-200 text-center">
            <span className="text-sm font-medium text-gray-700">Duration</span>
          </div>
          <div className="flex items-center px-3 py-2 w-32 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-700">Resource</span>
          </div>
          <div className="flex items-center px-3 py-2 w-32 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-700">Calendar</span>
          </div>
          <div className="flex items-center px-3 py-2 w-20 border-r border-gray-200 text-center">
            <span className="text-sm font-medium text-gray-700">Float</span>
          </div>
          <div className="flex items-center px-3 py-2 w-20 text-center">
            <button
              onClick={() => handleSort('progress')}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              % Complete
              {renderSortIndicator('progress')}
            </button>
          </div>
          <div className="flex items-center px-3 py-2 w-24 text-center">
            <span className="text-sm font-medium text-gray-700">Activities</span>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div
        ref={tableRef}
        className="overflow-y-auto"
        style={{ height: '400px' }}
        onScroll={handleScroll}
      >
        {groupedTasks.map((item, index) => {
          if ('type' in item && item.type === 'group') {
            return (
              <div key={`group-${item.wbs}`}>
                {renderGroupHeader(item)}
                {item.tasks.map(task => renderTaskRow(task, index))}
              </div>
            );
          } else {
            return renderTaskRow(item as GanttTask, index);
          }
        })}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <div className="flex items-center text-red-800 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            <span>Please fix the following errors:</span>
          </div>
          <ul className="mt-2 text-red-700 text-sm">
            {validationErrors.map((error, index) => (
              <li key={index}>
                Task {error.taskId}: {error.field} - {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskTable; 