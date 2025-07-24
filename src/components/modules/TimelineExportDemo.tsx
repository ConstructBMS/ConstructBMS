import React, { useState, useRef, useEffect } from 'react';
import { 
  DocumentArrowDownIcon, 
  PhotoIcon, 
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarIcon,
  FilterIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';
import TimelineExportControls from './TimelineExportControls';
import { demoModeService } from '../services/demoModeService';
import { timelineExportService } from '../services/timelineExportService';
import { toastService } from './ToastNotification';

interface TimelineExportDemoProps {
  className?: string;
}

const TimelineExportDemo: React.FC<TimelineExportDemoProps> = ({ className = '' }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
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
  const [isMultiProjectMode, setIsMultiProjectMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState(['project-1', 'project-2']);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  
  const ganttElementRef = useRef<HTMLDivElement>(null);

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Sample project data
  const projectData = {
    id: 'demo-project-1',
    name: 'ConstructBMS Development',
    client: 'Demo Client Ltd',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30')
  };

  // Sample tasks for demo
  const sampleTasks = [
    {
      id: 'task-1',
      name: 'Project Planning',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-15'),
      status: 'completed',
      progress: 100,
      priority: 'high',
      assignee: 'john.doe',
      tags: ['planning', 'management']
    },
    {
      id: 'task-2',
      name: 'Database Design',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-02-05'),
      status: 'in_progress',
      progress: 75,
      priority: 'high',
      assignee: 'jane.smith',
      tags: ['backend', 'database']
    },
    {
      id: 'task-3',
      name: 'Frontend Development',
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-03-15'),
      status: 'in_progress',
      progress: 60,
      priority: 'medium',
      assignee: 'john.doe',
      tags: ['frontend', 'react']
    },
    {
      id: 'task-4',
      name: 'API Development',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-30'),
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignee: 'jane.smith',
      tags: ['backend', 'api']
    },
    {
      id: 'task-5',
      name: 'Testing & QA',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-04-30'),
      status: 'not_started',
      progress: 0,
      priority: 'medium',
      assignee: 'qa.team',
      tags: ['testing', 'qa']
    },
    {
      id: 'task-6',
      name: 'Documentation',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-15'),
      status: 'not_started',
      progress: 0,
      priority: 'low',
      assignee: 'john.doe',
      tags: ['documentation']
    },
    {
      id: 'task-7',
      name: 'Deployment',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-05-01'),
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignee: 'devops.team',
      tags: ['deployment', 'devops']
    },
    {
      id: 'task-8',
      name: 'User Training',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-15'),
      status: 'not_started',
      progress: 0,
      priority: 'medium',
      assignee: 'training.team',
      tags: ['training', 'user-support']
    },
    {
      id: 'task-9',
      name: 'Go-Live Support',
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-06-15'),
      status: 'not_started',
      progress: 0,
      priority: 'high',
      assignee: 'support.team',
      tags: ['support', 'go-live']
    },
    {
      id: 'task-10',
      name: 'Project Closure',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-30'),
      status: 'not_started',
      progress: 0,
      priority: 'medium',
      assignee: 'project.manager',
      tags: ['closure', 'management']
    }
  ];

  // Demo mode restrictions
  const demoRestrictions = timelineExportService.getDemoModeRestrictions();

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Timeline Export Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export your Gantt timeline as PDF or PNG with branding and filters
          </p>
        </div>
        
        {/* Demo Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDemoInfo(!showDemoInfo)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <InformationCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Demo Info</span>
          </button>
          
          {isDemoMode && (
            <div className="flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-300">
              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
              Demo Mode
            </div>
          )}
        </div>
      </div>

      {/* Demo Info Panel */}
      {showDemoInfo && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
            Timeline Export Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">Export Formats:</h4>
              <ul className="space-y-1">
                <li>• PDF with ConstructBMS branding</li>
                <li>• PNG for presentations and sharing</li>
                <li>• High-resolution output (2x scale)</li>
                <li>• Custom page sizes (A3, A4, A5)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Export Options:</h4>
              <ul className="space-y-1">
                <li>• Include/exclude logo and branding</li>
                <li>• Show current filters and date range</li>
                <li>• Include milestones and dependencies</li>
                <li>• Multi-project timeline support</li>
              </ul>
            </div>
          </div>
          
          {isDemoMode && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                Demo Mode Restrictions:
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                {demoRestrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Export Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Export Controls
        </h3>
        <TimelineExportControls
          projectId={projectData.id}
          projectName={projectData.name}
          ganttElementRef={ganttElementRef}
          currentFilters={currentFilters}
          currentZoomLevel={currentZoomLevel}
          currentDateRange={currentDateRange}
          isMultiProjectMode={isMultiProjectMode}
          selectedProjects={selectedProjects}
          className="mb-4"
        />
      </div>

      {/* Current Settings Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Current Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zoom Level</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{currentZoomLevel}</span>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <FilterIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Object.values(currentFilters).flat().length} filters
            </span>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <ViewColumnsIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Multi-Project</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isMultiProjectMode ? `${selectedProjects.length} projects` : 'Single project'}
            </span>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <DocumentArrowDownIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Mode</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isDemoMode ? 'Demo (PDF only)' : 'Full access'}
            </span>
          </div>
        </div>
      </div>

      {/* Sample Gantt Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Sample Timeline (Export Target)
        </h3>
        <div 
          ref={ganttElementRef}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
        >
          {/* Timeline Header */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {projectData.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {projectData.client} • {currentDateRange.start.toLocaleDateString()} - {currentDateRange.end.toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zoom: {currentZoomLevel}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sampleTasks.length} tasks
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Column Headers */}
              <div className="grid grid-cols-[300px_1fr] bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="p-3 font-medium text-gray-900 dark:text-white">Task Name</div>
                <div className="p-3 font-medium text-gray-900 dark:text-white">Timeline</div>
              </div>

              {/* Task Rows */}
              {sampleTasks.map((task, index) => (
                <div 
                  key={task.id}
                  className={`grid grid-cols-[300px_1fr] border-b border-gray-200 dark:border-gray-600 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="p-3">
                    <div className="font-medium text-gray-900 dark:text-white">{task.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {task.assignee} • {task.priority} • {task.progress}%
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 relative">
                    <div className="relative h-8 bg-gray-100 dark:bg-gray-600 rounded">
                      {/* Task Bar */}
                      <div 
                        className={`absolute h-6 top-1 rounded transition-all duration-300 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}
                        style={{
                          left: `${((task.startDate.getTime() - currentDateRange.start.getTime()) / (currentDateRange.end.getTime() - currentDateRange.start.getTime())) * 100}%`,
                          width: `${((task.endDate.getTime() - task.startDate.getTime()) / (currentDateRange.end.getTime() - currentDateRange.start.getTime())) * 100}%`
                        }}
                      >
                        <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                          {task.progress}%
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {task.status === 'in_progress' && (
                        <div 
                          className="absolute h-6 top-1 left-0 bg-green-400 rounded transition-all duration-300"
                          style={{
                            width: `${((task.endDate.getTime() - task.startDate.getTime()) / (currentDateRange.end.getTime() - currentDateRange.start.getTime())) * 100 * (task.progress / 100)}%`
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Features Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Export Features Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">📄 Export Formats</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• High-quality PDF export</li>
              <li>• PNG for presentations</li>
              <li>• Custom page sizes</li>
              <li>• Portrait/landscape orientation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">🎨 Branding & Layout</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• ConstructBMS logo and branding</li>
              <li>• Project metadata header</li>
              <li>• Current filters display</li>
              <li>• Export date and user info</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">⚙️ Advanced Options</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Include/exclude milestones</li>
              <li>• Show task dependencies</li>
              <li>• Baseline comparison</li>
              <li>• Multi-project support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineExportDemo; 