import React, { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  FolderOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/outline';
import { structureService, type TaskStructure } from '../../services/structureService';
import StructureControls from './StructureControls';
import { toastService } from './ToastNotification';

// Sample task data with structure
const sampleTasks = [
  {
    id: '1',
    name: 'Project Planning Phase',
    type: 'phase' as const,
    progress: 0,
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
    status: 'in_progress'
  },
  {
    id: '2',
    name: 'Requirements Analysis',
    type: 'task' as const,
    progress: 75,
    start: new Date('2024-01-01'),
    end: new Date('2024-01-15'),
    status: 'in_progress'
  },
  {
    id: '3',
    name: 'System Design',
    type: 'task' as const,
    progress: 50,
    start: new Date('2024-01-16'),
    end: new Date('2024-01-31'),
    status: 'in_progress'
  },
  {
    id: '4',
    name: 'Development Phase',
    type: 'phase' as const,
    progress: 0,
    start: new Date('2024-02-01'),
    end: new Date('2024-03-31'),
    status: 'not_started'
  },
  {
    id: '5',
    name: 'Frontend Development',
    type: 'task' as const,
    progress: 0,
    start: new Date('2024-02-01'),
    end: new Date('2024-02-28'),
    status: 'not_started'
  },
  {
    id: '6',
    name: 'Backend Development',
    type: 'task' as const,
    progress: 0,
    start: new Date('2024-02-15'),
    end: new Date('2024-03-15'),
    status: 'not_started'
  },
  {
    id: '7',
    name: 'Testing Phase',
    type: 'phase' as const,
    progress: 0,
    start: new Date('2024-04-01'),
    end: new Date('2024-04-30'),
    status: 'not_started'
  },
  {
    id: '8',
    name: 'Unit Testing',
    type: 'task' as const,
    progress: 0,
    start: new Date('2024-04-01'),
    end: new Date('2024-04-15'),
    status: 'not_started'
  },
  {
    id: '9',
    name: 'Integration Testing',
    type: 'task' as const,
    progress: 0,
    start: new Date('2024-04-16'),
    end: new Date('2024-04-30'),
    status: 'not_started'
  },
  {
    id: '10',
    name: 'Project Completion',
    type: 'milestone' as const,
    progress: 0,
    start: new Date('2024-05-01'),
    end: new Date('2024-05-01'),
    status: 'not_started'
  }
];

const ProjectStructuresDemo: React.FC = () => {
  const [structures, setStructures] = useState<TaskStructure[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(structureService.isInDemoMode());
  const [collapseAll, setCollapseAll] = useState(false);
  const [showPhases, setShowPhases] = useState(true);

  // Load structures on mount
  useEffect(() => {
    loadStructures();
  }, []);

  // Load structures for project
  const loadStructures = async () => {
    const projectStructures = await structureService.getStructuresForProject('demo-project');
    setStructures(projectStructures);
    setIsDemoMode(structureService.isInDemoMode());
  };

  // Handle structure change
  const handleStructureChange = () => {
    loadStructures();
  };

  // Get demo mode configuration
  const demoConfig = structureService.getDemoModeConfig();

  // Build hierarchical structure
  const hierarchicalTasks = structureService.buildHierarchy(sampleTasks);

  // Get visible tasks
  const visibleTaskIds = structureService.getVisibleTasks(sampleTasks.map(t => t.id));
  const visibleTasks = sampleTasks.filter(task => visibleTaskIds.includes(task.id));

  // Calculate phase statistics
  const phases = structures.filter(s => s.type === 'phase');
  const tasks = structures.filter(s => s.type === 'task');
  const milestones = structures.filter(s => s.type === 'milestone');

  // Render hierarchical task list
  const renderTaskList = (tasks: any[], level: number = 0): React.ReactNode => {
    return tasks.map(task => {
      const structure = structureService.getTaskStructure(task.id);
      const children = structureService.getChildren(task.id);
      const isVisible = structureService.isVisible(task.id);
      
      if (!isVisible) return null;

      return (
        <div key={task.id} className="space-y-1">
          <div className={`flex items-center p-2 rounded border ${
            task.type === 'phase' 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <StructureControls
              taskId={task.id}
              taskName={task.name}
              taskType={task.type}
              level={level}
              collapsed={structure?.collapsed || false}
              hasChildren={children.length > 0}
              onToggleCollapse={handleStructureChange}
              onStructureChange={handleStructureChange}
              className="flex-1"
            />
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className={`px-2 py-1 rounded text-xs ${
                task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                task.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
              <span>{task.progress}%</span>
              <span>{task.start.toLocaleDateString()}</span>
              <span>{task.end.toLocaleDateString()}</span>
            </div>
          </div>
          
          {children.length > 0 && !structure?.collapsed && (
            <div className="ml-4">
              {renderTaskList(children.map(child => sampleTasks.find(t => t.id === child.id)).filter(Boolean), level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Handle collapse all
  const handleCollapseAll = async () => {
    try {
      const phases = structures.filter(s => s.type === 'phase');
      let success = true;
      
      for (const phase of phases) {
        if (phase.collapsed !== collapseAll) {
          const result = await structureService.updateStructure(phase.id, { collapsed: collapseAll });
          if (!result) success = false;
        }
      }
      
      if (success) {
        toastService.success('Success', collapseAll ? 'All phases collapsed' : 'All phases expanded');
        loadStructures();
      } else {
        toastService.error('Error', 'Failed to update some phases');
      }
    } catch (error) {
      console.error('Error collapsing/expanding all:', error);
      toastService.error('Error', 'Failed to update phases');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FolderIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Project Structures Demo
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
            <ExclamationTriangleIconSolid className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>

          {/* Show Phases Toggle */}
          <button
            onClick={() => setShowPhases(!showPhases)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showPhases
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <FolderIcon className="w-4 h-4 mr-2" />
            {showPhases ? 'Hide Phases' : 'Show Phases'}
          </button>

          {/* Collapse All Button */}
          <button
            onClick={handleCollapseAll}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {collapseAll ? (
              <ChevronDownIcon className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 mr-2" />
            )}
            {collapseAll ? 'Expand All' : 'Collapse All'}
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
            <li>• Maximum phases per project: {demoConfig.maxPhasesPerProject}</li>
            <li>• Maximum tasks per phase: {demoConfig.maxTasksPerPhase}</li>
            <li>• Nested phases allowed: {demoConfig.allowNestedPhases ? 'Yes' : 'No'}</li>
            <li>• Tooltip message: "{demoConfig.tooltipMessage}"</li>
            <li>• Structure state tagged: {demoConfig.structureStateTag}</li>
          </ul>
        </div>
      )}

      {/* Structure Statistics */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Structure Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phases
            </label>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {phases.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Collapsible groups
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tasks
            </label>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Work items
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Milestones
            </label>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {milestones.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Key events
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visible Tasks
            </label>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {visibleTasks.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Not collapsed
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchical Task List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Hierarchical Task Structure
        </h2>
        
        <div className="space-y-2">
          {renderTaskList(hierarchicalTasks)}
        </div>
      </div>

      {/* Phase Progress Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Phase Progress Summary
        </h2>
        
        <div className="space-y-3">
          {phases.map(phase => {
            const phaseTask = sampleTasks.find(t => t.id === phase.id);
            const progress = structureService.calculatePhaseProgress(phase.id, sampleTasks);
            
            return (
              <div
                key={phase.id}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FolderOpenIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {phaseTask?.name || 'Phase'}
                    </span>
                    {isDemoMode && (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 ml-2" />
                    )}
                  </div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {Math.round(progress.progress)}% Complete
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
                  <div>
                    <span className="font-medium">Start:</span> {progress.startDate?.toLocaleDateString() || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">End:</span> {progress.endDate?.toLocaleDateString() || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {progress.duration} days
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structure Features */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Structure Features
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Hierarchical task structure with parent-child relationships</li>
          <li>• Collapsible groups/phases in grid and timeline</li>
          <li>• Parent progress aggregation and date calculation</li>
          <li>• Group-based filtering and visibility toggling</li>
          <li>• Supabase-backed structure metadata</li>
          <li>• Demo mode limitations and restrictions</li>
          <li>• Indentation to show hierarchy depth</li>
          <li>• Phase icons and collapse/expand controls</li>
          <li>• Sort order management for task ordering</li>
          <li>• Multi-level nested structure support</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectStructuresDemo; 