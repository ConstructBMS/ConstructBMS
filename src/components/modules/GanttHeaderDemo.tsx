import React, { useState, useEffect } from 'react';
import GanttHeader from './GanttHeader';
import type { Project, BreadcrumbItem, AutosaveStatus } from './GanttHeader';
import { ganttHeaderService } from '../../services/ganttHeaderService';

const GanttHeaderDemo: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '1',
    name: 'Commercial Building Project',
    status: 'active',
    lastModified: new Date()
  });

  const [currentSection, setCurrentSection] = useState('dashboard');
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>({
    status: 'saved',
    lastSaved: new Date()
  });

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Update breadcrumbs when section changes
  useEffect(() => {
    const newBreadcrumbs = ganttHeaderService.generateBreadcrumbs(currentSection, currentProject.name);
    setBreadcrumbs(newBreadcrumbs);
  }, [currentSection, currentProject.name]);

  // Simulate autosave status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const status = ganttHeaderService.getAutosaveStatus();
      setAutosaveStatus(status);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate some changes to trigger autosave
  useEffect(() => {
    const changeInterval = setInterval(() => {
      // Simulate random changes
      if (Math.random() > 0.7) {
        ganttHeaderService.markChangesPending([`change-${Date.now()}`]);
      }
    }, 5000);

    return () => clearInterval(changeInterval);
  }, []);

  const handleProjectChange = async (projectId: string) => {
    console.log(`Switching to project: ${projectId}`);
    
    // Simulate project switch
    const newProject = {
      id: projectId,
      name: `Project ${projectId}`,
      status: 'active' as const,
      lastModified: new Date()
    };
    
    setCurrentProject(newProject);
    
    // Update autosave for new project
    ganttHeaderService.initializeAutosave(projectId);
  };

  const handleProfileAction = async (action: 'profile' | 'logout' | 'settings') => {
    console.log(`Profile action: ${action}`);
    await ganttHeaderService.handleProfileAction(action);
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    console.log(`Breadcrumb clicked: ${item.label}`);
    // In a real app, this would navigate to the path
  };

  const sections = [
    'dashboard',
    'gantt-planner',
    'calendar',
    'clients',
    'estimates',
    'procurement',
    'reports',
    'user-management',
    'settings'
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <GanttHeader
        currentProject={currentProject}
        breadcrumbs={breadcrumbs}
        autosaveStatus={autosaveStatus}
        onProjectChange={handleProjectChange}
        onProfileAction={handleProfileAction}
        onBreadcrumbClick={handleBreadcrumbClick}
      />

      {/* Demo Controls */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gantt Header Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section Controls */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Current Section</h3>
              <div className="grid grid-cols-3 gap-2">
                {sections.map(section => (
                  <button
                    key={section}
                    onClick={() => setCurrentSection(section)}
                    className={`
                      px-3 py-2 text-sm rounded-lg transition-colors
                      ${currentSection === section 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Autosave Controls */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Autosave Status</h3>
              <div className="space-y-2">
                <button
                  onClick={() => ganttHeaderService.markChangesPending([`manual-change-${Date.now()}`])}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Simulate Change
                </button>
                <button
                  onClick={() => ganttHeaderService.markChangesSaved(Array.from(ganttHeaderService['pendingChanges'] || []))}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Force Save
                </button>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Header Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Project switcher dropdown with project status</li>
                <li>• Dynamic breadcrumb navigation</li>
                <li>• Real-time autosave status indicator</li>
                <li>• User profile dropdown with actions</li>
                <li>• ConstructBMS navy/blue styling</li>
                <li>• Responsive design</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Current State</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Current Project:</strong> {currentProject.name}</p>
                <p><strong>Current Section:</strong> {currentSection}</p>
                <p><strong>Autosave Status:</strong> {autosaveStatus.status}</p>
                <p><strong>Last Saved:</strong> {autosaveStatus.lastSaved?.toLocaleTimeString() || 'Never'}</p>
                <p><strong>Breadcrumbs:</strong> {breadcrumbs.map(b => b.label).join(' > ')}</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">Integration Notes</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Integrates with Supabase for project management</li>
                <li>• Automatic autosave every 30 seconds</li>
                <li>• User preferences and profile management</li>
                <li>• Project change logging and history</li>
                <li>• Ready for routing integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttHeaderDemo; 