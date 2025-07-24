import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const TimelineControls = ({
  zoomLevel = 'week',
  onZoomIn,
  onZoomOut,
  onFitToView,
  onScrollToToday,
  isScrollZoomEnabled = true,
  className = ''
}) => {
  const zoomLevels = ['month', 'week', 'day', 'hour'];
  const currentIndex = zoomLevels.indexOf(zoomLevel);

  const isZoomInDisabled = currentIndex >= zoomLevels.length - 1;
  const isZoomOutDisabled = currentIndex <= 0;

  return (
    <div className={`flex items-center justify-between p-3 ${className}`}>
      {/* Left side - Zoom controls */}
      <div className="flex items-center space-x-2">
        {/* Zoom Out Button */}
        <button
          onClick={onZoomOut}
          disabled={isZoomOutDisabled}
          className={`
            flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
            ${isZoomOutDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          `}
          title="Zoom out (Ctrl/Cmd + -)"
        >
          <MagnifyingGlassMinusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Zoom Out</span>
        </button>

        {/* Current Zoom Level Display */}
        <div className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-md">
          <span className="text-sm font-medium text-gray-700">
            {zoomLevel.charAt(0).toUpperCase() + zoomLevel.slice(1)}
          </span>
        </div>

        {/* Zoom In Button */}
        <button
          onClick={onZoomIn}
          disabled={isZoomInDisabled}
          className={`
            flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
            ${isZoomInDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          `}
          title="Zoom in (Ctrl/Cmd + +)"
        >
          <MagnifyingGlassPlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Zoom In</span>
        </button>

        {/* Fit to View Button */}
        <button
          onClick={onFitToView}
          className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          title="Fit to view (F)"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Fit to View</span>
        </button>
      </div>

      {/* Right side - Navigation controls */}
      <div className="flex items-center space-x-2">
        {/* Today Button */}
        <button
          onClick={onScrollToToday}
          className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
          title="Scroll to today (T)"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Today</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={() => {
            onFitToView?.();
            onScrollToToday?.();
          }}
          className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          title="Reset view"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Scroll Zoom Status Indicator */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className={`
          flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
          ${isScrollZoomEnabled
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
          }
        `}>
          <div className={`
            w-2 h-2 rounded-full
            ${isScrollZoomEnabled ? 'bg-green-500' : 'bg-yellow-500'}
          `} />
          <span>{isScrollZoomEnabled ? 'Scroll Zoom Active' : 'Scroll Zoom Disabled'}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineControls; 