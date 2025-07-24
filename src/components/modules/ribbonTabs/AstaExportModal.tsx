import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon,
  CalendarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { demoModeService } from '../../../services/demoModeService';
import { astaImportExportService, AstaExportSettings } from '../../../services/astaImportExportService';

interface AstaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: AstaExportSettings) => void;
  projectId?: string;
  projectName?: string;
}

const AstaExportModal: React.FC<AstaExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  projectName = 'Project',
  projectId = 'demo'
}) => {
  const [settings, setSettings] = useState<AstaExportSettings>({
    fileType: 'csv',
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    includeConstraints: true,
    includeBaselines: true,
    includeNotes: true,
    includeResources: true,
    includeCalendars: true,
    demo: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [exportCount, setExportCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.export.asta');

  useEffect(() => {
    if (isOpen) {
      checkDemoMode();
      loadExportCount();
    }
  }, [isOpen]);

  const checkDemoMode = async () => {
    const isDemo = await demoModeService.isDemoMode();
    setIsDemoMode(isDemo);
    setSettings(prev => ({ ...prev, demo: isDemo }));
  };

  const loadExportCount = async () => {
    try {
      const count = await astaImportExportService['getDemoExportCount'](projectId);
      setExportCount(count);
    } catch (error) {
      console.error('Failed to load export count:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    // Demo mode validation
    if (isDemoMode && exportCount >= 3) {
      setError('Demo mode limited to 3 exports per session. Please upgrade for unlimited exports.');
      return;
    }

    // Date range validation
    const dateRange = settings.dateRange.end.getTime() - settings.dateRange.start.getTime();
    const maxRange = isDemoMode ? 7 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000; // 7 days demo, 1 year full
    
    if (dateRange > maxRange) {
      setError(`Date range too large. Maximum allowed: ${isDemoMode ? '7 days' : '1 year'} in ${isDemoMode ? 'demo' : 'full'} mode.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const exportSettings = {
        ...settings,
        demo: isDemoMode
      };
      await onExport(exportSettings);
      onClose();
    } catch (error) {
      console.error('Failed to export to Asta:', error);
      setError('Failed to export the programme. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const updateSettings = (updates: Partial<AstaExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getFileExtension = () => {
    switch (settings.fileType) {
      case 'xer': return '.xer';
      case 'mpx': return '.mpx';
      case 'csv': return '.csv';
      case 'json': return '.json';
      default: return '.csv';
    }
  };

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    return `${projectName}_${date}${getFileExtension()}`;
  };

  const getFormatDescription = () => {
    switch (settings.fileType) {
      case 'xer':
        return 'Primavera XER format - Most compatible with Asta PowerProject';
      case 'mpx':
        return 'Microsoft Project MPX format - Standard project management format';
      case 'csv':
        return 'CSV format - Simple spreadsheet format for data analysis';
      case 'json':
        return 'JSON format - Structured data format for system integration';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ArrowDownTrayIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export to Asta PowerProject
            </h2>
            {isDemoMode && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md font-medium">
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!canEdit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300 font-medium">
                  You don't have permission to export Asta files
                </span>
              </div>
            </div>
          )}

          {isDemoMode && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Demo Mode Restrictions
                  </span>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <div>• Maximum 3 exports per session (used: {exportCount}/3)</div>
                  <div>• Date range limited to 7 days</div>
                  <div>• Exported files will be watermarked</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Format
              </label>
              <div className="space-y-3">
                {[
                  { value: 'csv', label: 'CSV Export (.csv)', description: 'Simple spreadsheet format for data analysis' },
                  { value: 'json', label: 'JSON Export (.json)', description: 'Structured data format for system integration' },
                  { value: 'xer', label: 'Primavera XER (.xer)', description: 'Most compatible with Asta PowerProject' },
                  { value: 'mpx', label: 'Microsoft Project MPX (.mpx)', description: 'Standard project management format' }
                ].map((format) => (
                  <label key={format.value} className="flex items-start">
                    <input
                      type="radio"
                      name="fileType"
                      value={format.value}
                      checked={settings.fileType === format.value}
                      onChange={(e) => updateSettings({ fileType: e.target.value as any })}
                      disabled={!canEdit}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{format.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={settings.dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => updateSettings({
                      dateRange: {
                        ...settings.dateRange,
                        start: new Date(e.target.value)
                      }
                    })}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={settings.dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => updateSettings({
                      dateRange: {
                        ...settings.dateRange,
                        end: new Date(e.target.value)
                      }
                    })}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Only tasks within this date range will be exported
              </p>
            </div>

            {/* Export Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Options
              </label>
              <div className="space-y-3">
                {[
                  { key: 'includeConstraints', label: 'Include Task Constraints', description: 'Export task start/finish constraints' },
                  { key: 'includeBaselines', label: 'Include Baselines', description: 'Export project baseline data' },
                  { key: 'includeNotes', label: 'Include Notes', description: 'Export task notes and descriptions' },
                  { key: 'includeResources', label: 'Include Resources', description: 'Export resource assignments' },
                  { key: 'includeCalendars', label: 'Include Calendars', description: 'Export working calendars' }
                ].map((option) => (
                  <label key={option.key} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={settings[option.key as keyof AstaExportSettings] as boolean}
                      onChange={(e) => updateSettings({
                        [option.key]: e.target.checked
                      })}
                      disabled={!canEdit}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* File Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">File Name:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{getFileName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Format:</span>
                  <span className="text-gray-900 dark:text-white">{settings.fileType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date Range:</span>
                  <span className="text-gray-900 dark:text-white">
                    {settings.dateRange.start.toLocaleDateString()} - {settings.dateRange.end.toLocaleDateString()}
                  </span>
                </div>
                {isDemoMode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Demo Exports:</span>
                    <span className="text-gray-900 dark:text-white">{exportCount}/3</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canEdit || isLoading || (isDemoMode && exportCount >= 3)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              canEdit && !isLoading && !(isDemoMode && exportCount >= 3)
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </div>
            ) : (
              'Export Programme'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AstaExportModal; 