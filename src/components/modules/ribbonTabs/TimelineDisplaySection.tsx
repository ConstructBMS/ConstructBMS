import React from 'react';
import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface TimelineDisplaySectionProps {
  availableScales: Array<{ description: string, label: string; value: 'hour' | 'day' | 'week' | 'month'; }>;
  currentZoomLevel: 'hour' | 'day' | 'week' | 'month';
  disabled?: boolean;
  isDemoMode: boolean;
  loading?: {
    fitToView?: boolean;
    scrollToDate?: boolean;
    scrollToToday?: boolean;
    timeScale?: boolean;
    zoomIn?: boolean;
    zoomOut?: boolean;
  };
  onFitToView: () => void;
  onScrollToDate: (date: Date) => void;
  onScrollToToday: () => void;
  onTimeScaleChange: (scale: 'hour' | 'day' | 'week' | 'month') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const TimelineDisplaySection: React.FC<TimelineDisplaySectionProps> = ({
  onZoomIn,
  onZoomOut,
  onFitToView,
  onScrollToToday,
  onScrollToDate,
  onTimeScaleChange,
  currentZoomLevel,
  availableScales,
  isDemoMode,
  disabled = false,
  loading = {}
}) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState('');

  const handleScrollToDate = () => {
    if (selectedDate) {
      onScrollToDate(new Date(selectedDate));
      setShowDatePicker(false);
      setSelectedDate('');
    }
  };

  const isZoomInDisabled = () => {
    if (disabled || loading.zoomIn) return true;
    if (isDemoMode && currentZoomLevel === 'day') return true;
    return currentZoomLevel === 'hour';
  };

  const isZoomOutDisabled = () => {
    if (disabled || loading.zoomOut) return true;
    if (isDemoMode && currentZoomLevel === 'week') return true;
    return currentZoomLevel === 'month';
  };

  return (
    <section className="ribbon-section w-auto">
      <div className="ribbon-buttons flex items-center space-x-1">
        {/* Zoom In Button */}
        <button
          onClick={onZoomIn}
          disabled={isZoomInDisabled()}
          className={`
            ribbon-button flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium transition-colors
            ${isZoomInDisabled()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500'
            }
          `}
          title={
            isDemoMode && currentZoomLevel === 'day'
              ? 'DEMO ZOOM CONTROL – Upgrade to unlock full range'
              : 'Zoom in (Ctrl/Cmd + +)'
          }
        >
          <MagnifyingGlassPlusIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Zoom In</span>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={onZoomOut}
          disabled={isZoomOutDisabled()}
          className={`
            ribbon-button flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium transition-colors
            ${isZoomOutDisabled()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500'
            }
          `}
          title="Zoom out (Ctrl/Cmd + -)"
        >
          <MagnifyingGlassMinusIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Zoom Out</span>
        </button>

        {/* Fit to View Button */}
        <button
          onClick={onFitToView}
          disabled={disabled || loading.fitToView || isDemoMode}
          className={`
            ribbon-button flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium transition-colors
            ${disabled || loading.fitToView || isDemoMode
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500'
            }
          `}
          title={
            isDemoMode
              ? 'DEMO ZOOM CONTROL – Upgrade to unlock full range'
              : 'Fit to view (F)'
          }
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Fit to View</span>
        </button>

        {/* Today Button */}
        <button
          onClick={onScrollToToday}
          disabled={disabled || loading.scrollToToday}
          className={`
            ribbon-button flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium transition-colors
            ${disabled || loading.scrollToToday
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500'
            }
          `}
          title="Scroll to today (T)"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Today</span>
        </button>

        {/* Scroll to Date Button */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            disabled={disabled || loading.scrollToDate || isDemoMode}
            className={`
              ribbon-button flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium transition-colors
              ${disabled || loading.scrollToDate || isDemoMode
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-500'
              }
            `}
            title={
              isDemoMode
                ? 'DEMO ZOOM CONTROL – Upgrade to unlock full range'
                : 'Scroll to date'
            }
          >
            <ClockIcon className="w-4 h-4" />
            <span className="hidden lg:inline">Date</span>
          </button>

          {/* Date Picker Dropdown */}
          {showDatePicker && !isDemoMode && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-3 min-w-[200px]">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select date"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleScrollToDate}
                    disabled={!selectedDate || loading.scrollToDate}
                    className={`
                      flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${!selectedDate || loading.scrollToDate
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
            value={currentZoomLevel}
            onChange={(e) => onTimeScaleChange(e.target.value as any)}
            disabled={disabled || loading.timeScale || isDemoMode}
            className={`
              appearance-none px-2 py-1 pr-6 rounded text-sm font-medium transition-colors
              ${disabled || loading.timeScale || isDemoMode
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-900 border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
              }
            `}
          >
            {availableScales.map(scale => (
              <option key={scale.value} value={scale.value}>
                {scale.label}
              </option>
            ))}
          </select>
          <ClockIcon className="absolute right-1 top-1.5 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-md">
            <ExclamationTriangleIcon className="w-3 h-3 text-yellow-600" />
            <span className="text-xs text-yellow-800 font-medium">DEMO</span>
          </div>
        )}
      </div>
      
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Timeline Zoom & Scroll
      </div>
    </section>
  );
};

export default TimelineDisplaySection; 