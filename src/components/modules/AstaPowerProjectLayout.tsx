import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  BellIcon,
  UserCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import AstaSidebar from './AstaSidebar';
import AstaHeader from './AstaHeader';
import AstaRibbon from './AstaRibbon';
import TaskTableComponent from './TaskTable';
import GanttCanvas from './GanttCanvas';
import TimelineBand from './TimelineBand';
import AutoSaveStatus from './AutoSaveStatus';
import { AutoSaveProvider } from '../../contexts/AutoSaveContext';
import type { ViewOperation, ViewState } from './ribbonTabs/ViewTab';
import type { GanttTask, GanttLink } from './GanttCanvas';
import { ganttCanvasService } from '../../services/ganttCanvasService';
import { taskTableService } from '../../services/taskTableService';

// Context for layout state management
interface LayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  autoSaveStatus: AutoSaveStatus;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
      throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

// Types
interface Project {
  id: string;
  name: string;
  client: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  lastModified: Date;
}

type ViewMode = 'gantt' | 'timeline' | 'calendar' | 'resource' | 'cost' | 'documents' | 'reports' | 'tools';
type UserRole = 'admin' | 'project_manager' | 'scheduler' | 'viewer';
type AutoSaveStatus = 'saved' | 'saving' | 'error' | 'offline';

interface AstaPowerProjectLayoutProps {
  children?: React.ReactNode;
  initialProject?: Project | null;
  onProjectChange?: (project: Project) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

// Placeholder Components
const GanttChart: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gantt Chart</h3>
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          Zoom In
        </button>
        <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          Zoom Out
        </button>
      </div>
    </div>
    <div className="bg-gray-50 dark:bg-gray-900 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 h-64 flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Gantt Chart Component</p>
    </div>
  </div>
);

const Timeline: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h3>
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          Today
        </button>
        <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          Week
        </button>
      </div>
    </div>
    <div className="bg-gray-50 dark:bg-gray-900 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 h-64 flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Timeline Component</p>
    </div>
  </div>
);

const AstaPowerProjectLayout: React.FC<AstaPowerProjectLayoutProps> = ({
  children,
  initialProject,
  onProjectChange,
  onViewModeChange
}) => {
  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(initialProject || null);
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('saved');
  const [userRole, setUserRole] = useState<UserRole>('project_manager');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeRibbonTab, setActiveRibbonTab] = useState<string>('home');
  
  // Task and link state
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [links, setLinks] = useState<GanttLink[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Timeline Band state
  const [timelineScrollLeft, setTimelineScrollLeft] = useState<number>(0);
  
  // View state management for ViewTab
  const [viewState, setViewState] = useState<ViewState>({
    zoomLevel: 100,
    showGridlines: true,
    showTimelineBand: true,
    showTaskLinks: true,
    showFloat: false
  });

  // Load project data
  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject.id);
    }
  }, [activeProject]);

  const loadProjectData = async (projectId: string) => {
    try {
      setLoading(true);
      
      // Load tasks and links
      const projectTasks = await ganttCanvasService.getProjectTasks(projectId);
      const projectLinks = await ganttCanvasService.getProjectLinks(projectId);
      
      // Generate WBS numbering
      const tasksWithWBS = taskTableService.generateWBSNumbering(projectTasks);
      
      setTasks(tasksWithWBS);
      setLinks(projectLinks);
      
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<GanttTask>) => {
    try {
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      
      // Save to database
      await taskTableService.updateTask(taskId, updates);
      
    } catch (error) {
      console.error('Task update failed:', error);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleToggleExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleScrollSync = (scrollTop: number) => {
    // Sync scroll between TaskTable and GanttCanvas
    console.log('Scroll sync:', scrollTop);
  };

  const handleTimelineScrollSync = (scrollLeft: number) => {
    setTimelineScrollLeft(scrollLeft);
    // Sync with Gantt Canvas horizontal scroll
    console.log('Timeline scroll sync:', scrollLeft);
  };

  // Context value
  const contextValue: LayoutContextType = {
    sidebarCollapsed,
    setSidebarCollapsed,
    activeProject,
    setActiveProject,
    viewMode,
    setViewMode,
    autoSaveStatus,
    setAutoSaveStatus,
    userRole,
    setUserRole
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <ArrowPathIcon className="w-4 h-4 animate-spin text-yellow-500" />;
      case 'saved':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'offline':
        return <XMarkIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <ArrowPathIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save Error';
      case 'offline':
        return 'Offline';
      default:
        return 'Auto-save';
    }
  };

  // View operation handlers
  const handleViewOperation = (operation: ViewOperation) => {
    console.log('View operation:', operation);
    // Handle view operations here
    switch (operation.type) {
      case 'zoom-in':
        setViewState(prev => ({
          ...prev,
          zoomLevel: Math.min(prev.zoomLevel + 25, 500)
        }));
        break;
      case 'zoom-out':
        setViewState(prev => ({
          ...prev,
          zoomLevel: Math.max(prev.zoomLevel - 25, 25)
        }));
        break;
      case 'toggle-gridlines':
        setViewState(prev => ({
          ...prev,
          showGridlines: !prev.showGridlines
        }));
        break;
      case 'toggle-timeline-band':
        setViewState(prev => ({
          ...prev,
          showTimelineBand: !prev.showTimelineBand
        }));
        break;
      case 'toggle-task-links':
        setViewState(prev => ({
          ...prev,
          showTaskLinks: !prev.showTaskLinks
        }));
        break;
      case 'toggle-float':
        setViewState(prev => ({
          ...prev,
          showFloat: !prev.showFloat
        }));
        break;
      case 'fit-to-screen':
        setViewState(prev => ({
          ...prev,
          zoomLevel: 100
        }));
        break;
    }
  };

  const handleViewStateChange = (newState: Partial<ViewState>) => {
    setViewState(prev => ({ ...prev, ...newState }));
  };

  // Task operation handlers for HomeTab
  const handleTaskOperation = (operation: any) => {
    console.log('Task operation:', operation);
    
    switch (operation.type) {
      case 'add':
        handleAddTask(operation.data);
        break;
      case 'delete':
        handleDeleteTask(operation.data);
        break;
      case 'milestone':
        handleToggleMilestone();
        break;
      case 'link':
        handleLinkTasks(operation.data);
        break;
      case 'unlink':
        handleUnlinkTasks(operation.data);
        break;
      case 'indent':
        handleIndentTask();
        break;
      case 'outdent':
        handleOutdentTask();
        break;
      case 'progress':
        handleSetProgress(operation.data);
        break;
      default:
        console.log('Unknown task operation:', operation);
    }
  };

  const handleAddTask = (data: any) => {
    // Add new task
    const newTask: GanttTask = {
      id: crypto.randomUUID(),
      name: 'New Task',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      progress: 0,
      isMilestone: false,
      isCritical: false,
      level: 0,
      assignedTo: '',
      status: 'not-started',
      float: 0
    };
    
    setTasks(prev => [...prev, newTask]);
    setSelectedTaskId(newTask.id);
    console.log('Added new task:', newTask);
  };

  const handleDeleteTask = (data: any) => {
    if (selectedTaskId) {
      setTasks(prev => prev.filter(task => task.id !== selectedTaskId));
      setLinks(prev => prev.filter(link => 
        link.sourceTaskId !== selectedTaskId && link.targetTaskId !== selectedTaskId
      ));
      setSelectedTaskId('');
    }
  };

  const handleToggleMilestone = () => {
    if (selectedTaskId) {
      setTasks(prev => prev.map(task => 
        task.id === selectedTaskId 
          ? { ...task, isMilestone: !task.isMilestone }
          : task
      ));
    }
  };

  const handleLinkTasks = (data: any) => {
    // This would typically require selecting two tasks
    console.log('Link tasks operation:', data);
  };

  const handleUnlinkTasks = (data: any) => {
    if (selectedTaskId) {
      setLinks(prev => prev.filter(link => 
        link.sourceTaskId !== selectedTaskId && link.targetTaskId !== selectedTaskId
      ));
    }
  };

  const handleIndentTask = () => {
    if (selectedTaskId) {
      setTasks(prev => prev.map(task => 
        task.id === selectedTaskId 
          ? { ...task, level: Math.min(task.level + 1, 5) }
          : task
      ));
    }
  };

  const handleOutdentTask = () => {
    if (selectedTaskId) {
      setTasks(prev => prev.map(task => 
        task.id === selectedTaskId 
          ? { ...task, level: Math.max(task.level - 1, 0) }
          : task
      ));
    }
  };

  const handleSetProgress = (data: any) => {
    if (selectedTaskId && data?.value !== undefined) {
      setTasks(prev => prev.map(task => 
        task.id === selectedTaskId 
          ? { ...task, progress: data.value }
          : task
      ));
      console.log(`Set progress to ${data.value}% for task ${selectedTaskId}`);
    }
  };

  // Allocation operation handlers for AllocationTab
  const handleAllocationOperation = (operation: any) => {
    console.log('Allocation operation:', operation);
    
    switch (operation.type) {
      case 'assign-resource':
        handleAssignResource(operation.data);
        break;
      case 'combine-work-rate':
        handleCombineWorkRate(operation.data);
        break;
      case 'set-delay':
        handleSetDelay(operation.data);
        break;
      case 'load-profiles':
        handleLoadProfiles(operation.data);
        break;
      case 'update-allocation':
        handleUpdateAllocation(operation.data);
        break;
      default:
        console.log('Unknown allocation operation:', operation);
    }
  };

  const handleAssignResource = (data: any) => {
    console.log('Assign resource:', data);
    // TODO: Implement resource assignment
  };

  const handleCombineWorkRate = (data: any) => {
    console.log('Combine work rate:', data);
    // TODO: Implement work rate combination
  };

  const handleSetDelay = (data: any) => {
    console.log('Set delay:', data);
    // TODO: Implement delay setting
  };

  const handleLoadProfiles = (data: any) => {
    console.log('Load profiles:', data);
    // TODO: Implement profile loading
  };

  const handleUpdateAllocation = (data: any) => {
    console.log('Update allocation:', data);
    // TODO: Implement allocation updates
  };

  // Sidebar navigation handler
  const handleSidebarNavigation = (itemId: string) => {
    console.log('Sidebar navigation:', itemId);
    
    switch (itemId) {
      case 'dashboard':
        setViewMode('gantt');
        break;
      case 'gantt':
        setViewMode('gantt');
        break;
      case 'timeline':
        setViewMode('timeline');
        break;
      case 'calendar':
        setViewMode('calendar');
        break;
      case 'resources':
        setViewMode('resource');
        break;
      case 'costs':
        setViewMode('cost');
        break;
      case 'tasks':
        setViewMode('gantt');
        break;
      case 'documents':
        setViewMode('documents');
        console.log('Switched to Documents view');
        break;
      case 'reports':
        setViewMode('reports');
        console.log('Switched to Reports view');
        break;
      case 'tools':
        setViewMode('tools');
        console.log('Switched to Tools view');
        break;
      default:
        console.log('Unknown navigation item:', itemId);
    }
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      <AutoSaveProvider>
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
          {/* Left Sidebar */}
          <AstaSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeProject={activeProject}
            userRole={userRole}
            onNavigation={handleSidebarNavigation}
            activeViewMode={viewMode}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header */}
            <AstaHeader
              activeProject={activeProject}
              autoSaveStatus={autoSaveStatus}
              userRole={userRole}
              onProjectChange={onProjectChange}
            />

            {/* Auto-Save Status Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
              <AutoSaveStatus className="text-sm" />
            </div>

            {/* Ribbon */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <AstaRibbon
                activeTab={activeRibbonTab}
                userRole={userRole}
                projectId={activeProject?.id}
                onViewOperation={handleViewOperation}
                currentViewState={viewState}
                onViewStateChange={handleViewStateChange}
                onTaskOperation={handleTaskOperation}
                onAllocationOperation={handleAllocationOperation}
                selectedTasks={selectedTaskId ? [selectedTaskId] : []}
                onTabChange={setActiveRibbonTab}
              />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden p-4">
              {children || (
                <div className="h-full flex flex-col">
                  {/* View Mode Header */}
                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
                      </h2>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Active Project: {activeProject?.name || 'No Project Selected'}
                      </div>
                    </div>
                  </div>

                  {/* View-Specific Content */}
                  {viewMode === 'gantt' && (
                    <div className="h-full flex flex-col">
                      {/* Timeline Band */}
                      {viewState.showTimelineBand && activeProject && (
                        <div className="mb-4">
                          <TimelineBand
                            projectId={activeProject.id}
                            userRole={userRole}
                            onScrollSync={handleTimelineScrollSync}
                            scrollLeft={timelineScrollLeft}
                            width={1200}
                            height={120}
                          />
                        </div>
                      )}

                      {/* Main Content Grid */}
                      <div className="flex-1 grid grid-cols-12 gap-4">
                        {/* Left Panel: Task Table */}
                        <div className="col-span-4 min-w-0">
                          <TaskTableComponent
                            tasks={tasks}
                            links={links}
                            selectedTaskId={selectedTaskId}
                            onTaskSelect={handleTaskSelect}
                            onTaskUpdate={handleTaskUpdate}
                            onScrollSync={handleScrollSync}
                            userRole={userRole}
                            expandedTasks={expandedTasks}
                            onToggleExpansion={handleToggleExpansion}
                          />
                        </div>

                        {/* Center Panel: Gantt Chart */}
                        <div className="col-span-8 min-w-0">
                          <GanttCanvas
                            tasks={tasks}
                            links={links}
                            startDate={activeProject?.startDate || new Date()}
                            endDate={activeProject?.endDate || new Date()}
                            zoomLevel={viewState.zoomLevel}
                            showGridlines={viewState.showGridlines}
                            showTaskLinks={viewState.showTaskLinks}
                            showFloat={viewState.showFloat}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskSelect={handleTaskSelect}
                            selectedTaskId={selectedTaskId}
                            userRole={userRole}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'timeline' && (
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline View</h3>
                      <p className="text-gray-600 dark:text-gray-400">Timeline view implementation coming soon...</p>
                    </div>
                  )}

                  {viewMode === 'calendar' && (
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar View</h3>
                      <p className="text-gray-600 dark:text-gray-400">Calendar view implementation coming soon...</p>
                    </div>
                  )}

                  {viewMode === 'resource' && (
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource View</h3>
                      <p className="text-gray-600 dark:text-gray-400">Resource management view implementation coming soon...</p>
                    </div>
                  )}

                  {viewMode === 'cost' && (
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost View</h3>
                      <p className="text-gray-600 dark:text-gray-400">Cost management view implementation coming soon...</p>
                    </div>
                  )}

                  {viewMode === 'documents' && (
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents View</h3>
                      <p className="text-gray-600 dark:text-gray-400">Document management view implementation coming soon...</p>
                    </div>
                  )}

                  {viewMode === 'reports' && (
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reports View</h3>
                      <p className="text-gray-600 dark:text-gray-400">Reporting and analytics view implementation coming soon...</p>
                    </div>
                  )}

                  {viewMode === 'tools' && (
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tools View</h3>
                      <p className="text-gray-600 dark:text-gray-400">Project tools and utilities implementation coming soon...</p>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </AutoSaveProvider>
    </LayoutContext.Provider>
  );
};

export default AstaPowerProjectLayout; 