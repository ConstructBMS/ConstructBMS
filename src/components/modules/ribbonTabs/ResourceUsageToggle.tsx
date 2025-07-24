import React from 'react';
import {
  ChartBarIcon,
  Squares2X2Icon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ResourceUsageToggleType = 'usageView' | 'groupByType' | 'groupByTask';

interface ResourceUsageToggleProps {
  disabled?: boolean;
  isActive: boolean;
  loading?: boolean;
  onClick: () => void;
  type: ResourceUsageToggleType;
}

const ResourceUsageToggle: React.FC<ResourceUsageToggleProps> = ({
  type,
  isActive,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const toggleConfig = {
    usageView: {
      icon: ChartBarIcon,
      label: 'Usage View',
      tooltip: 'Show/hide resource usage breakdown panel',
      permission: 'programme.resource.view'
    },
    groupByType: {
      icon: Squares2X2Icon,
      label: 'Group by Type',
      tooltip: 'Group usage by labour, material, or cost',
      permission: 'programme.resource.view'
    },
    groupByTask: {
      icon: BriefcaseIcon,
      label: 'Group by Task',
      tooltip: 'Group usage by task instead of resource',
      permission: 'programme.resource.view'
    }
  };

  const config = toggleConfig[type];
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
        border transition-colors duration-200 rounded
        ${isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600'
        }
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
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
            : isActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isDisabled
          ? 'text-gray-400'
          : isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400'
      }`}>
        {config.label}
      </span>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
      )}
    </button>
  );
};

export default ResourceUsageToggle; 