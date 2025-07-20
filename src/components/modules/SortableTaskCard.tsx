import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Edit2,
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import type { Task } from '../../services/taskService';

interface SortableTaskCardProps {
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  task: Task;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'medium':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case 'low':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'customer':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'opportunity':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'document':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
      case 'calendar':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isOverdue(task.due_date || '')
          ? 'border-red-300 dark:border-red-600'
          : ''
      }`}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <h4 className='font-medium text-gray-900 dark:text-white text-sm line-clamp-2 flex-1 mr-2'>
          {task.title}
        </h4>
        <div className='flex items-center space-x-1'>
          {getPriorityIcon(task.priority || 'medium')}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className='text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2'>
          {task.description}
        </p>
      )}

      {/* Tags */}
      <div className='flex flex-wrap gap-1 mb-3'>
        {task.type && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${getTypeColor(task.type)}`}
          >
            {task.type}
          </span>
        )}
        {task.priority && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </span>
        )}
      </div>

      {/* Details */}
      <div className='space-y-2 mb-3'>
        {task.assignee && (
          <div className='flex items-center text-xs text-gray-600 dark:text-gray-400'>
            <User className='w-3 h-3 mr-1' />
            <span className='truncate'>{task.assignee}</span>
          </div>
        )}

        {task.due_date && (
          <div className='flex items-center text-xs text-gray-600 dark:text-gray-400'>
            <Calendar className='w-3 h-3 mr-1' />
            <span className={isOverdue(task.due_date) ? 'text-red-500' : ''}>
              {formatDate(task.due_date)}
              {isOverdue(task.due_date) && ' (Overdue)'}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-600'>
        <div className='flex items-center space-x-2'>
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit(task);
            }}
            className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs'
          >
            <Edit2 className='w-3 h-3' />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className='text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs'
          >
            <Trash2 className='w-3 h-3' />
          </button>
        </div>

        {/* Quick Status Change */}
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          onClick={e => e.stopPropagation()}
          className='text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        >
          <option value='To Do'>To Do</option>
          <option value='In Progress'>In Progress</option>
          <option value='Needs Approval'>Needs Approval</option>
          <option value='Completed'>Completed</option>
        </select>
      </div>
    </div>
  );
};

export default SortableTaskCard;
