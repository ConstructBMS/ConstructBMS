import React, { useState } from 'react';
import AstaPowerProjectLayout from './AstaPowerProjectLayout';

const NavigationTest: React.FC = () => {
  const [currentViewMode, setCurrentViewMode] = useState<string>('gantt');
  const [currentRibbonTab, setCurrentRibbonTab] = useState<string>('home');

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
    console.log('Project changed:', project);
  };

  const handleViewModeChange = (mode: string) => {
    console.log('View mode changed:', mode);
    setCurrentViewMode(mode);
  };

  return (
    <div className="h-screen">
      {/* Debug Info */}
      <div className="fixed top-4 right-4 z-50 bg-white border rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold mb-2">Navigation Debug</h3>
        <div className="text-sm space-y-1">
          <div><strong>Current View Mode:</strong> {currentViewMode}</div>
          <div><strong>Current Ribbon Tab:</strong> {currentRibbonTab}</div>
        </div>
      </div>

      {/* Main Layout */}
      <AstaPowerProjectLayout
        initialProject={demoProject}
        onProjectChange={handleProjectChange}
        onViewModeChange={handleViewModeChange}
      >
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Navigation Test</h1>
          <p className="text-gray-600 mb-4">
            Test the sidebar navigation and ribbon tabs functionality.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Sidebar Navigation</h2>
              <p className="text-sm text-gray-600 mb-3">
                Click the sidebar menu items to test navigation:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Dashboard → Gantt view</li>
                <li>• Gantt Chart → Gantt view</li>
                <li>• Timeline → Timeline view</li>
                <li>• Calendar → Calendar view</li>
                <li>• Resources → Resource view</li>
                <li>• Costs → Cost view</li>
                <li>• Tasks → Gantt view</li>
              </ul>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Ribbon Tabs</h2>
              <p className="text-sm text-gray-600 mb-3">
                Click the ribbon tabs to test functionality:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Home → Task operations</li>
                <li>• View → Zoom, gridlines, etc.</li>
                <li>• Project → Project settings</li>
                <li>• Allocation → Resource management</li>
                <li>• Format → Visual formatting</li>
                <li>• Output → Export options</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-white border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Test Instructions</h2>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Try clicking different sidebar menu items - they should navigate to different views</li>
              <li>Try clicking different ribbon tabs - they should show different controls</li>
              <li>Check the debug info in the top-right corner to see current state</li>
              <li>Try the ribbon buttons in each tab to test functionality</li>
            </ol>
          </div>
        </div>
      </AstaPowerProjectLayout>
    </div>
  );
};

export default NavigationTest; 