import React from 'react';
import { 
  PrinterIcon, 
  DocumentArrowDownIcon, 
  PhotoIcon, 
  TableCellsIcon, 
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  CogIcon,
  FolderIcon,
  ShareIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export const TabReporting: React.FC = () => {
  const { canAccess } = usePermissions();

  const can = (key: string) => canAccess(`gantt.report.${key}`);

  return (
    <div className="flex flex-wrap space-x-4 p-2 text-sm">
      {/* Print & Export */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('print') && (
            <button
              onClick={() => window.print()}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Print Gantt Chart"
            >
              <PrinterIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Print</span>
            </button>
          )}
          {can('export-pdf') && (
            <button
              onClick={() => alert('Export Gantt chart as PDF')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Export as PDF"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Export PDF</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Print & Export</div>
      </div>

      {/* Image Export */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('export-image') && (
            <button
              onClick={() => alert('Export Gantt chart as PNG image')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Export as PNG"
            >
              <PhotoIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Export PNG</span>
            </button>
          )}
          {can('export-jpeg') && (
            <button
              onClick={() => alert('Export Gantt chart as JPEG image')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Export as JPEG"
            >
              <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Export JPEG</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Image Export</div>
      </div>

      {/* Data Export */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('export-excel') && (
            <button
              onClick={() => alert('Export project data as Excel spreadsheet')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Export to Excel"
            >
              <TableCellsIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Export Excel</span>
            </button>
          )}
          {can('export-csv') && (
            <button
              onClick={() => alert('Export project data as CSV file')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Export as CSV"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Export CSV</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Data Export</div>
      </div>

      {/* Templates */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('save-template') && (
            <button
              onClick={() => alert('Save current layout as template')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Save Template"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Save Template</span>
            </button>
          )}
          {can('load-template') && (
            <button
              onClick={() => alert('Load saved template')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Load Template"
            >
              <FolderIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Load Template</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Templates</div>
      </div>

      {/* Advanced Reporting */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('report-builder') && (
            <button
              onClick={() => alert('Open report builder')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Report Builder"
            >
              <DocumentChartBarIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Report Builder</span>
            </button>
          )}
          {can('schedule-report') && (
            <button
              onClick={() => alert('Schedule automated reports')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Schedule Reports"
            >
              <CogIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Schedule</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Advanced</div>
      </div>

      {/* Sharing */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('share-report') && (
            <button
              onClick={() => alert('Share report via email or link')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Share Report"
            >
              <ShareIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Share</span>
            </button>
          )}
          {can('publish-report') && (
            <button
              onClick={() => alert('Publish report to web portal')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Publish Report"
            >
              <ChartBarIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Publish</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Sharing</div>
      </div>
    </div>
  );
}; 