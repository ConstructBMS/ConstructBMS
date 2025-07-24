import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ExportPreviewButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onPreview: () => void;
}

const ExportPreviewButton: React.FC<ExportPreviewButtonProps> = ({
  onPreview,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const canExport = canAccess('programme.export.view');
  const isDisabled = disabled || loading || !canExport;

  const handleClick = () => {
    if (!isDisabled) {
      onPreview();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12
        border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-700 rounded
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
        }
      `}
      title="See what the export will look like"
    >
      <EyeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default ExportPreviewButton; 