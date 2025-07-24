import React, { useState, useEffect } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';
import { timelinePrintService, TimelinePrintOptions } from '../../services/timelinePrintService';
import TimelinePrintOptionsModal from './TimelinePrintOptionsModal';
import TimelinePrintPreviewModal from './TimelinePrintPreviewModal';

interface TimelinePrintViewProps {
  className?: string;
  currentView: any;
  filters: any;
  isMultiProjectMode?: boolean;
  onPrintComplete?: (metadata: any) => void;
  projectId: string;
  projectIdDisplay: string;
  projectName: string;
  selectedProjects?: any[];
  tasks: any[];
  variant?: 'button' | 'dropdown' | 'inline';
}

const TimelinePrintView: React.FC<TimelinePrintViewProps> = ({
  projectId,
  projectName,
  projectIdDisplay,
  tasks,
  filters,
  currentView,
  isMultiProjectMode = false,
  selectedProjects = [],
  className = '',
  variant = 'button',
  onPrintComplete
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<TimelinePrintOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const canPrint = canAccess('programme.export');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  const handlePrintClick = () => {
    if (!canPrint) {
      console.warn('User does not have permission to print');
      return;
    }
    setShowOptionsModal(true);
  };

  const handleOptionsClose = () => {
    setShowOptionsModal(false);
  };

  const handleOptionsPrint = async (options: TimelinePrintOptions) => {
    try {
      setLoading(true);
      setCurrentOptions(options);
      setShowOptionsModal(false);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error preparing print:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionsPreview = (options: TimelinePrintOptions) => {
    setCurrentOptions(options);
    setShowOptionsModal(false);
    setShowPreviewModal(true);
  };

  const handlePreviewClose = () => {
    setShowPreviewModal(false);
    setCurrentOptions(null);
  };

  const handlePreviewBack = () => {
    setShowPreviewModal(false);
    setShowOptionsModal(true);
  };

  const handlePreviewPrint = async (options: TimelinePrintOptions) => {
    try {
      setLoading(true);
      
      const printData = {
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

      const result = await timelinePrintService.openPrintDialog(options, printData);
      
      if (result.success) {
        setShowPreviewModal(false);
        setCurrentOptions(null);
        
        // Call completion callback
        if (onPrintComplete && result.printMetadata) {
          onPrintComplete(result.printMetadata);
        }
      } else {
        console.error('Print failed:', result.error);
      }
    } catch (error) {
      console.error('Error printing:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render different variants
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handlePrintClick}
          disabled={!canPrint || loading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          title="Print Timeline"
        >
          <PrinterIcon className="w-4 h-4 mr-2" />
          Print Timeline
        </button>

        {/* Modals */}
        <TimelinePrintOptionsModal
          isOpen={showOptionsModal}
          onClose={handleOptionsClose}
          onPrint={handleOptionsPrint}
          onPreview={handleOptionsPreview}
          projectId={projectId}
          projectName={projectName}
          projectIdDisplay={projectIdDisplay}
          tasks={tasks}
          filters={filters}
          currentView={currentView}
          isMultiProjectMode={isMultiProjectMode}
          selectedProjects={selectedProjects}
        />

        {currentOptions && (
          <TimelinePrintPreviewModal
            isOpen={showPreviewModal}
            onClose={handlePreviewClose}
            onPrint={handlePreviewPrint}
            onBack={handlePreviewBack}
            options={currentOptions}
            projectId={projectId}
            projectName={projectName}
            projectIdDisplay={projectIdDisplay}
            tasks={tasks}
            filters={filters}
            currentView={currentView}
            isDemoMode={isDemoMode}
          />
        )}
      </>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handlePrintClick}
          disabled={!canPrint || loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Print Timeline"
        >
          <PrinterIcon className="w-4 h-4 mr-2" />
          Print
        </button>

        {/* Modals */}
        <TimelinePrintOptionsModal
          isOpen={showOptionsModal}
          onClose={handleOptionsClose}
          onPrint={handleOptionsPrint}
          onPreview={handleOptionsPreview}
          projectId={projectId}
          projectName={projectName}
          projectIdDisplay={projectIdDisplay}
          tasks={tasks}
          filters={filters}
          currentView={currentView}
          isMultiProjectMode={isMultiProjectMode}
          selectedProjects={selectedProjects}
        />

        {currentOptions && (
          <TimelinePrintPreviewModal
            isOpen={showPreviewModal}
            onClose={handlePreviewClose}
            onPrint={handlePreviewPrint}
            onBack={handlePreviewBack}
            options={currentOptions}
            projectId={projectId}
            projectName={projectName}
            projectIdDisplay={projectIdDisplay}
            tasks={tasks}
            filters={filters}
            currentView={currentView}
            isDemoMode={isDemoMode}
          />
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <button
          onClick={handlePrintClick}
          disabled={!canPrint || loading}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded transition-colors bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Print Timeline"
        >
          <PrinterIcon className="w-3 h-3 mr-1" />
          Print
        </button>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <span className="text-xs text-yellow-600 font-medium">
            DEMO
          </span>
        )}

        {/* Modals */}
        <TimelinePrintOptionsModal
          isOpen={showOptionsModal}
          onClose={handleOptionsClose}
          onPrint={handleOptionsPrint}
          onPreview={handleOptionsPreview}
          projectId={projectId}
          projectName={projectName}
          projectIdDisplay={projectIdDisplay}
          tasks={tasks}
          filters={filters}
          currentView={currentView}
          isMultiProjectMode={isMultiProjectMode}
          selectedProjects={selectedProjects}
        />

        {currentOptions && (
          <TimelinePrintPreviewModal
            isOpen={showPreviewModal}
            onClose={handlePreviewClose}
            onPrint={handlePreviewPrint}
            onBack={handlePreviewBack}
            options={currentOptions}
            projectId={projectId}
            projectName={projectName}
            projectIdDisplay={projectIdDisplay}
            tasks={tasks}
            filters={filters}
            currentView={currentView}
            isDemoMode={isDemoMode}
          />
        )}
      </div>
    );
  }

  return null;
};

export default TimelinePrintView; 