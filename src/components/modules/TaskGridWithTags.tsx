import React, { useState, useEffect } from 'react';
import { taskTagsService, type ProgrammeTag } from '../../services/taskTagsService';
import TagPill from './TagPill';

interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  progress: number;
  tagId?: string | null;
  demo?: boolean;
}

interface TaskGridWithTagsProps {
  projectId: string;
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  className?: string;
}

const TaskGridWithTags: React.FC<TaskGridWithTagsProps> = ({
  projectId,
  tasks,
  onTaskClick,
  className = ''
}) => {
  const [tags, setTags] = useState<ProgrammeTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, [projectId]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const projectTags = await taskTagsService.getProjectTags(projectId);
      setTags(projectTags);
    } catch (error) {
      console.error('Error loading tags for grid:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTagForTask = (task: Task): ProgrammeTag | null => {
    if (!task.tagId) return null;
    return tags.find(tag => tag.id === task.tagId) || null;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'on-hold':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Task Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tag
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Progress
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => {
            const taskTag = getTagForTask(task);
            return (
              <tr
                key={task.id}
                onClick={() => onTaskClick?.(task.id)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  onTaskClick ? 'cursor-pointer' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.name}
                    {task.demo && (
                      <span className="ml-2 text-xs text-gray-500">(Demo)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {taskTag ? (
                    <TagPill
                      tag={taskTag}
                      size="sm"
                      showLabel={true}
                    />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      No tag
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatDate(task.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatDate(task.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {task.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
        </div>
      )}
    </div>
  );
};

export default TaskGridWithTags; 