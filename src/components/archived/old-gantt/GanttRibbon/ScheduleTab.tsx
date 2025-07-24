import React, { useState } from 'react';
import {
  CalculatorIcon,
  CalendarIcon,
  ArrowPathIcon,
  LockClosedIcon,
  LockOpenIcon,
  MapIcon,
  ClockIcon,
  UserGroupIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

export const ScheduleTab: React.FC = () => {
  const { state, updateLayoutSettings } = useProjectView();
  const { layoutSettings } = state;
  const { canAccess } = usePermissions();

  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Schedule-specific state
  const [scheduleFromDate, setScheduleFromDate] = useState<Date>(new Date());
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showTotalFloat, setShowTotalFloat] = useState(false);
  const [constraintsEnabled, setConstraintsEnabled] = useState(true);
  const [resourceLevelingEnabled, setResourceLevelingEnabled] = useState(false);

  const can = (key: string) => canAccess(`gantt.schedule.${key}`);

  const handleScheduleAction = (action: string, payload?: any) => {
    if (!can(action)) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for schedule action: ' + action,
      });
      return;
    }

    try {
      switch (action) {
        case 'calculate-schedule':
          console.log('Calculating project schedule...');
          setOperationStatus({
            type: 'success',
            message: 'Project schedule recalculated successfully',
          });
          break;

        case 'schedule-from-date':
          openModal('schedule-from-date');
          break;

        case 'reschedule-tasks':
          console.log('Rescheduling selected tasks...');
          setOperationStatus({
            type: 'success',
            message: 'Tasks rescheduled successfully',
          });
          break;

        case 'toggle-constraints':
          const newConstraintsEnabled = !constraintsEnabled;
          setConstraintsEnabled(newConstraintsEnabled);
          console.log(
            'Constraints:',
            newConstraintsEnabled ? 'enabled' : 'disabled'
          );
          setOperationStatus({
            type: 'success',
            message: `Constraints ${newConstraintsEnabled ? 'enabled' : 'disabled'}`,
          });
          break;

        case 'remove-constraints':
          console.log('Removing constraints from selected tasks...');
          setOperationStatus({
            type: 'success',
            message: 'Constraints removed from selected tasks',
          });
          break;

        case 'show-critical-path':
          const newShowCriticalPath = !showCriticalPath;
          setShowCriticalPath(newShowCriticalPath);
          updateLayoutSettings({ showCriticalPath: newShowCriticalPath });
          setOperationStatus({
            type: 'success',
            message: `Critical path ${newShowCriticalPath ? 'shown' : 'hidden'}`,
          });
          break;

        case 'show-total-float':
          const newShowTotalFloat = !showTotalFloat;
          setShowTotalFloat(newShowTotalFloat);
          console.log('Total float:', newShowTotalFloat ? 'shown' : 'hidden');
          setOperationStatus({
            type: 'success',
            message: `Total float ${newShowTotalFloat ? 'shown' : 'hidden'}`,
          });
          break;

        case 'level-resources':
          console.log('Starting resource leveling...');
          setResourceLevelingEnabled(true);
          setOperationStatus({
            type: 'success',
            message: 'Resource leveling completed',
          });
          break;

        case 'clear-leveling':
          console.log('Clearing resource leveling...');
          setResourceLevelingEnabled(false);
          setOperationStatus({
            type: 'success',
            message: 'Resource leveling cleared',
          });
          break;

        case 'schedule-settings':
          openModal('schedule-settings');
          break;

        case 'constraint-manager':
          openModal('constraint-manager');
          break;

        case 'leveling-settings':
          openModal('leveling-settings');
          break;
      }
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: `Failed to execute schedule action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const openModal = (id: string) => setModal(id);

  // Clear status message after 3 seconds
  React.useEffect(() => {
    if (operationStatus) {
      const timer = setTimeout(() => setOperationStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  return (
    <>
      <div className='flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200'>
        {/* Scheduling Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleScheduleAction('calculate-schedule')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors'
              title='Calculate Schedule'
            >
              <CalculatorIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Calculate</span>
            </button>
            <button
              onClick={() => handleScheduleAction('schedule-from-date')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors'
              title='Schedule From Date'
            >
              <CalendarIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>From Date</span>
            </button>
            <button
              onClick={() => handleScheduleAction('reschedule-tasks')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors'
              title='Reschedule Tasks'
            >
              <ArrowPathIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Reschedule</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Scheduling</div>
        </div>

        {/* Constraints Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleScheduleAction('toggle-constraints')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                constraintsEnabled
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-white hover:bg-green-50'
              }`}
              title='Toggle Constraints'
            >
              {constraintsEnabled ? (
                <LockClosedIcon className='h-5 w-5 mb-1' />
              ) : (
                <LockOpenIcon className='h-5 w-5 mb-1' />
              )}
              <span className='text-xs'>Constraints</span>
            </button>
            <button
              onClick={() => handleScheduleAction('remove-constraints')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors'
              title='Remove Constraints'
            >
              <XMarkIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Remove</span>
            </button>
            <button
              onClick={() => handleScheduleAction('constraint-manager')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors'
              title='Constraint Manager'
            >
              <CogIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Manager</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Constraints</div>
        </div>

        {/* Float & Paths Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleScheduleAction('show-critical-path')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                showCriticalPath
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white hover:bg-red-50'
              }`}
              title='Show Critical Path'
            >
              <MapIcon className='h-5 w-5 mb-1' />
              <span className='text-xs'>Critical Path</span>
            </button>
            <button
              onClick={() => handleScheduleAction('show-total-float')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                showTotalFloat
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white hover:bg-blue-50'
              }`}
              title='Show Total Float'
            >
              <ClockIcon className='h-5 w-5 mb-1' />
              <span className='text-xs'>Total Float</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Float & Paths</div>
        </div>

        {/* Resource Leveling Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleScheduleAction('level-resources')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                resourceLevelingEnabled
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'bg-white hover:bg-purple-50'
              }`}
              title='Level Resources'
            >
              <UserGroupIcon className='h-5 w-5 mb-1' />
              <span className='text-xs'>Level Now</span>
            </button>
            <button
              onClick={() => handleScheduleAction('clear-leveling')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-yellow-50 rounded transition-colors'
              title='Clear Leveling'
            >
              <XMarkIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Clear</span>
            </button>
            <button
              onClick={() => handleScheduleAction('leveling-settings')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-indigo-50 rounded transition-colors'
              title='Leveling Settings'
            >
              <CogIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Settings</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>
            Resource Leveling
          </div>
        </div>

        {/* Schedule Settings Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleScheduleAction('schedule-settings')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors'
              title='Schedule Settings'
            >
              <CogIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Settings</span>
            </button>
            <button
              onClick={() => handleScheduleAction('calculate-schedule')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors'
              title='Recalculate All'
            >
              <ChartBarIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Recalculate</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Settings</div>
        </div>

        {/* Current Status Display */}
        <div className='flex flex-col justify-end ml-auto'>
          <div className='text-xs text-gray-500'>
            Critical Path: {showCriticalPath ? 'On' : 'Off'}
          </div>
          <div className='text-xs text-gray-500'>
            Total Float: {showTotalFloat ? 'On' : 'Off'}
          </div>
          <div className='text-xs text-gray-500'>
            Constraints: {constraintsEnabled ? 'On' : 'Off'}
          </div>
          <div className='text-xs text-gray-500'>
            Leveling: {resourceLevelingEnabled ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {operationStatus && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
            operationStatus.type === 'success'
              ? 'bg-green-100 border border-green-300 text-green-800'
              : operationStatus.type === 'error'
                ? 'bg-red-100 border border-red-300 text-red-800'
                : 'bg-blue-100 border border-blue-300 text-blue-800'
          }`}
        >
          <div className='flex items-center space-x-2'>
            {operationStatus.type === 'success' ? (
              <CheckCircleIcon className='h-5 w-5' />
            ) : operationStatus.type === 'error' ? (
              <ExclamationTriangleIcon className='h-5 w-5' />
            ) : (
              <InformationCircleIcon className='h-5 w-5' />
            )}
            <span className='text-sm font-medium'>
              {operationStatus.message}
            </span>
            <button
              onClick={() => setOperationStatus(null)}
              className='ml-auto text-gray-400 hover:text-gray-600'
            >
              <XMarkIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}

      {/* Modal System */}
      {modal && (
        <div className='fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-800 capitalize'>
                {modal.replace('-', ' ')} Manager
              </h2>
              <button
                onClick={() => setModal(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                <XMarkIcon className='h-6 w-6' />
              </button>
            </div>

            {modal === 'schedule-from-date' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Schedule From Date</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Reschedule Project:</strong> Set a new start date
                    and recalculate all task dates.
                  </p>
                  <p>
                    <strong>Forward Pass:</strong> Calculate earliest start and
                    finish dates.
                  </p>
                  <p>
                    <strong>Backward Pass:</strong> Calculate latest start and
                    finish dates.
                  </p>
                  <p>
                    <strong>Critical Path:</strong> Automatically identify
                    critical path after rescheduling.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      New Start Date
                    </label>
                    <input
                      type='date'
                      value={scheduleFromDate.toISOString().split('T')[0]}
                      onChange={e =>
                        setScheduleFromDate(new Date(e.target.value))
                      }
                      className='w-full p-2 border border-gray-300 rounded'
                    />
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>
                        Maintain task relationships
                      </span>
                    </label>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>Recalculate critical path</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Scheduling from date:', scheduleFromDate);
                    setOperationStatus({
                      type: 'success',
                      message: `Project rescheduled from ${scheduleFromDate.toLocaleDateString()}`,
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Reschedule Project
                </button>
              </div>
            )}

            {modal === 'constraint-manager' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Constraint Manager</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Task Constraints:</strong> Manage start/finish
                    constraints for individual tasks.
                  </p>
                  <p>
                    <strong>Dependencies:</strong> View and modify task
                    dependencies and relationships.
                  </p>
                  <p>
                    <strong>Calendar Constraints:</strong> Set working time and
                    holiday constraints.
                  </p>
                  <p>
                    <strong>Resource Constraints:</strong> Manage resource
                    availability constraints.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <h4 className='font-medium text-gray-700 mb-2'>
                        Constraint Types
                      </h4>
                      <div className='space-y-2'>
                        <label className='flex items-center'>
                          <input
                            type='checkbox'
                            defaultChecked
                            className='mr-2'
                          />
                          <span className='text-sm'>Start No Earlier Than</span>
                        </label>
                        <label className='flex items-center'>
                          <input
                            type='checkbox'
                            defaultChecked
                            className='mr-2'
                          />
                          <span className='text-sm'>Finish No Later Than</span>
                        </label>
                        <label className='flex items-center'>
                          <input type='checkbox' className='mr-2' />
                          <span className='text-sm'>Must Start On</span>
                        </label>
                        <label className='flex items-center'>
                          <input type='checkbox' className='mr-2' />
                          <span className='text-sm'>Must Finish On</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-700 mb-2'>
                        Dependency Types
                      </h4>
                      <div className='space-y-2'>
                        <label className='flex items-center'>
                          <input
                            type='checkbox'
                            defaultChecked
                            className='mr-2'
                          />
                          <span className='text-sm'>Finish to Start</span>
                        </label>
                        <label className='flex items-center'>
                          <input type='checkbox' className='mr-2' />
                          <span className='text-sm'>Start to Start</span>
                        </label>
                        <label className='flex items-center'>
                          <input type='checkbox' className='mr-2' />
                          <span className='text-sm'>Finish to Finish</span>
                        </label>
                        <label className='flex items-center'>
                          <input type='checkbox' className='mr-2' />
                          <span className='text-sm'>Start to Finish</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Constraint settings applied',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Apply Constraints
                </button>
              </div>
            )}

            {modal === 'leveling-settings' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Resource Leveling Settings</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Leveling Method:</strong> Choose how resources are
                    leveled across tasks.
                  </p>
                  <p>
                    <strong>Priority Rules:</strong> Set rules for task priority
                    during leveling.
                  </p>
                  <p>
                    <strong>Resource Limits:</strong> Define maximum resource
                    availability.
                  </p>
                  <p>
                    <strong>Leveling Options:</strong> Configure automatic vs
                    manual leveling.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Leveling Method
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded'>
                      <option value='automatic'>Automatic Leveling</option>
                      <option value='manual'>Manual Leveling</option>
                      <option value='priority'>Priority-Based Leveling</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Priority Rules
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded'>
                      <option value='standard'>Standard Priority</option>
                      <option value='critical'>Critical Path First</option>
                      <option value='float'>Least Float First</option>
                      <option value='duration'>Longest Duration First</option>
                    </select>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>Allow splitting of tasks</span>
                    </label>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>Maintain critical path</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Leveling settings applied',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Apply Leveling Settings
                </button>
              </div>
            )}

            {modal === 'schedule-settings' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Schedule Settings</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Calculation Options:</strong> Configure how the
                    schedule is calculated.
                  </p>
                  <p>
                    <strong>Calendar Settings:</strong> Set working days and
                    hours.
                  </p>
                  <p>
                    <strong>Critical Path:</strong> Define critical path
                    calculation rules.
                  </p>
                  <p>
                    <strong>Float Calculation:</strong> Configure total and free
                    float calculations.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Calculation Method
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded'>
                      <option value='forward-backward'>
                        Forward/Backward Pass
                      </option>
                      <option value='critical-path'>
                        Critical Path Method
                      </option>
                      <option value='precedence'>Precedence Diagramming</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Working Days
                    </label>
                    <div className='grid grid-cols-7 gap-1'>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                        (day, index) => (
                          <label
                            key={day}
                            className='flex items-center justify-center p-2 border rounded'
                          >
                            <input
                              type='checkbox'
                              defaultChecked={index < 5}
                              className='mr-1'
                            />
                            <span className='text-xs'>{day}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>
                        Calculate critical path automatically
                      </span>
                    </label>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>
                        Show total float on Gantt chart
                      </span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Schedule settings applied',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Apply Schedule Settings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
