import React, { useState, useEffect, useRef } from 'react';
import { GanttRibbon } from './GanttRibbon';
import { TaskGrid } from './TaskGrid';
import { TimelineChart } from './TimelineChart';
import { TimelineZoomControls } from './TimelineZoomControls';
import { TaskEditorModal } from './TaskEditorModal';
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