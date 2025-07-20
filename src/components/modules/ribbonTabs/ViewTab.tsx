import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ViewColumnsIcon,
  ClockIcon,
  LinkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EyeIcon,
  EyeSlashIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

// Types for view operations
export interface ViewOperation {
  type: 'zoom-in' | 'zoom-out' | 'toggle-gridlines' | 'toggle-timeline-band' | 'toggle-task-links' | 'toggle-float' | 'fit-to-screen' | 'reset-view';
  data?: any;
}

// View state interface
export interface ViewState {
  zoomLevel: number;
  showGridlines: boolean;
  showTimelineBand: boolean;
  showTaskLinks: boolean;
  showFloat: boolean;
}

interface ViewTabProps {
  onViewOperation: (operation: ViewOperation) => void;
  userRole: string;
  currentViewState: ViewState;
  onViewStateChange: (newState: Partial<ViewState>) => void;
}

const ViewTab: React.FC<ViewTabProps> = ({
  onViewOperation,
  userRole,
  currentViewState,
  onViewStateChange
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Check if user can perform actions (not viewer)
  const isViewer = userRole === 'viewer';

  // Zoom levels for the dropdown
  const zoomLevels = [
    { id: '25', label: '25%', value: 25 },
    { id: '50', label: '50%', value: 50 },
    { id: '75', label: '75%', value: 75 },
    { id: '100', label: '100%', value: 100 },
    { id: '125', label: '125%', value: 125 },
    { id: '150', label: '150%', value: 150 },
    { id: '200', label: '200%', value: 200 },
    { id: '300', label: '300%', value: 300 },
    { id: '400', label: '400%', value: 400 },
    { id: '500', label: '500%', value: 500 }
  ];

  const handleDropdownToggle = (dropdownId: string) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-4 py-2 space-x-6">
        
        {/* Zoom Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Zoom</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                const newZoom = Math.min(currentViewState.zoomLevel + 25, 500);
                onViewStateChange({ zoomLevel: newZoom });
                onViewOperation({ type: 'zoom-in', data: { zoomLevel: newZoom } });
              }}
              disabled={isViewer || currentViewState.zoomLevel >= 500}
                              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isViewer || currentViewState.zoomLevel >= 500
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              title="Zoom in"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                const newZoom = Math.max(currentViewState.zoomLevel - 25, 25);
                onViewStateChange({ zoomLevel: newZoom });
                onViewOperation({ type: 'zoom-out', data: { zoomLevel: newZoom } });
              }}
              disabled={isViewer || currentViewState.zoomLevel <= 25}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer || currentViewState.zoomLevel <= 25
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Zoom out"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle('zoom')}
                disabled={isViewer}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isViewer
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Select zoom level"
              >
                {currentViewState.zoomLevel}%
              </button>
              
              {activeDropdown === 'zoom' && !isViewer && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-[120px]">
                  {zoomLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => {
                        onViewStateChange({ zoomLevel: level.value });
                        onViewOperation({ type: 'zoom-in', data: { zoomLevel: level.value } });
                        setActiveDropdown(null);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        level.value === currentViewState.zoomLevel
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                onViewStateChange({ zoomLevel: 100 });
                onViewOperation({ type: 'fit-to-screen', data: { zoomLevel: 100 } });
              }}
              disabled={isViewer}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Fit to screen"
            >
              <ArrowsPointingInIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visibility Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Visibility</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                const newState = !currentViewState.showGridlines;
                onViewStateChange({ showGridlines: newState });
                onViewOperation({ type: 'toggle-gridlines', data: { show: newState } });
              }}
              disabled={isViewer}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : currentViewState.showGridlines
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle gridlines"
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                const newState = !currentViewState.showTimelineBand;
                onViewStateChange({ showTimelineBand: newState });
                onViewOperation({ type: 'toggle-timeline-band', data: { show: newState } });
              }}
              disabled={isViewer}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : currentViewState.showTimelineBand
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle timeline band"
            >
              <ClockIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                const newState = !currentViewState.showTaskLinks;
                onViewStateChange({ showTaskLinks: newState });
                onViewOperation({ type: 'toggle-task-links', data: { show: newState } });
              }}
              disabled={isViewer}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : currentViewState.showTaskLinks
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle task links"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                const newState = !currentViewState.showFloat;
                onViewStateChange({ showFloat: newState });
                onViewOperation({ type: 'toggle-float', data: { show: newState } });
              }}
              disabled={isViewer}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : currentViewState.showFloat
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle float display"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Display</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                onViewOperation({ type: 'reset-view' });
                onViewStateChange({
                  zoomLevel: 100,
                  showGridlines: true,
                  showTimelineBand: true,
                  showTaskLinks: true,
                  showFloat: false
                });
              }}
              disabled={isViewer}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Reset view to defaults"
            >
              Reset View
            </button>
            
            <button
              onClick={() => {
                // Toggle fullscreen
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              disabled={isViewer}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isViewer
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle fullscreen"
            >
              <ComputerDesktopIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTab; 