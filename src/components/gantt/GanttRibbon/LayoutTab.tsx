import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ViewColumnsIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

export const LayoutTab: React.FC = () => {
  const { state, updateLayoutSettings, resetToDefaults } = useProjectView();
  const { layoutSettings } = state;
  const { canAccess } = usePermissions();
  
  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const can = (key: string) => canAccess(`gantt.layout.${key}`);

  const handleLayoutUpdate = (updates: Partial<typeof layoutSettings>) => {
    if (!can('update')) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for layout updates'
      });
      return;
    }

    try {
      updateLayoutSettings(updates);
      setOperationStatus({
        type: 'success',
        message: 'Layout settings updated successfully'
      });
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: `Failed to update layout: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleResetLayout = () => {
    if (!can('reset')) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for layout reset'
      });
      return;
    }

    try {
      resetToDefaults();
      setOperationStatus({
        type: 'success',
        message: 'Layout reset to default settings'
      });
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: `Failed to reset layout: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleZoomChange = (zoomLevel: 'day' | 'week' | 'month') => {
    handleLayoutUpdate({ zoomLevel });
  };

  const handleToggleGrid = () => {
    handleLayoutUpdate({ showGrid: !layoutSettings.showGrid });
  };

  const handleToggleDependencies = () => {
    handleLayoutUpdate({ showDependencies: !layoutSettings.showDependencies });
  };

  const handleToggleCriticalPath = () => {
    handleLayoutUpdate({ showCriticalPath: !layoutSettings.showCriticalPath });
  };

  const handleToggleProgress = () => {
    handleLayoutUpdate({ showProgress: !layoutSettings.showProgress });
  };

  const handleToggleResources = () => {
    handleLayoutUpdate({ showResources: !layoutSettings.showResources });
  };

  const handleRowHeightChange = (increment: number) => {
    const newHeight = Math.max(16, Math.min(80, layoutSettings.rowHeight + increment));
    handleLayoutUpdate({ rowHeight: newHeight });
  };

  const openModal = (id: string) => setModal(id);

  // Clear status message after 3 seconds
  React.useEffect(() => {
    if (operationStatus) {
      const timer = setTimeout(() => setOperationStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Zoom Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleZoomChange('day')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.zoomLevel === 'day' 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white hover:bg-blue-50'
              }`}
              title="Day View"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Day</span>
            </button>
            <button
              onClick={() => handleZoomChange('week')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.zoomLevel === 'week' 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white hover:bg-blue-50'
              }`}
              title="Week View"
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Week</span>
            </button>
            <button
              onClick={() => handleZoomChange('month')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.zoomLevel === 'month' 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white hover:bg-blue-50'
              }`}
              title="Month View"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Month</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Zoom</div>
        </div>

        {/* Display Options */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={handleToggleGrid}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.showGrid 
                  ? 'bg-green-100 border-green-500 text-green-700' 
                  : 'bg-white hover:bg-green-50'
              }`}
              title="Toggle Grid"
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Grid</span>
            </button>
            <button
              onClick={handleToggleDependencies}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.showDependencies 
                  ? 'bg-purple-100 border-purple-500 text-purple-700' 
                  : 'bg-white hover:bg-purple-50'
              }`}
              title="Toggle Dependencies"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Links</span>
            </button>
            <button
              onClick={handleToggleCriticalPath}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.showCriticalPath 
                  ? 'bg-red-100 border-red-500 text-red-700' 
                  : 'bg-white hover:bg-red-50'
              }`}
              title="Toggle Critical Path"
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Critical</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Display</div>
        </div>

        {/* Additional Display Options */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={handleToggleProgress}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.showProgress 
                  ? 'bg-yellow-100 border-yellow-500 text-yellow-700' 
                  : 'bg-white hover:bg-yellow-50'
              }`}
              title="Toggle Progress"
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Progress</span>
            </button>
            <button
              onClick={handleToggleResources}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                layoutSettings.showResources 
                  ? 'bg-orange-100 border-orange-500 text-orange-700' 
                  : 'bg-white hover:bg-orange-50'
              }`}
              title="Toggle Resources"
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Resources</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Options</div>
        </div>

        {/* Row Height Controls */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleRowHeightChange(-4)}
              disabled={layoutSettings.rowHeight <= 16}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Decrease Row Height"
            >
              <MagnifyingGlassMinusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Smaller</span>
            </button>
            <button
              onClick={() => handleRowHeightChange(4)}
              disabled={layoutSettings.rowHeight >= 80}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Increase Row Height"
            >
              <MagnifyingGlassPlusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Larger</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Row Height</div>
        </div>

        {/* Reset Layout */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={handleResetLayout}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors"
              title="Reset to Default Layout"
            >
              <ArrowPathIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Reset</span>
            </button>
            <button
              onClick={() => openModal('layout-info')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Layout Information"
            >
              <InformationCircleIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Info</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Actions</div>
        </div>

        {/* Current Settings Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Zoom: {layoutSettings.zoomLevel.charAt(0).toUpperCase() + layoutSettings.zoomLevel.slice(1)}
          </div>
          <div className="text-xs text-gray-500">
            Row Height: {layoutSettings.rowHeight}px
          </div>
          <div className="text-xs text-gray-500">
            Grid: {layoutSettings.showGrid ? 'On' : 'Off'}
          </div>
          <div className="text-xs text-gray-500">
            Dependencies: {layoutSettings.showDependencies ? 'On' : 'Off'}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {operationStatus && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
          operationStatus.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          operationStatus.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            {operationStatus.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : operationStatus.type === 'error' ? (
              <ExclamationTriangleIcon className="h-5 w-5" />
            ) : (
              <InformationCircleIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{operationStatus.message}</span>
            <button
              onClick={() => setOperationStatus(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace('-', ' ')} Manager
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {modal === 'layout-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Layout Configuration Information</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Zoom Levels:</strong> Control the timeline scale (Day, Week, Month).</p>
                  <p><strong>Display Options:</strong> Toggle grid lines, dependency arrows, critical path highlighting, progress bars, and resource allocation.</p>
                  <p><strong>Row Height:</strong> Adjust the vertical spacing of task rows for better visibility.</p>
                  <p><strong>Reset Layout:</strong> Restore all layout settings to their default values.</p>
                  <p><strong>Persistence:</strong> All layout settings are automatically saved and restored between sessions.</p>
                  <p><strong>Real-time Updates:</strong> Changes are applied immediately to the Gantt chart view.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-800 mb-2">Current Settings:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Zoom Level: {layoutSettings.zoomLevel}</div>
                    <div>Row Height: {layoutSettings.rowHeight}px</div>
                    <div>Show Grid: {layoutSettings.showGrid ? 'Yes' : 'No'}</div>
                    <div>Show Dependencies: {layoutSettings.showDependencies ? 'Yes' : 'No'}</div>
                    <div>Show Critical Path: {layoutSettings.showCriticalPath ? 'Yes' : 'No'}</div>
                    <div>Show Progress: {layoutSettings.showProgress ? 'Yes' : 'No'}</div>
                    <div>Show Resources: {layoutSettings.showResources ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 