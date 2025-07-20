import React, { useState, useEffect } from 'react';
import type { ViewOperation, ViewState } from './ribbonTabs/ViewTab';
import type { AllocationOperation } from './ribbonTabs/AllocationTab';
import type { FormatOperation, FormatState } from './ribbonTabs/FormatTab';
import type { OutputOperation, OutputState } from './ribbonTabs/OutputTab';

interface AstaRibbonProps {
  activeTab: string;
  userRole: string;
  projectId?: string;
  onViewOperation?: (operation: ViewOperation) => void;
  currentViewState?: ViewState;
  onViewStateChange?: (newState: Partial<ViewState>) => void;
  onOutputOperation?: (operation: OutputOperation) => void;
  currentOutputState?: OutputState;
  onOutputStateChange?: (newState: Partial<OutputState>) => void;
  onTaskOperation?: (operation: any) => void;
  onAllocationOperation?: (operation: any) => void;
  selectedTasks?: string[];
  onTabChange?: (tabId: string) => void;
}

const AstaRibbon: React.FC<AstaRibbonProps> = ({
  activeTab,
  userRole,
  projectId,
  onViewOperation,
  currentViewState,
  onViewStateChange,
  onOutputOperation,
  currentOutputState,
  onOutputStateChange,
  onTaskOperation,
  onAllocationOperation,
  selectedTasks = [],
  onTabChange
}) => {
  const [loading, setLoading] = useState(false);

  const renderTabButtons = () => {
    const tabs = [
      { id: 'home', label: 'Home' },
      { id: 'view', label: 'View' },
      { id: 'project', label: 'Project' },
      { id: 'allocation', label: 'Allocation' },
      { id: 'format', label: 'Format' },
      { id: 'output', label: 'Output' }
    ];

    return (
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'view':
        return renderViewTab();
      case 'project':
        return renderProjectTab();
      case 'allocation':
        return renderAllocationTab();
      case 'format':
        return renderFormatTab();
      case 'output':
        return renderOutputTab();
      default:
        return renderHomeTab();
    }
  };

  const renderHomeTab = () => {
    const handleTaskOperationLocal = (operation: any) => {
      console.log('Task operation:', operation);
      onTaskOperation?.(operation);
    };

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto">
          
          {/* Clipboard Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Clipboard</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleTaskOperationLocal({ type: 'copy' })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Copy selected tasks"
              >
                Copy
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'cut' })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Cut selected tasks"
              >
                Cut
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'paste' })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Paste tasks"
              >
                Paste
              </button>
            </div>
          </div>

          {/* Tasks Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Tasks</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleTaskOperationLocal({ type: 'add-task' })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Add new task"
              >
                Add Task
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'delete-task' })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Delete selected tasks"
              >
                Delete
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'add-milestone' })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Add milestone"
              >
                Milestone
              </button>
            </div>
          </div>

          {/* Schedule Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Schedule</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleTaskOperationLocal({ type: 'link-tasks' })}
                disabled={userRole === 'viewer' || selectedTasks.length < 2}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length < 2
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Link selected tasks"
              >
                Link Tasks
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'unlink-tasks' })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Unlink selected tasks"
              >
                Unlink
              </button>
            </div>
          </div>

          {/* Structure Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Structure</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleTaskOperationLocal({ type: 'indent-task' })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Indent task"
              >
                Indent
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'outdent-task' })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Outdent task"
              >
                Outdent
              </button>
            </div>
          </div>

          {/* Progress Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Progress</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleTaskOperationLocal({ type: 'set-progress', data: { progress: 25 } })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Set progress to 25%"
              >
                25%
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'set-progress', data: { progress: 50 } })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Set progress to 50%"
              >
                50%
              </button>
              <button
                onClick={() => handleTaskOperationLocal({ type: 'set-progress', data: { progress: 100 } })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Set progress to 100%"
              >
                100%
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewTab = () => {
    const handleViewOperation = (operation: ViewOperation) => {
      console.log('View operation:', operation);
      onViewOperation?.(operation);
    };

    const defaultViewState: ViewState = {
      zoomLevel: 100,
      showGridlines: true,
      showTimelineBand: true,
      showTaskLinks: true,
      showFloat: false
    };

    const viewState = currentViewState || defaultViewState;
    const handleViewStateChange = (newState: Partial<ViewState>) => {
      onViewStateChange?.(newState);
    };

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto">
          
          {/* Zoom Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Zoom</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const newZoom = Math.min(viewState.zoomLevel + 25, 500);
                  handleViewStateChange({ zoomLevel: newZoom });
                  handleViewOperation({ type: 'zoom-in', data: { zoomLevel: newZoom } });
                }}
                disabled={userRole === 'viewer' || viewState.zoomLevel >= 500}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || viewState.zoomLevel >= 500
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => {
                  const newZoom = Math.max(viewState.zoomLevel - 25, 25);
                  handleViewStateChange({ zoomLevel: newZoom });
                  handleViewOperation({ type: 'zoom-out', data: { zoomLevel: newZoom } });
                }}
                disabled={userRole === 'viewer' || viewState.zoomLevel <= 25}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || viewState.zoomLevel <= 25
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Zoom out"
              >
                -
              </button>
              <span className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                {viewState.zoomLevel}%
              </span>
            </div>
          </div>

          {/* Visibility Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Visibility</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const newState = !viewState.showGridlines;
                  handleViewStateChange({ showGridlines: newState });
                  handleViewOperation({ type: 'toggle-gridlines', data: { show: newState } });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : viewState.showGridlines
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Toggle gridlines"
              >
                Gridlines
              </button>
              <button
                onClick={() => {
                  const newState = !viewState.showTimelineBand;
                  handleViewStateChange({ showTimelineBand: newState });
                  handleViewOperation({ type: 'toggle-timeline-band', data: { show: newState } });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : viewState.showTimelineBand
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Toggle timeline band"
              >
                Timeline Band
              </button>
              <button
                onClick={() => {
                  const newState = !viewState.showTaskLinks;
                  handleViewStateChange({ showTaskLinks: newState });
                  handleViewOperation({ type: 'toggle-task-links', data: { show: newState } });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : viewState.showTaskLinks
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Toggle task links"
              >
                Task Links
              </button>
              <button
                onClick={() => {
                  const newState = !viewState.showFloat;
                  handleViewStateChange({ showFloat: newState });
                  handleViewOperation({ type: 'toggle-float', data: { show: newState } });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : viewState.showFloat
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Toggle float display"
              >
                Float
              </button>
            </div>
          </div>

          {/* Display Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Display</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  handleViewStateChange({
                    zoomLevel: 100,
                    showGridlines: true,
                    showTimelineBand: true,
                    showTaskLinks: true,
                    showFloat: false
                  });
                  handleViewOperation({ type: 'reset-view' });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Reset view to defaults"
              >
                Reset View
              </button>
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Toggle fullscreen"
              >
                Full Screen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectTab = () => {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto">
          
          {/* Project Management Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Project</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  // Open project selection modal
                  const projectName = prompt('Enter project name to switch to:');
                  if (projectName) {
                    console.log('Switching to project:', projectName);
                    // Here you would typically call a function to switch projects
                    // For now, we'll just log it
                  }
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Switch to different project"
              >
                Switch Project
              </button>
              <button
                onClick={() => console.log('Import project data')}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Import project data"
              >
                Import
              </button>
              <button
                onClick={() => console.log('Export project data')}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Export project data"
              >
                Export
              </button>
              <button
                onClick={() => console.log('Sync with Asta')}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Sync with Asta PowerProject"
              >
                Sync Asta
              </button>
            </div>
          </div>

          {/* Scheduling Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Scheduling</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => console.log('Auto schedule')}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Auto schedule tasks"
              >
                Auto Schedule
              </button>
              <button
                onClick={() => console.log('Calculate critical path')}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Calculate critical path"
              >
                Critical Path
              </button>
              <button
                onClick={() => console.log('Level resources')}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Level resources"
              >
                Level Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAllocationTab = () => {
    const handleAllocationOperation = (operation: AllocationOperation) => {
      console.log('Allocation operation:', operation);
      onAllocationOperation?.(operation);
    };

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto">
          
          {/* Assign Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Assign</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleAllocationOperation({ type: 'assign-resource', data: { action: 'assign-permanent', taskIds: selectedTasks } })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Assign permanent resources"
              >
                Assign Permanent
              </button>
              <button
                onClick={() => handleAllocationOperation({ type: 'assign-resource', data: { action: 'assign-consumable', taskIds: selectedTasks } })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Assign consumable resources"
              >
                Assign Consumable
              </button>
              <button
                onClick={() => handleAllocationOperation({ type: 'assign-resource', data: { action: 'assign-cost', taskIds: selectedTasks } })}
                disabled={userRole === 'viewer' || selectedTasks.length === 0}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer' || selectedTasks.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Assign cost centers"
              >
                Assign Cost
              </button>
            </div>
          </div>

          {/* Tools Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Tools</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleAllocationOperation({ type: 'update-allocation', data: { action: 'level-resources' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Level resources"
              >
                Level Resources
              </button>
              <button
                onClick={() => handleAllocationOperation({ type: 'load-profiles', data: { action: 'import-resources' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Import resources"
              >
                Import Resources
              </button>
              <button
                onClick={() => handleAllocationOperation({ type: 'combine-work-rate', data: { action: 'search-resources' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Search resources"
              >
                Resource Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFormatTab = () => {
    const [formatState, setFormatState] = useState<FormatState>({
      barColoring: 'critical',
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      barHeight: 20,
      showMilestoneAsDiamond: true,
      showFloatAsTrail: false,
      customColors: {
        critical: '#ef4444',
        normal: '#3b82f6',
        completed: '#10b981',
        delayed: '#f59e0b',
        resource1: '#7c3aed',
        resource2: '#0891b2',
        resource3: '#16a34a'
      }
    });

    const handleFormatOperation = (operation: FormatOperation) => {
      console.log('Format operation:', operation);
    };

    const handleFormatStateChange = (newState: Partial<FormatState>) => {
      setFormatState(prev => ({ ...prev, ...newState }));
      console.log('Format state changed:', newState);
    };

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto">
          
          {/* Format Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Format</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const newValue = !formatState.showMilestoneAsDiamond;
                  handleFormatOperation({ type: 'milestone-style', data: { show: newValue } });
                  handleFormatStateChange({ showMilestoneAsDiamond: newValue });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : formatState.showMilestoneAsDiamond
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Show milestone as diamond"
              >
                Milestone Diamond
              </button>
              <button
                onClick={() => {
                  const newValue = !formatState.showFloatAsTrail;
                  handleFormatOperation({ type: 'float-style', data: { show: newValue } });
                  handleFormatStateChange({ showFloatAsTrail: newValue });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : formatState.showFloatAsTrail
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Show float as trail"
              >
                Float Trail
              </button>
              <button
                onClick={() => handleFormatOperation({ type: 'display-options' })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                }`}
                title="Show progress"
              >
                Show Progress
              </button>
            </div>
          </div>

          {/* Appearance Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Appearance</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  handleFormatOperation({ type: 'bar-coloring', data: { scheme: 'critical' } });
                  handleFormatStateChange({ barColoring: 'critical' });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : formatState.barColoring === 'critical'
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Critical path coloring"
              >
                Critical
              </button>
              <button
                onClick={() => {
                  handleFormatOperation({ type: 'bar-coloring', data: { scheme: 'normal' } });
                  handleFormatStateChange({ barColoring: 'normal' });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : formatState.barColoring === 'normal'
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Normal coloring"
              >
                Normal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOutputTab = () => {
    const handleOutputOperation = (operation: OutputOperation) => {
      console.log('Output operation:', operation);
      onOutputOperation?.(operation);
    };

    const currentOutputState: OutputState = {
      selectedProfile: 'default',
      exportFormat: 'pdf',
      pageRange: { start: 1, end: 1, custom: false },
      includeLegend: true,
      includeGrid: true,
      includeTimeline: true,
      quality: 'normal',
      showPreview: false
    };

    const handleOutputStateChange = (newState: Partial<OutputState>) => {
      console.log('Output state changed:', newState);
      onOutputStateChange?.(newState);
    };

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-2 space-x-6 overflow-x-auto">
          
          {/* Export Options Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Export</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleOutputOperation({ type: 'print-export', data: { action: 'export' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Export to PDF"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleOutputOperation({ type: 'print-export', data: { action: 'print' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Print project"
              >
                Print
              </button>
            </div>
          </div>

          {/* Content Options Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Content</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const newValue = !currentOutputState.includeLegend;
                  handleOutputOperation({ type: 'include-legend', data: { include: newValue } });
                  handleOutputStateChange({ includeLegend: newValue });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : currentOutputState.includeLegend
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Include legend"
              >
                Include Legend
              </button>
              <button
                onClick={() => {
                  const newValue = !currentOutputState.includeGrid;
                  handleOutputOperation({ type: 'include-legend', data: { includeGrid: newValue } });
                  handleOutputStateChange({ includeGrid: newValue });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : currentOutputState.includeGrid
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Include grid"
              >
                Include Grid
              </button>
              <button
                onClick={() => {
                  const newValue = !currentOutputState.includeTimeline;
                  handleOutputOperation({ type: 'include-legend', data: { includeTimeline: newValue } });
                  handleOutputStateChange({ includeTimeline: newValue });
                }}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : currentOutputState.includeTimeline
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Include timeline"
              >
                Include Timeline
              </button>
            </div>
          </div>

          {/* Quality Group */}
          <div className="flex flex-col items-center min-w-fit">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Quality</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleOutputOperation({ type: 'export-format', data: { quality: 'draft' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : currentOutputState.quality === 'draft'
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Draft quality"
              >
                Draft
              </button>
              <button
                onClick={() => handleOutputOperation({ type: 'export-format', data: { quality: 'normal' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : currentOutputState.quality === 'normal'
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Normal quality"
              >
                Normal
              </button>
              <button
                onClick={() => handleOutputOperation({ type: 'export-format', data: { quality: 'high' } })}
                disabled={userRole === 'viewer'}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  userRole === 'viewer'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : currentOutputState.quality === 'high'
                    ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="High quality"
              >
                High
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-constructbms-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800">
      {renderTabButtons()}
      {renderTabContent()}
    </div>
  );
};

export default AstaRibbon; 