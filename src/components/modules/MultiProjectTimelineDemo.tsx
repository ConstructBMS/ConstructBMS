import React, { useState, useEffect } from 'react';
import { 
  GlobeAltIcon, 
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { multiProjectService, type ProjectInfo, type MultiProjectTask } from '../../services/multiProjectService';
import MultiProjectControls from './MultiProjectControls';
import { toastService } from './ToastNotification';

// Sample project data
const sampleProjects: ProjectInfo[] = [
  {
    id: '1',
    name: 'Kitchen Extension',
    client: 'Smith Family',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    status: 'active',
    totalTasks: 15,
    color: '#3B82F6',
    isVisible: true
  },
  {
    id: '2',
    name: 'Office Renovation',
    client: 'TechCorp Ltd',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    status: 'active',
    totalTasks: 12,
    color: '#EF4444',
    isVisible: true
  },
  {
    id: '3',
    name: 'Garden Design',
    client: 'Green Thumb Co',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-07-31'),
    status: 'on_hold',
    totalTasks: 8,
    color: '#10B981',
    isVisible: true
  },
  {
    id: '4',
    name: 'Bathroom Remodel',
    client: 'Johnson Residence',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-09-30'),
    status: 'active',
    totalTasks: 10,
    color: '#F59E0B',
    isVisible: true
  }
];

// Sample tasks for each project
const sampleTasks: MultiProjectTask[] = [
  // Kitchen Extension tasks
  {
    id: '1-1',
    projectId: '1',
    projectName: 'Kitchen Extension',
    projectColor: '#3B82F6',
    name: 'Site Survey',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-15'),
    progress: 100,
    status: 'completed',
    priority: 'high',
    assignedTo: 'John Surveyor'
  },
  {
    id: '1-2',
    projectId: '1',
    projectName: 'Kitchen Extension',
    projectColor: '#3B82F6',
    name: 'Foundation Work',
    start: new Date('2024-01-16'),
    end: new Date('2024-02-28'),
    progress: 75,
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Mike Builder'
  },
  {
    id: '1-3',
    projectId: '1',
    projectName: 'Kitchen Extension',
    projectColor: '#3B82F6',
    name: 'Electrical Installation',
    start: new Date('2024-03-01'),
    end: new Date('2024-04-15'),
    progress: 25,
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Sarah Electrician'
  },
  
  // Office Renovation tasks
  {
    id: '2-1',
    projectId: '2',
    projectName: 'Office Renovation',
    projectColor: '#EF4444',
    name: 'Space Planning',
    start: new Date('2024-02-01'),
    end: new Date('2024-02-28'),
    progress: 100,
    status: 'completed',
    priority: 'high',
    assignedTo: 'Lisa Designer'
  },
  {
    id: '2-2',
    projectId: '2',
    projectName: 'Office Renovation',
    projectColor: '#EF4444',
    name: 'Demolition',
    start: new Date('2024-03-01'),
    end: new Date('2024-03-31'),
    progress: 50,
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Tom Demolition'
  },
  {
    id: '2-3',
    projectId: '2',
    projectName: 'Office Renovation',
    projectColor: '#EF4444',
    name: 'New Construction',
    start: new Date('2024-04-01'),
    end: new Date('2024-06-30'),
    progress: 0,
    status: 'not_started',
    priority: 'medium',
    assignedTo: 'Bob Constructor'
  },
  
  // Garden Design tasks
  {
    id: '3-1',
    projectId: '3',
    projectName: 'Garden Design',
    projectColor: '#10B981',
    name: 'Landscape Design',
    start: new Date('2024-03-01'),
    end: new Date('2024-03-31'),
    progress: 100,
    status: 'completed',
    priority: 'medium',
    assignedTo: 'Emma Gardener'
  },
  {
    id: '3-2',
    projectId: '3',
    projectName: 'Garden Design',
    projectColor: '#10B981',
    name: 'Planting',
    start: new Date('2024-04-01'),
    end: new Date('2024-05-31'),
    progress: 0,
    status: 'not_started',
    priority: 'low',
    assignedTo: 'Emma Gardener'
  },
  
  // Bathroom Remodel tasks
  {
    id: '4-1',
    projectId: '4',
    projectName: 'Bathroom Remodel',
    projectColor: '#F59E0B',
    name: 'Design Consultation',
    start: new Date('2024-04-01'),
    end: new Date('2024-04-15'),
    progress: 100,
    status: 'completed',
    priority: 'high',
    assignedTo: 'Alex Designer'
  },
  {
    id: '4-2',
    projectId: '4',
    projectName: 'Bathroom Remodel',
    projectColor: '#F59E0B',
    name: 'Plumbing Work',
    start: new Date('2024-04-16'),
    end: new Date('2024-05-31'),
    progress: 0,
    status: 'not_started',
    priority: 'high',
    assignedTo: 'Sam Plumber'
  }
];

const MultiProjectTimelineDemo: React.FC = () => {
  const [timelineMode, setTimelineMode] = useState<'single' | 'multi'>('single');
  const [selectedProjects, setSelectedProjects] = useState<ProjectInfo[]>([]);
  const [visibleTasks, setVisibleTasks] = useState<MultiProjectTask[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<{ project: ProjectInfo; tasks: MultiProjectTask[] }[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(multiProjectService.isInDemoMode());

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load multi-project data
  const loadData = async () => {
    // Simulate loading projects and tasks
    setSelectedProjects(sampleProjects.slice(0, 2)); // Start with 2 projects
    setVisibleTasks(sampleTasks.filter(task => ['1', '2'].includes(task.projectId)));
    setIsDemoMode(multiProjectService.isInDemoMode());
    
    // Group tasks by project
    const grouped = [
      {
        project: sampleProjects[0],
        tasks: sampleTasks.filter(task => task.projectId === '1')
      },
      {
        project: sampleProjects[1],
        tasks: sampleTasks.filter(task => task.projectId === '2')
      }
    ];
    setGroupedTasks(grouped);
  };

  // Handle mode change
  const handleModeChange = (mode: 'single' | 'multi') => {
    setTimelineMode(mode);
  };

  // Handle project change
  const handleProjectChange = () => {
    // Refresh data when projects change
    loadData();
  };

  // Get demo mode configuration
  const demoConfig = multiProjectService.getDemoModeConfig();

  // Render project header
  const renderProjectHeader = (project: ProjectInfo) => {
    return (
      <div
        key={project.id}
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{ borderLeft: `4px solid ${project.color}` }}
      >
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Project: {project.name} – #{project.id}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Client: {project.client} • Status: {project.status.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Start: {project.startDate.toLocaleDateString()}</span>
          <span>End: {project.endDate.toLocaleDateString()}</span>
          <span>{project.totalTasks} tasks</span>
          {isDemoMode && (
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
          )}
        </div>
      </div>
    );
  };

  // Render task row
  const renderTaskRow = (task: MultiProjectTask) => {
    const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div
        key={task.id}
        className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        style={{ borderLeft: `4px solid ${task.projectColor}` }}
      >
        <div className="flex-1">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: task.projectColor }}
            />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {task.name}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assigned to: {task.assignedTo} • Priority: {task.priority}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{task.start.toLocaleDateString()}</span>
          <span>{task.end.toLocaleDateString()}</span>
          <span>{duration} days</span>
          <span className={`px-2 py-1 rounded text-xs ${
            task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
            task.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
          }`}>
            {task.status.replace('_', ' ')}
          </span>
          <span>{task.progress}%</span>
        </div>
      </div>
    );
  };

  // Render timeline view
  const renderTimelineView = () => {
    const dayWidth = 20; // 20px per day
    const rowHeight = 40;
    const startDate = new Date('2024-01-01');

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Timeline Header */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Multi-Project Timeline View
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedProjects.length} projects • {visibleTasks.length} tasks
              </span>
              {isDemoMode && (
                <div className="flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-300">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Demo Mode
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="relative" style={{ height: `${groupedTasks.length * 100 + visibleTasks.length * rowHeight + 60}px` }}>
          {/* Date labels */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex h-full">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700"
                  >
                    {date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project groups and tasks */}
          {groupedTasks.map((group, groupIndex) => {
            const groupTop = 60 + groupIndex * 100;
            
            return (
              <div key={group.project.id} className="absolute" style={{ top: `${groupTop}px`, left: '0', right: '0' }}>
                {/* Project header row */}
                <div className="absolute left-0 w-64 h-12 flex items-center px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: group.project.color }}
                  />
                  {group.project.name}
                </div>

                {/* Task rows */}
                {group.tasks.map((task, taskIndex) => {
                  const daysFromStart = Math.floor((task.start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
                  
                  const left = daysFromStart * dayWidth;
                  const width = Math.max(1, duration * dayWidth);
                  const top = 60 + taskIndex * rowHeight;

                  return (
                    <div key={task.id} className="absolute" style={{ top: `${top}px`, left: '0', right: '0' }}>
                      {/* Task name */}
                      <div className="absolute left-0 w-64 h-full flex items-center px-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: task.projectColor }}
                        />
                        {task.name}
                      </div>

                      {/* Task bar */}
                      <div
                        className="absolute rounded transition-all duration-200"
                        style={{
                          left: `${left + 256}px`, // 256px for task name column
                          top: `${top + 4}px`,
                          width: `${width}px`,
                          height: `${rowHeight - 8}px`,
                          backgroundColor: task.projectColor,
                          opacity: 0.8
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <GlobeAltIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Multi-Project Timeline Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>
        </div>
      </div>

      {/* Demo Info */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Demo Mode Active
          </h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Maximum projects viewable: {demoConfig.maxProjectsViewable}</li>
            <li>• Tooltip message: "{demoConfig.tooltipMessage}"</li>
            <li>• All content tagged: {demoConfig.projectStateTag}</li>
            <li>• Compare With dropdown disabled beyond limit</li>
            <li>• Color-coded grouping by project</li>
          </ul>
        </div>
      )}

      {/* Multi-Project Controls */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Timeline Controls
        </h2>
        <MultiProjectControls
          onModeChange={handleModeChange}
          onProjectChange={handleProjectChange}
        />
      </div>

      {/* Project Statistics */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Project Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Projects
            </label>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {selectedProjects.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              In comparison
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Tasks
            </label>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {visibleTasks.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Across all projects
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeline Mode
            </label>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timelineMode === 'multi' ? 'Multi' : 'Single'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current view
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grouping
            </label>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {multiProjectService.isGroupByProjectEnabled() ? 'On' : 'Off'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              By project
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {timelineMode === 'multi' ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Multi-Project Timeline
          </h2>
          {renderTimelineView()}
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Single Project View
          </h2>
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Switch to Multi-Project View to see project comparison
          </div>
        </div>
      )}

      {/* Project List View */}
      {timelineMode === 'multi' && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Project Details
          </h2>
          
          <div className="space-y-4">
            {groupedTasks.map(group => (
              <div key={group.project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {renderProjectHeader(group.project)}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.tasks.map(task => renderTaskRow(task))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Project Features */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Multi-Project Features
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Visual Gantt comparison of multiple programmes</li>
          <li>• Colour-coded grouping by project with unique colors</li>
          <li>• Filtering and toggling visibility per project</li>
          <li>• Demo-friendly restrictions and tagging</li>
          <li>• Supabase-backed data fetching and grouping logic</li>
          <li>• Timeline mode switching (Single/Multi-Project)</li>
          <li>• Project selection and comparison controls</li>
          <li>• Group by project toggle functionality</li>
          <li>• Project header rows with client and status info</li>
          <li>• Vertical bands to separate projects visually</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiProjectTimelineDemo; 