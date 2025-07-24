import React from 'react';
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ResetGridColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

const ResetGridColumnsModal: React.FC<ResetGridColumnsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const canView = canAccess('programme.view');
  const isDisabled = disabled || !canView;

  const handleConfirm = () => {
    if (!isDisabled) {
      onConfirm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Reset Grid Columns
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start mb-4">
            <ArrowPathIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Are you sure you want to reset your grid layout to default?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This will restore:
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4 list-disc">
                <li>Default column order</li>
                <li>Default column widths</li>
                <li>Default column visibility</li>
                <li>All custom column settings</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ This action cannot be undone. All custom grid settings will be lost.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Columns
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetGridColumnsModal; 