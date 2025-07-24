import React from 'react';
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ZoneButtonType = 'add' | 'edit' | 'clear';

interface ZoneButtonProps {
  type: ZoneButtonType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ZoneButton: React.FC<ZoneButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    add: {
      icon: PlusCircleIcon,
      label: 'Add',
      tooltip: 'Create a new coloured zone in the timeline',
      permission: 'programme.format.edit',
      color: 'text-green-600'
    },
    edit: {
      icon: PencilSquareIcon,
      label: 'Edit',
      tooltip: 'View and manage all timeline zones',
      permission: 'programme.format.edit',
      color: 'text-blue-600'
    },
    clear: {
      icon: TrashIcon,
      label: 'Clear',
      tooltip: 'Remove all zone highlights',
      permission: 'programme.format.edit',
      color: 'text-red-600'
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

export default ZoneButton; 