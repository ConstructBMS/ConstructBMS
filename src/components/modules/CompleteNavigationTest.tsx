import React, { useState, useEffect } from 'react';
import AstaPowerProjectLayout from './AstaPowerProjectLayout';

const CompleteNavigationTest: React.FC = () => {
  const [currentViewMode, setCurrentViewMode] = useState<string>('gantt');
  const [navigationLog, setNavigationLog] = useState<string[]>([]);

  const demoProject = {
    id: 'demo-project-123',
    name: 'Demo Construction Project',
    client: 'Demo Client Ltd',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active' as const,
    lastModified: new Date()
  };

  const handleProjectChange = (project: any) => {
    addToLog(`Project changed: ${project.name}`);
  };

  const handleViewModeChange = (mode: string) => {
    addToLog(`View mode changed: ${mode}`);
    setCurrentViewMode(mode);
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setNavigationLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    addToLog('Navigation test started');
  }, []);

  return (
    <div className="h-screen">
      {/* Debug Panel */}
      <div className="fixed top-4 right-4 z-50 bg-white border rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold mb-2">Navigation Debug</h3>
        <div className="text-sm space-y-1 mb-3">
          <div><strong>Current View Mode:</strong> {currentViewMode}</div>
          <div><strong>Active Project:</strong> {demoProject.name}</div>
        </div>
        
        <div className="text-xs">
          <h4 className="font-medium mb-1">Navigation Log:</h4>
          <div className="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
            {navigationLog.map((log, index) => (
              <div key={index} className="text-gray-600">{log}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <AstaPowerProjectLayout
        initialProject={demoProject}
        onProjectChange={handleProjectChange}
        onViewModeChange={handleViewModeChange}
      >
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Complete Navigation Test</h1>
          <p className="text-gray-600 mb-6">
            Test all navigation functionality including sidebar menu and ribbon tabs.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">✅ Sidebar Navigation Test</h2>
              <p className="text-sm text-gray-600 mb-3">
                Click these sidebar menu items to test navigation:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Dashboard</strong><br/>
                  → Gantt view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Gantt Chart</strong><br/>
                  → Gantt view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Timeline</strong><br/>
                  → Timeline view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Calendar</strong><br/>
                  → Calendar view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Resources</strong><br/>
                  → Resource view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Costs</strong><br/>
                  → Cost view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Documents</strong><br/>
                  → Documents view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Reports</strong><br/>
                  → Reports view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Tasks</strong><br/>
                  → Gantt view
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Tools</strong><br/>
                  → Tools view
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">✅ Ribbon Tabs Test</h2>
              <p className="text-sm text-gray-600 mb-3">
                Click these ribbon tabs to test functionality:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-green-50 rounded">
                  <strong>Home</strong><br/>
                  Task operations
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <strong>View</strong><br/>
                  Zoom, gridlines
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <strong>Project</strong><br/>
                  Project settings
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <strong>Allocation</strong><br/>
                  Resource management
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <strong>Format</strong><br/>
                  Visual formatting
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <strong>Output</strong><br/>
                  Export options
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">🧪 Test Instructions</h2>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li><strong>Sidebar Test:</strong> Click different sidebar menu items - they should navigate to different views and show active state</li>
              <li><strong>Ribbon Test:</strong> Click different ribbon tabs - they should show different controls and highlight active tab</li>
              <li><strong>View Changes:</strong> Check the main content area changes based on selected view</li>
              <li><strong>Debug Panel:</strong> Monitor the debug panel in the top-right corner for navigation logs</li>
              <li><strong>Active States:</strong> Verify that active sidebar items and ribbon tabs are properly highlighted</li>
            </ol>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Expected Behavior</h3>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Sidebar items should be clickable and navigate to different views</li>
              <li>• Active sidebar item should be highlighted with blue styling</li>
              <li>• Ribbon tabs should switch between different control sets</li>
              <li>• Active ribbon tab should be highlighted</li>
              <li>• Main content should change based on selected view</li>
              <li>• Navigation should be logged in the debug panel</li>
            </ul>
          </div>
        </div>
      </AstaPowerProjectLayout>
    </div>
  );
};

export default CompleteNavigationTest; 