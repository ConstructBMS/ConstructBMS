import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  taskCalendarService,
  TaskCalendar,
} from '../../services/taskCalendarService';
import { demoModeService } from '../../services/demoModeService';
import CalendarManagerModal from './CalendarManagerModal';
import TaskScheduleTab from './TaskScheduleTab';

const TaskCalendarsDemo: React.FC = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [calendars, setCalendars] = useState<TaskCalendar[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('demo-task-1');
  const [isCalendarManagerOpen, setIsCalendarManagerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Demo project ID
  const demoProjectId = 'demo-project-1';

  // Demo tasks
  const demoTasks = [
    { id: 'demo-task-1', name: 'Foundation Work', duration: 5 },
    { id: 'demo-task-2', name: 'Electrical Installation', duration: 3 },
    { id: 'demo-task-3', name: 'Weekend Maintenance', duration: 2 },
  ];

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);

      // Check demo mode
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);

      // Load calendars
      const projectCalendars =
        await taskCalendarService.getProjectCalendars(demoProjectId);
      const globalCalendars = await taskCalendarService.getGlobalCalendars();
      setCalendars([...projectCalendars, ...globalCalendars]);

      // Create default demo calendar if none exists
      if (projectCalendars.length === 0 && isDemo) {
        await taskCalendarService.createDefaultDemoCalendar(demoProjectId);
        const updatedCalendars =
          await taskCalendarService.getProjectCalendars(demoProjectId);
        setCalendars([...updatedCalendars, ...globalCalendars]);
      }
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarChange = () => {
    loadDemoData();
  };

  const getDayOfWeekLabel = (day: string): string => {
    const dayLabels: { [key: string]: string } = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
      Sun: 'Sunday',
    };
    return dayLabels[day] || day;
  };

  const getWorkingDaysDisplay = (workingDays: string[]): string => {
    if (workingDays.length === 0) return 'No working days';
    if (workingDays.length === 7) return 'Every day';
    if (
      workingDays.length === 5 &&
      workingDays.includes('Mon') &&
      workingDays.includes('Fri')
    ) {
      return 'Monday - Friday';
    }
    return workingDays.map(getDayOfWeekLabel).join(', ');
  };

  const getHolidayDisplay = (holidays: string[]): string => {
    if (holidays.length === 0) return 'No holidays';
    if (holidays.length === 1) return '1 holiday';
    return `${holidays.length} holidays`;
  };

  if (loading) {
    return (
      <div className='p-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading Task Calendars Demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center space-x-3 mb-4'>
          <CalendarIcon className='w-8 h-8 text-blue-600' />
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Task Calendars & Non-Working Days
          </h1>
          {isDemoMode && (
            <div className='flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm'>
              <ExclamationTriangleIcon className='w-4 h-4' />
              <span>Demo Mode</span>
            </div>
          )}
        </div>
        <p className='text-gray-600 dark:text-gray-400 text-lg'>
          Manage custom working calendars for tasks, define holidays, and
          visualize non-working days in the timeline.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left Column - Calendar Management */}
        <div className='space-y-6'>
          {/* Calendar Manager */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Calendar Management
              </h2>
              <button
                onClick={() => setIsCalendarManagerOpen(true)}
                className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <CalendarIcon className='w-4 h-4' />
                <span>Manage Calendars</span>
              </button>
            </div>

            {/* Available Calendars */}
            <div className='space-y-3'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Available Calendars ({calendars.length})
              </h3>

              {calendars.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <CalendarIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
                  <p>No calendars created yet</p>
                  <p className='text-sm'>
                    Click "Manage Calendars" to create your first calendar
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {calendars.map(calendar => (
                    <div
                      key={calendar.id}
                      className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          {calendar.name}
                        </h4>
                        <div className='flex space-x-1'>
                          {calendar.isGlobal && (
                            <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'>
                              Global
                            </span>
                          )}
                          {calendar.demo && (
                            <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded'>
                              Demo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400'>
                        <div>
                          <span className='font-medium'>Working Days:</span>
                          <p>{getWorkingDaysDisplay(calendar.workingDays)}</p>
                        </div>
                        <div>
                          <span className='font-medium'>Hours:</span>
                          <p>
                            {calendar.dailyHours.start} -{' '}
                            {calendar.dailyHours.end}
                          </p>
                        </div>
                        <div>
                          <span className='font-medium'>Holidays:</span>
                          <p>{getHolidayDisplay(calendar.holidays)}</p>
                        </div>
                        <div>
                          <span className='font-medium'>Created:</span>
                          <p>{calendar.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feature Information */}
          <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6'>
            <div className='flex items-start space-x-3'>
              <InformationCircleIcon className='w-6 h-6 text-blue-600 mt-0.5' />
              <div>
                <h3 className='text-lg font-medium text-blue-900 dark:text-blue-300 mb-2'>
                  How Task Calendars Work
                </h3>
                <ul className='space-y-2 text-sm text-blue-800 dark:text-blue-300'>
                  <li className='flex items-start space-x-2'>
                    <CheckIcon className='w-4 h-4 mt-0.5 flex-shrink-0' />
                    <span>
                      Tasks respect their assigned calendar for duration
                      calculations
                    </span>
                  </li>
                  <li className='flex items-start space-x-2'>
                    <CheckIcon className='w-4 h-4 mt-0.5 flex-shrink-0' />
                    <span>
                      Non-working days are excluded from task schedules
                    </span>
                  </li>
                  <li className='flex items-start space-x-2'>
                    <CheckIcon className='w-4 h-4 mt-0.5 flex-shrink-0' />
                    <span>
                      Global calendars are available across all projects
                    </span>
                  </li>
                  <li className='flex items-start space-x-2'>
                    <CheckIcon className='w-4 h-4 mt-0.5 flex-shrink-0' />
                    <span>
                      Tasks without assigned calendars use the project default
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Task Schedule Assignment */}
        <div className='space-y-6'>
          {/* Task Schedule Assignment */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              Task Schedule Assignment
            </h2>

            {/* Task Selector */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Select Task
              </label>
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                {demoTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({task.duration} days)
                  </option>
                ))}
              </select>
            </div>

            {/* Task Schedule Tab */}
            <div className='border border-gray-200 dark:border-gray-700 rounded-lg'>
              <TaskScheduleTab
                taskId={selectedTaskId}
                projectId={demoProjectId}
                isDemoMode={isDemoMode}
              />
            </div>
          </div>

          {/* Timeline Preview */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              Timeline Preview
            </h2>

            <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                Non-working days are shown as greyed-out bands in the timeline
              </div>

              {/* Mock Timeline */}
              <div className='relative h-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded overflow-hidden'>
                {/* Working days */}
                <div className='absolute inset-0 bg-green-50 dark:bg-green-900/10'></div>

                {/* Weekend bands */}
                <div className='absolute top-0 bottom-0 left-[120px] w-[40px] bg-gray-100 dark:bg-gray-700 opacity-50'></div>
                <div className='absolute top-0 bottom-0 left-[200px] w-[40px] bg-gray-100 dark:bg-gray-700 opacity-50'></div>
                <div className='absolute top-0 bottom-0 left-[280px] w-[40px] bg-gray-100 dark:bg-gray-700 opacity-50'></div>

                {/* Holiday band */}
                <div className='absolute top-0 bottom-0 left-[360px] w-[40px] bg-red-100 dark:bg-red-900/20 opacity-60'></div>

                {/* Day labels */}
                <div className='absolute bottom-0 left-0 right-0 flex text-xs text-gray-500'>
                  <div className='flex-1 text-center py-1'>Mon</div>
                  <div className='flex-1 text-center py-1'>Tue</div>
                  <div className='flex-1 text-center py-1'>Wed</div>
                  <div className='flex-1 text-center py-1'>Thu</div>
                  <div className='flex-1 text-center py-1'>Fri</div>
                  <div className='flex-1 text-center py-1'>Sat</div>
                  <div className='flex-1 text-center py-1'>Sun</div>
                  <div className='flex-1 text-center py-1'>Mon</div>
                  <div className='flex-1 text-center py-1'>Tue</div>
                  <div className='flex-1 text-center py-1'>Wed</div>
                  <div className='flex-1 text-center py-1'>Thu</div>
                </div>
              </div>

              <div className='mt-3 flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400'>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-green-50 dark:bg-green-900/10 border border-gray-300'></div>
                  <span>Working Days</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-gray-100 dark:bg-gray-700 opacity-50 border border-gray-300'></div>
                  <span>Weekends</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-red-100 dark:bg-red-900/20 opacity-60 border border-gray-300'></div>
                  <span>Holidays</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Mode Information */}
          {isDemoMode && (
            <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
              <div className='flex items-start space-x-2'>
                <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600 mt-0.5' />
                <div className='text-sm text-yellow-800 dark:text-yellow-300'>
                  <p className='font-medium mb-1'>Demo Mode Restrictions</p>
                  <ul className='space-y-1'>
                    <li>• Maximum 1 calendar allowed</li>
                    <li>• Calendar editing is limited</li>
                    <li>• Holiday editing is disabled</li>
                    <li>• Only default calendar is editable</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Manager Modal */}
      <CalendarManagerModal
        isOpen={isCalendarManagerOpen}
        onClose={() => setIsCalendarManagerOpen(false)}
        projectId={demoProjectId}
        onCalendarChange={handleCalendarChange}
      />
    </div>
  );
};

export default TaskCalendarsDemo;
