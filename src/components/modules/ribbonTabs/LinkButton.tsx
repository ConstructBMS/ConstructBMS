import React from 'react';
import { 
  LinkIcon, 
  NoSymbolIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface LinkButtonProps {
  canLag?: boolean;
  canLink?: boolean;
  canUnlink?: boolean;
  disabled?: boolean;
  onClick: () => void;
  selectedTasksCount?: number;
  type: 'link' | 'unlink' | 'lag';
}

const LinkButton: React.FC<LinkButtonProps> = ({
  type,
  disabled = false,
  onClick,
  selectedTasksCount = 0,
  canLink = true,
  canUnlink = true,
  canLag = true
}) => {
  const { canAccess } = usePermissions();

  // Check if user has permission
  const hasPermission = canAccess('programme.edit');

  // Determine if button should be disabled based on type and logic
  const getIsDisabled = () => {
    if (disabled || !hasPermission) {
      return true;
    }

    switch (type) {
      case 'link':
        return selectedTasksCount < 2 || !canLink;
      case 'unlink':
        return selectedTasksCount < 2 || !canUnlink;
      case 'lag':
        return selectedTasksCount < 2 || !canLag;
      default:
        return false;
    }
  };

  const isDisabled = getIsDisabled();

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'link':
        return LinkIcon;
      case 'unlink':
        return NoSymbolIcon;
      case 'lag':
        return ClockIcon;
      default:
        return LinkIcon;
    }
  };

  // Get tooltip text
  const getTooltip = () => {
    if (selectedTasksCount < 2) {
      return 'Select 2 or more tasks to manage dependencies';
    }

    switch (type) {
      case 'link':
        return selectedTasksCount === 2 
          ? 'Create Finish-to-Start link between tasks'
          : `Create Finish-to-Start links between ${selectedTasksCount} tasks`;
      case 'unlink':
        return selectedTasksCount === 2 
          ? 'Remove dependency between selected tasks'
          : `Remove dependencies between ${selectedTasksCount} tasks`;
      case 'lag':
        return selectedTasksCount === 2 
          ? 'Add or edit lag between linked tasks'
          : `Manage lag for dependencies between ${selectedTasksCount} tasks`;
      default:
        return '';
    }
  };

  // Get button label
  const getLabel = () => {
    switch (type) {
      case 'link':
        return 'Link';
      case 'unlink':
        return 'Unlink';
      case 'lag':
        return 'Lag';
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
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={getTooltip()}
    >
      <IconComponent className="w-5 h-5 text-gray-700" />
      <span className="text-xs text-gray-600 mt-1 font-medium">
        {getLabel()}
      </span>
    </button>
  );
};

export default LinkButton; 