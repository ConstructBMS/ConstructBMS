import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  DocumentArrowDownIcon, 
  PhotoIcon, 
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { timelineExportService, type TimelineExportOptions } from '../services/timelineExportService';
import { multiProjectService } from '../services/multiProjectService';
import { toastService } from './ToastNotification';

interface TimelineExportModalProps {
  currentDateRange?: {
    end: Date;
    start: Date;
  };
  currentFilters?: {
    assignee?: string[];
    priority?: string[];
    status?: string[];
    tags?: string[];
  };
  currentZoomLevel?: 'days' | 'weeks' | 'months' | 'quarters';
  isExporting?: boolean;
  isMultiProjectMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'png', options: TimelineExportOptions) => void;
  projectId: string;
  projectName: string;
  selectedProjects?: string[];
}

const TimelineExportModal: React.FC<TimelineExportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentFilters,
  currentZoomLevel = 'weeks',
  currentDateRange,
  isMultiProjectMode = false,
  selectedProjects = [],
  onExport,
  isExporting = false
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [options, setOptions] = useState<TimelineExportOptions>(timelineExportService.getDefaultExportOptions());
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canExport = canAccess('programme.export');
  const canManageSettings = canAccess('programme.export.settings');

  // Check demo mode and load data on mount
  useEffect(() => {
    const loadData = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      
      // Load saved settings
      const savedSettings = await timelineExportService.loadExportSettings(projectId);
      if (savedSettings) {
        setOptions(savedSettings);
      }
      
      // Load available projects for multi-project mode
      if (isMultiProjectMode) {
        const projects = await multiProjectService.getAccessibleProjects();
        setAvailableProjects(projects);
      }
    };
    
    if (isOpen) {
      loadData();
    }
  }, [isOpen, projectId, isMultiProjectMode]);

  // Update options with current state
  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      zoomLevel: currentZoomLevel,
      dateRange: currentDateRange,
      filters: currentFilters,
      multiProject: isMultiProjectMode ? {
        enabled: true,
        selectedProjects,
        groupByProject: true
      } : {
        enabled: false,
        selectedProjects: [],
        groupByProject: true
      }
    }));
  }, [currentZoomLevel, currentDateRange, currentFilters, isMultiProjectMode, selectedProjects]);

  const handleOptionChange = (key: keyof TimelineExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setError(null);
      const result = await timelineExportService.saveExportSettings(projectId, options);
      if (result.success) {
        toastService.success('Success', 'Export settings saved');
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving export settings:', error);
      setError('Failed to save settings');
    }
  };

  const handleExport = async (format: 'pdf' | 'png') => {
    try {
      setError(null);
      
      // Update format in options
      const exportOptions = { ...options, format };
      
      // Check demo mode restrictions
      if (!timelineExportService.canExportInDemoMode(exportOptions)) {
        setError('Export not allowed with current options in demo mode');
        return;
      }
      
      // Save settings before export
      await timelineExportService.saveExportSettings(projectId, exportOptions);
      
      // Trigger export
      onExport(format, exportOptions);
    } catch (error) {
      console.error('Error during export:', error);
      setError('Failed to export');
    }
  };

  const getStatusOptions = () => [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' }
  ];

  const getPriorityOptions = () => [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  if (!isOpen || !canExport) {
    return null;
  }

  const demoRestrictions = timelineExportService.getDemoModeRestrictions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Timeline Export Options
            </h2>
            {isDemoMode && (
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm rounded-md font-medium">
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Project Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Exporting: {projectName}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Configure your timeline export options below. Settings will be saved for future exports.
            </p>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOptionChange('format', 'pdf')}
                    disabled={isDemoMode}
                    className={`p-3 border rounded-md text-sm font-medium transition-colors ${
                      options.format === 'pdf'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } ${isDemoMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <DocumentArrowDownIcon className="w-5 h-5 mx-auto mb-1" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleOptionChange('format', 'png')}
                    disabled={isDemoMode}
                    className={`p-3 border rounded-md text-sm font-medium transition-colors ${
                      options.format === 'png'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } ${isDemoMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <PhotoIcon className="w-5 h-5 mx-auto mb-1" />
                    PNG
                  </button>
                </div>
                {isDemoMode && (
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    PNG export disabled in demo mode
                  </p>
                )}
              </div>

              {/* Page Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Settings
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Page Size</label>
                    <select
                      value={options.pageSize}
                      onChange={(e) => handleOptionChange('pageSize', e.target.value)}
                      disabled={isDemoMode}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Orientation</label>
                    <select
                      value={options.orientation}
                      onChange={(e) => handleOptionChange('orientation', e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
                {isDemoMode && (
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    Page size fixed to A4 in demo mode
                  </p>
                )}
              </div>

              {/* Zoom Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zoom Level
                </label>
                <select
                  value={options.zoomLevel}
                  onChange={(e) => handleOptionChange('zoomLevel', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="quarters">Quarters</option>
                </select>
              </div>

              {/* Date Range */}
              {currentDateRange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={options.dateRange?.start.toISOString().split('T')[0] || currentDateRange.start.toISOString().split('T')[0]}
                        onChange={(e) => handleOptionChange('dateRange', {
                          ...options.dateRange,
                          start: new Date(e.target.value)
                        })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={options.dateRange?.end.toISOString().split('T')[0] || currentDateRange.end.toISOString().split('T')[0]}
                        onChange={(e) => handleOptionChange('dateRange', {
                          ...options.dateRange,
                          end: new Date(e.target.value)
                        })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Display Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeLogo}
                      onChange={(e) => handleOptionChange('includeLogo', e.target.checked)}
                      disabled={isDemoMode}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Logo & Branding</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.showFiltersAndDate}
                      onChange={(e) => handleOptionChange('showFiltersAndDate', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Filters & Date</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeMilestones}
                      onChange={(e) => handleOptionChange('includeMilestones', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Milestones</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeDependencies}
                      onChange={(e) => handleOptionChange('includeDependencies', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Dependencies</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeBaseline}
                      onChange={(e) => handleOptionChange('includeBaseline', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Baseline</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeCriticalPath}
                      onChange={(e) => handleOptionChange('includeCriticalPath', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Critical Path</span>
                  </label>
                </div>
                {isDemoMode && (
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    Branding cannot be disabled in demo mode
                  </p>
                )}
              </div>

              {/* Multi-Project Options */}
              {isMultiProjectMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Multi-Project Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.multiProject?.groupByProject || false}
                        onChange={(e) => handleOptionChange('multiProject', {
                          ...options.multiProject,
                          groupByProject: e.target.checked
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Group by Project</span>
                    </label>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Selected Projects: {selectedProjects.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              {currentFilters && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Filters
                  </label>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {currentFilters.status?.length && (
                      <div>Status: {currentFilters.status.join(', ')}</div>
                    )}
                    {currentFilters.priority?.length && (
                      <div>Priority: {currentFilters.priority.join(', ')}</div>
                    )}
                    {currentFilters.tags?.length && (
                      <div>Tags: {currentFilters.tags.join(', ')}</div>
                    )}
                    {currentFilters.assignee?.length && (
                      <div>Assignee: {currentFilters.assignee.join(', ')}</div>
                    )}
                    {!currentFilters.status?.length && !currentFilters.priority?.length && 
                     !currentFilters.tags?.length && !currentFilters.assignee?.length && (
                      <div>No filters applied</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demo Mode Restrictions */}
          {isDemoMode && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  <p className="font-medium">Demo Mode Restrictions:</p>
                  <ul className="mt-1 space-y-1">
                    {demoRestrictions.map((restriction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                        <span>{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {canManageSettings && (
              <button
                onClick={handleSaveSettings}
                disabled={isExporting}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Save Settings
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting || isDemoMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                isDemoMode
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <PhotoIcon className="w-4 h-4" />
              <span>Export PNG</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineExportModal; 