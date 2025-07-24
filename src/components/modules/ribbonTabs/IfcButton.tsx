import React from 'react';
import {
  CloudArrowUpIcon,
  LinkIcon,
  LinkSlashIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type IfcButtonType = 'upload' | 'sync' | 'unlink';

interface IfcButtonProps {
  type: IfcButtonType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const IfcButton: React.FC<IfcButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    upload: {
      icon: CloudArrowUpIcon,
      label: 'Upload',
      tooltip: 'Upload a 3D BIM model in .IFC format',
      permission: 'programme.4d.upload',
      color: 'text-blue-600'
    },
    sync: {
      icon: LinkIcon,
      label: 'Sync',
      tooltip: 'Map programme tasks to model components',
      permission: 'programme.4d.edit',
      color: 'text-green-600'
    },
    unlink: {
      icon: LinkSlashIcon,
      label: 'Unlink',
      tooltip: 'Remove the model and clear task mappings',
      permission: 'programme.4d.delete',
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

export default IfcButton; 