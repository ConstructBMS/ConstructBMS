import React, { useState, useEffect } from 'react';
import { 
  ArrowsPointingOutIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { taskResizeService, type ResizeConstraint } from '../../services/taskResizeService';
import ResizableGanttBar from './ResizableGanttBar';
import SnapToGridSettings from './SnapToGridSettings';
import ResizeConstraintSettings from './ResizeConstraintSettings';
import { toastService } from './ToastNotification';

// Sample task data for demo
const sampleTasks = [
  {
    id: '1',
    name: 'Project Planning',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    progress: 100,
    isCritical: true
  },
  {
    id: '2',
    name: 'Requirements Analysis',
    startDate: new Date('2024-01-16'),
    endDate: new Date('2024-01-25'),
    progress: 80,
    isCritical: true
  },
  {
    id: '3',
    name: 'Design Phase',
    startDate: new Date('2024-01-26'),
    endDate: new Date('2024-02-10'),
    progress: 60,
    isCritical: false
  },
  {
    id: '4',
    name: 'Development',
    startDate: new Date('2024-02-11'),
    endDate: new Date('2024-03-15'),
    progress: 30,
    isCritical: false
  },
  {
    id: '5',
    name: 'Testing',
    startDate: new Date('2024-03-16'),
    endDate: new Date('2024-03-30'),
    progress: 10,
    isCritical: false
  },
  {
    id: '6',
    name: 'Project Milestone',
    startDate: new Date('2024-03-31'),
    endDate: new Date('2024-03-31'),
    progress: 0,
    isCritical: false
  }
];

const TaskResizeDemo: React.FC = () => {
  const [tasks, setTasks] = useState(sampleTasks);
  const [snapConfig, setSnapConfig] = useState<{
    enabled: boolean;
    type: 'day' | 'week' | 'month';
    gridWidth: number;
  }>({
    enabled: true,
    type: 'day',
    gridWidth: 20
  });
  const [constraints, setConstraints] = useState<ResizeConstraint>({
    minDuration: 1,
    maxDuration: 365,
    enforceDependencies: true,
    allowOverlap: false
  });
  const [dayWidth, setDayWidth] = useState(20);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  // Toggle demo mode
  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    console.log('Demo mode:', !isDemoMode);
  };

  // Handle task resize
  const handleTaskResize = (taskId: string, newStart: Date, newEnd: Date) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, startDate: newStart, endDate: newEnd }
          : task
      )
    );
  };

  // Handle dependency recalculation
  const handleDependencyRecalculate = () => {
    // This would trigger dependency recalculation in a real app
    console.log('Dependencies recalculated');
  };

  // Handle progress change
  const handleProgressChange = (taskId: string, newProgress: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, progress: newProgress }
          : task
      )
    );
  };

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId);
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Get demo mode configuration
  const demoConfig = taskResizeService.getDemoModeConfig();

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ArrowsPointingOutIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Task Resize Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>

          {/* Snap-to-Grid Settings */}
          <SnapToGridSettings
            snapConfig={snapConfig}
            onSnapConfigChange={setSnapConfig}
            dayWidth={dayWidth}
          />

          {/* Constraint Settings */}
          <ResizeConstraintSettings
            constraints={constraints}
            onConstraintsChange={setConstraints}
          />
        </div>
      </div>

      {/* Demo Info */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Demo Mode Active
          </h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Resize only enabled for first {demoConfig.maxResizableTasks} tasks</li>
            <li>• Maximum resize is ±{demoConfig.maxResizeDays} days from original</li>
            <li>• Undo limited to {demoConfig.maxUndoActions} action</li>
            <li>• All actions tagged as demo</li>
          </ul>
        </div>
      )}

      {/* Settings Panel */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day Width (pixels)
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={dayWidth}
              onChange={(e) => setDayWidth(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{dayWidth}px per day</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Snap-to-Grid
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {snapConfig.enabled ? 'Enabled' : 'Disabled'} - {snapConfig.type}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration Constraints
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {constraints.minDuration}-{constraints.maxDuration} days
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dependencies
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {constraints.enforceDependencies ? 'Enforced' : 'Not enforced'}
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Gantt Chart - Drag Edges to Resize Tasks
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-4">
            {tasks.map((task, index) => {
              const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
              const isMilestone = duration === 0;
              
              return (
                <div key={task.id} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {task.name}
                  </div>
                  <div className="flex-1 relative">
                    <ResizableGanttBar
                      taskId={task.id}
                      taskName={task.name}
                      startDate={task.startDate}
                      endDate={task.endDate}
                      progress={task.progress}
                      isCritical={task.isCritical}
                      isDemo={isDemoMode}
                      showProgress={true}
                      height={24}
                      dayWidth={dayWidth}
                      snapConfig={snapConfig}
                      constraints={constraints}
                      onProgressChange={handleProgressChange}
                      onTaskClick={handleTaskClick}
                      onTaskResize={handleTaskResize}
                      onDependencyRecalculate={handleDependencyRecalculate}
                    />
                  </div>
                  <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                    {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                  </div>
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                    {duration} days
                  </div>
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                    {task.progress}%
                  </div>
                  {task.isCritical && (
                    <div className="w-20">
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
                        Critical
                      </span>
                    </div>
                  )}
                  {isMilestone && (
                    <div className="w-20">
                      <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 px-2 py-1 rounded">
                        Milestone
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          How to Use
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Hover over task bars to see resize handles on left and right edges</li>
          <li>• Drag left edge to adjust start date (task duration changes)</li>
          <li>• Drag right edge to adjust end date (task duration changes)</li>
          <li>• Milestones (0-day tasks) cannot be resized</li>
          <li>• Tasks with constraint violations will be highlighted in red</li>
          <li>• Configure constraints and snap-to-grid settings using the buttons above</li>
          <li>• Toggle demo mode to see limitations and restrictions</li>
        </ul>
      </div>

      {/* Constraint Examples */}
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Constraint Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700 dark:text-yellow-300">
          <div>
            <h4 className="font-medium mb-1">Dependency Violations:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Resizing "Requirements Analysis" to overlap with "Project Planning"</li>
              <li>• Resizing "Design Phase" to start before "Requirements Analysis" ends</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Duration Violations:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Making task duration less than {constraints.minDuration} day</li>
              <li>• Making task duration more than {constraints.maxDuration} days</li>
              <li>• Making end date before start date</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Visual Legend */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Visual Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Normal Task</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Critical Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded ring-2 ring-red-300"></div>
            <span className="text-gray-700 dark:text-gray-300">Constraint Violation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskResizeDemo; 