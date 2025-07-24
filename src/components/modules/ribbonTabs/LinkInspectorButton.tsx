import React from 'react';
import { EyeDropperIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface LinkInspectorButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

const LinkInspectorButton: React.FC<LinkInspectorButtonProps> = ({
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.4d.edit');
  const isDisabled = disabled || !canEdit || loading;

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
      title="View and manage task-to-IFC connections"
    >
      <EyeDropperIcon
        className={`w-5 h-5 ${
          isDisabled
            ? 'text-gray-400'
            : 'text-purple-600'
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isDisabled
          ? 'text-gray-400'
          : 'text-purple-600'
      }`}>
        Inspect
      </span>
    </button>
  );
};

export default LinkInspectorButton; 