import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { criticalPathService } from '../../services/criticalPathService';
import { demoModeService } from '../../services/demoModeService';
import CriticalPathSection from '../ribbonTabs/CriticalPathSection';

interface DemoTask {
  dependencies: string[];
  duration: number;
  end: Date;
  id: string;
  isCritical: boolean;
  isMilestone: boolean;
  name: string;
  progress: number;
  start: Date;
  totalFloat: number;
}

interface DemoDependency {
  id: string;
  lag: number;
  sourceTaskId: string;
  targetTaskId: string;
  type:
    | 'finish-to-start'
    | 'start-to-start'
    | 'finish-to-finish'
    | 'start-to-finish';
}

const CriticalPathDemo: React.FC = () => {
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoConfig, setDemoConfig] = useState(
    criticalPathService.getDemoModeConfig()
  );
  const [loading, setLoading] = useState({
    toggle: false,
    criticalOnly: false,
  });

  // Sample demo data
  const [demoTasks, setDemoTasks] = useState<DemoTask[]>([
    {
      id: '1',
      name: 'Project Planning',
      start: new Date('2024-01-01'),
      end: new Date('2024-01-05'),
      duration: 5,
      isCritical: true,
      totalFloat: 0,
      dependencies: [],
      isMilestone: false,
      progress: 100,
    },
    {
      id: '2',
      name: 'Design Phase',
      start: new Date('2024-01-06'),
      end: new Date('2024-01-15'),
      duration: 10,
      isCritical: true,
      totalFloat: 0,
      dependencies: ['1'],
      isMilestone: false,
      progress: 80,
    },
    {
      id: '3',
      name: 'Design Review',
      start: new Date('2024-01-16'),
      end: new Date('2024-01-16'),
      duration: 1,
      isCritical: true,
      totalFloat: 0,
      dependencies: ['2'],
      isMilestone: true,
      progress: 0,
    },
    {
      id: '4',
      name: 'Development',
      start: new Date('2024-01-17'),
      end: new Date('2024-02-15'),
      duration: 30,
      isCritical: true,
      totalFloat: 0,
      dependencies: ['3'],
      isMilestone: false,
      progress: 60,
    },
    {
      id: '5',
      name: 'Documentation',
      start: new Date('2024-01-20'),
      end: new Date('2024-02-10'),
      duration: 22,
      isCritical: false,
      totalFloat: 5,
      dependencies: ['2'],
      isMilestone: false,
      progress: 40,
    },
    {
      id: '6',
      name: 'Testing',
      start: new Date('2024-02-16'),
      end: new Date('2024-02-25'),
      duration: 10,
      isCritical: true,
      totalFloat: 0,
      dependencies: ['4'],
      isMilestone: false,
      progress: 20,
    },
    {
      id: '7',
      name: 'Project Complete',
      start: new Date('2024-02-26'),
      end: new Date('2024-02-26'),
      duration: 1,
      isCritical: true,
      totalFloat: 0,
      dependencies: ['6'],
      isMilestone: true,
      progress: 0,
    },
  ]);

  const [demoDependencies] = useState<DemoDependency[]>([
    {
      id: 'dep1',
      sourceTaskId: '1',
      targetTaskId: '2',
      type: 'finish-to-start',
      lag: 0,
    },
    {
      id: 'dep2',
      sourceTaskId: '2',
      targetTaskId: '3',
      type: 'finish-to-start',
      lag: 0,
    },
    {
      id: 'dep3',
      sourceTaskId: '3',
      targetTaskId: '4',
      type: 'finish-to-start',
      lag: 0,
    },
    {
      id: 'dep4',
      sourceTaskId: '2',
      targetTaskId: '5',
      type: 'finish-to-start',
      lag: 0,
    },
    {
      id: 'dep5',
      sourceTaskId: '4',
      targetTaskId: '6',
      type: 'finish-to-start',
      lag: 0,
    },
    {
      id: 'dep6',
      sourceTaskId: '6',
      targetTaskId: '7',
      type: 'finish-to-start',
      lag: 0,
    },
  ]);

  useEffect(() => {
    const checkDemoMode = async () => {
      const demo = await demoModeService.getDemoMode();
      setIsDemoMode(demo);
    };
    checkDemoMode();
  }, []);

  const handleToggleCriticalPath = async () => {
    setLoading(prev => ({ ...prev, toggle: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowCriticalPath(!showCriticalPath);
    } finally {
      setLoading(prev => ({ ...prev, toggle: false }));
    }
  };

  const handleToggleCriticalOnly = async () => {
    if (!showCriticalPath || isDemoMode) return;

    setLoading(prev => ({ ...prev, criticalOnly: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setCriticalOnly(!criticalOnly);
    } finally {
      setLoading(prev => ({ ...prev, criticalOnly: false }));
    }
  };

  const getVisibleTasks = () => {
    if (criticalOnly && showCriticalPath) {
      return demoTasks.filter(task => task.isCritical);
    }
    return demoTasks;
  };

  const getTaskColor = (task: DemoTask) => {
    const isCritical = showCriticalPath && task.isCritical;
    if (isCritical) {
      return 'bg-red-100 border-red-500 text-red-700';
    }
    return 'bg-gray-50 border-gray-300 text-gray-700';
  };

  const getFloatDisplay = (float: number) => {
    if (float === 0) {
      return <span className='text-red-600 font-semibold'>0d float</span>;
    }
    return <span className='text-green-600'>+{float}d float</span>;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Critical Path Highlighting Demo
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>
              Interactive demonstration of critical path detection and
              visualization
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <ExclamationTriangleIcon className='w-8 h-8 text-red-500' />
            <span className='text-sm font-medium text-gray-500'>
              Programme Manager v2
            </span>
          </div>
        </div>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className='bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4 mb-4'>
            <div className='flex items-center space-x-2'>
              <InformationCircleIcon className='w-5 h-5 text-pink-600 dark:text-pink-400' />
              <span className='font-medium text-pink-800 dark:text-pink-200'>
                Demo Mode Active
              </span>
            </div>
            <p className='text-pink-700 dark:text-pink-300 mt-1'>
              Limited to {demoConfig.maxCriticalTasks} critical tasks.{' '}
              {demoConfig.watermark}
            </p>
          </div>
        )}

        {/* Critical Path Controls */}
        <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
          <CriticalPathSection
            showCriticalPath={showCriticalPath}
            criticalOnly={criticalOnly}
            onToggleCriticalPath={handleToggleCriticalPath}
            onToggleCriticalOnly={handleToggleCriticalOnly}
            disabled={false}
            loading={loading}
          />
        </div>
      </div>

      {/* Critical Path Information */}
      {showCriticalPath && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <div className='critical-path-info'>
            <div className='critical-path-info-header'>
              <ExclamationTriangleIcon className='w-5 h-5' />
              <span>Critical Path Analysis</span>
            </div>
            <div className='critical-path-info-content'>
              <p className='mb-3'>
                The critical path is the sequence of tasks that determines the
                minimum time needed to complete the project. Any delay in these
                tasks will delay the entire project.
              </p>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                <div className='critical-path-stat'>
                  <div className='critical-path-stat-value'>
                    {demoTasks.filter(t => t.isCritical).length}
                  </div>
                  <div className='critical-path-stat-label'>Critical Tasks</div>
                </div>
                <div className='critical-path-stat'>
                  <div className='critical-path-stat-value'>
                    {demoTasks
                      .filter(t => t.isCritical)
                      .reduce((sum, t) => sum + t.duration, 0)}
                    d
                  </div>
                  <div className='critical-path-stat-label'>
                    Critical Path Duration
                  </div>
                </div>
                <div className='critical-path-stat'>
                  <div className='critical-path-stat-value'>
                    {demoTasks.filter(t => !t.isCritical).length}
                  </div>
                  <div className='critical-path-stat-label'>
                    Non-Critical Tasks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Project Tasks
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {criticalOnly && showCriticalPath
              ? 'Showing critical tasks only'
              : 'All project tasks with critical path highlighting'}
          </p>
        </div>

        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {getVisibleTasks().map(task => (
            <div
              key={task.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                showCriticalPath && task.isCritical
                  ? 'critical-path-selected'
                  : ''
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {/* Task Icon */}
                  <div className='flex-shrink-0'>
                    {task.isMilestone ? (
                      <div
                        className={`w-6 h-6 transform rotate-45 border-2 ${
                          showCriticalPath && task.isCritical
                            ? 'border-red-500 bg-red-500'
                            : 'border-blue-500 bg-blue-500'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-6 h-6 rounded border-2 ${
                          showCriticalPath && task.isCritical
                            ? 'border-red-500 bg-red-100'
                            : 'border-gray-300 bg-gray-100'
                        }`}
                      />
                    )}
                  </div>

                  {/* Task Info */}
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <h3 className='font-medium text-gray-900 dark:text-white'>
                        {task.name}
                      </h3>
                      {task.isMilestone && (
                        <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded'>
                          Milestone
                        </span>
                      )}
                      {showCriticalPath && task.isCritical && (
                        <span className='critical-path-badge px-2 py-1 text-xs rounded'>
                          Critical
                        </span>
                      )}
                    </div>

                    <div className='flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400'>
                      <span className='flex items-center space-x-1'>
                        <ClockIcon className='w-4 h-4' />
                        <span>{task.duration}d</span>
                      </span>
                      <span>
                        {task.start.toLocaleDateString()} -{' '}
                        {task.end.toLocaleDateString()}
                      </span>
                      {getFloatDisplay(task.totalFloat)}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className='flex items-center space-x-3'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${getProgressColor(task.progress)}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className='text-sm text-gray-600 dark:text-gray-400 w-8'>
                      {task.progress}%
                    </span>
                  </div>

                  {task.progress === 100 ? (
                    <CheckCircleIcon className='w-5 h-5 text-green-500' />
                  ) : task.progress === 0 ? (
                    <XCircleIcon className='w-5 h-5 text-gray-400' />
                  ) : (
                    <ChartBarIcon className='w-5 h-5 text-blue-500' />
                  )}
                </div>
              </div>

              {/* Dependencies */}
              {task.dependencies.length > 0 && (
                <div className='mt-3 pt-3 border-t border-gray-100 dark:border-gray-700'>
                  <div className='flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400'>
                    <span>Depends on:</span>
                    {task.dependencies.map((depId, index) => {
                      const depTask = demoTasks.find(t => t.id === depId);
                      return (
                        <span
                          key={depId}
                          className='text-blue-600 dark:text-blue-400'
                        >
                          {depTask?.name}
                          {index < task.dependencies.length - 1 && ', '}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Critical Path Legend
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='critical-path-legend-item'>
            <div className='critical-path-legend-color task'></div>
            <span>Critical Task</span>
          </div>
          <div className='critical-path-legend-item'>
            <div className='critical-path-legend-color milestone'></div>
            <span>Critical Milestone</span>
          </div>
          <div className='critical-path-legend-item'>
            <div className='critical-path-legend-color link'></div>
            <span>Critical Dependency</span>
          </div>
          <div className='critical-path-legend-item'>
            <div className='w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded'></div>
            <span>Non-Critical Task</span>
          </div>
          <div className='critical-path-legend-item'>
            <div className='w-4 h-4 transform rotate-45 border-2 border-blue-500 bg-blue-500'></div>
            <span>Non-Critical Milestone</span>
          </div>
          <div className='critical-path-legend-item'>
            <div className='w-4 h-4 bg-green-500 rounded-full'></div>
            <span>Completed Task</span>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Critical Path Features
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
              Automatic Detection
            </h4>
            <ul className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
              <li>• Calculates critical path using CPM algorithm</li>
              <li>• Identifies tasks with zero total float</li>
              <li>• Supports all dependency types (FS, SS, FF, SF)</li>
              <li>• Real-time updates when tasks change</li>
            </ul>
          </div>

          <div>
            <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
              Visual Highlighting
            </h4>
            <ul className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
              <li>• Red bars for critical tasks</li>
              <li>• Red diamonds for critical milestones</li>
              <li>• Bold red arrows for critical dependencies</li>
              <li>• Pulsing animation for emphasis</li>
            </ul>
          </div>

          <div>
            <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
              Interactive Controls
            </h4>
            <ul className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
              <li>• Toggle critical path visibility</li>
              <li>• Critical-only view mode</li>
              <li>• Float time display</li>
              <li>• Tooltip information</li>
            </ul>
          </div>

          <div>
            <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
              Demo Mode
            </h4>
            <ul className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
              <li>• Limited to 5 critical tasks</li>
              <li>• Critical-only view disabled</li>
              <li>• Demo watermark on tooltips</li>
              <li>• All data tagged as demo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalPathDemo;
