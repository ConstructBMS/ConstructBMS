import React, { useState, useEffect, useRef } from 'react';
import { 
  DocumentTextIcon,
  FolderOpenIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GanttRibbon } from './GanttRibbon';
import { TaskGrid } from './TaskGrid';
import { TimelineChart } from './TimelineChart';
import { TimelineZoomControls } from './TimelineZoomControls';
import { TaskEditorModal } from './TaskEditorModal';
import { Model4DView } from './4DModelView';
import { ganttTaskService } from '../../services/ganttTaskService';
import { ganttRibbonService } from '../../services/ganttRibbonService';
import { useProjectView } from '../../contexts/ProjectViewContext';
import type { Task } from '../../services/ganttTaskService';

export const ProjectGanttView: React.FC = () => {
  const { state, updateLayoutSettings, setSelectedTasks } = useProjectView();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [leftPaneWidth, setLeftPaneWidth] = useState(state.layoutSettings.taskGridWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [clipboardContent, setClipboardContent] = useState<Task[]>([]);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);
  
  // File Menu state
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [fileMenuStatus, setFileMenuStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  // Project info state
  const [projectInfo, setProjectInfo] = useState({
    name: 'Sample Construction Project',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active' as const,
    manager: 'John Smith',
    budget: 2500000,
    actualCost: 1800000,
    progress: 65
  });

  const taskGridRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    updateClipboardContent();
  }, []);

  // Update clipboard content when it changes
  useEffect(() => {
    updateClipboardContent();
  }, [ganttRibbonService.getClipboard()]);

  const loadTasks = () => {
    const loadedTasks = ganttTaskService.getTasks();
    setTasks(loadedTasks);
  };

  const updateClipboardContent = () => {
    setClipboardContent(ganttRibbonService.getClipboard());
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTasks([...state.selectedTasks, taskId]);
    } else {
      setSelectedTasks(state.selectedTasks.filter(id => id !== taskId));
    }
  };

  // Handle multiple task selection (Ctrl/Cmd + click)
  const handleMultiSelect = (taskId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (state.selectedTasks.includes(taskId)) {
        setSelectedTasks(state.selectedTasks.filter(id => id !== taskId));
      } else {
        setSelectedTasks([...state.selectedTasks, taskId]);
      }
    } else if (event.shiftKey && state.selectedTasks.length > 0) {
      // Range selection
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      const lastSelectedIndex = tasks.findIndex(t => t.id === state.selectedTasks[state.selectedTasks.length - 1]);
      
      const start = Math.min(taskIndex, lastSelectedIndex);
      const end = Math.max(taskIndex, lastSelectedIndex);
      
      const rangeTasks = tasks.slice(start, end + 1).map(t => t.id);
      setSelectedTasks(rangeTasks);
    } else {
      setSelectedTasks([taskId]);
    }
  };

  // Handle ribbon actions
  const handleRibbonAction = async (action: string, taskIds?: string[]) => {
    try {
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
      setLastActionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setLastActionResult(null), 5000);
    }
  };

  // Handle project actions
  const handleProjectAction = (action: string, data?: any) => {
    switch (action) {
      case 'project-info':
        setLastActionResult('Project Information dialog opened');
        break;
      case 'project-properties':
        setLastActionResult('Project Properties dialog opened');
        break;
      case 'project-status':
        setLastActionResult('Project Status dialog opened');
        break;
      case 'project-calendar':
        setLastActionResult('Project Calendar dialog opened');
        break;
      case 'working-times':
        setLastActionResult('Working Times dialog opened');
        break;
      case 'holidays':
        setLastActionResult('Holidays & Exceptions dialog opened');
        break;
      case 'resource-sheet':
        setLastActionResult('Resource Sheet opened');
        break;
      case 'assign-resources':
        setLastActionResult('Assign Resources dialog opened');
        break;
      case 'resource-leveling':
        setLastActionResult('Resource Leveling dialog opened');
        break;
      case 'cost-sheet':
        setLastActionResult('Cost Sheet opened');
        break;
      case 'budget':
        setLastActionResult('Budget Management dialog opened');
        break;
      case 'earned-value':
        setLastActionResult('Earned Value Analysis dialog opened');
        break;
      case 'project-settings':
        setLastActionResult('Project Settings dialog opened');
        break;
      case 'reports':
        setLastActionResult('Project Reports dialog opened');
        break;
      case 'export-project':
        setLastActionResult('Export Project dialog opened');
        break;
      default:
        setLastActionResult(`Project action: ${action}`);
    }
    
    setTimeout(() => setLastActionResult(null), 3000);
  };

  // Handle task editing
  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskEditorOpen(true);
  };

  // Handle task save
  const handleTaskSave = (updatedTask: Task) => {
    ganttTaskService.updateTask(updatedTask.id, updatedTask);
    loadTasks();
    setIsTaskEditorOpen(false);
    setEditingTask(null);
  };

  // Handle task editor close
  const handleTaskEditorClose = () => {
    setIsTaskEditorOpen(false);
    setEditingTask(null);
  };

  // Handle file menu actions
  const handleFileAction = (action: string) => {
    setShowFileMenu(false);

    try {
      switch (action) {
        case 'new':
          console.log('Create new programme');
          setFileMenuStatus({
            type: 'success',
            message: 'New programme created successfully'
          });
          break;
        case 'open':
          console.log('Open existing programme');
          setFileMenuStatus({
            type: 'info',
            message: 'Opening programme... (File dialog would appear here)'
          });
          break;
        case 'save':
          console.log('Save programme');
          setFileMenuStatus({
            type: 'success',
            message: 'Programme saved successfully'
          });
          break;
        case 'save-as':
          console.log('Save as...');
          setFileMenuStatus({
            type: 'info',
            message: 'Save As dialog opened'
          });
          break;
        case 'print':
          console.log('Print project');
          setFileMenuStatus({
            type: 'success',
            message: 'Print dialog opened'
          });
          break;
        case 'export':
          console.log('Export to PDF');
          setFileMenuStatus({
            type: 'success',
            message: 'Exporting to PDF...'
          });
          break;
        case 'close':
          console.log('Close project');
          setFileMenuStatus({
            type: 'info',
            message: 'Closing programme...'
          });
          break;
        default:
          setFileMenuStatus({
            type: 'error',
            message: 'Unknown file action'
          });
      }
    } catch (error) {
      setFileMenuStatus({
        type: 'error',
        message: `File action failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Clear status message after 3 seconds
    setTimeout(() => setFileMenuStatus(null), 3000);
  };

  // Handle expand/collapse all tasks
  const handleExpandCollapseAll = (expand: boolean) => {
    const updatedTasks = tasks.map(task => ({
      ...task,
      isExpanded: (task.children && task.children.length > 0) ? expand : (task.isExpanded || false)
    }));
    
    // Update all tasks in the service
    updatedTasks.forEach(task => {
      ganttTaskService.updateTask(task.id, { isExpanded: task.isExpanded });
    });
    
    setTasks(updatedTasks);
  };

  // Handle reset layout to defaults
  const handleResetLayout = () => {
    updateLayoutSettings({
      zoomLevel: 'week',
      showGrid: true,
      showDependencies: true,
      showBarLabels: true,
      rowHeight: 32,
      showCriticalPath: false,
      showProgress: true,
      showResources: false,
      showBaseline: false,
      showActuals: false,
      showVariance: false,
      timelineWidth: 800,
      taskGridWidth: 400,
      autoSave: true,
      theme: 'light'
    });
  };

  // Handle resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < window.innerWidth - 200) {
        setLeftPaneWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Sync scroll between task grid and timeline
  const handleTaskGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (taskGridRef.current) {
      taskGridRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Close file menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showFileMenu && !target.closest('.file-menu-container')) {
        setShowFileMenu(false);
      }
    };

    if (showFileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showFileMenu]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Ribbon */}
      <GanttRibbon
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedTasks={state.selectedTasks}
        onTaskAction={handleRibbonAction}
        layoutSettings={state.layoutSettings}
        onLayoutSettingsChange={updateLayoutSettings}
        onExpandCollapseAll={handleExpandCollapseAll}
        onResetLayout={handleResetLayout}
      />

      {/* File Menu Dropdown */}
      <div className="relative bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="relative file-menu-container">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="w-8 h-8 bg-red-500 rounded-sm flex items-center justify-center hover:bg-red-600 transition-colors"
              title="File Menu"
            >
              <span className="text-white text-xs font-bold">P</span>
            </button>

            {showFileMenu && (
              <div className="absolute top-10 left-0 bg-white shadow-lg border border-gray-300 z-50 w-56 rounded-sm text-sm">
                {/* Programme Management */}
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2" onClick={() => handleFileAction('new')}>
                  <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                  <span>New Programme</span>
                </div>
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2" onClick={() => handleFileAction('open')}>
                  <FolderOpenIcon className="h-4 w-4 text-gray-600" />
                  <span>Open Programme...</span>
                </div>
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2" onClick={() => handleFileAction('save')}>
                  <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                  <span>Save</span>
                </div>
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2" onClick={() => handleFileAction('save-as')}>
                  <DocumentArrowDownIcon className="h-4 w-4 text-gray-600" />
                  <span>Save As...</span>
                </div>
                
                <hr className="my-1 border-gray-200" />
                
                {/* Output */}
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2" onClick={() => handleFileAction('print')}>
                  <PrinterIcon className="h-4 w-4 text-gray-600" />
                  <span>Print</span>
                </div>
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2" onClick={() => handleFileAction('export')}>
                  <DocumentArrowDownIcon className="h-4 w-4 text-gray-600" />
                  <span>Export as PDF</span>
                </div>
                
                <hr className="my-1 border-gray-200" />
                
                {/* Control */}
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2" onClick={() => handleFileAction('close')}>
                  <XMarkIcon className="h-4 w-4 text-gray-600" />
                  <span>Close Programme</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Project Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-800">{projectInfo.name}</h1>
          </div>
          
          {/* Right side placeholder */}
          <div className="w-8"></div>
        </div>
      </div>

      {/* Action Result Message */}
      {lastActionResult && (
        <div className={`px-4 py-2 text-sm font-medium ${
          lastActionResult.startsWith('Error:') 
            ? 'bg-red-100 text-red-700 border-b border-red-200' 
            : 'bg-green-100 text-green-700 border-b border-green-200'
        }`}>
          {lastActionResult}
        </div>
      )}

      {/* File Menu Status Message */}
      {fileMenuStatus && (
        <div className={`px-4 py-2 text-sm font-medium ${
          fileMenuStatus.type === 'success' 
            ? 'bg-green-100 text-green-700 border-b border-green-200' 
            : fileMenuStatus.type === 'error'
            ? 'bg-red-100 text-red-700 border-b border-red-200'
            : 'bg-blue-100 text-blue-700 border-b border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {fileMenuStatus.type === 'success' ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : fileMenuStatus.type === 'error' ? (
              <ExclamationTriangleIcon className="h-4 w-4" />
            ) : (
              <InformationCircleIcon className="h-4 w-4" />
            )}
            <span>{fileMenuStatus.message}</span>
          </div>
        </div>
      )}

      {/* Clipboard Status */}
      {clipboardContent.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm border-b border-blue-200">
          Clipboard: {clipboardContent.length} task(s) ready to paste
          {ganttRibbonService.isLastOperationCut() && ' (cut operation)'}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Task Grid */}
        <div
          ref={taskGridRef}
          className="bg-white border-r border-gray-300 overflow-auto"
          style={{ width: leftPaneWidth }}
          onScroll={handleTaskGridScroll}
        >
          <TaskGrid
            tasks={tasks}
            selectedTasks={state.selectedTasks}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={(taskId, updates) => {
              ganttTaskService.updateTask(taskId, updates);
              loadTasks();
            }}
            onTaskExpand={(taskId, isExpanded) => {
              ganttTaskService.updateTask(taskId, { isExpanded });
              loadTasks();
            }}
            leftPaneWidth={leftPaneWidth}
            onTaskEdit={handleTaskEdit}
          />
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-300 cursor-col-resize hover:bg-blue-500 transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Timeline Chart with Zoom Controls */}
        <div className="flex-1 flex flex-col">
          {/* Zoom Controls - Top Right */}
          <div className="flex justify-end px-4 py-2 bg-gray-50 border-b border-gray-200">
            <TimelineZoomControls />
          </div>
          
          {/* Timeline Chart */}
          <div
            ref={timelineRef}
            className="flex-1 overflow-auto"
            onScroll={handleTimelineScroll}
          >
            <TimelineChart
              tasks={tasks}
              selectedTasks={state.selectedTasks}
              onTaskSelect={handleTaskSelect}
              onTaskUpdate={(taskId, updates) => {
                ganttTaskService.updateTask(taskId, updates);
                loadTasks();
              }}
              leftPaneWidth={leftPaneWidth}
            />
          </div>

          {/* 4D Model View - Show when 4D tab is active */}
          {activeTab === '4d' && (
            <div className="h-64 border-t border-gray-300">
              <Model4DView />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-t border-gray-300 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Project: {projectInfo.name}</span>
          <span>Tasks: {tasks.length}</span>
          <span>Selected: {state.selectedTasks.length}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Zoom: {state.layoutSettings.zoomLevel.charAt(0).toUpperCase() + state.layoutSettings.zoomLevel.slice(1)}</span>
          <span>Progress: {projectInfo.progress}%</span>
        </div>
      </div>

      {/* Task Editor Modal */}
      {isTaskEditorOpen && editingTask && (
        <TaskEditorModal
          task={editingTask}
          isOpen={isTaskEditorOpen}
          onSave={handleTaskSave}
          onClose={handleTaskEditorClose}
          allTasks={tasks}
        />
      )}
    </div>
  );
}; 