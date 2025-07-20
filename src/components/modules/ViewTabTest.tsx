import React, { useState } from 'react';
import ViewTab from './ribbonTabs/ViewTab';
import type { ViewOperation, ViewState } from './ribbonTabs/ViewTab';

const ViewTabTest: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({
    zoomLevel: 100,
    showGridlines: true,
    showTimelineBand: true,
    showTaskLinks: true,
    showFloat: false
  });

  const handleViewOperation = (operation: ViewOperation) => {
    console.log('View operation:', operation);
    // Handle view operations here
    switch (operation.type) {
      case 'zoom-in':
      case 'zoom-out':
        console.log(`Zoom level changed to: ${operation.data?.zoomLevel}%`);
        break;
      case 'toggle-gridlines':
        console.log(`Gridlines ${operation.data?.show ? 'shown' : 'hidden'}`);
        break;
      case 'toggle-timeline-band':
        console.log(`Timeline band ${operation.data?.show ? 'shown' : 'hidden'}`);
        break;
      case 'toggle-task-links':
        console.log(`Task links ${operation.data?.show ? 'shown' : 'hidden'}`);
        break;
      case 'toggle-float':
        console.log(`Float ${operation.data?.show ? 'shown' : 'hidden'}`);
        break;
      case 'fit-to-screen':
        console.log('Fit to screen activated');
        break;
    }
  };

  const handleViewStateChange = (newState: Partial<ViewState>) => {
    setViewState(prev => ({ ...prev, ...newState }));
  };

  const viewTabConfig = ViewTab(handleViewOperation, 'project_manager', viewState, handleViewStateChange);

  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">View Tab Test</h2>
      
      {/* Current View State Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current View State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Zoom Level:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{viewState.zoomLevel}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Gridlines:</span>
            <span className={`ml-2 ${viewState.showGridlines ? 'text-green-600' : 'text-red-600'}`}>
              {viewState.showGridlines ? 'Shown' : 'Hidden'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Timeline Band:</span>
            <span className={`ml-2 ${viewState.showTimelineBand ? 'text-green-600' : 'text-red-600'}`}>
              {viewState.showTimelineBand ? 'Shown' : 'Hidden'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Task Links:</span>
            <span className={`ml-2 ${viewState.showTaskLinks ? 'text-green-600' : 'text-red-600'}`}>
              {viewState.showTaskLinks ? 'Shown' : 'Hidden'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Float:</span>
            <span className={`ml-2 ${viewState.showFloat ? 'text-green-600' : 'text-red-600'}`}>
              {viewState.showFloat ? 'Shown' : 'Hidden'}
            </span>
          </div>
        </div>
      </div>

      {/* View Tab Groups */}
      <div className="space-y-6">
        {viewTabConfig.groups.map((group, groupIndex) => (
          <div key={groupIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{group.title}</h3>
            <div className="flex flex-wrap gap-3">
              {group.buttons.map((button, buttonIndex) => (
                <button
                  key={buttonIndex}
                  onClick={button.action}
                  disabled={button.disabled}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    button.disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : button.isActive
                      ? 'bg-constructbms-blue text-white border border-constructbms-blue hover:bg-constructbms-blue/90'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={button.tooltip}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewTabTest; 