import React, { useState, useEffect } from 'react';
import { 
  PrinterIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import PrintExportModal from './PrintExportModal';
import TimelinePrintPreviewModal from './TimelinePrintPreviewModal';
import { timelinePrintService, TimelinePrintOptions, TimelinePrintData } from '../../services/timelinePrintService';
import { timelineExportService, TimelineExportOptions } from '../../services/timelineExportService';
import { demoModeService } from '../../services/demoModeService';
import { usePermissions } from '../../hooks/usePermissions';

interface PrintExportDemoProps {
  currentView?: any;
  filters?: any;
  isMultiProjectMode?: boolean;
  projectId?: string;
  projectIdDisplay?: string;
  projectName?: string;
  selectedProjects?: any[];
  tasks?: any[];
}

const PrintExportDemo: React.FC<PrintExportDemoProps> = ({
  projectId = 'demo-project-001',
  projectName = 'Construction Project Alpha',
  projectIdDisplay = 'CPA-2024-001',
  tasks = [],
  filters = {},
  currentView = {},
  isMultiProjectMode = false,
  selectedProjects = []
}) => {
  const { canAccess } = usePermissions();
  const [showPrintExportModal, setShowPrintExportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const canPrint = canAccess('programme.print');
  const canExportPDF = canAccess('programme.export.pdf');

  // Load demo data and check demo mode
  useEffect(() => {
    const loadDemoData = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      
      // Load sample tasks if none provided
      if (tasks.length === 0) {
        const { demoDataService } = await import('../../services/demoDataService');
        const demoTasks = await demoDataService.getSampleTasks();
        // Update tasks state if needed
      }
    };
    
    loadDemoData();
  }, [tasks.length]);

  const handlePrint = async (options: TimelinePrintOptions) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      const printData: TimelinePrintData = {
        projectId,
        projectName,
        projectIdDisplay,
        printDate: new Date(),
        tasks: tasks.length > 0 ? tasks : getSampleTasks(),
        filters,
        currentView,
        branding: {
          logo: undefined, // Will be auto-pulled from user settings
          companyName: 'ConstructBMS',
          poweredBy: 'Powered by ConstructBMS'
        }
      };

      const result = await timelinePrintService.openPrintDialog(options, printData);
      
      if (result.success) {
        setSuccess('Print dialog opened successfully');
        setShowPrintExportModal(false);
      } else {
        setError(result.error || 'Failed to open print dialog');
      }
    } catch (error) {
      console.error('Print error:', error);
      setError('Failed to open print dialog');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async (options: TimelineExportOptions) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      // Get the Gantt element (in a real implementation, this would be the actual Gantt chart element)
      const ganttElement = document.querySelector('.gantt-container') as HTMLElement;
      
      if (!ganttElement) {
        // Create a mock element for demo purposes
        const mockElement = document.createElement('div');
        mockElement.className = 'gantt-container';
        mockElement.innerHTML = `
          <div class="gantt-header">
            <h2>${projectName}</h2>
            <p>Project ID: ${projectIdDisplay}</p>
          </div>
          <div class="gantt-timeline">
            <div class="gantt-task" style="background: #3b82f6; padding: 10px; margin: 5px; border-radius: 4px;">
              Sample Task 1 - Foundation Work
            </div>
            <div class="gantt-task" style="background: #10b981; padding: 10px; margin: 5px; border-radius: 4px;">
              Sample Task 2 - Structural Work
            </div>
            <div class="gantt-task" style="background: #f59e0b; padding: 10px; margin: 5px; border-radius: 4px;">
              Sample Task 3 - Electrical Work
            </div>
          </div>
        `;
        document.body.appendChild(mockElement);
      }

      const exportData = await timelineExportService.getTimelineExportData(projectId, options);
      const result = await timelineExportService.exportAsPDF(
        ganttElement || document.querySelector('.gantt-container') as HTMLElement,
        options,
        exportData
      );

      if (result.success) {
        setSuccess('PDF exported successfully');
        setShowPrintExportModal(false);
      } else {
        setError(result.error || 'Failed to export PDF');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to export PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async (options: TimelinePrintOptions) => {
    try {
      setError(null);

      const printData: TimelinePrintData = {
        projectId,
        projectName,
        projectIdDisplay,
        printDate: new Date(),
        tasks: tasks.length > 0 ? tasks : getSampleTasks(),
        filters,
        currentView,
        branding: {
          logo: undefined,
          companyName: 'ConstructBMS',
          poweredBy: 'Powered by ConstructBMS'
        }
      };

      const result = await timelinePrintService.generatePrintPreview(options, printData);
      
      if (result.success && result.previewHtml) {
        setPreviewHtml(result.previewHtml);
        setShowPreviewModal(true);
      } else {
        setError(result.error || 'Failed to generate preview');
      }
    } catch (error) {
      console.error('Preview error:', error);
      setError('Failed to generate preview');
    }
  };

  const getSampleTasks = () => {
    return [
      {
        id: 'task-1',
        name: 'Foundation Work',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        status: 'in-progress',
        progress: 75,
        type: 'construction',
        tags: ['foundation', 'critical']
      },
      {
        id: 'task-2',
        name: 'Structural Work',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        status: 'planned',
        progress: 0,
        type: 'construction',
        tags: ['structural', 'critical']
      },
      {
        id: 'task-3',
        name: 'Electrical Work',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-01'),
        status: 'planned',
        progress: 0,
        type: 'mep',
        tags: ['electrical']
      },
      {
        id: 'task-4',
        name: 'Plumbing Work',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-05-15'),
        status: 'planned',
        progress: 0,
        type: 'mep',
        tags: ['plumbing']
      },
      {
        id: 'task-5',
        name: 'Interior Finishing',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-06-01'),
        status: 'planned',
        progress: 0,
        type: 'finishing',
        tags: ['interior', 'finishing']
      }
    ];
  };

  const getDemoRestrictions = () => {
    if (!isDemoMode) return null;
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Demo Mode Active</h4>
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Print & PDF Export Demo
        </h1>
        <p className="text-gray-600">
          High-quality print and PDF export of Gantt charts with customisation controls for layout, content, and branding.
        </p>
      </div>

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
            <InformationCircleIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Demo Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Print & Export Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Print Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PrinterIcon className="w-5 h-5 mr-2 text-blue-600" />
              Print View
            </h3>
            <p className="text-sm text-gray-600">
              Print-friendly rendering of the current Gantt view with customisable layout and content options.
            </p>
            <button
              onClick={() => setShowPrintExportModal(true)}
              disabled={!canPrint || isProcessing}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Open Print & Export Modal'}
            </button>
          </div>

          {/* PDF Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentArrowDownIcon className="w-5 h-5 mr-2 text-green-600" />
              Export to PDF
            </h3>
            <p className="text-sm text-gray-600">
              High-quality PDF export with customisation options for layout, content, and branding.
            </p>
            <button
              onClick={() => setShowPrintExportModal(true)}
              disabled={!canExportPDF || isProcessing}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Open Print & Export Modal'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Layout Options</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Portrait / Landscape orientation</li>
              <li>• A3 / A4 / Letter page sizes</li>
              <li>• Custom date range selection</li>
              <li>• Auto page breaks</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Content Options</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Include grid table</li>
              <li>• Header / footer</li>
              <li>• Company logo (auto-inserted)</li>
              <li>• Page numbers</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Demo Mode</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Demo watermark</li>
              <li>• Max 10 rows exported</li>
              <li>• Page size locked to A4</li>
              <li>• Restricted features</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Gantt Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Gantt Chart</h2>
        <div className="gantt-container bg-gray-50 rounded-lg p-4">
          <div className="gantt-header mb-4">
            <h3 className="text-lg font-medium text-gray-900">{projectName}</h3>
            <p className="text-sm text-gray-600">Project ID: {projectIdDisplay}</p>
          </div>
          <div className="gantt-timeline space-y-2">
            {getSampleTasks().map((task, index) => (
              <div
                key={task.id}
                className="gantt-task p-3 rounded border-l-4"
                style={{
                  borderLeftColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b',
                  backgroundColor: index === 0 ? '#dbeafe' : index === 1 ? '#d1fae5' : '#fef3c7'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{task.name}</span>
                  <span className="text-sm text-gray-600">
                    {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress: {task.progress}%</span>
                    <span className="capitalize">{task.status}</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print & Export Modal */}
      <PrintExportModal
        isOpen={showPrintExportModal}
        onClose={() => setShowPrintExportModal(false)}
        projectId={projectId}
        projectName={projectName}
        projectIdDisplay={projectIdDisplay}
        tasks={tasks.length > 0 ? tasks : getSampleTasks()}
        filters={filters}
        currentView={currentView}
        isMultiProjectMode={isMultiProjectMode}
        selectedProjects={selectedProjects}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onPreview={handlePreview}
        isProcessing={isProcessing}
      />

      {/* Print Preview Modal */}
      <TimelinePrintPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        previewHtml={previewHtml}
        projectName={projectName}
      />
    </div>
  );
};

export default PrintExportDemo; 