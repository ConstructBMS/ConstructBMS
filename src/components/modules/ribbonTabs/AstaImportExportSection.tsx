import React, { useState } from 'react';
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { demoModeService } from '../../../services/demoModeService';
import { astaImportExportService } from '../../../services/astaImportExportService';
import AstaImportModal from './AstaImportModal';
import AstaExportModal from './AstaExportModal';
import type { ParsedAstaProgramme, AstaExportSettings } from '../../../services/astaImportExportService';

interface AstaImportExportSectionProps {
  projectId?: string;
  projectName?: string;
  onTaskOperation?: (operation: any) => void;
}

const AstaImportExportSection: React.FC<AstaImportExportSectionProps> = ({
  projectId = 'demo',
  projectName = 'Project',
  onTaskOperation
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [importExportHistory, setImportExportHistory] = useState<{
    imports: any[];
    exports: any[];
  }>({ imports: [], exports: [] });
  const [loading, setLoading] = useState({
    import: false,
    export: false
  });
  const { canAccess } = usePermissions();

  const canImport = canAccess('programme.import.asta');
  const canExport = canAccess('programme.export.asta');

  // Check demo mode on mount
  React.useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
    loadImportExportHistory();
  }, []);

  const loadImportExportHistory = async () => {
    try {
      const history = await astaImportExportService.getImportExportHistory(projectId);
      setImportExportHistory(history);
    } catch (error) {
      console.error('Failed to load import/export history:', error);
    }
  };

  const handleImportAsta = () => {
    setIsImportModalOpen(true);
  };

  const handleImportAstaData = async (parsedData: ParsedAstaProgramme) => {
    setLoading(prev => ({ ...prev, import: true }));
    try {
      const result = await astaImportExportService.importAstaData(parsedData, projectId);
      
      if (result.success && result.data) {
        console.log('Asta data imported:', result.data.tasksImported, 'tasks');
        
        // Refresh import/export history
        await loadImportExportHistory();
        
        // Dispatch operation
        if (onTaskOperation) {
          onTaskOperation({ 
            type: 'add', 
            data: { 
              action: 'import_asta_data', 
              tasksImported: result.data.tasksImported 
            } 
          });
        }
      } else {
        console.error('Import failed:', result.errors);
      }
    } catch (error) {
      console.error('Failed to import Asta data:', error);
    } finally {
      setLoading(prev => ({ ...prev, import: false }));
    }
  };

  const handleExportAsta = () => {
    setIsExportModalOpen(true);
  };

  const handleExportAstaData = async (settings: AstaExportSettings) => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      const result = await astaImportExportService.exportToAsta(settings, projectId);
      
      if (result.success) {
        console.log('Programme exported to Asta:', result.fileName);
        
        // Refresh import/export history
        await loadImportExportHistory();
        
        // Dispatch operation
        if (onTaskOperation) {
          onTaskOperation({ 
            type: 'add', 
            data: { 
              action: 'export_asta_data', 
              fileName: result.fileName 
            } 
          });
        }
      } else {
        console.error('Export failed:', result.errors);
      }
    } catch (error) {
      console.error('Failed to export to Asta:', error);
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const getLastImportInfo = () => {
    const lastImport = importExportHistory.imports[0];
    if (!lastImport) return null;
    
    return {
      date: new Date(lastImport.timestamp).toLocaleDateString(),
      taskCount: lastImport.taskCount,
      projectName: lastImport.projectName
    };
  };

  const getLastExportInfo = () => {
    const lastExport = importExportHistory.exports[0];
    if (!lastExport) return null;
    
    return {
      date: new Date(lastExport.timestamp).toLocaleDateString(),
      fileName: lastExport.fileName,
      format: lastExport.format
    };
  };

  const lastImport = getLastImportInfo();
  const lastExport = getLastExportInfo();

  return (
    <>
      <section className="ribbon-section w-80">
        <div className="ribbon-section-header">
          <DocumentTextIcon className="w-4 h-4" />
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Asta Import/Export
          </h3>
        </div>
        
        <div className="ribbon-buttons space-y-2">
          {/* Import Button */}
          <button
            onClick={handleImportAsta}
            disabled={!canImport || isDemoMode}
            className={`
              flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded transition-colors
              ${canImport && !isDemoMode
                ? 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/40'
                : 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
              }
            `}
            title={isDemoMode ? "Demo mode – Asta sync unavailable" : "Import from Asta PowerProject"}
          >
            <div className="flex items-center space-x-2">
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Import from Asta</span>
            </div>
            {loading.import && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportAsta}
            disabled={!canExport}
            className={`
              flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded transition-colors
              ${canExport
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/40'
                : 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
              }
            `}
            title="Export to Asta PowerProject"
          >
            <div className="flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export to Asta</span>
            </div>
            {loading.export && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            )}
          </button>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
            <div className="flex items-center space-x-1">
              <InformationCircleIcon className="w-3 h-3 text-yellow-500" />
              <span className="text-yellow-700 dark:text-yellow-300">
                Demo mode – Asta sync unavailable
              </span>
            </div>
          </div>
        )}

        {/* Last Activity */}
        {(lastImport || lastExport) && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
            <div className="space-y-1">
              {lastImport && (
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Last import: {lastImport.taskCount} tasks from {lastImport.projectName} ({lastImport.date})
                  </span>
                </div>
              )}
              {lastExport && (
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Last export: {lastExport.fileName} ({lastExport.date})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Import Modal */}
      <AstaImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportAstaData}
        projectId={projectId}
      />

      {/* Export Modal */}
      <AstaExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportAstaData}
        projectName={projectName}
        projectId={projectId}
      />
    </>
  );
};

export default AstaImportExportSection; 