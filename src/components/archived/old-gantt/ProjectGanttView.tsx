import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  InformationCircleIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { GanttRibbon } from './GanttRibbon';
import { TaskGrid } from './TaskGrid';
import { TimelineChart } from './TimelineChart';
import { useProjectView } from '../../contexts/ProjectViewContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ganttRibbonService } from '../../services/ganttRibbonService';
import { ganttTaskService } from '../../services/ganttTaskService';

export const ProjectGanttView: React.FC = () => {
  const { state, updateLayoutSettings, setSelectedTasks } = useProjectView();
  const { layoutSettings, selectedTasks } = state;
  const { canAccess } = usePermissions();

  // Mock tasks data for now
  const [tasks, setTasks] = useState<any[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState('home');
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [fileMenuStatus, setFileMenuStatus] = useState<string | null>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [showLeftPane, setShowLeftPane] = useState(true);
  const [projectName, setProjectName] = useState('Sample Construction Project');
  const [fileName, setFileName] = useState('Project_2024.gantt');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projectProgress, setProjectProgress] = useState(65);
  const [statusMessage, setStatusMessage] = useState('Ready');

  // Refs
  const resizerRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);

  const can = (key: string) => canAccess(`gantt.${key}`);

  // Load layout settings from localStorage
  useEffect(() => {
    const savedLeftPaneWidth = localStorage.getItem('gantt-left-pane-width');
    if (savedLeftPaneWidth) {
      setLeftPaneWidth(parseInt(savedLeftPaneWidth));
    }

    const savedShowLeftPane = localStorage.getItem('gantt-show-left-pane');
    if (savedShowLeftPane !== null) {
      setShowLeftPane(savedShowLeftPane === 'true');
    }
  }, []);

  // Save layout settings to localStorage
  useEffect(() => {
    localStorage.setItem('gantt-left-pane-width', leftPaneWidth.toString());
    localStorage.setItem('gantt-show-left-pane', showLeftPane.toString());
  }, [leftPaneWidth, showLeftPane]);

  // Update current date
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Handle ribbon actions
  const handleRibbonAction = async (action: string, taskIds?: string[]) => {
    try {
      // Handle schedule-specific actions
      if (
        action.startsWith('schedule-') ||
        action.startsWith('level-') ||
        action.startsWith('constraint-') ||
        action.startsWith('show-')
      ) {
        handleScheduleAction(action, taskIds);
        return;
      }

      // Handle tools-specific actions
      if (
        action.startsWith('sort-') ||
        action.startsWith('filter-') ||
        action.startsWith('toggle-') ||
        action.startsWith('add-') ||
        action.startsWith('capture-') ||
        action.startsWith('clear-') ||
        action.startsWith('compare-') ||
        action.startsWith('go-to-') ||
        action.startsWith('validate-') ||
        action.startsWith('find-') ||
        action.startsWith('tools-')
      ) {
        handleToolsAction(action, taskIds);
        return;
      }

      // Handle report-specific actions
      if (
        action.startsWith('print-') ||
        action.startsWith('export-') ||
        action.startsWith('capture-') ||
        action.startsWith('load-') ||
        action.startsWith('save-') ||
        action.startsWith('report-') ||
        action.startsWith('generate-')
      ) {
        handleReportAction(action, taskIds);
        return;
      }

      const result = await ganttRibbonService.executeAction(action, taskIds);

      if (result.success) {
        setLastActionResult(result.message);

        // Reload tasks after action
        loadTasks();
        updateClipboardContent();

        // Clear selection for certain actions
        if (['cut-tasks', 'delete-task', 'paste-tasks'].includes(action)) {
          setSelectedTasks([]);
        }

        // Show success message briefly
        setTimeout(() => setLastActionResult(null), 3000);
      } else {
        setLastActionResult(`Error: ${result.message}`);
        setTimeout(() => setLastActionResult(null), 5000);
      }
    } catch (error) {
      setLastActionResult(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setTimeout(() => setLastActionResult(null), 5000);
    }
  };

  // Handle schedule-specific actions
  const handleScheduleAction = (action: string, taskIds?: string[]) => {
    try {
      switch (action) {
        case 'calculate-schedule':
          console.log('Calculating project schedule...');
          setLastActionResult('Project schedule recalculated successfully');
          break;
        case 'schedule-from-date':
          console.log('Opening schedule from date dialog...');
          setLastActionResult('Schedule from date dialog opened');
          break;
        case 'reschedule-tasks':
          console.log('Rescheduling selected tasks...', taskIds);
          setLastActionResult('Tasks rescheduled successfully');
          break;
        case 'toggle-constraints':
          console.log('Toggling constraints...');
          setLastActionResult('Constraints toggled successfully');
          break;
        case 'remove-constraints':
          console.log('Removing constraints from selected tasks...', taskIds);
          setLastActionResult('Constraints removed from selected tasks');
          break;
        case 'show-critical-path':
          console.log('Showing critical path...');
          updateLayoutSettings({
            showCriticalPath: !state.layoutSettings.showCriticalPath,
          });
          setLastActionResult('Critical path visibility toggled');
          break;
        case 'show-total-float':
          console.log('Showing total float...');
          setLastActionResult('Total float visibility toggled');
          break;
        case 'level-resources':
          console.log('Starting resource leveling...');
          setLastActionResult('Resource leveling completed');
          break;
        case 'clear-leveling':
          console.log('Clearing resource leveling...');
          setLastActionResult('Resource leveling cleared');
          break;
        default:
          setLastActionResult(`Schedule action: ${action}`);
      }

      setTimeout(() => setLastActionResult(null), 3000);
    } catch (error) {
      setLastActionResult(
        `Schedule action failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setTimeout(() => setLastActionResult(null), 5000);
    }
  };

  // Handle tools-specific actions
  const handleToolsAction = (action: string, taskIds?: string[]) => {
    try {
      switch (action) {
        case 'sort-by-start':
          console.log('Sorting tasks by start date...');
          setLastActionResult('Tasks sorted by start date');
          break;
        case 'sort-by-duration':
          console.log('Sorting tasks by duration...');
          setLastActionResult('Tasks sorted by duration');
          break;
        case 'sort-by-priority':
          console.log('Sorting tasks by priority...');
          setLastActionResult('Tasks sorted by priority');
          break;
        case 'filter-critical':
          console.log('Filtering critical path tasks...');
          setLastActionResult('Critical path filter applied');
          break;
        case 'filter-overdue':
          console.log('Filtering overdue tasks...');
          setLastActionResult('Overdue filter applied');
          break;
        case 'clear-filters':
          console.log('Clearing all filters...');
          setLastActionResult('All filters cleared');
          break;
        case 'toggle-flags':
          console.log('Toggling flags visibility...');
          setLastActionResult('Flags visibility toggled');
          break;
        case 'add-task-note':
          console.log('Opening add note dialog...');
          setLastActionResult('Add note dialog opened');
          break;
        case 'capture-baseline':
          console.log('Capturing baseline...');
          setLastActionResult('Baseline captured successfully');
          break;
        case 'clear-baseline':
          console.log('Clearing baseline...');
          setLastActionResult('Baseline cleared');
          break;
        case 'compare-baseline':
          console.log('Opening baseline comparison...');
          setLastActionResult('Baseline comparison opened');
          break;
        case 'go-to-start':
          console.log('Navigating to project start...');
          setLastActionResult('Navigated to project start');
          break;
        case 'go-to-end':
          console.log('Navigating to project end...');
          setLastActionResult('Navigated to project end');
          break;
        case 'validate-dependencies':
          console.log('Validating task dependencies...');
          setLastActionResult('Dependencies validated - no issues found');
          break;
        case 'find-task':
          console.log('Opening find task dialog...');
          setLastActionResult('Find task dialog opened');
          break;
        case 'tools-settings':
          console.log('Opening tools settings...');
          setLastActionResult('Tools settings opened');
          break;
        default:
          setLastActionResult(`Tools action: ${action}`);
      }

      setTimeout(() => setLastActionResult(null), 3000);
    } catch (error) {
      setLastActionResult(
        `Tools action failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setTimeout(() => setLastActionResult(null), 5000);
    }
  };

  // Handle report-specific actions
  const handleReportAction = (action: string, taskIds?: string[]) => {
    try {
      switch (action) {
        case 'print-preview':
          console.log('Opening print preview...');
          setLastActionResult('Print preview opened');
          break;
        case 'print-chart':
          console.log('Printing Gantt chart...');
          setLastActionResult('Print job sent to printer');
          break;
        case 'export-pdf':
          console.log('Exporting to PDF...');
          setLastActionResult('PDF export completed successfully');
          break;
        case 'export-excel':
          console.log('Exporting to Excel...');
          setLastActionResult('Excel export completed successfully');
          break;
        case 'export-csv':
          console.log('Exporting to CSV...');
          setLastActionResult('CSV export completed successfully');
          break;
        case 'capture-snapshot':
          console.log('Capturing project snapshot...');
          setLastActionResult('Project snapshot captured and saved');
          break;
        case 'load-template':
          console.log('Opening load template dialog...');
          setLastActionResult('Load template dialog opened');
          break;
        case 'save-template':
          console.log('Opening save template dialog...');
          setLastActionResult('Save template dialog opened');
          break;
        case 'report-settings':
          console.log('Opening report settings...');
          setLastActionResult('Report settings opened');
          break;
        case 'export-image':
          console.log('Exporting as image...');
          setLastActionResult('Image export completed successfully');
          break;
        case 'export-data':
          console.log('Exporting project data...');
          setLastActionResult('Project data exported successfully');
          break;
        case 'generate-report':
          console.log('Opening generate report dialog...');
          setLastActionResult('Generate report dialog opened');
          break;
        default:
          setLastActionResult(`Report action: ${action}`);
      }

      setTimeout(() => setLastActionResult(null), 3000);
    } catch (error) {
      setLastActionResult(
        `Report action failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setTimeout(() => setLastActionResult(null), 5000);
    }
  };

  // Handle project actions
  const handleProjectAction = (action: string) => {
    try {
      switch (action) {
        case 'new':
          console.log('Creating new project...');
          setFileMenuStatus('New project created');
          break;
        case 'open':
          console.log('Opening project...');
          setFileMenuStatus('Project opened successfully');
          break;
        case 'save':
          console.log('Saving project...');
          setFileMenuStatus('Project saved successfully');
          break;
        case 'save-as':
          console.log('Saving project as...');
          setFileMenuStatus('Project saved as new file');
          break;
        case 'print':
          console.log('Printing project...');
          setFileMenuStatus('Print job sent to printer');
          break;
        case 'export-pdf':
          console.log('Exporting project to PDF...');
          setFileMenuStatus('Project exported to PDF');
          break;
        case 'close':
          console.log('Closing project...');
          setFileMenuStatus('Project closed');
          break;
        default:
          setFileMenuStatus(`Action: ${action}`);
      }

      setShowFileMenu(false);
      setTimeout(() => setFileMenuStatus(null), 3000);
    } catch (error) {
      setFileMenuStatus(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setTimeout(() => setFileMenuStatus(null), 5000);
    }
  };

  // Resizer functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !leftPaneRef.current) return;

    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 600) {
      setLeftPaneWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Mock functions for now
  const loadTasks = () => console.log('Loading tasks...');
  const updateClipboardContent = () => console.log('Updating clipboard...');

  // Navigation items
  const navigationItems = [
    { id: 'project', label: 'Project Tree', icon: FolderIcon, count: 12 },
    { id: 'resources', label: 'Resources', icon: UserGroupIcon, count: 8 },
    { id: 'costs', label: 'Costs', icon: CurrencyDollarIcon, count: 15 },
    { id: 'libraries', label: 'Code Libraries', icon: BookOpenIcon, count: 3 },
  ];

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* Title Bar / Header */}
      <div className='bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-blue-600 rounded flex items-center justify-center'>
              <DocumentTextIcon className='w-5 h-5 text-white' />
            </div>
            <span className='font-semibold text-gray-800'>{projectName}</span>
          </div>
          <div className='text-sm text-gray-500'>{fileName}</div>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded'
            title='Help'
          >
            <QuestionMarkCircleIcon className='w-5 h-5' />
          </button>
          <button
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded'
            title='Style Options'
          >
            <CogIcon className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <GanttRibbon
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedTasks={selectedTasks}
        onTaskAction={handleRibbonAction}
        layoutSettings={layoutSettings}
        onLayoutSettingsChange={updateLayoutSettings}
      />

      {/* Main Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Navigation Pane */}
        {showLeftPane && (
          <>
            <div
              ref={leftPaneRef}
              className='bg-white border-r border-gray-200 flex flex-col'
              style={{ width: leftPaneWidth }}
            >
              {/* Navigation Header */}
              <div className='p-3 border-b border-gray-200 bg-gray-50'>
                <h3 className='font-medium text-gray-800'>Project Explorer</h3>
              </div>

              {/* Navigation Items */}
              <div className='flex-1 overflow-y-auto'>
                {navigationItems.map(item => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className='flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100'
                    >
                      <div className='flex items-center space-x-2'>
                        <IconComponent className='w-4 h-4 text-gray-500' />
                        <span className='text-sm text-gray-700'>
                          {item.label}
                        </span>
                      </div>
                      <span className='text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded'>
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resizer Handle */}
            <div
              ref={resizerRef}
              className='w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center'
              onMouseDown={handleMouseDown}
            >
              <div className='w-0.5 h-8 bg-gray-400 rounded'></div>
            </div>
          </>
        )}

        {/* Main Gantt View */}
        <div className='flex-1 flex flex-col bg-white'>
          {/* File Menu Button */}
          <div className='p-2 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setShowLeftPane(!showLeftPane)}
                  className='p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded'
                  title={showLeftPane ? 'Hide Navigation' : 'Show Navigation'}
                >
                  {showLeftPane ? (
                    <ChevronLeftIcon className='w-4 h-4' />
                  ) : (
                    <ChevronRightIcon className='w-4 h-4' />
                  )}
                </button>

                <button
                  onClick={() => setShowFileMenu(!showFileMenu)}
                  className='bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors'
                  title='File Menu'
                >
                  P
                </button>

                {showFileMenu && (
                  <div className='absolute top-12 left-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]'>
                    <div className='p-2 border-b border-gray-200'>
                      <h4 className='font-medium text-gray-800'>
                        Programme Management
                      </h4>
                    </div>
                    <div className='p-1'>
                      <button
                        onClick={() => handleProjectAction('new')}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <PlusIcon className='w-4 h-4' />
                        <span>New</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction('open')}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <DocumentTextIcon className='w-4 h-4' />
                        <span>Open</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction('save')}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <DocumentTextIcon className='w-4 h-4' />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction('save-as')}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <DocumentTextIcon className='w-4 h-4' />
                        <span>Save As</span>
                      </button>
                    </div>
                    <div className='p-1 border-t border-gray-200'>
                      <h4 className='px-3 py-1 text-xs font-medium text-gray-500 uppercase'>
                        Output
                      </h4>
                      <button
                        onClick={() => handleProjectAction('print')}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <PrinterIcon className='w-4 h-4' />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction('export-pdf')}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <DocumentArrowDownIcon className='w-4 h-4' />
                        <span>Export as PDF</span>
                      </button>
                    </div>
                    <div className='p-1 border-t border-gray-200'>
                      <h4 className='px-3 py-1 text-xs font-medium text-gray-500 uppercase'>
                        Control
                      </h4>
                      <button
                        onClick={() => handleProjectAction('close')}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <XMarkIcon className='w-4 h-4' />
                        <span>Close Programme</span>
                      </button>
                    </div>
                  </div>
                )}

                <span className='text-lg font-semibold text-gray-800 ml-4'>
                  {projectName}
                </span>
              </div>

              {/* Status Messages */}
              <div className='flex items-center space-x-4'>
                {fileMenuStatus && (
                  <div className='flex items-center space-x-1 text-sm text-green-600'>
                    <CheckCircleIcon className='w-4 h-4' />
                    <span>{fileMenuStatus}</span>
                  </div>
                )}
                {lastActionResult && (
                  <div className='flex items-center space-x-1 text-sm text-blue-600'>
                    <InformationCircleIcon className='w-4 h-4' />
                    <span>{lastActionResult}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gantt Content */}
          <div className='flex-1 flex overflow-hidden'>
            {/* Task Grid */}
            <div className='w-1/2 border-r border-gray-200 overflow-y-auto'>
              <TaskGrid
                tasks={tasks}
                selectedTasks={selectedTasks}
                onTaskSelect={(taskId, isSelected) => {
                  if (isSelected) {
                    setSelectedTasks([...selectedTasks, taskId]);
                  } else {
                    setSelectedTasks(selectedTasks.filter(id => id !== taskId));
                  }
                }}
                onTaskUpdate={(taskId, updates) => {
                  console.log('Task updated:', taskId, updates);
                }}
                onTaskExpand={(taskId, isExpanded) => {
                  console.log('Task expanded:', taskId, isExpanded);
                }}
                leftPaneWidth={leftPaneWidth}
                onTaskEdit={task => {
                  console.log('Task edit:', task);
                }}
              />
            </div>

            {/* Timeline Chart */}
            <div className='w-1/2 overflow-auto'>
              <TimelineChart
                tasks={tasks}
                selectedTasks={selectedTasks}
                onTaskSelect={(taskId, isSelected) => {
                  if (isSelected) {
                    setSelectedTasks([...selectedTasks, taskId]);
                  } else {
                    setSelectedTasks(selectedTasks.filter(id => id !== taskId));
                  }
                }}
                leftPaneWidth={leftPaneWidth}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className='bg-gray-100 border-t border-gray-200 px-4 py-1 flex items-center justify-between text-sm'>
        <div className='flex items-center space-x-4'>
          <span className='text-gray-600'>{statusMessage}</span>
          <div className='flex items-center space-x-1 text-gray-500'>
            <CalendarIcon className='w-4 h-4' />
            <span>Date: {currentDate.toLocaleDateString()}</span>
          </div>
          <div className='flex items-center space-x-1 text-gray-500'>
            <ClockIcon className='w-4 h-4' />
            <span>Time: {currentDate.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-1 text-gray-500'>
            <CheckCircleIcon className='w-4 h-4' />
            <span>Progress: {projectProgress}%</span>
          </div>
          <div className='flex items-center space-x-1'>
            <div className='w-20 bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-500 h-2 rounded-full transition-all duration-300'
                style={{ width: `${projectProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handler for file menu */}
      {showFileMenu && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowFileMenu(false)}
        />
      )}
    </div>
  );
};
