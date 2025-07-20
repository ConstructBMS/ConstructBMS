import React, { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  FlagIcon,
  LinkIcon,
  ScissorsIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CogIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export interface AdvancedTaskOperation {
  type: 'add-task' | 'delete-task' | 'edit-task' | 'duplicate-task' | 'indent-task' | 'outdent-task' | 'move-up' | 'move-down' | 'add-milestone' | 'add-summary' | 'link-tasks' | 'unlink-tasks' | 'split-task' | 'merge-tasks';
  data?: any;
}

export interface AdvancedScheduleOperation {
  type: 'auto-schedule' | 'manual-schedule' | 'level-resources' | 'optimize-schedule' | 'calculate-critical-path' | 'apply-constraints' | 'remove-constraints' | 'set-baseline' | 'clear-baseline' | 'update-progress' | 'recalculate';
  data?: any;
}

export interface AdvancedProjectOperation {
  type: 'import-data' | 'export-data' | 'sync-asta' | 'backup-project' | 'restore-project' | 'validate-project' | 'optimize-project' | 'generate-reports' | 'publish-project';
  data?: any;
}

export interface AdvancedViewOperation {
  type: 'toggle-critical-path' | 'toggle-baseline' | 'toggle-actuals' | 'toggle-constraints' | 'toggle-dependencies' | 'toggle-resources' | 'toggle-notes' | 'toggle-custom-fields' | 'zoom-in' | 'zoom-out' | 'fit-to-window' | 'go-to-date' | 'go-to-task';
  data?: any;
}

export interface AdvancedFilterOperation {
  type: 'apply-filter' | 'clear-filter' | 'save-filter' | 'load-filter' | 'filter-by-status' | 'filter-by-assignee' | 'filter-by-date-range' | 'filter-by-critical-path' | 'filter-by-constraints' | 'filter-by-resources';
  data?: any;
}

export interface AdvancedSortOperation {
  type: 'sort-by-name' | 'sort-by-start-date' | 'sort-by-end-date' | 'sort-by-duration' | 'sort-by-priority' | 'sort-by-assignee' | 'sort-by-status' | 'sort-by-float' | 'sort-by-wbs' | 'custom-sort';
  data?: any;
}

export interface AdvancedToolsOperation {
  type: 'what-if-analysis' | 'scenario-manager' | 'risk-analysis' | 'earned-value-analysis' | 'resource-leveling' | 'cost-analysis' | 'schedule-compression' | 'monte-carlo-simulation' | 'ai-optimization' | 'performance-analysis';
  data?: any;
}

export interface AdvancedHomeTabProps {
  onTaskOperation: (operation: AdvancedTaskOperation) => void;
  onScheduleOperation: (operation: AdvancedScheduleOperation) => void;
  onProjectOperation: (operation: AdvancedProjectOperation) => void;
  onViewOperation: (operation: AdvancedViewOperation) => void;
  onFilterOperation: (operation: AdvancedFilterOperation) => void;
  onSortOperation: (operation: AdvancedSortOperation) => void;
  onToolsOperation: (operation: AdvancedToolsOperation) => void;
  userRole: string;
  selectedTasks: string[];
  canEdit: boolean;
  projectStatus: 'planning' | 'execution' | 'monitoring' | 'closing';
  hasBaseline: boolean;
  hasActuals: boolean;
  criticalPathEnabled: boolean;
  autoScheduleEnabled: boolean;
}

const AdvancedHomeTab: React.FC<AdvancedHomeTabProps> = ({
  onTaskOperation,
  onScheduleOperation,
  onProjectOperation,
  onViewOperation,
  onFilterOperation,
  onSortOperation,
  onToolsOperation,
  userRole,
  selectedTasks,
  canEdit,
  projectStatus,
  hasBaseline,
  hasActuals,
  criticalPathEnabled,
  autoScheduleEnabled
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (dropdownId: string) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  const isViewer = userRole === 'viewer';
  const isProjectManager = userRole === 'project_manager' || userRole === 'admin';
  const isScheduler = userRole === 'scheduler' || userRole === 'project_manager' || userRole === 'admin';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-4 py-2 space-x-6">
        
        {/* Task Management Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Tasks</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTaskOperation({ type: 'add-task' })}
              disabled={!canEdit}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Add new task"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskOperation({ type: 'add-milestone' })}
              disabled={!canEdit}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Add milestone"
            >
              <FlagIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskOperation({ type: 'add-summary' })}
              disabled={!canEdit}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Add summary task"
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskOperation({ type: 'delete-task' })}
              disabled={!canEdit || selectedTasks.length === 0}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit || selectedTasks.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Delete selected tasks"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Structure Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Structure</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTaskOperation({ type: 'indent-task' })}
              disabled={!canEdit || selectedTasks.length === 0}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit || selectedTasks.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Indent task"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskOperation({ type: 'outdent-task' })}
              disabled={!canEdit || selectedTasks.length === 0}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit || selectedTasks.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Outdent task"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskOperation({ type: 'move-up' })}
              disabled={!canEdit || selectedTasks.length === 0}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit || selectedTasks.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Move task up"
            >
              <ArrowUpIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskOperation({ type: 'move-down' })}
              disabled={!canEdit || selectedTasks.length === 0}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit || selectedTasks.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Move task down"
            >
              <ArrowDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dependencies Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Dependencies</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTaskOperation({ type: 'link-tasks' })}
              disabled={!canEdit || selectedTasks.length < 2}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit || selectedTasks.length < 2
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Link selected tasks"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskOperation({ type: 'unlink-tasks' })}
              disabled={!canEdit || selectedTasks.length === 0}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !canEdit || selectedTasks.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Unlink selected tasks"
            >
              <ScissorsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scheduling Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Schedule</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onScheduleOperation({ type: 'auto-schedule' })}
              disabled={!isScheduler}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isScheduler
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : autoScheduleEnabled
                  ? 'bg-green-100 border border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Auto schedule"
            >
              <PlayIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onScheduleOperation({ type: 'manual-schedule' })}
              disabled={!isScheduler}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isScheduler
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : !autoScheduleEnabled
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Manual schedule"
            >
              <PauseIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onScheduleOperation({ type: 'calculate-critical-path' })}
              disabled={!isScheduler}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isScheduler
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : criticalPathEnabled
                  ? 'bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Calculate critical path"
            >
              <BoltIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onScheduleOperation({ type: 'level-resources' })}
              disabled={!isScheduler}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isScheduler
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Level resources"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Controls Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">View</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onViewOperation({ type: 'toggle-critical-path' })}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                criticalPathEnabled
                  ? 'bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle critical path"
            >
              <BoltIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onViewOperation({ type: 'toggle-baseline' })}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                hasBaseline
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle baseline"
            >
              <ShieldCheckIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onViewOperation({ type: 'toggle-actuals' })}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                hasActuals
                  ? 'bg-green-100 border border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Toggle actuals"
            >
              <ChartBarIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onViewOperation({ type: 'toggle-dependencies' })}
              className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Toggle dependencies"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Management Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Data</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onProjectOperation({ type: 'import-data' })}
              disabled={!isProjectManager}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isProjectManager
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Import data"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onProjectOperation({ type: 'export-data' })}
              disabled={!isProjectManager}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isProjectManager
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Export data"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onProjectOperation({ type: 'sync-asta' })}
              disabled={!isProjectManager}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isProjectManager
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Sync with Asta PowerProject"
            >
              <CloudArrowUpIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Tools Group */}
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Tools</h3>
          <div className="flex items-center space-x-1">
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle('analysis')}
                disabled={!isProjectManager}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center space-x-1 ${
                  !isProjectManager
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Analysis tools"
              >
                <BeakerIcon className="w-4 h-4" />
                <span>Analysis</span>
              </button>
              
              {activeDropdown === 'analysis' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      onToolsOperation({ type: 'what-if-analysis' });
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    What-If Analysis
                  </button>
                  <button
                    onClick={() => {
                      onToolsOperation({ type: 'scenario-manager' });
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Scenario Manager
                  </button>
                  <button
                    onClick={() => {
                      onToolsOperation({ type: 'risk-analysis' });
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Risk Analysis
                  </button>
                  <button
                    onClick={() => {
                      onToolsOperation({ type: 'earned-value-analysis' });
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Earned Value Analysis
                  </button>
                  <button
                    onClick={() => {
                      onToolsOperation({ type: 'monte-carlo-simulation' });
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Monte Carlo Simulation
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => onToolsOperation({ type: 'ai-optimization' })}
              disabled={!isProjectManager}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isProjectManager
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="AI-powered optimization"
            >
              <SparklesIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onToolsOperation({ type: 'performance-analysis' })}
              disabled={!isProjectManager}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                !isProjectManager
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              title="Performance analysis"
            >
              <ChartBarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdvancedHomeTab; 