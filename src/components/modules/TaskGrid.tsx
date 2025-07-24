import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRightIcon, ChevronDownIcon, CalendarIcon, ClockIcon, TagIcon, CheckCircleIcon, ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { taskService } from '../services/taskService';
import { undoRedoService } from '../services/undoRedoService';

interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  statusId: string;
  tags: string[];
  type: 'task' | 'milestone' | 'phase';
  parentTaskId?: string;
  level: number;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  constraintType?: 'none' | 'MSO' | 'SNET' | 'FNLT' | 'MFO';
  constraintDate?: Date;
  constraintViolated?: boolean;
}

interface TaskGridProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: any) => void;
  onTaskSelect: (taskId: string) => void;
  selectedTaskId?: string;
  scrollTop: number;
  onScrollChange: (scrollTop: number) => void;
}

interface Column {
  id: string;
  label: string;
  width: number;
  editable: boolean;
  sortable: boolean;
  render: (task: Task, isEditing: boolean, onEdit: (value: any) => void) => React.ReactNode;
}

const TaskGrid: React.FC<TaskGridProps> = ({
  projectId,
  tasks,
  onTaskUpdate,
  onTaskSelect,
  selectedTaskId,
  scrollTop,
  onScrollChange
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ taskId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [availableStatuses, setAvailableStatuses] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [taskCount, setTaskCount] = useState(0);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const canView = canAccess('programme.task.view');
  const canEdit = canAccess('programme.task.edit');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load available options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [statuses, tags, count] = await Promise.all([
          taskService.getAvailableStatuses(),
          taskService.getAvailableTags(),
          taskService.getTaskCount(projectId)
        ]);
        
        setAvailableStatuses(statuses);
        setAvailableTags(tags);
        setTaskCount(count);
      } catch (error) {
        console.error('Error loading grid options:', error);
      }
    };
    
    loadOptions();
  }, [projectId]);

  // Sync scroll position
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    onScrollChange(scrollTop);
  }, [onScrollChange]);

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    if (isDemoMode && expandedTaskIds.length >= 1) {
      // Demo mode: only allow 1 level expansion
      return;
    }
    
    setExpandedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Start inline editing
  const startEditing = (taskId: string, columnId: string, value: any) => {
    if (!canEdit || (isDemoMode && (columnId === 'type' || columnId === 'startDate' || columnId === 'endDate'))) {
      return;
    }
    
    setEditingCell({ taskId, columnId });
    setEditValue(value);
  };

  // Save inline edit
  const saveEdit = async () => {
    if (!editingCell) return;
    
    try {
      const { taskId, columnId } = editingCell;
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updates: any = {};
      
      switch (columnId) {
        case 'name':
          updates.name = editValue;
          break;
        case 'startDate':
          updates.startDate = new Date(editValue);
          break;
        case 'endDate':
          updates.endDate = new Date(editValue);
          break;
        case 'statusId':
          updates.statusId = editValue;
          break;
        case 'tags':
          updates.tags = editValue;
          break;
      }
      
      // Record action for undo/redo
      const before = { [columnId]: task[columnId as keyof Task] };
      const after = updates;
      
      if (window.actionTracker) {
        await window.actionTracker.trackTaskUpdate(taskId, before, after);
      }
      
      // Update task
      const result = await taskService.updateTask(taskId, updates);
      
      if (result.success) {
        onTaskUpdate(taskId, updates);
      } else {
        alert(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Failed to save changes');
    } finally {
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Cancel inline edit
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Build hierarchical task list
  const buildTaskTree = (taskList: Task[], parentId?: string, level = 0): Task[] => {
    const result: Task[] = [];
    
    for (const task of taskList) {
      if (task.parentTaskId === parentId) {
        const taskWithLevel = { ...task, level };
        result.push(taskWithLevel);
        
        // Add children if expanded
        if (expandedTaskIds.includes(task.id)) {
          const children = buildTaskTree(taskList, task.id, level + 1);
          result.push(...children);
        }
      }
    }
    
    return result;
  };

  // Get filtered tasks for demo mode
  const getFilteredTasks = (): Task[] => {
    if (isDemoMode) {
      return tasks.slice(0, 10); // Max 10 tasks in demo mode
    }
    return tasks;
  };

  // Column definitions
  const columns: Column[] = [
    {
      id: 'name',
      label: 'Name',
      width: 200,
      editable: true,
      sortable: true,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center space-x-2">
          {/* Expand/collapse arrow */}
          {task.type === 'phase' && (
            <button
              onClick={() => toggleTaskExpansion(task.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              disabled={isDemoMode && expandedTaskIds.length >= 1}
            >
              {expandedTaskIds.includes(task.id) ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Indent for hierarchy */}
          <div style={{ marginLeft: `${task.level * 20}px` }} />
          
          {/* Task name */}
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyPress}
              className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm"
              autoFocus
            />
          ) : (
            <span 
              className="flex-1 cursor-pointer hover:text-blue-600"
              onClick={() => startEditing(task.id, 'name', task.name)}
            >
              {task.name}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'startDate',
      label: 'Start Date',
      width: 120,
      editable: true,
      sortable: true,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          {isEditing ? (
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyPress}
              className="px-2 py-1 border border-blue-500 rounded text-sm"
              autoFocus
            />
          ) : (
            <span 
              className="cursor-pointer hover:text-blue-600"
              onClick={() => startEditing(task.id, 'startDate', task.startDate.toISOString().split('T')[0])}
            >
              {task.startDate.toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'endDate',
      label: 'End Date',
      width: 120,
      editable: true,
      sortable: true,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          {isEditing ? (
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyPress}
              className="px-2 py-1 border border-blue-500 rounded text-sm"
              autoFocus
            />
          ) : (
            <span 
              className="cursor-pointer hover:text-blue-600"
              onClick={() => startEditing(task.id, 'endDate', task.endDate.toISOString().split('T')[0])}
            >
              {task.endDate.toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'duration',
      label: 'Duration',
      width: 100,
      editable: false,
      sortable: true,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span>{task.duration} day{task.duration !== 1 ? 's' : ''}</span>
        </div>
      )
    },
    {
      id: 'statusId',
      label: 'Status',
      width: 120,
      editable: true,
      sortable: true,
      render: (task, isEditing, onEdit) => {
        const status = availableStatuses.find(s => s.id === task.statusId);
        
        return isEditing ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyPress}
            className="px-2 py-1 border border-blue-500 rounded text-sm"
            autoFocus
          >
            {availableStatuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        ) : (
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded"
            onClick={() => startEditing(task.id, 'statusId', task.statusId)}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status?.color || '#gray' }}
            />
            <span>{status?.name || 'Unknown'}</span>
          </div>
        );
      }
    },
    {
      id: 'tags',
      label: 'Tags',
      width: 150,
      editable: true,
      sortable: false,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center space-x-1">
          <TagIcon className="w-4 h-4 text-gray-400" />
          {isEditing ? (
            <div className="flex flex-wrap gap-1">
              {availableTags.map(tag => (
                <label key={tag.id} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={editValue.includes(tag.id)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...editValue, tag.id]
                        : editValue.filter((id: string) => id !== tag.id);
                      setEditValue(newValue);
                    }}
                    className="rounded"
                  />
                  <span className="text-xs">{tag.name}</span>
                </label>
              ))}
              <button
                onClick={saveEdit}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          ) : (
            <div 
              className="flex flex-wrap gap-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded"
              onClick={() => startEditing(task.id, 'tags', task.tags)}
            >
              {task.tags.length > 0 ? (
                task.tags.map(tagId => {
                  const tag = availableTags.find(t => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: tag.color,
                        color: 'white'
                      }}
                    >
                      {tag.name}
                    </span>
                  ) : null;
                })
              ) : (
                <span className="text-gray-400 text-xs">No tags</span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'constraintType',
      label: 'Constraint',
      width: 120,
      editable: false,
      sortable: true,
      render: (task, isEditing, onEdit) => {
        const constraintLabels = {
          none: 'None',
          MSO: 'Must Start On',
          MFO: 'Must Finish On',
          SNET: 'Start No Earlier Than',
          FNLT: 'Finish No Later Than'
        };
        
        return (
          <div className="flex items-center space-x-2">
            {task.constraintType && task.constraintType !== 'none' ? (
              <>
                <LockClosedIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs">{constraintLabels[task.constraintType]}</span>
              </>
            ) : (
              <span className="text-gray-400 text-xs">No constraint</span>
            )}
          </div>
        );
      }
    },
    {
      id: 'constraintDate',
      label: 'Constraint Date',
      width: 120,
      editable: false,
      sortable: true,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center space-x-1">
          {task.constraintDate ? (
            <>
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs">{task.constraintDate.toLocaleDateString()}</span>
            </>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      )
    },
    {
      id: 'constraintViolation',
      label: 'Violation',
      width: 80,
      editable: false,
      sortable: true,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center justify-center">
          {task.constraintViolated ? (
            <div className="flex items-center space-x-1 text-red-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span className="text-xs">❗</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-xs">✔️</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'type',
      label: 'Type',
      width: 100,
      editable: false,
      sortable: true,
      render: (task, isEditing, onEdit) => (
        <div className="flex items-center space-x-2">
          {task.type === 'milestone' ? (
            <CheckCircleIcon className="w-5 h-5 text-purple-500" />
          ) : task.type === 'phase' ? (
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />
          ) : (
            <div className="w-5 h-5 bg-gray-300 rounded" />
          )}
          <span className="capitalize">{task.type}</span>
        </div>
      )
    }
  ];

  const taskTree = buildTaskTree(getFilteredTasks());

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Demo Banner */}
      {isDemoMode && (
        <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-medium border-b border-yellow-200 dark:border-yellow-700">
          DEMO MODE - Max 10 tasks, limited editing
        </div>
      )}
      
      {/* Column Headers */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {columns.map(column => (
            <div
              key={column.id}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700"
              style={{ width: column.width }}
            >
              {column.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Task Grid */}
      <div
        ref={gridRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div className="min-w-full">
          {taskTree.map(task => (
            <div
              key={task.id}
              className={`
                flex items-center border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150
                ${selectedTaskId === task.id ? 'bg-blue-50 dark:bg-blue-900' : ''}
                ${isDemoMode && taskCount >= 10 ? 'opacity-50' : ''}
              `}
              onClick={() => onTaskSelect(task.id)}
            >
              {columns.map(column => (
                <div
                  key={column.id}
                  className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700"
                  style={{ width: column.width }}
                >
                  {column.render(
                    task,
                    editingCell?.taskId === task.id && editingCell?.columnId === column.id,
                    (value) => setEditValue(value)
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {taskTree.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              {isDemoMode ? 'No demo tasks available' : 'No tasks found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskGrid; 