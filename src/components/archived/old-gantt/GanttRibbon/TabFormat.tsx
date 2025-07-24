import React from 'react';
import { 
  PaintBrushIcon, 
  DocumentTextIcon, 
  TableCellsIcon, 
  ArrowsUpDownIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  LinkIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Bars3Icon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

export const TabFormat: React.FC = () => {
  const { state, updateLayoutSettings } = useProjectView();
  const { canAccess } = usePermissions();

  const can = (key: string) => canAccess(`gantt.format.${key}`);

  const rowHeights = [20, 24, 28, 32, 36, 40];

  return (
    <div className="flex flex-wrap space-x-4 p-2 text-sm">
      {/* Bar Styles */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('bar-style') && (
            <button
              onClick={() => alert('Change task bar colours and styles')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Bar Style Settings"
            >
              <PaintBrushIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Bar Style</span>
            </button>
          )}
          {can('bar-color') && (
            <button
              onClick={() => alert('Open bar color picker')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Bar Color Picker"
            >
              <SwatchIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Bar Color</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Bar Styles</div>
      </div>

      {/* Font & Text */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('font-style') && (
            <button
              onClick={() => alert('Open font style editor')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Font Style Options"
            >
              <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Font Style</span>
            </button>
          )}
          {can('text-visibility') && (
            <button
              onClick={() => updateLayoutSettings({ showBarLabels: !state.layoutSettings.showBarLabels })}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                state.layoutSettings.showBarLabels ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-blue-50'
              }`}
              title="Toggle Bar Labels"
            >
              {state.layoutSettings.showBarLabels ? (
                <EyeIcon className="h-5 w-5 mb-1 text-gray-700" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 mb-1 text-gray-700" />
              )}
              <span className="text-xs text-gray-700">Bar Labels</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Font & Text</div>
      </div>

      {/* Layout */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('row-height') && (
            <div className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors">
              <select
                value={state.layoutSettings.rowHeight}
                onChange={(e) => updateLayoutSettings({ rowHeight: parseInt(e.target.value) })}
                className="text-xs text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
                title="Row Height"
              >
                {rowHeights.map(height => (
                  <option key={height} value={height}>{height}px</option>
                ))}
              </select>
              <ArrowsUpDownIcon className="h-4 w-4 mt-1 text-gray-700" />
              <span className="text-xs text-gray-700">Row Height</span>
            </div>
          )}
          {can('column-width') && (
            <button
              onClick={() => alert('Adjust column widths')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Column Width Settings"
            >
              <ViewColumnsIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Columns</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Layout</div>
      </div>

      {/* Grid & Lines */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('grid') && (
            <button
              onClick={() => updateLayoutSettings({ showGrid: !state.layoutSettings.showGrid })}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                state.layoutSettings.showGrid ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-blue-50'
              }`}
              title="Toggle Grid Lines"
            >
              {state.layoutSettings.showGrid ? (
                <TableCellsIcon className="h-5 w-5 mb-1 text-gray-700" />
              ) : (
                <Bars3Icon className="h-5 w-5 mb-1 text-gray-700" />
              )}
              <span className="text-xs text-gray-700">
                {state.layoutSettings.showGrid ? 'Hide Grid' : 'Show Grid'}
              </span>
            </button>
          )}
          {can('dependencies') && (
            <button
              onClick={() => updateLayoutSettings({ showDependencies: !state.layoutSettings.showDependencies })}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                state.layoutSettings.showDependencies ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-blue-50'
              }`}
              title="Toggle Dependency Lines"
            >
              <LinkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">
                {state.layoutSettings.showDependencies ? 'Hide Links' : 'Show Links'}
              </span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Grid & Lines</div>
      </div>

      {/* Advanced Formatting */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('advanced') && (
            <button
              onClick={() => alert('Advanced formatting options')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Advanced Formatting"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Advanced</span>
            </button>
          )}
          {can('templates') && (
            <button
              onClick={() => alert('Save/load formatting templates')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Format Templates"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Templates</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Advanced</div>
      </div>
    </div>
  );
}; 