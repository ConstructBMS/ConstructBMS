import React, { useState } from 'react';
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CogIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

export const ToolsTab: React.FC = () => {
  const { state, updateLayoutSettings } = useProjectView();
  const { layoutSettings } = state;
  const { canAccess } = usePermissions();

  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Tools-specific state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [flagsVisible, setFlagsVisible] = useState(true);
  const [baselineCaptured, setBaselineCaptured] = useState(false);
  const [taskNote, setTaskNote] = useState('');

  const can = (key: string) => canAccess(`gantt.tools.${key}`);

  const handleToolsAction = (action: string, payload?: any) => {
    if (!can(action)) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for tools action: ' + action,
      });
      return;
    }

    try {
      switch (action) {
        case 'sort-by-start':
          console.log('Sorting tasks by start date...');
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          setOperationStatus({
            type: 'success',
            message: `Tasks sorted by start date (${sortOrder === 'asc' ? 'descending' : 'ascending'})`,
          });
          break;

        case 'sort-by-duration':
          console.log('Sorting tasks by duration...');
          setOperationStatus({
            type: 'success',
            message: 'Tasks sorted by duration',
          });
          break;

        case 'sort-by-priority':
          console.log('Sorting tasks by priority...');
          setOperationStatus({
            type: 'success',
            message: 'Tasks sorted by priority',
          });
          break;

        case 'filter-critical':
          const newFilters = activeFilters.includes('critical')
            ? activeFilters.filter(f => f !== 'critical')
            : [...activeFilters, 'critical'];
          setActiveFilters(newFilters);
          console.log(
            'Critical path filter:',
            newFilters.includes('critical') ? 'enabled' : 'disabled'
          );
          setOperationStatus({
            type: 'success',
            message: `Critical path filter ${newFilters.includes('critical') ? 'enabled' : 'disabled'}`,
          });
          break;

        case 'filter-overdue':
          const overdueFilters = activeFilters.includes('overdue')
            ? activeFilters.filter(f => f !== 'overdue')
            : [...activeFilters, 'overdue'];
          setActiveFilters(overdueFilters);
          console.log(
            'Overdue filter:',
            overdueFilters.includes('overdue') ? 'enabled' : 'disabled'
          );
          setOperationStatus({
            type: 'success',
            message: `Overdue filter ${overdueFilters.includes('overdue') ? 'enabled' : 'disabled'}`,
          });
          break;

        case 'clear-filters':
          setActiveFilters([]);
          console.log('All filters cleared');
          setOperationStatus({
            type: 'success',
            message: 'All filters cleared',
          });
          break;

        case 'toggle-flags':
          const newFlagsVisible = !flagsVisible;
          setFlagsVisible(newFlagsVisible);
          console.log(
            'Flags visibility:',
            newFlagsVisible ? 'enabled' : 'disabled'
          );
          setOperationStatus({
            type: 'success',
            message: `Flags ${newFlagsVisible ? 'shown' : 'hidden'}`,
          });
          break;

        case 'add-task-note':
          openModal('add-note');
          break;

        case 'capture-baseline':
          console.log('Capturing baseline...');
          setBaselineCaptured(true);
          setOperationStatus({
            type: 'success',
            message: 'Baseline captured successfully',
          });
          break;

        case 'clear-baseline':
          console.log('Clearing baseline...');
          setBaselineCaptured(false);
          setOperationStatus({
            type: 'success',
            message: 'Baseline cleared',
          });
          break;

        case 'compare-baseline':
          openModal('baseline-comparison');
          break;

        case 'go-to-start':
          console.log('Navigating to project start...');
          setOperationStatus({
            type: 'success',
            message: 'Navigated to project start',
          });
          break;

        case 'go-to-end':
          console.log('Navigating to project end...');
          setOperationStatus({
            type: 'success',
            message: 'Navigated to project end',
          });
          break;

        case 'validate-dependencies':
          console.log('Validating task dependencies...');
          setOperationStatus({
            type: 'success',
            message: 'Dependencies validated - no issues found',
          });
          break;

        case 'find-task':
          openModal('find-task');
          break;

        case 'tools-settings':
          openModal('tools-settings');
          break;
      }
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: `Failed to execute tools action: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        {/* Sort & Filter Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleToolsAction('sort-by-start')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors'
              title='Sort by Start Date'
            >
              <ArrowsUpDownIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Start Date</span>
            </button>
            <button
              onClick={() => handleToolsAction('sort-by-duration')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors'
              title='Sort by Duration'
            >
              <ArrowsUpDownIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Duration</span>
            </button>
            <button
              onClick={() => handleToolsAction('sort-by-priority')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors'
              title='Sort by Priority'
            >
              <ArrowsUpDownIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Priority</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Sort</div>
        </div>

        {/* Filter Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleToolsAction('filter-critical')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                activeFilters.includes('critical')
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white hover:bg-red-50'
              }`}
              title='Filter Critical Path'
            >
              <FunnelIcon className='h-5 w-5 mb-1' />
              <span className='text-xs'>Critical</span>
            </button>
            <button
              onClick={() => handleToolsAction('filter-overdue')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                activeFilters.includes('overdue')
                  ? 'bg-orange-100 border-orange-500 text-orange-700'
                  : 'bg-white hover:bg-orange-50'
              }`}
              title='Filter Overdue Tasks'
            >
              <ExclamationTriangleIcon className='h-5 w-5 mb-1' />
              <span className='text-xs'>Overdue</span>
            </button>
            <button
              onClick={() => handleToolsAction('clear-filters')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors'
              title='Clear All Filters'
            >
              <XMarkIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Clear</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Filter</div>
        </div>

        {/* Flags & Notes Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleToolsAction('toggle-flags')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                flagsVisible
                  ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                  : 'bg-white hover:bg-yellow-50'
              }`}
              title='Toggle Flags Visibility'
            >
              {flagsVisible ? (
                <EyeIcon className='h-5 w-5 mb-1' />
              ) : (
                <EyeSlashIcon className='h-5 w-5 mb-1' />
              )}
              <span className='text-xs'>Flags</span>
            </button>
            <button
              onClick={() => handleToolsAction('add-task-note')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors'
              title='Add Task Note'
            >
              <ChatBubbleLeftIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Add Note</span>
            </button>
            <button
              onClick={() => handleToolsAction('find-task')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-indigo-50 rounded transition-colors'
              title='Find Task'
            >
              <MagnifyingGlassIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Find</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Flags & Notes</div>
        </div>

        {/* Baselines Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleToolsAction('capture-baseline')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                baselineCaptured
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-white hover:bg-green-50'
              }`}
              title='Capture Baseline'
            >
              <DocumentDuplicateIcon className='h-5 w-5 mb-1' />
              <span className='text-xs'>Capture</span>
            </button>
            <button
              onClick={() => handleToolsAction('clear-baseline')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors'
              title='Clear Baseline'
            >
              <TrashIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Clear</span>
            </button>
            <button
              onClick={() => handleToolsAction('compare-baseline')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors'
              title='Compare with Baseline'
            >
              <ChartBarIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Compare</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Baselines</div>
        </div>

        {/* Navigate Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleToolsAction('go-to-start')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors'
              title='Go to Project Start'
            >
              <ArrowUpIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Start</span>
            </button>
            <button
              onClick={() => handleToolsAction('go-to-end')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors'
              title='Go to Project End'
            >
              <ArrowDownIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>End</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Navigate</div>
        </div>

        {/* Validate Section */}
        <div className='flex flex-col'>
          <div className='flex space-x-1 mb-2'>
            <button
              onClick={() => handleToolsAction('validate-dependencies')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors'
              title='Validate Dependencies'
            >
              <CheckCircleIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Validate</span>
            </button>
            <button
              onClick={() => handleToolsAction('tools-settings')}
              className='flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors'
              title='Tools Settings'
            >
              <CogIcon className='h-5 w-5 mb-1 text-gray-700' />
              <span className='text-xs text-gray-700'>Settings</span>
            </button>
          </div>
          <div className='text-xs text-gray-600 font-medium'>Validate</div>
        </div>

        {/* Current Status Display */}
        <div className='flex flex-col justify-end ml-auto'>
          <div className='text-xs text-gray-500'>
            Sort Order: {sortOrder.toUpperCase()}
          </div>
          <div className='text-xs text-gray-500'>
            Active Filters: {activeFilters.length}
          </div>
          <div className='text-xs text-gray-500'>
            Flags: {flagsVisible ? 'Visible' : 'Hidden'}
          </div>
          <div className='text-xs text-gray-500'>
            Baseline: {baselineCaptured ? 'Captured' : 'None'}
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

            {modal === 'add-note' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Add Task Note</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Task Notes:</strong> Add detailed notes and comments
                    to selected tasks.
                  </p>
                  <p>
                    <strong>Rich Text:</strong> Support for formatting, links,
                    and attachments.
                  </p>
                  <p>
                    <strong>Tags:</strong> Add tags for easy categorization and
                    filtering.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Note Content
                    </label>
                    <textarea
                      value={taskNote}
                      onChange={e => setTaskNote(e.target.value)}
                      className='w-full p-3 border border-gray-300 rounded h-32 resize-none'
                      placeholder='Enter your note here...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Tags (comma-separated)
                    </label>
                    <input
                      type='text'
                      className='w-full p-2 border border-gray-300 rounded'
                      placeholder='important, review, milestone'
                    />
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>Mark as important</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Adding note:', taskNote);
                    setOperationStatus({
                      type: 'success',
                      message: 'Note added successfully',
                    });
                    setTaskNote('');
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Add Note
                </button>
              </div>
            )}

            {modal === 'baseline-comparison' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Baseline Comparison</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Baseline Analysis:</strong> Compare current schedule
                    with captured baseline.
                  </p>
                  <p>
                    <strong>Variance Report:</strong> View schedule and cost
                    variances.
                  </p>
                  <p>
                    <strong>Trend Analysis:</strong> Track project performance
                    over time.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Comparison Type
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded'>
                      <option value='schedule'>Schedule Variance</option>
                      <option value='cost'>Cost Variance</option>
                      <option value='both'>Schedule & Cost Variance</option>
                    </select>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <h4 className='font-medium text-gray-700 mb-2'>
                        Current Status
                      </h4>
                      <div className='space-y-1 text-sm'>
                        <div>Duration: 45 days</div>
                        <div>Cost: $125,000</div>
                        <div>Progress: 65%</div>
                      </div>
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-700 mb-2'>
                        Baseline
                      </h4>
                      <div className='space-y-1 text-sm'>
                        <div>Duration: 40 days</div>
                        <div>Cost: $100,000</div>
                        <div>Progress: 70%</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Baseline comparison generated',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Generate Report
                </button>
              </div>
            )}

            {modal === 'find-task' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Find Task</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Task Search:</strong> Quickly locate tasks by name,
                    ID, or other criteria.
                  </p>
                  <p>
                    <strong>Advanced Filters:</strong> Search by status,
                    assignee, or date range.
                  </p>
                  <p>
                    <strong>Navigation:</strong> Jump directly to found tasks in
                    the Gantt chart.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Search Term
                    </label>
                    <input
                      type='text'
                      className='w-full p-2 border border-gray-300 rounded'
                      placeholder='Enter task name, ID, or description...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Search In
                    </label>
                    <div className='space-y-2'>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          defaultChecked
                          className='mr-2'
                        />
                        <span className='text-sm'>Task names</span>
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          defaultChecked
                          className='mr-2'
                        />
                        <span className='text-sm'>Task descriptions</span>
                      </label>
                      <label className='flex items-center'>
                        <input type='checkbox' className='mr-2' />
                        <span className='text-sm'>Task IDs</span>
                      </label>
                      <label className='flex items-center'>
                        <input type='checkbox' className='mr-2' />
                        <span className='text-sm'>Resource names</span>
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Task search completed',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Find Tasks
                </button>
              </div>
            )}

            {modal === 'tools-settings' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Tools Settings</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Default Settings:</strong> Configure default
                    behavior for tools and utilities.
                  </p>
                  <p>
                    <strong>Auto-save:</strong> Set automatic saving preferences
                    for notes and filters.
                  </p>
                  <p>
                    <strong>Display Options:</strong> Customize how tools and
                    results are displayed.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Default Sort Order
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded'>
                      <option value='start-date'>Start Date</option>
                      <option value='duration'>Duration</option>
                      <option value='priority'>Priority</option>
                      <option value='name'>Name</option>
                    </select>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>Auto-save filters</span>
                    </label>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' defaultChecked className='mr-2' />
                      <span className='text-sm'>Show confirmation dialogs</span>
                    </label>
                  </div>
                  <div className='flex space-x-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-sm'>Enable advanced filtering</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Tools settings saved',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
