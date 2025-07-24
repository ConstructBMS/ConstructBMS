import React from 'react';
import { 
  ArrowPathIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ToolsButtonProps {
  type: 'reschedule' | 'progress';
  disabled?: boolean;
  onClick: () => void;
  isActive?: boolean;
}

const ToolsButton: React.FC<ToolsButtonProps> = ({
  type,
  disabled = false,
  onClick,
  isActive = false
}) => {
  const { canAccess } = usePermissions();

  // Check if user has permission
  const getPermissionKey = () => {
    switch (type) {
      case 'reschedule':
        return 'programme.edit';
      case 'progress':
        return 'programme.view';
      default:
        return 'programme.view';
    }
  };

  const hasPermission = canAccess(getPermissionKey());
  const isDisabled = disabled || !hasPermission;

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'reschedule':
        return ArrowPathIcon;
      case 'progress':
        return ChartBarIcon;
      default:
        return ArrowPathIcon;
    }
  };

  // Get tooltip text
  const getTooltip = () => {
    switch (type) {
      case 'reschedule':
        return 'Recalculate dates based on logic';
      case 'progress':
        return 'Toggle visible progress line';
      default:
        return '';
    }
  };

  // Get button label
  const getLabel = () => {
    switch (type) {
      case 'reschedule':
        return 'Reschedule';
      case 'progress':
        return 'Progress';
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
        ${isActive ? 'bg-blue-50 border-blue-400' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={getTooltip()}
    >
      <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-700'}`} />
      <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
        {getLabel()}
      </span>
    </button>
  );
};

export default ToolsButton; 