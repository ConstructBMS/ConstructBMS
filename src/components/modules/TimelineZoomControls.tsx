import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { timelineZoomService, type TimelineZoomSettings } from '../../services/timelineZoomService';
import { demoModeService } from '../../services/demoModeService';

interface TimelineZoomControlsProps {
  className?: string;
  onScrollChange?: (position: { x: number; y: number }) => void;
  onZoomChange?: (settings: TimelineZoomSettings) => void;
  projectId: string;
}

const TimelineZoomControls: React.FC<TimelineZoomControlsProps> = ({
  projectId,
  onZoomChange,
  onScrollChange,
  className = ''
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<TimelineZoomSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableScales, setAvailableScales] = useState<Array<{ description: string, label: string; value: 'hour' | 'day' | 'week' | 'month'; }>>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const canView = canAccess('programme.view.zoom');
  const canPersist = canAccess('programme.view.persist-zoom');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      setAvailableScales(timelineZoomService.getAvailableScales(isDemo));
    };
    checkDemoMode();
  }, []);

  // Load current zoom settings
  useEffect(() => {
    const loadZoomSettings = async () => {
      try {
        setLoading(true);
        const settings = await timelineZoomService.getProjectZoomSettings(projectId);
        setCurrentSettings(settings);
        onZoomChange?.(settings);
      } catch (error) {
        console.error('Error loading zoom settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadZoomSettings();
  }, [projectId, onZoomChange]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for Ctrl/Cmd key
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault();
            handleZoomIn();
            break;
          case '-':
            event.preventDefault();
            handleZoomOut();
            break;
        }
      } else {
        switch (event.key.toLowerCase()) {
          case 't':
            event.preventDefault();
            handleScrollToToday();
            break;
          case 'f':
            event.preventDefault();
            handleFitToView();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSettings]);

  // Handle zoom in
  const handleZoomIn = async () => {
    if (!canView || !currentSettings || loading) return;
    
    try {
      setLoading(true);
      const result = await timelineZoomService.zoomIn(projectId);
      
      if (result.success && result.settings) {
        setCurrentSettings(result.settings);
        onZoomChange?.(result.settings);
      } else {
        console.warn(result.error || 'Failed to zoom in');
      }
    } catch (error) {
      console.error('Error zooming in:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle zoom out
  const handleZoomOut = async () => {
    if (!canView || !currentSettings || loading) return;
    
    try {
      setLoading(true);
      const result = await timelineZoomService.zoomOut(projectId);
      
      if (result.success && result.settings) {
        setCurrentSettings(result.settings);
        onZoomChange?.(result.settings);
      } else {
        console.warn(result.error || 'Failed to zoom out');
      }
    } catch (error) {
      console.error('Error zooming out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle reset zoom
  const handleResetZoom = async () => {
    if (!canView || !currentSettings || loading) return;
    
    try {
      setLoading(true);
      const result = await timelineZoomService.resetZoom(projectId);
      
      if (result.success && result.settings) {
        setCurrentSettings(result.settings);
        onZoomChange?.(result.settings);
      } else {
        console.warn(result.error || 'Failed to reset zoom');
      }
    } catch (error) {
      console.error('Error resetting zoom:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle time scale change
  const handleTimeScaleChange = async (scale: 'hour' | 'day' | 'week' | 'month') => {
    if (!canView || !currentSettings || loading) return;
    
    try {
      setLoading(true);
      const result = await timelineZoomService.changeTimeScale(projectId, scale);
      
      if (result.success && result.settings) {
        setCurrentSettings(result.settings);
        onZoomChange?.(result.settings);
      } else {
        console.warn(result.error || 'Failed to change time scale');
      }
    } catch (error) {
      console.error('Error changing time scale:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll to today
  const handleScrollToToday = async () => {
    if (!canView || !currentSettings || loading) return;
    
    try {
      setLoading(true);
      const result = await timelineZoomService.scrollToToday(projectId);
      
      if (result.success && result.scrollPosition) {
        onScrollChange?.(result.scrollPosition);
      } else {
        console.warn(result.error || 'Failed to scroll to today');
      }
    } catch (error) {
      console.error('Error scrolling to today:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll to date
  const handleScrollToDate = async () => {
    if (!canView || !currentSettings || loading || !selectedDate) return;
    
    try {
      setLoading(true);
      const targetDate = new Date(selectedDate);
      const result = await timelineZoomService.scrollToDate(projectId, targetDate);
      
      if (result.success && result.scrollPosition) {
        onScrollChange?.(result.scrollPosition);
        setShowDatePicker(false);
        setSelectedDate('');
      } else {
        console.warn(result.error || 'Failed to scroll to date');
      }
    } catch (error) {
      console.error('Error scrolling to date:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle fit to view
  const handleFitToView = async () => {
    if (!canView || !currentSettings || loading) return;
    
    try {
      setLoading(true);
      // This would typically get tasks from the current project
      const sampleTasks = [
        { startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      ];
      
      const result = await timelineZoomService.fitToView(projectId, sampleTasks);
      
      if (result.success && result.settings) {
        setCurrentSettings(result.settings);
        onZoomChange?.(result.settings);
      } else {
        console.warn(result.error || 'Failed to fit to view');
      }
    } catch (error) {
      console.error('Error fitting to view:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get zoom level display
  const getZoomLevelDisplay = (): string => {
    if (!currentSettings) return 'Week View';
    return timelineZoomService.getZoomLevelDisplayName(currentSettings.zoomLevel);
  };

  // Get scale display
  const getScaleDisplay = (): string => {
    if (!currentSettings) return 'Week';
    return timelineZoomService.getScaleDisplayName(currentSettings.zoomLevel);
  };

  // Check if zoom in is disabled
  const isZoomInDisabled = () => {
    if (!currentSettings || loading) return true;
    if (isDemoMode && currentSettings.zoomLevel === 'day') return true;
    return currentSettings.zoomLevel === 'hour';
  };

  // Check if zoom out is disabled
  const isZoomOutDisabled = () => {
    if (!currentSettings || loading) return true;
    if (isDemoMode && currentSettings.zoomLevel === 'week') return true;
    return currentSettings.zoomLevel === 'month';
  };

  if (!canView) return null;

  return (
    <div className={`flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        disabled={isZoomInDisabled()}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${isZoomInDisabled()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        `}
        title={
          isDemoMode && currentSettings?.zoomLevel === 'day'
            ? 'DEMO ZOOM CONTROL – Upgrade to unlock full range'
            : 'Zoom in (Ctrl/Cmd + +)'
        }
      >
        <MagnifyingGlassPlusIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Zoom In</span>
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        disabled={isZoomOutDisabled()}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${isZoomOutDisabled()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        `}
        title="Zoom out (Ctrl/Cmd + -)"
      >
        <MagnifyingGlassMinusIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Zoom Out</span>
      </button>

      {/* Fit to View Button */}
      <button
        onClick={handleFitToView}
        disabled={loading || !currentSettings || isDemoMode}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${loading || !currentSettings || isDemoMode
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }
        `}
        title={
          isDemoMode
            ? 'DEMO ZOOM CONTROL – Upgrade to unlock full range'
            : 'Fit to view (F)'
        }
      >
        <MagnifyingGlassIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Fit to View</span>
      </button>

      {/* Today Button */}
      <button
        onClick={handleScrollToToday}
        disabled={loading || !currentSettings}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${loading || !currentSettings
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
          }
        `}
        title="Scroll to today (T)"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Today</span>
      </button>

      {/* Scroll to Date Button */}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          disabled={loading || !currentSettings || isDemoMode}
          className={`
            flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
            ${loading || !currentSettings || isDemoMode
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
            }
          `}
          title={
            isDemoMode
              ? 'DEMO ZOOM CONTROL – Upgrade to unlock full range'
              : 'Scroll to date'
          }
        >
          <ClockIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Date</span>
        </button>

        {/* Date Picker Dropdown */}
        {showDatePicker && !isDemoMode && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-3 min-w-[200px]">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Date:
              </label>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select date"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleScrollToDate}
                  disabled={!selectedDate || loading}
                  className={`
                    flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${!selectedDate || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  Go
                </button>
                <button
                  onClick={() => {
                    setShowDatePicker(false);
                    setSelectedDate('');
                  }}
                  className="flex-1 px-3 py-2 text-sm font-medium bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Scale Dropdown */}
      <div className="relative">
        <select
          value={currentSettings?.zoomLevel || 'week'}
          onChange={(e) => handleTimeScaleChange(e.target.value as any)}
          disabled={!canView || loading || !currentSettings || isDemoMode}
          className={`
            appearance-none px-3 py-2 pr-8 rounded-md text-sm font-medium transition-colors duration-200
            ${!canView || loading || !currentSettings || isDemoMode
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-900 border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            }
          `}
        >
          {availableScales.map(scale => (
            <option key={scale.value} value={scale.value}>
              {scale.label}
            </option>
          ))}
        </select>
        <ClockIcon className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Current Zoom Level Display */}
      <div className="px-3 py-2 bg-gray-100 rounded-md">
        <div className="text-sm font-medium text-gray-900">
          {getZoomLevelDisplay()}
        </div>
        <div className="text-xs text-gray-500">
          {getScaleDisplay()}
        </div>
      </div>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-md">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-yellow-800 font-medium">DEMO</span>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center space-x-1 px-2 py-1">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default TimelineZoomControls; 