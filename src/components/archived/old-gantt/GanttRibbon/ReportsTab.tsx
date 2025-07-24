import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PrinterIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CogIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProjectView } from '../../../contexts/ProjectViewContext';

export const ReportsTab: React.FC = () => {
  const { canAccess } = usePermissions();
  const { tasks, selectedTasks } = useProjectView();
  
  // Modal and state management
  const [modal, setModal] = useState('');
  const [exportType, setExportType] = useState('');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const can = (key: string) => canAccess(`gantt.reports.${key}`);

  // Sample report templates
  const reportTemplates = [
    { 
      id: 'executive-summary', 
      name: 'Executive Summary', 
      description: 'High-level project overview for stakeholders',
      icon: DocumentChartBarIcon,
      category: 'Management'
    },
    { 
      id: 'task-detail', 
      name: 'Task Detail Report', 
      description: 'Comprehensive task information with dependencies',
      icon: TableCellsIcon,
      category: 'Operations'
    },
    { 
      id: 'resource-allocation', 
      name: 'Resource Allocation', 
      description: 'Resource usage and availability analysis',
      icon: UserGroupIcon,
      category: 'Resources'
    },
    { 
      id: 'progress-tracking', 
      name: 'Progress Tracking', 
      description: 'Project progress and milestone status',
      icon: ChartBarIcon,
      category: 'Progress'
    },
    { 
      id: 'cost-analysis', 
      name: 'Cost Analysis', 
      description: 'Budget tracking and cost breakdown',
      icon: CurrencyDollarIcon,
      category: 'Finance'
    },
    { 
      id: 'schedule-overview', 
      name: 'Schedule Overview', 
      description: 'Timeline and critical path analysis',
      icon: CalendarIcon,
      category: 'Schedule'
    }
  ];

  const exportOptions = {
    csv: {
      name: 'CSV Export',
      description: 'Export task data as comma-separated values',
      icon: TableCellsIcon,
      extensions: ['.csv'],
      features: ['Task list', 'Dependencies', 'Resources', 'Dates']
    },
    pdf: {
      name: 'PDF Export',
      description: 'Export as professional PDF report',
      icon: DocumentTextIcon,
      extensions: ['.pdf'],
      features: ['Gantt chart', 'Task details', 'Charts', 'Branding']
    },
    excel: {
      name: 'Excel Export',
      description: 'Export to Microsoft Excel format',
      icon: DocumentChartBarIcon,
      extensions: ['.xlsx'],
      features: ['Multiple sheets', 'Formulas', 'Charts', 'Pivot tables']
    }
  };

  const printOptions = [
    { id: 'current-view', name: 'Current View', description: 'Print visible Gantt chart area' },
    { id: 'all-tasks', name: 'All Tasks', description: 'Print complete project timeline' },
    { id: 'selected-tasks', name: 'Selected Tasks', description: 'Print only selected tasks' },
    { id: 'date-range', name: 'Date Range', description: 'Print specific date range' }
  ];

  // Event handlers
  const openModal = (id: string) => setModal(id);
  
  const handlePrintPreview = () => {
    openModal('printPreview');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (type: string) => {
    setIsExporting(true);
    setExportType(type);
    setExportProgress(0);
    
    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setExportProgress(i);
    }
    
    setIsExporting(false);
    setModal('');
    
    // In real implementation, trigger actual export
    console.log(`Exporting as ${type}...`);
  };

  const generateSampleData = () => {
    return {
      projectName: 'Sample Construction Project',
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter(t => t.progress === 100).length || 0,
      totalDuration: '180 days',
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      budget: '$2,500,000',
      resources: 12
    };
  };

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Export Group */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {can('exportCsv') && (
              <button
                onClick={() => openModal('exportCsv')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors"
                title="Export as CSV"
              >
                <TableCellsIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">CSV</span>
              </button>
            )}
            {can('exportPdf') && (
              <button
                onClick={() => openModal('exportPdf')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors"
                title="Export as PDF"
              >
                <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">PDF</span>
              </button>
            )}
            {can('exportExcel') && (
              <button
                onClick={() => openModal('exportExcel')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors"
                title="Export as Excel"
              >
                <DocumentChartBarIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Excel</span>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-600 font-medium">Export</div>
        </div>

        {/* Print Group */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {can('printPreview') && (
              <button
                onClick={handlePrintPreview}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Print Preview"
              >
                <EyeIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Preview</span>
              </button>
            )}
            {can('print') && (
              <button
                onClick={handlePrint}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Print"
              >
                <PrinterIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Print</span>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-600 font-medium">Print</div>
        </div>

        {/* Templates Group */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {can('reportTemplates') && (
              <button
                onClick={() => openModal('reportTemplates')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
                title="Manage Report Templates"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Templates</span>
              </button>
            )}
            {can('customReport') && (
              <button
                onClick={() => openModal('customReport')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-yellow-50 rounded transition-colors"
                title="Custom Report Builder"
              >
                <CogIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Custom</span>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-600 font-medium">Templates</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Tasks: {tasks?.length || 0}
          </div>
          <div className="text-xs text-gray-500">
            Selected: {selectedTasks?.length || 0}
          </div>
          <div className="text-xs text-gray-500">
            {isExporting && `Exporting ${exportType}... ${exportProgress}%`}
          </div>
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              <button
                onClick={() => setModal('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Export Modals */}
            {(modal === 'exportCsv' || modal === 'exportPdf' || modal === 'exportExcel') && (
              <div className="space-y-4">
                {(() => {
                  const type = modal.replace('export', '').toLowerCase();
                  const options = exportOptions[type as keyof typeof exportOptions];
                  
                  return (
                    <>
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                        <options.icon className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-blue-900">{options.name}</h3>
                          <p className="text-sm text-blue-700">{options.description}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Export Options</label>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked />
                            <span className="text-sm">Include task details</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked />
                            <span className="text-sm">Include dependencies</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Include resource assignments</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Include progress information</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Include cost data</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2">
                          <option value="all">All Tasks</option>
                          <option value="selected">Selected Tasks Only</option>
                          <option value="visible">Visible Tasks Only</option>
                          <option value="filtered">Filtered Tasks Only</option>
                        </select>
                      </div>

                      {isExporting && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Exporting {type.toUpperCase()}...</span>
                            <span>{exportProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${exportProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleExport(type)}
                          disabled={isExporting}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isExporting ? 'Exporting...' : `Export ${type.toUpperCase()}`}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Print Preview Modal */}
            {modal === 'printPreview' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <EyeIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Print Preview</h3>
                    <p className="text-sm text-blue-700">Preview how your Gantt chart will look when printed</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Print Options</label>
                  <div className="space-y-2">
                    {printOptions.map((option) => (
                      <label key={option.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                        <input type="radio" name="printOption" value={option.id} className="mr-3" defaultChecked={option.id === 'current-view'} />
                        <div>
                          <div className="font-medium text-sm">{option.name}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Settings</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Orientation</label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option>Landscape</option>
                        <option>Portrait</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Paper Size</label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option>A4</option>
                        <option>Letter</option>
                        <option>Legal</option>
                        <option>A3</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Print
                  </button>
                </div>
              </div>
            )}

            {/* Report Templates Modal */}
            {modal === 'reportTemplates' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <DocumentDuplicateIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">Report Templates</h3>
                    <p className="text-sm text-purple-700">Choose from predefined report templates or create custom ones</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {reportTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <template.icon className="h-6 w-6 text-gray-600" />
                        <div>
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                          <div className="text-xs text-purple-600 font-medium">{template.category}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                          Use
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                    Create New Template
                  </button>
                </div>
              </div>
            )}

            {/* Custom Report Modal */}
            {modal === 'customReport' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <CogIcon className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Custom Report Builder</h3>
                    <p className="text-sm text-yellow-700">Create a custom report with specific fields and formatting</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter report name..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2">
                    <option>Task Summary</option>
                    <option>Resource Allocation</option>
                    <option>Progress Report</option>
                    <option>Cost Analysis</option>
                    <option>Schedule Overview</option>
                    <option>Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Include Sections</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Project Overview</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Task List</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Gantt Chart</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Resource Summary</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Cost Breakdown</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Risk Assessment</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <div className="flex space-x-3">
                    <label className="flex items-center">
                      <input type="radio" name="outputFormat" value="pdf" className="mr-2" defaultChecked />
                      <span className="text-sm">PDF</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="outputFormat" value="excel" className="mr-2" />
                      <span className="text-sm">Excel</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="outputFormat" value="html" className="mr-2" />
                      <span className="text-sm">HTML</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                    Generate Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 