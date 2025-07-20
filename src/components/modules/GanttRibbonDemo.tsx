import React, { useState } from 'react';
import GanttRibbon from './GanttRibbon';
import type { RibbonTab } from './GanttRibbon';
import { ganttRibbonService } from '../../services/ganttRibbonService';

const GanttRibbonDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [clickedButtons, setClickedButtons] = useState<string[]>([]);

  // Get default ribbon tabs
  const ribbonTabs = ganttRibbonService.getDefaultRibbonTabs();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log(`Switched to tab: ${tabId}`);
  };

  const handleButtonClick = (buttonId: string, tabId: string, groupId: string) => {
    console.log(`Button clicked: ${buttonId} in ${groupId} (${tabId})`);
    setClickedButtons(prev => [...prev, `${tabId}-${groupId}-${buttonId}`]);
  };

  const getActiveTabData = () => {
    return ribbonTabs.find(tab => tab.id === activeTab);
  };

  const activeTabData = getActiveTabData();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Ribbon */}
      <GanttRibbon
        tabs={ribbonTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onButtonClick={handleButtonClick}
      />

      {/* Demo Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gantt Ribbon Demo</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tab Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Current Tab</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  {activeTabData?.label} Tab
                </h4>
                <p className="text-sm text-blue-800">
                  This tab contains {activeTabData?.groups.length || 0} groups with various controls.
                </p>
              </div>

              {/* Available Tabs */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Available Tabs</h4>
                <div className="grid grid-cols-2 gap-2">
                  {ribbonTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        px-3 py-2 text-sm rounded-lg transition-colors
                        ${activeTab === tab.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Button Groups */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Button Groups</h3>
              {activeTabData?.groups.map(group => (
                <div key={group.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{group.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.buttons.map(button => (
                      <button
                        key={button.id}
                        onClick={() => handleButtonClick(button.id, activeTab, group.id)}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Actions */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Recent Actions</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
              {clickedButtons.length === 0 ? (
                <p className="text-sm text-gray-500">No actions yet. Click buttons in the ribbon above.</p>
              ) : (
                <div className="space-y-1">
                  {clickedButtons.slice(-10).reverse().map((action, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      • {action}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Features Overview */}
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Ribbon Features</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Microsoft Office-style ribbon interface</li>
                <li>• Contextual tabs with grouped buttons</li>
                <li>• Multiple button types: regular, dropdown, toggle, split</li>
                <li>• Responsive design with overflow handling</li>
                <li>• Tooltips and accessibility features</li>
                <li>• Customizable configurations</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">Tab Descriptions</h3>
              <div className="text-sm text-purple-800 space-y-2">
                <p><strong>Home:</strong> Basic task operations, clipboard, scheduling tools</p>
                <p><strong>View:</strong> Different view modes, zoom controls, display options</p>
                <p><strong>Project:</strong> Project settings, resources, data import/export</p>
                <p><strong>Allocation:</strong> Resource assignments, work settings, cost management</p>
                <p><strong>Format:</strong> Appearance controls, colors, layout options</p>
                <p><strong>Output:</strong> Printing, exporting, sharing capabilities</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Integration Notes</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Integrates with Gantt module layout</li>
                <li>• Supports custom ribbon configurations</li>
                <li>• User preferences persistence</li>
                <li>• Ready for real action implementations</li>
                <li>• Extensible for additional tabs and groups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttRibbonDemo; 