import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PrinterIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';
import { timelinePrintService, TimelinePrintOptions, TimelinePrintData } from '../../services/timelinePrintService';

interface TimelinePrintPreviewModalProps {
  currentView: any;
  filters: any;
  isDemoMode: boolean;
  isOpen: boolean;
  onBack: () => void;
  onClose: () => void;
  onPrint: (options: TimelinePrintOptions) => void;
  options: TimelinePrintOptions;
  projectId: string;
  projectIdDisplay: string;
  tasks: any[];
  projectName: string;
}

const TimelinePrintPreviewModal: React.FC<TimelinePrintPreviewModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  onBack,
  options,
  projectId,
  projectName,
  projectIdDisplay,
  tasks,
  filters,
  currentView,
  isDemoMode
}) => {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [printMetadata, setPrintMetadata] = useState<any>(null);

  // Generate preview when modal opens
  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [isOpen, options, tasks, filters]);

  const generatePreview = async () => {
    try {
      setLoading(true);
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
          companyName: 'ConstructBMS',
          poweredBy: isDemoMode ? 'DEMO VERSION - NOT FOR DISTRIBUTION' : 'ConstructBMS'
        }
      };

      const result = await timelinePrintService.generatePrintPreview(options, printData);
      
      if (result.success) {
        setPreviewHtml(result.previewHtml!);
        setPrintMetadata(result.printMetadata);
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

  const handlePrint = () => {
    onPrint(options);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Print Preview</h2>
              <p className="text-sm text-gray-500">
                {projectName} • {printMetadata?.totalTasks || tasks.length} tasks
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                title="Zoom Out"
              >
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                title="Zoom In"
              >
                <MagnifyingGlassPlusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors text-xs"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Print Metadata */}
        {printMetadata && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Page Size: {options.pageSize} {options.orientation}</span>
                <span>Tasks: {printMetadata.totalTasks}</span>
                <span>Date Range: {printMetadata.dateRange}</span>
                {isDemoMode && (
                  <span className="text-yellow-600 font-medium">Demo Mode</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {options.includeBranding && <span>✓ Branding</span>}
                {options.includeFilters && <span>✓ Filters</span>}
                {options.includeFooter && <span>✓ Footer</span>}
              </div>
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating print preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <XMarkIcon className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={generatePreview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto bg-gray-100 p-4">
              <div 
                className="bg-white mx-auto shadow-lg"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="timeline-print-preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDemoMode && (
              <span className="text-yellow-600 font-medium mr-4">
                ⚠️ Demo Mode: Limited functionality
              </span>
            )}
            <span>Preview generated at {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              Back to Options
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 flex items-center"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePrintPreviewModal; 