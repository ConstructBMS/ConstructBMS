import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PrinterIcon, 
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  CogIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';
import { timelinePrintService, TimelinePrintOptions, TimelinePrintData } from '../../services/timelinePrintService';

interface TimelinePrintOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (options: TimelinePrintOptions) => void;
  onPreview: (options: TimelinePrintOptions) => void;
  projectId: string;
  projectName: string;
  projectIdDisplay: string;
  tasks: any[];
  filters: any;
  currentView: any;
  isMultiProjectMode?: boolean;
  selectedProjects?: any[];
}

const TimelinePrintOptionsModal: React.FC<TimelinePrintOptionsModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  onPreview,
  projectId,
  projectName,
  projectIdDisplay,
  tasks,
  filters,
  currentView,
  isMultiProjectMode = false,
  selectedProjects = []
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [options, setOptions] = useState<TimelinePrintOptions>(timelinePrintService.getDefaultOptions());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  const canPrint = canAccess('programme.export');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      setOptions(prev => ({ ...prev, demo: isDemo }));
    };
    checkDemoMode();
  }, []);

  // Load saved settings
  useEffect(() => {
    if (isOpen) {
      loadPrintSettings();
    }
  }, [isOpen, projectId]);

  const loadPrintSettings = async () => {
    try {
      // In a real implementation, you would load saved settings from storage
      // For now, we'll use the default options
      setOptions(timelinePrintService.getDefaultOptions());
    } catch (error) {
      console.error('Error loading print settings:', error);
    }
  };

  const handleOptionChange = (key: keyof TimelinePrintOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
    
    // Handle custom date range visibility
    if (key === 'timeRange') {
      setShowCustomDateRange(value === 'custom');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would save settings to storage
      console.log('Print settings saved:', options);
    } catch (error) {
      console.error('Error saving print settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setError(null);
      setLoading(true);

      const printData: TimelinePrintData = {
        projectId,
        projectName,
        projectIdDisplay,
        printDate: new Date(),
        tasks,
        filters,
        currentView,
        branding: {
          companyName: 'ConstructBMS',
          poweredBy: isDemoMode ? 'DEMO VERSION - NOT FOR DISTRIBUTION' : 'ConstructBMS'
        }
      };

      const result = await timelinePrintService.generatePrintPreview(options, printData);
      
      if (result.success) {
        onPreview(options);
      } else {
        setError(result.error || 'Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setError(null);
      setLoading(true);

      const printData: TimelinePrintData = {
        projectId,
        projectName,
        projectIdDisplay,
        printDate: new Date(),
        tasks,
        filters,
        currentView,
        branding: {
          companyName: 'ConstructBMS',
          poweredBy: isDemoMode ? 'DEMO VERSION - NOT FOR DISTRIBUTION' : 'ConstructBMS'
        }
      };

      const result = await timelinePrintService.openPrintDialog(options, printData);
      
      if (result.success) {
        onPrint(options);
        onClose();
      } else {
        setError(result.error || 'Failed to print');
      }
    } catch (error) {
      console.error('Error printing:', error);
      setError('Failed to print');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !canPrint) {
    return null;
  }

  const demoRestrictions = [
    'Maximum 10 tasks shown',
    'Page size fixed to A4',
    'Branding cannot be disabled',
    'Watermarked with "DEMO VERSION"'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <PrinterIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Print Timeline</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Demo Mode Restrictions</h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  {demoRestrictions.map((restriction, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span>•</span>
                      <span>{restriction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Page Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Page Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <select
                  value={options.orientation}
                  onChange={(e) => handleOptionChange('orientation', e.target.value)}
                  disabled={isDemoMode}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Size
                </label>
                <select
                  value={options.pageSize}
                  onChange={(e) => handleOptionChange('pageSize', e.target.value)}
                  disabled={isDemoMode}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="fit-to-width">Fit to Width</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CogIcon className="w-5 h-5 mr-2" />
              Content Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeProjectHeader}
                  onChange={(e) => handleOptionChange('includeProjectHeader', e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include project header</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeBranding}
                  onChange={(e) => handleOptionChange('includeBranding', e.target.checked)}
                  disabled={isDemoMode}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include branding</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeFilters}
                  onChange={(e) => handleOptionChange('includeFilters', e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include active filters</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeFooter}
                  onChange={(e) => handleOptionChange('includeFooter', e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include footer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includePageNumbers}
                  onChange={(e) => handleOptionChange('includePageNumbers', e.target.checked)}
                  disabled={isDemoMode}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include page numbers</span>
              </label>
            </div>
          </div>

          {/* Time Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Time Range
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="timeRange"
                  value="current-view"
                  checked={options.timeRange === 'current-view'}
                  onChange={(e) => handleOptionChange('timeRange', e.target.value)}
                  className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Current view</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="timeRange"
                  value="custom"
                  checked={options.timeRange === 'custom'}
                  onChange={(e) => handleOptionChange('timeRange', e.target.value)}
                  className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Custom date range</span>
              </label>
              
              {showCustomDateRange && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={options.customDateRange?.start?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleOptionChange('customDateRange', {
                        ...options.customDateRange,
                        start: new Date(e.target.value)
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={options.customDateRange?.end?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleOptionChange('customDateRange', {
                        ...options.customDateRange,
                        end: new Date(e.target.value)
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Page Breaks */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Page Breaks</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pageBreaks"
                  value="auto"
                  checked={options.pageBreaks === 'auto'}
                  onChange={(e) => handleOptionChange('pageBreaks', e.target.value)}
                  className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Automatic</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pageBreaks"
                  value="manual"
                  checked={options.pageBreaks === 'manual'}
                  onChange={(e) => handleOptionChange('pageBreaks', e.target.value)}
                  className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Manual</span>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Print Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Project: {projectName}</div>
              <div>Tasks: {tasks.length} total</div>
              <div>Page Size: {options.pageSize} {options.orientation}</div>
              {isDemoMode && <div className="text-yellow-600 font-medium">Demo Mode: Limited to 10 tasks</div>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50"
            >
              Save Settings
            </button>
            <button
              onClick={handlePreview}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 flex items-center"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 flex items-center"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePrintOptionsModal; 