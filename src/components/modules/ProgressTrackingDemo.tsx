import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  CalculatorIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { progressTrackingService } from '../../services/progressTrackingService';
import {
  taskProgressIntegration,
  type TaskWithProgress,
} from '../../services/taskProgressIntegration';
import { demoModeService } from '../../services/demoModeService';
import ProgressColumn from './ProgressColumn';
import TimelineProgressBar from './TimelineProgressBar';
import ProgressTab from './ribbonTabs/ProgressTab';

const ProgressTrackingDemo: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showProgressBars, setShowProgressBars] = useState(true);
  const [showActualMarkers, setShowActualMarkers] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load demo data
  useEffect(() => {
    loadDemoData();
    checkDemoMode();
  }, []);

  const loadDemoData = async () => {
    setLoading(true);
    try {
      // Initialize demo project if needed
      await initializeDemoProject();

      // Load tasks with progress
      const demoTasks =
        await taskProgressIntegration.getTasksWithProgress('demo-project');
      setTasks(demoTasks);

      // Load project stats
      const stats =
        await taskProgressIntegration.getProjectProgressStats('demo-project');
      setProjectStats(stats);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDemoProject = async () => {
    try {
      // Import and run the initialization script
      const { initializeProgressDemo } = await import(
        '../../scripts/initializeProgressDemo'
      );
      await initializeProgressDemo();
    } catch (error) {
      console.error('Error initializing demo project:', error);
    }
  };

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.getDemoMode();
    setIsDemoMode(isDemo);
  };

  // Handle progress change
  const handleProgressChange = async (taskId: string, newProgress: number) => {
    try {
      const success = await taskProgressIntegration.updateTaskProgressWithSync({
        taskId,
        percentComplete: newProgress,
      });

      if (success) {
        // Reload data
        await loadDemoData();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Open progress tracking modal
  const openProgressModal = (taskId: string) => {
    setSelectedTask(taskId);
    setShowProgressModal(true);
  };

  // Toggle demo mode
  const toggleDemoMode = async () => {
    // In a real app, you'd toggle demo mode through the service
    setIsDemoMode(!isDemoMode);
    console.log('Demo mode toggled:', !isDemoMode);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>
          Loading progress tracking demo...
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Progress Tracking Demo
          </h2>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setShowProgressBars(!showProgressBars)}
              className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              {showProgressBars ? (
                <EyeSlashIcon className='h-4 w-4 mr-2' />
              ) : (
                <EyeIcon className='h-4 w-4 mr-2' />
              )}
              {showProgressBars ? 'Hide' : 'Show'} Progress Bars
            </button>
            <button
              onClick={toggleDemoMode}
              className={`flex items-center px-3 py-2 rounded-md ${
                isDemoMode
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <CogIcon className='h-4 w-4 mr-2' />
              {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
            </button>
          </div>
        </div>

        {/* Project Statistics */}
        {projectStats && (
          <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
            <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {projectStats.totalTasks}
              </div>
              <div className='text-sm text-blue-600'>Total Tasks</div>
            </div>
            <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {projectStats.completedTasks}
              </div>
              <div className='text-sm text-green-600'>Completed</div>
            </div>
            <div className='bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg'>
              <div className='text-2xl font-bold text-yellow-600'>
                {projectStats.inProgressTasks}
              </div>
              <div className='text-sm text-yellow-600'>In Progress</div>
            </div>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
              <div className='text-2xl font-bold text-gray-600'>
                {projectStats.notStartedTasks}
              </div>
              <div className='text-sm text-gray-600'>Not Started</div>
            </div>
            <div className='bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>
                {projectStats.averageProgress}%
              </div>
              <div className='text-sm text-purple-600'>Avg Progress</div>
            </div>
            <div className='bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg'>
              <div className='text-2xl font-bold text-orange-600'>
                {projectStats.demoTasks}
              </div>
              <div className='text-sm text-orange-600'>Demo Tasks</div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
          <div className='flex items-start'>
            <ExclamationTriangleIcon className='h-5 w-5 text-orange-600 mt-0.5 mr-2' />
            <div className='text-sm text-orange-800'>
              <p className='font-medium'>Demo Mode Active</p>
              <p className='mt-1'>
                Progress is limited to 75%, actual dates are disabled, and only
                10 tasks can be edited. Upgrade to track full progress and
                actual dates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
        <div className='flex items-center space-x-4'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={showActualMarkers}
              onChange={e => setShowActualMarkers(e.target.checked)}
              className='mr-2'
            />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              Show Actual Date Markers
            </span>
          </label>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Tasks with Progress
          </h3>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Task
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Progress
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Timeline Bar
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Actual Dates
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {tasks.map(task => (
                <tr
                  key={task.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900 dark:text-white'>
                        {task.name}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {task.startDate.toLocaleDateString()} -{' '}
                        {task.endDate.toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <ProgressColumn
                      taskId={task.id}
                      progress={task.percentComplete}
                      isDemo={task.demo}
                      isEditable={true}
                      onProgressChange={handleProgressChange}
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {showProgressBars && (
                      <div className='w-32'>
                        <TimelineProgressBar
                          taskId={task.id}
                          progress={task.percentComplete}
                          isDemo={task.demo}
                          showActualMarkers={showActualMarkers}
                          actualStartDate={task.actualStartDate}
                          actualFinishDate={task.actualFinishDate}
                          height='h-4'
                        />
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    <div className='space-y-1'>
                      <div className='flex items-center'>
                        <CalendarIcon className='h-3 w-3 mr-1' />
                        Start:{' '}
                        {task.actualStartDate
                          ? new Date(task.actualStartDate).toLocaleDateString()
                          : 'Not set'}
                      </div>
                      <div className='flex items-center'>
                        <CheckCircleIcon className='h-3 w-3 mr-1' />
                        Finish:{' '}
                        {task.actualFinishDate
                          ? new Date(task.actualFinishDate).toLocaleDateString()
                          : 'Not set'}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => openProgressModal(task.id)}
                      className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      Edit Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Modal */}
      {showProgressModal && selectedTask && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Edit Task Progress
                </h3>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <ProgressTab
                taskId={selectedTask}
                projectId='demo-project'
                isDemoMode={isDemoMode}
                onProgressUpdate={(taskId, progress) => {
                  handleProgressChange(taskId, progress);
                  setShowProgressModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTrackingDemo;
