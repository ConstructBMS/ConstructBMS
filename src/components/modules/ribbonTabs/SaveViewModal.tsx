import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { ViewConfig } from '../../../services/viewService';

interface SaveViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (viewName: string, isShared: boolean, config: ViewConfig) => void;
  currentConfig: ViewConfig;
  isDemoMode?: boolean;
}

const SaveViewModal: React.FC<SaveViewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  isDemoMode = false
}) => {
  const [viewName, setViewName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  const handleSave = async () => {
    if (!viewName.trim()) {
      alert('Please enter a view name');
      return;
    }

    if (!canEdit) {
      alert('You don\'t have permission to save views');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(viewName.trim(), isShared, currentConfig);
      onClose();
    } catch (error) {
      console.error('Failed to save view:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setViewName('');
    setIsShared(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <EyeIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Save Current View</h2>
              <p className="text-sm text-gray-500">Save the current layout as a new view</p>
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

        {/* Form */}
        <div className="p-6">
          <div className="space-y-6">
            {/* View Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Name
              </label>
              <input
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter view name"
                disabled={!canEdit}
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={!isShared}
                    onChange={() => setIsShared(false)}
                    disabled={!canEdit}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-sm text-gray-500">Only visible to you</div>
                    </div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="shared"
                    checked={isShared}
                    onChange={() => setIsShared(true)}
                    disabled={!canEdit || isDemoMode}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Shared</div>
                      <div className="text-sm text-gray-500">Visible to all project members</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Current Configuration Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Configuration
              </label>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Filters:</span> {currentConfig.filters.length} active
                </div>
                <div className="text-sm">
                  <span className="font-medium">Visible Fields:</span> {currentConfig.visibleFields.length} fields
                </div>
                <div className="text-sm">
                  <span className="font-medium">Zoom Level:</span> {currentConfig.zoomLevel}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Float Options:</span> {
                    Object.values(currentConfig.floatOptions || {}).filter(Boolean).length
                  } enabled
                </div>
              </div>
            </div>

            {/* Demo Mode Warning */}
            {isDemoMode && (
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Demo Mode</h4>
                <p className="text-sm text-yellow-800">
                  Views saved in demo mode will be reset when switching to live mode.
                  Shared views cannot be created in demo mode.
                </p>
              </div>
            )}

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to save views.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={isLoading || !viewName.trim()}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading || !viewName.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Saving...' : 'Save View'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveViewModal; 