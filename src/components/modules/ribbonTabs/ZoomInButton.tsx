import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ZoomInButtonProps {
  onZoomIn: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ZoomInButton: React.FC<ZoomInButtonProps> = ({
  onZoomIn,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const canView = canAccess('programme.format.view') || canAccess('programme.format.edit');
  const isDisabled = disabled || loading || !canView;

  const handleClick = () => {
    if (!isDisabled) {
      onZoomIn();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-10 h-10
        border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-700 rounded
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
        }
      `}
      title="Zoom in on the timeline view"
    >
      <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default ZoomInButton; 