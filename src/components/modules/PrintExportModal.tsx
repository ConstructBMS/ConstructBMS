import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PrinterIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';
import { timelinePrintService, TimelinePrintOptions, TimelinePrintData } from '../../services/timelinePrintService';
import { timelineExportService, TimelineExportOptions } from '../../services/timelineExportService';

interface PrintExportModalProps {
  currentView: any;
  filters: any;
  isMultiProjectMode?: boolean;
  isOpen: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onExportPDF: (options: TimelineExportOptions) => void;
  onPreview: (options: TimelinePrintOptions) => void;
  onPrint: (options: TimelinePrintOptions) => void;
  projectId: string;
  projectIdDisplay: string;
  projectName: string;
  selectedProjects?: any[];
  tasks: any[];
}

const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectIdDisplay,
  tasks,
  filters,
  currentView,
  isMultiProjectMode = false,
  selectedProjects = [],
  onPrint,
  onExportPDF,
  onPreview,
  isProcessing = false
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'print' | 'pdf'>('print');
  const [printOptions, setPrintOptions] = useState<TimelinePrintOptions>(timelinePrintService.getDefaultOptions());
  const [exportOptions, setExportOptions] = useState<TimelineExportOptions>(timelineExportService.getDefaultExportOptions());
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canPrint = canAccess('programme.print');
  const canExportPDF = canAccess('programme.export.pdf');

  // Check demo mode and load settings on mount
  useEffect(() => {
    const loadData = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      
      // Apply demo mode restrictions
      if (isDemo) {
        setPrintOptions(prev => ({ ...prev, demo: true }));
        setExportOptions(prev => ({ ...prev, pageSize: 'A4' }));
      }
    };
    
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handlePrintOptionChange = (key: keyof TimelinePrintOptions, value: any) => {
    setPrintOptions(prev => ({ ...prev, [key]: value }));
    
    // Handle custom date range visibility
    if (key === 'timeRange') {
      setShowCustomDateRange(value === 'custom');
    }
  };

  const handleExportOptionChange = (key: keyof TimelineExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handlePrint = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const printData: TimelinePrintData = {
        projectId,
        projectName,
        projectIdDisplay,
        printDate: new Date(),
        tasks,
        filters,
        currentView,
        branding: {
          logo: undefined, // Will be auto-pulled from user settings
          companyName: 'ConstructBMS',
          poweredBy: 'Powered by ConstructBMS'
        }
      };

      onPrint(printOptions);
      setSuccess('Print dialog opened successfully');
    } catch (error) {
      console.error('Print error:', error);
      setError('Failed to open print dialog');
    }
  };

  const handleExportPDF = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      onExportPDF(exportOptions);
      setSuccess('PDF export started');
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to start PDF export');
    }
  };

  const handlePreview = async () => {
    try {
      setError(null);
      
      const printData: TimelinePrintData = {
        projectId,
        projectName,
        projectIdDisplay,
        printDate: new Date(),
        tasks,
        filters,
        currentView,
        branding: {
          logo: undefined,
          companyName: 'ConstructBMS',
          poweredBy: 'Powered by ConstructBMS'
        }
      };

      onPreview(printOptions);
    } catch (error) {
      console.error('Preview error:', error);
      setError('Failed to generate preview');
    }
  };

  const getDemoRestrictions = () => {
    if (!isDemoMode) return null;
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Demo Mode Restrictions</h4>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Maximum 10 tasks can be exported</li>
              <li>• Page size locked to A4</li>
              <li>• Demo watermark will be added</li>
              <li>• Some advanced features are disabled</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PrinterIcon className="w-6 h-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Print & PDF Export
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {getDemoRestrictions()}

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <CheckIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('print')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'print'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <PrinterIcon className="w-4 h-4 inline mr-2" />
                  Print View
                </button>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pdf'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <DocumentArrowDownIcon className="w-4 h-4 inline mr-2" />
                  Export to PDF
                </button>
              </nav>
            </div>

            {/* Print Tab */}
            {activeTab === 'print' && (
              <div className="space-y-6">
                {/* Layout Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Layout Options</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orientation
                      </label>
                      <select
                        value={printOptions.orientation}
                        onChange={(e) => handlePrintOptionChange('orientation', e.target.value)}
                        disabled={!canPrint || isProcessing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        value={printOptions.pageSize}
                        onChange={(e) => handlePrintOptionChange('pageSize', e.target.value)}
                        disabled={!canPrint || isProcessing || isDemoMode}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="A3">A3</option>
                        <option value="A4">A4</option>
                        <option value="fit-to-width">Fit to Width</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Date Range</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="current-view"
                          checked={printOptions.timeRange === 'current-view'}
                          onChange={(e) => handlePrintOptionChange('timeRange', e.target.value)}
                          disabled={!canPrint || isProcessing}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Current View</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="custom"
                          checked={printOptions.timeRange === 'custom'}
                          onChange={(e) => handlePrintOptionChange('timeRange', e.target.value)}
                          disabled={!canPrint || isProcessing}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Custom Range</span>
                      </label>
                    </div>
                    
                    {showCustomDateRange && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={printOptions.customDateRange?.start?.toISOString().split('T')[0] || ''}
                            onChange={(e) => handlePrintOptionChange('customDateRange', {
                              ...printOptions.customDateRange,
                              start: new Date(e.target.value)
                            })}
                            disabled={!canPrint || isProcessing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={printOptions.customDateRange?.end?.toISOString().split('T')[0] || ''}
                            onChange={(e) => handlePrintOptionChange('customDateRange', {
                              ...printOptions.customDateRange,
                              end: new Date(e.target.value)
                            })}
                            disabled={!canPrint || isProcessing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Content Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printOptions.includeProjectHeader}
                        onChange={(e) => handlePrintOptionChange('includeProjectHeader', e.target.checked)}
                        disabled={!canPrint || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Project Header</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printOptions.includeFilters}
                        onChange={(e) => handlePrintOptionChange('includeFilters', e.target.checked)}
                        disabled={!canPrint || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Grid Table</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printOptions.includeBranding}
                        onChange={(e) => handlePrintOptionChange('includeBranding', e.target.checked)}
                        disabled={!canPrint || isProcessing || isDemoMode}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Company Logo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printOptions.includeFooter}
                        onChange={(e) => handlePrintOptionChange('includeFooter', e.target.checked)}
                        disabled={!canPrint || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Header/Footer</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printOptions.includePageNumbers}
                        onChange={(e) => handlePrintOptionChange('includePageNumbers', e.target.checked)}
                        disabled={!canPrint || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Page Numbers</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Export Tab */}
            {activeTab === 'pdf' && (
              <div className="space-y-6">
                {/* Export Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Export Options</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orientation
                      </label>
                      <select
                        value={exportOptions.orientation}
                        onChange={(e) => handleExportOptionChange('orientation', e.target.value)}
                        disabled={!canExportPDF || isProcessing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        value={exportOptions.pageSize}
                        onChange={(e) => handleExportOptionChange('pageSize', e.target.value)}
                        disabled={!canExportPDF || isProcessing || isDemoMode}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="A3">A3</option>
                        <option value="A4">A4</option>
                        <option value="A5">A5</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Content Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeLogo}
                        onChange={(e) => handleExportOptionChange('includeLogo', e.target.checked)}
                        disabled={!canExportPDF || isProcessing || isDemoMode}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Company Logo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.showFiltersAndDate}
                        onChange={(e) => handleExportOptionChange('showFiltersAndDate', e.target.checked)}
                        disabled={!canExportPDF || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Grid Table</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeBaseline}
                        onChange={(e) => handleExportOptionChange('includeBaseline', e.target.checked)}
                        disabled={!canExportPDF || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Baseline</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeCriticalPath}
                        onChange={(e) => handleExportOptionChange('includeCriticalPath', e.target.checked)}
                        disabled={!canExportPDF || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Critical Path</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMilestones}
                        onChange={(e) => handleExportOptionChange('includeMilestones', e.target.checked)}
                        disabled={!canExportPDF || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Milestones</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeDependencies}
                        onChange={(e) => handleExportOptionChange('includeDependencies', e.target.checked)}
                        disabled={!canExportPDF || isProcessing}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Include Dependencies</span>
                    </label>
                  </div>
                </div>

                {/* Zoom Level */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Zoom Level</h4>
                  <select
                    value={exportOptions.zoomLevel}
                    onChange={(e) => handleExportOptionChange('zoomLevel', e.target.value)}
                    disabled={!canExportPDF || isProcessing}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="quarters">Quarters</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="flex space-x-3">
              {activeTab === 'print' && (
                <button
                  onClick={handlePreview}
                  disabled={!canPrint || isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              {activeTab === 'print' ? (
                <button
                  onClick={handlePrint}
                  disabled={!canPrint || isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Printing...' : 'Print'}
                </button>
              ) : (
                <button
                  onClick={handleExportPDF}
                  disabled={!canExportPDF || isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Exporting...' : 'Export PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintExportModal; 