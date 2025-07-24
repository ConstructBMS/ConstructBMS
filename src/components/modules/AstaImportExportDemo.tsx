import React, { useState } from 'react';
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { astaImportExportService } from '../../services/astaImportExportService';
import { downloadDemoFiles } from '../../scripts/astaDemoData';
import AstaImportModal from './ribbonTabs/AstaImportModal';
import AstaExportModal from './ribbonTabs/AstaExportModal';
import type { ParsedAstaProgramme, AstaExportSettings } from '../../services/astaImportExportService';

const AstaImportExportDemo: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [exportResult, setExportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImportAsta = () => {
    setIsImportModalOpen(true);
  };

  const handleImportAstaData = async (parsedData: ParsedAstaProgramme) => {
    try {
      const result = await astaImportExportService.importAstaData(parsedData, 'demo');
      
      if (result.success) {
        setImportResult(result.data);
        setError(null);
        console.log('Asta data imported successfully:', result.data);
      } else {
        setError(result.errors.join(', '));
        console.error('Import failed:', result.errors);
      }
    } catch (error) {
      setError('Failed to import Asta data');
      console.error('Import error:', error);
    }
  };

  const handleExportAsta = () => {
    setIsExportModalOpen(true);
  };

  const handleExportAstaData = async (settings: AstaExportSettings) => {
    try {
      const result = await astaImportExportService.exportToAsta(settings, 'demo');
      
      if (result.success) {
        setExportResult(result);
        setError(null);
        console.log('Programme exported successfully:', result.fileName);
      } else {
        setError(result.errors.join(', '));
        console.error('Export failed:', result.errors);
      }
    } catch (error) {
      setError('Failed to export to Asta');
      console.error('Export error:', error);
    }
  };

  const handleDownloadDemoFiles = () => {
    downloadDemoFiles();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Asta PowerProject Import/Export Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the Asta PowerProject import and export functionality with demo data.
        </p>
      </div>

      {/* Demo Files Section */}
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Demo Files
        </h2>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          Download sample Asta files to test the import functionality:
        </p>
        <button
          onClick={handleDownloadDemoFiles}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download Demo Files (CSV, JSON, MPX)
        </button>
      </div>

      {/* Demo Mode Restrictions */}
      <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h2 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
          Demo Mode Restrictions
        </h2>
        <ul className="text-yellow-700 dark:text-yellow-300 space-y-2">
          <li className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5" />
            <span>Import limited to 10 tasks maximum</span>
          </li>
          <li className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5" />
            <span>Export limited to 3 files per session</span>
          </li>
          <li className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5" />
            <span>Date range limited to 7 days for exports</span>
          </li>
          <li className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5" />
            <span>All imported tasks are tagged with demo flag</span>
          </li>
        </ul>
      </div>

      {/* Import/Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Import from Asta
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Import Asta PowerProject files (CSV, JSON, MPX) into ConstructBMS.
          </p>
          <button
            onClick={handleImportAsta}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Import from Asta</span>
          </button>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Export to Asta
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Export ConstructBMS programme to Asta-compatible formats.
          </p>
          <button
            onClick={handleExportAsta}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export to Asta</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {(importResult || exportResult || error) && (
        <div className="space-y-4">
          {importResult && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">Import Successful</h3>
              </div>
              <p className="text-green-700 dark:text-green-300">
                Imported {importResult.tasksImported} tasks. Total tasks: {importResult.totalTasks}
                {importResult.demo && ' (Demo mode)'}
              </p>
            </div>
          )}

          {exportResult && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">Export Successful</h3>
              </div>
              <p className="text-green-700 dark:text-green-300">
                Exported to {exportResult.fileName} ({exportResult.fileSize} bytes)
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
              </div>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Features List */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Asta Import/Export Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Import Features</h3>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
              <li>• Support for CSV, JSON, and MPX formats</li>
              <li>• Field mapping and validation</li>
              <li>• Preview imported data before confirmation</li>
              <li>• Demo mode restrictions (10 tasks max)</li>
              <li>• Visual tagging of imported tasks</li>
              <li>• Audit trail logging</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Export Features</h3>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
              <li>• Export to XER, MPX, CSV, and JSON formats</li>
              <li>• Date range filtering</li>
              <li>• Include/exclude options (constraints, baselines, etc.)</li>
              <li>• Demo mode restrictions (3 exports max)</li>
              <li>• Automatic file naming and download</li>
              <li>• Audit trail logging</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AstaImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportAstaData}
        projectId="demo"
      />

      <AstaExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportAstaData}
        projectName="Demo Project"
        projectId="demo"
      />
    </div>
  );
};

export default AstaImportExportDemo; 