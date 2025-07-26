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
  CalendarIcon,
  FolderIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { taskService, type Task } from '../../services/taskService';
import { demoModeService } from '../../services/demoModeService';

interface HierarchicalTaskTableProps {
  onTaskSelect?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  projectId: string;
  selectedTaskId?: string;
  userRole: string;
}

interface HierarchicalTask extends Task {
  children: HierarchicalTask[];
  isExpanded?: boolean;
  isVisible?: boolean;
  level: number;
}

interface EditingCell {
  field: keyof Task;
  taskId: string;
  value: string;
}

const HierarchicalTaskTable: React.FC<HierarchicalTaskTableProps> = ({
  projectId,
  onTaskSelect,
  onTaskUpdate,
  selectedTaskId,
  userRole,
}) => {
  const { canAccess } = usePermissions();
  const [tasks, setTasks] = useState<HierarchicalTask[]>([]);
  const [hierarchicalTasks, setHierarchicalTasks] = useState<
    HierarchicalTask[]
  >([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const canEdit = canAccess('programme.task.edit');
  const canToggleStructure = canAccess('programme.structure.toggle');
  const canViewStructure = canAccess('programme.structure.view');

  useEffect(() => {
    loadTasks();
    checkDemoMode();
  }, [projectId]);

  useEffect(() => {
    buildHierarchy();
  }, [tasks, expandedTasks]);

  const checkDemoMode = async () => {
    const demoMode = await demoModeService.getDemoMode();
    setIsDemoMode(demoMode);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const projectTasks = await taskService.getProjectTasks(projectId);

      // Add hierarchy information
      const tasksWithHierarchy: HierarchicalTask[] = await Promise.all(
        projectTasks.map(async task => ({
          ...task,
          level: await taskService.getTaskLevel(task.id),
          children: [],
          isExpanded: expandedTasks.has(task.id),
          isVisible: await taskService.isTaskVisible(task.id),
        }))
      );

      setTasks(tasksWithHierarchy);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = () => {
    const taskMap = new Map(
      tasks.map(task => [task.id, { ...task, children: [] }])
    );
    const rootTasks: HierarchicalTask[] = [];

    // Build parent-child relationships
    tasks.forEach(task => {
      if (task.parentId) {
        const parent = taskMap.get(task.parentId);
        if (parent) {
          parent.children.push(taskMap.get(task.id)!);
        }
      } else {
        rootTasks.push(taskMap.get(task.id)!);
      }
    });

    // Sort by level and name
    const sortTasks = (taskList: HierarchicalTask[]): HierarchicalTask[] => {
      return taskList
        .sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
        })
        .map(task => ({
          ...task,
          children: sortTasks(task.children),
        }));
    };

    setHierarchicalTasks(sortTasks(rootTasks));
  };

  const toggleExpansion = async (taskId: string) => {
    if (!canToggleStructure) return;

    const newExpandedTasks = new Set(expandedTasks);
    if (newExpandedTasks.has(taskId)) {
      newExpandedTasks.delete(taskId);
    } else {
      newExpandedTasks.add(taskId);
    }
    setExpandedTasks(newExpandedTasks);

    // Update task collapse state in database
    try {
      await taskService.toggleTaskCollapse(taskId);
      await loadTasks(); // Reload to get updated visibility
    } catch (error) {
      console.error('Error toggling task expansion:', error);
    }
  };

  const getVisibleTasks = (
    taskList: HierarchicalTask[]
  ): HierarchicalTask[] => {
    const visible: HierarchicalTask[] = [];

    const addVisibleTask = (task: HierarchicalTask) => {
      if (task.isVisible !== false) {
        visible.push(task);

        if (expandedTasks.has(task.id) && task.children.length > 0) {
          task.children.forEach(child => addVisibleTask(child));
        }
      }
    };

    taskList.forEach(addVisibleTask);
    return visible;
  };

  const renderTaskRow = (task: HierarchicalTask, index: number) => {
    const isSelected = selectedTaskId === task.id;
    const hasChildren = task.children.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const indentLevel = task.level * 24; // 24px per level

    const getTaskIcon = () => {
      if (task.type === 'phase')
        return <FolderIcon className='w-4 h-4 text-blue-500' />;
      if (task.type === 'milestone')
        return <CheckCircleIcon className='w-4 h-4 text-green-500' />;
      return <DocumentIcon className='w-4 h-4 text-gray-500' />;
    };

    const getStatusColor = (statusId: string) => {
      switch (statusId) {
        case 'completed':
          return 'text-green-600 bg-green-100';
        case 'in-progress':
          return 'text-blue-600 bg-blue-100';
        case 'on-hold':
          return 'text-yellow-600 bg-yellow-100';
        case 'cancelled':
          return 'text-red-600 bg-red-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

    const calculateDuration = (startDate: Date, endDate: Date): number => {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    return (
      <tr
        key={task.id}
        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        } ${task.isVisible === false ? 'hidden' : ''}`}
        onClick={() => onTaskSelect?.(task.id)}
      >
        {/* Expand/Collapse */}
        <td className='px-3 py-2'>
          <div
            className='flex items-center'
            style={{ paddingLeft: `${indentLevel}px` }}
          >
            {hasChildren ? (
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleExpansion(task.id);
                }}
                className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded'
                disabled={!canToggleStructure}
              >
                {isExpanded ? (
                  <ChevronDownIcon className='w-4 h-4' />
                ) : (
                  <ChevronRightIcon className='w-4 h-4' />
                )}
              </button>
            ) : (
              <div className='w-6' />
            )}
            {getTaskIcon()}
          </div>
        </td>

        {/* Task Name */}
        <td className='px-3 py-2'>
          <div className='flex items-center space-x-2'>
            <span className='font-medium text-gray-900 dark:text-gray-100'>
              {task.name}
            </span>
            {isDemoMode && task.demo && (
              <span className='text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded'>
                DEMO
              </span>
            )}
          </div>
        </td>

        {/* Type */}
        <td className='px-3 py-2'>
          <span className='text-sm text-gray-600 dark:text-gray-400 capitalize'>
            {task.type}
          </span>
        </td>

        {/* Status */}
        <td className='px-3 py-2'>
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.statusId)}`}
          >
            {task.statusId.replace('-', ' ')}
          </span>
        </td>

        {/* Start Date */}
        <td className='px-3 py-2'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {formatDate(task.startDate)}
          </span>
        </td>

        {/* End Date */}
        <td className='px-3 py-2'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {formatDate(task.endDate)}
          </span>
        </td>

        {/* Duration */}
        <td className='px-3 py-2'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {calculateDuration(task.startDate, task.endDate)} days
          </span>
        </td>

        {/* Progress */}
        <td className='px-3 py-2'>
          <div className='flex items-center space-x-2'>
            <div className='w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full'
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {task.progress || 0}%
            </span>
          </div>
        </td>

        {/* Level */}
        <td className='px-3 py-2'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {task.level}
          </span>
        </td>

        {/* Actions */}
        <td className='px-3 py-2'>
          <div className='flex items-center space-x-1'>
            {canEdit && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  // Handle edit
                }}
                className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <PencilIcon className='w-4 h-4' />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderGroupBar = (task: HierarchicalTask) => {
    if (task.type !== 'phase' || task.children.length === 0) return null;

    const groupDuration = taskService.calculateGroupDuration(task.id);

    return (
      <div className='absolute top-0 left-0 right-0 h-2 bg-blue-800 opacity-30 rounded-t'>
        <div className='text-xs text-white px-2 py-1'>
          Group: {task.children.length} sub-tasks
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const visibleTasks = getVisibleTasks(hierarchicalTasks);

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full bg-white dark:bg-gray-900'>
        <thead className='bg-gray-50 dark:bg-gray-800'>
          <tr>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Task
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Name
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Type
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Status
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Start Date
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              End Date
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Duration
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Progress
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Level
            </th>
            <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
          {visibleTasks.map((task, index) => renderTaskRow(task, index))}
        </tbody>
      </table>

      {visibleTasks.length === 0 && (
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          No tasks found
        </div>
      )}

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className='mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md'>
          <div className='flex items-center space-x-2'>
            <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600 dark:text-yellow-400' />
            <span className='text-sm text-yellow-800 dark:text-yellow-200'>
              Demo mode - Task nesting limited to 1 level, group bars in grey
              only
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalTaskTable;
