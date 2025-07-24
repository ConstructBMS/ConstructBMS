import React, { useState } from 'react';
import { PrinterIcon, DocumentArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline';
import PrintExportModal from './PrintExportModal';
import { timelinePrintService, TimelinePrintOptions, TimelinePrintData } from '../services/timelinePrintService';
import { timelineExportService, TimelineExportOptions } from '../services/timelineExportService';

const PrintExportTest: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');

  const sampleTasks = [
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
    }
  ];

  const handlePrint = async (options: TimelinePrintOptions) => {
    try {
      setIsProcessing(true);
      setResult('');

      const printData: TimelinePrintData = {
        projectId: 'test-project',
        projectName: 'Test Construction Project',
        projectIdDisplay: 'TCP-2024-001',
        printDate: new Date(),
        tasks: sampleTasks,
        filters: {},
        currentView: {},
        branding: {
          logo: undefined,
          companyName: 'ConstructBMS',
          poweredBy: 'Powered by ConstructBMS'
        }
      };

      const result = await timelinePrintService.openPrintDialog(options, printData);
      
      if (result.success) {
        setResult('✅ Print dialog opened successfully');
      } else {
        setResult(`❌ Print failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Print error:', error);
      setResult(`❌ Print error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async (options: TimelineExportOptions) => {
    try {
      setIsProcessing(true);
      setResult('');

      // Create a mock Gantt element for testing
      const mockElement = document.createElement('div');
      mockElement.className = 'gantt-container';
      mockElement.innerHTML = `
        <div class="gantt-header">
          <h2>Test Construction Project</h2>
          <p>Project ID: TCP-2024-001</p>
        </div>
        <div class="gantt-timeline">
          <div class="gantt-task" style="background: #3b82f6; padding: 10px; margin: 5px; border-radius: 4px;">
            Foundation Work
          </div>
          <div class="gantt-task" style="background: #10b981; padding: 10px; margin: 5px; border-radius: 4px;">
            Structural Work
          </div>
          <div class="gantt-task" style="background: #f59e0b; padding: 10px; margin: 5px; border-radius: 4px;">
            Electrical Work
          </div>
        </div>
      `;
      document.body.appendChild(mockElement);

      const exportData = await timelineExportService.getTimelineExportData('test-project', options);
      const result = await timelineExportService.exportAsPDF(mockElement, options, exportData);

      if (result.success) {
        setResult('✅ PDF exported successfully');
      } else {
        setResult(`❌ PDF export failed: ${result.error}`);
      }

      // Clean up mock element
      document.body.removeChild(mockElement);
    } catch (error) {
      console.error('PDF export error:', error);
      setResult(`❌ PDF export error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async (options: TimelinePrintOptions) => {
    try {
      setResult('');

      const printData: TimelinePrintData = {
        projectId: 'test-project',
        projectName: 'Test Construction Project',
        projectIdDisplay: 'TCP-2024-001',
        printDate: new Date(),
        tasks: sampleTasks,
        filters: {},
        currentView: {},
        branding: {
          logo: undefined,
          companyName: 'ConstructBMS',
          poweredBy: 'Powered by ConstructBMS'
        }
      };

      const result = await timelinePrintService.generatePrintPreview(options, printData);
      
      if (result.success) {
        setResult('✅ Preview generated successfully');
        // In a real implementation, you would show the preview in a modal
        console.log('Preview HTML:', result.previewHtml);
      } else {
        setResult(`❌ Preview failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Preview error:', error);
      setResult(`❌ Preview error: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Print & PDF Export Test
        </h1>
        <p className="text-gray-600">
          Test the Print & PDF Export functionality with sample data.
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowModal(true)}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Open Print & Export Modal'}
          </button>
        </div>

        {/* Test Results */}
        {result && (
          <div className={`p-4 rounded-lg ${
            result.startsWith('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-sm">{result}</p>
          </div>
        )}
      </div>

      {/* Sample Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Data</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Project Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Project Name:</span> Test Construction Project
              </div>
              <div>
                <span className="font-medium">Project ID:</span> TCP-2024-001
              </div>
              <div>
                <span className="font-medium">Total Tasks:</span> {sampleTasks.length}
              </div>
              <div>
                <span className="font-medium">Date Range:</span> Jan 15, 2024 - May 1, 2024
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Tasks</h3>
            <div className="space-y-2">
              {sampleTasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{task.name}</span>
                    <div className="text-sm text-gray-600">
                      {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize">{task.status}</div>
                    <div className="text-sm text-gray-600">{task.progress}% complete</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print & Export Modal */}
      <PrintExportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId="test-project"
        projectName="Test Construction Project"
        projectIdDisplay="TCP-2024-001"
        tasks={sampleTasks}
        filters={{}}
        currentView={{}}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onPreview={handlePreview}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default PrintExportTest; 