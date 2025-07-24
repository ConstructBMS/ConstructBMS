import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { taskService, type Task } from '../../../services/taskService';
import { demoModeService } from '../../../services/demoModeService';

interface StructureTabProps {
  currentParentId?: string | null;
  isDemoMode?: boolean;
  onParentChange?: (parentId: string | null) => void;
  projectId: string;
  taskId?: string;
}

interface TaskOption {
  disabled?: boolean;
  id: string;
  level: number;
  name: string;
  type: 'task' | 'milestone' | 'phase' | 'summary';
}

const StructureTab: React.FC<StructureTabProps> = ({
  taskId,
  projectId,
  currentParentId,
  onParentChange,
  isDemoMode = false
}) => {
  const { canAccess } = usePermissions();
  const [availableTasks, setAvailableTasks] = useState<TaskOption[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(currentParentId || null);
  const [loading, setLoading] = useState(true);
  const [childTasks, setChildTasks] = useState<Task[]>([]);
  const [showHierarchy, setShowHierarchy] = useState(false);

  const canEditStructure = canAccess('programme.structure.edit');
  const canToggleStructure = canAccess('programme.structure.toggle');
  const canViewStructure = canAccess('programme.structure.view');

  useEffect(() => {
    loadAvailableTasks();
    if (taskId) {
      loadChildTasks();
    }
  }, [taskId, projectId]);

  const loadAvailableTasks = async () => {
    try {
      setLoading(true);
      const tasks = await taskService.getProjectTasks(projectId);
      
      // Filter out the current task and its descendants to prevent circular references
      const filteredTasks = tasks.filter(task => {
        if (task.id === taskId) return false;
        if (taskId) {
          // Check if this task is a descendant of the current task
          return !isDescendant(task.id, taskId, tasks);
        }
        return true;
      });

      // Build hierarchy levels
      const taskOptions: TaskOption[] = [];
      for (const task of filteredTasks) {
        const level = await taskService.getTaskLevel(task.id);
        taskOptions.push({
          id: task.id,
          name: task.name,
          type: task.type,
          level,
          disabled: false
        });
      }

      // Sort by level and name
      taskOptions.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
      });

      setAvailableTasks(taskOptions);
    } catch (error) {
      console.error('Error loading available tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildTasks = async () => {
    if (!taskId) return;
    
    try {
      const children = await taskService.getChildTasks(taskId);
      setChildTasks(children);
    } catch (error) {
      console.error('Error loading child tasks:', error);
    }
  };

  const isDescendant = (taskId: string, ancestorId: string, allTasks: Task[]): boolean => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task || !task.parentId) return false;
    if (task.parentId === ancestorId) return true;
    return isDescendant(task.parentId, ancestorId, allTasks);
  };

  const handleParentChange = (parentId: string | null) => {
    if (!canEditStructure) return;

    // Demo mode restrictions
    if (isDemoMode) {
      if (parentId) {
        const parentTask = availableTasks.find(t => t.id === parentId);
        if (parentTask && parentTask.type === 'phase') {
          const existingChildren = childTasks.length;
          if (existingChildren >= 3) {
            alert('Demo mode - Maximum 3 tasks per phase allowed');
            return;
          }
        }
      }
    }

    setSelectedParentId(parentId);
    onParentChange?.(parentId);
  };

  const getIndentedName = (task: TaskOption) => {
    const indent = '  '.repeat(task.level);
    const icon = task.type === 'phase' ? '📁' : task.type === 'milestone' ? '🎯' : '📄';
    return `${indent}${icon} ${task.name}`;
  };

  const getParentInfo = () => {
    if (!selectedParentId) return null;
    const parent = availableTasks.find(t => t.id === selectedParentId);
    return parent;
  };

  const getChildCount = () => childTasks.length;

  const getGroupDuration = async () => {
    if (!taskId) return null;
    return await taskService.calculateGroupDuration(taskId);
  };

  if (!canViewStructure) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>You don't have permission to view task structure</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Structure</h3>
      
      {/* Parent Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Parent Task
        </label>
        
        <select
          value={selectedParentId || ''}
          onChange={(e) => handleParentChange(e.target.value || null)}
          disabled={!canEditStructure || loading}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="">No Parent (Root Level)</option>
          {availableTasks.map(task => (
            <option key={task.id} value={task.id} disabled={task.disabled}>
              {getIndentedName(task)}
            </option>
          ))}
        </select>
        
        {isDemoMode && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Demo mode - Task nesting limited to 1 level
          </p>
        )}
      </div>

      {/* Current Parent Info */}
      {selectedParentId && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Parent Information
          </h4>
          {(() => {
            const parent = getParentInfo();
            return parent ? (
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Name:</strong> {parent.name}</p>
                <p><strong>Type:</strong> {parent.type}</p>
                <p><strong>Level:</strong> {parent.level}</p>
              </div>
            ) : (
              <p className="text-sm text-blue-800 dark:text-blue-200">Loading parent info...</p>
            );
          })()}
        </div>
      )}

      {/* Child Tasks (for existing tasks) */}
      {taskId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Child Tasks ({getChildCount()})
            </label>
            {canToggleStructure && (
              <button
                onClick={() => setShowHierarchy(!showHierarchy)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showHierarchy ? 'Hide' : 'Show'} Hierarchy
              </button>
            )}
          </div>
          
          {showHierarchy && childTasks.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-md p-3">
              {childTasks.map(task => (
                <div key={task.id} className="flex items-center space-x-2 py-1">
                  <DocumentIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{task.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({task.type})</span>
                </div>
              ))}
            </div>
          )}
          
          {childTasks.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No child tasks assigned to this task.
            </p>
          )}
        </div>
      )}

      {/* Group Duration Info (for parent tasks) */}
      {taskId && childTasks.length > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            Group Duration
          </h4>
          <div className="text-sm text-green-800 dark:text-green-200">
            <p><strong>Child Tasks:</strong> {getChildCount()}</p>
            <p><strong>Span:</strong> Calculated from child task dates</p>
            {isDemoMode && (
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                Demo mode - Group bar style limited to grey
              </p>
            )}
          </div>
        </div>
      )}

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Demo mode - Task nesting limited to 1 level, group bars in grey only
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructureTab; 