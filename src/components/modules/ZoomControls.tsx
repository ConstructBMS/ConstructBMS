import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassMinusIcon, 
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { zoomService, type ZoomLevel } from '../../services/zoomService';
import { toastService } from './ToastNotification';

interface ZoomControlsProps {
  className?: string;
  containerWidth?: number;
  onZoomChange?: (zoomState: any) => void;
  projectEndDate?: Date;
  projectStartDate?: Date;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomChange,
  projectStartDate,
  projectEndDate,
  containerWidth,
  className = ''
}) => {
  const [currentZoomLevel, setCurrentZoomLevel] = useState<ZoomLevel>(zoomService.getCurrentZoomLevel());
  const [availableLevels, setAvailableLevels] = useState<ZoomLevel[]>(zoomService.getAvailableZoomLevels());
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(zoomService.isInDemoMode());

  useEffect(() => {
    // Set up zoom change listener
    zoomService.onZoomChange = (zoomState) => {
      setCurrentZoomLevel(zoomState.currentLevel);
      if (onZoomChange) {
        onZoomChange(zoomState);
      }
    };

    // Initial setup
    setCurrentZoomLevel(zoomService.getCurrentZoomLevel());
    setAvailableLevels(zoomService.getAvailableZoomLevels());
    setIsDemoMode(zoomService.isInDemoMode());

    return () => {
      zoomService.onZoomChange = undefined as any;
    };
  }, [onZoomChange]);

  // Handle zoom in
  const handleZoomIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const success = await zoomService.zoomIn(true);
      if (!success && isDemoMode) {
        toastService.warning('Demo Mode', 'Upgrade to unlock more detail');
      }
    } catch (error) {
      console.error('Error zooming in:', error);
      toastService.error('Error', 'Failed to zoom in');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle zoom out
  const handleZoomOut = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await zoomService.zoomOut(true);
    } catch (error) {
      console.error('Error zooming out:', error);
      toastService.error('Error', 'Failed to zoom out');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle zoom level change
  const handleZoomLevelChange = async (levelId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const success = await zoomService.zoomToLevel(levelId, true);
      if (!success && isDemoMode) {
        toastService.warning('Demo Mode', 'Upgrade to unlock more detail');
      }
    } catch (error) {
      console.error('Error changing zoom level:', error);
      toastService.error('Error', 'Failed to change zoom level');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle fit to project
  const handleFitToProject = async () => {
    if (isLoading || !projectStartDate || !projectEndDate || !containerWidth) return;

    setIsLoading(true);
    try {
      await zoomService.fitToProject(projectStartDate, projectEndDate, containerWidth);
    } catch (error) {
      console.error('Error fitting to project:', error);
      toastService.error('Error', 'Failed to fit to project');
    } finally {
      setIsLoading(false);
    }
  };

  // Get demo mode configuration
  const demoConfig = zoomService.getDemoModeConfig();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        disabled={isLoading}
        className={`flex items-center px-2 py-1 rounded text-sm font-medium transition-colors ${
          isLoading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        title="Zoom Out"
      >
        <MagnifyingGlassMinusIcon className="w-4 h-4" />
      </button>

      {/* Zoom Level Dropdown */}
      <div className="relative">
        <select
          value={currentZoomLevel.id}
          onChange={(e) => handleZoomLevelChange(e.target.value)}
          disabled={isLoading}
          className={`px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {availableLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
              {isDemoMode && level.id === demoConfig.maxZoomLevel && ' (Max)'}
            </option>
          ))}
        </select>
        
        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"></div>
        )}
      </div>

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        disabled={isLoading}
        className={`flex items-center px-2 py-1 rounded text-sm font-medium transition-colors ${
          isLoading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        title={isDemoMode ? 'Upgrade to unlock more detail' : 'Zoom In'}
      >
        <MagnifyingGlassPlusIcon className="w-4 h-4" />
        {isDemoMode && (
          <ExclamationTriangleIcon className="w-3 h-3 ml-1 text-orange-500" />
        )}
      </button>

      {/* Fit to Project Button */}
      {projectStartDate && projectEndDate && containerWidth && (
        <button
          onClick={handleFitToProject}
          disabled={isLoading}
          className={`flex items-center px-2 py-1 rounded text-sm font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
          title="Fit to Project"
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
        </button>
      )}

      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Demo Mode
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ZoomControls; 