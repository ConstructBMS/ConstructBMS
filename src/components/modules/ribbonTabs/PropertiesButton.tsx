import React from 'react';
import { 
  CogIcon, 
  PencilIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type PropertiesButtonType = 'manage' | 'edit';

interface PropertiesButtonProps {
  type: PropertiesButtonType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const PropertiesButton: React.FC<PropertiesButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  // Define button configurations
  const buttonConfig = {
    manage: {
      icon: CogIcon,
      label: 'Manage Fields',
      tooltip: 'Define new task-level properties',
      permission: 'programme.edit'
    },
    edit: {
      icon: PencilIcon,
      label: 'Edit Values',
      tooltip: 'Set values for selected task(s)',
      permission: 'programme.edit'
    }
  };

  const config = buttonConfig[type];
  const IconComponent = config.icon;
  const hasPermission = canAccess(config.permission);
  const isDisabled = disabled || !hasPermission || loading;

  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12 
        border border-gray-300 bg-white hover:bg-gray-50 
        transition-colors duration-200 rounded
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:border-gray-400'
        }
        ${loading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={config.tooltip}
    >
      <IconComponent className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`} />
      <span className={`text-xs font-medium mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
        {config.label}
      </span>
    </button>
  );
};

export default PropertiesButton; 