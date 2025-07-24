import React from 'react';
import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon, 
  ViewColumnsIcon, 
  EyeIcon, 
  EyeSlashIcon,
  AdjustmentsHorizontalIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CalendarDaysIcon as MonthIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ViewRibbonTabProps {
  layoutSettings: {
    rowHeight: number;
    showCriticalPath: boolean;
    showDependencies: boolean;
    showGrid: boolean;
    showProgress: boolean;
    showResources: boolean;
    zoomLevel: 'day' | 'week' | 'month';
  };
  onExpandCollapseAll?: ((expand: boolean) => void) | undefined;
  onLayoutSettingsChange: (settings: Partial<ViewRibbonTabProps['layoutSettings']>) => void;
  onResetLayout?: (() => void) | undefined;
}

export const ViewRibbonTab: React.FC<ViewRibbonTabProps> = ({ 
  layoutSettings, 
  onLayoutSettingsChange,
  onExpandCollapseAll,
  onResetLayout
}) => {
  const { canAccess } = usePermissions();

  const can = (key: string) => canAccess(`gantt.view.${key}`);

  const handleZoomChange = (zoomLevel: 'day' | 'week' | 'month') => {
    onLayoutSettingsChange({ zoomLevel });
  };

  const handleToggle = (setting: keyof ViewRibbonTabProps['layoutSettings'], value?: boolean) => {
    const currentValue = layoutSettings[setting];
    onLayoutSettingsChange({ [setting]: value !== undefined ? value : !currentValue });
  };

  const handleRowHeightChange = (height: number) => {
    onLayoutSettingsChange({ rowHeight: height });
  };

  const handleExpandAll = () => {
    if (onExpandCollapseAll) {
      onExpandCollapseAll(true);
    }
  };

  const handleCollapseAll = () => {
    if (onExpandCollapseAll) {
      onExpandCollapseAll(false);
    }
  };

  const handleResetLayout = () => {
    if (onResetLayout) {
      onResetLayout();
    }
  };

  return (
    <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
      {/* Zoom Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('zoom-day') && (
            <button
              onClick={() => handleZoomChange('day')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.zoomLevel === 'day'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title="Zoom to day view"
            >
              <CalendarDaysIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Day</span>
            </button>
          )}
          
          {can('zoom-week') && (
            <button
              onClick={() => handleZoomChange('week')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.zoomLevel === 'week'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title="Zoom to week view"
            >
              <CalendarIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Week</span>
            </button>
          )}
          
          {can('zoom-month') && (
            <button
              onClick={() => handleZoomChange('month')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.zoomLevel === 'month'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title="Zoom to month view"
            >
              <MonthIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Month</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Zoom</div>
      </div>

      {/* Toggles Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('toggle-grid') && (
            <button
              onClick={() => handleToggle('showGrid')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.showGrid
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title={layoutSettings.showGrid ? 'Hide grid' : 'Show grid'}
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Grid</span>
            </button>
          )}
          
          {can('toggle-dependencies') && (
            <button
              onClick={() => handleToggle('showDependencies')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.showDependencies
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title={layoutSettings.showDependencies ? 'Hide dependencies' : 'Show dependencies'}
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Deps</span>
            </button>
          )}
          
          {can('toggle-critical-path') && (
            <button
              onClick={() => handleToggle('showCriticalPath')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.showCriticalPath
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white hover:bg-red-50'
              }`}
              title={layoutSettings.showCriticalPath ? 'Hide critical path' : 'Show critical path'}
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Critical</span>
            </button>
          )}
          
          {can('toggle-progress') && (
            <button
              onClick={() => handleToggle('showProgress')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.showProgress
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white hover:bg-green-50'
              }`}
              title={layoutSettings.showProgress ? 'Hide progress' : 'Show progress'}
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Progress</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Toggles</div>
      </div>

      {/* Row Height Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('row-height-small') && (
            <button
              onClick={() => handleRowHeightChange(24)}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.rowHeight === 24
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title="Small row height (24px)"
            >
              <ArrowsUpDownIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Small</span>
            </button>
          )}
          
          {can('row-height-medium') && (
            <button
              onClick={() => handleRowHeightChange(32)}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.rowHeight === 32
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title="Medium row height (32px)"
            >
              <ArrowsUpDownIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Medium</span>
            </button>
          )}
          
          {can('row-height-large') && (
            <button
              onClick={() => handleRowHeightChange(40)}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.rowHeight === 40
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title="Large row height (40px)"
            >
              <ArrowsUpDownIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Large</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Row Height</div>
      </div>

      {/* Structure Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('expand-all') && (
            <button
              onClick={handleExpandAll}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Expand all tasks"
            >
              <ChevronDownIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Expand All</span>
            </button>
          )}
          
          {can('collapse-all') && (
            <button
              onClick={handleCollapseAll}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Collapse all tasks"
            >
              <ChevronUpIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Collapse All</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Structure</div>
      </div>

      {/* Layout Options Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('layout-options') && (
            <button
              onClick={() => {
                // TODO: Implement layout options panel
                console.log('Layout options panel - coming soon');
              }}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Layout options"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Layouts</span>
            </button>
          )}
          
          {can('filters') && (
            <button
              onClick={() => {
                // TODO: Implement filter configuration modal
                console.log('Filter configuration modal - coming soon');
              }}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Filter configuration"
            >
              <FunnelIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Filters</span>
            </button>
          )}
          
          {can('toggle-resources') && (
            <button
              onClick={() => handleToggle('showResources')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                layoutSettings.showResources
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white hover:bg-purple-50'
              }`}
              title={layoutSettings.showResources ? 'Hide resources' : 'Show resources'}
            >
              <EyeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Resources</span>
            </button>
          )}
          
          {can('reset-layout') && (
            <button
              onClick={handleResetLayout}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors"
              title="Reset layout to defaults"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Reset</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Options</div>
      </div>

      {/* Current Settings Display */}
      <div className="flex flex-col justify-end ml-auto">
        <div className="text-xs text-gray-500">
          Zoom: {layoutSettings.zoomLevel.charAt(0).toUpperCase() + layoutSettings.zoomLevel.slice(1)}
        </div>
        <div className="text-xs text-gray-500">
          Row: {layoutSettings.rowHeight}px
        </div>
        <div className="text-xs text-gray-500">
          Grid: {layoutSettings.showGrid ? 'On' : 'Off'}
        </div>
        <div className="text-xs text-gray-500">
          Deps: {layoutSettings.showDependencies ? 'On' : 'Off'}
        </div>
      </div>
    </div>
  );
}; 