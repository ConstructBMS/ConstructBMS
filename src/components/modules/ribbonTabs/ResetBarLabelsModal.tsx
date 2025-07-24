import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ResetBarLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDemoMode?: boolean;
}

const ResetBarLabelsModal: React.FC<ResetBarLabelsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDemoMode = false
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reset Bar Labels</h2>
              <p className="text-sm text-gray-500">Restore default bar label configuration</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Reset to Default</h4>
              <p className="text-sm text-yellow-800">
                This will reset all bar label settings to the system default configuration.
                Any custom label settings will be lost.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Default Configuration</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <div>• Top Label: Task ID</div>
                <div>• Bar Label: Task Name</div>
                <div>• Bottom Label: (None)</div>
              </div>
            </div>

            {isDemoMode && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Mode</h4>
                <p className="text-sm text-blue-800">
                  Bar label settings in demo mode will be reset when switching to live mode.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Reset Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetBarLabelsModal; 