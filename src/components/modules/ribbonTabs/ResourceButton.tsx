import React from 'react';
import {
  PlusCircleIcon,
  MinusCircleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ResourceButtonType = 'assign' | 'unassign';

interface ResourceButtonProps {
  type: ResourceButtonType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ResourceButton: React.FC<ResourceButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    assign: {
      icon: PlusCircleIcon,
      label: 'Assign',
      tooltip: 'Add labour, material, or cost to task',
      permission: 'programme.resource.edit'
    },
    unassign: {
      icon: MinusCircleIcon,
      label: 'Unassign',
      tooltip: 'Remove selected resource(s)',
      permission: 'programme.resource.edit'
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
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
      `}
      title={config.tooltip}
    >
      <IconComponent
        className={`w-5 h-5 ${
          isDisabled
            ? 'text-gray-400'
            : type === 'assign'
              ? 'text-green-600'
              : 'text-red-600'
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isDisabled
          ? 'text-gray-400'
          : type === 'assign'
            ? 'text-green-600'
            : 'text-red-600'
      }`}>
        {config.label}
      </span>
    </button>
  );
};

export default ResourceButton; 