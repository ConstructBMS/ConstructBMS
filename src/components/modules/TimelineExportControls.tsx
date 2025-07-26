import React, { useState, useEffect } from 'react';
import {
  DocumentArrowDownIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import {
  timelineExportService,
  type TimelineExportOptions,
} from '../services/timelineExportService';
import { toastService } from './ToastNotification';
import TimelineExportModal from './TimelineExportModal';

interface TimelineExportControlsProps {
  className?: string;
  currentDateRange?: {
    end: Date;
    start: Date;
  };
  currentFilters?: {
    assignee?: string[];
    priority?: string[];
    status?: string[];
    tags?: string[];
  };
  currentZoomLevel?: 'days' | 'weeks' | 'months' | 'quarters';
  ganttElementRef: React.RefObject<HTMLElement>;
  isMultiProjectMode?: boolean;
  projectId: string;
  projectName: string;
  selectedProjects?: string[];
}

const TimelineExportControls: React.FC<TimelineExportControlsProps> = ({
  projectId,
  projectName,
  ganttElementRef,
  currentFilters,
  currentZoomLevel = 'weeks',
  currentDateRange,
  isMultiProjectMode = false,
  selectedProjects = [],
  className = '',
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png'>('pdf');

  const canExport = canAccess('programme.export');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Handle quick export
  const handleQuickExport = async (format: 'pdf' | 'png') => {
    if (!ganttElementRef.current) {
      toastService.error('Error', 'Timeline element not found');
      return;
    }

    try {
      setIsExporting(true);
      setExportFormat(format);

      // Create default options
      const options: TimelineExportOptions = {
        format,
        orientation: 'landscape',
        pageSize: 'A4',
        includeLogo: true,
        showFiltersAndDate: true,
        includeBaseline: false,
        includeCriticalPath: false,
        includeMilestones: true,
        includeDependencies: true,
        zoomLevel: currentZoomLevel,
        dateRange: currentDateRange,
        filters: currentFilters,
        multiProject: isMultiProjectMode
          ? {
              enabled: true,
              selectedProjects,
              groupByProject: true,
            }
          : undefined,
      };

      // Check demo mode restrictions
      if (!timelineExportService.canExportInDemoMode(options)) {
        toastService.warning(
          'Demo Mode',
          'Export not allowed with current options in demo mode'
        );
        return;
      }

      // Get export data
      const exportData = await timelineExportService.getTimelineExportData(
        projectId,
        options
      );

      // Perform export
      let result;
      if (format === 'pdf') {
        result = await timelineExportService.exportAsPDF(
          ganttElementRef.current,
          options,
          exportData
        );
      } else {
        result = await timelineExportService.exportAsPNG(
          ganttElementRef.current,
          options,
          exportData
        );
      }

      if (result.success) {
        toastService.success(
          'Success',
          `${format.toUpperCase()} export completed successfully`
        );
      } else {
        toastService.error(
          'Error',
          result.error || `Failed to export as ${format.toUpperCase()}`
        );
      }
    } catch (error) {
      console.error('Error during timeline export:', error);
      toastService.error('Error', 'Failed to export timeline');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle open options modal
  const handleOpenOptions = () => {
    setShowOptionsModal(true);
  };

  // Handle close options modal
  const handleCloseOptions = () => {
    setShowOptionsModal(false);
  };

  // Handle export from modal
  const handleExportFromModal = async (
    format: 'pdf' | 'png',
    options: TimelineExportOptions
  ) => {
    if (!ganttElementRef.current) {
      toastService.error('Error', 'Timeline element not found');
      return;
    }

    try {
      setIsExporting(true);
      setExportFormat(format);

      // Get export data
      const exportData = await timelineExportService.getTimelineExportData(
        projectId,
        options
      );

      // Perform export
      let result;
      if (format === 'pdf') {
        result = await timelineExportService.exportAsPDF(
          ganttElementRef.current,
          options,
          exportData
        );
      } else {
        result = await timelineExportService.exportAsPNG(
          ganttElementRef.current,
          options,
          exportData
        );
      }

      if (result.success) {
        toastService.success(
          'Success',
          `${format.toUpperCase()} export completed successfully`
        );
        setShowOptionsModal(false);
      } else {
        toastService.error(
          'Error',
          result.error || `Failed to export as ${format.toUpperCase()}`
        );
      }
    } catch (error) {
      console.error('Error during timeline export:', error);
      toastService.error('Error', 'Failed to export timeline');
    } finally {
      setIsExporting(false);
    }
  };

  if (!canExport) {
    return null;
  }

  // Get demo mode restrictions
  const demoRestrictions = timelineExportService.getDemoModeRestrictions();

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Quick Export PNG */}
        <button
          onClick={() => handleQuickExport('png')}
          disabled={isExporting || isDemoMode}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200
            ${
              isDemoMode
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
            }
          `}
          title={
            isDemoMode
              ? 'PNG export disabled in demo mode'
              : 'Quick export as PNG'
          }
        >
          <PhotoIcon className='w-4 h-4' />
          <span className='text-sm font-medium'>Export PNG</span>
          {isDemoMode && (
            <ExclamationTriangleIcon className='w-3 h-3 text-orange-500' />
          )}
          {isExporting && exportFormat === 'png' && (
            <div className='w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
          )}
        </button>

        {/* Quick Export PDF */}
        <button
          onClick={() => handleQuickExport('pdf')}
          disabled={isExporting}
          className='flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200'
          title='Quick export as PDF'
        >
          <DocumentArrowDownIcon className='w-4 h-4' />
          <span className='text-sm font-medium'>Export PDF</span>
          {isExporting && exportFormat === 'pdf' && (
            <div className='w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
          )}
        </button>

        {/* Export Options */}
        <button
          onClick={handleOpenOptions}
          disabled={isExporting}
          className='flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'
          title='Configure export options'
        >
          <Cog6ToothIcon className='w-4 h-4' />
          <span className='text-sm font-medium'>Options</span>
        </button>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className='flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-300'>
            <ExclamationTriangleIcon className='w-3 h-3 mr-1' />
            Demo Mode
          </div>
        )}
      </div>

      {/* Export Options Modal */}
      {showOptionsModal && (
        <TimelineExportModal
          isOpen={showOptionsModal}
          onClose={handleCloseOptions}
          projectId={projectId}
          projectName={projectName}
          currentFilters={currentFilters}
          currentZoomLevel={currentZoomLevel}
          currentDateRange={currentDateRange}
          isMultiProjectMode={isMultiProjectMode}
          selectedProjects={selectedProjects}
          onExport={handleExportFromModal}
          isExporting={isExporting}
        />
      )}
    </>
  );
};

export default TimelineExportControls;
