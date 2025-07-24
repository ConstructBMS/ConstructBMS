import React from 'react';
import { 
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface InspectorTabProps {
  onToggleInspector: () => void;
  selectedTaskCount: number;
  showInspector: boolean;
}

export const InspectorTab: React.FC<InspectorTabProps> = ({ 
  showInspector, 
  onToggleInspector, 
  selectedTaskCount 
}) => {
  const { canAccess } = usePermissions();

  const can = (key: string) => canAccess(`gantt.inspector.${key}`);

  return (
    <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
      {/* Inspector Controls */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('toggle') && (
            <button
              onClick={onToggleInspector}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                showInspector 
                  ? 'border-blue-300 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white hover:bg-blue-50'
              }`}
              title={showInspector ? 'Hide Inspector' : 'Show Inspector'}
            >
              {showInspector ? (
                <EyeSlashIcon className="h-5 w-5 mb-1" />
              ) : (
                <EyeIcon className="h-5 w-5 mb-1 text-gray-700" />
              )}
              <span className="text-xs">{showInspector ? 'Hide' : 'Show'}</span>
            </button>
          )}
          {can('settings') && (
            <button
              onClick={() => console.log('Inspector settings')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors"
              title="Inspector Settings"
            >
              <CogIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Settings</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Task Properties</div>
      </div>

      {/* Status Display */}
      <div className="flex flex-col justify-end ml-auto">
        <div className="text-xs text-gray-500">
          Inspector: {showInspector ? 'Visible' : 'Hidden'}
        </div>
        <div className="text-xs text-gray-500">
          Selected: {selectedTaskCount} task{selectedTaskCount !== 1 ? 's' : ''}
        </div>
        <div className="text-xs text-gray-500">
          {selectedTaskCount === 1 ? 'Ready to edit' : selectedTaskCount > 1 ? 'Multi-select mode' : 'No task selected'}
        </div>
      </div>
    </div>
  );
}; 