import React from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface TaskButtonProps {
  disabled?: boolean;
  onClick: () => void;
  selectedTasksCount?: number;
  type: 'new' | 'delete' | 'edit' | 'properties';
}

const TaskButton: React.FC<TaskButtonProps> = ({
  type,
  disabled = false,
  onClick,
  selectedTasksCount = 0
}) => {
  const { canAccess } = usePermissions();

  // Get permission key based on type
  const getPermissionKey = () => {
    switch (type) {
      case 'new':
        return 'programme.edit';
      case 'delete':
        return 'programme.edit';
      case 'edit':
        return 'programme.edit';
      case 'properties':
        return 'programme.view';
      default:
        return 'programme.view';
    }
  };

  // Check if user has permission
  const hasPermission = canAccess(getPermissionKey());

  // Determine if button should be disabled
  const isDisabled = disabled || !hasPermission || 
    (type === 'delete' && selectedTasksCount === 0) ||
    (type === 'edit' && selectedTasksCount === 0) ||
    (type === 'properties' && selectedTasksCount === 0);

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'new':
        return PlusIcon;
      case 'delete':
        return TrashIcon;
      case 'edit':
        return PencilIcon;
      case 'properties':
        return Cog6ToothIcon;
      default:
        return PlusIcon;
    }
  };

  // Get tooltip text
  const getTooltip = () => {
    switch (type) {
      case 'new':
        return 'Create a new task';
      case 'delete':
        return selectedTasksCount > 0 
          ? `Delete ${selectedTasksCount} selected task(s)` 
          : 'Delete selected task(s)';
      case 'edit':
        return selectedTasksCount > 0 
          ? `Edit ${selectedTasksCount} selected task(s)` 
          : 'Edit task details';
      case 'properties':
        return selectedTasksCount > 0 
          ? `View properties for ${selectedTasksCount} selected task(s)` 
          : 'View full task properties';
      default:
        return '';
    }
  };

  // Get button label
  const getLabel = () => {
    switch (type) {
      case 'new':
        return 'New Task';
      case 'delete':
        return 'Delete';
      case 'edit':
        return 'Edit';
      case 'properties':
        return 'Properties';
      default:
        return '';
    }
  };

  const IconComponent = getIcon();

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12 
        border border-gray-300 bg-white hover:bg-gray-50 
        transition-colors duration-200 rounded
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:border-gray-400'
        }
        ${type === 'delete' && !isDisabled ? 'hover:bg-red-50 hover:border-red-400' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={getTooltip()}
    >
      <IconComponent className={`w-5 h-5 ${type === 'delete' ? 'text-red-600' : 'text-gray-700'}`} />
      <span className="text-xs text-gray-600 mt-1 font-medium">
        {getLabel()}
      </span>
    </button>
  );
};

export default TaskButton; 