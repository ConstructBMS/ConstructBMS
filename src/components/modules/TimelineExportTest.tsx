import React, { useState, useRef } from 'react';
import TimelineExportDemo from './TimelineExportDemo';
import TimelineExportControls from './TimelineExportControls';
import { toastService } from './ToastNotification';

const TimelineExportTest: React.FC = () => {
  const [currentProject, setCurrentProject] = useState({
    id: 'test-project-1',
    name: 'ConstructBMS Timeline Export Test'
  });

  const [currentFilters, setCurrentFilters] = useState({
    status: ['in_progress', 'not_started'],
    priority: ['high', 'medium'],
    tags: ['frontend', 'backend'],
    assignee: ['john.doe', 'jane.smith']
  });

  const [currentZoomLevel, setCurrentZoomLevel] = useState<'days' | 'weeks' | 'months' | 'quarters'>('weeks');
  const [currentDateRange, setCurrentDateRange] = useState({
    start: new Date('2024-01-01'),
    end: new Date('2024-06-30')
  });

  const ganttElementRef = useRef<HTMLDivElement>(null);

  const handleTimelineExport = () => {
    toastService.info('Timeline Export', 'Timeline export functionality triggered from ribbon');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Timeline Export Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing the timeline export functionality for Programme Manager v2
          </p>
        </div>

        {/* Standalone Export Controls */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Standalone Export Controls
          </h2>
          <TimelineExportControls
            projectId={currentProject.id}
            projectName={currentProject.name}
            ganttElementRef={ganttElementRef}
            currentFilters={currentFilters}
            currentZoomLevel={currentZoomLevel}
            currentDateRange={currentDateRange}
            isMultiProjectMode={false}
            selectedProjects={[]}
          />
        </div>

        {/* Demo Component */}
        <TimelineExportDemo />

        {/* Test Gantt Element (for export target) */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Gantt Element (Export Target)
          </h2>
          <div 
            ref={ganttElementRef}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
          >
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">Sample Gantt Chart</p>
              <p className="text-sm">
                This element would be captured and exported as PDF/PNG
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded">
                <p className="text-blue-800 dark:text-blue-200">
                  Project: {currentProject.name}
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Zoom: {currentZoomLevel} • Date Range: {currentDateRange.start.toLocaleDateString()} - {currentDateRange.end.toLocaleDateString()}
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Filters: {Object.values(currentFilters).flat().length} active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Integration Instructions
          </h2>
          <div className="text-blue-800 dark:text-blue-200 space-y-2">
            <p><strong>1. Ribbon Integration:</strong> The timeline export button has been added to the File tab in the ribbon.</p>
            <p><strong>2. Component Usage:</strong> Use TimelineExportControls in your Gantt components with a ref to the timeline element.</p>
            <p><strong>3. Service Integration:</strong> The timelineExportService handles all export logic with Supabase integration.</p>
            <p><strong>4. Demo Mode:</strong> Demo mode restrictions are automatically applied based on user permissions.</p>
            <p><strong>5. Multi-Project Support:</strong> Supports multi-project timelines from Prompt 76.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineExportTest; 