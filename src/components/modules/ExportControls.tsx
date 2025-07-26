import React, { useState } from 'react';
import {
  DocumentArrowDownIcon,
  PhotoIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import ExportOptionsModal from './ExportOptionsModal';

interface ExportControlsProps {
  onExport: (format: 'pdf' | 'png', options: any) => void;
  projectId: string;
  projectName: string;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  projectId,
  projectName,
  onExport,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const canExport = canAccess('programme.export');
  const canManageSettings = canAccess('programme.export.settings');

  // Check demo mode on mount
  React.useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  const handleQuickExport = async (format: 'pdf' | 'png') => {
    try {
      // Use default options for quick export
      const defaultOptions = {
        dateRange: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        zoomLevel: 'weeks' as const,
        columnsToInclude: [
          'name',
          'status',
          'startDate',
          'endDate',
          'progress',
        ],
        showLegend: true,
        showLogoHeader: true,
        includeBaseline: false,
        includeCriticalPath: false,
        pageSize: 'A4' as const,
        orientation: 'landscape' as const,
      };

      onExport(format, defaultOptions);
    } catch (error) {
      console.error('Error during quick export:', error);
    }
  };

  const handleOpenOptions = () => {
    setShowOptionsModal(true);
  };

  const handleCloseOptions = () => {
    setShowOptionsModal(false);
  };

  if (!canExport) {
    return null;
  }

  return (
    <>
      <div className='flex items-center space-x-2'>
        {/* Quick Export PNG */}
        <button
          onClick={() => handleQuickExport('png')}
          className='flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200'
          title='Quick export as PNG'
        >
          <PhotoIcon className='w-4 h-4' />
          <span className='text-sm font-medium'>Export PNG</span>
        </button>

        {/* Quick Export PDF */}
        <button
          onClick={() => handleQuickExport('pdf')}
          className='flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200'
          title='Quick export as PDF'
        >
          <DocumentArrowDownIcon className='w-4 h-4' />
          <span className='text-sm font-medium'>Export PDF</span>
        </button>

        {/* Export Options */}
        <button
          onClick={handleOpenOptions}
          className='flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'
          title='Configure export options'
        >
          <Cog6ToothIcon className='w-4 h-4' />
          <span className='text-sm font-medium'>Options</span>
        </button>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className='px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded font-medium'>
            DEMO
          </div>
        )}
      </div>

      {/* Export Options Modal */}
      {showOptionsModal && (
        <ExportOptionsModal
          isOpen={showOptionsModal}
          onClose={handleCloseOptions}
          projectId={projectId}
          projectName={projectName}
          onExport={onExport}
        />
      )}
    </>
  );
};

export default ExportControls;
