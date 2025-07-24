import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useProjectView } from '../../contexts/ProjectViewContext';

export const TimelineZoomControls: React.FC = () => {
  const { state, updateLayoutSettings } = useProjectView();
  const { zoomLevel } = state.layoutSettings;

  const handleZoomChange = (newZoom: 'day' | 'week' | 'month') => {
    updateLayoutSettings({ zoomLevel: newZoom });
  };

  const handleZoomIn = () => {
    if (zoomLevel === 'month') handleZoomChange('week');
    else if (zoomLevel === 'week') handleZoomChange('day');
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'day') handleZoomChange('week');
    else if (zoomLevel === 'week') handleZoomChange('month');
  };

  const canZoomIn = zoomLevel !== 'day';
  const canZoomOut = zoomLevel !== 'month';

  return (
    <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm text-sm text-gray-700">
      <button 
        onClick={handleZoomOut} 
        disabled={!canZoomOut}
        className={`p-1.5 rounded transition-colors ${
          canZoomOut 
            ? 'hover:bg-gray-100 hover:text-gray-900' 
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Zoom Out"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      
      <span className="font-medium min-w-[40px] text-center">
        {zoomLevel.toUpperCase()}
      </span>
      
      <button 
        onClick={handleZoomIn} 
        disabled={!canZoomIn}
        className={`p-1.5 rounded transition-colors ${
          canZoomIn 
            ? 'hover:bg-gray-100 hover:text-gray-900' 
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Zoom In"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}; 