import React from 'react';
import {
  ListBulletIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type SummaryButtonType = 'task' | 'resource';

interface SummaryButtonProps {
  type: SummaryButtonType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const SummaryButton: React.FC<SummaryButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    task: {
      icon: ListBulletIcon,
      label: 'By Task',
      tooltip: 'Show all resources allocated per task',
      permission: 'programme.resource.view',
      color: 'text-blue-600'
    },
    resource: {
      icon: UsersIcon,
      label: 'By Resource',
      tooltip: 'Show all tasks using each resource',
      permission: 'programme.resource.view',
      color: 'text-green-600'
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
      <IconComponent
        className={`w-5 h-5 ${
          isDisabled
            ? 'text-gray-400'
            : config.color
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isDisabled
          ? 'text-gray-400'
          : config.color
      }`}>
        {config.label}
      </span>
    </button>
  );
};

export default SummaryButton; 