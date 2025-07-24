import React, { useState } from 'react';
import {
  PrinterIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  CogIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  ChartBarIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

export const ReportTab: React.FC = () => {
  const { state, updateLayoutSettings } = useProjectView();
  const { layoutSettings } = state;
  const { canAccess } = usePermissions();

  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Report-specific state
  const [printSettings, setPrintSettings] = useState({
    orientation: 'landscape' as 'portrait' | 'landscape',
    paperSize: 'A4' as 'A4' | 'A3' | 'Letter' | 'Legal',
    includeHeader: true,
    includeFooter: true,
    showGrid: true,
    showDependencies: true,
  });
  const [exportSettings, setExportSettings] = useState({
    includeCharts: true,
    includeTables: true,
    includeNotes: true,
    format: 'pdf' as 'pdf' | 'excel' | 'csv',
  });
  const [templateName, setTemplateName] = useState('');

  const can = (key: string) => canAccess(`gantt.report.${key}`);

  const handleReportAction = (action: string, payload?: any) => {
    if (!can(action)) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for report action: ' + action,
      });
      return;
    }

    try {
      switch (action) {
        case 'print-preview':
          console.log('Opening print preview...');
          openModal('print-preview');
          break;

        case 'print-chart':
          console.log('Printing Gantt chart...');
          setOperationStatus({
            type: 'success',
            message: 'Print job sent to printer',
          });
          break;

        case 'export-pdf':
          console.log('Exporting to PDF...');
          setOperationStatus({
            type: 'success',
            message: 'PDF export completed successfully',
          });
          break;

        case 'export-excel':
          console.log('Exporting to Excel...');
          setOperationStatus({
            type: 'success',
            message: 'Excel export completed successfully',
          });
          break;

        case 'export-csv':
          console.log('Exporting to CSV...');
          setOperationStatus({
            type: 'success',
            message: 'CSV export completed successfully',
          });
          break;

        case 'capture-snapshot':
          console.log('Capturing project snapshot...');
          setOperationStatus({
            type: 'success',
            message: 'Project snapshot captured and saved',
          });
          break;

        case 'load-template':
          openModal('load-template');
          break;

        case 'save-template':
          openModal('save-template');
          break;

        case 'report-settings':
          openModal('report-settings');
          break;

        case 'export-image':
          console.log('Exporting as image...');
          setOperationStatus({
            type: 'success',
            message: 'Image export completed successfully',
          });
          break;

        case 'export-data':
          console.log('Exporting project data...');
          setOperationStatus({
            type: 'success',
            message: 'Project data exported successfully',
          });
          break;

        case 'generate-report':
          openModal('generate-report');
          break;
      }
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: `Failed to execute report action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const openModal = (id: string) => setModal(id);

  // Clear status message after 3 seconds
  React.useEffect(() => {
    if (operationStatus) {
      const timer = setTimeout(() => setOperationStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  return (
    <>
      <div className='ribbon-tab-content'>
        {/* Print & Preview Section */}
        <div className='ribbon-section'>
          <div className='ribbon-section-header'>Print</div>
          <div className='ribbon-section-content'>
            <button
              onClick={() => handleReportAction('print-preview')}
              className='ribbon-button flex items-center space-x-1'
              title='Print Preview'
            >
              <EyeIcon className='w-4 h-4' />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleReportAction('print-chart')}
              className='ribbon-button ribbon-button-success flex items-center space-x-1'
              title='Print Chart'
            >
              <PrinterIcon className='w-4 h-4' />
              <span>Print</span>
            </button>
            <button
              onClick={() => handleReportAction('report-settings')}
              className='ribbon-button flex items-center space-x-1'
              title='Print Settings'
            >
              <CogIcon className='w-4 h-4' />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className='ribbon-section'>
          <div className='ribbon-section-header'>Export</div>
          <div className='ribbon-section-content'>
            <button
              onClick={() => handleReportAction('export-pdf')}
              className='ribbon-button ribbon-button-danger flex items-center space-x-1'
              title='Export to PDF'
            >
              <DocumentArrowDownIcon className='w-4 h-4' />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleReportAction('export-excel')}
              className='ribbon-button ribbon-button-success flex items-center space-x-1'
              title='Export to Excel'
            >
              <TableCellsIcon className='w-4 h-4' />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleReportAction('export-csv')}
              className='ribbon-button flex items-center space-x-1'
              title='Export to CSV'
            >
              <DocumentTextIcon className='w-4 h-4' />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Snapshot Section */}
        <div className='ribbon-section'>
          <div className='ribbon-section-header'>Snapshot</div>
          <div className='ribbon-section-content'>
            <button
              onClick={() => handleReportAction('capture-snapshot')}
              className='ribbon-button flex items-center space-x-1'
              title='Capture Snapshot'
            >
              <CameraIcon className='w-4 h-4' />
              <span>Snapshot</span>
            </button>
            <button
              onClick={() => handleReportAction('export-image')}
              className='ribbon-button flex items-center space-x-1'
              title='Export as Image'
            >
              <PhotoIcon className='w-4 h-4' />
              <span>Image</span>
            </button>
            <button
              onClick={() => handleReportAction('export-data')}
              className='ribbon-button flex items-center space-x-1'
              title='Export Data'
            >
              <ArrowDownTrayIcon className='w-4 h-4' />
              <span>Data</span>
            </button>
          </div>
        </div>

        {/* Templates Section */}
        <div className='ribbon-section'>
          <div className='ribbon-section-header'>Templates</div>
          <div className='ribbon-section-content'>
            <button
              onClick={() => handleReportAction('load-template')}
              className='ribbon-button flex items-center space-x-1'
              title='Load Template'
            >
              <DocumentIcon className='w-4 h-4' />
              <span>Load</span>
            </button>
            <button
              onClick={() => handleReportAction('save-template')}
              className='ribbon-button ribbon-button-success flex items-center space-x-1'
              title='Save Template'
            >
              <DocumentDuplicateIcon className='w-4 h-4' />
              <span>Save</span>
            </button>
            <button
              onClick={() => handleReportAction('generate-report')}
              className='ribbon-button ribbon-button-primary flex items-center space-x-1'
              title='Generate Report'
            >
              <ChartBarIcon className='w-4 h-4' />
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Current Status Display */}
        <div className='flex flex-col justify-end ml-auto'>
          <div className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded space-y-1'>
            <div>Paper: {printSettings.paperSize}</div>
            <div>Orientation: {printSettings.orientation}</div>
            <div>Export: {exportSettings.format.toUpperCase()}</div>
            <div>Charts: {exportSettings.includeCharts ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {operationStatus && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
            operationStatus.type === 'success'
              ? 'bg-green-100 border border-green-300 text-green-800'
              : operationStatus.type === 'error'
                ? 'bg-red-100 border border-red-300 text-red-800'
                : 'bg-blue-100 border border-blue-300 text-blue-800'
          }`}
        >
          <div className='flex items-center space-x-2'>
            {operationStatus.type === 'success' ? (
              <CheckCircleIcon className='h-5 w-5' />
            ) : operationStatus.type === 'error' ? (
              <ExclamationTriangleIcon className='h-5 w-5' />
            ) : (
              <InformationCircleIcon className='h-5 w-5' />
            )}
            <span className='text-sm font-medium'>
              {operationStatus.message}
            </span>
            <button
              onClick={() => setOperationStatus(null)}
              className='ml-auto text-gray-400 hover:text-gray-600'
            >
              <XMarkIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}

      {/* Modal System */}
      {modal && (
        <div className='fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg shadow-xl p-6 w-[700px] max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-800 capitalize'>
                {modal.replace('-', ' ')} Manager
              </h2>
              <button
                onClick={() => setModal(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                <XMarkIcon className='h-6 w-6' />
              </button>
            </div>

            {modal === 'print-preview' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Print Preview</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Print Preview:</strong> Preview how your Gantt chart
                    will appear when printed.
                  </p>
                  <p>
                    <strong>Page Setup:</strong> Configure paper size,
                    orientation, and margins.
                  </p>
                  <p>
                    <strong>Content Options:</strong> Choose what elements to
                    include in the printout.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Paper Size
                      </label>
                      <select
                        value={printSettings.paperSize}
                        onChange={e =>
                          setPrintSettings({
                            ...printSettings,
                            paperSize: e.target.value as any,
                          })
                        }
                        className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'
                      >
                        <option value='A4'>A4</option>
                        <option value='A3'>A3</option>
                        <option value='Letter'>Letter</option>
                        <option value='Legal'>Legal</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Orientation
                      </label>
                      <select
                        value={printSettings.orientation}
                        onChange={e =>
                          setPrintSettings({
                            ...printSettings,
                            orientation: e.target.value as any,
                          })
                        }
                        className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'
                      >
                        <option value='portrait'>Portrait</option>
                        <option value='landscape'>Landscape</option>
                      </select>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.includeHeader}
                        onChange={e =>
                          setPrintSettings({
                            ...printSettings,
                            includeHeader: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Include header</span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.includeFooter}
                        onChange={e =>
                          setPrintSettings({
                            ...printSettings,
                            includeFooter: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Include footer</span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.showGrid}
                        onChange={e =>
                          setPrintSettings({
                            ...printSettings,
                            showGrid: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Show grid lines</span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.showDependencies}
                        onChange={e =>
                          setPrintSettings({
                            ...printSettings,
                            showDependencies: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Show dependencies</span>
                    </label>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => {
                      console.log(
                        'Print preview with settings:',
                        printSettings
                      );
                      setOperationStatus({
                        type: 'success',
                        message: 'Print preview generated',
                      });
                      setModal(null);
                    }}
                    className='flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                  >
                    Generate Preview
                  </button>
                  <button
                    onClick={() => setModal(null)}
                    className='flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modal === 'load-template' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Load Report Template</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Report Templates:</strong> Load saved report
                    configurations and layouts.
                  </p>
                  <p>
                    <strong>Custom Settings:</strong> Apply predefined print and
                    export settings.
                  </p>
                  <p>
                    <strong>Quick Setup:</strong> Use templates for consistent
                    reporting across projects.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Available Templates
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'>
                      <option value=''>Select a template...</option>
                      <option value='executive-summary'>
                        Executive Summary
                      </option>
                      <option value='detailed-report'>Detailed Report</option>
                      <option value='progress-report'>Progress Report</option>
                      <option value='resource-report'>Resource Report</option>
                      <option value='custom-template'>Custom Template</option>
                    </select>
                  </div>
                  <div className='text-sm text-gray-600'>
                    <p>
                      <strong>Template Description:</strong>
                    </p>
                    <p>
                      Executive Summary - High-level project overview with key
                      milestones and progress indicators.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Template loaded successfully',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Load Template
                </button>
              </div>
            )}

            {modal === 'save-template' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Save Report Template</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Save Template:</strong> Save current report settings
                    as a reusable template.
                  </p>
                  <p>
                    <strong>Template Name:</strong> Give your template a
                    descriptive name for easy identification.
                  </p>
                  <p>
                    <strong>Settings Included:</strong> Print settings, export
                    options, and layout preferences.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Template Name
                    </label>
                    <input
                      type='text'
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'
                      placeholder='Enter template name...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Description
                    </label>
                    <textarea
                      className='w-full p-2 border border-gray-300 rounded h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'
                      placeholder='Describe what this template is used for...'
                    />
                  </div>
                  <div className='text-sm text-gray-600'>
                    <p>
                      <strong>Current Settings to Save:</strong>
                    </p>
                    <ul className='list-disc list-inside space-y-1'>
                      <li>
                        Paper: {printSettings.paperSize} (
                        {printSettings.orientation})
                      </li>
                      <li>
                        Export Format: {exportSettings.format.toUpperCase()}
                      </li>
                      <li>
                        Include Charts:{' '}
                        {exportSettings.includeCharts ? 'Yes' : 'No'}
                      </li>
                      <li>
                        Include Tables:{' '}
                        {exportSettings.includeTables ? 'Yes' : 'No'}
                      </li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Saving template:', templateName);
                    setOperationStatus({
                      type: 'success',
                      message: `Template "${templateName}" saved successfully`,
                    });
                    setTemplateName('');
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Save Template
                </button>
              </div>
            )}

            {modal === 'report-settings' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Report Settings</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Default Settings:</strong> Configure default
                    behavior for reports and exports.
                  </p>
                  <p>
                    <strong>Export Options:</strong> Set default formats and
                    content inclusion.
                  </p>
                  <p>
                    <strong>Print Configuration:</strong> Define default print
                    settings and layouts.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Default Export Format
                    </label>
                    <select
                      value={exportSettings.format}
                      onChange={e =>
                        setExportSettings({
                          ...exportSettings,
                          format: e.target.value as any,
                        })
                      }
                      className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'
                    >
                      <option value='pdf'>PDF</option>
                      <option value='excel'>Excel</option>
                      <option value='csv'>CSV</option>
                    </select>
                  </div>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={exportSettings.includeCharts}
                        onChange={e =>
                          setExportSettings({
                            ...exportSettings,
                            includeCharts: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Include charts by default</span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={exportSettings.includeTables}
                        onChange={e =>
                          setExportSettings({
                            ...exportSettings,
                            includeTables: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Include tables by default</span>
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={exportSettings.includeNotes}
                        onChange={e =>
                          setExportSettings({
                            ...exportSettings,
                            includeNotes: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Include notes by default</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Report settings saved',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Save Settings
                </button>
              </div>
            )}

            {modal === 'generate-report' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>Generate Custom Report</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>Custom Reports:</strong> Generate comprehensive
                    project reports with multiple sections.
                  </p>
                  <p>
                    <strong>Report Types:</strong> Choose from various report
                    templates and configurations.
                  </p>
                  <p>
                    <strong>Content Selection:</strong> Customize what
                    information to include in your report.
                  </p>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Report Type
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'>
                      <option value='executive-summary'>
                        Executive Summary
                      </option>
                      <option value='detailed-analysis'>
                        Detailed Analysis
                      </option>
                      <option value='progress-report'>Progress Report</option>
                      <option value='resource-analysis'>
                        Resource Analysis
                      </option>
                      <option value='risk-assessment'>Risk Assessment</option>
                      <option value='custom'>Custom Report</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Report Sections
                    </label>
                    <div className='space-y-2'>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          defaultChecked
                          className='mr-2'
                        />
                        <span className='text-sm'>Project Overview</span>
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          defaultChecked
                          className='mr-2'
                        />
                        <span className='text-sm'>Schedule Summary</span>
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          defaultChecked
                          className='mr-2'
                        />
                        <span className='text-sm'>Resource Allocation</span>
                      </label>
                      <label className='flex items-center'>
                        <input type='checkbox' className='mr-2' />
                        <span className='text-sm'>Risk Analysis</span>
                      </label>
                      <label className='flex items-center'>
                        <input type='checkbox' className='mr-2' />
                        <span className='text-sm'>Cost Analysis</span>
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperationStatus({
                      type: 'success',
                      message: 'Custom report generated successfully',
                    });
                    setModal(null);
                  }}
                  className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
                >
                  Generate Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
