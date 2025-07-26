import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { exportService, ExportOptions } from '../services/exportService';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'png', options: ExportOptions) => void;
  projectId: string;
  projectName: string;
}

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onExport,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [options, setOptions] = useState<ExportOptions>(
    exportService.getDefaultExportOptions()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canExport = canAccess('programme.export');
  const canManageSettings = canAccess('programme.export.settings');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load saved settings
  useEffect(() => {
    if (isOpen) {
      loadExportSettings();
    }
  }, [isOpen, projectId]);

  const loadExportSettings = async () => {
    try {
      const settings = await exportService.getExportSettings(projectId);
      if (settings) {
        setOptions(settings.options);
      }
    } catch (error) {
      console.error('Error loading export settings:', error);
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await exportService.saveExportSettings(projectId, options);
      if (result.success) {
        console.log('Export settings saved');
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving export settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'png') => {
    try {
      setLoading(true);
      setError(null);

      // Save settings before export
      await exportService.saveExportSettings(projectId, options);

      // Trigger export
      onExport(format, options);

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error during export:', error);
      setError('Failed to export');
    } finally {
      setLoading(false);
    }
  };

  const getColumnOptions = () => [
    { id: 'name', label: 'Task Name' },
    { id: 'status', label: 'Status' },
    { id: 'startDate', label: 'Start Date' },
    { id: 'endDate', label: 'End Date' },
    { id: 'progress', label: 'Progress' },
    { id: 'assignee', label: 'Assignee' },
    { id: 'tags', label: 'Tags' },
    { id: 'type', label: 'Type' },
  ];

  if (!isOpen || !canExport) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <Cog6ToothIcon className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Export Options
            </h2>
            {isDemoMode && (
              <span className='px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md font-medium'>
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {/* Error Display */}
          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md'>
              <p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
            </div>
          )}

          {/* Project Info */}
          <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg'>
            <h3 className='text-lg font-medium text-blue-900 dark:text-blue-100 mb-2'>
              Exporting: {projectName}
            </h3>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              Configure your export options below. Settings will be saved for
              future exports.
            </p>
          </div>

          {/* Export Options */}
          <div className='space-y-6'>
            {/* Date Range */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Date Range
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                    Start Date
                  </label>
                  <input
                    type='date'
                    value={options.dateRange.start.toISOString().split('T')[0]}
                    onChange={e =>
                      handleOptionChange('dateRange', {
                        ...options.dateRange,
                        start: new Date(e.target.value),
                      })
                    }
                    disabled={isDemoMode}
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                    End Date
                  </label>
                  <input
                    type='date'
                    value={options.dateRange.end.toISOString().split('T')[0]}
                    onChange={e =>
                      handleOptionChange('dateRange', {
                        ...options.dateRange,
                        end: new Date(e.target.value),
                      })
                    }
                    disabled={isDemoMode}
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50'
                  />
                </div>
              </div>
              {isDemoMode && (
                <p className='mt-1 text-xs text-yellow-600 dark:text-yellow-400'>
                  Date range limited to 7 days in demo mode
                </p>
              )}
            </div>

            {/* Zoom Level */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Zoom Level
              </label>
              <select
                value={options.zoomLevel}
                onChange={e => handleOptionChange('zoomLevel', e.target.value)}
                disabled={isDemoMode}
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50'
              >
                <option value='days'>Days</option>
                <option value='weeks'>Weeks</option>
                <option value='months'>Months</option>
              </select>
            </div>

            {/* Columns to Include */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Columns to Include
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {getColumnOptions().map(column => (
                  <label
                    key={column.id}
                    className='flex items-center space-x-2'
                  >
                    <input
                      type='checkbox'
                      checked={options.columnsToInclude.includes(column.id)}
                      onChange={e => {
                        const newColumns = e.target.checked
                          ? [...options.columnsToInclude, column.id]
                          : options.columnsToInclude.filter(
                              c => c !== column.id
                            );
                        handleOptionChange('columnsToInclude', newColumns);
                      }}
                      disabled={
                        isDemoMode &&
                        options.columnsToInclude.length >= 3 &&
                        !options.columnsToInclude.includes(column.id)
                      }
                      className='rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 disabled:opacity-50'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {column.label}
                    </span>
                  </label>
                ))}
              </div>
              {isDemoMode && (
                <p className='mt-1 text-xs text-yellow-600 dark:text-yellow-400'>
                  Maximum 3 columns allowed in demo mode
                </p>
              )}
            </div>

            {/* Display Options */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Display Options
              </label>
              <div className='space-y-2'>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={options.showLegend}
                    onChange={e =>
                      handleOptionChange('showLegend', e.target.checked)
                    }
                    className='rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    Show Legend
                  </span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={options.showLogoHeader}
                    onChange={e =>
                      handleOptionChange('showLogoHeader', e.target.checked)
                    }
                    className='rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    Show Logo/Header
                  </span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={options.includeBaseline}
                    onChange={e =>
                      handleOptionChange('includeBaseline', e.target.checked)
                    }
                    className='rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    Include Baseline
                  </span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={options.includeCriticalPath}
                    onChange={e =>
                      handleOptionChange(
                        'includeCriticalPath',
                        e.target.checked
                      )
                    }
                    className='rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    Include Critical Path
                  </span>
                </label>
              </div>
            </div>

            {/* Page Settings */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Page Settings
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                    Page Size
                  </label>
                  <select
                    value={options.pageSize}
                    onChange={e =>
                      handleOptionChange('pageSize', e.target.value)
                    }
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  >
                    <option value='A4'>A4</option>
                    <option value='Letter'>Letter</option>
                    <option value='Legal'>Legal</option>
                  </select>
                </div>
                <div>
                  <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                    Orientation
                  </label>
                  <select
                    value={options.orientation}
                    onChange={e =>
                      handleOptionChange('orientation', e.target.value)
                    }
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  >
                    <option value='portrait'>Portrait</option>
                    <option value='landscape'>Landscape</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Mode Restrictions */}
          {isDemoMode && (
            <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
              <div className='flex items-start space-x-2'>
                <Cog6ToothIcon className='w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5' />
                <div className='text-sm text-yellow-800 dark:text-yellow-200'>
                  <p className='font-medium'>Demo Mode Restrictions:</p>
                  <ul className='mt-1 space-y-1'>
                    {exportService
                      .getDemoModeRestrictions()
                      .map((restriction, index) => (
                        <li key={index} className='flex items-start space-x-2'>
                          <span className='text-yellow-600 dark:text-yellow-400 mt-1'>
                            •
                          </span>
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
        <div className='flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-2'>
            {canManageSettings && (
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <button
              onClick={() => handleExport('png')}
              disabled={loading}
              className='flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
            >
              <PhotoIcon className='w-4 h-4' />
              <span>Export PNG</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={loading}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
            >
              <DocumentArrowDownIcon className='w-4 h-4' />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptionsModal;
